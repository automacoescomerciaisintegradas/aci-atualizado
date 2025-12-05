# Plano de Ação Global de Alto Nível (AI‑Driven)

---

## 1️⃣ Plano de Ação Global de Alto Nível

Este plano serve como a bússola estratégica do projeto, alinhando a aplicação da IA com os objetivos de negócio. Ele oferece uma visão macro, independentemente da ferramenta ou modelo de IA utilizado.

**Objetivo:** Definir a direção, os limites e os principais resultados esperados do projeto, garantindo que a IA seja um facilitador para atingir as metas de longo prazo.

### Componentes

- **Visão e Justificativa do Projeto**
  - **Problema a ser resolvido:** Qual o principal desafio que o projeto busca solucionar?
  - **Objetivo de Negócio:** Aumentar a eficiência, inovar em produtos, personalizar a experiência do cliente, etc.
  - **Meta da IA:** Como a IA contribuirá para esse objetivo (ex: automatizar a geração de código, otimizar a análise de dados, etc.).

- **Análise de Contexto**
  - **Tipo de Projeto:**
    - **Do Zero (Greenfield):** A IA apoiará todo o ciclo, da concepção à entrega.
    - **Existente (Legacy):** A IA será usada para entender, refatorar ou expandir uma base de código existente. A complexidade e a qualidade da documentação são fatores críticos.
  - **Recursos e Limitações:**
    - **Tecnologias Envolvidas:** Linguagens, frameworks e plataformas a serem utilizadas.
    - **Restrições:** Orçamento, prazos, e conformidade com regulamentações como a LGPD.

- **Diretrizes e KPIs (Indicadores‑Chave de Desempenho)**
  - **Princípios:** Manter o controle humano, garantir a segurança e a privacidade dos dados.
  - **Métricas de Sucesso:** Redução do tempo de desenvolvimento, diminuição da taxa de erros, aumento da cobertura de testes, etc.

- **Escopo de Atuação da IA**
  - Definir claramente onde a IA será aplicada e onde a intervenção humana é mandatória, especialmente em áreas de decisão crítica.

---

## 2️⃣ Plano de Ação Baseado na Etapa / Tópico

Este plano traduz a estratégia global em fases e tópicos de desenvolvimento mais granulares. Ele organiza o trabalho de forma lógica e sequencial, permitindo que a IA foque em domínios específicos do projeto.

**Objetivo:** Estruturar o desenvolvimento em blocos lógicos, permitindo que a IA gere código e artefatos de forma organizada e contextualizada.

### Exemplo de Estrutura por Tópicos

- **Tópico 1: Configuração do Ambiente e Estrutura do Projeto**
  - Definir a estrutura de diretórios.
  - Configurar ferramentas de build e dependências (ex: `pom.xml`, `package.json`).
  - Criar o script de entry point da aplicação.

- **Tópico 2: Núcleo da Aplicação (Core)**
  - Implementar o `SessionManager`.
  - Desenvolver o `InMemoryEventStore`.
  - Definir as interfaces principais (ex: `SessionData`).

- **Tópico 3: Camada de API Web**
  - Configurar o servidor web (ex: Express, Spring Boot).
  - Implementar os middlewares.
  - Definir e implementar as rotas da API (`/users`, `/products`).

- **Tópico 4: Testes**
  - Desenvolver testes unitários para o núcleo da aplicação.
  - Criar testes de integração para a API.

---

## 3️⃣ Plano de Ação Baseado no Prompt

Este é o plano mais tático, onde a interação com a IA acontece. Ele foca em como "conversar" com a IA para que ela execute as tarefas definidas nos planos anteriores. A qualidade dos prompts é crucial para a qualidade dos resultados.

**Objetivo:** Fornecer instruções claras, detalhadas e contextualizadas para a IA gerar os resultados desejados com precisão.

### Componentes e Boas Práticas

