import { GoogleGenAI, Chat } from "@google/genai";
import type { Settings } from '../hooks/useSettings';


// Helper to get settings from local storage
const getSettings = (): Partial<Settings> => {
  try {
    const storedSettings = localStorage.getItem('aci-settings');
    return storedSettings ? JSON.parse(storedSettings) : {};
  } catch (e) {
    console.error("Could not parse settings from localStorage", e);
    return {};
  }
};

const getAiClient = (): GoogleGenAI => {
  const settings = getSettings();
  // Prioriza a chave nas configurações locais (definida no Admin), fallback para env var de forma segura
  const envApiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
  const apiKey = settings.geminiApiKey ? settings.geminiApiKey.trim() : (envApiKey ? envApiKey.trim() : undefined);

  if (!apiKey || !apiKey.startsWith("AIza")) {
    throw new Error("Chave de API do Gemini inválida ou ausente. A chave deve começar com 'AIza'. Verifique o Painel Administrativo.");
  }

  return new GoogleGenAI({ apiKey });
};

function parseJsonFromGeminiResponse<T>(text: string): T {
  let jsonStr = text.trim();
  // Handle markdown code fences
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    const parsedData = JSON.parse(jsonStr);
    return parsedData as T;
  } catch (error) {
    console.error("Failed to parse JSON string:", jsonStr);
    throw new Error("A API retornou um formato JSON inválido.");
  }
}


export interface Product {
  title: string;
  price: string;
  image_url: string;
  product_url: string;
  error?: string;
}

export const generateShopeeLinkFromApi = async (productUrl: string, affiliateId: string, subIds: string[]): Promise<string> => {
  const filteredSubIds = subIds.filter(id => id.trim() !== '');

  const prompt = `
    Gere um link de afiliado da Shopee Brasil com base nas informações abaixo.

    URL do Produto: "${productUrl}"
    ID do Afiliado: "${affiliateId}"
    ${filteredSubIds.length > 0 ? `Sub_IDs de Rastreamento: ${JSON.stringify(filteredSubIds)}` : ''}

    Instruções:
    1. Analise a URL do produto para extrair as informações necessárias.
    2. Construa o link de afiliado usando o formato de URL longa da Shopee.
    3. Se o ID do Afiliado for fornecido, adicione-o ao link com o parâmetro \`af_id\`. Se estiver vazio, gere o link sem ele.
    4. Se Sub_IDs de rastreamento forem fornecidos, adicione-os ao link usando os parâmetros \`af_sub1\`, \`af_sub2\`, etc., na ordem em que aparecem. Ignore os que estiverem vazios.
    5. A resposta DEVE CONTER APENAS a URL final, sem nenhum texto, explicação, ou formatação de markdown. Retorne apenas a string da URL.
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.2;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente de IA especialista em gerar links de afiliados para a plataforma Shopee Brasil, incluindo Sub_IDs para rastreamento.",
        temperature: temperature,
        topP: 1,
        topK: 32,
      }
    });

    // Trim to remove any potential whitespace or newlines from the model's output
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for link generation:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar link: ${errorMessage}`);
  }
};


export const searchShopeeProductsFromApi = async (keyword: string): Promise<Product[]> => {
  const prompt = `
    Você é um especialista em buscar produtos na Shopee Brasil.
    Sua tarefa é encontrar produtos relevantes para a palavra-chave fornecida e retornar uma lista em formato JSON.

    Palavra-chave: "${keyword}"

    Instruções:
    1. Busque por produtos na Shopee Brasil que correspondam à palavra-chave.
    2. Retorne uma lista de até 20 produtos.
    3. A resposta DEVE ser um array de objetos JSON.
    4. Cada objeto no array deve ter EXATAMENTE os seguintes campos: \`title\`, \`price\`, \`image_url\`, e \`product_url\`.
    5. O campo \`price\` deve ser uma string formatada como "R$ XX,XX".
    6. O campo \`image_url\` deve ser um link direto para a imagem do produto.
    7. O campo \`product_url\` deve ser a URL completa da página do produto na Shopee.
    8. NÃO inclua nenhum texto, explicação ou formatação de markdown. A resposta deve ser apenas o array JSON.

    Exemplo de formato de saída:
    [
      {
        "title": "Nome do Produto Exemplo 1",
        "price": "R$ 99,90",
        "image_url": "https://url.da.imagem/exemplo1.jpg",
        "product_url": "https://shopee.com.br/url-do-produto-1"
      }
    ]
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.1;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: temperature,
      }
    });

    const parsedData = parseJsonFromGeminiResponse<Product[]>(response.text);

    if (!Array.isArray(parsedData)) {
      throw new Error("A API não retornou um array de produtos válido.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API for product search:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao buscar produtos: ${errorMessage}`);
  }
};

