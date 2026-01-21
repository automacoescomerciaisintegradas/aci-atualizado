
import React from 'react';
import type { Page } from '../App';
import {
    DashboardIcon, LinkIcon, SearchIcon, TrendingUpIcon, TelegramIcon,
    ShoppingCartSendIcon, BrainCircuitIcon, InstagramIcon, FileTextIcon, ShoppingCartIcon,
    UserSearchIcon, RocketIcon, MagicWandIcon, ChatIcon, ImageIcon, BookIcon, DollarSignIcon,
    HelpCircleIcon, UsersIcon, SettingsIcon, SparklesIcon, CreditCardIcon
} from './Icons';

export interface NavLinkItem {
    page: Page;
    text: string;
    icon: React.ReactElement<{ className?: string }>;
}

export type NavItemLink = NavLinkItem & {
    type: 'link';
};

export type NavItemSection = {
    type: 'section';
    title: string;
    icon: React.ReactElement<{ className?: string }>;
    pages: Page[];
    children: NavLinkItem[];
};

export type NavItem = NavItemLink | NavItemSection;

export const navConfig: NavItem[] = [
    {
        type: 'section',
        title: 'Principal',
        icon: <DashboardIcon />,
        pages: ['home', 'profile', 'precos', 'payment-methods', 'admin'],
        children: [
            { text: 'Dashboard', page: 'home', icon: <DashboardIcon /> },
            { text: 'Minha Conta', page: 'profile', icon: <UsersIcon /> },
            { text: 'Créditos & Planos', page: 'precos', icon: <DollarSignIcon /> },
            { text: 'Métodos de Pagamento', page: 'payment-methods', icon: <CreditCardIcon /> },
            { text: 'Admin', page: 'admin', icon: <SettingsIcon /> },
        ]
    },
    {
        type: 'section',
        title: 'Vendas & Afiliados',
        icon: <ShoppingCartIcon />,
        pages: ['product-search', 'top-sales', 'generate', 'shopee-lote'],
        children: [
            { text: 'Busca de Produtos', page: 'product-search', icon: <SearchIcon /> },
            { text: 'Top Vendas', page: 'top-sales', icon: <TrendingUpIcon /> },
            { text: 'Gerador de Link', page: 'generate', icon: <LinkIcon /> },
            { text: 'Envio em Lote', page: 'shopee-lote', icon: <ShoppingCartSendIcon /> },
        ]
    },
    {
        type: 'section',
        title: 'Criação de Conteúdo',
        icon: <BrainCircuitIcon />,
        pages: ['aeo-insights', 'aeo-optimizer', 'multi-channel-publisher', 'blog-creator', 'aci-posts', 'instagram-caption', 'image-generator', 'chat', 'analytics'],
        children: [
            { text: 'Insights AEO (GEO)', page: 'aeo-insights', icon: <TrendingUpIcon /> },
            { text: 'Otimizador AEO', page: 'aeo-optimizer', icon: <SparklesIcon /> },
            { text: 'Publicador Multi-Canal', page: 'multi-channel-publisher', icon: <RocketIcon /> },
            { text: 'Criador de Post Blog', page: 'blog-creator', icon: <BookIcon /> },
            { text: 'Blog em Massa (CSV)', page: 'aci-posts', icon: <FileTextIcon /> },
            { text: 'Legenda Instagram', page: 'instagram-caption', icon: <MagicWandIcon /> },
            { text: 'Gerador de Imagem', page: 'image-generator', icon: <ImageIcon /> },
            { text: 'Chat IA', page: 'chat', icon: <ChatIcon /> },
            { text: 'Análise de Desempenho', page: 'analytics', icon: <TrendingUpIcon /> },
        ]
    },
    {
        type: 'section',
        title: 'Social & Integrações',
        icon: <InstagramIcon />,
        pages: ['instagram-connect', 'instagram-profile', 'telegram', 'telegram-shopee', 'telegram-id-catcher'],
        children: [
            { text: 'Conectar Instagram', page: 'instagram-connect', icon: <InstagramIcon /> },
            { text: 'Análise de Perfil', page: 'instagram-profile', icon: <UserSearchIcon /> },
            { text: 'Disparador Telegram', page: 'telegram', icon: <TelegramIcon /> },
            { text: 'Oferta Rápida Telegram', page: 'telegram-shopee', icon: <RocketIcon /> },
            { text: 'Capturador ID Telegram', page: 'telegram-id-catcher', icon: <MagicWandIcon /> },
        ]
    },
    {
        type: 'section',
        title: 'Ajuda & Recursos',
        icon: <HelpCircleIcon />,
        pages: ['blog', 'faq'],
        children: [
            { text: 'Blog de Ofertas', page: 'blog', icon: <SparklesIcon /> },
            { text: 'Perguntas Frequentes', page: 'faq', icon: <HelpCircleIcon /> },
        ]
    }
];