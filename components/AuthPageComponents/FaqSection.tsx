import React from 'react';

export const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="py-32 bg-black relative">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-tight">Perguntas Frequentes</h2>
          <p className="text-gray-400 text-lg">Tudo o que você precisa saber sobre nossa plataforma</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            { q: 'Como faço login na plataforma?', a: 'Você pode fazer login com Google ou usar o sistema de email de confirmação. Por favor, contate o administrador do sistema se tiver problemas.' },
            { q: 'A plataforma é gratuita?', a: 'Oferecemos um plano Starter com funcionalidades básicas. Para recursos avançados, confira nossos planos Pro e Enterprise.' },
            { q: 'Como integro com a Shopee?', a: 'Nossa integração com Shopee é direta via API oficial. Basta conectar sua conta nas configurações e começar a importar produtos.' },
            { q: 'Posso publicar em múltiplas plataformas?', a: 'Sim! Nossa plataforma suporta publicação simultânea no Telegram, WordPress, Instagram e outras redes sociais.' },
          ].map((item, i) => (
            <div key={i} className="group bg-neutrals-background_card border border-white/5 hover:border-brand-primary hover:shadow-[0_8px_30px_rgba(30,64,175,0.3)] p-6 rounded-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">{item.q}</h3>
              <p className="text-gray-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};