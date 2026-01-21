import React from 'react';
import { Page } from '../../App.js';
import { ShieldIcon } from '../Icons.js';

interface SecuritySectionProps {
  onNavigate: (page: Page, context?: { from?: Page; initialTab?: any }) => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ onNavigate }) => {
  return (
    <div className="card-premium p-8 h-full flex flex-col items-start relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-500"></div>

      <div className="mb-6 flex items-center justify-between w-full">
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <ShieldIcon className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Atenção</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3">Segurança da Conta</h3>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
          <span className="text-sm text-slate-400">Status 2FA</span>
          <span className="text-xs font-bold text-yellow-500 uppercase">Inativo</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Sua conta está vulnerável. Ative a autenticação de dois fatores para garantir que apenas você tenha acesso.
        </p>
      </div>

      <button
        onClick={() => onNavigate('profile', { initialTab: 'seguranca' })}
        className="w-full mt-auto py-3 bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Configurar Agora
      </button>
    </div>
  );
};