export const getTopSalesFromApi = async (category: string): Promise<Product[]> => {
  const prompt = `
    Você é um especialista em encontrar os produtos mais vendidos na Shopee Brasil.
    Sua tarefa é encontrar os produtos mais vendidos para a categoria fornecida e retornar uma lista em formato JSON.

    Categoria: "${category}"

    Instruções:
    1. Busque pelos produtos mais populares e com mais vendas na Shopee Brasil que correspondam à categoria.
    2. Retorne uma lista de até 20 produtos.
    3. A resposta DEVE ser um array de objetos JSON.
    4. Cada objeto no array deve ter EXATAMENTE os seguintes campos: \`title\`, \`price\`, \`image_url\`, e \`product_url\`.
    5. O campo \`price\` deve ser uma string formatada como "R$ XX,XX".
    6. O campo \`image_url\` deve ser um link direto para a imagem do produto.
    7. O campo \`product_url\` deve ser a URL completa da página do produto na Shopee.
    8. NÃO inclua nenhum texto, explicação ou formatação de markdown. A resposta deve ser apenas o array JSON.
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.1;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: temperature,
      }
    });

    const parsedData = parseJsonFromGeminiResponse<Product[]>(response.text);

    if (!Array.isArray(parsedData)) {
      throw new Error("A API não retornou um array de produtos válido.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API for top sales search:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao buscar top vendas: ${errorMessage}`);
  }
};

export const generateTelegramMessageFromApi = async (topic: string): Promise<string> => {
  const prompt = `
        Crie uma mensagem de marketing curta e persuasiva para um canal do Telegram sobre o seguinte tópico: "${topic}".
        A mensagem deve:
        - Ser cativante e gerar curiosidade.
        - Usar emojis de forma relevante e sem exagero.
        - Ter no máximo 3 parágrafos curtos.
        - Incluir uma chamada para ação (call to action) clara.
        - A resposta DEVE conter apenas o texto da mensagem, sem explicações ou markdown.
    `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.8;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: temperature,
        topP: 1,
        topK: 40,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for Telegram message:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar mensagem para Telegram: ${errorMessage}`);
  }
};

export const getShopeeProductDetailsFromUrl = async (productUrl: string): Promise<Product> => {
  const prompt = `
    Você é um assistente especialista em extrair informações de páginas de produtos da Shopee Brasil.
    Sua tarefa é analisar a URL de um produto e retornar seus detalhes em formato JSON.

    URL do Produto: "${productUrl}"

    Instruções:
    1. Analise o conteúdo da URL fornecida para extrair o título do produto, o preço atual e a URL da imagem principal.
    2. A resposta DEVE ser um único objeto JSON.
    3. O objeto deve ter EXATAMENTE os seguintes campos: \`title\`, \`price\`, \`image_url\`, e \`product_url\`.
    4. O campo \`price\` deve ser uma string formatada como "R$ XX,XX".
    5. O campo \`product_url\` deve ser a mesma URL de entrada.
    6. Se a URL for inválida ou não for de um produto da Shopee, retorne um objeto JSON com uma chave \`error\` e o valor "URL inválida ou não é um produto Shopee.".
    7. NÃO inclua nenhum texto, explicação ou formatação de markdown. A resposta deve ser apenas o objeto JSON.
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return parseJsonFromGeminiResponse<Product>(response.text);

  } catch (error) {
    console.error("Error calling Gemini API for product details:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao buscar detalhes do produto: ${errorMessage}`);
  }
};

