/**
 * =========================================
 * ACI - Sistema de Monitoramento e Métricas
 * =========================================
 * 
 * Monitoramento completo de performance, erros e uso do sistema
 * Integração com logging, métricas e alertas
 */

import pino from 'pino';
// @ts-ignore
import LRU from 'lru-cache';

// ==========================================
// CONFIGURAÇÃO DO LOGGER
// ==========================================

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// ==========================================
// MÉTRICAS DE PERFORMANCE
// ==========================================

interface PerformanceMetric {
  timestamp: number;
  duration: number;
  endpoint: string;
  userId?: string;
  statusCode: number;
  dataSize?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private cache = new LRU<string, any>({ max: 1000 });
  private readonly MAX_METRICS = 10000;

  // Registrar métrica de performance
  recordEndpointPerformance(
    endpoint: string,
    duration: number,
    statusCode: number,
    userId?: string,
    dataSize?: number
  ) {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      duration,
      endpoint,
      userId,
      statusCode,
      dataSize,
    };

    this.metrics.push(metric);
    
    // Manter apenas últimas métricas
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Logar métricas lentas
    if (duration > 1000) {
      logger.warn({
        msg: 'Endpoint lento detectado',
        endpoint,
        duration: `${duration}ms`,
        statusCode,
        userId,
      });
    }
  }

  // Calcular estatísticas
  getEndpointStats(endpoint: string, hours: number = 24) {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      m => m.endpoint === endpoint && m.timestamp > cutoffTime
    );

    if (recentMetrics.length === 0) return null;

    const durations = recentMetrics.map(m => m.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    const errorRate = recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length;

    return {
      endpoint,
      totalRequests: recentMetrics.length,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      errorRate: (errorRate * 100).toFixed(2) + '%',
      periodHours: hours,
    };
  }

  // Obter métricas gerais
  getOverallStats(hours: number = 24) {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    if (recentMetrics.length === 0) return null;

    const endpoints = [...new Set(recentMetrics.map(m => m.endpoint))];
    
    return {
      totalRequests: recentMetrics.length,
      uniqueEndpoints: endpoints.length,
      avgResponseTime: Math.round(
        recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      ),
      errorRate: (
        (recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length) * 100
      ).toFixed(2) + '%',
      slowestEndpoints: endpoints
        .map(ep => ({
          endpoint: ep,
          avgTime: this.getEndpointStats(ep, hours)?.avgDuration || 0,
        }))
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 5),
    };
  }

  // Cache management
  setCache(key: string, value: any, ttl: number = 300000) {
    this.cache.set(key, value, { ttl });
  }

  getCache(key: string) {
    return this.cache.get(key);
  }

  clearCache() {
    this.cache.clear();
  }
}

// ==========================================
// MONITOR DE RECURSOS DO SISTEMA
// ==========================================

class SystemMonitor {
  private startTime = Date.now();

  getSystemInfo() {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      uptime: Math.floor(uptime),
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memory.external / 1024 / 1024) + ' MB',
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000) + ' ms',
        system: Math.round(cpuUsage.system / 1000) + ' ms',
      },
      platform: process.platform,
      nodeVersion: process.version,
    };
  }

  // Monitorar uso de recursos periodicamente
  startResourceMonitoring(intervalMs: number = 30000) {
    setInterval(() => {
      const systemInfo = this.getSystemInfo();
      
      logger.info({
        msg: 'Monitoramento de recursos do sistema',
        ...systemInfo,
      });

      // Alertar se uso de memória estiver alto
      const memoryMB = process.memoryUsage().heapUsed / 1024 / 1024;
      if (memoryMB > 500) {
        logger.warn({
          msg: 'Uso de memória alto',
          memoryUsed: `${Math.round(memoryMB)} MB`,
        });
      }
    }, intervalMs);
  }
}

// ==========================================
// MIDDLEWARE DE MONITORAMENTO PARA EXPRESS
// ==========================================

export function performanceMonitoringMiddleware(monitor: PerformanceMonitor) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const originalSend = res.send;

    // Override send para capturar tamanho da resposta
    res.send = function (body: any) {
      const duration = Date.now() - startTime;
      const dataSize = body ? Buffer.byteLength(JSON.stringify(body)) : 0;
      
      monitor.recordEndpointPerformance(
        req.path,
        duration,
        res.statusCode,
        req.user?.id,
        dataSize
      );

      return originalSend.call(this, body);
    };

    next();
  };
}

// ==========================================
// EXPORTS
// ==========================================

export const performanceMonitor = new PerformanceMonitor();
export const systemMonitor = new SystemMonitor();

// Logger principal
export { logger };

// Tipos auxiliares
export type { PerformanceMetric };

// Funções utilitárias
export const logError = (error: any, context?: string) => {
  logger.error({
    msg: context || 'Erro ocorrido',
    error: error.message || error,
    stack: error.stack,
  });
};

export const logInfo = (message: string, data?: any) => {
  logger.info({
    msg: message,
    ...data,
  });
};

export const logWarn = (message: string, data?: any) => {
  logger.warn({
    msg: message,
    ...data,
  });
};