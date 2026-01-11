# =========================================
# ACI - Automações Comerciais Integradas
# Dockerfile Multi-stage para produção
# =========================================

# Stage 1: Build do Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build do frontend (Vite)
RUN npm run build

# =========================================
# Stage 2: Build do Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build do backend (TypeScript)
RUN npm run build:server 2>/dev/null || echo "Backend build skipped"

# =========================================
# Stage 3: Imagem Final de Produção
FROM node:20-alpine AS production

WORKDIR /app

# Instalar apenas dependências necessárias para o sistema
RUN apk add --no-cache curl

# Copiar package files e instalar apenas produção
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copiar build do frontend
COPY --from=frontend-builder /app/dist ./dist

# Copiar arquivos do backend
COPY --from=backend-builder /app/src ./src
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar prisma schema
COPY prisma ./prisma

# Copiar outros arquivos necessários
COPY tsconfig.json ./

# Expor portas
EXPOSE 4001
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=4001
ENV FRONTEND_URL=http://localhost:3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/api/health || exit 1

# Comando para iniciar
CMD ["npm", "run", "start:prod"]
