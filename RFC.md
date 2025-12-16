# RFC: Request For Comments

## Proposta de Mudança Técnica ou Funcional

### Título: Implementação de Sistema de Webhooks para Integração com Evolution API

### Data: 11/12/2025

### Autor: Equipe de Desenvolvimento ACI

### Status: Rascunho

## Resumo

Esta RFC propõe a implementação de um sistema de webhooks para melhorar a integração com a Evolution API, permitindo recepção em tempo real de eventos do WhatsApp. Isso melhorará significativamente a experiência do usuário ao fornecer atualizações instantâneas sobre mensagens, conexões e outros eventos.

## Motivação

Atualmente, nossa integração com a Evolution API depende de polling para obter atualizações de estado, o que pode causar:
- Atrasos na atualização de informações
- Uso desnecessário de recursos de rede
- Experiência do usuário menos fluida

Com a implementação de webhooks, podemos:
- Receber eventos em tempo real
- Reduzir o consumo de banda
- Melhorar a responsividade da interface
- Oferecer uma experiência mais próxima do tempo real

## Especificação Técnica

### Endpoint de Webhook
Será criado um novo endpoint `/api/evolution/webhook` que receberá eventos da Evolution API.

### Tipos de Eventos Suportados
- `QRCODE_UPDATED`: Atualização do QR Code
- `CONNECTION_UPDATE`: Alterações no estado da conexão
- `MESSAGES_UPSERT`: Novas mensagens recebidas
- `MESSAGES_UPDATE`: Mensagens atualizadas
- `MESSAGES_DELETE`: Mensagens deletadas
- `SEND_MESSAGE`: Confirmação de envio de mensagem
- `CONTACTS_UPSERT`: Novos contatos
- `CONTACTS_UPDATE`: Contatos atualizados
- `PRESENCE_UPDATE`: Atualizações de presença
- `CHATS_UPSERT`: Novos chats
- `CHATS_UPDATE`: Chats atualizados
- `CHATS_DELETE`: Chats deletados
- `GROUPS_UPSERT`: Novos grupos
- `GROUPS_UPDATE`: Grupos atualizados
- `GROUP_PARTICIPANTS_UPDATE`: Participantes de grupos atualizados

### Implementação
1. Criação do endpoint REST para recepção de webhooks
2. Validação de autenticidade das requisições
3. Processamento e encaminhamento dos eventos via Socket.IO
4. Interface de configuração do webhook na página de status

### Segurança
- Implementação de verificação de assinatura das requisições
- Uso de chave secreta compartilhada com a Evolution API
- Rate limiting para prevenir abuso
- Logging detalhado de eventos recebidos

## Impacto

### Positivo
- Melhoria na experiência do usuário
- Redução no consumo de recursos
- Atualizações em tempo real
- Maior eficiência na comunicação com a API

### Negativo
- Aumento da complexidade do sistema
- Necessidade de gerenciamento de estado adicional
- Possíveis problemas de segurança se mal implementado

## Alternativas Consideradas

1. **Continuar com polling**: Manter a abordagem atual, mas otimizar a frequência
   - Menos complexidade
   - Maior latência nas atualizações
   - Consumo constante de recursos

2. **Long Polling**: Implementar long polling como intermediário
   - Compromisso entre complexidade e desempenho
   - Ainda consome mais recursos que webhooks
   - Implementação mais complexa que polling simples

## Decisão

A implementação de webhooks é recomendada por proporcionar uma experiência significativamente melhor ao usuário, apesar do aumento de complexidade. Os benefícios superam os custos de implementação e manutenção.

## Referências

- Documentação da Evolution API
- Documentação do Socket.IO
- Melhores práticas de segurança para webhooks