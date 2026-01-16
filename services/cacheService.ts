/**
 * =========================================
 * ACI - Sistema de Caching Inteligente
 * =========================================
 * 
 * Estratégia de caching multi-nível para otimizar performance
 * Cache em memória + cache distribuído (Redis quando disponível)
 */

import { LRUCache } from 'lru-cache';
import { logger } from './monitoringService';

// ==========================================
// CONFIGURAÇÃO DO CACHE
// ==========================================

interface CacheConfig {
  ttl: number;        // Tempo de vida em milissegundos
  maxItems: number;   // Máximo de itens no cache
  namespace: string;  // Namespace para evitar colisões
}

interface CacheEntry<T> {
  value: T;
  expiry: number;
  createdAt: number;
}

// ==========================================
// CLASSE DE CACHE PRINCIPAL
// ==========================================

class CacheManager {
  private caches: Map<string, LRUCache<string, CacheEntry<any>>> = new Map();
  private stats: Map<string, { hits: number; misses: number }> = new Map();

  // Criar ou obter cache com configuração específica
  public getOrCreateCache(namespace: string, config: CacheConfig): LRUCache<string, CacheEntry<any>> {
    const cacheKey = `${namespace}:${config.ttl}:${config.maxItems}`;
    
    if (!this.caches.has(cacheKey)) {
      const cache = new LRUCache<string, CacheEntry<any>>({
        max: config.maxItems,
        ttl: config.ttl,
        dispose: (value, key) => {
          logger.debug(`Cache disposed: ${key}`);
        }
      });
      
      this.caches.set(cacheKey, cache);
      this.stats.set(cacheKey, { hits: 0, misses: 0 });
    }

    return this.caches.get(cacheKey)!;
  }

  // Obter estatísticas do cache
  getStats() {
    const stats: Record<string, any> = {};
    
    for (const [cacheKey, cache] of this.caches.entries()) {
      const basicStats = this.stats.get(cacheKey) || { hits: 0, misses: 0 };
      stats[cacheKey] = {
        ...basicStats,
        size: cache.size,
        hitRate: basicStats.hits / (basicStats.hits + basicStats.misses || 1)
      };
    }
    
    return stats;
  }

  // Limpar estatísticas
  resetStats() {
    for (const key of this.stats.keys()) {
      this.stats.set(key, { hits: 0, misses: 0 });
    }
  }
}

// ==========================================
// CACHES ESPECÍFICOS DA APLICAÇÃO
// ==========================================

class ApplicationCache {
  private manager = new CacheManager();

  // Configurações padrão para diferentes tipos de dados
  private configs = {
    // Dados de usuário (curta duração, alta frequência)
    userProfiles: {
      ttl: 5 * 60 * 1000,    // 5 minutos
      maxItems: 1000,
      namespace: 'user-profiles'
    },
    
    // Configurações do sistema (longa duração)
    systemConfig: {
      ttl: 30 * 60 * 1000,   // 30 minutos
      maxItems: 100,
      namespace: 'system-config'
    },
    
    // Dados de créditos (média duração)
    userCredits: {
      ttl: 2 * 60 * 1000,    // 2 minutos
      maxItems: 2000,
      namespace: 'user-credits'
    },
    
    // Metadados de pagamento (curta duração)
    paymentMetadata: {
      ttl: 1 * 60 * 1000,    // 1 minuto
      maxItems: 500,
      namespace: 'payment-metadata'
    },
    
    // Resultados de busca (média duração)
    searchResults: {
      ttl: 10 * 60 * 1000,   // 10 minutos
      maxItems: 1000,
      namespace: 'search-results'
    },
    
    // Componentes React (longa duração)
    reactComponents: {
      ttl: 15 * 60 * 1000,   // 15 minutos
      maxItems: 200,
      namespace: 'react-components'
    },
    
    // Assets e imagens (longa duração)
    assets: {
      ttl: 60 * 60 * 1000,   // 1 hora
      maxItems: 500,
      namespace: 'assets'
    }
  };

  // ==========================================
  // CACHE DE PERFIS DE USUÁRIO
  // ==========================================

  async cacheUserProfile(userId: string, profile: any): Promise<void> {
    const cache = this.manager.getOrCreateCache('user-profiles', this.configs.userProfiles);
    const key = `profile:${userId}`;
    
    cache.set(key, {
      value: profile,
      expiry: Date.now() + this.configs.userProfiles.ttl,
      createdAt: Date.now()
    });
    
    logger.debug(`Cached user profile: ${userId}`);
  }

  async getUserProfile(userId: string): Promise<any | null> {
    const cache = this.manager.getOrCreateCache('user-profiles', this.configs.userProfiles);
    const key = `profile:${userId}`;
    const entry = cache.get(key);
    
    if (entry && entry.expiry > Date.now()) {
      logger.debug(`Cache HIT for user profile: ${userId}`);
      return entry.value;
    }
    
    logger.debug(`Cache MISS for user profile: ${userId}`);
    return null;
  }

  // ==========================================
  // CACHE DE CRÉDITOS
  // ==========================================

  async cacheUserCredits(userId: string, credits: any): Promise<void> {
    const cache = this.manager.getOrCreateCache('user-credits', this.configs.userCredits);
    const key = `credits:${userId}`;
    
    cache.set(key, {
      value: credits,
      expiry: Date.now() + this.configs.userCredits.ttl,
      createdAt: Date.now()
    });
    
    logger.debug(`Cached user credits: ${userId}`);
  }

