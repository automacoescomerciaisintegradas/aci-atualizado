# Refatoração da Interface do AdminPageComponents

## Resumo das mudanças realizadas

1. **Criação do Sistema de Design**
   - Criado arquivo `src/styles/designSystem.ts` com as especificações fornecidas
   - Definido paleta de cores, tipografia, espaçamento e componentes

2. **Atualização dos Componentes**
   - `TabButton.tsx`: Refatorado para usar as cores e estilos do novo sistema de design
   - `FormField.tsx`: Atualizado para seguir o padrão de inputs do design system
   - `ApiKeysTab.tsx`: Refatorado para usar os novos estilos de cards e botões
   - `AdminPage.tsx`: Atualizado layout principal com nova paleta de cores e espaçamento

3. **Criação de Componentes Reutilizáveis**
   - Criado `StyledComponents.tsx` com componentes padronizados:
     - `Button`: Botões primários, ghost e apenas ícone
     - `Card`: Componente de card com sombra e bordas do design system
     - `Input`: Campo de input estilizado
     - `Badge`: Indicadores coloridos para status
     - `Alert`: Componente de alerta para mensagens importantes

## Paleta de Cores Aplicada

- Fundo principal: `#1e2029`
- Cards e elementos secundários: `#252735`
- Inputs e dropdowns: `#2f3245`
- Cor primária (botões, links): `#6d6bfb`
- Texto primário: `#d0d2d6`
- Texto secundário: `#b4b7bd`
- Texto mutado: `#676d7d`

## Benefícios

- Consistência visual em toda a interface administrativa
- Facilidade de manutenção com componentes reutilizáveis
- Alinhamento com as diretrizes de design moderno
- Melhor acessibilidade com contraste adequado