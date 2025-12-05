/**
 * Newsletter Lead Service
 * Gerencia a inscrição e gestão de leads da newsletter
 */

import { supabase } from '../src/common/utils/supabaseClient';

export interface NewsletterLead {
    id?: string;
    email: string;
    name?: string;
    status?: 'active' | 'unsubscribed' | 'bounced';
    source?: string;
    subscribed_at?: string;
    welcome_email_sent?: boolean;
    metadata?: Record<string, any>;
}

export interface NewsletterResponse {
    success: boolean;
    message: string;
    alreadySubscribed?: boolean;
    lead?: NewsletterLead;
}

/**
 * Inscreve um email na newsletter
 */
export async function subscribeToNewsletter(
    email: string,
    name?: string,
    source: string = 'landing_page'
): Promise<NewsletterResponse> {
    try {
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Email inválido. Por favor, verifique e tente novamente.',
            };
        }

        // Verificar se o email já existe
        const { data: existingLead, error: checkError } = await supabase
            .from('newsletter_leads')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existingLead) {
            // Email já cadastrado
            if (existingLead.status === 'unsubscribed') {
                // Reativar inscrição
                const { data: reactivatedLead, error: updateError } = await supabase
                    .from('newsletter_leads')
                    .update({
                        status: 'active',
                        subscribed_at: new Date().toISOString(),
                        name: name || existingLead.name,
                    })
                    .eq('email', email.toLowerCase().trim())
                    .select()
                    .single();

                if (updateError) {
                    console.error('Error reactivating lead:', updateError);
                    return {
                        success: false,
                        message: 'Erro ao reativar inscrição. Tente novamente.',
                    };
                }

                // Enviar email de boas-vindas
                await sendWelcomeEmail(email);

                return {
                    success: true,
                    message: '🎉 Bem-vindo de volta! Sua inscrição foi reativada.',
                    lead: reactivatedLead,
                };
            }

            return {
                success: true,
                message: '✅ Este email já está inscrito na nossa newsletter!',
                alreadySubscribed: true,
                lead: existingLead,
            };
        }

        // Inserir novo lead
        const { data: newLead, error: insertError } = await supabase
            .from('newsletter_leads')
            .insert({
                email: email.toLowerCase().trim(),
                name: name?.trim() || null,
                source,
                status: 'active',
                metadata: {
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                    referrer: typeof document !== 'undefined' ? document.referrer : null,
                    timestamp: new Date().toISOString(),
                },
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting lead:', insertError);
            return {
                success: false,
                message: 'Erro ao processar inscrição. Tente novamente.',
            };
        }

        // Enviar email de boas-vindas
        await sendWelcomeEmail(email);

        return {
            success: true,
            message: '🎉 Obrigado por se inscrever! Você receberá nossas novidades em breve.',
            lead: newLead,
        };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return {
            success: false,
            message: 'Erro inesperado. Por favor, tente novamente.',
        };
    }
}

/**
 * Envia email de boas-vindas para o lead
 */
export async function sendWelcomeEmail(email: string): Promise<boolean> {
    try {
        // Chamar a função do Supabase para enviar o email
        const { data, error } = await supabase.rpc('send_welcome_email', {
            lead_email: email,
        });

        if (error) {
            console.error('Error sending welcome email:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Welcome email error:', error);
        return false;
    }
}

/**
 * Cancela inscrição na newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<NewsletterResponse> {
    try {
        const { data, error } = await supabase
            .from('newsletter_leads')
            .update({
                status: 'unsubscribed',
                unsubscribed_at: new Date().toISOString(),
            })
            .eq('email', email.toLowerCase().trim())
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Erro ao cancelar inscrição.',
            };
        }

        return {
            success: true,
            message: 'Inscrição cancelada com sucesso.',
            lead: data,
        };
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return {
            success: false,
            message: 'Erro ao processar cancelamento.',
        };
    }
}

/**
 * Verifica se um email já está inscrito
 */
export async function checkEmailSubscribed(email: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('newsletter_leads')
            .select('id, status')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (error || !data) {
            return false;
        }

        return data.status === 'active';
    } catch (error) {
        return false;
    }
}