export const generateShopeeOfferMessageFromApi = async (product: Product): Promise<string> => {
  const prompt = `
    Você é um copywriter de marketing digital especialista em criar ofertas irresistíveis para o Telegram.
    Sua tarefa é criar uma mensagem de marketing persuasiva para o produto da Shopee fornecido.

    Detalhes do Produto:
    - Título: "${product.title}"
    - Preço: "${product.price}"

    Instruções:
    1. Crie uma mensagem curta, cativante e com senso de urgência.
    2. Use emojis relevantes para destacar a oferta (ex: ✨, 💰, 🔥, 🚀).
    3. Destaque o nome do produto e o preço de forma clara.
    4. A mensagem deve ser otimizada para leitura rápida em dispositivos móveis, usando quebras de linha para boa formatação.
    5. NÃO inclua o link do produto na mensagem, pois ele será adicionado em um botão.
    6. A resposta DEVE ser apenas o texto da mensagem, sem saudações, explicações ou markdown.
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.8;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: temperature,
        topP: 1,
        topK: 40,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for Shopee offer:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar oferta Shopee: ${errorMessage}`);
  }
};

export const generateInstagramCaptionFromProduct = async (product: Product, toneOfVoice: string = 'persuasivo e amigável'): Promise<string> => {
  const prompt = `
    Você é um especialista em marketing digital para afiliados. Crie uma legenda para o Instagram para o produto '${product.title}'. Use uma linguagem '${toneOfVoice}' e inclua 3 hashtags relevantes. O link do produto (para contexto) é ${product.product_url} e o preço é ${product.price}.

    A legenda deve ser curta, usar emojis, e ter uma chamada para ação para o "link na bio".
    Importante: Não inclua a URL na legenda. Retorne apenas o texto da legenda final.
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.8;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: temperature,
        topP: 1,
        topK: 40,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for Instagram caption:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar legenda para Instagram: ${errorMessage}`);
  }
};

export interface InstagramCaptionDetails {
  name: string;
  price: string;
  description: string;
  toneOfVoice: string;
}

export const generateInstagramCaptionFromDetails = async (details: InstagramCaptionDetails): Promise<string> => {
  const prompt = `
    Você é um especialista em marketing digital para afiliados. Crie uma legenda para o Instagram para o produto '${details.name}'.
    - Preço (apenas para contexto, não inclua na legenda): ${details.price || 'Não informado'}
    - Descrição: ${details.description}

    Use uma linguagem '${details.toneOfVoice}'.
    A legenda deve:
    1. Ser curta e cativante.
    2. Usar emojis relevantes.
    3. Incluir 3 hashtags relevantes para o produto.
    4. Concluir com uma chamada para ação clara para o "link na bio".

    Importante: A resposta DEVE CONTER APENAS o texto da legenda final, sem explicações, saudações ou markdown.
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.8;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: temperature,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for Instagram caption from details:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar legenda para Instagram: ${errorMessage}`);
  }
};

export const suggestInstagramHashtags = async (productName: string, productDescription: string): Promise<string[]> => {
  const prompt = `
    Você é um especialista em mídias sociais e marketing digital.
    Analise o seguinte produto:
    - Nome: "${productName}"
    - Descrição: "${productDescription}"

    Sugira 3 hashtags para o Instagram que sejam populares e altamente relevantes para este produto.
    
    Instruções:
    1. As hashtags devem ajudar a aumentar o alcance e o engajamento.
    2. A resposta DEVE ser um array de strings JSON, contendo exatamente 3 hashtags, começando com '#'.
    3. O formato da resposta deve ser: ["#hashtag1", "#hashtag2", "#hashtag3"]
    4. Não inclua nenhuma explicação ou texto adicional, apenas o array JSON.
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.5;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: temperature,
      }
    });

    const parsedData = parseJsonFromGeminiResponse<string[]>(response.text);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      return parsedData;
    } else {
      throw new Error("A API não retornou um array de strings de hashtag válido.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for hashtag suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao sugerir hashtags: ${errorMessage}`);
  }
};

