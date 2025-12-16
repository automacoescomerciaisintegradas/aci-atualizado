import React, { useState, useEffect } from 'react';
import { LockIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from './Icons.js';
import { apiClient } from '../src/services/apiClient';

interface ResetPasswordPageProps {
    onBackToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onBackToLogin }) => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [email, setEmail] = useState('');

    // Extrair token da URL ao carregar
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');

        if (urlToken) {
            setToken(urlToken);
            verifyToken(urlToken);
        }
    }, []);

    // Verificar se o token é válido
    const verifyToken = async (tokenToVerify: string) => {
        try {
            const response = await apiClient.verifyResetToken(tokenToVerify);

            if (response.success) {
                setTokenValid(true);
                setEmail(response.email || '');
            } else {
                setTokenValid(false);
                setError(response.error || 'Token inválido ou expirado');
            }
        } catch (err: any) {
            setTokenValid(false);
            setError(err.message || 'Erro ao verificar token');
        }
    };

    // Submeter nova senha
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await apiClient.resetPassword(token, newPassword);

            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.error || 'Erro ao redefinir senha');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha');
        }

        setIsLoading(false);
    };

    // Token inválido ou expirado
    if (tokenValid === false) {
        return (
            <div className="min-h-screen bg-neutrals-background_main flex items-center justify-center p-4">
                <div className="bg-neutrals-background_secondary border border-white/10 p-10 shadow-2xl backdrop-blur-sm rounded-2xl max-w-md w-full text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                        Link Inválido
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {error || 'Este link de redefinição de senha é inválido ou já expirou.'}
                    </p>
                    <button
                        onClick={onBackToLogin}
                        className="w-full py-4 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] rounded-xl"
                    >
                        Voltar para o Login
                    </button>
                </div>
            </div>
        );
    }

    // Verificando token
    if (tokenValid === null) {
        return (
            <div className="min-h-screen bg-neutrals-background_main flex items-center justify-center p-4">
                <div className="bg-neutrals-background_secondary border border-white/10 p-10 shadow-2xl backdrop-blur-sm rounded-2xl max-w-md w-full text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-brand-primary/20 rounded-full flex items-center justify-center animate-pulse">
                        <LockIcon className="w-10 h-10 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                        Verificando...
                    </h2>
                    <p className="text-gray-400">
                        Aguarde enquanto verificamos seu link de redefinição.
                    </p>
                </div>
            </div>
        );
    }

    // Sucesso - senha alterada
    if (success) {
        return (
            <div className="min-h-screen bg-neutrals-background_main flex items-center justify-center p-4">
                <div className="bg-neutrals-background_secondary border border-white/10 p-10 shadow-2xl backdrop-blur-sm rounded-2xl max-w-md w-full text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircleIcon className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                        Senha Alterada!
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.
                    </p>
                    <button
                        onClick={onBackToLogin}
                        className="w-full py-4 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] rounded-xl"
                    >
                        🔓 Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    // Formulário de nova senha
    return (
        <div className="min-h-screen bg-neutrals-background_main flex items-center justify-center p-4">
            <div className="bg-neutrals-background_secondary border border-white/10 p-10 shadow-2xl backdrop-blur-sm rounded-2xl max-w-md w-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
                    🔐 Área Segura
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-brand-primary/20 rounded-full flex items-center justify-center">
                        <LockIcon className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                        Criar Nova Senha
                    </h2>
                    {email && (
                        <p className="text-gray-400 text-sm">
                            Para: <span className="text-brand-primary">{email}</span>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nova Senha */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Nova Senha
                        </label>
                        <div className="relative">
                            <LockIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                                className="w-full pl-12 pr-12 py-3 bg-black border border-white/10 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm outline-none rounded-lg disabled:opacity-50"
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-4 top-3.5 text-gray-600 hover:text-white transition-colors disabled:opacity-50"
                            >
                                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <LockIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                                className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm outline-none rounded-lg disabled:opacity-50"
                                placeholder="Repita a senha"
                            />
                        </div>
                    </div>

                    {/* Erro */}
                    {error && (
                        <div className="text-red-400 text-xs bg-red-900/20 p-3 border border-red-900/30 rounded-lg flex items-center gap-2">
                            <span className="text-lg">❌</span>
                            {error}
                        </div>
                    )}

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] mt-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                Alterando...
                            </>
                        ) : (
                            '🔒 Alterar Senha'
                        )}
                    </button>
                </form>

                <button
                    onClick={onBackToLogin}
                    className="mt-6 w-full text-center text-brand-primary hover:underline text-sm"
                >
                    ← Voltar para o login
                </button>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
