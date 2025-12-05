import React from 'react';

interface HeaderProps {
  onBackToLanding: () => void;
  setView: (view: 'login' | 'signup' | 'pending-confirmation' | 'forgot-password') => void;
}

export const AuthHeader: React.FC<HeaderProps> = ({ onBackToLanding, setView }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-24 bg-neutrals-background_main/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 lg:px-16 transition-all duration-300">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onBackToLanding()}>
        <div className="h-10 w-10 bg-brand-primary flex items-center justify-center text-white font-display font-black text-xl shadow-button group-hover:scale-105 transition-transform rounded-lg">
          A
        </div>
        <span className="text-2xl font-display font-bold text-white tracking-tighter">ACI<span className="text-brand-secondary">.</span></span>
      </div>
      <nav className="hidden md:flex items-center gap-10">
        <a href="#features" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors relative pb-1">
          Funcionalidades
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </a>
        <a href="#features" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors relative pb-1">
          Sobre
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </a>
        <a href="#pricing" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors relative pb-1">
          Planos
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </a>
      </nav>
      <div className="flex items-center gap-6">
        <button
          onClick={() => setView('login')}
          className="hidden md:block text-sm font-bold uppercase tracking-wider text-white hover:text-brand-primary transition-colors"
        >
          Login
        </button>
        <button
          onClick={() => setView('signup')}
          className="px-6 py-3 bg-brand-primary text-white font-bold uppercase tracking-wider text-xs hover:bg-brand-primary_hover transition-colors shadow-button hover:shadow-button-hover rounded-full"
        >
          Começar Agora
        </button>
      </div>
    </header>
  );
};