export const suggestEmojisForCaption = async (productName: string, productDescription: string): Promise<string[]> => {
  const prompt = `
    Você é um especialista em mídias sociais e marketing digital.
    Analise o seguinte produto:
    - Nome: "${productName}"
    - Descrição: "${productDescription}"

    Sugira 5 emojis altamente relevantes para este produto, que possam ser usados em uma legenda de Instagram para aumentar o apelo visual e o engajamento.
    
    Instruções:
    1. Os emojis devem ser visualmente atraentes e relacionados ao produto ou ao sentimento que ele evoca.
    2. A resposta DEVE ser um array de strings JSON, contendo exatamente 5 emojis.
    3. O formato da resposta deve ser: ["emoji1", "emoji2", "emoji3", "emoji4", "emoji5"]
    4. Não inclua nenhuma explicação ou texto adicional, apenas o array JSON.
    
    Exemplo: para "Fone de Ouvido Bluetooth", a resposta poderia ser ["🎧", "🎶", "✨", "🔋", "🏃‍♀️"]
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.5;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: temperature,
      }
    });

    const parsedData = parseJsonFromGeminiResponse<string[]>(response.text);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      return parsedData;
    } else {
      throw new Error("A API não retornou um array de strings de emoji válido.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for emoji suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao sugerir emojis: ${errorMessage}`);
  }
};


export interface InstagramProfileAnalysis {
  profile_image_url: string;
  profile_name: string;
  username: string;
  bio: string;
  posts: string;
  followers: string;
  following: string;
  niche: string;
  content_analysis: string;
  suggestions: string;
  content_ideas: { title: string; description: string; format: 'Reels' | 'Post' | 'Stories' }[];
  error?: string;
}

export const analyzeInstagramProfileFromApi = async (username: string): Promise<InstagramProfileAnalysis> => {
  const prompt = `
    Você é um especialista em análise de perfis do Instagram e um estrategista de conteúdo criativo.
    Sua tarefa é usar a ferramenta de busca para encontrar informações públicas e REAIS sobre o nome de usuário do Instagram fornecido e retornar uma análise estruturada em formato JSON.

    Nome de usuário: "${username}"

    Instruções:
    1. USE A FERRAMENTA DE BUSCA para encontrar o perfil do Instagram e coletar os dados públicos mais recentes e precisos, como biografia, número de seguidores, posts, etc.
    2. Retorne um único objeto JSON.
    3. O objeto JSON DEVE ter EXATAMENTE os seguintes campos: \`profile_image_url\`, \`profile_name\`, \`username\`, \`bio\`, \`posts\`, \`followers\`, \`following\`, \`niche\`, \`content_analysis\`, \`suggestions\`, e \`content_ideas\`.
    4. Os campos \`posts\`, \`followers\` e \`following\` devem ser strings formatadas (por exemplo, "1.2M", "503K", "1.234").
    5. O campo \`niche\` deve identificar a categoria principal ou tópico do perfil (por exemplo, "Fitness", "Blogueiro de Viagens", "Análises de Tecnologia").
    6. O campo \`content_analysis\` deve fornecer um breve resumo do tipo de conteúdo postado, engajamento e estratégia geral, baseado em informações encontradas na busca.
    7. O campo \`suggestions\` deve oferecer 2-3 dicas acionáveis GERAIS para o perfil melhorar seu engajamento e crescimento (ex: frequência de postagem, uso de stories).
    8. O campo \`content_ideas\` DEVE ser um array contendo 3 IDEIAS DE CONTEÚDO ESPECÍFICAS e criativas, baseadas no nicho e no conteúdo existente do perfil. Cada ideia deve ser um objeto com os campos \`title\`, \`description\`, e \`format\` (que pode ser 'Reels', 'Post' ou 'Stories').
    9. Se a busca não encontrar o perfil, retorne um objeto JSON com uma chave \`error\` e o valor "Perfil não encontrado ou privado.".
    10. A resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, explicação ou formatação de markdown.

    Exemplo de saída:
    {
      "profile_image_url": "https://url.da.imagem/exemplo.jpg",
      "profile_name": "Nome do Perfil",
      "username": "${username}",
      "bio": "Biografia do perfil aqui.",
      "posts": "1.234",
      "followers": "503K",
      "following": "150",
      "niche": "Criador de Conteúdo Digital",
      "content_analysis": "O perfil foca em vídeos de humor com alta qualidade de produção. O engajamento é alto, especialmente nos Reels. A estratégia de conteúdo é consistente.",
      "suggestions": "1. Aumentar a frequência de Stories interativos (enquetes, perguntas). 2. Fazer colaborações com outros criadores do mesmo nicho para expandir o alcance.",
      "content_ideas": [
        {
          "title": "React vs. Realidade: Expectativas de um Dev Jr.",
          "description": "Um vídeo curto e engraçado mostrando a expectativa (código limpo, tudo funcionando) vs. a realidade (bugs, console.log por toda parte) de um desenvolvedor júnior.",
          "format": "Reels"
        },
        {
          "title": "Carrossel: 3 Ferramentas de IA que Todo Dev Deveria Conhecer",
          "description": "Um post em formato carrossel apresentando 3 ferramentas de IA que auxiliam no desenvolvimento, com exemplos práticos de como usar cada uma.",
          "format": "Post"
        },
        {
          "title": "Live Q&A: Análise de Portfolio dos Seguidores",
          "description": "Uma sessão de stories interativa onde você analisa rapidamente o portfolio de alguns seguidores e dá dicas construtivas.",
          "format": "Stories"
        }
      ]
    }
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.3;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: temperature,
      }
    });

    return parseJsonFromGeminiResponse<InstagramProfileAnalysis>(response.text);

  } catch (error) {
    console.error("Error calling Gemini API for Instagram profile analysis:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao analisar perfil do Instagram: ${errorMessage}`);
  }
};

