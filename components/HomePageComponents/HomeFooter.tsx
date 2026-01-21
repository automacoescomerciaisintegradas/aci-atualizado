import React from 'react';

export const HomeFooter: React.FC = () => {
  return (
    <footer className="mt-20 py-12 border-t border-white/5 bg-[#1a1c24]/50 rounded-t-[3rem]">
      <div className="max-w-[2048px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex flex-col items-start group">
            <span className="text-4xl font-black text-white tracking-tighter leading-none">ACI</span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em]">Enterprise Suite</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            A solução completa para automação comercial, marketing de afiliados e gestão de conteúdo potencializada por IA.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Ferramentas</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Geração de Posts IA</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Telegram Automation</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Shopee Affiliate Pro</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Analytics Avançado</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Suporte</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Central de Ajuda</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Documentação API</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Status do Sistema</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Comunidade Discord</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Termos de Uso</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Compliance</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-[2048px] mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-slate-600 font-medium">
          &copy; {new Date().getFullYear()} ACI-Automacoes. Desenvolvido para alta performance comercial.
        </p>
        <div className="flex gap-6">
          {/* Social Icons Placeholder */}
          <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer">
            <span className="text-blue-400 text-[10px] font-black italic">IG</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer">
            <span className="text-blue-400 text-[10px] font-black italic">TG</span>
          </div>
        </div>
      </div>
    </footer>
  );
};