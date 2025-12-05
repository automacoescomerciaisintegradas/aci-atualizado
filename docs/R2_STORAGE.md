# 📦 Configuração do Cloudflare R2 no ACI

Este documento explica como configurar e usar o **Cloudflare R2** (storage compatível com S3) no projeto ACI v2.0.

## 🚀 O que foi implementado

1. **Cliente R2** (`src/common/utils/r2Client.ts`)
   - Upload de arquivos
   - Download de arquivos
   - Geração de URLs assinadas (presigned URLs)
   - Deleção de arquivos

2. **API de Upload** (`src/api/storage/upload.controller.ts`)
   - `POST /upload` - Upload de arquivos (multipart/form-data)
   - `GET /upload/download/*` - Obter URL de download assinada
   - `DELETE /upload/delete/*` - Deletar arquivo

3. **Variáveis de ambiente** (`.env.example`)
   - `R2_ENDPOINT` - Endpoint do R2
   - `R2_ACCESS_KEY_ID` - Access Key ID
   - `R2_SECRET_ACCESS_KEY` - Secret Access Key
   - `R2_BUCKET` - Nome do bucket

## 📝 Como configurar

### 1. Criar bucket no Cloudflare R2

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **R2** no menu lateral
3. Clique em **Create bucket**
4. Escolha um nome (ex: `aci-files`)
5. Copie o **Endpoint URL** (formato: `https://<account-id>.r2.cloudflarestorage.com`)

### 2. Gerar chaves de API

1. No R2, vá em **Manage R2 API Tokens**
2. Clique em **Create API Token**
3. Escolha as permissões:
   - **Object Read & Write** (para upload/download)
   - **Bucket Read** (opcional, para listar buckets)
4. Copie o **Access Key ID** e **Secret Access Key**

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha:

```dotenv
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=sua-access-key-id
R2_SECRET_ACCESS_KEY=sua-secret-access-key
R2_BUCKET=aci-files
```

## 🔧 Como usar

### Upload de arquivo (Frontend)

```typescript
const formData = new FormData();
formData.append('file', file); // file é um objeto File do input

const response = await fetch('http://localhost:4000/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`, // Se tiver autenticação
  },
  body: formData,
});

const result = await response.json();
console.log(result.fileKey); // ex: "uploads/user123/abc123.pdf"
```

### Obter URL de download

```typescript
const fileKey = 'uploads/user123/abc123.pdf';
const response = await fetch(`http://localhost:4000/upload/download/${fileKey}`);
const { url } = await response.json();

// Usar a URL (válida por 1 hora)
window.open(url, '_blank');
```

### Deletar arquivo

```typescript
const fileKey = 'uploads/user123/abc123.pdf';
await fetch(`http://localhost:4000/upload/delete/${fileKey}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Usar diretamente no código (Backend)

```typescript
import { uploadFile, downloadFile, getSignedDownloadUrl } from './common/utils/r2Client';

// Upload
await uploadFile('path/to/file.pdf', buffer, 'application/pdf');

// Download
const buffer = await downloadFile('path/to/file.pdf');

// URL assinada
const url = await getSignedDownloadUrl('path/to/file.pdf', 3600); // 1 hora
```

## 🔒 Segurança

- As URLs assinadas expiram após o tempo configurado (padrão: 1 hora).
- O bucket pode ser configurado como **privado** no Cloudflare (recomendado).
- Adicione middleware de autenticação nas rotas de upload/delete.
- Valide o tipo MIME e tamanho dos arquivos antes do upload.

## 📊 Limites

- **Tamanho máximo por arquivo:** 100MB (configurado no multer)
- **Armazenamento gratuito no R2:** 10GB/mês (Free Tier Cloudflare)
- **Operações gratuitas:** 1 milhão de operações de Classe A (escrita) e 10 milhões de Classe B (leitura) por mês

## 🛠 Troubleshooting

### Erro: "Access Denied"
- Verifique se as chaves `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY` estão corretas
- Confirme que o token tem permissões de leitura/escrita no bucket

### Erro: "Bucket not found"
- Verifique se o nome do bucket em `R2_BUCKET` está correto
- Confirme se o bucket foi criado na mesma conta do Cloudflare

### Erro: "Region not supported"
- Use `region: "auto"` no cliente S3 (já configurado)

## 🔗 Links úteis

- [Documentação oficial do R2](https://developers.cloudflare.com/r2/)
- [AWS SDK para JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Comparação R2 vs S3](https://developers.cloudflare.com/r2/reference/s3-compatibility/)
