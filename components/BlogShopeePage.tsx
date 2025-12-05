import React, { useState } from 'react';
import { OfferCarousel } from './OfferCarousel';
import { Page } from '../App';
import { RocketIcon, ShopeeIcon, AmazonIcon, MercadoLivreIcon, ChevronDownIcon, ChevronUpIcon, TrendingUpIcon, MenuIcon } from './Icons';
import { offerProducts } from './OfferData';
import { useSettings } from '../hooks/useSettings';


const popularCategories = [
    { emoji: '📱', name: 'Eletrônicos' },
    { emoji: '👟', name: 'Moda' },
    { emoji: '🏠', name: 'Casa' },
    { emoji: '💄', name: 'Beleza' },
    { emoji: '⌨️', name: 'Informática' },
    { emoji: '⚽', name: 'Esportes' },
    { emoji: '📚', name: 'Livros' },
    { emoji: '🧸', name: 'Brinquedos' },
    { emoji: '🍳', name: 'Cozinha' },
    { emoji: '🎲', name: 'Jogos' },
    { emoji: '🐾', name: 'Pet Shop' },
    { emoji: '🔧', name: 'Ferramentas' },
];

const trendingKeywords = [
    "Presépio", "Óculos de Sol", "Lingerie", "Óculos", "Roupa Feminina", "Projetor", 
    "Vestido Midi", "Lustre", "Decoração de Natal", "Vibrador", "Relógio Masculino", 
    "Chaveiro", "Espelho", "Lego", "PC Gamer", "Camisa Masculina", "Sofá", 
    "Rasteirinha", "Enfeite de Natal", "Cômoda", "route81moto", "Expositor Salgadinhos", 
    "Macaquinho Manga Plus Size", "Mini Body Splash", "Kit Cuia Bomba Chimarrão", 
    "Donna Carioca", "Macacão Sherpa Bebê", "Biquini Infantil Feminino", "Zeblaze", 
    "Brasil", "Macacão Jeans Gestante"
];

