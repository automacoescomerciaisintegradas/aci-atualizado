/**
 * Instagram Types - Definições TypeScript
 * Para integração com Meta Graph API
 */

// ============================================
// CONFIGURAÇÕES E AUTENTICAÇÃO
// ============================================

export interface InstagramConfig {
    accessToken: string;
    instagramBusinessAccountId: string;
    pageId?: string;
    pageName?: string;
}

export interface InstagramCredentials {
    accessToken: string;
    instagramId: string;
    pageId: string;
    pageName: string;
    profilePicture?: string;
    expiresAt?: Date;
}

// ============================================
// CONTA E PERFIL
// ============================================

export interface InstagramAccount {
    id: string;
    userId: string;
    username: string;
    profilePictureUrl: string;
    followersCount: number;
    followingCount?: number;
    mediaCount: number;
    biography?: string;
    website?: string;
    pageId: string;
    pageName: string;
    status: 'active' | 'expired' | 'revoked' | 'error';
    expiresInDays: number;
    connectedAt: Date;
    updatedAt: Date;
}

export interface InstagramAccountListItem {
    id: string;
    username: string;
    profilePictureUrl: string;
    pageName: string;
    connections: string[]; // ['IG', 'Page']
    expiresInDays: number;
    status: 'Ativo' | 'Expirado' | 'Erro';
    connectedAt: string;
}

// ============================================
// MÍDIA E POSTS
// ============================================

export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';

export interface InstagramMedia {
    id: string;
    mediaType: MediaType;
    mediaUrl: string;
    permalink: string;
    caption?: string;
    timestamp: string;
    likeCount?: number;
    commentsCount?: number;
    thumbnailUrl?: string;
}

export interface InstagramPost {
    imageUrl: string;
    caption: string;
    location?: string;
    userTags?: string[];
}

export interface InstagramCarouselPost {
    items: Array<{ type: 'IMAGE' | 'VIDEO'; url: string }>;
    caption: string;
}

export interface InstagramReelsPost {
    videoUrl: string;
    caption: string;
    coverUrl?: string;
    shareToFeed?: boolean;
}

export interface PublishResult {
    id: string;
    permalink: string;
    timestamp: string;
}

// ============================================
// COMENTÁRIOS
// ============================================

export interface InstagramComment {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    from: {
        id: string;
        username: string;
    };
    likeCount?: number;
    replies?: InstagramComment[];
    mediaId?: string;
}

export interface CommentReply {
    commentId: string;
    message: string;
}

// ============================================
// MENSAGENS DIRETAS
// ============================================

export interface DirectMessage {
    recipientId: string;
    message: string;
    attachments?: Array<{
        type: 'image' | 'video' | 'audio';
        url: string;
    }>;
}

export interface DirectConversation {
    id: string;
    participants: Array<{
        id: string;
        username: string;
        profilePictureUrl?: string;
    }>;
    messages: DirectMessageItem[];
    updatedAt: string;
}

export interface DirectMessageItem {
    id: string;
    from: {
        id: string;
        username: string;
    };
    to: {
        id: string;
        username: string;
    };
    message: string;
    timestamp: string;
    isRead: boolean;
}

// ============================================
// AUTOMAÇÃO E TEMPLATES
// ============================================

export type TemplateCategory =
    | 'direct_friendly'
    | 'formal'
    | 'promotional'
    | 'humanized'
    | 'direct'
    | 'custom';

export type TemplateVariable =
    | 'FIRST_NAME'
    | 'USERNAME'
    | 'FULL_NAME'
    | 'PRODUCT_NAME'
    | 'AFFILIATE_LINK'
    | 'PRICE'
    | 'DISCOUNT'
    | 'STORE_NAME';

