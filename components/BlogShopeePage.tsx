import React, { useState, useEffect } from 'react';
import { OfferCarousel } from './OfferCarousel';
import {
    SparklesIcon,
    RocketIcon,
    ShopeeIcon,
    AmazonIcon,
    MercadoLivreIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TrendingUpIcon,
    MenuIcon,
    CheckCircleIcon,
    UserIcon,
    ClockIcon,
    ChevronRightIcon,
    FacebookIcon,
    InstagramIcon,
    TwitterIcon,
    LinkedinIcon,
    RedditIcon,
    CalendarIcon,
    TagIcon,
    MailIcon,
    ChevronLeftIcon,
    StarIcon
} from './Icons';
import { offerProducts } from './OfferData';
import { useSettings } from '../hooks/useSettings';
import { BlogHeader, BlogFooter } from './BlogComponents';
import { blogPosts } from './BlogData';
import type { BlogPost } from './BlogData';

console.log('📦 BlogShopeePage module loaded');

// Configuration block for "Editable" feel
const blogConfig = {
    title: "🔥 Ofertas Imperdíveis",
    subtitle: "As melhores promoções de Shopee, Mercado Livre e Amazon em um só lugar",
    accentColor: "#FCD535",
    buttonText: "ATIVAR MEUS ALERTAS",
    categoriesTitle: "Categorias Populares",
    articlesTitle: "Últimos Artigos",
    trendingTitle: "Buscas em Alta"
};

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

