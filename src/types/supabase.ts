export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    photo_url: string | null
                    role: 'admin' | 'user'
                    status: 'active' | 'inactive'
                    created_at: string
                    last_login: string | null
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    photo_url?: string | null
                    role?: 'admin' | 'user'
                    status?: 'active' | 'inactive'
                    created_at?: string
                    last_login?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    photo_url?: string | null
                    role?: 'admin' | 'user'
                    status?: 'active' | 'inactive'
                    created_at?: string
                    last_login?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "users_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            api_keys: {
                Row: {
                    id: string
                    provider: string
                    key_value: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    provider: string
                    key_value: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    provider?: string
                    key_value?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            wordpress_connections: {
                Row: {
                    id: string
                    url: string
                    username: string
                    app_password: string // Store encrypted in real app, plain for now as per request
                    status: 'active' | 'inactive' | 'error'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    url: string
                    username: string
                    app_password: string
                    status?: 'active' | 'inactive' | 'error'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    url?: string
                    username?: string
                    app_password?: string
                    status?: 'active' | 'inactive' | 'error'
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}