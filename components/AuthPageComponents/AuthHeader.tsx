import React from 'react';

interface HeaderProps {
  onBackToLanding: () => void;
  setView: (view: 'login' | 'signup' | 'pending-confirmation' | 'forgot-password') => void;
}

export const AuthHeader: React.FC<HeaderProps> = ({ onBackToLanding, setView }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 bg-neutrals-background_main/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-12 transition-all duration-300">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onBackToLanding()}>
        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-brand-primary flex items-center justify-center text-white font-display font-black text-base sm:text-xl shadow-button group-hover:scale-105 transition-transform rounded-lg">
          A
        </div>
        <span className="text-xl sm:text-2xl font-display font-bold text-white tracking-tighter">ACI<span className="text-brand-secondary">.</span></span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <a
          href="#features"
          onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors relative pb-1 cursor-pointer"
        >
          Funcionalidades
        </a>
        <a
          href="#about"
          onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors relative pb-1 cursor-pointer"
        >
          Sobre
        </a>
        <a
          href="#pricing"
          onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors relative pb-1 cursor-pointer"
        >
          Planos
        </a>
      </nav>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setView('login')}
          className="hidden md:block text-sm font-bold uppercase tracking-wider text-white hover:text-brand-primary transition-colors"
        >
          Login
        </button>
        <button
          onClick={() => setView('signup')}
          className="min-w-[132px] sm:min-w-[154px] px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-primary text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs hover:bg-brand-primary_hover transition-colors shadow-button hover:shadow-button-hover rounded-full"
        >
          Começar Agora
        </button>
      </div>
    </header>
  );
};
