import React, { useState, useEffect } from "react";
import { useSettings } from '../hooks/useSettings';
import { getWordPressStats } from '../services/wordpressService';
import { TrendingUpIcon, ClockIcon, ChatIcon } from './Icons';

// Mock UI components
const Card = ({ children, className = "" }: any) => (
    <div className={`bg-white dark:bg-dark-card rounded-lg shadow-md border border-gray-200 dark:border-dark-border overflow-hidden ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children }: any) => <div className="p-4 border-b border-gray-200 dark:border-dark-border">{children}</div>;
const CardTitle = ({ children, className = "" }: any) => <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }: any) => <div className={`p-4 ${className}`}>{children}</div>;

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

export const AnalyticsPage = () => {
    const { settings } = useSettings();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const result = await getWordPressStats(settings);
            
            if (result.success && result.stats) {
                setStats(result.stats);
            } else {
                setError(result.message || 'Falha ao carregar estatísticas');
            }
        } catch (err) {
            setError('Erro ao carregar estatísticas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="text-gray-500 mt-4">Carregando estatísticas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button 
                        onClick={fetchStats}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Análise de Desempenho</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Estatísticas e insights do seu blog WordPress
                </p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total de Posts" 
                        value={stats.totalPosts} 
                        icon={<TrendingUpIcon className="h-6 w-6 text-white" />} 
                        color="bg-blue-500" 
                    />
                    <StatCard 
                        title="Categorias" 
                        value={stats.totalCategories} 
                        icon={<BookIcon className="h-6 w-6 text-white" />} 
                        color="bg-green-500" 
                    />
                    <StatCard 
                        title="Tags" 
                        value={stats.totalTags} 
                        icon={<SparklesIcon className="h-6 w-6 text-white" />} 
                        color="bg-purple-500" 
                    />
                    <StatCard 
                        title="Comentários" 
                        value={stats.totalComments} 
                        icon={<ChatIcon className="h-6 w-6 text-white" />} 
                        color="bg-yellow-500" 
                    />
                </div>
            )}

            {/* Recent Posts */}
            {stats && stats.recentPosts && stats.recentPosts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Posts Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentPosts.map((post: any) => (
                                <div key={post.id} className="border-b border-gray-200 dark:border-dark-border pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.excerpt}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <ClockIcon className="h-3 w-3" />
                                                {new Date(post.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <a 
                                                href={post.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-brand-primary hover:underline mt-1"
                                            >
                                                Ver Post
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {stats && (!stats.recentPosts || stats.recentPosts.length === 0) && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BarChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nenhum post encontrado
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Crie seu primeiro post para começar a ver estatísticas
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};