import React, { useEffect, useState } from 'react';
import { SpinnerIcon, CheckIcon, XIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';

export const OAuthConsentPage: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processando autorização...');
    const { saveSettings, settings } = useSettings();

    useEffect(() => {
        const processOAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const error = params.get('error');
            const errorReason = params.get('error_reason');
            const errorDescription = params.get('error_description');

            if (error) {
                setStatus('error');
                setMessage(`Erro na autorização: ${errorDescription || errorReason || error}`);
                return;
            }

            if (code) {
                // Here we would typically exchange the code for an access token.
                // Since this is a client-side demo/implementation, we'll simulate success
                // or store the code if that's the flow.

                // For Instagram Basic Display API, we need to exchange code for token via backend or proxy.
                // For now, we'll just display the code and instructions, or simulate a save.

                console.log('Authorization Code received:', code);

                // Simulate processing delay
                setTimeout(() => {
                    setStatus('success');
                    setMessage('Autorização concluída com sucesso! Você pode fechar esta janela.');

                    // If opened in a popup, try to notify opener
                    if (window.opener) {
                        window.opener.postMessage({ type: 'OAUTH_SUCCESS', code }, '*');
                        window.close();
                    }
                }, 1500);

            } else {
                setStatus('error');
                setMessage('Nenhum código de autorização encontrado.');
            }
        };

        processOAuth();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg text-dark-text-primary p-4">
            <div className="max-w-md w-full bg-dark-card border border-dark-border rounded-xl p-8 shadow-2xl text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 text-brand-primary mb-6 animate-spin">
                            <SpinnerIcon />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Autorizando...</h2>
                        <p className="text-dark-text-secondary">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <div className="h-16 w-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                            <CheckIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-green-400">Sucesso!</h2>
                        <p className="text-dark-text-secondary mb-6">{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Voltar para o App
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <div className="h-16 w-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <XIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-red-400">Falha na Autorização</h2>
                        <p className="text-dark-text-secondary mb-6">{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Voltar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
