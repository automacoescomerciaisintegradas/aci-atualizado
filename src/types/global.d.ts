/// <reference types="@cloudflare/workers-types" />

/**
 * Tipos globais para Cloudflare Workers
 */

declare global {
    interface Env {
        DB: D1Database;
        STORAGE: R2Bucket;
        ENVIRONMENT: string;
    }
}

export { };
