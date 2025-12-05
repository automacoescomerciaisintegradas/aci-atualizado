
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserIcon, CreditIcon, FileTextIcon, LogoutIcon, SearchIcon, SettingsIcon, BellIcon, DollarSignIcon, HelpCircleIcon, MenuIcon, XIcon, ChevronDownIcon, ChevronRightIcon, SparklesIcon, HomeIcon } from './Icons';
import type { Page } from '../App';
import { useSettings } from '../hooks/useSettings';
import { navConfig, NavItemSection } from './navConfig';

interface DashboardHeaderProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    onAddCreditsClick: () => void;
    onDownloadExtract: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activePage, onNavigate, onLogout, onAddCreditsClick, onDownloadExtract, searchTerm, onSearchChange }) => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const { settings } = useSettings();

    const userDropdownRef = useRef<HTMLDivElement>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));
    useClickOutside(mobileNavRef, () => setIsMobileNavOpen(false));

    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.userAgent.toUpperCase().includes('MAC'));
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Find current section and page name for Breadcrumbs
    const currentNavInfo = useMemo(() => {
        for (const section of navConfig) {
            if (section.type === 'section') {
                const foundPage = section.children.find(child => child.page === activePage);
                if (foundPage) {
                    return { sectionTitle: section.title, pageTitle: foundPage.text, icon: foundPage.icon };
                }
            } else if (section.type === 'link' && section.page === activePage) {
                 return { sectionTitle: '', pageTitle: section.text, icon: section.icon };
            }
        }
        return { sectionTitle: '', pageTitle: 'Dashboard', icon: null };
    }, [activePage]);


    const userMenuItems = [
        { icon: <UserIcon className="h-4 w-4" />, text: 'Minha Conta', action: () => onNavigate('profile') },
        { icon: <SettingsIcon className="h-4 w-4" />, text: 'Admin', action: () => onNavigate('admin') },
        { icon: <FileTextIcon className="h-4 w-4" />, text: 'Baixar Extrato', action: onDownloadExtract },
        { icon: <HelpCircleIcon className="h-4 w-4" />, text: 'FAQ', action: () => onNavigate('faq') },
    ];

    const userName = 'Usuário ACI';
    const avatarUrl = `https://ui-avatars.com/api/?name=${userName.split(' ').map(n => n[0]).join('')}&background=4f46e5&color=fff&size=64`;
    
    const closeMobileNav = () => setIsMobileNavOpen(false);

    return (
        <header className="bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0 z-30 sticky top-0 shadow-sm">
            <div className="flex items-center gap-4 md:gap-6">
                {/* Logo (Visible on Mobile) */}
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home');}} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 flex-shrink-0 md:hidden">
                   ACI
                </a>
                
                {/* Breadcrumbs (Desktop Only) */}
                <div className="hidden md:flex items-center text-sm text-dark-text-secondary bg-slate-800/40 px-4 py-1.5 rounded-full border border-dark-border/50">
                    <button className="hover:text-dark-text-primary cursor-pointer transition-colors flex items-center gap-1" onClick={() => onNavigate('home')}>
                        <HomeIcon className="h-4 w-4" />
                        <span>Home</span>
                    </button>
                    {currentNavInfo.sectionTitle && (
                        <>
                            <ChevronRightIcon className="h-3 w-3 mx-2 text-dark-text-secondary/50" />
                            <span className="text-dark-text-secondary/80">{currentNavInfo.sectionTitle}</span>
                        </>
                    )}
                    <ChevronRightIcon className="h-3 w-3 mx-2 text-dark-text-secondary/50" />
                    <span className="font-medium text-brand-primary flex items-center gap-2">
                        {currentNavInfo.icon && React.cloneElement(currentNavInfo.icon, { className: 'h-3.5 w-3.5' })}
                        {currentNavInfo.pageTitle}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
                 <div className="relative w-full max-w-xs hidden lg:block">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-text-secondary pointer-events-none" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-slate-800/50 border border-dark-border rounded-lg pl-9 pr-12 sm:pr-20 py-2 text-sm text-dark-text-primary placeholder-gray-500 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 hidden sm:flex py-1.5 pr-1.5 pointer-events-none">
                        <kbd className="inline-flex items-center rounded border border-dark-border px-2 text-xs font-sans font-medium text-dark-text-secondary/70">
                            {isMac ? '⌘' : 'Ctrl'}K
                        </kbd>
                    </div>
                </div>

                {/* Blog Link Highlight */}
                <button 
                    onClick={() => onNavigate('blog')}
                    className="hidden sm:flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-400/10 hover:bg-amber-400/20 px-3 py-2 rounded-lg border border-amber-400/20"
                    title="Acessar Blog de Ofertas"
                >
                    <SparklesIcon className="h-4 w-4" />
                    <span>Ofertas</span>
                </button>

                <button className="text-dark-text-secondary hover:text-dark-text-primary relative">
                    <BellIcon className="h-5 w-5"/>
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-dark-bg"></span>
                </button>

                <button onClick={onAddCreditsClick} className="hidden md:flex items-center gap-2 text-sm bg-slate-700/50 hover:bg-slate-700 text-dark-text-secondary font-medium py-2 px-3 rounded-lg transition-colors group" title="Seus Créditos">
                    <CreditIcon className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>{settings.credits.toLocaleString('pt-BR')}</span>
                </button>

                <div ref={userDropdownRef} className="relative">
                    <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 hover:border-brand-primary transition-colors overflow-hidden shadow-md">
                        <img src={avatarUrl} alt={`Avatar de ${userName}`} className="h-full w-full object-cover" />
                    </button>
                    {isUserDropdownOpen && (
                        <div className="absolute top-full mt-2 right-0 w-64 bg-dark-card border border-dark-border rounded-lg shadow-2xl p-2 z-20 animate-fade-in">
                            <div className="p-2 border-b border-dark-border mb-2 flex items-center gap-3">
                                 <img src={avatarUrl} alt={`Avatar de ${userName}`} className="h-10 w-10 rounded-full object-cover" />
                                 <div>
                                    <p className="text-sm font-semibold text-dark-text-primary">{userName}</p>
                                    <p className="text-xs text-dark-text-secondary truncate">usuario@exemplo.com</p>
                                 </div>
                            </div>
                            <div className="p-2">
                                 <div className="bg-slate-800/50 rounded-lg p-2 border border-dark-border">
                                    <div className="flex items-center justify-between text-xs mb-1 text-dark-text-secondary font-medium">
                                        <span>Créditos</span>
                                        <span className="font-bold text-purple-400 flex items-center gap-1">
                                            <CreditIcon className="h-4 w-4" />
                                            {settings.credits.toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                     <button onClick={()=>{ onAddCreditsClick(); setIsUserDropdownOpen(false); }} className="w-full flex items-center justify-center gap-1 text-xs bg-green-600/20 text-green-300 font-bold py-1 px-2 rounded hover:bg-green-600/30">
                                        <DollarSignIcon className="h-3 w-3"/> Adicionar
                                    </button>
                                 </div>
                            </div>
                            {userMenuItems.map(item => (
                                <a key={item.text} href="#" onClick={(e) => { e.preventDefault(); item.action(); setIsUserDropdownOpen(false); }} className="flex items-center w-full px-3 py-2 text-sm rounded-md text-dark-text-secondary hover:bg-slate-700/50 hover:text-dark-text-primary">
                                    {item.icon}
                                    <span className="ml-3">{item.text}</span>
                                </a>
                            ))}
                            <div className="border-t border-dark-border mt-2 pt-2">
                                 <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="flex items-center w-full px-3 py-2 text-sm rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300">
                                    <LogoutIcon className="h-4 w-4" />
                                    <span className="ml-3">Sair da Conta</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Nav Button */}
                <div ref={mobileNavRef} className="lg:hidden">
                    <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="text-dark-text-secondary hover:text-dark-text-primary p-1">
                        <MenuIcon className="h-6 w-6"/>
                    </button>
                    {isMobileNavOpen && (
                        <div className="absolute top-full mt-2 right-0 w-72 bg-dark-card border border-dark-border rounded-lg shadow-2xl p-4 z-20 animate-fade-in mr-4">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Pesquisar..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text-primary focus:ring-1 focus:ring-brand-primary"
                                />
                            </div>
                            <div className="mb-4">
                                <button 
                                    onClick={() => { onNavigate('blog'); closeMobileNav(); }}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-amber-400 bg-amber-400/10 px-3 py-2 rounded-lg border border-amber-400/20"
                                >
                                    <SparklesIcon className="h-4 w-4" />
                                    <span>Blog de Ofertas</span>
                                </button>
                            </div>
                            <h3 className="text-xs font-bold uppercase text-dark-text-secondary/50 mb-2">Navegação</h3>
                            <nav className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
                                {navConfig.map(item => {
                                    if (item.type === 'link') {
                                        return (
                                            <a key={item.page} href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.page); closeMobileNav(); }} className={`flex items-center gap-3 text-sm font-medium p-2 rounded-md ${activePage === item.page ? 'bg-brand-primary text-white' : 'text-dark-text-secondary'}`}>
                                                {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
                                                {item.text}
                                            </a>
                                        );
                                    }
                                    return (
                                        <div key={item.title} className="mt-2">
                                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-dark-text-secondary/50 mb-1 px-2">
                                                {React.cloneElement(item.icon, { className: 'h-4 w-4' })}
                                                {item.title}
                                            </h4>
                                            <div className="flex flex-col gap-1 pl-2 border-l border-dark-border/30 ml-2">
                                                {item.children.map(child => (
                                                    <a key={child.page} href="#" onClick={(e) => { e.preventDefault(); onNavigate(child.page); closeMobileNav(); }} className={`flex items-center gap-3 text-sm font-medium p-2 rounded-md ${activePage === child.page ? 'bg-brand-primary text-white' : 'text-dark-text-secondary'}`}>
                                                        {React.cloneElement(child.icon, { className: 'h-4 w-4' })}
                                                        {child.text}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
