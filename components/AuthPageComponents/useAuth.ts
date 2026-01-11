import { useState, FormEvent, ChangeEvent } from 'react';
import { apiClient } from '../../src/services/apiClient';

interface User {
  name: string;
  email: string;
  photoUrl: string;
  isAdmin: boolean;
}

export const useAuth = (onLoginSuccess: (user: User, isNewUser?: boolean) => void) => {
  const [view, setView] = useState<'login' | 'signup' | 'pending-confirmation' | 'forgot-password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Aplica máscara de telefone
    const digits = e.target.value.replace(/\D/g, '');
    let formatted = digits;

    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    setPhone(formatted);
  };

  const validateEmail = (emailToValidate: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailToValidate);
  };

  const validatePhone = (phoneToValidate: string) => {
    const digits = phoneToValidate.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Log removido para produção

    // Validações básicas
    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    // Para forgot-password, não precisa de senha
    if (view === 'forgot-password') {
      setError('');
      setIsLoading(true);

      try {
        console.log('Requesting password reset for:', email);
        const response = await apiClient.forgotPassword(email);

        if (response.success) {
          // Mostrar mensagem de sucesso
          setView('pending-confirmation');
          console.log('Password reset email sent successfully');
        } else {
          // Por segurança, mostramos sucesso mesmo se email não existir
          setView('pending-confirmation');
        }
      } catch (err: any) {
        console.error('Password reset error:', err);
        setError(err.message || 'Erro ao enviar e-mail de recuperação.');
      }

      setIsLoading(false);
      return;
    }

    // Validações para login/signup
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (view === 'signup' && !name.trim()) {
      setError("Por favor, insira seu nome completo.");
      return;
    }
    if (view === 'signup' && !validatePhone(phone)) {
      setError("Por favor, insira um telefone/WhatsApp válido.");
      return;
    }

    setError('');
    setIsLoading(true);

    // Admin Check
    const envAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const ADMIN_EMAILS = [
      'admin@aci.com',
      'suporte@aci.com',
      'teste@teste.com',
      'automacoescomerciais@gmail.com',
      'contato@automacoescomerciais.com.br',
      'admin@automacoescomerciais.com.br',
      'suporte@automacoescomerciais.com.br',
      ...(envAdminEmail ? [envAdminEmail] : [])
    ];
    const isAdmin = ADMIN_EMAILS.includes(email);

    try {
      if (view === 'signup') {
        console.log('Attempting signup with D1...');

        // Sign Up with D1 API
        const response = await apiClient.signup(email, password, {
          full_name: name,
          phone: phone,
          role: isAdmin ? 'admin' : 'user'
        });

        if (!response.success) {
          throw new Error(response.error || 'Erro ao criar conta');
        }

        // Log removido para produção

        // Login automático após signup
        const user = response.user;
        onLoginSuccess({
          name: user.full_name || user.display_name || 'Usuário ACI',
          email: user.email,
          photoUrl: user.avatar_url || '',
          isAdmin: user.role === 'admin'
        }, true); // true = novo usuário
        setIsLoading(false);
        return;

      } else {
        console.log('Attempting login with D1...');

        // Login with D1 API
        const response = await apiClient.login(email, password);

        // Log removido para produção

        if (!response.success) {
          throw new Error(response.error || 'Credenciais inválidas');
        }

        console.log('Login successful:', response);

        const user = response.user;
        onLoginSuccess({
          name: user.full_name || user.display_name || 'Usuário ACI',
          email: user.email,
          photoUrl: user.avatar_url || '',
          isAdmin: user.role === 'admin'
        }, false); // false = usuário existente
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('Authentication error:', err);

      // Mensagens de erro amigáveis
      if (err.message) {
        if (err.message.includes('Network Error') || err.message.includes('fetch failed')) {
          setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } else if (err.message.includes('Database error')) {
          setError('Erro ao salvar seus dados. Por favor, tente novamente ou contate o suporte.');
        } else if (err.message.includes('constraint')) {
          setError('Dados inválidos. Verifique as informações e tente novamente.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro na autenticação. Por favor, tente novamente.');
      }

      setIsLoading(false);
      return;
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');

    if (!validateEmail(resetEmail)) {
      setResetStatus('error');
      setError('E-mail inválido.');
      return;
    }

    try {
      console.log('Requesting password reset for:', resetEmail);
      const response = await apiClient.forgotPassword(resetEmail);

      if (response.success) {
        setResetStatus('sent');
        console.log('Password reset email sent successfully');
      } else {
        // Por segurança, mostramos sucesso mesmo se email não existir
        setResetStatus('sent');
        console.log('Password reset response:', response);
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setResetStatus('error');
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    }
  };

  return {
    view,
    setView,
    showPassword,
    setShowPassword,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    phone,
    setPhone,
    error,
    setError,
    resetEmail,
    setResetEmail,
    resetStatus,
    setResetStatus,
    isLoading,
    handleEmailChange,
    handlePhoneChange,
    validateEmail,
    validatePhone,
    handleFormSubmit,
    handleForgotPassword
  };
};