const CategoryAccordion: React.FC<{ category: typeof allShopeeCategories[0] }> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-[#ffffff10] rounded-lg bg-[#121212] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-[#1a1a1a] hover:bg-[#252525] transition-colors text-left"
            >
                <span className="font-semibold text-white">{category.name}</span>
                {isOpen ? <ChevronUpIcon className="h-5 w-5 text-blue-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-[#121212] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {category.subs.map((sub, idx) => (
                        <a
                            key={idx}
                            href={`https://shopee.com.br/search?keyword=${encodeURIComponent(sub)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-400 hover:text-blue-400 transition-colors p-1"
                        >
                            {sub}
                        </a>
                    ))}
                    {category.subs.length === 0 && <p className="text-xs text-gray-500">Sem subcategorias.</p>}
                </div>
            )}
        </div>
    );
};

const PostCard: React.FC<{ post: BlogPost; onClick: () => void }> = ({ post, onClick }) => {
    if (!post) return null;
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col group h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        >
            {/* Featured Image Container */}
            <div className="relative h-[165px] sm:h-[175px] md:h-[225px] overflow-hidden bg-gray-200">
                <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Blog+Post'; }}
                />
                {/* Category Badge - Exact match to Elementor: Roboto, 11px/10px/9px, 600, Uppercase */}
                <div
                    className="absolute bottom-0 left-0 text-white px-[7px] py-[3px] text-[9px] sm:text-[10px] md:text-[11px] font-semibold uppercase z-10 font-secondary"
                    style={{ backgroundColor: '#FCD535', lineHeight: '1.4' }}
                >
                    {post.category}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                {/* Post Title - h5 as per Elementor */}
                <h5 className="text-xl font-bold text-[#000000] mb-3 line-clamp-2 hover:text-[#66A1FF] transition-colors leading-tight">
                    {post.title}
                </h5>

                {/* Post Info - Icons (16px) and Metadata */}
                <div className="flex items-center gap-4 mb-4 text-[11px] font-semibold uppercase text-[#333333] tracking-wider font-secondary">
                    <div className="flex items-center gap-1.5 hover:text-[#66A1FF] transition-colors">
                        <UserIcon className="h-4 w-4 text-[#66A1FF]" />
                        {post.author}
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-[#66A1FF] transition-colors">
                        <CalendarIcon className="h-4 w-4 text-[#66A1FF]" />
                        {post.date}
                    </div>
                </div>

                {/* Excerpt */}
                <p className="text-gray-600 text-[14px] line-clamp-2 mb-6 flex-grow leading-relaxed">
                    {post.excerpt}
                </p>

                {/* Ler Mais Button - Exact match to previous turn refined specs: 18px, bold, bottom border */}
                <button className="self-start text-[18px] font-bold text-[#000000] border-b border-[#000000] pb-[7px] hover:text-[#66A1FF] hover:border-[#66A1FF] transition-all flex items-center justify-between gap-3 uppercase w-max group/btn">
                    Ler Mais
                    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

const BlogSinglePostView: React.FC<{ post: BlogPost; onBack: () => void; onPostClick: (post: BlogPost) => void }> = ({ post, onBack, onPostClick }) => {
    const latestPosts = (blogPosts || []).filter(p => p.id !== post.id).slice(0, 4);

    return (
        <div className="animate-fade-in py-10">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-black uppercase text-xs tracking-widest"
            >
                <ChevronLeftIcon className="h-5 w-5" /> Voltar para o Blog
            </button>

            {/* Post Header */}
            <div className="mb-12">
                <div className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black mb-6 bg-gradient-to-r from-blue-500 to-indigo-600">
                    {post.category}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                    {post.title}
                </h1>
                <div className="flex items-center gap-6 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    <div className="flex items-center gap-2 text-blue-400">
                        <CheckCircleIcon className="h-4 w-4" />
                        {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {post.date}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-16">
                <div className="lg:col-span-7 space-y-12">
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-gray-900">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-[300px] md:h-[500px] object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x800?text=Featured+Image'; }}
                        />
                    </div>

                    <article className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg">
                        <p className="mb-6">{post.content}</p>
                        <p className="mb-6">
                            Ao buscar as melhores ofertas, é essencial ficar atento às variações de preços.
                            Nossa plataforma utiliza algoritmos avançados de monitoramento para garantir
                            que as indicações apresentadas sejam realmente vantajosas para o seu bolso.
                        </p>
                    </article>

                    <div className="flex items-center gap-3 pt-8 border-t border-white/5">
                        <TagIcon className="h-5 w-5 text-blue-500" />
                        <div className="flex flex-wrap gap-2">
                            {['Ofertas', post.category, 'Promoção', 'Economia'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-[#1a1a1a] rounded-lg text-xs font-bold text-gray-400 border border-white/5">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="py-10 border-t border-white/5">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Compartilhe isso</h4>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex-1 min-w-[120px] py-3 bg-[#1877F2] hover:opacity-90 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase text-white transition-all">
                                <FacebookIcon className="h-4 w-4" /> Facebook
                            </button>
                            <button className="flex-1 min-w-[120px] py-3 bg-[#1DA1F2] hover:opacity-90 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase text-white transition-all">
                                <TwitterIcon className="h-4 w-4" /> Twitter
                            </button>
                            <button className="flex-1 min-w-[120px] py-3 bg-[#0077B5] hover:opacity-90 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase text-white transition-all">
                                <LinkedinIcon className="h-4 w-4" /> LinkedIn
                            </button>
                            <button className="flex-1 min-w-[120px] py-3 bg-[#FF4500] hover:opacity-90 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase text-white transition-all">
                                <RedditIcon className="h-4 w-4" /> Reddit
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-[#121212] rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#1a1a1a] flex-shrink-0 bg-gray-800">
                            <img src="https://i.imgur.com/8Km9tLL.png" alt={post.author} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <h4 className="text-xl font-black text-white">{post.author}</h4>
                                <button className="text-[10px] font-black uppercase text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">Ver todos os posts</button>
                            </div>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                Especialista em análise de mercado e curadoria de ofertas com mais de 10 anos de experiência
                                em e-commerce. Dedicado a encontrar o melhor custo-benefício para os consumidores brasileiros.
                            </p>
                        </div>
                    </div>

                    <div className="py-12 border-t border-white/5 flex items-center justify-between gap-4">
                        <button className="group flex flex-col items-start gap-2 max-w-[45%]">
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                <ChevronLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Anterior
                            </div>
                            <span className="text-gray-400 font-bold text-left line-clamp-1 group-hover:text-white transition-colors text-sm">Post Anterior</span>
                        </button>
                        <div className="h-10 w-[1px] bg-white/5"></div>
                        <button className="group flex flex-col items-end gap-2 max-w-[45%]">
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                Próximo <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                            <span className="text-gray-400 font-bold text-right line-clamp-1 group-hover:text-white transition-colors text-sm">Próximo Post</span>
                        </button>
                    </div>
                </div>

                <aside className="lg:col-span-3 space-y-12">
                    <div className="relative group bg-[#121212] border border-white/5 rounded-3xl p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 text-center">
                            <StarIcon className="h-10 w-10 text-yellow-500 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-white mb-4">Pronto para elevar seu negócio?</h3>
                            <p className="text-gray-400 text-sm mb-8">Anuncie conosco e alcance milhares de compradores ativos todos os meses.</p>
                            <button className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Saiba Mais</button>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden">
                        <div className="bg-white/5 p-6 border-b border-white/5">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Últimos Posts</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {latestPosts.map(lp => (
                                <div
                                    key={lp.id}
                                    className="flex items-center gap-4 cursor-pointer group"
                                    onClick={() => onPostClick(lp)}
                                >
                                    <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 bg-gray-800">
                                        <img src={lp.featuredImage} alt={lp.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-gray-300 group-hover:text-blue-400 transition-colors line-clamp-2">{lp.title}</h4>
                                        <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider">{lp.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden">
                        <div className="bg-white/5 p-6 border-b border-white/5">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Categorias</h3>
                        </div>
                        <div className="p-4">
                            {['Financeiro', 'Negócios', 'Tecnologia', 'Lifestyle', 'Entretenimento'].map(cat => (
                                <button key={cat} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-bold border-b border-white/5 last:border-0">
                                    <span className="flex items-center gap-3">
                                        <TagIcon className="h-4 w-4 text-blue-500 opacity-50" /> {cat}
                                    </span>
                                    <ChevronRightIcon className="h-4 w-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sticky top-24 p-8 rounded-3xl bg-gradient-to-br from-blue-900/40 to-blue-600/40 border border-blue-500/20 text-center">
                        <h3 className="text-xl font-black text-white mb-4">Receba dicas exclusivas no seu e-mail</h3>
                        <p className="text-gray-300 text-sm mb-8 leading-relaxed">Junte-se a mais de 10.000 pessoas economizando todos os dias.</p>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Seu e-mail"
                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                                <MailIcon className="h-4 w-4" /> Cadastrar Agora
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="mt-24 pt-24 border-t border-white/5">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black text-white tracking-widest">ARTIGOS RELACIONADOS</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {latestPosts.slice(0, 3).map(lp => (
                        <div
                            key={`related-${lp.id}`}
                            className="group cursor-pointer"
                            onClick={() => onPostClick(lp)}
                        >
                            <div className="h-64 rounded-3xl overflow-hidden mb-6 border border-white/5 bg-gray-900">
                                <img src={lp.featuredImage} alt={lp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600'; }} />
                            </div>
                            <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{lp.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FeaturedNewsHero: React.FC<{ post: BlogPost; onClick: () => void }> = ({ post, onClick }) => {
    if (!post) return null;
    return (
        <div
            onClick={onClick}
            className="relative w-full group cursor-pointer overflow-hidden rounded-3xl mb-16 bg-[#121212] flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
            {/* Image Container */}
            <div className="relative w-full h-[200px] md:h-[350px] overflow-hidden">
                <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Category Badge - Match JSON: bg-black, white text, 11px, Roboto 600 */}
                <div
                    className="absolute bottom-0 left-0 bg-black text-white px-[14px] py-[7px] text-[9px] sm:text-[10px] md:text-[11px] font-semibold font-secondary uppercase tracking-widest z-10"
                >
                    {post.category}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-10 flex flex-col gap-4">
                {/* Title - h4 per JSON */}
                <h4 className="text-2xl md:text-4xl font-black text-white leading-tight group-hover:text-[#66A1FF] transition-colors">
                    {post.title}
                </h4>

                {/* Excerpt - Limited per JSON */}
                <p className="text-gray-400 text-sm md:text-base line-clamp-2 max-w-3xl">
                    {post.excerpt.length > 100 ? post.excerpt.substring(0, 100) + '...' : post.excerpt}
                </p>

                {/* Post Info - Icons #66A1FF, Roboto 600, 11px */}
                <div className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-widest font-secondary text-gray-500">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-[#66A1FF]" />
                        {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-[#66A1FF]" />
                        {post.date}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BlogShopeePage: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const { settings } = useSettings();

    useEffect(() => {
        console.log('🚀 BlogShopeePage rendered, activeCategory:', activeCategory);
        if (selectedPost) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedPost, activeCategory]);

    const safeBlogPosts = (blogPosts || []);

    try {
        return (
            <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
                <BlogHeader onNavigate={onNavigate} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                    <div className="animate-fade-in">
                        {selectedPost ? (
                            <BlogSinglePostView
                                post={selectedPost}
                                onBack={() => setSelectedPost(null)}
                                onPostClick={(p) => setSelectedPost(p)}
                            />
                        ) : (
                            <>
                                {/* Top Landing / Featured News Section */}
                                {activeCategory === 'Todas' && safeBlogPosts.length > 0 && (
                                    <FeaturedNewsHero
                                        post={safeBlogPosts[0]}
                                        onClick={() => setSelectedPost(safeBlogPosts[0])}
                                    />
                                )}

                                {/* Articles Section - NOW AT TOP */}
                                <div className="mt-6 mb-24">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                                        <div className="max-w-xl">
                                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Últimos Artigos</h2>
                                            <p className="text-gray-400 text-lg">Conteúdo premium gerado por nossa IA para te ajudar a economizar sempre.</p>
                                        </div>
                                        <button className="flex items-center gap-2 text-white font-black uppercase text-xs tracking-widest hover:text-[#66A1FF] transition-colors group">
                                            VER TODOS <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {safeBlogPosts.map(post => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                onClick={() => setSelectedPost(post)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Trending Searches Section */}
                                <div className="mb-20 bg-[#121212]/40 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <TrendingUpIcon className="h-4 w-4 text-green-400" />
                                        {blogConfig.trendingTitle}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trendingKeywords.slice(0, 15).map(keyword => (
                                            <a
                                                key={keyword}
                                                href={`https://shopee.com.br/search?keyword=${encodeURIComponent(keyword)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 text-xs font-bold bg-[#1a1a1a]/50 hover:bg-white hover:text-black border border-white/5 rounded-full text-gray-300 transition-all duration-300"
                                            >
                                                {keyword}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Offers Section */}
                                <div className="mb-24">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                        <h2 className="text-3xl font-black flex items-center gap-3 text-white">
                                            <SparklesIcon className="h-8 w-8 text-yellow-400" />
                                            {activeCategory === 'Todas' ? 'Ofertas do Dia' : `Promoções em ${activeCategory}`}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {['Todas', 'Shopee', 'Amazon', 'Mercado Livre'].map(plat => (
                                                <button
                                                    key={plat}
                                                    onClick={() => setActiveCategory(plat)}
                                                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeCategory === plat
                                                        ? 'bg-white text-black shadow-xl'
                                                        : 'bg-[#121212] text-gray-500 hover:text-white border border-white/5'
                                                        }`}
                                                >
                                                    {plat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <OfferCarousel filterCategory={activeCategory} />
                                    </div>
                                </div>

                                {/* Categories Exploration */}
                                <div className="mt-24 py-20 border-t border-white/5">
                                    <h2 className="text-3xl font-black text-white mb-12 text-center uppercase tracking-widest">{blogConfig.categoriesTitle}</h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-20">
                                        {popularCategories.map(cat => (
                                            <a
                                                key={cat.name}
                                                href={`https://shopee.com.br/search?keyword=${encodeURIComponent(cat.name)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#121212]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center hover:bg-white group transition-all duration-500 flex flex-col items-center justify-center hover:-translate-y-2"
                                            >
                                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">{cat.emoji}</div>
                                                <div className="font-bold text-gray-400 group-hover:text-black transition-colors text-sm uppercase tracking-tighter">{cat.name}</div>
                                            </a>
                                        ))}
                                    </div>

                                    <div className="mt-20">
                                        <h2 className="text-2xl font-black text-white mb-10 text-center flex items-center justify-center gap-4">
                                            <MenuIcon className="h-6 w-6 text-blue-500" />
                                            EXPLORAR TODOS OS DEPARTAMENTOS
                                        </h2>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {allShopeeCategories.map((category, idx) => (
                                                <CategoryAccordion key={idx} category={category} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Section */}
                                <div className="mt-32">
                                    <div className="relative group bg-[#121212] border border-white/5 rounded-[3rem] p-10 md:p-20 text-center overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase text-white">Economize tempo e dinheiro! 💸</h2>
                                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                                                Nossa inteligência artificial monitora quedas de preços e cupons relâmpago em tempo real.
                                            </p>
                                            <button
                                                onClick={() => onNavigate('shopee-lote')}
                                                className="bg-white text-black px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl active:scale-95 uppercase tracking-widest"
                                            >
                                                {blogConfig.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>

                <BlogFooter onNavigate={onNavigate} />
            </div>
        );
    } catch (error: any) {
        console.error('❌ BlogShopeePage catastrophic error:', error);
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-10 text-center text-white">
                <div className="max-w-md">
                    <h1 className="text-4xl font-black mb-4">Ops! Algo deu errado.</h1>
                    <p className="text-gray-400 mb-8 font-mono text-xs">{error?.message || 'Erro desconhecido'}</p>
                    <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">Tentar Novamente</button>
                </div>
            </div>
        );
    }
};