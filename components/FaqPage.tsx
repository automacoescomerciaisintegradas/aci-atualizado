import React, { useState } from 'react';
import { ChevronDownIcon, HelpCircleIcon } from './Icons';

const faqData = [
  {
    question: "Como funciona o sistema de créditos?",
    answer: (
      <div className="space-y-4">
        <p>Criar sua conta é 100% gratuito e você recebe R$3 de crédito inicial para experimentar todos os recursos.</p>
        <p>Após o teste, você pode fazer uma recarga via PIX com aprovação imediata. O valor mínimo de recarga é de R$50, mas você pode adicionar quanto desejar.</p>
        <p>Os créditos são usados no modelo pay-per-use, ou seja, você só paga pelo que usa — sem mensalidade. Com eles, é possível:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Gerar artigos, eBooks e reviews com IA</li>
          <li>Criar imagens com DALL·E</li>
          <li>Agendar postagens no WordPress</li>
          <li>Enviar produtos para o Telegram</li>
          <li>Realizar consultas na Shopee (afiliado)</li>
        </ul>
        <p>Sem mensalidade, sem assinatura obrigatória e com liberdade total de uso.</p>
      </div>
    )
  },
  {
    question: "Os créditos têm validade?",
    answer: <p>Não, seus créditos não expiram. Você pode usá-los quando quiser, sem pressa.</p>
  },
  {
    question: "Como Funciona o ACI?",
    answer: <p>O ACI é nossa IA proprietária que analisa dados de mercado e tendências para sugerir os melhores produtos e estratégias de conteúdo para você. Ele é o cérebro por trás de muitas das nossas ferramentas de automação.</p>
  },
  {
    question: "Como funciona a integração com a Shopee Afiliado?",
    answer: <p>Você insere seu ID de afiliado Shopee em nosso painel administrativo. A partir daí, todas as ferramentas que geram links de produtos, como o 'Top Vendas' ou 'Envio em Lote', criarão automaticamente links de afiliado rastreáveis para você.</p>
  },
  {
    question: "Como funciona a integração com o Instagram?",
    answer: <p>Ao conectar sua conta profissional do Instagram, você nos autoriza a realizar ações em seu nome, como publicar conteúdo, responder a comentários e analisar métricas. Tudo é feito de forma segura através da API oficial da Meta.</p>
  },
  {
    question: "Como funciona a integração com o Telegram?",
    answer: <p>Você precisa criar um bot no Telegram usando o @BotFather e nos fornecer o token. Depois, adicione este bot como administrador do seu canal. Isso nos permite enviar mensagens, como as ofertas geradas pela ferramenta 'Envio em Lote', diretamente para o seu público.</p>
  },
  {
    question: "Os Artigos Gerados Contêm Plágio?",
    answer: <p>Não. Nossos modelos de IA são treinados para gerar conteúdo original e único. No entanto, sempre recomendamos uma revisão final para garantir que o texto atenda perfeitamente ao seu tom de voz e estilo.</p>
  },
  {
    question: "Posso Aprovar Meu Site no AdSense Usando os Artigos Gerados?",
    answer: <p>Sim, muitos de nossos clientes usam o conteúdo gerado para criar blogs e monetizá-los com o Google AdSense. A chave é a qualidade e a originalidade do conteúdo, que nossa IA se esforça para fornecer. A aprovação final, no entanto, depende das políticas do Google.</p>
  },
  {
    question: "Quem Gera os Conteúdos dos Artigos?",
    answer: <p>Os conteúdos são gerados por modelos de linguagem avançados (LLMs), como a família de modelos Gemini do Google. Eles criam textos coesos e informativos com base nos dados e comandos fornecidos.</p>
  },
  {
    question: "Há Alguma Limitação no Número de Posts que Posso Gerar?",
    answer: <p>A única limitação é a quantidade de créditos que você tem em sua conta. Não há um limite diário ou mensal de posts que você pode gerar.</p>
  },
  {
    question: "Como os Conteúdos Gerados Podem Beneficiar o SEO do Meu Blog?",
    answer: <p>O conteúdo é gerado com boas práticas de SEO em mente, como estrutura de títulos (H1, H2, H3) e texto relevante. Manter uma frequência de postagens com conteúdo de qualidade é um dos pilares para um bom ranqueamento no Google.</p>
  },
  {
    question: "Posso Personalizar os Artigos Gerados?",
    answer: <p>Sim, totalmente! O conteúdo gerado é um ponto de partida excelente. Você pode (e deve) editar, adicionar suas próprias experiências, imagens e links para personalizar o artigo e alinhá-lo perfeitamente à sua marca.</p>
  },
  {
    question: "É Necessário Ter Conhecimentos Técnicos Para Usar o Serviço?",
    answer: <p>Não. Nossa plataforma foi projetada para ser intuitiva e fácil de usar. Se você sabe navegar na internet, conseguirá usar nossas ferramentas sem problemas. Além disso, temos tutoriais e suporte para ajudar.</p>
  },
  {
    question: "Posso Cancelar Minha Conta Se Não Estiver Satisfeito?",
    answer: <p>Sim. Como nosso modelo é 'pague-pelo-uso', não há contratos ou mensalidades. Você pode simplesmente parar de usar a plataforma a qualquer momento. Seus créditos restantes permanecerão na conta caso decida voltar.</p>
  }
];

const FaqItem: React.FC<{
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-dark-border">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-5 px-6"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-dark-text-primary">{question}</span>
        <ChevronDownIcon
          className={`h-6 w-6 text-dark-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-6 px-6 text-dark-text-secondary prose prose-invert max-w-none prose-p:my-2 prose-ul:my-2">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};


export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <HelpCircleIcon className="h-16 w-16 text-brand-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Perguntas Frequentes</h1>
        <p className="text-md text-dark-text-secondary max-w-2xl mx-auto">Navegue pelas perguntas frequentes e encontre soluções rápidas para suas principais dúvidas.</p>
      </div>

      <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border overflow-hidden">
        {faqData.map((item, index) => (
          <FaqItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onClick={() => handleToggle(index)}
          />
        ))}
      </div>
    </div>
  );
};