const allShopeeCategories = [
    { name: "Roupas Femininas", subs: ["Vestidos", "Blusas", "Saias", "Shorts", "Jeans", "Calças e Leggings", "Conjuntos", "Lingerie e Roupa Íntima", "Traje para dormir e Pijamas", "Macacões, Macaquinhos e Jardineiras", "Jaquetas, Casacos e Coletes", "Moletons e Suéteres", "Agasalhos e Cardigans", "Roupas de Maternidade", "Meias", "Roupas Tradicionais", "Fantasias e Cosplay", "Vestidos de Casamento", "Tecidos", "Outros"] },
    { name: "Sapatos Femininos", subs: ["Tênis", "Botas", "Saltos e Tamancos", "Sandálias e Chinelos", "Sapatos", "Plataformas", "Cuidados com Calçados e Acessórios", "Outros"] },
    { name: "Celulares e Dispositivos", subs: ["Celulares", "Tablets", "Acessórios", "Aparelhos Vestíveis", "Walkie Talkies", "Outros"] },
    { name: "Saúde", subs: ["Suplementos Alimentares", "Cuidados Pessoais", "Bem-Estar Sexual", "Suprimentos Médicos", "Outros"] },
    { name: "Animais Domésticos", subs: ["Ração dos Animais Domésticos", "Cuidados com Animais Domésticos", "Bem-Estar dos Animais Domésticos", "Cama e Banheiro", "Acessórios para Animais de Estimação", "Roupas e Acessórios para Animais Domésticos", "Outros"] },
    { name: "Câmeras e Drones", subs: ["Cuidados com a Câmera", "Acessórios de Lentes", "Câmeras", "Lentes", "Câmeras e Sistemas de Segurança", "Acessórios de Câmera", "Acessórios de Drones", "Drones", "Outros"] },
    { name: "Casa e Construção", subs: ["Decoração", "Artigos de Cozinha", "Roupas de Cama", "Móveis", "Banheiros", "Louça", "Iluminação", "Organizadores para Casa", "Fragrância da Casa e Aromaterapia", "Artigos de Cuidados com a Casa", "Jardinagem", "Artigos de Festa", "Ferramentas e Melhorias para a Casa", "Segurança", "Artigos Religiosos e de Fengshui", "Aquecedores de Mãos, Bolsas de Água Quente e Bolsas de Gelo", "Outros"] },
    { name: "Sapatos Masculinos", subs: ["Tênis", "Botas", "Sandálias e Chinelos", "Slip on e Mule", "Mocassins", "Oxfords", "Acessórios e Cuidados para Calçados", "Outros"] },
    { name: "Esportes e Lazer", subs: ["Equipamentos Esportivos e Recreação ao Ar Livre", "Vestimentas Esportivas e para o Ar Livre", "Calçados Esportivos", "Acessórios Esportivos e Atividades ao Ar Livre", "Outros"] },
    { name: "Áudio", subs: ["Reprodutores de Mídia", "Fones de Ouvido, Headphones e Headsets", "Microfones", "Amplificadores e Mixers", "Áudio e Alto Falantes para Casa", "Cabos e Conversores de Áudio e Vídeo", "Outros"] },
    { name: "Papelaria", subs: ["Cadernos e Papéis", "Escrita e Correção", "Equipamento Escolar e de Escritório", "Artigos de Arte", "Presentes e Embalagens", "Cartas e Envelopes", "Outros"] },
    { name: "Viagens e Bagagens", subs: ["Malas de Viagem", "Bagagens", "Acessórios de Viagem", "Outros"] },
    { name: "Roupas Plus Size", subs: ["Roupas Esportivas", "Outros", "Roupas Femininas", "Roupas Masculinas"] },
    { name: "Moda Infantil", subs: ["Roupas de Meninas", "Roupas de Meninos", "Calçados de Menina", "Calçados de Menino", "Acessórios Infantis", "Luvas e Calçados Infantis", "Roupas Infantis", "Outros"] },
    { name: "Eletrodomésticos", subs: ["Utensílios de Cozinha", "Eletrodomésticos Pequenos", "Projetores e Acessórios", "Baterias", "Eletrodomésticos Grandes", "TVs e Acessórios", "Peças e Circuitos Elétricos", "Controles Remoto", "Outros"] },
    { name: "Mãe e Bebê", subs: ["Banho e Cuidados com o Corpo", "Acessórios para Grávidas", "Brinquedos", "Fraldas e Penicos", "Berçário", "Coisas Essenciais para Viagens com Bebês", "Saúde na Gravidez", "Segurança do Bebê", "Leite em Pó e Comida para Bebês", "Cuidados com a Saúde do Bebê", "Alimentos Essenciais", "Pacotes e Conjuntos de Presentes", "Outros"] },
    { name: "Computadores e Acessórios", subs: ["Equipamentos de Escritório", "Impressoras e Scanners", "Armazenamento de Dados", "Acessórios e Periféricos", "Computadores Desktop", "Componentes de Computadores e Notebooks", "Monitores", "Notebooks", "Componentes de Rede", "Teclados e Mouses", "Outros"] },
    { name: "Livros e Revistas", subs: ["Livros", "Revistas e Jornais", "Outros"] },
    { name: "Beleza", subs: ["Maquiagem", "Cuidados com o Cabelo", "Perfumes e Fragrâncias", "Banho e Cuidados com o Corpo", "Cuidados com a Pele", "Utensílios de Beleza", "Cuidados com as Mãos, Pés e Unhas", "Cuidados Masculinos", "Pacotes e Conjuntos de Beleza", "Outros"] },
    { name: "Acessórios de Moda", subs: ["Óculos", "Anéis", "Colares", "Bonés, Chapéus e Toucas", "Pulseiras e Braceletes", "Brincos", "Cintos", "Cachecóis e Lenços", "Conjuntos e Pacotes de Acessórios", "Acessórios de Cabelo", "Tornozeleiras", "Luvas", "Gravatas e Gravatas Borboleta", "Metais Preciosos de Investimento", "Acessórios Adicionais", "Outros"] },
    { name: "Brinquedos e Hobbies", subs: ["Brinquedos e Jogos", "Instrumentos Musicais e Acessórios", "Itens Colecionáveis", "Souvenirs", "Álbum de Fotos", "CD, DVD e Bluray", "Discos de Vinil", "Bordado", "Outros"] },
    { name: "Bolsas Femininas", subs: ["Bolsas transversais e de ombro", "Bolsas Tote", "Mochilas", "Bolsas com alça", "Carteiras", "Malas de Notebook", "Pochetes e Chest Bags", "Clutches & Carteiras", "Acessórios de Bolsas", "Outros"] },
    { name: "Alimentos e Bebidas", subs: ["Lanches", "Padaria", "Bebidas Alcoólicas", "Bebidas", "Essenciais para Culinária", "Cereais e Geléias de Café da Manhã", "Conjunto de Presentes e Cestas", "Conveniência / Pronto-para-comer", "Laticínios", "Essenciais para Assar", "Alimentos básicos", "Outros"] },
    { name: "Shopee Doações", subs: [] },
    { name: "Roupas Masculinas", subs: ["Blusas", "Moletons e Suéteres", "Jaquetas, Casacos e Coletes", "Calças", "Jeans", "Roupa íntima", "Bermudas", "Agasalhos e Cardigans", "Meias", "Traje para dormir", "Conjuntos", "Ternos", "Roupas Tradicionais", "Fantasias e Cosplay", "Vestuário Profissional", "Outros"] },
    { name: "Relógios", subs: ["Relógios Masculinos", "Relógios Femininos", "Acessórios de Relógios", "Conjuntos e Pares de Relógios", "Outros"] },
    { name: "Acessórios para Veículos", subs: ["Pneus e Rodas", "Acessórios Internos para Automóveis", "Acessórios Externos para Automóveis", "Peças de Reposição para Automóveis", "Ferramentas Veiculares", "Limpeza Veicular", "Segurança Veicular", "Peças de Reposição para Motocicletas", "Acessórios para Motocicletas", "Veículos Pesados e Barcos", "Outros"] },
    { name: "Bolsas Masculinas", subs: ["Mochilas", "Mala de Notebook", "Carteiras", "Pochetes e Chest bags", "Pastas", "Bolsas Tranversais e de ombro", "Bolsas de Mão", "Bolsas Tote", "Outros"] },
    { name: "Jogos e Consoles", subs: ["Consoles", "Acessórios de Consoles", "Jogos", "Outros"] },
];

