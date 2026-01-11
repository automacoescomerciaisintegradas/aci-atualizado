#!/bin/bash

# =========================================
# ACI - Script de Deploy Automático para EasyPanel
# Autor: Automações Comerciais Integradas
# =========================================

set -e

# Configurações
APP_NAME="aci-app"
PROJECT_NAME="aci"
REPO_URL="https://github.com/automacoescomerciaisintegradas/aci-atualizado.git"
DEPLOY_DIR="/opt/projects/aci-automacoes"
DOMAIN="aci.automacoescomerciais.com.br"

echo "=========================================="
echo "🚀 ACI - Deploy Automático para EasyPanel"
echo "=========================================="

# 1. Atualizar código do repositório
echo ""
echo "📥 [1/5] Atualizando código do repositório..."
if [ -d "$DEPLOY_DIR" ]; then
    cd $DEPLOY_DIR
    git fetch origin
    git reset --hard origin/main
else
    git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# 2. Parar container existente
echo ""
echo "🛑 [2/5] Parando container existente..."
docker-compose down 2>/dev/null || true
docker rm -f $APP_NAME 2>/dev/null || true

# 3. Build da imagem
echo ""
echo "🔨 [3/5] Construindo imagem Docker..."
docker-compose build --no-cache

# 4. Subir container
echo ""
echo "🚀 [4/5] Iniciando container..."
docker-compose up -d

# 5. Verificar status
echo ""
echo "✅ [5/5] Verificando status..."
sleep 5
docker ps | grep $APP_NAME

echo ""
echo "=========================================="
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📊 Informações do Deploy:"
echo "   - App: $APP_NAME"
echo "   - Domínio: https://$DOMAIN"
echo "   - API: https://$DOMAIN/api"
echo "   - Health: https://$DOMAIN/health"
echo ""
echo "📋 Comandos úteis:"
echo "   - Ver logs: docker logs -f $APP_NAME"
echo "   - Reiniciar: docker restart $APP_NAME"
echo "   - Parar: docker-compose down"
echo "=========================================="
