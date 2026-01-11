import React, { useState, useEffect } from 'react';
import { DashboardIcon, LinkIcon, ImageIcon, ChatIcon, UserIcon, CreditIcon, SettingsIcon, ChevronDownIcon } from './Icons';
import type { Page } from '../App';
import { useSettings } from '../hooks/useSettings';
import { navConfig, NavItem } from './navConfig';

interface NavLinkProps {
    icon: React.ReactElement<{ className?: string }>;
    text: string;
    active?: boolean;
    onClick?: () => void;
    isSubItem?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, text, active = false, onClick, isSubItem = false }) => (
    <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            if (onClick) {
                onClick();
            }
        }}
        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group ${active
            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg glow-primary'
            : `text-dark-text-secondary hover:bg-slate-700/50 hover:text-dark-text-primary hover:translate-x-1 ${isSubItem ? 'pl-8' : ''}`
            }`}
        role="button"
        title={text}
    >
        {React.cloneElement(icon, { className: `h-5 w-5 flex-shrink-0 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}` })}
        <span className="ml-3 font-medium">{text}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
    </a>
);


interface CollapsibleNavSectionProps {
    title: string;
    icon: React.ReactElement<{ className?: string }>;
    pages: Page[];
    activePage: Page;
    children: React.ReactNode;
    isInitiallyOpen?: boolean;
}

const CollapsibleNavSection: React.FC<CollapsibleNavSectionProps> = ({ title, icon, pages, activePage, children, isInitiallyOpen = false }) => {
    const isActiveSection = pages.includes(activePage);
    const [isOpen, setIsOpen] = useState(isActiveSection || isInitiallyOpen);

    useEffect(() => {
        if (!isInitiallyOpen) {
            setIsOpen(isActiveSection);
        } else {
            setIsOpen(true);
        }
    }, [isActiveSection, isInitiallyOpen]);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-dark-text-secondary hover:bg-slate-700/50 hover:text-dark-text-primary"
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    {React.cloneElement(icon, { className: 'h-5 w-5 flex-shrink-0' })}
                    <span className="ml-3 font-medium">{title}</span>
                </div>
                <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pt-1 pl-3 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
};

interface SidebarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    searchTerm: string;
    isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, searchTerm, isAdmin }) => {
    const { settings } = useSettings();
    const creditsPercentage = (settings.credits / 5000) * 100;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredNavConfig = navConfig.map(item => {
        if (item.type === 'link') {
            return item.text.toLowerCase().includes(lowerCaseSearchTerm) ? item : null;
        }

        if (item.type === 'section') {
            const isTitleMatch = item.title.toLowerCase().includes(lowerCaseSearchTerm);
            const matchingChildren = item.children.filter(child =>
                child.text.toLowerCase().includes(lowerCaseSearchTerm)
            );

            if (isTitleMatch || matchingChildren.length > 0) {
                return {
                    ...item,
                    children: isTitleMatch ? item.children : matchingChildren
                };
            }
        }
        return null;
    }).filter((item): item is NavItem => item !== null);

    return (
        <aside className="hidden md:flex w-64 flex-shrink-0 glass-card p-4 flex-col h-full border-r border-dark-border/50">
            {/* Header */}
            <div>
                <div className="px-3 mb-6 mt-2 flex items-center gap-3">
                    <div className="relative">
                        <img
                            src="/logo-aci.jpg"
                            alt="ACI Logo"
                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover border-2 border-brand-primary/50 shadow-lg glow-primary"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-card"></span>
                    </div>
                    <span className="text-2xl font-bold text-gradient">
                        Automações
                    </span>
                </div>
            </div>

            {/* Scrollable Nav */}
            <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                <nav className="space-y-1">
                    {filteredNavConfig.map((item) => {
                        if (item.type === 'link') {
                            return (
                                <NavLink
                                    key={item.page}
                                    icon={item.icon}
                                    text={item.text}
                                    active={activePage === item.page}
                                    onClick={() => onNavigate(item.page)}
                                />
                            );
                        }
                        if (item.type === 'section') {
                            return (
                                <CollapsibleNavSection
                                    key={item.title}
                                    title={item.title}
                                    icon={item.icon}
                                    pages={item.pages}
                                    activePage={activePage}
                                    isInitiallyOpen={searchTerm.length > 0}
                                >
                                    {item.children.map(child => (
                                        <NavLink
                                            key={child.page}
                                            icon={child.icon}
                                            text={child.text}
                                            active={activePage === child.page}
                                            onClick={() => onNavigate(child.page)}
                                            isSubItem
                                        />
                                    ))}
                                </CollapsibleNavSection>
                            );
                        }
                        return null;
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div>
                <div className="p-4 glass rounded-xl mb-4 border border-brand-primary/20 hover:border-brand-primary/40 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-2 text-dark-text-secondary">
                            <span className="status-dot online"></span>
                            <span className="font-medium">Créditos</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-gradient group-hover:scale-105 transition-transform">
                            <CreditIcon className="h-5 w-5 text-purple-400 animate-pulse-soft" />
                            <span>{settings.credits.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                    <div className="progress-premium">
                        <div className="progress-premium-bar" style={{ width: `${Math.min(creditsPercentage, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-dark-text-secondary/60 mt-2 text-center">Clique para adicionar mais</p>
                </div>
                <nav className="space-y-1 border-t border-dark-border/50 pt-4">
                    <NavLink icon={<SettingsIcon />} text="Admin" active={activePage === 'admin'} onClick={() => onNavigate('admin')} />
                    <NavLink icon={<UserIcon />} text="Minha Conta" active={activePage === 'profile'} onClick={() => onNavigate('profile')} />
                    {isAdmin && <NavLink icon={<SettingsIcon />} text="Super Admin" active={activePage === 'user-settings'} onClick={() => onNavigate('user-settings')} />}
                </nav>
            </div>
        </aside>
    );
};
