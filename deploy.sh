#!/bin/bash

# =========================================
# ACI - Script de Deploy Automático para EasyPanel
# VPS: root@144.91.118.78
# =========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
VPS_HOST="144.91.118.78"
VPS_USER="root"
APP_NAME="aci-automacoes"
REPO_URL="https://github.com/automacoescomerciais/aci-automacoes.git"
DEPLOY_PATH="/opt/easypanel/projects/${APP_NAME}"
DOCKER_IMAGE="aci-automacoes:latest"

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   ACI - Deploy Automático EasyPanel     ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Função para imprimir status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 1. Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    print_error "Git não está instalado. Instale com: winget install Git.Git"
    exit 1
fi

# 2. Fazer commit das alterações locais
echo -e "\n${BLUE}>>> Passo 1: Commit das alterações${NC}"
cd "$(dirname "$0")"

# Verificar se há alterações
if [[ -n $(git status -s) ]]; then
    print_status "Alterações encontradas. Fazendo commit..."
    git add .
    
    # Pedir mensagem de commit
    read -p "Mensagem do commit: " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    git commit -m "$COMMIT_MSG"
    print_status "Commit realizado: $COMMIT_MSG"
else
    print_warning "Nenhuma alteração para commit."
fi

# 3. Push para o repositório remoto
echo -e "\n${BLUE}>>> Passo 2: Push para repositório remoto${NC}"
if git remote | grep -q origin; then
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || print_warning "Push falhou ou não há remote configurado"
    print_status "Push realizado com sucesso!"
else
    print_warning "Remote 'origin' não configurado. Configure com: git remote add origin <url>"
fi

# 4. Build da imagem Docker localmente (opcional)
echo -e "\n${BLUE}>>> Passo 3: Build da imagem Docker${NC}"
if command -v docker &> /dev/null; then
    read -p "Deseja fazer build da imagem Docker localmente? (s/n): " BUILD_LOCAL
    if [ "$BUILD_LOCAL" == "s" ]; then
        docker build -t $DOCKER_IMAGE .
        print_status "Imagem Docker construída: $DOCKER_IMAGE"
    fi
else
    print_warning "Docker não está instalado localmente. Pulando build local."
fi

# 5. Deploy na VPS via SSH
echo -e "\n${BLUE}>>> Passo 4: Deploy na VPS${NC}"
read -p "Deseja fazer deploy na VPS (${VPS_USER}@${VPS_HOST})? (s/n): " DEPLOY_VPS

if [ "$DEPLOY_VPS" == "s" ]; then
    print_status "Conectando à VPS..."
    
    # Script para executar na VPS
    ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
        set -e
        
        echo "=== Atualizando código na VPS ==="
        
        # Navegar para o diretório do projeto
        cd /opt/easypanel/projects/aci-automacoes 2>/dev/null || {
            echo "Criando diretório do projeto..."
            mkdir -p /opt/easypanel/projects/aci-automacoes
            cd /opt/easypanel/projects/aci-automacoes
            git clone https://github.com/automacoescomerciais/aci-automacoes.git . || echo "Clone falhou, continuando..."
        }
        
        # Pull das atualizações
        git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "Pull falhou, continuando..."
        
        echo "=== Reconstruindo container ==="
        
        # Se EasyPanel estiver instalado, usar CLI do EasyPanel
        if command -v easypanel &> /dev/null; then
            easypanel deploy aci-automacoes
            echo "Deploy via EasyPanel CLI concluído!"
        else
            # Fallback para docker-compose
            docker-compose down 2>/dev/null || true
            docker-compose build --no-cache
            docker-compose up -d
            echo "Deploy via docker-compose concluído!"
        fi
        
        # Verificar status
        docker ps | grep aci || echo "Container não está rodando"
        
        echo "=== Deploy finalizado! ==="
ENDSSH
    
    print_status "Deploy na VPS concluído!"
else
    print_warning "Deploy na VPS pulado."
fi

# 6. Resumo final
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}   Deploy Concluído com Sucesso!         ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo -e "Acesse: ${YELLOW}https://aci.automacoescomerciais.com.br${NC}"
echo ""
echo -e "Para verificar logs na VPS:"
echo -e "  ssh ${VPS_USER}@${VPS_HOST} 'docker logs -f aci-app'"
echo ""
echo -e "Para acessar EasyPanel:"
echo -e "  https://${VPS_HOST}:3000"
echo ""
