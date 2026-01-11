/**
 * Cliente API para comunicação com Cloudflare Worker
 * Substitui o Supabase Client no frontend
 */

// URL da API - usa variável de ambiente ou fallback para porta 3002
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

// Debug: mostrar qual URL está sendo usada
console.log('🔧 API URL:', API_BASE_URL);

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    [key: string]: any;
}

class ApiClient {
    private baseUrl: string;
    private userId: string | null = null;

    // Token handling
    private getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private setToken(token: string | null) {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
        // Recuperar userId do localStorage se existir
        this.userId = localStorage.getItem('userId');
    }

    setUserId(userId: string | null) {
        this.userId = userId;
        if (userId) {
            localStorage.setItem('userId', userId);
        } else {
            localStorage.removeItem('userId');
        }
    }

    getUserId(): string | null {
        return this.userId;
    }


    private async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const token = this.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            // console.log('🔵 Request:', { url, method: options.method || 'GET', body: options.body });

            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json() as any;

            // console.log('🟢 Response:', { status: response.status, ok: response.ok, data });

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data as T;
        } catch (error: any) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async signup(email: string, password: string, metadata?: {
        full_name?: string;
        phone?: string;
        role?: 'user' | 'admin';
    }) {
        const response = await this.request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, metadata }),
        });

        if (response.success && response.user) {
            this.setUserId(response.user.id);
            // Salvar token JWT no localStorage
            if (response.token) {
                this.setToken(response.token);
            }
        }

        return response;
    }

    async login(email: string, password: string) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.success && response.user) {
            this.setUserId(response.user.id);
            // Salvar token JWT no localStorage
            if (response.token) {
                this.setToken(response.token);
            }
        }

        return response;
    }

    async getUser(userId?: string) {
        const id = userId || this.userId;
        if (!id) throw new Error('User ID not available');

        return await this.request(`/api/auth/user?id=${id}`);
    }

    async updateProfile(data: {
        full_name?: string;
        display_name?: string;
        phone?: string;
        avatar_url?: string;
    }) {
        if (!this.userId) throw new Error('User not logged in');

        return await this.request('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({ userId: this.userId, ...data }),
        });
    }

    logout() {
        this.setUserId(null);
    }

    // Password Reset endpoints
    async forgotPassword(email: string) {
        return await this.request('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async verifyResetToken(token: string) {
        return await this.request('/api/auth/validate-reset-token', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }

    async resetPassword(token: string, newPassword: string) {
        return await this.request('/api/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword }),
        });
    }

    // Credits endpoints
    async getCredits(userId?: string) {
        const id = userId || this.userId;
        if (!id) throw new Error('User ID not available');

        return await this.request(`/api/credits/balance?userId=${id}`);
    }

    async getCreditTransactions(userId?: string) {
        const id = userId || this.userId;
        if (!id) throw new Error('User ID not available');

        return await this.request(`/api/credits/transactions?userId=${id}`);
    }

    // Packages endpoints
    async getPackages() {
        return await this.request('/api/packages');
    }

    // WordPress endpoints
    async getWordPressConnections(userId?: string) {
        const id = userId || this.userId;
        if (!id) throw new Error('User ID not available');

        return await this.request(`/api/wordpress/connections?userId=${id}`);
    }

    async addWordPressConnection(data: {
        name: string;
        site_url: string;
        username: string;
        application_password: string;
    }) {
        if (!this.userId) throw new Error('User not logged in');

        return await this.request('/api/wordpress/connection', {
            method: 'POST',
            body: JSON.stringify({ userId: this.userId, ...data }),
        });
    }

    // API Keys endpoints
    async getApiKeys(userId?: string) {
        const id = userId || this.userId;
        if (!id) throw new Error('User ID not available');

        return await this.request(`/api/keys?userId=${id}`);
    }

    async addApiKey(data: {
        service: 'openai' | 'telegram' | 'instagram' | 'whatsapp' | 'other';
        key_name: string;
        api_key: string;
    }) {
        if (!this.userId) throw new Error('User not logged in');

        return await this.request('/api/keys', {
            method: 'POST',
            body: JSON.stringify({ userId: this.userId, ...data }),
        });
    }

    // Avatar endpoints
    async uploadAvatar(file: File) {
        if (!this.userId) throw new Error('User not logged in');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', this.userId);

        const response = await fetch(`${this.baseUrl}/api/avatar/upload`, {
            method: 'POST',
            body: formData, // Não definir Content-Type, o browser define automaticamente para multipart/form-data
        });

        const data = await response.json() as any;

        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        return data;
    }

    getAvatarUrl(userId?: string): string {
        const id = userId || this.userId;
        if (!id) return '';
        return `${this.baseUrl}/api/avatar/${id}`;
    }

    // Sessions endpoints
    async getSessions(userId?: string) {
        const id = userId || this.userId;
        if (!id) throw new Error('User ID not available');

        return await this.request(`/api/sessions?userId=${id}`);
    }

    async createSession(userAgent?: string, ipAddress?: string) {
        if (!this.userId) throw new Error('User not logged in');

        return await this.request('/api/sessions', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                userAgent: userAgent || navigator.userAgent,
                ipAddress,
            }),
        });
    }

    async updateSessionActivity(sessionId: string) {
        return await this.request('/api/sessions/activity', {
            method: 'PUT',
            body: JSON.stringify({ sessionId }),
        });
    }

    async endSession(sessionId: string) {
        return await this.request('/api/sessions/end', {
            method: 'PUT',
            body: JSON.stringify({ sessionId }),
        });
    }

    // Health check
    async healthCheck() {
        return await this.request('/api/health');
    }

    // Payment endpoints (Mercado Pago)
    async createPixPayment(amount: number, packageId?: string, description?: string) {
        return await this.request('/api/payments/create-pix', {
            method: 'POST',
            body: JSON.stringify({ amount, packageId, description }),
        });
    }

    async getPaymentStatus(paymentId: string) {
        return await this.request(`/api/payments/status/${paymentId}`);
    }
}

// Singleton instance
export const apiClient = new ApiClient();

// Para compatibilidade com código existente que usa "supabase"
export const d1Client = apiClient;
