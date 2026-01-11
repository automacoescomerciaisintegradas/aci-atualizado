

import React, { useState } from 'react';
import { RocketIcon, OpenAIIcon, ShopeeIcon, InstagramIcon, TelegramIcon, WordPressIcon, WooCommerceIcon, BrainCircuitIcon, ShoppingCartIcon, ImageIcon, FileTextIcon, ChevronDownIcon, UserPlusIcon, CrownIcon } from './Icons';
import { Footer } from './Footer';
import { Header } from './Header';
import { PricingCard } from './PricingCard';
import { OfferCarousel } from './OfferCarousel';
// FIX: Imported offerProducts to be used in the infinite scroll animation.
import { offerProducts } from './OfferData';

interface LandingPageProps {
  onAuthClick: () => void;
}

const IntegrationIcon: React.FC<{ icon: React.ReactElement<{ className?: string }>, name: string }> = ({ icon, name }) => (
    <div className="flex items-center gap-2 p-2 pr-3 bg-dark-card/50 border border-dark-border rounded-full text-dark-text-secondary group-hover:bg-slate-700/60 transition-colors">
        {React.cloneElement(icon, { className: 'h-6 w-6' })}
        <span className="text-sm font-semibold">{name}</span>
    </div>
);

const featureData = [
    { icon: <BrainCircuitIcon className="h-8 w-8 text-lime-accent" />, title: 'Geração de Conteúdo com IA', description: 'Crie artigos, reviews e posts para blogs com IA, prontos para monetizar com produtos de afiliados.' },
    { icon: <TelegramIcon className="h-8 w-8 text-lime-accent" />, title: 'Automação para Telegram', description: 'Envie ofertas em massa da Shopee para seus canais, com mensagens e links gerados automaticamente.' },
    { icon: <ShoppingCartIcon className="h-8 w-8 text-lime-accent" />, title: 'Integração Shopee Afiliados', description: 'Pesquise produtos, encontre os mais vendidos e gere seus links de afiliado com um clique.' },
    { icon: <InstagramIcon className="h-8 w-8 text-lime-accent" />, title: 'Análise de Instagram', description: 'Obtenha insights com IA sobre qualquer perfil público, com sugestões para crescimento e engajamento.' },
    { icon: <ImageIcon className="h-8 w-8 text-lime-accent" />, title: 'Gerador de Imagens', description: 'Crie imagens únicas e de alta qualidade para suas redes sociais e blogs a partir de uma simples descrição.' },
    { icon: <FileTextIcon className="h-8 w-8 text-lime-accent" />, title: 'Postagens Inteligentes', description: 'Importe uma planilha CSV de produtos e gere postagens de blog em massa para seu WordPress.' },
];

const FeatureCard: React.FC<{ icon: React.ReactElement, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-dark-card border border-dark-border p-6 rounded-xl transition-all duration-300 hover:border-lime-accent/30 hover:shadow-2xl hover:shadow-lime-accent/5">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-dark-text-primary mb-2">{title}</h3>
        <p className="text-sm text-dark-text-secondary">{description}</p>
    </div>
);


const faqData = [
  {
    question: "Como funciona o sistema de créditos?",
    answer: "Criar sua conta é 100% gratuito e você recebe créditos para testar. Após, você pode recarregar via PIX para continuar usando os recursos no modelo pay-per-use (pague pelo que usar), sem mensalidades."
  },
  {
    question: "Os créditos têm validade?",
    answer: "Não, seus créditos não expiram. Você pode usá-los quando quiser, sem pressa."
  },
  {
    question: "Os artigos gerados contêm plágio?",
    answer: "Não. Nossos modelos de IA são treinados para gerar conteúdo original e único. Sempre recomendamos uma revisão final para garantir que o texto atenda perfeitamente ao seu tom de voz."
  },
  {
    question: "É necessário ter conhecimentos técnicos para usar o serviço?",
    answer: "Não. Nossa plataforma foi projetada para ser intuitiva e fácil de usar, com tutoriais e suporte para te ajudar em cada etapa."
  }
];

