import React from 'react';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-20 bg-neutrals-background_secondary relative border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-16 text-center">
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">Não Perca Nenhuma Novidade!</h2>
          <p className="text-lg text-white/90 mb-6">Confira o link na bio para mais detalhes e acesso exclusivo às nossas ferramentas!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#" className="px-8 py-4 bg-white text-brand-primary font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg">Ver Link na Bio →</a>
            <p className="text-white/80 text-sm">Ou faça login abaixo para começar</p>
          </div>
        </div>
      </div>
    </section>
  );
};