# =========================================
# ACI - Automações Comerciais Integradas
# Dockerfile Multi-stage para produção
# =========================================

# Stage 1: Build do Frontend
FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build do frontend (Vite)
RUN npm run build

# O backend será executado via tsx diretamente dos fontes em src
# para evitar problemas de compatibilidade de módulos ESM

# =========================================
# Stage 2: Build do Backend & Instalação
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate
# Compilar TypeScript para JavaScript
RUN npm run build:server

# =========================================
# Stage 3: Imagem Final de Produção
FROM node:20-bookworm-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

# Copiar dependências de produção
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Copiar build do frontend
COPY --from=frontend-builder /app/dist ./dist

# Copiar build do backend e prisma
COPY --from=backend-builder /app/dist-server ./dist-server
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Expor portas
EXPOSE 4001
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=4001
ENV FRONTEND_URL=http://localhost:3000

# Health check (Ajustado para maior tolerância)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

# Comando para iniciar (Node.js puro - Rápido e Leve)
CMD ["node", "dist-server/backend/server.js"]
