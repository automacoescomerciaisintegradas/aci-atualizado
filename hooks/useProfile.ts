/**
 * =========================================
 * ACI - Hook de Perfil do Usuário
 * =========================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../src/services/apiClient';
import {
    UserProfile,
    ProfileRow,
    UpdateProfileData,
    parseProfileRow,
    getTierFromSpent,
    TierInfo,
    UserSession,
} from '../types/user';

// ==========================================
// TIPOS DO HOOK
// ==========================================

export interface UseProfileOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    onProfileUpdate?: (profile: UserProfile) => void;
    onError?: (error: Error) => void;
}

export interface UseProfileReturn {
    // Estado
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    // Informações do tier
    tierInfo: TierInfo | null;

    // Operações
    refreshProfile: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<boolean>;
    uploadAvatar: (file: File) => Promise<string | null>;

    // Sessões
    sessions: UserSession[];
    loadSessions: () => Promise<void>;

    // Utilitários
    getDisplayName: () => string;
    getInitials: () => string;
    isOnboardingComplete: () => boolean;
}

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export function useProfile(options: UseProfileOptions = {}): UseProfileReturn {
    const {
        autoRefresh = false,
        refreshInterval = 60000,
        onProfileUpdate,
        onError,
    } = options;

    // Estado
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Refs
    const onProfileUpdateRef = useRef(onProfileUpdate);
    const onErrorRef = useRef(onError);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        onProfileUpdateRef.current = onProfileUpdate;
        onErrorRef.current = onError;
    }, [onProfileUpdate, onError]);

    // ==========================================
    // CARREGAR PERFIL
    // ==========================================

    const loadProfile = useCallback(async (userId: string) => {
        try {
            const response = await apiClient.getUser(userId);

            if (!response.success) {
                throw new Error(response.error || 'Erro ao carregar perfil');
            }

            if (response.user) {
                // Parsear para o formato UserProfile
                const parsed = parseProfileRow(response.user as any as ProfileRow);
                setProfile(parsed);
                onProfileUpdateRef.current?.(parsed);
            }
        } catch (err: any) {
            console.error('Erro ao carregar perfil:', err);
            setError(err.message || 'Erro ao carregar perfil');
            onErrorRef.current?.(err);
        }
    }, []);

    // ==========================================
    // REFRESH PROFILE
    // ==========================================

    const refreshProfile = useCallback(async () => {
        const userId = apiClient.getUserId();
        if (!userId && !profile?.id) {
            console.warn('No user ID available for refresh');
            return;
        }
        await loadProfile(userId || profile!.id);
    }, [profile?.id, loadProfile]);

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
        if (!profile?.id) {
            setError('Usuário não autenticado');
            return false;
        }

        try {
            setError(null);

            const response = await apiClient.updateProfile(data);

            if (!response.success) {
                throw new Error(response.error || 'Erro ao atualizar perfil');
            }

            // Atualizar estado local
            await refreshProfile();
            return true;
        } catch (err: any) {
            console.error('Erro ao atualizar perfil:', err);
            setError(err.message || 'Erro ao atualizar perfil');
            onErrorRef.current?.(err);
            return false;
        }
    }, [profile?.id, refreshProfile]);

    // ==========================================
    // UPLOAD AVATAR
    // ==========================================

    const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
        if (!profile?.id) {
            setError('Usuário não autenticado');
            return null;
        }

        try {
            setError(null);

            // Upload para R2 via API
            const response = await apiClient.uploadAvatar(file);

            if (!response.success) {
                throw new Error(response.error || 'Erro ao fazer upload');
            }

            // Atualizar estado local
            await refreshProfile();

            return response.avatarUrl;
        } catch (err: any) {
            console.error('Erro ao fazer upload do avatar:', err);
            setError(err.message || 'Erro ao fazer upload do avatar');
            onErrorRef.current?.(err);
            return null;
        }
    }, [profile?.id, refreshProfile]);

    // ==========================================
    // LOAD SESSIONS
    // ==========================================

    const loadSessions = useCallback(async () => {
        if (!profile?.id) return;

        try {
            const response = await apiClient.getSessions(profile.id);

            if (response.success && response.sessions) {
                const parsed: UserSession[] = response.sessions.map((s: any) => ({
                    id: s.id,
                    user_id: s.user_id,
                    ip_address: s.ip_address,
                    user_agent: s.user_agent,
                    device_type: s.device_type,
                    browser: s.browser,
                    os: s.os,
                    country: s.country,
                    city: s.city,
                    started_at: new Date(s.started_at),
                    ended_at: s.ended_at ? new Date(s.ended_at) : null,
                    last_activity_at: new Date(s.last_activity_at),
                }));
                setSessions(parsed);
            }
        } catch (err: any) {
            console.error('Erro ao carregar sessões:', err);
        }
    }, [profile?.id]);

    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    const getDisplayName = useCallback((): string => {
        if (!profile) return 'Usuário';
        return profile.display_name || profile.full_name || profile.email?.split('@')[0] || 'Usuário';
    }, [profile]);

    const getInitials = useCallback((): string => {
        const name = getDisplayName();
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }, [getDisplayName]);

    const isOnboardingComplete = useCallback((): boolean => {
        return profile?.onboarding_completed ?? false;
    }, [profile]);

    // ==========================================
    // TIER INFO
    // ==========================================

    const tierInfo = profile
        ? getTierFromSpent(profile.stats.total_credits_purchased)
        : null;

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const userId = apiClient.getUserId();

                if (userId) {
                    setIsAuthenticated(true);
                    await loadProfile(userId);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err: any) {
                console.error('Erro na inicialização:', err);
                if (mounted) {
                    setError(err.message);
                    onErrorRef.current?.(err);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initialize();

        return () => {
            mounted = false;
        };
    }, [loadProfile]);

    // ==========================================
    // AUTO-REFRESH
    // ==========================================

    useEffect(() => {
        if (!autoRefresh || !isAuthenticated) return;

        refreshTimerRef.current = setInterval(refreshProfile, refreshInterval);

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, isAuthenticated, refreshProfile]);

    // ==========================================
    // RETORNO
    // ==========================================

    return {
        profile,
        isLoading,
        error,
        isAuthenticated,
        tierInfo,
        refreshProfile,
        updateProfile,
        uploadAvatar,
        sessions,
        loadSessions,
        getDisplayName,
        getInitials,
        isOnboardingComplete,
    };
}

// ==========================================
// HOOK SIMPLES PARA NOME/AVATAR
// ==========================================

export function useUserInfo() {
    const { profile, getDisplayName, getInitials, tierInfo } = useProfile();

    return {
        displayName: getDisplayName(),
        initials: getInitials(),
        avatarUrl: profile?.avatar_url || null,
        email: profile?.email || null,
        tier: tierInfo,
    };
}

export default useProfile;
