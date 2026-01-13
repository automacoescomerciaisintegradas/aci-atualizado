export interface WooCommerceCredentials {
    url: string;
    consumerKey: string;
    consumerSecret: string;
}

export const validateWooCommerceCredentials = async (credentials: WooCommerceCredentials) => {
    if (!credentials.url || !credentials.consumerKey || !credentials.consumerSecret) {
        return { success: false, message: 'Preencha todos os campos do WooCommerce.' };
    }

    try {
        const token = localStorage.getItem('authToken');
        // Envia para o nosso próprio backend (evita CORS e permite SSL bypass no servidor)
        const response = await fetch('http://localhost:4001/api/integrations/woocommerce/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || `Erro ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Erro na validação do WooCommerce:', error);
        return {
            success: false,
            message: `Erro: ${error.message || 'Não foi possível conectar ao servidor de validação.'}`
        };
    }
};
