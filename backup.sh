#!/bin/bash

# =========================================
# ACI - Script de Backup de Banco de Dados
# =========================================

APP_DIR="/opt/projects/aci-automacoes"
BACKUP_DIR="/opt/backups/aci"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAX_BACKUPS=7

mkdir -p $BACKUP_DIR

echo "[$(date)] Iniciando backup do banco de dados..."

# O container usa o volume aci-data montado em /app/data
# O docker-compose mapeia volumes nomeados. 
# Podemos pegar o arquivo direto no diretório de volumes do Docker ou rodar um comando no container.

# Melhor forma: Usar o docker exec para garantir consistência
docker exec aci-app sqlite3 /app/prisma/dev.db ".backup '/app/data/backup_temp.sqlite'" 2>/dev/null || \
docker exec aci-app cp /app/prisma/dev.db /app/data/backup_temp.sqlite

# Mover do volume para a pasta de backups da VPS
mv /var/lib/docker/volumes/aci-automacoes_aci-data/_data/backup_temp.sqlite "$BACKUP_DIR/aci_db_$TIMESTAMP.sqlite" 2>/dev/null || \
cp "$(docker inspect -f '{{ .Mounts }}' aci-app | grep -oE '/var/lib/docker/volumes/[^ ]+/_data' | head -1)/dev.db" "$BACKUP_DIR/aci_db_$TIMESTAMP.sqlite"

# Backup do .env local
cp "$APP_DIR/.env" "$BACKUP_DIR/aci_settings_$TIMESTAMP.env"

# Limpeza
find $BACKUP_DIR -name "aci_db_*.sqlite" -type f -mtime +$MAX_BACKUPS -delete
find $BACKUP_DIR -name "aci_settings_*.env" -type f -mtime +$MAX_BACKUPS -delete

echo "[$(date)] Backup concluído com sucesso!"
