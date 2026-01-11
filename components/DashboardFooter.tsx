
import React from 'react';
import { navConfig } from './navConfig';
import type { Page } from '../App';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from './Icons';

interface DashboardFooterProps {
    onNavigate: (page: Page) => void;
}

const FooterLink: React.FC<{ page: Page, text: string, onNavigate: (page: Page) => void }> = ({ page, text, onNavigate }) => (
    <li>
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate(page); }}
            className="text-sm text-dark-text-secondary hover:text-dark-text-primary hover:underline transition-colors"
        >
            {text}
        </a>
    </li>
);

export const DashboardFooter: React.FC<DashboardFooterProps> = ({ onNavigate }) => {
    const whatsappGroupUrl = "https://chat.whatsapp.com/BSsknrWToFpJGHz3EnkDUd";
    const telegramGroupUrl = "https://t.me/+9cdym9gvPQ9iOWNh";

    // Filter sections to show in the footer
    const footerSections = navConfig.filter(item =>
        item.type === 'section' &&
        ['Vendas & Afiliados', 'Criação de Conteúdo', 'Ajuda & Recursos'].includes(item.title)
    );

    return (
        <footer className="footer-premium mt-16 py-12" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Divider com glow */}
                <div className="divider-glow mb-12"></div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Brand and Social Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-3xl font-bold text-gradient inline-block hover-scale">
                            ACI
                        </a>
                        <p className="text-sm text-dark-text-secondary max-w-xs leading-relaxed">
                            A suíte completa de ferramentas com IA para automação comercial, marketing de afiliados e gerenciamento de conteúdo.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="text-dark-text-secondary hover:text-white hover:glow-instagram transition-all duration-300 p-2 rounded-lg hover:bg-white/5" aria-label="Instagram"><InstagramIcon /></a>
                            <a href={telegramGroupUrl} target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-white hover:glow-primary transition-all duration-300 p-2 rounded-lg hover:bg-white/5" aria-label="Telegram"><TelegramIcon /></a>
                            <a href={whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-white hover:glow-success transition-all duration-300 p-2 rounded-lg hover:bg-white/5" aria-label="WhatsApp Group"><WhatsAppIcon /></a>
                        </div>
                        <div className="text-xs text-dark-text-secondary/50 pt-4 space-y-1 glass-light rounded-lg p-3 inline-block">
                            <p>💡 Dica: Use <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-dark-border text-[10px]">Shift</kbd> + <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-dark-border text-[10px]">H</kbd> para ir ao início.</p>
                            <p>Use <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-dark-border text-[10px]">Shift</kbd> + <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-dark-border text-[10px]">O</kbd> para Ofertas.</p>
                        </div>
                    </div>

                    {/* Navigation Columns from navConfig */}
                    {footerSections.map(item => {
                        const section = item as import('./navConfig').NavItemSection;
                        return (
                            <div key={section.title}>
                                <h3 className="font-semibold text-dark-text-primary mb-4 text-sm uppercase tracking-wider">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.children.slice(0, 5).map(child => ( // Limit to 5 items per col
                                        <FooterLink key={child.page} page={child.page} text={child.text} onNavigate={onNavigate} />
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>

                {/* Bottom part with copyright */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-dark-text-secondary">
                        <p className="flex items-center gap-2">
                            <span className="status-dot online"></span>
                            &copy; {new Date().getFullYear()} Automações Comerciais Integradas. Todos os Direitos Reservados.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('admin') }} className="hover:text-white hover:text-gradient transition-all duration-300">Admin</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile') }} className="hover:text-white hover:text-gradient transition-all duration-300">Minha Conta</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('faq') }} className="hover:text-white hover:text-gradient transition-all duration-300">Ajuda</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};