const filterCategories = ['Todas', ...Array.from(new Set(offerProducts.map(p => p.category)))];

const CategoryAccordion: React.FC<{ category: typeof allShopeeCategories[0] }> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-dark-border rounded-lg bg-dark-card overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
            >
                <span className="font-semibold text-dark-text-primary">{category.name}</span>
                {isOpen ? <ChevronUpIcon className="h-5 w-5 text-brand-secondary"/> : <ChevronDownIcon className="h-5 w-5 text-dark-text-secondary"/>}
            </button>
            {isOpen && (
                <div className="p-4 bg-dark-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {category.subs.map((sub, idx) => (
                        <a 
                            key={idx} 
                            href={`https://shopee.com.br/search?keyword=${encodeURIComponent(sub)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-dark-text-secondary hover:text-brand-primary transition-colors p-1"
                        >
                            {sub}
                        </a>
                    ))}
                    {category.subs.length === 0 && <p className="text-xs text-dark-text-secondary">Sem subcategorias.</p>}
                </div>
            )}
        </div>
    );
};

export const BlogShopeePage: React.FC<{onNavigate: (page: Page) => void}> = ({ onNavigate }) => {
    const [activeCategory, setActiveCategory] = useState('Todas');
    const { settings } = useSettings();

    return (
        <div className="animate-fade-in">
             <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-dark-text-primary mb-4">
                    🔥 Ofertas Imperdíveis
                </h1>
                <p className="text-xl text-dark-text-secondary max-w-3xl mx-auto">
                    As melhores promoções de Shopee, Mercado Livre e Amazon em um só lugar
                </p>
                <div className="flex justify-center gap-4 flex-wrap mt-6">
                    <span className="bg-dark-card border border-dark-border px-6 py-3 rounded-full font-bold text-dark-text-primary shadow-sm">
                        🏷️ Até 70% OFF
                    </span>
                    <span className="bg-dark-card border border-dark-border px-6 py-3 rounded-full font-bold text-dark-text-primary shadow-sm">
                        🚚 Frete Grátis
                    </span>
                    <span className="bg-dark-card border border-dark-border px-6 py-3 rounded-full font-bold text-dark-text-primary shadow-sm">
                        ⚡ Entrega Rápida
                    </span>
                </div>
             </div>

            {/* Trending Searches Section */}
            <div className="mb-12 bg-dark-card/30 p-6 rounded-xl border border-dark-border/50">
                <h3 className="text-lg font-bold text-dark-text-primary mb-4 flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-lime-accent" />
                    Buscas em Alta
                </h3>
                <div className="flex flex-wrap gap-2">
                    {trendingKeywords.map(keyword => (
                        <a
                            key={keyword}
                            href={`https://shopee.com.br/search?keyword=${encodeURIComponent(keyword)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-brand-primary hover:text-white border border-dark-border rounded-full text-dark-text-secondary transition-all duration-200"
                        >
                            {keyword}
                        </a>
                    ))}
                </div>
            </div>
            
            <div className="mb-12">
                <div className="flex justify-center flex-wrap gap-3">
                    {filterCategories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                activeCategory === category
                                    ? 'bg-brand-primary text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-dark-card border border-dark-border text-dark-text-secondary hover:bg-slate-700/50 hover:text-dark-text-primary'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

             <OfferCarousel filterCategory={activeCategory} />

            {/* Popular Categories Grid */}
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-dark-text-primary mb-8 text-center">Categorias Populares</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {popularCategories.map(cat => (
                         <a 
                            key={cat.name} 
                            href={`https://shopee.com.br/search?keyword=${encodeURIComponent(cat.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-dark-card border border-dark-border rounded-xl p-6 text-center hover:shadow-lg hover:border-brand-primary/50 transition-all group flex flex-col items-center justify-center"
                        >
                            <div className="text-4xl mb-2">{cat.emoji}</div>
                            <div className="font-bold text-dark-text-primary group-hover:text-brand-secondary transition-colors text-sm">{cat.name}</div>
                        </a>
                    ))}
                </div>
            </div>

             {/* Platform Info */}
            <div className="mt-16">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white">
                        <h3 className="text-2xl font-black mb-3 flex items-center gap-2"><ShopeeIcon className="h-6 w-6"/> Shopee</h3>
                        <p className="text-orange-100 mb-4">Frete grátis em milhares de produtos + cupons exclusivos</p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Cashback</span>
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Frete Grátis</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-8 text-slate-900">
                        <h3 className="text-2xl font-black mb-3 flex items-center gap-2"><MercadoLivreIcon className="h-6 w-6 stroke-slate-900"/> Mercado Livre</h3>
                        <p className="text-slate-700 mb-4">Entrega rápida com Mercado Envios + garantia de devolução</p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="bg-slate-900 bg-opacity-10 px-3 py-1 rounded-full font-bold">Meli+</span>
                            <span className="bg-slate-900 bg-opacity-10 px-3 py-1 rounded-full font-bold">Full</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-orange-900 rounded-2xl p-8 text-white">
                        <h3 className="text-2xl font-black mb-3 flex items-center gap-2"><AmazonIcon className="h-6 w-6"/> Amazon</h3>
                        <p className="text-orange-100 mb-4">Milhões de produtos + entrega Prime em 1 dia</p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Prime</span>
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">1 Dia</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* All Categories Directory */}
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-dark-text-primary mb-8 text-center flex items-center justify-center gap-3">
                    <MenuIcon className="h-8 w-8 text-brand-secondary" />
                    Todas as Categorias
                </h2>
                <p className="text-center text-dark-text-secondary mb-8 -mt-6">Explore o diretório completo de departamentos da Shopee</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {allShopeeCategories.map((category, idx) => (
                        <CategoryAccordion key={idx} category={category} />
                    ))}
                </div>
            </div>
            
            {/* Call to Action */}
            <div className="mt-16">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-white text-center">
                    <h2 className="text-4xl font-black mb-4">🎁 Não Perca Nenhuma Oferta!</h2>
                    <p className="text-xl text-blue-100 mb-8">Cadastre-se e receba alertas das melhores promoções direto no seu email</p>
                    <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Seu melhor e-mail" className="flex-1 px-6 py-4 rounded-xl text-slate-900 font-medium bg-white/90 focus:ring-2 focus:ring-white"/>
                        <button type="submit" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                           Quero Receber! <RocketIcon className="h-5 w-5"/>
                        </button>
                    </form>
                    <p className="text-blue-200 text-sm mt-4">✓ Sem spam • ✓ Cancele quando quiser</p>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-16 text-center">
                <p className="text-dark-text-secondary text-sm mb-4">
                    💡 Dica: Passe o mouse sobre os produtos para pausar o carrossel
                </p>
                <p className="text-slate-500 text-xs">
                    © {new Date().getFullYear()} ACI • Comparamos os melhores preços para você
                </p>
            </div>
        </div>
    );
};