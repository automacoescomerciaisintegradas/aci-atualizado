import React, { useState, useEffect } from 'react';
import { InstagramIcon, AlertTriangleIcon, CheckCircleIcon, ChevronLeftIcon, SpinnerIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '../services/supabaseClient';

const ConsentWarningModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
                        <InstagramIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                        Conectar conta do Instagram
                    </h3>
                    <div className="text-sm text-gray-600 space-y-4 mb-6">
                        <p>
                            Para usar este recurso a conta deve ser <strong>Instagram Profissional (Empresa ou Criador)</strong>. Para responder comentários e enviar mensagens no Direct, a conta precisa estar <strong>vinculada a uma Página do Facebook</strong>.
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="font-medium text-gray-900 mb-2 text-xs">Vamos solicitar as seguintes permissões Meta:</p>
                            <code className="text-xs text-blue-600 font-mono block break-words">
                                public_profile, instagram_basic, instagram_manage_comments, pages_show_list, pages_read_engagement, pages_manage_metadata, instagram_manage_messages, instagram_content_publish, instagram_manage_insights
                            </code>
                        </div>
                        <p className="text-xs">
                            Essas permissões permitem conectar sua conta, publicar posts orgânicos, responder comentários e mensagens, e exibir métricas de desempenho diretamente pelo painel.
                        </p>
                        <p className="text-xs text-gray-500 italic">
                            Você poderá desconectar sua conta Meta a qualquer momento nas configurações.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                        >
                            Continuar para Facebook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const InstagramConnectPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { settings } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const message = params.get('message');
        const count = params.get('count');

        if (status === 'success') {
            setSuccessMessage(`Conexão realizada com sucesso! ${count ? `${count} conta(s) vinculada(s).` : ''}`);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (status === 'error' || status === 'warning') {
            setError(decodeURIComponent(message || 'Erro desconhecido ao conectar.'));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleConnectClick = () => {
        setShowConsentModal(true);
    };

    const proceedToConnect = async () => {
        setShowConsentModal(false);
        setIsLoading(true);
        setError(null);

        try {
            if (!supabase) {
                throw new Error('Cliente Supabase não inicializado. Verifique as configurações.');
            }
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // URL da API
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';

            const response = await fetch(`${apiUrl}/api/integrations/instagram/auth`, {
                headers: {
                    'Authorization': `Bearer ${token || ''}`
                }
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Falha ao iniciar conexão: ${errText}`);
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de autenticação não recebida do servidor.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao conectar com o servidor.");
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in text-dark-text-primary">
            <div className="mb-10 text-center max-w-2xl mx-auto relative">
                {onBack && (
                    <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-full text-dark-text-secondary transition-colors">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                )}
                <InstagramIcon className="h-16 w-16 text-brand-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Conectar conta do Instagram</h1>
                <p className="text-md text-dark-text-secondary">
                    Integre seu perfil para gerenciar publicações, comentários e mensagens diretamente do painel ACI.
                </p>
            </div>

            <div className="max-w-2xl mx-auto bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-8 animate-fade-in">

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-start gap-3 mb-6">
                        <AlertTriangleIcon />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-lg flex items-start gap-3 mb-6">
                        <CheckCircleIcon className="h-5 w-5" />
                        <p className="text-sm">{successMessage}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-10">
                        <SpinnerIcon className="mx-auto h-10 w-10 text-brand-primary animate-spin" />
                        <p className="mt-4 text-dark-text-secondary">Redirecionando para o Facebook...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-dark-text-secondary space-y-4">
                            <p>Para usar este recurso a conta deve ser <strong>Instagram Profissional (Empresa ou Criador de Conteúdo)</strong>. Para responder comentários e enviar mensagens no Direct, a conta precisa estar <strong>vinculada a uma Página do Facebook</strong>.</p>

                            <div className="p-4 bg-slate-800/50 rounded-lg border border-dark-border">
                                <p className="font-semibold text-dark-text-primary mb-2">Vamos solicitar as seguintes permissões Meta para funcionamento completo da integração:</p>
                                <code className="text-xs text-slate-400 font-mono bg-dark-bg p-2 rounded-md block break-words">public_profile, instagram_basic, instagram_manage_comments, pages_show_list, pages_read_engagement, pages_manage_metadata, instagram_manage_messages, instagram_content_publish, instagram_manage_insights</code>
                            </div>

                            <p>Essas permissões permitem conectar sua conta, publicar posts orgânicos, responder comentários e mensagens, e exibir métricas de desempenho diretamente pelo painel.</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-dark-border">
                            <label htmlFor="confirm-checkbox" className="flex items-start gap-3 cursor-pointer">
                                <input
                                    id="confirm-checkbox"
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => setIsChecked(!isChecked)}
                                    className="mt-1 h-4 w-4 flex-shrink-0 text-brand-primary bg-slate-800 border-dark-border rounded focus:ring-brand-primary"
                                />
                                <span className="text-sm text-dark-text-secondary">Confirmo que a conta é (ou será) profissional e entendo os requisitos acima.</span>
                            </label>

                            <button
                                onClick={handleConnectClick}
                                disabled={!isChecked}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg transition-opacity duration-300 shadow-lg shadow-indigo-500/30 hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <InstagramIcon className="h-5 w-5" />
                                <span>Conectar com Facebook/Instagram</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ConsentWarningModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onConfirm={proceedToConnect}
            />
        </div>
    );
};