import React from 'react';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-32 bg-neutrals-background_secondary relative">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 uppercase tracking-tight leading-none">
              Performance <br /><span className="text-brand-primary">Extrema</span>
            </h2>
            <p className="text-gray-400 text-lg font-light">
              Ferramentas projetadas para escalar sua operação de afiliado sem comprometer a qualidade ou a velocidade.
            </p>
          </div>
          <button className="px-8 py-4 border border-white/10 text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all">
            Ver Todas as Features
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📝', title: 'Postagens em Massa (CSV)', desc: 'Importe produtos em massa ou crie posts individuais com IA. Otimizado para conversão e engajamento.' },
            { icon: '🎬', title: 'Vídeos Virais', desc: 'Utilize vídeos sem direitos autorais do Telegram e YouTube para criar conteúdo viral e aumentar o engajamento.' },
            { icon: '🚀', title: 'Publicação Multi-Canal', desc: 'Publique no WordPress, Instagram (Reels, Shorts, DM) e YouTube automaticamente.' },
            { icon: '📊', title: 'Analytics Real-time', desc: 'Dashboards detalhados para tomada de decisão baseada em dados.' },
            { icon: '🛍️', title: 'Shopee Integration', desc: 'Conexão direta via API oficial para dados precisos de produtos.' },
            { icon: '🔒', title: 'Segurança Enterprise', desc: 'Seus dados protegidos com criptografia de ponta a ponta.' },
          ].map((feature, i) => (
            <div key={i} className="group p-10 bg-black border border-white/5 hover:border-brand-primary hover:shadow-[0_8px_30px_rgba(30,64,175,0.3)] transition-all duration-300 hover:-translate-y-2 rounded-lg">
              <div className="text-4xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-300">{feature.icon}</div>
              <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wide group-hover:text-brand-primary transition-colors">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};