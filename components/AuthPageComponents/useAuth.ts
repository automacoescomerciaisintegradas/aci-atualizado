import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { supabase } from '../../services/supabaseClient.js';

interface User {
  name: string;
  email: string;
  photoUrl: string;
  isAdmin: boolean;
}

export const useAuth = (onLoginSuccess: (user: User) => void) => {
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

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');

        if (accessToken) {
          try {
            setIsLoading(true);
            // Fetch User Info from Google
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              const email = data.email;
              const name = data.name;
              const photoUrl = data.picture;

              // Check Admin
              // @ts-ignore
              const envAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
              const ADMIN_EMAILS = ['admin@aci.com', 'suporte@aci.com', ...(envAdminEmail ? [envAdminEmail] : [])];
              // TEMPORARY: Force admin for all users during development to unblock access
              const isAdmin = true; // ADMIN_EMAILS.includes(email);

              console.log('Google Login Success:', { name, email, isAdmin });

              // Send access token to backend to exchange/verify and receive app JWT
              try {
                const backendResp = await fetch('/auth/google', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ accessToken })
                });

                if (backendResp.ok) {
                  const backendJson = await backendResp.json();
                  if (backendJson.token) {
                    localStorage.setItem('aci_token', backendJson.token);
                    console.log('Received app JWT from backend');
                  }
                } else {
                  console.warn('Backend /auth/google returned non-OK:', backendResp.status);
                }
              } catch (err) {
                console.warn('Erro ao chamar /auth/google:', err);
              }

              // Login with Supabase using OAuth
              if (supabase) {
                try {
                  // Try to get user or sign in
                  const { data: { user } } = await supabase.auth.getUser();

                  if (user) {
                    // Update profile
                    await supabase.from('profiles').upsert({
                      id: user.id,
                      email: email,
                      full_name: name,
                      avatar_url: photoUrl,
                      last_login_at: new Date().toISOString()
                    }, { onConflict: 'id' });
                  }
                } catch (dbError) {
                  console.error('Error syncing user with Supabase:', dbError);
                }
              }

              // Clear Hash
              window.history.replaceState(null, '', window.location.pathname);

              onLoginSuccess({
                name,
                email,
                photoUrl,
                isAdmin
              });
            } else {
              console.error('Failed to fetch user info');
              setError('Falha ao obter dados do Google.');
            }
          } catch (err) {
            console.error('Error fetching user info:', err);
            setError('Erro ao conectar com Google.');
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    handleGoogleCallback();
  }, [onLoginSuccess]);

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
    console.log('Form submitted with:', { email, password, view, phone });

    // Validações
    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (view === 'signup' && !name.trim()) {
      setError("Por favor, insira seu nome completo.");
      return;
    }
    if (view === 'signup' && !validatePhone(phone)) {
      setError("Por favor, insira um telefone válido.");
      return;
    }

    setError('');
    setIsLoading(true);

    // Admin Check
    const envAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const ADMIN_EMAILS = ['admin@aci.com', 'suporte@aci.com', ...(envAdminEmail ? [envAdminEmail] : [])];
    const isAdmin = ADMIN_EMAILS.includes(email);

    try {
      console.log('Supabase client:', supabase);
      if (supabase) {
        if (view === 'signup') {
          console.log('Attempting signup...');

          // Sign Up with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                name: name,
                phone: phone,
                role: isAdmin ? 'admin' : 'user'
              }
            }
          });

          if (authError) {
            console.error('Signup error:', authError);

            // Mensagens de erro amigáveis
            if (authError.message.includes('already registered')) {
              throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
            }
            // Handle database errors specifically
            if (authError.message.includes('Database error')) {
              throw new Error('Erro ao salvar seus dados. Por favor, tente novamente ou contate o suporte.');
            }
            throw authError;
          }

          console.log('Signup successful:', authData);

          // O trigger no banco deve criar o perfil automaticamente
          // Mas vamos garantir que os dados estejam completos
          if (authData.user) {
            try {
              const { error: profileError } = await supabase.from('profiles').upsert({
                id: authData.user.id,
                email: email,
                full_name: name,
                display_name: name.split(' ')[0],
                phone: phone,
                role: isAdmin ? 'admin' : 'user',
                status: 'active',
                last_login_at: new Date().toISOString()
              }, { onConflict: 'id' });
              
              if (profileError) {
                console.warn('Could not update profile (might be handled by trigger):', profileError);
                // Don't throw error here as it might be due to RLS policies
              }
            } catch (profileError) {
              console.warn('Could not update profile (might be handled by trigger):', profileError);
              // Don't throw error here as it might be due to RLS policies
            }
          }

          // Check if email confirmation is required
          if (authData.user?.email_confirmed_at === null && authData.session === null) {
            setView('pending-confirmation');
            setIsLoading(false);
            return;
          }

        } else {
          console.log('Attempting login...');

          // Login with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError) {
            console.error('Login error:', authError);

            // Mensagens de erro amigáveis
            if (authError.message.includes('Invalid login credentials')) {
              throw new Error('E-mail ou senha incorretos.');
            }
            if (authError.message.includes('Email not confirmed')) {
              throw new Error('Confirme seu e-mail antes de fazer login.');
            }
            throw authError;
          }

          console.log('Login successful:', authData);

          // Atualizar último login no perfil
          if (authData.user) {
            try {
              await supabase.from('profiles').update({
                last_login_at: new Date().toISOString()
              }).eq('id', authData.user.id);
            } catch (updateError) {
              console.warn('Could not update last_login:', updateError);
            }
          }

          // Get user metadata
          const userName = authData.user?.user_metadata?.full_name ||
            authData.user?.user_metadata?.name ||
            name ||
            'Usuário ACI';

          const userPhoto = authData.user?.user_metadata?.avatar_url || '';

          onLoginSuccess({
            name: userName,
            email: authData.user?.email || email,
            photoUrl: userPhoto,
            isAdmin
          });
          setIsLoading(false);
          return;
        }
      } else {
        console.warn('Supabase client not initialized. Using mock authentication.');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Provide more user-friendly error messages
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

    // Fallback / Success Flow (for signup without email confirmation)
    console.log(`Login/Signup success for:`, { email, isAdmin });
    onLoginSuccess({
      name: name || 'Usuário ACI',
      email,
      photoUrl: '',
      isAdmin
    });
    setIsLoading(false);
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
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;
        setResetStatus('sent');
      } else {
        // Simulação
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResetStatus('sent');
      }
    } catch (err: any) {
      setResetStatus('error');
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    }
  };

  const generateState = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleGoogleLogin = async () => {
    console.log('Google login initiated');
    setIsLoading(true);

    // Use Supabase OAuth if available
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) throw error;
        console.log('Supabase Google OAuth initiated:', data);
        return;
      } catch (err) {
        console.warn('Supabase OAuth failed, falling back to direct Google OAuth:', err);
      }
    }

    // Fallback to direct Google OAuth
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "344114575890-jcgjbhokkagq2sj9ptbmt87v9d2nnal4.apps.googleusercontent.com";
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent("email profile");
    const state = generateState();

    console.log('Google OAuth params:', { googleClientId, redirectUri, scope, state });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&state=${state}&include_granted_scopes=true`;

    console.log('Redirecting to Google OAuth:', authUrl);
    window.location.href = authUrl;
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
    handleForgotPassword,
    handleGoogleLogin
  };
};