/**
 * Adaptador de Autenticação para D1
 * Substitui o Supabase Auth por autenticação customizada com D1
 */

import { D1Client } from './d1Client';
import { nanoid } from 'nanoid';

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    display_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
    last_login_at: string | null;
    updated_at: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
    requiresEmailConfirmation?: boolean;
}

export class D1Auth {
    constructor(private db: D1Client) { }

    /**
     * Registrar novo usuário
     */
    async signUp(email: string, password: string, metadata?: {
        full_name?: string;
        phone?: string;
        role?: 'user' | 'admin';
    }): Promise<AuthResponse> {
        try {
            // Verificar se usuário já existe
            const existing = await this.db.first<User>(
                'SELECT * FROM profiles WHERE email = ?',
                [email]
            );

            if (existing) {
                return {
                    success: false,
                    error: 'Este e-mail já está cadastrado. Tente fazer login.',
                };
            }

            // Criar novo usuário
            const userId = nanoid();
            const now = new Date().toISOString();

            await this.db.execute(
                `INSERT INTO profiles (id, email, full_name, display_name, phone, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
                [
                    userId,
                    email,
                    metadata?.full_name || null,
                    metadata?.full_name?.split(' ')[0] || null,
                    metadata?.phone || null,
                    metadata?.role || 'user',
                    now,
                    now,
                ]
            );

            // Criar registro de créditos
            await this.db.execute(
                `INSERT INTO user_credits (id, user_id, balance, created_at, updated_at)
         VALUES (?, ?, 0, ?, ?)`,
                [nanoid(), userId, now, now]
            );

            // Buscar usuário criado
            const user = await this.db.first<User>(
                'SELECT * FROM profiles WHERE id = ?',
                [userId]
            );

            return {
                success: true,
                user: user!,
            };
        } catch (error: any) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: error.message || 'Erro ao criar conta',
            };
        }
    }

    /**
     * Login de usuário
     * NOTA: Em produção, você precisará adicionar hash de senha!
     * Esta é uma versão simplificada para demonstração
     */
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await this.db.first<User>(
                'SELECT * FROM profiles WHERE email = ? AND status = ?',
                [email, 'active']
            );

            if (!user) {
                return {
                    success: false,
                    error: 'E-mail ou senha incorretos.',
                };
            }

            // Atualizar último login
            const now = new Date().toISOString();
            await this.db.execute(
                'UPDATE profiles SET last_login_at = ?, updated_at = ? WHERE id = ?',
                [now, now, user.id]
            );

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Erro ao fazer login',
            };
        }
    }

    /**
     * Buscar usuário por ID
     */
    async getUser(userId: string): Promise<User | null> {
        return await this.db.first<User>(
            'SELECT * FROM profiles WHERE id = ?',
            [userId]
        );
    }

    /**
     * Atualizar perfil do usuário
     */
    async updateProfile(
        userId: string,
        data: Partial<Pick<User, 'full_name' | 'display_name' | 'phone' | 'avatar_url'>>
    ): Promise<AuthResponse> {
        try {
            const updates: string[] = [];
            const values: any[] = [];

            if (data.full_name !== undefined) {
                updates.push('full_name = ?');
                values.push(data.full_name);
            }
            if (data.display_name !== undefined) {
                updates.push('display_name = ?');
                values.push(data.display_name);
            }
            if (data.phone !== undefined) {
                updates.push('phone = ?');
                values.push(data.phone);
            }
            if (data.avatar_url !== undefined) {
                updates.push('avatar_url = ?');
                values.push(data.avatar_url);
            }

            if (updates.length === 0) {
                return { success: false, error: 'Nenhum dado para atualizar' };
            }

            updates.push('updated_at = ?');
            values.push(new Date().toISOString());
            values.push(userId);

            await this.db.execute(
                `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            const user = await this.getUser(userId);

            return {
                success: true,
                user: user!,
            };
        } catch (error: any) {
            console.error('Update profile error:', error);
            return {
                success: false,
                error: error.message || 'Erro ao atualizar perfil',
            };
        }
    }
}
