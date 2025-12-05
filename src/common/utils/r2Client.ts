import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuração do cliente R2 da Cloudflare
export const r2Client = new S3Client({
    region: "auto", // R2 usa "auto" como região
    endpoint: process.env.R2_ENDPOINT!, // ex: https://<account-id>.r2.cloudflarestorage.com
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET!;

/**
 * Fazer upload de um arquivo para o R2
 * @param key - Caminho/nome do arquivo no bucket (ex: "documentos/arquivo.pdf")
 * @param body - Conteúdo do arquivo (Buffer ou Stream)
 * @param contentType - MIME type do arquivo
 */
export async function uploadFile(key: string, body: Buffer | Uint8Array, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    await r2Client.send(command);
    return { key, bucket: BUCKET_NAME };
}

/**
 * Obter URL assinada para download (válida por tempo limitado)
 * @param key - Caminho do arquivo no bucket
 * @param expiresIn - Tempo de validade em segundos (padrão: 1 hora)
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Obter URL assinada para upload direto do cliente (browser)
 * @param key - Caminho onde o arquivo será salvo
 * @param contentType - MIME type do arquivo
 * @param expiresIn - Tempo de validade em segundos (padrão: 15 minutos)
 */
export async function getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 900
) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Deletar um arquivo do R2
 * @param key - Caminho do arquivo no bucket
 */
export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await r2Client.send(command);
    return { deleted: true, key };
}

/**
 * Baixar um arquivo do R2 como Buffer
 * @param key - Caminho do arquivo no bucket
 */
export async function downloadFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const response = await r2Client.send(command);
    const stream = response.Body as any;

    // Converter stream para buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}