export const generateImageFromApi = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiImageModel || 'imagen-4.0-generate-001';

    const response = await ai.models.generateImages({
      model: model,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;

  } catch (error) {
    console.error("Error calling Gemini API for image generation:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar imagem: ${errorMessage}`);
  }
};

export const createChat = (): Chat => {
  const ai = getAiClient();
  const settings = getSettings();
  const model = settings.aiTextModel || 'gemini-1.5-flash';
  const temperature = settings.aiTemperature ?? 0.7;

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: "Você é um assistente de IA prestativo e amigável chamado ACI. Suas respostas devem ser úteis e informativas. Responda em português do Brasil.",
      temperature: temperature,
    },
  });
  return chat;
};


export const generateBlogPostWithCssFromData = async (productData: { [key: string]: string }): Promise<{ html: string; css: string }> => {
  const prompt = `
    Você é um desenvolvedor frontend especialista em UI/UX e marketing de afiliados.
    Sua tarefa é criar um card de produto completo (HTML e CSS) para um post de blog, usando os dados fornecidos. O design deve ser moderno, limpo e otimizado para conversão.

    Dados do Produto:
    ${JSON.stringify(productData, null, 2)}

    Instruções:
    1.  **Estrutura da Resposta:** A resposta DEVE ser um único objeto JSON com duas chaves: "html" e "css".
    2.  **HTML:**
        *   Crie o HTML para um card de produto. A estrutura deve ser semântica.
        *   O card DEVE ter uma classe container principal, por exemplo, \`product-card-ai\`. Todas as outras classes devem ser aninhadas dentro dela para escopo.
        *   Inclua a imagem do produto (se houver uma URL na chave "Produto" ou similar, caso contrário use um placeholder), o título ("Produto"), o preço ("Preço") e a avaliação ("Avaliação"). A avaliação pode ser representada por estrelas (caracteres ou SVGs inline).
        *   Adicione um botão de "Call to Action" (CTA) com um texto persuasivo como "Ver Oferta" ou "Comprar Agora". O botão não precisa de link (use href="#").
    3.  **CSS:**
        *   Crie o CSS para estilizar o card de produto definido no HTML.
        *   TODO o CSS deve ser escopado para a classe container principal (\`.product-card-ai\`) para evitar conflitos com outros estilos do blog.
        *   O design deve ser profissional e atraente: use um bom espaçamento, uma paleta de cores harmoniosa (pode se inspirar em tons de roxo e azul escuro, como os de um dashboard moderno), sombras sutis para dar profundidade e efeitos de hover no botão CTA.
        *   O card deve ser responsivo.
    4.  **Avaliação:** Para a avaliação (ex: "4.9"), crie uma representação visual com estrelas. Pode usar caracteres unicode (★ e ☆).
    5.  **NÃO inclua** explicações, markdown ou qualquer texto fora do objeto JSON.

    Exemplo de Saída JSON:
    {
      "html": "<div class=\\"product-card-ai\\"><img src=\\"https://i.imgur.com/example.png\\" alt=\\"Nome do Produto\\"><div class=\\"product-info\\"><h3>Nome do Produto</h3><div class=\\"rating\\"><span>★★★★☆</span> 4.9</div><p class=\\"price\\">R$ 39,00</p></div><a href=\\"#\\" class=\\"cta-button\\">Ver Oferta</a></div>",
      "css": ".product-card-ai { background: #1e293b; border-radius: 12px; font-family: sans-serif; ... } .product-card-ai .cta-button { background-color: #4f46e5; ... } .product-card-ai .cta-button:hover { background-color: #6366f1; }"
    }
  `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.5;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: temperature,
      }
    });

    const parsedData = parseJsonFromGeminiResponse<{ html: string; css: string }>(response.text);

    if (typeof parsedData.html !== 'string' || typeof parsedData.css !== 'string') {
      throw new Error("A resposta da API não contém os campos 'html' ou 'css'.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API for blog post with CSS generation:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar post de blog: ${errorMessage}`);
  }
};