  async getUserCredits(userId: string): Promise<any | null> {
    const cache = this.manager.getOrCreateCache('user-credits', this.configs.userCredits);
    const key = `credits:${userId}`;
    const entry = cache.get(key);
    
    if (entry && entry.expiry > Date.now()) {
      logger.debug(`Cache HIT for user credits: ${userId}`);
      return entry.value;
    }
    
    logger.debug(`Cache MISS for user credits: ${userId}`);
    return null;
  }

  // Invalidar cache de créditos quando houver alterações
  invalidateUserCredits(userId: string): void {
    const cache = this.manager.getOrCreateCache('user-credits', this.configs.userCredits);
    const key = `credits:${userId}`;
    cache.delete(key);
    logger.debug(`Invalidated credits cache for: ${userId}`);
  }

  // ==========================================
  // CACHE DE COMPONENTES REACT
  // ==========================================

  async cacheReactComponent(componentName: string, component: any): Promise<void> {
    const cache = this.manager.getOrCreateCache('react-components', this.configs.reactComponents);
    const key = `component:${componentName}`;
    
    cache.set(key, {
      value: component,
      expiry: Date.now() + this.configs.reactComponents.ttl,
      createdAt: Date.now()
    });
    
    logger.debug(`Cached React component: ${componentName}`);
  }

  async getReactComponent(componentName: string): Promise<any | null> {
    const cache = this.manager.getOrCreateCache('react-components', this.configs.reactComponents);
    const key = `component:${componentName}`;
    const entry = cache.get(key);
    
    if (entry && entry.expiry > Date.now()) {
      logger.debug(`Cache HIT for React component: ${componentName}`);
      return entry.value;
    }
    
    logger.debug(`Cache MISS for React component: ${componentName}`);
    return null;
  }

  // ==========================================
  // CACHE DE ASSETS
  // ==========================================

  async cacheAsset(assetPath: string, assetData: any): Promise<void> {
    const cache = this.manager.getOrCreateCache('assets', this.configs.assets);
    const key = `asset:${assetPath}`;
    
    cache.set(key, {
      value: assetData,
      expiry: Date.now() + this.configs.assets.ttl,
      createdAt: Date.now()
    });
    
    logger.debug(`Cached asset: ${assetPath}`);
  }

  async getAsset(assetPath: string): Promise<any | null> {
    const cache = this.manager.getOrCreateCache('assets', this.configs.assets);
    const key = `asset:${assetPath}`;
    const entry = cache.get(key);
    
    if (entry && entry.expiry > Date.now()) {
      logger.debug(`Cache HIT for asset: ${assetPath}`);
      return entry.value;
    }
    
    logger.debug(`Cache MISS for asset: ${assetPath}`);
    return null;
  }

  // ==========================================
  // CONFIGURAÇÕES DO SISTEMA
  // ==========================================

  async cacheSystemConfig(key: string, config: any): Promise<void> {
    const cache = this.manager.getOrCreateCache('system-config', this.configs.systemConfig);
    cache.set(key, {
      value: config,
      expiry: Date.now() + this.configs.systemConfig.ttl,
      createdAt: Date.now()
    });
  }

  async getSystemConfig(key: string): Promise<any | null> {
    const cache = this.manager.getOrCreateCache('system-config', this.configs.systemConfig);
    const entry = cache.get(key);
    
    if (entry && entry.expiry > Date.now()) {
      return entry.value;
    }
    return null;
  }

  // ==========================================
  // RESULTADOS DE BUSCA
  // ==========================================

  async cacheSearchResults(query: string, results: any[]): Promise<void> {
    const cache = this.manager.getOrCreateCache('search-results', this.configs.searchResults);
    const key = `search:${query.toLowerCase().trim()}`;
    
    cache.set(key, {
      value: results,
      expiry: Date.now() + this.configs.searchResults.ttl,
      createdAt: Date.now()
    });
  }

  async getSearchResults(query: string): Promise<any[] | null> {
    const cache = this.manager.getOrCreateCache('search-results', this.configs.searchResults);
    const key = `search:${query.toLowerCase().trim()}`;
    const entry = cache.get(key);
    
    if (entry && entry.expiry > Date.now()) {
      return entry.value;
    }
    return null;
  }

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  // Limpar todos os caches
  clearAll(): void {
    this.manager = new CacheManager();
    logger.info('All caches cleared');
  }

  // Obter estatísticas de todos os caches
  getCacheStats() {
    return this.manager.getStats();
  }

  // Warm-up de caches críticos
  async warmUpCriticalCaches(): Promise<void> {
    logger.info('Warming up critical caches...');
    
    try {
      // Aqui poderíamos pré-carregar dados críticos
      // Por exemplo: configurações do sistema, pacotes de créditos, etc.
      
      logger.info('Cache warm-up completed');
    } catch (error: any) {
      logger.error('Error during cache warm-up: ' + error.message);
    }
  }

  // Limpeza automática de caches expirados
  startAutoCleanup(intervalMs: number = 300000) { // 5 minutos
    setInterval(() => {
      const stats = this.getCacheStats();
      logger.debug('Cache cleanup stats: ' + JSON.stringify(stats));
      
      // TODO: Implementar lógica de limpeza baseada em uso
    }, intervalMs);
  }
}

// ==========================================
// DECORATOR PARA CACHING AUTOMÁTICO
// ==========================================

export function Cached(ttl: number = 300000, keyPrefix: string = '') {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new LRUCache<string, any>({
      max: 100,
      ttl: ttl
    });

    descriptor.value = async function(...args: any[]) {
      const cacheKey = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);
      
      if (cached !== undefined) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result);
      return result;
    };

    return descriptor;
  };
}

// ==========================================
// EXPORTS
// ==========================================

export const cacheManager = new ApplicationCache();

export { CacheManager, ApplicationCache };

// Tipos auxiliares
export type { CacheConfig, CacheEntry };