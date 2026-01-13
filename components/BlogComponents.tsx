import React, { useState, useEffect } from 'react';

// Define Page type locally to break circular dependency
type Page = string;
import {
    SearchIcon,
    MenuIcon,
    InstagramIcon,
    FacebookIcon,
    RocketIcon,
    ShoppingCartIcon,
    ChevronDownIcon,
    XIcon,
    TwitterIcon,
    YoutubeIcon,
    MailIcon
} from './Icons';

interface BlogHeaderProps {
    onNavigate: (page: Page) => void;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({ onNavigate, activeCategory, onCategoryChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        console.log('🔗 BlogHeader mounted');
    }, []);

    const categories = [
        { name: 'Todas', id: 'Todas' },
        { name: 'Shopee', id: 'Shopee' },
        { name: 'Mercado Livre', id: 'Mercado Livre' },
        { name: 'Amazon', id: 'Amazon' },
        { name: 'Eletrônicos', id: 'Eletrônicos' },
        { name: 'Moda', id: 'Moda' },
        { name: 'Tutoriais', id: 'Tutorial' }
    ];

    const menuItems = [
        { label: 'Início', page: 'home' as Page },
        { label: 'Produtos', page: 'product-search' as Page },
        { label: 'Sobre', page: 'faq' as Page },
        { label: 'Contato', page: 'priority-support' as Page },
    ];

    return (
        <header className="w-full z-50">
            {/* Top Bar with Social Icons and Search */}
            <div className="bg-[#050505] border-b border-white/5 py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <a href="#" className="p-1.5 text-gray-400 hover:text-white transition-colors">
                            <FacebookIcon className="h-4 w-4" />
                        </a>
                        <a href="#" className="p-1.5 text-gray-400 hover:text-white transition-colors">
                            <InstagramIcon className="h-4 w-4" />
                        </a>
                        <a href="#" className="p-1.5 text-gray-400 hover:text-white transition-colors">
                            <TwitterIcon className="h-4 w-4" />
                        </a>
                        <a href="#" className="p-1.5 text-gray-400 hover:text-white transition-colors">
                            <YoutubeIcon className="h-4 w-4" />
                        </a>
                    </div>

                    <div className="hidden sm:flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-[#FCD535]">
                            <RocketIcon className="h-3.5 w-3.5" /> Fique por dentro!
                        </div>
                        <button className="text-[10px] font-black uppercase text-gray-300 hover:text-white tracking-widest border-b border-white/20 transition-all">Inscrever-se</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-gray-300 hover:bg-white/5 rounded-full transition-all"
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 sm:hidden text-gray-300 hover:bg-white/5 rounded-full"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header / Logo */}
            <div className="bg-[#050505] py-8 border-b border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <div
                        onClick={() => onCategoryChange('Todas')}
                        className="cursor-pointer group flex flex-col items-center"
                    >
                        <div className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-2 select-none">
                            ACI<span className="text-[#3b82f6]">BLOG</span>
                        </div>
                        <div className="h-1 w-20 bg-[#FCD535] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-black mt-2">Tecnologia & Economia</span>
                    </div>
                </div>
            </div>

            {/* Navigation Strip */}
            <div className="bg-[#050505] border-b border-white/5 sticky top-0 backdrop-blur-md bg-opacity-80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center justify-center gap-8 py-4">
                        <div className="hidden lg:flex items-center gap-8">
                            {menuItems.map(item => (
                                <button
                                    key={item.label}
                                    onClick={() => onNavigate(item.page)}
                                    className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-4 w-px bg-white/10 hidden lg:block"></div>

                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth px-4">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => onCategoryChange(cat.id)}
                                    className={`text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat.id
                                            ? 'text-white border-b-2 border-[#FCD535] pb-1'
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-[#050505] p-6 animate-fade-in sm:hidden">
                    <div className="flex justify-between items-center mb-12">
                        <div className="text-2xl font-black text-white">ACI<span className="text-blue-500">BLOG</span></div>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white">
                            <XIcon className="h-8 w-8" />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-8">
                        {menuItems.map(item => (
                            <button
                                key={item.label}
                                onClick={() => { onNavigate(item.page); setIsMenuOpen(false); }}
                                className="text-2xl font-black uppercase text-left text-white"
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[70] bg-[#050505]/95 backdrop-blur-xl animate-fade-in flex items-center justify-center p-6">
                    <button
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute top-10 right-10 p-4 text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <XIcon className="h-10 w-10" />
                    </button>
                    <div className="w-full max-w-3xl transform">
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="O que você está procurando?"
                                className="w-full bg-transparent border-b-4 border-white/20 text-4xl md:text-6xl font-black text-white px-2 py-6 focus:border-[#FCD535] outline-none transition-all placeholder:text-gray-800"
                            />
                            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 text-gray-700" />
                        </div>
                        <p className="mt-8 text-gray-500 font-bold uppercase tracking-widest">Pressione ESC para fechar ou ENTER para buscar</p>
                    </div>
                </div>
            )}
        </header>
    );
};

export const BlogFooter: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
    return (
        <footer className="bg-[#050505] pt-24 pb-12 border-t border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="text-2xl font-black text-white tracking-tighter">ACI<span className="text-blue-500">BLOG</span></div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sua fonte confiável para as melhores ofertas, cupons e dicas de economia nas maiores lojas do Brasil.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-white hover:bg-blue-600 transition-all">
                                <FacebookIcon className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-white hover:bg-blue-600 transition-all">
                                <InstagramIcon className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-white hover:bg-blue-600 transition-all">
                                <TwitterIcon className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-white hover:bg-blue-600 transition-all">
                                <YoutubeIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Categorias</h4>
                        <ul className="space-y-4">
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Tecnologia</button></li>
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Moda & Estilo</button></li>
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Casa & Decoração</button></li>
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Games</button></li>
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Tutoriais</button></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Empresa</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => onNavigate('faq')} className="text-sm text-gray-400 hover:text-white transition-colors">Sobre Nós</button></li>
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Privacidade</button></li>
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Termos de Uso</button></li>
                            <li><button onClick={() => onNavigate('priority-support' as Page)} className="text-sm text-gray-400 hover:text-white transition-colors">Contato</button></li>
                            <li><button className="text-sm text-gray-400 hover:text-white transition-colors">Trabalhe Conosco</button></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl relative">
                        <div className="absolute -top-6 left-6 p-3 bg-blue-600 rounded-xl shadow-lg">
                            <MailIcon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-white font-bold mb-3 mt-2">Novidades por E-mail</h4>
                        <p className="text-xs text-gray-500 mb-6">
                            Receba alertas de promoções imperdíveis diretamente na sua caixa de entrada.
                        </p>
                        <form className="space-y-3" onSubmit={e => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            />
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest">
                                Inscrever
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-gray-500">
                        Copyright © 2024 Automações Comerciais. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-6">
                        <button className="text-xs text-gray-500 hover:text-white transition-colors">Termos de Uso</button>
                        <button className="text-xs text-gray-500 hover:text-white transition-colors">Privacidade</button>
                        <button className="text-xs text-gray-500 hover:text-white transition-colors">Cookies</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
