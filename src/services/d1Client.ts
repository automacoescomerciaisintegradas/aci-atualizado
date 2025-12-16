/**
 * Cloudflare D1 Database Client
 * Substitui o Supabase pelo D1 da Cloudflare
 */

// Tipos para o D1
export interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run<T = unknown>(): Promise<D1Result<T>>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
    results?: T[];
    success: boolean;
    error?: string;
    meta: {
        duration: number;
        rows_read: number;
        rows_written: number;
    };
}

export interface D1ExecResult {
    count: number;
    duration: number;
}

// Ambiente local para desenvolvimento
let localDB: D1Database | null = null;

/**
 * Inicializa o cliente D1
 * Em produção, o DB vem do binding do Cloudflare Workers
 * Em desenvolvimento, usa um mock ou conexão local
 */
export function initD1(db?: D1Database): D1Database {
    if (db) {
        return db;
    }

    // Em desenvolvimento, retorna um mock ou erro
    if (!localDB) {
        console.warn('D1 Database não inicializado. Use initD1(db) com o binding do Workers.');
        // Aqui você poderia conectar com uma instância local do SQLite para dev
    }

    return localDB!;
}

/**
 * Helper para queries com melhor DX
 */
export class D1Client {
    constructor(private db: D1Database) { }

    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        const stmt = this.db.prepare(sql);
        const bound = params.length > 0 ? stmt.bind(...params) : stmt;
        const result = await bound.all<T>();

        if (!result.success) {
            throw new Error(result.error || 'Database query failed');
        }

        return result.results || [];
    }

    async execute(sql: string, params: any[] = []): Promise<D1Result> {
        const stmt = this.db.prepare(sql);
        const bound = params.length > 0 ? stmt.bind(...params) : stmt;
        return await bound.run();
    }

    async first<T = any>(sql: string, params: any[] = []): Promise<T | null> {
        const stmt = this.db.prepare(sql);
        const bound = params.length > 0 ? stmt.bind(...params) : stmt;
        return await bound.first<T>();
    }

    async batch(statements: Array<{ sql: string; params?: any[] }>): Promise<D1Result[]> {
        const preparedStatements = statements.map(({ sql, params = [] }) => {
            const stmt = this.db.prepare(sql);
            return params.length > 0 ? stmt.bind(...params) : stmt;
        });

        return await this.db.batch(preparedStatements);
    }
}

// Singleton para uso global (opcional)
let globalClient: D1Client | null = null;

export function getD1Client(db?: D1Database): D1Client {
    if (db) {
        globalClient = new D1Client(db);
    }

    if (!globalClient) {
        throw new Error('D1 Client não inicializado. Chame getD1Client(db) primeiro.');
    }

    return globalClient;
}
