/**
 * =========================================
 * ACI - Serviço de Otimização Frontend
 * =========================================
 * 
 * Otimizações para melhorar performance do frontend:
 * - Lazy loading de componentes
 * - Code splitting inteligente
 * - Caching de dados
 * - Pré-carregamento estratégico
 * - Otimização de assets
 */

import { cacheManager } from './cacheService';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

interface ComponentImport {
  (): Promise<{ default: React.ComponentType<any> }>;
}

interface LazyComponentOptions {
  fallback?: React.ReactNode;
  preload?: boolean;
  cacheTTL?: number;
}

interface AssetOptimizationConfig {
  images: {
    quality: number;
    format: 'webp' | 'avif' | 'auto';
    sizes: string[];
  };
  fonts: {
    preload: boolean;
    display: 'swap' | 'fallback' | 'optional';
  };
  scripts: {
    defer: boolean;
    async: boolean;
  };
}

// ==========================================
// SERVIÇO DE OTIMIZAÇÃO FRONTEND
// ==========================================

class FrontendOptimizationService {
  private assetConfig: AssetOptimizationConfig = {
    images: {
      quality: 80,
      format: 'auto',
      sizes: ['300w', '600w', '1200w']
    },
    fonts: {
      preload: true,
      display: 'swap'
    },
    scripts: {
      defer: true,
      async: false
    }
  };

  private preloadedComponents = new Set<string>();
  private intersectionObserver: IntersectionObserver | null = null;

  // ==========================================
  // LAZY LOADING DE COMPONENTES
  // ==========================================

  /**
   * Cria componente lazy com caching e fallback
   */
  createLazyComponent(
    importFn: ComponentImport,
    componentName: string,
    options: LazyComponentOptions = {}
  ) {
    const { fallback = <div>Carregando...</div>, preload = false, cacheTTL = 300000 } = options;

    // Função de carregamento otimizada
    const loadComponent = async () => {
      try {
        // Verificar cache primeiro
        const cached = cacheManager.getCache(`component:${componentName}`);
        if (cached) {
          return { default: cached };
        }

        // Carregar componente
        const module = await importFn();
        
        // Cache resultado
        cacheManager.setCache(`component:${componentName}`, module.default, cacheTTL);
        
        return module;
      } catch (error) {
        console.error(`Erro ao carregar componente ${componentName}:`, error);
        throw error;
      }
    };

    // Pré-carregar se solicitado
    if (preload && !this.preloadedComponents.has(componentName)) {
      this.preloadedComponents.add(componentName);
      loadComponent().catch(console.error);
    }

    return React.lazy(loadComponent);
  }

  /**
   * Lazy loading com Intersection Observer
   */
  createIntersectionLazyComponent(
    importFn: ComponentImport,
    componentName: string,
    options: LazyComponentOptions = {}
  ) {
    const LazyComponent = this.createLazyComponent(importFn, componentName, options);
    
    return function IntersectionLazyWrapper(props: any) {
      const [isVisible, setIsVisible] = React.useState(false);
      const componentRef = React.useRef<HTMLDivElement>(null);

      React.useEffect(() => {
        if (!componentRef.current) return;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          },
          { threshold: 0.1 }
        );

        observer.observe(componentRef.current);
        return () => observer.disconnect();
      }, []);

