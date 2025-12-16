import React from 'react';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from './Icons';

export const Footer: React.FC<{ onAuthClick: () => void }> = ({ onAuthClick }) => {
    const whatsappGroupUrl = "https://chat.whatsapp.com/BSsknrWToFpJGHz3EnkDUd";
    const telegramGroupUrl = "https://t.me/+9cdym9gvPQ9iOWNh";
    const phoneNumber = "5588994227586";
    const contactEmail = "contato@automacoescomerciais.com.br";

    return (
        <footer className="bg-neutrals-background_secondary border-t border-neutrals-border py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left items-start">
                    {/* Column 1: Brand and Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-neutrals-text_primary text-lg">ACI</h3>
                        <p className="text-sm text-neutrals-text_secondary">
                            Automação Inteligente para Afiliados.<br />
                            CNPJ: 59.216.642/0001-75
                        </p>
                        <div className="flex justify-center md:justify-start gap-4">
                            <a href="https://www.instagram.com/automacoescomerciais integradas" target="_blank" rel="noopener noreferrer" className="text-neutrals-text_secondary hover:text-neutrals-text_primary transition-colors" aria-label="Instagram"><InstagramIcon /></a>
                            <a href={telegramGroupUrl} target="_blank" rel="noopener noreferrer" className="text-neutrals-text_secondary hover:text-neutrals-text_primary transition-colors" aria-label="Telegram"><TelegramIcon /></a>
                            <a href={whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="text-neutrals-text_secondary hover:text-neutrals-text_primary transition-colors" aria-label="WhatsApp Group"><WhatsAppIcon /></a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-neutrals-text_primary mb-4">Navegação</h3>
                        <ul className="space-y-2">
                            <li><a href="#sobre" className="text-sm text-neutrals-text_secondary hover:text-neutrals-text_primary">Sobre</a></li>
                            <li><a href="#recursos" className="text-sm text-neutrals-text_secondary hover:text-neutrals-text_primary">Recursos</a></li>
                            <li><a href="#precos" className="text-sm text-neutrals-text_secondary hover:text-neutrals-text_primary">Preços</a></li>
                            <li><a href="#faq" className="text-sm text-neutrals-text_secondary hover:text-neutrals-text_primary">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact & CTA */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutrals-text_primary mb-3">Pronto para começar?</h3>
                        <p className="text-sm text-neutrals-text_secondary">Crie sua conta gratuita e ganhe créditos para testar todas as ferramentas.</p>
                        <button onClick={onAuthClick} className="w-full bg-brand-primary hover:bg-brand-primary_hover text-neutrals-text_primary font-bold py-3 rounded-md shadow-button focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition">
                            Criar Conta Grátis
                        </button>
                    </div>
                </div>
                <div className="mt-12 text-center text-xs text-neutrals-text_secondary/70 border-t border-neutrals-border pt-6">
                    <p>2025 © ACI. Todos os direitos reservados.</p>
                    <p className="mt-2">Contato: <a href={`mailto:${contactEmail}`} className="underline text-neutrals-text_secondary hover:text-neutrals-text_primary">{contactEmail}</a> • Tel: <a href={`tel:+${phoneNumber}`} className="underline text-neutrals-text_secondary hover:text-neutrals-text_primary">+{phoneNumber}</a></p>
                </div>
            </div>
        </footer>
    );
};