export interface ResponseTemplate {
    id: string;
    name: string;
    category: TemplateCategory;
    type: 'public' | 'private';
    template: string;
    variables: TemplateVariable[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PublicResponseTemplate extends ResponseTemplate {
    type: 'public';
}

export interface PrivateResponseTemplate extends ResponseTemplate {
    type: 'private';
}

export interface AutomationRule {
    id: string;
    accountId: string;
    isActive: boolean;
    keywords: string[];
    caseSensitive: boolean;
    publicTemplateId: string;
    privateTemplateId: string;
    sendDirect: boolean;
    delay: number; // segundos antes de responder
    createdAt: Date;
    updatedAt: Date;
}

export interface AutomationConfig {
    accountId: string;
    isEnabled: boolean;
    rules: AutomationRule[];
    publicTemplate: ResponseTemplate;
    privateTemplate: ResponseTemplate;
    defaultProduct?: {
        name: string;
        link: string;
        price?: string;
    };
}

export interface AutomationLog {
    id: string;
    accountId: string;
    ruleId: string;
    commentId: string;
    commentText: string;
    username: string;
    action: 'public_reply' | 'private_message' | 'both';
    status: 'success' | 'failed' | 'pending';
    errorMessage?: string;
    cost: number;
    createdAt: Date;
}

// ============================================
// INSIGHTS E MÉTRICAS
// ============================================

export interface InstagramInsights {
    accountId: string;
    period: 'day' | 'week' | 'days_28' | 'lifetime';
    impressions: number;
    reach: number;
    profileViews: number;
    websiteClicks: number;
    emailContacts: number;
    phoneCallClicks: number;
    followerCount: number;
    onlineFollowers: Record<number, number>; // hora -> quantidade
}

export interface MediaInsights {
    mediaId: string;
    impressions: number;
    reach: number;
    engagement: number;
    saved: number;
    likes: number;
    comments: number;
    shares: number;
}

export interface EngagementData {
    date: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    impressions: number;
}

// ============================================
// WEBHOOKS
// ============================================

export type WebhookEventType =
    | 'comments'
    | 'messages'
    | 'mentions'
    | 'story_insights';

export interface WebhookEvent {
    object: 'instagram';
    entry: Array<{
        id: string;
        time: number;
        messaging?: Array<{
            sender: { id: string };
            recipient: { id: string };
            timestamp: number;
            message?: {
                mid: string;
                text: string;
            };
        }>;
        changes?: Array<{
            field: WebhookEventType;
            value: {
                id: string;
                text?: string;
                from?: { id: string; username: string };
                media?: { id: string };
            };
        }>;
    }>;
}

// ============================================
// API RESPONSES
// ============================================

export interface InstagramApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    paging?: {
        cursors: {
            before: string;
            after: string;
        };
        next?: string;
        previous?: string;
    };
}

// ============================================
// FORM TYPES
// ============================================

export interface ConnectAccountForm {
    confirmProfessional: boolean;
}

export interface TemplateForm {
    name: string;
    category: TemplateCategory;
    type: 'public' | 'private';
    template: string;
}

export interface AutomationRuleForm {
    keywords: string[];
    publicTemplateId: string;
    privateTemplateId: string;
    sendDirect: boolean;
    delay: number;
}

export interface PublishPostForm {
    accountId: string;
    mediaType: 'image' | 'carousel' | 'reels';
    mediaUrls: string[];
    caption: string;
    scheduleFor?: Date;
}

// ============================================
// PRESETS E DEFAULTS
// ============================================

export const DEFAULT_PUBLIC_TEMPLATES: Omit<PublicResponseTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        name: 'Público • Direto e Amigável',
        category: 'direct_friendly',
        type: 'public',
        template: '👋 Oi, {FIRST_NAME}! Te enviei o link no privado. Se não aparecer, olha em Solicitações ou me manda um oi no direct 😉',
        variables: ['FIRST_NAME'],
        isDefault: true,
    },
    {
        name: 'Público • Formal',
        category: 'formal',
        type: 'public',
        template: 'Olá {FIRST_NAME}! Acabei de enviar as informações no seu Direct. Por favor, verifique sua caixa de mensagens. 📩',
        variables: ['FIRST_NAME'],
        isDefault: false,
    },
    {
        name: 'Público • Promocional',
        category: 'promotional',
        type: 'public',
        template: '🔥 @{USERNAME} Corre que enviei o link com desconto especial no seu Direct! Aproveita antes que acabe! 🏃‍♂️',
        variables: ['USERNAME'],
        isDefault: false,
    },
];

export const DEFAULT_PRIVATE_TEMPLATES: Omit<PrivateResponseTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        name: 'Humanizado Amigável',
        category: 'humanized',
        type: 'private',
        template: `Olá {FIRST_NAME}! 😊 Aqui está o link do produto que você pediu:

{AFFILIATE_LINK}

{PRODUCT_NAME}

Qualquer dúvida, pode me chamar por aqui 💬`,
        variables: ['FIRST_NAME', 'AFFILIATE_LINK', 'PRODUCT_NAME'],
        isDefault: true,
    },
    {
        name: 'Direto com Preço',
        category: 'direct',
        type: 'private',
        template: `Oi {FIRST_NAME}! 👋

Aqui está o que você pediu:

🛒 {PRODUCT_NAME}
💰 Por apenas {PRICE}

🔗 Link: {AFFILIATE_LINK}

Aproveita! 🚀`,
        variables: ['FIRST_NAME', 'PRODUCT_NAME', 'PRICE', 'AFFILIATE_LINK'],
        isDefault: false,
    },
    {
        name: 'Promocional com Desconto',
        category: 'promotional',
        type: 'private',
        template: `🎉 Parabéns {FIRST_NAME}!

Você ganhou {DISCOUNT} de desconto exclusivo!

{PRODUCT_NAME}
De: R$ XXX,XX
Por: {PRICE}

👉 {AFFILIATE_LINK}

Corre que é por tempo limitado! ⏰`,
        variables: ['FIRST_NAME', 'DISCOUNT', 'PRODUCT_NAME', 'PRICE', 'AFFILIATE_LINK'],
        isDefault: false,
    },
];

export const DEFAULT_KEYWORDS = [
    'EU QUERO',
    'QUERO',
    'LINK',
    'ONDE COMPRA',
    'ONDE COMPRO',
    'COMO COMPRA',
    'COMO COMPRO',
    'PREÇO',
    'QUANTO CUSTA',
    'QUANTO É',
    'ME MANDA',
    'MANDA PRA MIM',
    'MANDA O LINK',
    'MANDA LINK',
];

// ============================================
// CUSTO POR AÇÃO (em R$)
// ============================================

export const INSTAGRAM_COSTS = {
    POST_PUBLISH: 0.27,
    COMMENT_REPLY: 0.09,
    DIRECT_MESSAGE: 0.09,
    STORY_PUBLISH: 0.18,
    REELS_PUBLISH: 0.36,
} as const;
