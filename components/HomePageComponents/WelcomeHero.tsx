import React from 'react';

export const WelcomeHero: React.FC = () => {
    return (
        <div className="relative overflow-hidden bg-[#1a1c24] rounded-2xl md:rounded-[2.5rem] p-6 md:p-16 border border-white/5 shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -mr-48 -mt-48 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -ml-48 -mb-48 transition-all"></div>

            <div className="relative z-10 max-w-4xl">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full">
                        <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Plataforma ACI v2.0</span>
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                    A suíte completa de ferramentas com <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">IA</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl mb-12">
                    Potencialize sua <span className="text-white">automação comercial</span>, domine o <span className="text-white">marketing de afiliados</span> e revolucione seu <span className="text-white">gerenciamento de conteúdo</span> em um único lugar.
                </p>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-slate-300 font-bold text-sm tracking-wide">Automação Comercial</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-slate-300 font-bold text-sm tracking-wide">Marketing de Afiliados</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        <span className="text-slate-300 font-bold text-sm tracking-wide">Gestão de Conteúdo IA</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
