# 🚀 Configuração do Bot Telegram para Envio de Ofertas

## 📋 Pré-requisitos

1. **Bot do Telegram criado** via @BotFather
2. **Token do bot** copiado do @BotFather
3. **Bot adicionado** aos grupos/canais onde deseja enviar ofertas

## 🔧 Como Criar o Bot

### 1. Criar Bot via @BotFather
```
1. Abra o Telegram e procure por @BotFather
2. Envie /newbot
3. Escolha um nome para o bot
4. Escolha um username (deve terminar em 'bot')
5. Copie o token fornecido
```

### 2. Configurar Permissões do Bot
```
1. Envie /setcommands para @BotFather
2. Selecione seu bot
3. Configure comandos básicos se necessário
4. Use /setjoingroups para permitir que o bot entre em grupos
```

## 🎯 Como Adicionar o Bot aos Grupos/Canais

### Para Grupos:
```
1. Abra o grupo onde deseja enviar ofertas
2. Adicione o bot como membro
3. O bot deve ter permissão para enviar mensagens
4. Use o botão "📋 Descobrir IDs" para encontrar o ID do grupo
```

### Para Canais:
```
1. Abra o canal onde deseja enviar ofertas
2. Adicione o bot como administrador
3. O bot deve ter permissão para:
   - Enviar mensagens
   - Editar mensagens (opcional)
4. Use o botão "📋 Descobrir IDs" para encontrar o ID do canal
```

## 🔍 Função "Descobrir IDs" Melhorada

### O que faz:
1. **Valida o token** do bot
2. **Busca chats recentes** via getUpdates
3. **Verifica chats conhecidos** (IDs que você já tem)
4. **Mostra status** do bot em cada chat
5. **Ordena por prioridade** (canais > supergrupos > grupos)

### Chats Verificados Automaticamente:
- `-1002795748070` - shopee/imports
- `-4921615549` - Automações Comerciais Integradas!
- `-1001834086191` - ACI
- `-1002663998616` - fco
- `-5667792894` - outro grupo

## 📱 Como Usar na Interface

### 1. Configurar Bot:
```
- Cole o token do bot no campo "Token do Bot"
- Clique em "📋 Descobrir IDs"
- Aguarde a verificação dos chats
```

### 2. Selecionar Chat:
```
- Na lista de chats encontrados, clique no desejado
- O ID será copiado automaticamente
- Verifique o status do bot (Admin/Membro)
```

### 3. Testar Conexão:
```
- Clique em "🔍 Testar Conexão"
- Confirme se o bot tem permissões adequadas
- Resolva problemas de permissão se necessário
```

## 🚨 Solução de Problemas

### Erro: "Token inválido"
```
- Copie novamente o token do @BotFather
- Verifique se não há espaços extras
- Confirme se o bot ainda está ativo
```

### Erro: "Chat não encontrado"
```
- Adicione o bot ao grupo/canal primeiro
- Use IDs com prefixo -100 para canais
- Verifique se o bot tem permissões
```

### Erro: "Bot sem permissão"
```
- Torne o bot administrador (canais)
- Permita envio de mensagens (grupos)
- Verifique configurações de privacidade
```

### Nenhum chat encontrado:
```
- Envie uma mensagem no grupo com o bot
- Aguarde alguns minutos e tente novamente
- Verifique se o bot está ativo nos grupos
```

## 📊 Status dos Chats

### Tipos de Chat:
- 📢 **Canal**: Para divulgação pública
- 👥 **Supergrupo**: Grupos grandes com recursos avançados
- 👥 **Grupo**: Grupos normais

### Status do Bot:
- 👑 **Admin**: Bot é administrador (máximo controle)
- ✅ **Membro**: Bot é membro ativo
- ❌ **Saiu**: Bot foi removido do chat
- ⚠️ **Restrito**: Bot com permissões limitadas

## 🔒 Segurança

### ⚠️ Avisos Importantes:
1. **Token exposto**: O token fica visível no navegador
2. **Uso pessoal**: Recomendado apenas para uso pessoal/teste
3. **Produção**: Para uso em produção, implemente um backend

### Recomendações:
- Não compartilhe o token
- Use HTTPS em produção
- Monitore o uso do bot
- Configure webhooks se necessário

## 📈 Próximos Passos

### Funcionalidades Futuras:
- [ ] Webhook para receber mensagens
- [ ] Agendamento de envios
- [ ] Relatórios de entrega
- [ ] Integração com banco de dados
- [ ] Sistema de templates avançados

## 🆘 Suporte

### Se algo não funcionar:
1. Verifique o console do navegador (F12)
2. Confirme as permissões do bot
3. Teste com um grupo simples primeiro
4. Verifique se o bot está online

### Logs Úteis:
- ✅ Bot válido: [username]
- 📡 Updates recebidos: [número]
- 🔍 Verificando chats conhecidos
- ✅ Chat verificado: [título] Status: [status]
- 🎉 Chats encontrados: [número]
