import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, BellIcon, UserIcon, LogoutIcon, CreditIcon, SettingsIcon, HelpCircleIcon, SearchIcon } from './Icons';
import type { Page } from '../App';
import { useSettings } from '../hooks/useSettings';

// Ícones para as categorias
import {
    DashboardIcon, ShoppingCartIcon, BrainCircuitIcon, InstagramIcon, RocketIcon,
    TelegramIcon, LinkIcon, TrendingUpIcon, SearchIcon as SearchPageIcon,
    ShoppingCartSendIcon, BookIcon, FileTextIcon, MagicWandIcon, ImageIcon,
    ChatIcon, UserSearchIcon, SparklesIcon, DollarSignIcon, CreditCardIcon,
    UsersIcon, ZapIcon, DownloadIcon, CopyIcon
} from './Icons';

interface TopNavbarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    onAddCreditsClick: () => void;
    isAdmin?: boolean;
    userTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface MenuCategory {
    id: string;
    label: string;
    icon: React.ReactElement;
    items: { page: Page; label: string; icon: React.ReactElement }[];
}

const menuCategories: MenuCategory[] = [
    {
        id: 'dashboards',
        label: 'Dashboards',
        icon: <DashboardIcon className="h-4 w-4" />,
        items: [
            { page: 'home', label: 'Painel Principal', icon: <DashboardIcon className="h-4 w-4" /> },
            { page: 'profile', label: 'Minha Conta', icon: <UsersIcon className="h-4 w-4" /> },
            { page: 'precos', label: 'Créditos & Planos', icon: <DollarSignIcon className="h-4 w-4" /> },
            { page: 'payment-methods', label: 'Métodos de Pagamento', icon: <CreditCardIcon className="h-4 w-4" /> },
            { page: 'analytics', label: 'Análise de Desempenho', icon: <TrendingUpIcon className="h-4 w-4" /> },
        ]
    },
    {
        id: 'conteudo',
        label: 'Conteúdo Inteligentes',
        icon: <BrainCircuitIcon className="h-4 w-4" />,
        items: [
            { page: 'multi-channel-publisher', label: 'Publicador Multi-Canal', icon: <RocketIcon className="h-4 w-4" /> },
            { page: 'blog-creator', label: 'Criador de Post Blog', icon: <BookIcon className="h-4 w-4" /> },
            { page: 'aci-posts', label: 'Blog em Massa (CSV)', icon: <FileTextIcon className="h-4 w-4" /> },
        ]
    },
    {
        id: 'gestao',
        label: 'Gestão de Lojas',
        icon: <ShoppingCartIcon className="h-4 w-4" />,
        items: [
            { page: 'product-search', label: 'Busca de Produtos', icon: <SearchPageIcon className="h-4 w-4" /> },
            { page: 'top-sales', label: 'Top Vendas', icon: <TrendingUpIcon className="h-4 w-4" /> },
            { page: 'generate', label: 'Gerador de Link', icon: <LinkIcon className="h-4 w-4" /> },
            { page: 'shopee-lote', label: 'Envio em Lote', icon: <ShoppingCartSendIcon className="h-4 w-4" /> },
        ]
    },
    {
        id: 'integracoes',
        label: 'Integrações',
        icon: <LinkIcon className="h-4 w-4" />,
        items: [
            { page: 'integrations-hub', label: '⚙️ Central de Integrações', icon: <SettingsIcon className="h-4 w-4" /> },
            { page: 'instagram-connect', label: 'Instagram', icon: <InstagramIcon className="h-4 w-4" /> },
            { page: 'telegram', label: 'Telegram', icon: <TelegramIcon className="h-4 w-4" /> },
            { page: 'shopee-affiliate', label: 'Shopee Afiliado', icon: <ShoppingCartIcon className="h-4 w-4" /> },
            { page: 'whatsapp-business', label: 'WhatsApp Business', icon: <ChatIcon className="h-4 w-4" /> },
            { page: 'api-integration', label: 'Integração API', icon: <LinkIcon className="h-4 w-4" /> },
            { page: 'automation', label: 'Automação n8n', icon: <ZapIcon className="h-4 w-4" /> },
        ]
    },
    {
        id: 'premium-features',
        label: 'Recursos Premium',
        icon: <SparklesIcon className="h-4 w-4" />,
        items: [
            { page: 'ai-insights', label: 'Análises com IA', icon: <BrainCircuitIcon className="h-4 w-4" /> },
            { page: 'advanced-analytics', label: 'Analytics Avançado', icon: <TrendingUpIcon className="h-4 w-4" /> },
            { page: 'custom-automations', label: 'Automações Personalizadas', icon: <RocketIcon className="h-4 w-4" /> },
            { page: 'priority-support', label: 'Suporte Prioritário', icon: <HelpCircleIcon className="h-4 w-4" /> },
        ]
    },
    {
        id: 'marketing',
        label: 'Marketing Digital',
        icon: <TrendingUpIcon className="h-4 w-4" />,
        items: [
            { page: 'blog', label: 'Blog de Ofertas', icon: <SparklesIcon className="h-4 w-4" /> },
            { page: 'wordpress-blogs', label: 'Gerenciar Blogs', icon: <BookIcon className="h-4 w-4" /> },
        ]
    },
    {
        id: 'diversos',
        label: 'Diversos',
        icon: <CopyIcon className="h-4 w-4" />,
        items: [
            { page: 'support' as Page, label: 'Suporte', icon: <HelpCircleIcon className="h-4 w-4" /> },
            { page: 'guides' as Page, label: 'Guias e Tutoriais', icon: <BookIcon className="h-4 w-4" /> },
            { page: 'community' as Page, label: 'Participe Da Comunidade', icon: <UsersIcon className="h-4 w-4" /> },
            { page: 'download-plugin' as Page, label: 'Download Plugin', icon: <DownloadIcon className="h-4 w-4" /> },
        ]
    },
    {
        id: 'conta',
        label: 'Minha Conta',
        icon: <UserIcon className="h-4 w-4" />,
        items: [
            { page: 'profile', label: 'Perfil', icon: <UserIcon className="h-4 w-4" /> },
            { page: 'billing', label: 'Faturamento', icon: <FileTextIcon className="h-4 w-4" /> },
            { page: 'orders', label: 'Pedidos', icon: <ShoppingCartIcon className="h-4 w-4" /> },
            { page: 'faq', label: 'Perguntas Frequentes', icon: <HelpCircleIcon className="h-4 w-4" /> },
        ]
    },
];

