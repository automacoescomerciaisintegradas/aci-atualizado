import React from 'react';
import {
    TrendingUpIcon, ZapIcon, BrainCircuitIcon, GlobeIcon,
    SearchIcon, CheckCircleIcon, SparklesIcon, AlertTriangleIcon
} from './Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Page } from '../App';

const data = [
    { name: '01/01', score: 45, presence: 20 },
    { name: '05/01', score: 52, presence: 25 },
    { name: '10/01', score: 68, presence: 40 },
    { name: '15/01', score: 61, presence: 38 },
    { name: '20/01', score: 85, presence: 65 },
];

interface AeoDashboardProps {
    onNavigate: (page: Page) => void;
}

export const AeoDashboard: React.FC<AeoDashboardProps> = ({ onNavigate }) => {
    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <TrendingUpIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">AEO Score</p>
                            <h3 className="text-2xl font-black text-white">85/100</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                        <span>+12% vs mês anterior</span>
                    </div>
                </div>

                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <BrainCircuitIcon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Presence</p>
                            <h3 className="text-2xl font-black text-white">65%</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                        <span>Citação em 4 IAs principais</span>
                    </div>
                </div>

                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full group-hover:bg-green-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <GlobeIcon className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">GEO Reach</p>
                            <h3 className="text-2xl font-black text-white">12.4k</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                        <span>Impressões em Respostas IA</span>
                    </div>
                </div>

                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full group-hover:bg-yellow-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                            <ZapIcon className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Créditos IA</p>
                            <h3 className="text-2xl font-black text-white">3.000</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold">
                        <span>Consumo: ~150/dia</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card-premium p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Evolução de Performance IA</h3>
                            <p className="text-sm text-slate-500">Crescimento da presença em Answer Engines</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white font-bold transition-all">7D</button>
                            <button className="px-3 py-1.5 bg-blue-600 rounded-lg text-xs text-white font-bold transition-all">30D</button>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                <Area type="monotone" dataKey="presence" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresence)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-premium p-8 h-full">
                    <h3 className="text-xl font-bold text-white mb-6">Mecanismos Detectados</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'ChatGPT (OpenAI)', score: 92, color: 'bg-green-500' },
                            { name: 'Gemini (Google)', score: 78, color: 'bg-blue-500' },
                            { name: 'Perplexity AI', score: 65, color: 'bg-teal-500' },
                            { name: 'Claude (Anthropic)', score: 45, color: 'bg-orange-500' },
                        ].map((ia) => (
                            <div key={ia.name}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-300">{ia.name}</span>
                                    <span className="text-sm font-bold text-white">{ia.score}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${ia.color} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${ia.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <div className="flex gap-3">
                            <SparklesIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong className="text-blue-400">Insight IA:</strong> Otimize seu site para "Busca Semântica" para aumentar sua presença no Gemini em 15% nas próximas 48h.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => onNavigate('aeo-optimizer')}
                    className="card-premium p-1 overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all"
                >
                    <div className="p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <MagicWandIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">Otimizador AEO</h3>
                            <p className="text-sm text-slate-500">Transforme conteúdo em respostas prontas para IA.</p>
                        </div>
                        <ChevronRightIcon className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                </div>

                <div
                    onClick={() => onNavigate('analytics')}
                    className="card-premium p-1 overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all"
                >
                    <div className="p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <SearchIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">Rastreamento GEO</h3>
                            <p className="text-sm text-slate-500">Monitore como as IAs estão citando sua marca.</p>
                        </div>
                        <ChevronRightIcon className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MagicWandIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="M17.8 11.8 19 13" /><path d="M15 9h0" /><path d="m17.8 6.2 1.2-1.2" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" />
    </svg>
);

const ChevronRightIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);
