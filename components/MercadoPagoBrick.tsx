import React, { useEffect } from 'react';
import { useMercadoPago } from '../hooks/useMercadoPago';

interface MercadoPagoBrickProps {
    amount: number;
    email?: string;
    description?: string;
    onPaymentResult: (result: any) => void;
    onError?: (error: any) => void;
    onReady?: () => void;
}

export const MercadoPagoBrick: React.FC<MercadoPagoBrickProps> = ({
    amount,
    email,
    description,
    onPaymentResult,
    onError,
    onReady
}) => {
    const mp = useMercadoPago();

    useEffect(() => {
        if (!mp) return;

        const renderBrick = async () => {
            const bricksBuilder = mp.bricks();

            const settings = {
                initialization: {
                    amount: amount,
                    payer: {
                        email: email || '',
                    },
                    preferenceId: "<PREFERENCE_ID>", // Se você gerar a preference no backend, use isso. Se não, remova ou use initialization.amount
                },
                customization: {
                    paymentMethods: {
                        ticket: "all",
                        bankTransfer: "all",
                        creditCard: "all",
                        debitCard: "all",
                        mercadoPago: "all",
                    },
                    visual: {
                        style: {
                            theme: 'dark', // 'default' | 'dark' | 'bootstrap' | 'flat'
                        }
                    }
                },
                callbacks: {
                    onReady: () => {
                        console.log('Brick pronto');
                        onReady?.();
                    },
                    onSubmit: ({ selectedPaymentMethod, formData }: any) => {
                        // callback chamado ao clicar no botão de submissão dos dados
                        return new Promise((resolve, reject) => {
                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';
                            const token = localStorage.getItem('authToken');

                            fetch(`${API_URL}/api/payments/process_payment`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify(formData),
                            })
                                .then((response) => response.json())
                                .then((response) => {
                                    if (response.error || response.status === 'error') {
                                        onError?.(response.error || 'Erro desconhecido');
                                        reject();
                                    } else {
                                        onPaymentResult(response);
                                        resolve(true);
                                    }
                                })
                                .catch((error) => {
                                    onError?.(error);
                                    reject();
                                });
                        });
                    },
                    onError: (error: any) => {
                        console.error(error);
                        onError?.(error);
                    },
                },
            };

            try {
                // controller para evitar duplicação
                window.paymentBrickController = await bricksBuilder.create(
                    "payment",
                    "paymentBrick_container",
                    settings
                );
            } catch (error) {
                console.error('Erro ao criar brick:', error);
            }
        };

        renderBrick();

        return () => {
            if (window.paymentBrickController) {
                window.paymentBrickController.unmount();
                window.paymentBrickController = undefined;
            }
        };
    }, [mp, amount, email]); // Dependências

    return (
        <div id="paymentBrick_container"></div>
    );
};

// Declaração global para o controller
declare global {
    interface Window {
        paymentBrickController: any;
    }
}
