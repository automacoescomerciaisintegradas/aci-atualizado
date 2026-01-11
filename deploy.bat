@echo off
REM =========================================
REM ACI - Script de Deploy para Windows
REM VPS: root@144.91.118.78
REM =========================================

setlocal enabledelayedexpansion

echo ==========================================
echo    ACI - Deploy Automatico EasyPanel
echo ==========================================
echo.

REM Configuracoes
set VPS_HOST=144.91.118.78
set VPS_USER=root
set APP_NAME=aci-automacoes
set DOCKER_IMAGE=aci-automacoes:latest

REM 1. Ir para o diretorio do projeto
cd /d "%~dp0"
echo [INFO] Diretorio: %CD%
echo.

REM 2. Verificar alteracoes Git
echo [1/5] Verificando alteracoes Git...
git status -s > temp_status.txt
set /p GIT_STATUS=<temp_status.txt
del temp_status.txt

if not "%GIT_STATUS%"=="" (
    echo [INFO] Alteracoes encontradas. Fazendo commit...
    git add .
    
    set /p COMMIT_MSG="Mensagem do commit: "
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=Deploy: %date% %time%
    
    git commit -m "!COMMIT_MSG!"
    echo [OK] Commit realizado!
) else (
    echo [INFO] Nenhuma alteracao para commit.
)
echo.

REM 3. Push para repositorio
echo [2/5] Push para repositorio remoto...
git push origin main 2>nul || git push origin master 2>nul || echo [AVISO] Push falhou ou nao ha remote
echo.

REM 4. Build Docker (opcional)
echo [3/5] Build Docker...
set /p BUILD_LOCAL="Fazer build Docker local? (s/n): "
if /i "%BUILD_LOCAL%"=="s" (
    docker build -t %DOCKER_IMAGE% .
    echo [OK] Imagem Docker construida!
)
echo.

REM 5. Deploy na VPS
echo [4/5] Deploy na VPS...
set /p DEPLOY_VPS="Fazer deploy na VPS (%VPS_USER%@%VPS_HOST%)? (s/n): "
if /i "%DEPLOY_VPS%"=="s" (
    echo [INFO] Conectando a VPS...
    
    ssh %VPS_USER%@%VPS_HOST% "cd /opt/easypanel/projects/aci-automacoes && git pull && docker-compose down && docker-compose build --no-cache && docker-compose up -d && docker ps | grep aci"
    
    echo [OK] Deploy na VPS concluido!
)
echo.

REM 6. Resumo
echo ==========================================
echo    Deploy Concluido!
echo ==========================================
echo.
echo Acesse: https://aci.automacoescomerciais.com.br
echo.
echo Para verificar logs:
echo   ssh %VPS_USER%@%VPS_HOST% "docker logs -f aci-app"
echo.

pause