- **Contextualização:** Sempre informe à IA sobre o plano de etapa/tópico atual.
  - *Exemplo de Prompt:* "Você está trabalhando no **Tópico 2: Núcleo da Aplicação**. A tarefa agora é criar a interface `SessionData` em TypeScript."

- **Especificidade:** Forneça o máximo de detalhes possível sobre o que você precisa.
  - *Exemplo de Prompt:* "Crie a interface `SessionData`. Ela deve incluir os seguintes campos: `id` (string), `transportType` (um enum com os valores 'http' e 'websocket'), `createdAt` (Date) e `payload` (any)."

- **Persona e Formato:** Atribua um papel à IA e defina o formato da saída.
  - *Exemplo de Prompt:* "Aja como um desenvolvedor sênior especialista em TypeScript. Gere apenas o código para a interface `SessionData` em um bloco de código formatado."

- **Iteração:** Use prompts sequenciais para refinar ou expandir o trabalho.
  - *Exemplo de Prompt:* "Excelente. Agora, com base na interface `SessionData` que você criou, implemente a classe `InMemoryEventStore` que armazena uma lista de eventos `SessionData`."

---

## 4️⃣ Plano de Ação Controlado pela IA

Neste nível, a IA ganha autonomia para gerenciar seu próprio fluxo de trabalho e rastrear as tarefas. O objetivo é que a própria IA crie e mantenha um plano para controlar seu progresso, anotando o que já foi feito e o que precisa ser feito a seguir.

**Objetivo:** Permitir que a IA organize, execute e rastreie suas próprias tarefas, aumentando a automação e a eficiência do processo.

### Funcionamento

1. **Instrução Inicial:** O desenvolvedor dá uma ordem de alto nível à IA.
   - *Exemplo:* "Com base no plano de tópico 'Núcleo da Aplicação', implemente todas as classes e interfaces necessárias."
2. **Geração do Plano da IA:** A IA cria seu próprio plano de execução, muitas vezes em um arquivo como `plan/tasks.md`.
   - *Saída da IA (em `plan/tasks.md`):*
     ```markdown
     # Plano de Implementação: Núcleo da Aplicação

     - [ ] Criar a interface `SessionData`.
     - [ ] Criar a classe `InMemoryEventStore`.
     - [ ] Implementar o método `storeEvent` na `InMemoryEventStore`.
     - [ ] Implementar o método `replayEventsAfter` na `InMemoryEventStore`.
     - [ ] Criar a classe `SessionManager` que utiliza o `InMemoryEventStore`.
     ```
3. **Execução e Rastreamento:** A IA executa cada item do seu plano, marcando-o como concluído e, se necessário, adicionando notas ou novas tarefas que surgiram durante o processo. O desenvolvedor pode monitorar e intervir neste arquivo para guiar a IA.

---

## 5️⃣ Processo de "Update Todos"

"Update Todos" não é um plano, mas um comando ou processo contínuo que garante a sincronização entre o estado atual do código e os planos de ação, especialmente o plano controlado pela IA.

**Objetivo:** Manter a lista de tarefas (`plan/tasks.md`) sempre atualizada, refletindo o que já foi implementado no código e o que ainda está pendente.

### Fluxo

1. **Análise de Código:** A IA (ou uma ferramenta auxiliar) analisa a base de código atual.
2. **Comparação com o Plano:** Ela compara os arquivos e implementações existentes com a lista de tarefas no `plan/tasks.md`.
3. **Atualização:** A IA atualiza o status das tarefas no arquivo.
   - Se um arquivo como `src/core/SessionData.ts` foi criado e contém a interface, a tarefa `[ ] Criar a interface SessionData` é marcada como `[x] Criar a interface SessionData`.
4. **Relatório:** A IA informa ao desenvolvedor sobre as atualizações, garantindo que todos tenham uma visão clara do progresso do projeto.

---

*Este documento serve como referência para organizar o desenvolvimento impulsionado por IA, permitindo um fluxo de trabalho estruturado, rastreável e altamente produtivo.*
