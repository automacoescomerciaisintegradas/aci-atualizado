import React from 'react';
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon, GoogleIcon, PhoneIcon, CheckCircleIcon } from '../Icons.js';

interface AuthFormProps {
  view: 'login' | 'signup' | 'pending-confirmation' | 'forgot-password';
  name: string;
  email: string;
  password: string;
  phone?: string;
  showPassword: boolean;
  isLoading?: boolean;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setPhone?: (phone: string) => void;
  setShowPassword: (show: boolean) => void;
  setView?: (view: 'login' | 'signup' | 'pending-confirmation' | 'forgot-password') => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  handleGoogleLogin: () => void;
  error: string;
}

// Máscara de telefone
const phoneMask = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const AuthForm: React.FC<AuthFormProps> = ({
  view,
  name,
  email,
  password,
  phone = '',
  showPassword,
  isLoading = false,
  setName,
  setEmail,
  setPassword,
  setPhone,
  setShowPassword,
  setView,
  handleEmailChange,
  handlePhoneChange,
  handleFormSubmit,
  handleGoogleLogin,
  error
}) => {
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [localPhone, setLocalPhone] = React.useState(phone);

  // Gerenciar telefone localmente se não houver handler externo
  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = phoneMask(e.target.value);
    setLocalPhone(maskedValue);
    if (handlePhoneChange) {
      e.target.value = maskedValue;
      handlePhoneChange(e);
    } else if (setPhone) {
      setPhone(maskedValue);
    }
  };

  // Benefícios do cadastro
  const signupBenefits = [
    'R$ 10 em créditos de boas-vindas',
    'Acesso a todas as ferramentas de IA',
    'Integração com Shopee, Telegram e WordPress',
    'Suporte por email prioritário',
  ];

  // View: Confirmação pendente
  if (view === 'pending-confirmation') {
    return (
      <div className="relative bg-neutrals-background_secondary border border-white/10 p-10 shadow-2xl backdrop-blur-sm rounded-2xl text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
          <MailIcon className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-4">
          Verifique seu E-mail
        </h2>
        <p className="text-gray-400 mb-6">
          Enviamos um link de confirmação para <strong className="text-brand-primary">{email}</strong>.
          Clique no link para ativar sua conta.
        </p>
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-300">
            💡 <strong>Dica:</strong> Verifique também a pasta de spam.
          </p>
        </div>
        <button
          onClick={() => setView?.('login')}
          className="mt-6 text-brand-primary hover:underline text-sm"
        >
          ← Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-neutrals-background_secondary border border-white/10 p-10 shadow-2xl backdrop-blur-sm rounded-2xl">
      {/* Badge de Status */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
        {view === 'login' ? '🔐 Área Segura' : '🎁 Ganhe R$ 10 em Créditos'}
      </div>

      <div className="mb-8 mt-4">
        <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-tight">
          {view === 'login' ? 'Acesso ao Painel' : 'Criar Conta Grátis'}
        </h2>
        <p className="text-gray-500 text-sm">
          {view === 'login'
            ? 'Digite suas credenciais para acessar'
            : 'Preencha os dados e comece a automatizar!'
          }
        </p>
      </div>

      {/* Benefícios no signup */}
      {view === 'signup' && (
        <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
          <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">✨ Ao criar sua conta:</p>
          <ul className="space-y-2">
            {signupBenefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-green-200/80">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* OAuth Button - Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-100 transition-all mb-4 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        {view === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}
      </button>

      {/* Divisor */}
      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Ou com Email</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <form className="space-y-5" onSubmit={handleFormSubmit}>
        {/* Nome Completo - apenas no signup */}
        {view === 'signup' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              Nome Completo
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm outline-none rounded-lg disabled:opacity-50"
                placeholder="Seu nome completo"
              />
            </div>
          </div>
        )}

        {/* Email Corporativo */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Email {view === 'signup' ? 'Corporativo' : ''}
          </label>
          <div className="relative">
            <MailIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm outline-none rounded-lg disabled:opacity-50"
              placeholder={view === 'signup' ? 'nome@empresa.com' : 'seu@email.com'}
            />
          </div>
        </div>

        {/* Telefone - apenas no signup */}
        {view === 'signup' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
              <input
                id="phone"
                type="tel"
                value={phone || localPhone}
                onChange={handleLocalPhoneChange}
                required
                disabled={isLoading}
                maxLength={15}
                className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm outline-none rounded-lg disabled:opacity-50"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        )}

        {/* Senha */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Senha
          </label>
          <div className="relative">
            <LockIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              className="w-full pl-12 pr-12 py-3 bg-black border border-white/10 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm outline-none rounded-lg disabled:opacity-50"
              placeholder={view === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
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

        {/* Termos - apenas no signup */}
        {view === 'signup' && (
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-black text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
            />
            <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
              Li e concordo com os{' '}
              <a href="/termos" target="_blank" className="text-brand-primary hover:underline">Termos de Uso</a>
              {' '}e a{' '}
              <a href="/privacidade" target="_blank" className="text-brand-primary hover:underline">Política de Privacidade</a>
            </label>
          </div>
        )}

        {/* Esqueceu a senha - apenas no login */}
        {view === 'login' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setView?.('forgot-password')}
              className="text-xs text-gray-500 hover:text-brand-primary transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="text-red-400 text-xs bg-red-900/20 p-3 border border-red-900/30 rounded-lg flex items-center gap-2">
            <span className="text-lg">❌</span>
            {error.includes('Database error') 
              ? 'Erro ao salvar seus dados. Aguarde alguns instantes e tente novamente. Se o problema persistir, contate o suporte.' 
              : error}
          </div>
        )}

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={isLoading || (view === 'signup' && !acceptTerms)}
          className="w-full py-4 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] mt-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Processando...
            </>
          ) : (
            view === 'login' ? '🔓 Acessar Sistema' : '🚀 Criar Minha Conta'
          )}
        </button>

        {/* Link para alternar entre login/signup */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {view === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => setView?.('signup')}
                className="text-brand-primary hover:underline font-semibold"
              >
                Criar conta grátis
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setView?.('login')}
                className="text-brand-primary hover:underline font-semibold"
              >
                Fazer login
              </button>
            </>
          )}
        </p>
      </form>

      {/* Footer de segurança */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <p className="text-center text-[10px] text-gray-600 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Seus dados estão protegidos com criptografia SSL
        </p>
      </div>
    </div>
  );
};

export default AuthForm;