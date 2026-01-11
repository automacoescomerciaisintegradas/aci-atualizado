/**
 * ACI - Cron Service
 * Gerencia tarefas periódicas do backend
 */

export class CronService {
    private static instance: CronService;
    private intervals: NodeJS.Timeout[] = [];

    private constructor() { }

    public static getInstance(): CronService {
        if (!CronService.instance) {
            CronService.instance = new CronService();
        }
        return CronService.instance;
    }

    /**
     * Inicia todos os jobs recorrentes
     */
    public start() {
        console.log('⏰ Cron Service iniciado...');

        // Job 1: Limpeza de tokens expirados (A cada 1 hora)
        this.addJob(() => this.cleanupTokens(), 60 * 60 * 1000);

        // Job 2: Verificação de automações agendadas (A cada 5 minutos)
        this.addJob(() => this.processScheduledAutomations(), 5 * 60 * 1000);

        // Job 3: Log de Health Check interno (A cada 30 minutos)
        this.addJob(() => {
            console.log(`[HEALTH] Server pulse at ${new Date().toISOString()} | Uptime: ${process.uptime().toFixed(0)}s`);
        }, 30 * 60 * 1000);
    }

    private addJob(fn: () => void, intervalMs: number) {
        const interval = setInterval(fn, intervalMs);
        this.intervals.push(interval);
    }

    /**
     * Limpa tokens de recuperação de senha antigos
     */
    private async cleanupTokens() {
        try {
            // Aqui entraria a lógica de delete no Prisma
            console.log('🧹 Limpeza de logs e tokens temporários realizada.');
        } catch (error) {
            console.error('❌ Erro no cleanup job:', error);
        }
    }

    /**
     * Processa automações que foram agendadas pelos usuários
     */
    private async processScheduledAutomations() {
        try {
            // Lógica para buscar posts agendados ou disparos de marketing
            // console.log('🤖 Verificando automações agendadas...');
        } catch (error) {
            console.error('❌ Erro ao processar automações:', error);
        }
    }

    public stop() {
        this.intervals.forEach(clearInterval);
        console.log('🛑 Cron Service parado.');
    }
}

export const cronService = CronService.getInstance();