export interface FullBlogPost {
  title: string;
  content: string; // Markdown content
  hashtags: string[];
  emojis: string[];
}

export const generateFullBlogPostFromDetails = async (
  productName: string,
  productDescription: string,
  toneOfVoice: string,
  targetAudience: string,
  postObjective: string
): Promise<FullBlogPost> => {
  const prompt = `
        Você é um copywriter especialista em SEO e marketing de afiliados. Sua tarefa é criar um post de blog completo e otimizado sobre um produto.

        Dados do Produto:
        - Nome: "${productName}"
        - Descrição: "${productDescription}"

        Diretrizes do Post:
        - Tom de Voz: "${toneOfVoice}"
        - Público Alvo: "${targetAudience}"
        - Objetivo Principal: "${postObjective}"

        Instruções:
        1.  **Estrutura da Resposta:** A resposta DEVE ser um único objeto JSON com as chaves: "title", "content", "hashtags", "emojis".
        2.  **title (string):** Crie um título magnético e otimizado para SEO para o post do blog.
        3.  **content (string):** Escreva o corpo do post em formato Markdown. O conteúdo deve ser bem estruturado, com parágrafos, subtítulos (usando ##), e talvez uma lista de benefícios. Deve ser persuasivo e focar nos benefícios para o público-alvo, alinhado ao objetivo do post.
        4.  **hashtags (array de strings):** Sugira 5 a 7 hashtags relevantes para redes sociais, começando com '#'.
        5.  **emojis (array de strings):** Sugira 3 a 5 emojis que combinem com o post.
        6.  **NÃO inclua** explicações, markdown ou qualquer texto fora do objeto JSON.

        Exemplo de Saída JSON:
        {
          "title": "Por Que o Fone TWS é o Upgrade que Seus Ouvidos Precisavam?",
          "content": "Cansado de fios te atrapalhando?\\n\\nO Fone TWS chegou para revolucionar sua experiência de áudio. Com cancelamento de ruído ativo, você foca apenas no que importa.\\n\\n## Principais Benefícios\\n- Bateria de longa duração\\n- Design ergonômico\\n- Qualidade de som cristalina",
          "hashtags": ["#fonedeouvidobluetooth", "#tws", "#tecnologia", "#musica", "#achadinhosshopee"],
          "emojis": ["🎧", "🎶", "✨"]
        }
    `;

  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';
    const temperature = settings.aiTemperature ?? 0.7;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: temperature,
      }
    });

    const parsedData = parseJsonFromGeminiResponse<FullBlogPost>(response.text);

    if (!parsedData.title || !parsedData.content || !Array.isArray(parsedData.hashtags) || !Array.isArray(parsedData.emojis)) {
      throw new Error("A resposta da API está incompleta ou mal formatada.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API for full blog post generation:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na API.";
    throw new Error(`Falha ao gerar post de blog completo: ${errorMessage}`);
  }
};

