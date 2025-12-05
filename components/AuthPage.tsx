import React from 'react';
import { InfiniteCarousel, SecondInfiniteCarousel } from './InfiniteCarousel.js';
import { AuthHeader } from './AuthPageComponents/AuthHeader.js';
import { StatsSection } from './AuthPageComponents/StatsSection.js';
import { AuthForm } from './AuthPageComponents/AuthForm.js';
import { useAuth } from './AuthPageComponents/useAuth.js';
import { WhatsAppIcon, TelegramIcon, InstagramIcon, BrainCircuitIcon, BookIcon, ShoppingCartSendIcon } from './Icons.js';

interface AuthPageProps {
  onLoginSuccess: (user: { name: string; email: string; photoUrl: string; isAdmin: boolean }) => void;
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const {
    view,
    setView,
    showPassword,
    setShowPassword,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    phone,
    setPhone,
    error,
    setError,
    isLoading,
    handleEmailChange,
    handlePhoneChange,
    handleFormSubmit,
    handleGoogleLogin
  } = useAuth(onLoginSuccess);

  // Mock Offer Cards for Marquee - Updated with Diverse Categories
  const offerCards = [
    { title: 'Smartwatch D20', price: 'R$ 45,00', image: '⌚', category: 'Eletrônicos', color: 'from-blue-600 to-blue-900' },
    { title: 'Fone Bluetooth', price: 'R$ 29,90', image: '🎧', category: 'Áudio', color: 'from-purple-600 to-purple-990' },
    { title: 'Kit Maquiagem', price: 'R$ 89,90', image: '💄', category: 'Beleza', color: 'from-pink-600 to-pink-900' },
    { title: 'Tênis Esportivo', price: 'R$ 129,90', image: '', category: 'Moda', color: 'from-orange-600 to-orange-900' },
    { title: 'Controle Gamer', price: 'R$ 150,00', image: '🎮', category: 'Games', color: 'from-green-600 to-green-900' },
    { title: 'Garrafa Térmica', price: 'R$ 35,00', image: '🥤', category: 'Casa', color: 'from-teal-600 to-teal-900' },
    { title: 'Ring Light', price: 'R$ 49,90', image: '💡', category: 'Acessórios', color: 'from-yellow-600 to-yellow-900' },
    { title: 'Mochila Notebook', price: 'R$ 79,90', image: '🎒', category: 'Acessórios', color: 'from-indigo-600 to-indigo-900' },
  ];

