/**
 * =========================================
 * ACI - Serviço de API Otimizado
 * =========================================
 * 
 * Serviço otimizado para endpoints da API com:
 * - Rate limiting
 * - Caching inteligente
 * - Compressão de resposta
 * - Tratamento de erros robusto
 * - Monitoramento de performance
 */

import { Request, Response, NextFunction } from 'express';
import { logger, performanceMonitor } from './monitoringService';
import { cacheManager } from './cacheService';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ApiOptions {
  cache?: boolean;
  cacheTTL?: number;
  rateLimit?: RateLimitConfig;
  compress?: boolean;
}

// ==========================================
// SERVIÇO DE API OTIMIZADO
// ==========================================

class OptimizedApiService {
  private rateLimits = new Map<string, { requests: number; resetTime: number }>();

  // ==========================================
  // MIDDLEWARES DE OTIMIZAÇÃO
  // ==========================================

  /**
   * Rate limiting por IP
   */
  rateLimit(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `${clientId}:${req.path}`;
      const now = Date.now();

      if (!this.rateLimits.has(key)) {
        this.rateLimits.set(key, {
          requests: 0,
          resetTime: now + config.windowMs
        });
      }

      const limitInfo = this.rateLimits.get(key)!;

      // Reset contador se janela expirou
      if (now > limitInfo.resetTime) {
        limitInfo.requests = 0;
        limitInfo.resetTime = now + config.windowMs;
      }

      limitInfo.requests++;

      // Verificar limite
      if (limitInfo.requests > config.maxRequests) {
        logger.warn(`Rate limit exceeded for ${key}`);
        return res.status(429).json({
          success: false,
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((limitInfo.resetTime - now) / 1000)
        });
      }

      // Adicionar headers de rate limit
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config.maxRequests - limitInfo.requests);
      res.setHeader('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime / 1000));

      next();
    };
  }

  /**
   * Caching de respostas
   */
  cacheResponse(ttl: number = 300000) {
    return (req: Request, res: Response, next: NextFunction) => {
      const cacheKey = `api:${req.method}:${req.path}:${JSON.stringify(req.query)}`;
      
      // Tentar cache primeiro
      const cached = cacheManager.getCache(cacheKey);
      if (cached) {
        logger.debug(`Cache HIT for ${cacheKey}`);
        return res.json(cached);
      }

      // Override send para cachear resposta
      const originalSend = res.send;
      res.send = function(body: any) {
        try {
          const data = typeof body === 'string' ? JSON.parse(body) : body;
          if (data.success !== false) {
            cacheManager.setCache(cacheKey, data, ttl);
            logger.debug(`Cached response for ${cacheKey}`);
          }
        } catch (error) {
          logger.error('Error caching response:', error);
        }
        return originalSend.call(this, body);
      };

      next();
    };
  }

  /**
   * Compressão de resposta
   */
  compressResponse() {
    return (req: Request, res: Response, next: NextFunction) => {
      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      if (acceptEncoding.includes('gzip')) {
        res.setHeader('Content-Encoding', 'gzip');
        // TODO: Implementar compressão real com zlib
      }
      
      next();
    };
  }

  /**
   * Adicionar headers de segurança e performance
   */
  securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Segurança
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Performance
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      // CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      next();
    };
  }

  // ==========================================
  // HANDLERS OTIMIZADOS
  // ==========================================

  /**
   * Handler wrapper com monitoramento
   */
  asyncHandler<T>(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<T>,
    options: ApiOptions = {}
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      try {
        // Aplicar middlewares opcionais
        if (options.rateLimit) {
          const rateLimitMiddleware = this.rateLimit(options.rateLimit);
          await new Promise((resolve, reject) => {
            rateLimitMiddleware(req, res, (err) => {
              if (err) reject(err);
              else resolve(undefined);
            });
          });
        }

        if (options.cache) {
          const cacheMiddleware = this.cacheResponse(options.cacheTTL);
          await new Promise((resolve, reject) => {
            cacheMiddleware(req, res, (err) => {
              if (err) reject(err);
              else resolve(undefined);
            });
          });
        }

        // Executar handler principal
        const result = await handler(req, res, next);

        // Monitorar performance
        const duration = Date.now() - startTime;
        performanceMonitor.recordEndpointPerformance(
          req.path,
          duration,
          res.statusCode,
          (req as any).user?.id
        );

        return result;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        logger.error(`API Error [${requestId}]:`, error);
        
        // Monitorar erro
        performanceMonitor.recordEndpointPerformance(
          req.path,
          duration,
          500,
          (req as any).user?.id
        );

        return this.handleError(res, error, requestId);
      }
    };
  }

  /**
   * Handler para dados paginados
   */
  async paginatedHandler<T>(
    getData: (offset: number, limit: number) => Promise<{ data: T[]; totalCount: number }>,
    req: Request,
    res: Response
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;

      const { data, totalCount } = await getData(offset, limit);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return this.sendSuccess(res, data, {
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext,
          hasPrev
        }
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // ==========================================
  // RESPOSTAS PADRONIZADAS
  // ==========================================

  /**
   * Resposta de sucesso
   */
  sendSuccess<T>(
    res: Response, 
    data: T, 
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      ...meta
    };

    return res.status(200).json(response);
  }

  /**
   * Resposta de erro
   */
  sendError(
    res: Response,
    error: string | Error,
    statusCode: number = 400,
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: typeof error === 'string' ? error : error.message,
      timestamp: new Date().toISOString(),
      requestId
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Resposta de validação
   */
  sendValidationError(
    res: Response,
    errors: Record<string, string>
  ): Response {
    return this.sendError(
      res,
      'Validation failed',
      400,
      undefined
    ).json({
      validationErrors: errors
    });
  }

  /**
   * Tratamento de erro centralizado
   */
  private handleError(
    res: Response,
    error: any,
    requestId?: string
  ): Response {
    // Erros conhecidos
    if (error.name === 'ValidationError') {
      return this.sendValidationError(res, error.errors);
    }

    if (error.name === 'UnauthorizedError') {
      return this.sendError(res, 'Unauthorized', 401, requestId);
    }

    if (error.name === 'NotFoundError') {
      return this.sendError(res, 'Not found', 404, requestId);
    }

    // Erro genérico
    logger.error('Unhandled API error:', error);
    return this.sendError(res, 'Internal server error', 500, requestId);
  }

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  /**
   * Gerar ID único para request
   */
  private generateRequestId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Validar parâmetros de query
   */
  validateQuery(req: Request, schema: Record<string, (value: any) => boolean>): Record<string, string> | null {
    const errors: Record<string, string> = {};

    for (const [key, validator] of Object.entries(schema)) {
      const value = req.query[key];
      if (!validator(value)) {
        errors[key] = `Invalid value for ${key}`;
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Validar corpo da requisição
   */
  validateBody(req: Request, schema: Record<string, (value: any) => boolean>): Record<string, string> | null {
    const errors: Record<string, string> = {};

    for (const [key, validator] of Object.entries(schema)) {
      const value = req.body[key];
      if (!validator(value)) {
        errors[key] = `Invalid value for ${key}`;
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Middleware para validar parâmetros
   */
  validateParams(validators: Record<string, (value: any) => boolean>) {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors = this.validateQuery(req, validators);
      if (errors) {
        return this.sendValidationError(res, errors);
      }
      next();
    };
  }
}

// Exportar instância singleton
export const apiService = new OptimizedApiService();

// Exportar tipos auxiliares
export type { ApiResponse, ApiOptions, RateLimitConfig };

export default apiService;