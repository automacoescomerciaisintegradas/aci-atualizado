export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    featuredImage: string;
    slug: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Como economizar nas compras da Shopee em 2024',
        excerpt: 'Descubra as melhores estratégias para conseguir cupons exclusivos e frete grátis em todas as suas compras na Shopee.',
        content: 'Conteúdo completo aqui...',
        author: 'Equipe ACI',
        date: '12 Jan, 2024',
        category: 'Tutoriais',
        featuredImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
        slug: 'como-economizar-shopee'
    },
    {
        id: '2',
        title: 'Top 10 Eletrônicos que você precisa conhecer',
        excerpt: 'Selecionamos os gadgets mais inovadores e com melhor custo-benefício disponíveis no Mercado Livre e Amazon.',
        content: 'Conteúdo completo aqui...',
        author: 'João Silva',
        date: '10 Jan, 2024',
        category: 'Tecnologia',
        featuredImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop',
        slug: 'top-10-eletronicos'
    },
    {
        id: '3',
        title: 'Guia de Presentes: O que comprar para Gamers',
        excerpt: 'Não erre na escolha! Veja nossa lista definitiva de periféricos e acessórios que todo gamer adoraria ganhar.',
        content: 'Conteúdo completo aqui...',
        author: 'Maria Oliveira',
        date: '08 Jan, 2024',
        category: 'Lifestyle',
        featuredImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
        slug: 'guia-presentes-gamers'
    }
];