// Hook para fechar dropdown ao clicar fora
const useClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };
        document.addEventListener("mousedown", listener);
        return () => document.removeEventListener("mousedown", listener);
    }, [ref, handler]);
};

// Componente de Dropdown de Categoria
const CategoryDropdown: React.FC<{
    category: MenuCategory;
    isOpen: boolean;
    onToggle: () => void;
    onNavigate: (page: Page) => void;
    activePage: Page;
}> = ({ category, isOpen, onToggle, onNavigate, activePage }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActiveCategory = category.items.some(item => item.page === activePage);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${isActiveCategory
                    ? 'bg-brand-primary text-white glow-primary'
                    : 'text-dark-text-secondary hover:text-white hover:bg-white/5'
                    }`}
            >
                {category.icon}
                <span>{category.label}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 dropdown-premium z-50 animate-fade-in">
                    <div className="py-2">
                        {category.items.map((item) => (
                            <button
                                key={item.page}
                                onClick={() => {
                                    if (item.page === ('download-plugin' as Page)) {
                                        const link = document.createElement('a');
                                        link.href = '/plugin-postagens-inteligentes.zip';
                                        link.download = 'plugin-postagens-inteligentes.zip';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        onToggle();
                                        return;
                                    }
                                    onNavigate(item.page);
                                    onToggle();
                                }}
                                className={`dropdown-item w-full text-left ${activePage === item.page ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {activePage === item.page && (
                                    <span className="ml-auto status-dot online"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
    activePage,
    onNavigate,
    onLogout,
    onAddCreditsClick,
    isAdmin,
    userTier
}) => {
    const { settings } = useSettings();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useClickOutside(navRef, () => setOpenDropdown(null));
    useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

    const handleDropdownToggle = (categoryId: string) => {
        setOpenDropdown(openDropdown === categoryId ? null : categoryId);
    };

    // Filtrar categorias com base no papel e nível do usuário
    const filteredCategories = menuCategories.filter(category => {
        // Se for a categoria de conta, sempre mostrar
        if (category.id === 'conta') return true;

        // Se for admin ou super_admin, mostrar todas as categorias
        if (isAdmin) return true;

        // Para usuários comuns, ocultar categorias específicas de admin
        if (category.id === 'admin-tools') return false;

        // Filtrar categorias com base no nível do usuário
        if (category.id === 'premium-features' && userTier &&
            (userTier === 'bronze' || userTier === 'silver')) {
            return false;
        }

        // Mostrar todas as outras categorias para usuários comuns
        return true;
    });

    const userName = 'Usuário ACI';
    const avatarUrl = `https://ui-avatars.com/api/?name=${userName.split(' ').map(n => n[0]).join('')}&background=6366f1&color=fff&size=64`;

    return (
        <header className="glass border-b border-white/5 sticky top-0 z-40">
            {/* Main Navigation Bar */}
            <div className="max-w-[2048px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="flex items-center justify-between h-14 md:h-16 lg:h-18">
                    {/* Logo */}
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => onNavigate('home')}
                            className="flex items-center hover-scale"
                        >
                            <img
                                src="/logo-aci.png"
                                alt="ACI - Automações Comerciais Integradas"
                                className="h-12 w-auto object-contain rounded-lg"
                            />
                        </button>

                        {/* Navigation Menu */}
                        <nav ref={navRef} className="hidden lg:flex items-center gap-1">
                            {filteredCategories.map((category) => (
                                <CategoryDropdown
                                    key={category.id}
                                    category={category}
                                    isOpen={openDropdown === category.id}
                                    onToggle={() => handleDropdownToggle(category.id)}
                                    onNavigate={onNavigate}
                                    activePage={activePage}
                                />
                            ))}
                        </nav>
                    </div>

                    {/* Right Side - Search, Notifications, User */}
                    <div className="flex items-center gap-3">
                        {/* Search Button (expandable) */}
                        <div className="relative hidden sm:block">
                            {isSearchOpen ? (
                                <div className="flex items-center glass-light rounded-lg overflow-hidden animate-scale-in">
                                    <SearchIcon className="h-4 w-4 text-dark-text-secondary ml-3" />
                                    <input
                                        type="text"
                                        placeholder="Procurar..."
                                        className="bg-transparent border-none outline-none px-3 py-2 text-sm text-white placeholder:text-dark-text-secondary w-48"
                                        autoFocus
                                        onBlur={() => setIsSearchOpen(false)}
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2.5 rounded-lg glass-light text-dark-text-secondary hover:text-white transition-colors"
                                >
                                    <SearchIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2.5 rounded-lg glass-light text-dark-text-secondary hover:text-white transition-colors">
                            <BellIcon className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-dark-card animate-pulse"></span>
                        </button>

                        {/* Credits Button */}
                        <button
                            onClick={onAddCreditsClick}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg glass-light text-dark-text-secondary hover:text-white transition-all group"
                        >
                            <CreditIcon className="h-4 w-4 text-purple-400 group-hover:animate-pulse" />
                            <span className="font-semibold">{settings.credits.toLocaleString('pt-BR')}</span>
                        </button>

                        {/* User Menu */}
                        <div ref={userMenuRef} className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <div className="relative">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="h-9 w-9 rounded-full border-2 border-brand-primary/50"
                                    />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-card"></span>
                                </div>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 dropdown-premium z-50 animate-fade-in">
                                    {/* User Info Header */}
                                    <div className="p-4 flex items-center gap-3">
                                        <div className="relative">
                                            <img src={avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full border-2 border-blue-500" />
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-card"></span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-base">{userName}</p>
                                            <p className="text-xs text-dark-text-secondary">Usuário</p>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        {/* Créditos */}
                                        <div className="dropdown-item cursor-default">
                                            <CreditIcon className="h-5 w-5 text-dark-text-secondary" />
                                            <span className="text-dark-text-secondary">Crédito:</span>
                                            <span className="ml-auto font-semibold text-white">R$ {(settings.credits / 1100).toFixed(2).replace('.', ',')}</span>
                                        </div>

                                        <div className="divider-premium my-1"></div>

                                        {/* Meu Perfil */}
                                        <button
                                            onClick={() => { onNavigate('user-profile' as any); setIsUserMenuOpen(false); }}
                                            className="dropdown-item w-full"
                                        >
                                            <UserIcon className="h-5 w-5" />
                                            <span>Meu Perfil</span>
                                        </button>

                                        {/* Extrato / Cobrança */}
                                        <button
                                            onClick={() => { onNavigate('user-billing' as any); setIsUserMenuOpen(false); }}
                                            className="dropdown-item w-full"
                                        >
                                            <FileTextIcon className="h-5 w-5" />
                                            <span>Extrato</span>
                                        </button>

                                        {/* Adicionar Crédito */}
                                        <button
                                            onClick={() => { onNavigate('credit-purchase' as any); setIsUserMenuOpen(false); }}
                                            className="dropdown-item w-full"
                                        >
                                            <DollarSignIcon className="h-5 w-5" />
                                            <span>Adicionar Crédito</span>
                                        </button>

                                        {/* Pedidos */}
                                        <button
                                            onClick={() => { onNavigate('user-orders' as any); setIsUserMenuOpen(false); }}
                                            className="dropdown-item w-full"
                                        >
                                            <ShoppingCartIcon className="h-5 w-5" />
                                            <span>Pedidos</span>
                                        </button>

                                        {/* Admin - Aparece apenas para admins */}
                                        {isAdmin && (
                                            <>
                                                <div className="divider-premium my-1"></div>
                                                <button
                                                    onClick={() => { onNavigate('admin'); setIsUserMenuOpen(false); }}
                                                    className="dropdown-item w-full"
                                                >
                                                    <SettingsIcon className="h-5 w-5" />
                                                    <span>Admin</span>
                                                </button>
                                            </>
                                        )}

                                        <div className="divider-premium my-1"></div>

                                        {/* FAQ */}
                                        <button
                                            onClick={() => { onNavigate('faq'); setIsUserMenuOpen(false); }}
                                            className="dropdown-item w-full"
                                        >
                                            <HelpCircleIcon className="h-5 w-5" />
                                            <span>FAQ</span>
                                        </button>

                                        {/* Sair */}
                                        <button
                                            onClick={onLogout}
                                            className="dropdown-item w-full text-dark-text-secondary hover:text-white"
                                        >
                                            <LogoutIcon className="h-5 w-5" />
                                            <span>Sair</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