  const MarqueeRow = ({ speed = "30s", reverse = false }) => (
    <div className="flex gap-6 overflow-hidden py-4 select-none mask-linear-gradient">
      <div
        className={`flex gap-6 min-w-full shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ animationDuration: speed }}
      >
        {[...offerCards, ...offerCards, ...offerCards].map((card, i) => (
          <div key={i} className="w-64 h-80 flex-shrink-0 rounded-xl bg-dark-card border border-white/10 overflow-hidden shadow-lg relative group hover:scale-105 transition-transform duration-300">
            <div className={`h-48 w-full bg-gradient-to-br ${card.color} flex items-center justify-center text-6xl relative`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <span className="drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">{card.image}</span>
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                {card.category}
              </div>
            </div>
            <div className="p-5 relative z-10 bg-dark-card">
              <div className="text-[10px] font-bold tracking-widest text-brand-primary uppercase mb-1">Oferta Relâmpago</div>
              <h3 className="text-white font-display font-bold text-lg mb-1 leading-tight truncate">{card.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xl font-display font-bold text-white">{card.price}</div>
                <button className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-black hover:bg-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </button>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-brand-primary text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded shadow-lg">Shopee</div>
          </div>
        ))}
      </div>
      {/* Duplicate for seamless loop */}
      <div
        className={`flex gap-6 min-w-full shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ animationDuration: speed }}
      >
        {[...offerCards, ...offerCards, ...offerCards].map((card, i) => (
          <div key={`dup-${i}`} className="w-64 h-80 flex-shrink-0 rounded-xl bg-dark-card border border-white/10 overflow-hidden shadow-lg relative group hover:scale-105 transition-transform duration-300">
            <div className={`h-48 w-full bg-gradient-to-br ${card.color} flex items-center justify-center text-6xl relative`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <span className="drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">{card.image}</span>
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                {card.category}
              </div>
            </div>
            <div className="p-5 relative z-10 bg-dark-card">
              <div className="text-[10px] font-bold tracking-widest text-brand-primary uppercase mb-1">Oferta Relâmpago</div>
              <h3 className="text-white font-display font-bold text-lg mb-1 leading-tight truncate">{card.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xl font-display font-bold text-white">{card.price}</div>
                <button className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-black hover:bg-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </button>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-brand-primary text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded shadow-lg">Shopee</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Features data
  const features = [
    { icon: '📝', title: 'Postagens em Massa (CSV)', desc: 'Importe produtos em massa ou crie posts individuais com IA. Otimizado para conversão e engajamento.' },
    { icon: '🎬', title: 'Vídeos Virais', desc: 'Utilize vídeos sem direitos autorais do Telegram e YouTube para criar conteúdo viral e aumentar o engajamento.' },
    { icon: '🚀', title: 'Publicação Multi-Canal', desc: 'Publique no WordPress, Instagram (Reels, Shorts, DM) e YouTube automaticamente.' },
    { icon: '📊', title: 'Analytics Real-time', desc: 'Dashboards detalhados para tomada de decisão baseada em dados.' },
    { icon: '🛍️', title: 'Shopee Integration', desc: 'Conexão direta via API oficial para dados precisos de produtos.' },
    { icon: '🔒', title: 'Segurança Enterprise', desc: 'Seus dados protegidos com criptografia de ponta a ponta.' },
  ];

  // FAQ data
  const faqItems = [
    { q: 'Como faço login na plataforma?', a: 'Você pode fazer login com Google ou usar o sistema de email de confirmação. Por favor, contate o administrador do sistema se tiver problemas.' },
    { q: 'A plataforma é gratuita?', a: 'Oferecemos um plano Starter com funcionalidades básicas. Para recursos avançados, confira nossos planos Pro e Enterprise.' },
    { q: 'Como integro com a Shopee?', a: 'Nossa integração com Shopee é direta via API oficial. Basta conectar sua conta nas configurações e começar a importar produtos.' },
    { q: 'Posso publicar em múltiplas plataformas?', a: 'Sim! Nossa plataforma suporta publicação simultânea no Telegram, WordPress, Instagram e outras redes sociais.' },
  ];

  return (
    <div className="min-h-screen bg-neutrals-background_main font-body text-white selection:bg-brand-primary selection:text-black overflow-x-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation: marquee linear infinite; }
        .animate-marquee-reverse { animation: marquee linear infinite reverse; }
        .mask-linear-gradient {
          mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        }
      `}</style>

      <AuthHeader onBackToLanding={onBackToLanding} setView={setView} />

      {/* Hero Section - Bold & Impactful */}
      <section className="relative pt-40 pb-32 lg:pt-64 lg:pb-48 min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_80%)] z-0 pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            {/* Hero Text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary text-xs font-bold uppercase tracking-widest mb-10 animate-fade-in rounded-full">
                <span className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse shadow-[0_0_10px_#CCFF00]"></span>
                Sistema V2.0 Online
              </div>

              <h1 className="text-6xl lg:text-8xl font-display font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase">
                Automatize suas <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-gradient-x">Vendas na Shopee</span>
              </h1>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                A primeira plataforma que une <strong className="text-brand-secondary">Inteligência Artificial</strong>, <strong className="text-brand-accent">Telegram</strong> e <strong className="text-brand-primary">WordPress</strong> para criar um ecossistema de vendas automático.
              </p>
              <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto lg:mx-0 border-l-2 border-brand-primary/50 pl-6">
                A suíte completa de ferramentas com IA para automação comercial, marketing de afiliados e gerenciamento de conteúdo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <button
                  onClick={() => setView('signup')}
                  className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white font-display font-black text-lg uppercase tracking-wider hover:bg-brand-primary_hover hover:scale-105 transition-all duration-300 shadow-button hover:shadow-button-hover rounded-xl"
                >
                  Criar Conta Grátis
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-transparent border border-white/20 text-white font-display font-bold text-lg uppercase tracking-wider hover:border-brand-secondary hover:text-brand-secondary transition-all duration-300 rounded-xl">
                  Ver Demo
                </button>
              </div>
            </div>

            {/* Login/Signup Form - Glassmorphism Corporate */}
            <div className="lg:w-1/2 w-full max-w-md relative">
              <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] opacity-20 rounded-full"></div>

              <AuthForm
                view={view}
                name={name}
                email={email}
                password={password}
                phone={phone}
                showPassword={showPassword}
                isLoading={isLoading}
                setName={setName}
                setEmail={setEmail}
                setPassword={setPassword}
                setPhone={setPhone}
                setShowPassword={setShowPassword}
                setView={setView}
                handleEmailChange={handleEmailChange}
                handlePhoneChange={handlePhoneChange}
                handleFormSubmit={handleFormSubmit}
                handleGoogleLogin={handleGoogleLogin}
                error={error}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Background Marquees - Subtle & Dark */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 opacity-30 -rotate-6 scale-125 pointer-events-none z-0 mix-blend-screen">
        <MarqueeRow speed="60s" />
        <div className="h-12"></div>
        <MarqueeRow speed="80s" reverse />
      </div>

      <StatsSection />

      {/* Features Section */}
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
            {features.map((feature, i) => (
              <div key={i} className="group p-10 bg-black border border-white/5 hover:border-brand-primary hover:shadow-[0_8px_30px_rgba(30,64,175,0.3)] transition-all duration-300 hover:-translate-y-2 rounded-lg">
                <div className="text-4xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-300">{feature.icon}</div>
                <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wide group-hover:text-brand-primary transition-colors">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-32 bg-neutrals-background_main relative">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-tight">Todas as Categorias</h2>
          <p className="text-gray-400 text-lg font-light">Explore produtos das principais plataformas: Shopee, Mercado Livre e Amazon.</p>
        </div>

        {/* Infinite Carousel */}
        <InfiniteCarousel />

        {/* Second Infinite Carousel */}
        <SecondInfiniteCarousel />

        <div className="container mx-auto px-6 lg:px-16 mt-12 text-center">
          <p className="text-sm text-gray-500 font-mono">
            * Ofertas atualizadas em tempo real via API oficial.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-neutrals-background_secondary relative">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest mb-8 rounded-full">
                <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                Sobre Nós
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 uppercase tracking-tight leading-tight">
                Automatize seu negócio com <span className="text-brand-primary">inteligência</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                O ACI nasceu da necessidade de simplificar o marketing de afiliados. Somos uma plataforma brasileira que une a potência da <strong className="text-white">Inteligência Artificial</strong> com as principais plataformas de e-commerce.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Com ferramentas de geração de conteúdo, publicação automatizada e análise de dados, ajudamos você a escalar suas vendas sem aumentar sua carga de trabalho.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-brand-secondary rounded-full"></span>
                  +5.000 usuários ativos
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-brand-secondary rounded-full"></span>
                  +100.000 posts gerados
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-brand-secondary rounded-full"></span>
                  Suporte em português
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] opacity-30 rounded-full"></div>
              <div className="relative bg-black border border-white/10 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-neutrals-background_card rounded-xl border border-white/5">
                    <div className="text-4xl font-display font-black text-brand-primary mb-2">99%</div>
                    <div className="text-sm text-gray-400">Uptime garantido</div>
                  </div>
                  <div className="text-center p-6 bg-neutrals-background_card rounded-xl border border-white/5">
                    <div className="text-4xl font-display font-black text-brand-secondary mb-2">24/7</div>
                    <div className="text-sm text-gray-400">Suporte disponível</div>
                  </div>
                  <div className="text-center p-6 bg-neutrals-background_card rounded-xl border border-white/5">
                    <div className="text-4xl font-display font-black text-brand-accent mb-2">3s</div>
                    <div className="text-sm text-gray-400">Tempo médio de resposta</div>
                  </div>
                  <div className="text-center p-6 bg-neutrals-background_card rounded-xl border border-white/5">
                    <div className="text-4xl font-display font-black text-white mb-2">∞</div>
                    <div className="text-sm text-gray-400">Possibilidades com IA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-neutrals-background_main relative">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary text-xs font-bold uppercase tracking-widest mb-8 rounded-full">
              <span className="w-2 h-2 bg-brand-secondary rounded-full"></span>
              Planos
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-tight">
              Escolha seu <span className="text-brand-primary">Plano</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comece gratuitamente e escale conforme seu negócio cresce. Sem surpresas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="group relative bg-black border border-white/10 rounded-2xl p-8 hover:border-brand-primary/50 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold text-white mb-2">Starter</h3>
                <p className="text-gray-400 text-sm">Perfeito para começar</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-black text-white">Grátis</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-xs">✓</span>
                  100 créditos/mês
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-xs">✓</span>
                  Geração de conteúdo
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-xs">✓</span>
                  1 integração
                </li>
                <li className="flex items-center gap-3 text-gray-500 text-sm">
                  <span className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-gray-600 text-xs">✕</span>
                  Publicação automática
                </li>
              </ul>
              <button
                onClick={() => setView('signup')}
                className="w-full py-3 border border-white/20 text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white hover:text-black transition-all"
              >
                Começar Grátis
              </button>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="group relative bg-gradient-to-b from-brand-primary/20 to-black border-2 border-brand-primary rounded-2xl p-8 transform scale-105 shadow-[0_0_60px_rgba(30,64,175,0.3)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider rounded-full">
                Mais Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold text-white mb-2">Pro</h3>
                <p className="text-gray-300 text-sm">Para profissionais</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-black text-white">R$ 97</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <span className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  5.000 créditos/mês
                </li>
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <span className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  IA avançada (GPT-4)
                </li>
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <span className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  Todas as integrações
                </li>
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <span className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  Publicação automática
                </li>
                <li className="flex items-center gap-3 text-gray-200 text-sm">
                  <span className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  Suporte prioritário
                </li>
              </ul>
              <button
                onClick={() => setView('signup')}
                className="w-full py-3 bg-brand-primary text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-brand-primary_hover transition-all shadow-button"
              >
                Assinar Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="group relative bg-black border border-white/10 rounded-2xl p-8 hover:border-brand-secondary/50 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold text-white mb-2">Enterprise</h3>
                <p className="text-gray-400 text-sm">Para grandes operações</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-black text-white">R$ 297</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-secondary/20 rounded-full flex items-center justify-center text-brand-secondary text-xs">✓</span>
                  Créditos ilimitados
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-secondary/20 rounded-full flex items-center justify-center text-brand-secondary text-xs">✓</span>
                  API dedicada
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-secondary/20 rounded-full flex items-center justify-center text-brand-secondary text-xs">✓</span>
                  White-label
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-secondary/20 rounded-full flex items-center justify-center text-brand-secondary text-xs">✓</span>
                  Gerente de conta
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-5 h-5 bg-brand-secondary/20 rounded-full flex items-center justify-center text-brand-secondary text-xs">✓</span>
                  SLA garantido
                </li>
              </ul>
              <button
                onClick={() => setView('signup')}
                className="w-full py-3 border border-brand-secondary text-brand-secondary font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-brand-secondary hover:text-black transition-all"
              >
                Falar com Vendas
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Todos os planos incluem: SSL gratuito • Atualizações contínuas • Sem taxa de setup
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-black relative">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-tight">Perguntas Frequentes</h2>
            <p className="text-gray-400 text-lg">Tudo o que você precisa saber sobre nossa plataforma</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="group bg-neutrals-background_card border border-white/5 hover:border-brand-primary hover:shadow-[0_8px_30px_rgba(30,64,175,0.3)] p-6 rounded-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">{item.q}</h3>
                <p className="text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-20">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 bg-brand-primary flex items-center justify-center text-white font-display font-black text-xl shadow-button rounded-lg">
                  A
                </div>
                <span className="text-2xl font-display font-bold text-white tracking-tighter">ACI<span className="text-brand-secondary">.</span></span>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-sm mb-4">
                <strong className="text-white">Automações Comerciais Integradas ⚙️</strong><br />
                Especialistas em integração de IA, Shopee, e automação de vendas.
              </p>
              <p className="text-sm text-gray-600">
                <a href="mailto:contato@automacoescomerciais.com.br" className="hover:text-brand-secondary transition-colors">contato@automacoescomerciais.com.br</a>
              </p>
              <div className="flex gap-4">
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all rounded-full group">
                  <WhatsAppIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#0088cc] hover:text-white hover:border-[#0088cc] transition-all rounded-full group">
                  <TelegramIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] transition-all rounded-full group">
                  <InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            <div className="flex gap-16 flex-wrap">
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-6">Produto</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Funcionalidades</a></li>
                  <li><a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Planos</a></li>
                  <li><a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-brand-primary transition-colors cursor-pointer">FAQ</a></li>
                  <li><a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Sobre</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-6">Suporte</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-brand-primary transition-colors">Central de Ajuda</a></li>
                  <li><a href="#" className="hover:text-brand-primary transition-colors">API Docs</a></li>
                  <li><a href="#" className="hover:text-brand-primary transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-brand-primary transition-colors">Contato</a></li>
                </ul>
              </div>

              {/* Newsletter Section */}
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-6">Receba Novidades</h4>
                <p className="text-gray-400 text-sm mb-4">Inscreva-se para receber atualizações exclusivas sobre automações e ofertas.</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const emailInput = e.currentTarget.email as HTMLInputElement;
                  if (emailInput.value) {
                    alert('✅ Obrigado por se inscrever! Você receberá nossas novidades em breve.');
                    emailInput.value = '';
                  }
                }} className="space-y-3">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Seu melhor e-mail"
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
                  />
                  <button type="submit" className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary_hover transition-all shadow-button">
                    Inscrever-se
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Automações Comerciais Integradas. Todos os direitos reservados.
            </p>
            <p className="text-gray-700 text-xs mt-2">
              Desenvolvido por <strong className="text-brand-primary">Automações Comerciais Integradas</strong> ⚙️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};