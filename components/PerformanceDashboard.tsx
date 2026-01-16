import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface PerformanceMetrics {
  performance: {
    totalRequests: number;
    uniqueEndpoints: number;
    avgResponseTime: number;
    errorRate: string;
    slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
  };
  system: {
    uptime: number;
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
    };
    cpu: {
      user: string;
      system: string;
    };
    platform: string;
    nodeVersion: string;
  };
  timestamp: string;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // TODO: Substituir pela URL real da API
        const response = await fetch('/api/metrics/performance');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch inicial
    fetchMetrics();
    
    // Polling a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">Erro ao carregar métricas: {error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
        <p className="text-slate-400">Nenhuma métrica disponível</p>
      </div>
    );
  }

  // Preparar dados para gráficos
  const endpointData = metrics.performance.slowestEndpoints.map(ep => ({
    name: ep.endpoint,
    avgTime: ep.avgTime
  }));

  return (
    <div className="space-y-6">
      {/* Header com timestamp */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dashboard de Performance</h2>
        <div className="text-sm text-slate-400">
          Última atualização: {new Date(metrics.timestamp).toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Total de Requisições</div>
          <div className="text-2xl font-bold text-white mt-1">
            {metrics.performance.totalRequests.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Endpoints Únicos</div>
          <div className="text-2xl font-bold text-white mt-1">
            {metrics.performance.uniqueEndpoints}
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Tempo Médio</div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            {metrics.performance.avgResponseTime}ms
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Taxa de Erro</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {metrics.performance.errorRate}
          </div>
        </div>
      </div>

      {/* Gráfico de Endpoints Lentos */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Endpoints Mais Lentos (24h)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={endpointData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  borderColor: '#374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#9CA3AF' }}
              />
              <Bar dataKey="avgTime" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Uso de Memória</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">RSS</span>
              <span className="text-white font-mono">{metrics.system.memory.rss}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heap Total</span>
              <span className="text-white font-mono">{metrics.system.memory.heapTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heap Used</span>
              <span className="text-white font-mono">{metrics.system.memory.heapUsed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">External</span>
              <span className="text-white font-mono">{metrics.system.memory.external}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Informações do Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Uptime</span>
              <span className="text-white">
                {Math.floor(metrics.system.uptime / 3600)}h {Math.floor((metrics.system.uptime % 3600) / 60)}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plataforma</span>
              <span className="text-white">{metrics.system.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Node.js</span>
              <span className="text-white font-mono">{metrics.system.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CPU User</span>
              <span className="text-white font-mono">{metrics.system.cpu.user}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CPU System</span>
              <span className="text-white font-mono">{metrics.system.cpu.system}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Recomendações */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-3">💡 Recomendações</h3>
        <ul className="space-y-2 text-slate-300">
          {metrics.performance.avgResponseTime > 500 && (
            <li>• Tempo médio de resposta alto - Considere otimizar consultas ao banco</li>
          )}
          {parseFloat(metrics.performance.errorRate) > 5 && (
            <li>• Taxa de erro elevada - Verifique logs para identificar problemas</li>
          )}
          {endpointData.some(ep => ep.avgTime > 2000) && (
            <li>• Alguns endpoints estão muito lentos - Otimize ou adicione caching</li>
          )}
        </ul>
      </div>
    </div>
  );
};