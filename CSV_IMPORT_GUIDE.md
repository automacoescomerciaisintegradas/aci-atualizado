# 📝 Guia de Importação em Massa (CSV) para Blog

Para utilizar a funcionalidade de criação de posts em massa, você deve preparar um arquivo CSV (separado por vírgulas) com as seguintes colunas.

## 📋 Estrutura do Arquivo CSV

A primeira linha do arquivo deve conter os cabeçalhos exatos abaixo:

```csv
nome_produto,descricao,link_afiliado,tom_de_voz,publico_alvo
```

### Detalhes das Colunas:

1.  **nome_produto** (Obrigatório): O nome principal do produto.
2.  **descricao** (Obrigatório): Detalhes do produto, características, benefícios. Quanto mais detalhes, melhor o post.
3.  **link_afiliado** (Opcional): O link para onde o botão de compra deve apontar.
4.  **tom_de_voz** (Opcional): Ex: "persuasivo", "técnico", "divertido". Se vazio, usa o padrão.
5.  **publico_alvo** (Opcional): Ex: "gamers", "donas de casa", "estudantes". Se vazio, usa o padrão.

## 💡 Exemplo de Conteúdo

```csv
nome_produto,descricao,link_afiliado,tom_de_voz,publico_alvo
"Smartphone XYZ","Tela AMOLED 120Hz, Câmera 108MP, Bateria 5000mAh","https://shopee.com.br/produto123","entusiasta","amantes de tecnologia"
"Fone Bluetooth Pro","Cancelamento de ruído ativo, 30h de bateria","https://amazon.com.br/fone123","profissional","trabalhadores remotos"
```

## 🚀 Como Usar

1.  No painel "Criador de Blog", selecione a aba **"Importar CSV"**.
2.  Faça o upload do seu arquivo `.csv`.
3.  Revise a lista de produtos importados.
4.  Clique em **"Gerar e Publicar em Massa"**.
5.  Acompanhe o progresso na tela.
