import React from 'react';

interface HeaderProps {
    onAuthClick: () => void;
}

const AciLogo: React.FC = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#CCFF00" />
        <path d="M30 75V25L50 45L70 25V75" stroke="#0A0A0A" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ onAuthClick }) => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border/50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
            <a href="#" className="flex items-center gap-2 text-2xl font-bold text-dark-text-primary">
                <AciLogo />
                <span className="hidden sm:inline">ACI</span>
            </a>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-dark-text-secondary">
                <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dark-text-primary transition-colors cursor-pointer">Sobre</a>
                <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dark-text-primary transition-colors cursor-pointer">Funcionalidades</a>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dark-text-primary transition-colors cursor-pointer">Planos</a>
                <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-dark-text-primary transition-colors cursor-pointer">FAQ</a>
            </div>
            <button
                onClick={onAuthClick}
                className="bg-lime-accent text-dark-bg text-sm font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity transform hover:scale-105 shadow-[0_4px_20px_rgba(204,255,0,0.5)]"
            >
                Começar Agora
            </button>
        </nav>
    </header>
);