// --- NEW ---
const genericProductSearchPrompt = (platform: string, keyword: string) => `
    Você é um especialista em buscar produtos na ${platform}.
    Sua tarefa é encontrar produtos para a palavra-chave: "${keyword}" e retornar em JSON.

    Instruções:
    1. Busque por produtos na ${platform} que correspondam à palavra-chave.
    2. Retorne até 20 produtos.
    3. A resposta DEVE ser um array de objetos JSON, com os campos: \`title\`, \`price\`, \`image_url\`, e \`product_url\`.
    4. \`price\` deve ser uma string "R$ XX,XX".
    5. \`image_url\` e \`product_url\` devem ser URLs completas e válidas.
    6. NÃO inclua nenhum texto fora do array JSON.
`;

const genericTopSalesPrompt = (platform: string, category: string) => `
    Você é um especialista em encontrar os produtos mais vendidos na ${platform}.
    Sua tarefa é encontrar os mais vendidos para a categoria: "${category}" e retornar em JSON.

    Instruções:
    1. Busque pelos produtos mais populares na ${platform} na categoria.
    2. Retorne até 20 produtos.
    3. A resposta DEVE ser um array de objetos JSON, com os campos: \`title\`, \`price\`, \`image_url\`, e \`product_url\`.
    4. \`price\` deve ser uma string "R$ XX,XX".
    5. \`image_url\` e \`product_url\` devem ser URLs completas e válidas.
    6. NÃO inclua nenhum texto fora do array JSON.
`;

const genericLinkGeneratorPrompt = (platform: string, productUrl: string, affiliateId: string) => {
  let instructions = '';
  if (platform === 'Amazon') {
    instructions = `Construa o link de afiliado da Amazon. Adicione o ID do Afiliado (tag) ao link com o parâmetro \`tag\`. Exemplo: se o ID for 'seutag-20', o parâmetro deve ser 'tag=seutag-20'.`;
  } else if (platform === 'Mercado Livre') {
    instructions = `Construa o link de afiliado do Mercado Livre. Adicione o ID do Afiliado ao link. Muitas vezes, isso é feito com parâmetros como \`af_id\` ou através de uma URL de redirecionamento. Use o método mais comum e eficaz.`;
  }

  return `
    Gere um link de afiliado da ${platform} com base nas informações abaixo.

    URL do Produto: "${productUrl}"
    ID do Afiliado: "${affiliateId}"

    Instruções:
    1. ${instructions}
    2. Se o ID do Afiliado estiver vazio, gere o link sem ele.
    3. A resposta DEVE CONTER APENAS a URL final, sem nenhum texto, explicação ou markdown.
  `;
};

async function fetchProductList(prompt: string): Promise<Product[]> {
  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsedData = parseJsonFromGeminiResponse<Product[]>(response.text);
    if (!Array.isArray(parsedData)) {
      throw new Error("API did not return a valid product array.");
    }
    return parsedData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown API error.";
    throw new Error(`Failed to fetch products: ${errorMessage}`);
  }
}

async function generateAffiliateLink(prompt: string): Promise<string> {
  try {
    const ai = getAiClient();
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-1.5-flash';

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown API error.";
    throw new Error(`Failed to generate link: ${errorMessage}`);
  }
}

export const searchAmazonProductsFromApi = (keyword: string) => fetchProductList(genericProductSearchPrompt('Amazon Brasil', keyword));
export const searchMercadoLivreProductsFromApi = (keyword: string) => fetchProductList(genericProductSearchPrompt('Mercado Livre Brasil', keyword));

export const getTopSalesAmazonFromApi = (category: string) => fetchProductList(genericTopSalesPrompt('Amazon Brasil', category));
export const getTopSalesMercadoLivreFromApi = (category: string) => fetchProductList(genericTopSalesPrompt('Mercado Livre Brasil', category));

export const generateAmazonLinkFromApi = (productUrl: string, affiliateId: string) => generateAffiliateLink(genericLinkGeneratorPrompt('Amazon', productUrl, affiliateId));
export const generateMercadoLivreLinkFromApi = (productUrl: string, affiliateId: string) => generateAffiliateLink(genericLinkGeneratorPrompt('Mercado Livre', productUrl, affiliateId));