      return (
        <div ref={componentRef}>
          {isVisible ? (
            <React.Suspense fallback={options.fallback || <div>Carregando...</div>}>
              <LazyComponent {...props} />
            </React.Suspense>
          ) : (
            options.fallback || <div>Carregando...</div>
          )}
        </div>
      );
    };
  }

  // ==========================================
  // OTIMIZAÇÃO DE IMAGENS
  // ==========================================

  /**
   * Otimiza URL de imagem com formato e qualidade
   */
  optimizeImageUrl(
    src: string,
    width?: number,
    height?: number,
    quality: number = this.assetConfig.images.quality
  ): string {
    if (!src) return '';

    // Se já for URL otimizada, retornar como está
    if (src.includes('w=') || src.includes('q=')) {
      return src;
    }

    // Construir URL otimizada
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    params.append('f', this.assetConfig.images.format);

    return `${src}?${params.toString()}`;
  }

  /**
   * Componente de imagem otimizado
   */
  OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className,
    loading = 'lazy',
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    width?: number;
    height?: number;
  }) => {
    const optimizedSrc = this.optimizeImageUrl(src || '', width, height);
    
    return (
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
        {...props}
      />
    );
  };

  // ==========================================
  // PRÉ-CARREGAMENTO ESTRATÉGICO
  // ==========================================

  /**
   * Pré-carregar recursos importantes
   */
  preloadCriticalResources() {
    // Pré-carregar fontes
    if (this.assetConfig.fonts.preload) {
      const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
      fontLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const linkElement = document.createElement('link');
          linkElement.rel = 'prefetch';
          linkElement.href = href;
          document.head.appendChild(linkElement);
        }
      });
    }

    // Pré-conectar a APIs externas
    const criticalApis = [
      process.env.VITE_API_URL || 'http://localhost:4001',
      'https://api.mercadopago.com'
    ];

    criticalApis.forEach(api => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = api;
      document.head.appendChild(link);
    });
  }

  /**
   * Pré-carregar rotas baseadas em navegação
   */
  preloadRoute(route: string) {
    // Mapeamento de rotas para componentes
    const routeComponents: Record<string, string[]> = {
      '/dashboard': ['DashboardHeader', 'Sidebar', 'AnalyticsCards'],
      '/credits': ['CreditPurchasePage', 'PixPaymentModal'],
      '/settings': ['UserSettingsPage', 'ProfileForm'],
      '/payments': ['PaymentHistory', 'TransactionDetails']
    };

    const components = routeComponents[route] || [];
    components.forEach(componentName => {
      if (!this.preloadedComponents.has(componentName)) {
        this.preloadedComponents.add(componentName);
        // Trigger lazy loading silencioso
        import(`../components/${componentName}`).catch(console.error);
      }
    });
  }

  // ==========================================
  // CODE SPLITTING E BUNDLING
  // ==========================================

  /**
   * Agrupar componentes por funcionalidade
   */
  createComponentBundle(components: Record<string, ComponentImport>) {
    return Object.entries(components).reduce((bundle, [name, importFn]) => {
      bundle[name] = this.createLazyComponent(importFn, name);
      return bundle;
    }, {} as Record<string, React.LazyExoticComponent<any>>);
  }

  /**
   * Vendor chunking para bibliotecas externas
   */
  getVendorChunks() {
    return {
      react: ['react', 'react-dom'],
      ui: ['@radix-ui/react-*', 'lucide-react'],
      charts: ['recharts'],
      forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
      utils: ['date-fns', 'clsx', 'tailwind-merge']
    };
  }

  // ==========================================
  // PERFORMANCE MONITORING
  // ==========================================

  /**
   * Monitorar Core Web Vitals
   */
  monitorCoreWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        const delay = entry.processingStart - entry.startTime;
        console.log('FID:', delay);
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  /**
   * Medir tempo de carregamento de componente
   */
  measureComponentLoad(componentName: string, callback: () => void) {
    const startTime = performance.now();
    
    callback();
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // TODO: Enviar métrica para sistema de monitoramento
    return loadTime;
  }

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  /**
   * Detectar conexão lenta
   */
  isSlowConnection(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
    }
    return false;
  }

  /**
   * Ajustar qualidade baseado na conexão
   */
  getOptimalQuality(): number {
    return this.isSlowConnection() ? 60 : this.assetConfig.images.quality;
  }

  /**
   * Memoização inteligente de componentes
   */
  memoizeComponent<P extends object>(
    Component: React.ComponentType<P>,
    areEqual?: (prevProps: P, nextProps: P) => boolean
  ): React.MemoExoticComponent<React.ComponentType<P>> {
    return React.memo(Component, areEqual);
  }
}

// Exportar instância singleton
export const frontendOptimizer = new FrontendOptimizationService();

// Exportar componentes e hooks utilitários
export const { OptimizedImage } = frontendOptimizer;

// Hook para lazy loading
export const useLazyComponent = (
  importFn: ComponentImport,
  componentName: string,
  options: LazyComponentOptions = {}
) => {
  return frontendOptimizer.createLazyComponent(importFn, componentName, options);
};

// Hook para pré-carregamento
export const usePreloadRoute = (route: string) => {
  React.useEffect(() => {
    frontendOptimizer.preloadRoute(route);
  }, [route]);
};

export default frontendOptimizer;