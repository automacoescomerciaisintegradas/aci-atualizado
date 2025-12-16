import React, { useState } from 'react';
import { apiClient } from '../src/services/apiClient';
import { GoogleIcon } from './Icons';

interface AuthFlowProps {
    onAuthSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';
type AuthMessage = { type: 'success' | 'error' | 'info'; text: string } | null;

export const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<AuthMessage>(null);
    const [emailSent, setEmailSent] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'register') {
                const response = await apiClient.signup(email, password, {
                    full_name: name
                });

                if (!response.success) {
                    throw new Error(response.error || 'Erro ao criar conta');
                }

                setMessage({ type: 'success', text: 'Registro realizado com sucesso!' });
                setTimeout(onAuthSuccess, 1000);

            } else if (mode === 'login') {
                const response = await apiClient.login(email, password);

                if (!response.success) {
                    throw new Error(response.error || 'Credenciais inválidas');
                }

                setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
                setTimeout(onAuthSuccess, 1000);

            } else if (mode === 'forgot-password') {
                const response = await apiClient.forgotPassword(email);

                if (!response.success) {
                    throw new Error(response.error || 'Erro ao enviar email');
                }

                setMessage({
                    type: 'success',
                    text: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
                });
                setEmailSent(true);
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Ocorreu um erro. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setMessage(null);

        try {
            // TODO: Implementar Google OAuth via Cloudflare Worker
            setMessage({
                type: 'info',
                text: 'Login com Google será implementado em breve.'
            });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Erro ao autenticar com Google'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setMessage(null);
        setEmailSent(false);
    };

    const switchMode = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 md:gap-0">
                {/* Left Side - Illustration */}
                <div className="hidden md:flex flex-col justify-center items-center text-white p-12 bg-gradient-to-b from-blue-500/20 to-transparent rounded-l-2xl">
                    <div className="text-center space-y-6">
                        <div className="text-6xl mb-4">🚀</div>
                        <h2 className="text-4xl font-bold font-display">
                            ACI - Automações Comerciais Integradas
                        </h2>
                        <p className="text-lg text-blue-100">
                            A primeira plataforma que une IA, Telegram e WordPress para automação de vendas
                        </p>
                        <div className="flex justify-center gap-6 mt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold">10K+</div>
                                <div className="text-sm text-blue-200">Posts Gerados</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">500+</div>
                                <div className="text-sm text-blue-200">Usuários Ativos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">99%</div>
                                <div className="text-sm text-blue-200">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="bg-white rounded-r-2xl md:rounded-l-none rounded-2xl shadow-2xl p-8 md:p-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {mode === 'login' && 'Que bom ter você de volta 👋'}
                            {mode === 'register' && 'Crie sua conta grátis ✨'}
                            {mode === 'forgot-password' && 'Recuperar senha 🔐'}
                        </h1>
                        <p className="text-gray-600">
                            {mode === 'login' && 'Acesse sua conta e escale seus lucros com inteligência.'}
                            {mode === 'register' && 'Comece a automatizar suas vendas hoje mesmo.'}
                            {mode === 'forgot-password' && 'Digite seu email para receber o link de recuperação.'}
                        </p>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div
                            className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : message.type === 'error'
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}
                        >
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    {!emailSent && (
                        <>
                            {/* Google OAuth Button */}
                            {mode !== 'forgot-password' && (
                                <button
                                    onClick={handleGoogleAuth}
                                    disabled={loading}
                                    className="w-full mb-6 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <GoogleIcon className="w-5 h-5" />
                                    Continuar com Google
                                </button>
                            )}

                            {mode !== 'forgot-password' && (
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">ou continue com email</span>
                                    </div>
                                </div>
                            )}

                            {/* Email/Password Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {mode === 'register' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="João Silva"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                {mode !== 'forgot-password' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Senha
                                            </label>
                                            {mode === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() => switchMode('forgot-password')}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Esqueceu a senha?
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                        {mode === 'register' && (
                                            <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Processando...
                                        </span>
                                    ) : (
                                        <>
                                            {mode === 'login' && 'Entrar'}
                                            {mode === 'register' && 'Criar Conta'}
                                            {mode === 'forgot-password' && 'Enviar Link de Recuperação'}
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Switch Mode Links */}
                            <div className="mt-6 text-center text-sm">
                                {mode === 'login' && (
                                    <p className="text-gray-600">
                                        Novo por aqui?{' '}
                                        <button
                                            onClick={() => switchMode('register')}
                                            className="text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            Crie sua conta
                                        </button>
                                    </p>
                                )}
                                {(mode === 'register' || mode === 'forgot-password') && (
                                    <p className="text-gray-600">
                                        Já tem uma conta?{' '}
                                        <button
                                            onClick={() => switchMode('login')}
                                            className="text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            Fazer login
                                        </button>
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Email Verification Notice */}
                    {emailSent && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">📧</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Verifique seu Email</h3>
                            <p className="text-gray-600 mb-6">
                                {mode === 'register'
                                    ? 'Enviamos um link de confirmação para ativar sua conta.'
                                    : 'Enviamos um link de recuperação de senha.'}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Se não encontrar o email, verifique também sua caixa de spam ou lixo eletrônico.
                            </p>
                            <button
                                onClick={() => {
                                    setEmailSent(false);
                                    switchMode('login');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                ← Voltar ao login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
