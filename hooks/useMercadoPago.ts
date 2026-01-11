import { useEffect, useState } from 'react';

declare global {
    interface Window {
        MercadoPago: any;
    }
}

/**
 * Hook para inicializar o SDK do Mercado Pago
 */
export const useMercadoPago = () => {
    const [mp, setMp] = useState<any>(null);

    useEffect(() => {
        if (window.MercadoPago) {
            // Tenta obter a chave do import.meta.env (Vite)
            // Caso não exista, você pode passar manualmente ou usar o default do .env se exposto
            const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

            if (publicKey) {
                try {
                    const mpInstance = new window.MercadoPago(publicKey);
                    setMp(mpInstance);
                    console.log('✅ Mercado Pago SDK inicializado com sucesso');
                } catch (error) {
                    console.error('❌ Erro ao inicializar Mercado Pago SDK:', error);
                }
            } else {
                console.warn('⚠️ VITE_MERCADO_PAGO_PUBLIC_KEY não encontrada nas variáveis de ambiente.');
            }
        } else {
            console.warn('⚠️ Script do Mercado Pago não carregado. Verifique o index.html');
        }
    }, []);

    return mp;
};
