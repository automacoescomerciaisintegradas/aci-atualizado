@echo off
REM =========================================
REM ACI - Script de Deploy para Windows
REM Executa deploy na VPS via SSH
REM =========================================

echo ==========================================
echo    ACI - Deploy Automatico para EasyPanel
echo ==========================================

set VPS_HOST=root@144.91.118.78
set DEPLOY_DIR=/opt/projects/aci-automacoes

REM 1. Commit e Push
echo.
echo [1/4] Fazendo commit e push...
git add -A
git commit -m "deploy: atualizacao automatica %date% %time%" 2>nul || echo    Nenhuma alteracao para commit
git push origin main

REM 2. Enviar arquivos atualizados
echo.
echo [2/4] Enviando arquivos para VPS...
scp -r src/backend/server.ts %VPS_HOST%:%DEPLOY_DIR%/src/backend/
scp Dockerfile docker-compose.yml package.json %VPS_HOST%:%DEPLOY_DIR%/

REM 3. Executar deploy na VPS
echo.
echo [3/4] Executando deploy na VPS...
ssh %VPS_HOST% "cd %DEPLOY_DIR% && docker-compose down && docker-compose build --no-cache && docker-compose up -d"

REM 4. Verificar status
echo.
echo [4/4] Verificando status...
ssh %VPS_HOST% "docker ps | grep aci-app"

echo.
echo ==========================================
echo    Deploy concluido com sucesso!
echo.
echo    Acesse: https://aci.automacoescomerciais.com.br
echo ==========================================

pause
