/**
 * =========================================
 * ACI - Tipos de Usuário e Perfil
 * =========================================
 */

// ==========================================
// ENUMS E CONSTANTES
// ==========================================

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// ==========================================
// INTERFACES PRINCIPAIS
// ==========================================

/**
 * Perfil completo do usuário
 */
export interface UserProfile {
    id: string;

    // Informações básicas
    email: string | null;
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    phone: string | null;

    // Informações de negócio
    company_name: string | null;
    company_document: string | null; // CNPJ
    personal_document: string | null; // CPF

    // Endereço
    address: UserAddress | null;

    // Preferências
    preferences: UserPreferences;

    // Nível e status
    role: UserRole;
    status: UserStatus;
    tier: UserTier;

    // Onboarding
    onboarding_completed: boolean;
    onboarding_step: number;

    // Integrações conectadas
    integrations_connected: string[];

    // Estatísticas
    stats: UserStats;

    // Referral
    referral_code: string | null;
    referred_by: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;

    // Metadados
    metadata: Record<string, unknown>;

    // Timestamps
    last_login_at: Date | null;
    last_activity_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Endereço do usuário
 */
export interface UserAddress {
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string;
}

/**
 * Preferências do usuário
 */
export interface UserPreferences {
    language: string;
    timezone: string;
    notification_email: boolean;
    notification_push: boolean;
    notification_sms: boolean;
}

/**
 * Estatísticas do usuário
 */
export interface UserStats {
    total_credits_purchased: number;
    total_credits_used: number;
    total_content_generated: number;
    total_publications: number;
}

/**
 * Sessão de login do usuário
 */
export interface UserSession {
    id: string;
    user_id: string;
    ip_address: string | null;
    user_agent: string | null;
    device_type: string | null;
    browser: string | null;
    os: string | null;
    country: string | null;
    city: string | null;
    started_at: Date;
    ended_at: Date | null;
    last_activity_at: Date;
}

/**
 * Dados do perfil vindos do Supabase (formato snake_case)
 */
export interface ProfileRow {
    id: string;
    email: string | null;
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    company_name: string | null;
    company_document: string | null;
    personal_document: string | null;
    address_street: string | null;
    address_number: string | null;
    address_complement: string | null;
    address_neighborhood: string | null;
    address_city: string | null;
    address_state: string | null;
    address_zip: string | null;
    address_country: string | null;
    preferred_language: string | null;
    timezone: string | null;
    notification_email: boolean | null;
    notification_push: boolean | null;
    notification_sms: boolean | null;
    role: UserRole | null;
    status: UserStatus | null;
    tier: UserTier | null;
    onboarding_completed: boolean | null;
    onboarding_step: number | null;
    integrations_connected: string[] | null;
    total_credits_purchased: number | null;
    total_credits_used: number | null;
    total_content_generated: number | null;
    total_publications: number | null;
    referral_code: string | null;
    referred_by: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    metadata: Record<string, unknown> | null;
    last_login_at: string | null;
    last_activity_at: string | null;
    created_at: string;
    updated_at: string;
}

// ==========================================
// FUNÇÕES DE CONVERSÃO
// ==========================================

/**
 * Converte dados do Supabase para o formato UserProfile
 */
export function parseProfileRow(row: ProfileRow): UserProfile {
    return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        phone: row.phone,
        company_name: row.company_name,
        company_document: row.company_document,
        personal_document: row.personal_document,
        address: {
            street: row.address_street,
            number: row.address_number,
            complement: row.address_complement,
            neighborhood: row.address_neighborhood,
            city: row.address_city,
            state: row.address_state,
            zip: row.address_zip,
            country: row.address_country || 'BR',
        },
        preferences: {
            language: row.preferred_language || 'pt-BR',
            timezone: row.timezone || 'America/Sao_Paulo',
            notification_email: row.notification_email ?? true,
            notification_push: row.notification_push ?? true,
            notification_sms: row.notification_sms ?? false,
        },
        role: row.role || 'user',
        status: row.status || 'active',
        tier: row.tier || 'bronze',
        onboarding_completed: row.onboarding_completed ?? false,
        onboarding_step: row.onboarding_step ?? 0,
        integrations_connected: row.integrations_connected || [],
        stats: {
            total_credits_purchased: row.total_credits_purchased || 0,
            total_credits_used: row.total_credits_used || 0,
            total_content_generated: row.total_content_generated || 0,
            total_publications: row.total_publications || 0,
        },
        referral_code: row.referral_code,
        referred_by: row.referred_by,
        utm_source: row.utm_source,
        utm_medium: row.utm_medium,
        utm_campaign: row.utm_campaign,
        metadata: row.metadata || {},
        last_login_at: row.last_login_at ? new Date(row.last_login_at) : null,
        last_activity_at: row.last_activity_at ? new Date(row.last_activity_at) : null,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

// ==========================================
// TIPOS PARA UPDATE
// ==========================================

/**
 * Campos que podem ser atualizados no perfil
 */
export interface UpdateProfileData {
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
    phone?: string;
    company_name?: string;
    company_document?: string;
    personal_document?: string;
    address_street?: string;
    address_number?: string;
    address_complement?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    address_country?: string;
    preferred_language?: string;
    timezone?: string;
    notification_email?: boolean;
    notification_push?: boolean;
    notification_sms?: boolean;
    onboarding_completed?: boolean;
    onboarding_step?: number;
    metadata?: Record<string, unknown>;
}

// ==========================================
// TIER INFO
// ==========================================

export interface TierInfo {
    name: UserTier;
    displayName: string;
    color: string;
    bgColor: string;
    icon: string;
    minSpent: number;
    benefits: string[];
}

export const TIER_INFO: Record<UserTier, TierInfo> = {
    bronze: {
        name: 'bronze',
        displayName: 'Bronze',
        color: 'text-orange-400',
        bgColor: 'bg-orange-900/30',
        icon: '🥉',
        minSpent: 0,
        benefits: ['Suporte por email', 'Acesso a todas as ferramentas'],
    },
    silver: {
        name: 'silver',
        displayName: 'Silver',
        color: 'text-gray-300',
        bgColor: 'bg-gray-900/30',
        icon: '🥈',
        minSpent: 50,
        benefits: ['Suporte prioritário', 'Histórico ampliado'],
    },
    gold: {
        name: 'gold',
        displayName: 'Gold',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        icon: '🏆',
        minSpent: 200,
        benefits: ['Suporte VIP', 'Acesso antecipado', 'Descontos exclusivos'],
    },
    platinum: {
        name: 'platinum',
        displayName: 'Platinum',
        color: 'text-blue-300',
        bgColor: 'bg-blue-900/30',
        icon: '💎',
        minSpent: 500,
        benefits: ['Gerente de conta', 'API dedicada', 'Limite aumentado'],
    },
    diamond: {
        name: 'diamond',
        displayName: 'Diamond',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-900/30',
        icon: '👑',
        minSpent: 1000,
        benefits: ['Suporte 24/7', 'Integrações customizadas', 'SLA garantido'],
    },
};

/**
 * Obtém informações do tier baseado no total gasto
 */
export function getTierFromSpent(totalSpent: number): TierInfo {
    if (totalSpent >= 1000) return TIER_INFO.diamond;
    if (totalSpent >= 500) return TIER_INFO.platinum;
    if (totalSpent >= 200) return TIER_INFO.gold;
    if (totalSpent >= 50) return TIER_INFO.silver;
    return TIER_INFO.bronze;
}
