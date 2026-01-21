import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDownIcon, BellIcon, CreditIcon, SettingsIcon, LogoutIcon,
    DashboardIcon, ShoppingCartIcon, BrainCircuitIcon, InstagramIcon,
    RocketIcon, TelegramIcon, LinkIcon, TrendingUpIcon, SearchIcon,
    ZapIcon, DollarSignIcon, UsersIcon
} from './Icons';
import type { Page } from '../App';
import { useSettings } from '../hooks/useSettings';
import { PricingModal } from './PricingModal';
import { CheckoutModal } from './CheckoutModal';

interface TopNavbarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    onAddCreditsClick: () => void;
    isAdmin?: boolean;
    userTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
    activePage,
    onNavigate,
    onLogout,
    isAdmin
}) => {
    const { settings } = useSettings();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

    const userMenuRef = useRef<HTMLDivElement>(null);

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { id: 'dashboards', label: 'Dashboards', icon: <DashboardIcon className="w-4 h-4" />, page: 'home' },
        { id: 'conteudo', label: 'Conteúdo IA', icon: <BrainCircuitIcon className="w-4 h-4" />, page: 'multi-channel-publisher' },
        { id: 'gestao', label: 'Gestão de Lojas', icon: <ShoppingCartIcon className="w-4 h-4" />, page: 'product-search' },
        { id: 'integracoes', label: 'Integrações', icon: <LinkIcon className="w-4 h-4" />, page: 'integrations-hub' },
        { id: 'marketing', label: 'Marketing', icon: <TrendingUpIcon className="w-4 h-4" />, page: 'blog' },
        { id: 'suporte', label: 'Suporte', icon: <UsersIcon className="w-4 h-4" />, page: 'support' },
    ];

    const userName = 'Usuário ACI';
    const avatarUrl = `https://ui-avatars.com/api/?name=${userName.split(' ').map(n => n[0]).join('')}&background=0066FF&color=fff&size=64`;

    return (
        <>
            <header className="bg-[#1a1c24] border-b border-white/5 sticky top-0 z-[100] w-full">
                {/* Top bar com Logo e User Actions */}
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Burger Menu Button (Mobile) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>

                    {/* Logo ACI-Style */}
                    <button onClick={() => onNavigate('home')} className="flex flex-col items-start group">
                        <span className="text-4xl font-black text-white tracking-tighter leading-none group-hover:text-blue-500 transition-colors">ACI</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 hidden md:block">
                            AI Automation Suite
                        </span>
                    </button>

                    {/* Right side actions */}
                    <div className="flex items-center gap-4 text-xs md:text-sm">
                        <button className="p-2 text-slate-400 hover:text-white relative hidden sm:block">
                            <BellIcon className="w-6 h-6" />
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-[#1a1c24] flex items-center justify-center text-[10px] font-bold text-white">0</span>
                        </button>

                        <button
                            onClick={() => setIsPricingModalOpen(true)}
                            className="bg-[#2a2d3a] border border-white/10 rounded-xl px-3 md:px-4 py-2 flex items-center gap-2 md:gap-3 hover:bg-[#34384a] transition-all"
                        >
                            <CreditIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                            <span className="text-white font-bold tabular-nums">
                                {settings.credits.toLocaleString('pt-BR')}
                            </span>
                        </button>

                        <div ref={userMenuRef} className="relative ml-1 md:ml-2">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2"
                            >
                                <div className="relative">
                                    <img src={avatarUrl} alt="User" className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-blue-600" />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a1c24]"></span>
                                </div>
                                <ChevronDownIcon className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-3 w-56 bg-[#1f222e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <p className="text-white font-bold text-sm truncate">{userName}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">Saldo: R$ {(settings.credits / 1000).toFixed(2)}</p>
                                    </div>
                                    <div className="py-2">
                                        <button onClick={() => { onNavigate('user-settings' as any); setIsUserMenuOpen(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
                                            <SettingsIcon className="w-4 h-4" /> Configurações
                                        </button>
                                        <button onClick={onLogout} className="w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors">
                                            <LogoutIcon className="w-4 h-4" /> Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-menu Horizontal / Mobile Drawer */}
                <div className={`
                    ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} 
                    max-w-[1800px] mx-auto px-6 flex-col md:flex-row items-stretch md:items-center gap-2 pb-2 md:pb-2 
                    ${isMobileMenuOpen ? 'absolute left-0 right-0 bg-[#1a1c24] border-b border-white/10 pb-6 animate-in slide-in-from-top-4' : ''}
                `}>
                    {menuItems.map((item) => {
                        const isActive = activePage === item.page || (item.id === 'dashboards' && activePage === 'home');
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.page as Page);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`flex items-center gap-3 md:gap-2 px-5 py-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all group ${isActive
                                    ? 'bg-[#6B7AFF] text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}>
                                    {item.icon}
                                </span>
                                <span className="flex-1 md:flex-none text-left">{item.label}</span>
                                <ChevronDownIcon className="w-3 h-3 opacity-50 hidden md:block" />
                            </button>
                        );
                    })}
                </div>

                {/* Barra de Alerta Vermelho Ferrari (Premium) */}
                <div className="w-full bg-gradient-to-r from-[#D2201F] to-[#FF2800] py-1 relative overflow-hidden shadow-red-600/20 shadow-lg">
                    <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-center gap-2">
                        <ZapIcon className="w-4 h-4 text-white fill-current animate-pulse" />
                        <p className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-wider text-center">
                            CADA CLIQUE NO BOTÃO BUSCAR CONSOME <span className="bg-white text-[#D2201F] px-2 py-0.5 rounded mx-1">R$0,09</span> EM CRÉDITOS.
                        </p>
                    </div>
                    {/* Efeito de brilho na barra */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite] pointer-events-none"></div>
                </div>
            </header>

            {/* Modais Movidos para Fora da Tag Header para evitar problemas de contexto de Z-Index */}
            <PricingModal
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                onSelectPackage={(id, price, credits, bonus, total) => {
                    setSelectedPackage({ id, price, credits, bonus, total });
                    setIsPricingModalOpen(false);
                    setIsCheckoutModalOpen(true);
                }}
            />

            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                initialPackage={selectedPackage}
            />
        </>
    );
};

export default TopNavbar;