const FaqItem: React.FC<{
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-dark-border last:border-b-0">
        <button onClick={onClick} className="w-full flex justify-between items-center text-left py-5 px-6" aria-expanded={isOpen}>
            <span className="text-lg font-semibold text-dark-text-primary">{question}</span>
            <ChevronDownIcon className={`h-6 w-6 text-dark-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <p className="pb-5 px-6 text-dark-text-secondary">{answer}</p>
            </div>
        </div>
    </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthClick }) => {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const whatsappGroupUrl = "https://chat.whatsapp.com/BSsknrWToFpJGHz3EnkDUd";

    return (
        <div 
            className="min-h-screen flex flex-col bg-dark-bg text-dark-text-primary relative overflow-x-hidden"
        >
            <Header onAuthClick={onAuthClick} />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative w-full h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-20">
                        <div className="absolute top-0 w-full">
                            <OfferCarousel filterCategory="Todas" />
                        </div>
                        <div className="absolute top-80 w-full">
                             <div className="w-full flex flex-nowrap overflow-hidden [mask-image:_linear_gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)]">
                                <ul className="flex items-stretch justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll-reverse hover:[animation-play-state:paused]">
                                    {/* Duplicate and reverse the items for the second carousel */}
                                    {[...offerProducts].reverse().map((product) => (
                                        <li key={product.id} className="flex">
                                            {/* Minimal card for background */}
                                            <div className="flex-shrink-0 w-80 h-96 bg-dark-card/50 border border-dark-border/20 rounded-2xl p-4">
                                                <div className="h-48 bg-slate-800/50 rounded-lg mb-4"></div>
                                                <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
                                                <div className="h-8 bg-slate-800/50 rounded w-1/2 mt-2"></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                 <ul className="flex items-stretch justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll-reverse hover:[animation-play-state:paused]" aria-hidden="true">
                                    {[...offerProducts].reverse().map((product) => (
                                         <li key={`${product.id}-clone`} className="flex">
                                            <div className="flex-shrink-0 w-80 h-96 bg-dark-card/50 border border-dark-border/20 rounded-2xl p-4">
                                                <div className="h-48 bg-slate-800/50 rounded-lg mb-4"></div>
                                                <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
                                                <div className="h-8 bg-slate-800/50 rounded w-1/2 mt-2"></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent z-10"></div>
                    
                    <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
                        <h1 className="text-5xl md:text-7xl font-black text-dark-text-primary !leading-tight mb-6">
                            Gere Conteúdo com <span className="text-lime-accent">IA</span>. Venda Automaticamente.
                        </h1>
                        <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto mb-10">
                            A plataforma completa para afiliados que desejam automatizar postagens no Telegram, Instagram e WordPress, e escalar suas comissões com a Shopee.
                        </p>
                        <button
                            onClick={onAuthClick}
                            className="inline-flex items-center justify-center gap-3 bg-lime-accent text-dark-bg font-bold py-4 px-10 rounded-lg hover:opacity-90 transition-transform duration-300 hover:scale-105 shadow-2xl shadow-lime-accent/20 text-lg"
                        >
                            <RocketIcon className="h-6 w-6" />
                            Comece Gratuitamente
                        </button>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href="https://www.instagram.com/automacoescomerciaisintegradas"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-dark-card/50 border border-dark-border text-dark-text-secondary font-semibold py-3 px-6 rounded-lg hover:bg-slate-700/60 hover:text-dark-text-primary transition-colors"
                            >
                                <UserPlusIcon className="h-5 w-5" />
                                Siga-nos
                            </a>
                            <a 
                                href={whatsappGroupUrl}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-dark-card/50 border border-dark-border text-dark-text-secondary font-semibold py-3 px-6 rounded-lg hover:bg-slate-700/60 hover:text-dark-text-primary transition-colors"
                            >
                                <CrownIcon className="h-5 w-5" />
                                Entrar no Grupo VIP
                            </a>
                        </div>
                    </div>
                </section>
                
                {/* About Section */}
                <section id="sobre" className="py-20 md:py-24 animate-fade-in">
                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-6">A ferramenta definitiva para afiliados de performance.</h2>
                            <p className="text-dark-text-secondary space-y-4">
                                Cansado de passar horas buscando produtos, criando conteúdo e postando manualmente? A ACI foi criada para eliminar o trabalho repetitivo e te dar mais tempo para focar na estratégia.
                                <br/><br/>
                                Usamos Inteligência Artificial para analisar, criar e publicar. Integramos com as maiores plataformas para que você possa gerenciar tudo de um só lugar.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <IntegrationIcon icon={<ShopeeIcon />} name="Shopee" />
                            <IntegrationIcon icon={<TelegramIcon />} name="Telegram" />
                            <IntegrationIcon icon={<InstagramIcon />} name="Instagram" />
                            <IntegrationIcon icon={<WordPressIcon />} name="WordPress" />
                            <IntegrationIcon icon={<WooCommerceIcon />} name="WooCommerce" />
                            <IntegrationIcon icon={<OpenAIIcon />} name="OpenAI/Gemini" />
                        </div>
                    </div>
                </section>


                {/* Recursos Section */}
                <section id="recursos" className="py-20 md:py-24 animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">Tudo que você precisa para escalar</h2>
                            <p className="text-lg text-dark-text-secondary">Deixe a IA trabalhar por você e veja suas comissões decolarem.</p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featureData.map((feature, index) => <FeatureCard key={index} {...feature} />)}
                        </div>
                    </div>
                </section>
                
                {/* Statistics Section */}
                <section className="py-20 animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <p className="text-6xl font-black text-lime-accent">1.5M+</p>
                                <h3 className="mt-2 text-xl font-bold text-dark-text-primary">Produtos Enviados</h3>
                                <p className="mt-1 text-dark-text-secondary">Ofertas publicadas em canais de Telegram.</p>
                            </div>
                            <div>
                                <p className="text-6xl font-black text-lime-accent">10k+</p>
                                <h3 className="mt-2 text-xl font-bold text-dark-text-primary">Usuários Ativos</h3>
                                <p className="mt-1 text-dark-text-secondary">Afiliados escalando seus resultados diariamente.</p>
                            </div>
                            <div>
                                <p className="text-6xl font-black text-lime-accent">500k+</p>
                                <h3 className="mt-2 text-xl font-bold text-dark-text-primary">Conteúdos Gerados</h3>
                                <p className="mt-1 text-dark-text-secondary">Artigos e legendas criados com nossa IA.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preços Section */}
                <section id="precos" className="py-20 md:py-24 bg-dark-card/50 animate-fade-in">
                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">Modelo Pay-Per-Use</h2>
                            <p className="text-lg text-dark-text-secondary">Pague somente pelo que usar. Sem mensalidades, sem planos fixos. Compre créditos conforme sua necessidade.</p>
                        </div>
                         <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <PricingCard
                                planName="Plano Grátis"
                                price="R$ 0"
                                features={['Créditos de teste para começar', 'Acesso a todas as ferramentas', 'Suporte via comunidade']}
                                ctaText="Comece Gratuitamente"
                                onCtaClick={onAuthClick}
                                isActive
                            />
                            <PricingCard
                                planName="Pay-per-use"
                                price="Créditos & Planos"
                                features={['Pague somente pelo que usar', 'Créditos nunca expiram', 'Sem mensalidades ou compromissos', 'PIX, cartão e boleto via Mercado Pago']}
                                ctaText="Comprar Créditos"
                                onCtaClick={onAuthClick}
                            />
                        </div>
                    </div>
                </section>
                
                {/* FAQ Section */}
                <section id="faq" className="py-20 md:py-24 animate-fade-in">
                     <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">Perguntas Frequentes</h2>
                        </div>
                        <div className="mt-10 bg-dark-card border border-dark-border rounded-xl">
                            {faqData.map((item, index) => (
                                <FaqItem
                                    key={index}
                                    question={item.question}
                                    answer={item.answer}
                                    isOpen={openFaqIndex === index}
                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer onAuthClick={onAuthClick} />
        </div>
    );
};