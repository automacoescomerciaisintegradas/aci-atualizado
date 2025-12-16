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
        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${active
            ? 'bg-brand-primary text-white shadow-lg shadow-indigo-500/30'
            : `text-dark-text-secondary hover:bg-slate-700/50 hover:text-dark-text-primary ${isSubItem ? 'pl-8' : ''}`
            }`}
        role="button"
        title={text}
    >
        {React.cloneElement(icon, { className: 'h-5 w-5 flex-shrink-0' })}
        <span className="ml-3 font-medium">{text}</span>
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
        <aside className="hidden md:flex w-64 flex-shrink-0 bg-dark-card p-4 flex-col h-full border-r border-dark-border">
            {/* Header */}
            <div>
                <div className="px-3 mb-6 mt-2">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                        ACI
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
                <div className="p-3 bg-slate-800/50 rounded-lg mb-4 border border-dark-border">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center text-dark-text-secondary">
                            <span className="font-medium">Créditos</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-dark-text-primary">
                            <CreditIcon className="h-5 w-5 text-purple-400" />
                            <span>{settings.credits.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary h-1.5 rounded-full" style={{ width: `${creditsPercentage}%` }}></div>
                    </div>
                </div>
                <nav className="space-y-1 border-t border-dark-border pt-4">
                    <NavLink icon={<SettingsIcon />} text="Admin" active={activePage === 'admin'} onClick={() => onNavigate('admin')} />
                    <NavLink icon={<UserIcon />} text="Minha Conta" active={activePage === 'profile'} onClick={() => onNavigate('profile')} />
                    {isAdmin && <NavLink icon={<SettingsIcon />} text="Super Admin" active={activePage === 'user-settings'} onClick={() => onNavigate('user-settings')} />}
                </nav>
            </div>
        </aside>
    );
};
