import React from 'react';
import { WhatsAppIcon, TelegramIcon, InstagramIcon } from '../Icons.js';

export const AuthFooter: React.FC = () => {
  return (
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
                <li><a href="#features" className="hover:text-brand-primary transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-brand-primary transition-colors">Planos</a></li>
                <li><a href="#faq" className="hover:text-brand-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-colors">Changelog</a></li>
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
  );
};