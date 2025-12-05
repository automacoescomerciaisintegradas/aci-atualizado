import React from 'react';

export const StatsSection: React.FC = () => {
  return (
    <section className="py-24 bg-black border-y border-white/5">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter">+15k</div>
            <div className="text-brand-primary text-xs font-bold uppercase tracking-widest">Produtos Vendidos</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter">+2k</div>
            <div className="text-brand-primary text-xs font-bold uppercase tracking-widest">Usuários Ativos</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter">+500k</div>
            <div className="text-brand-primary text-xs font-bold uppercase tracking-widest">Posts Gerados</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter">99.9%</div>
            <div className="text-brand-primary text-xs font-bold uppercase tracking-widest">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};