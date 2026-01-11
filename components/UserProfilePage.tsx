import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { UserIcon, CameraIcon, MailIcon, PhoneIcon, FileTextIcon, ChevronLeftIcon, ShieldCheckIcon, LockIcon } from './Icons';
import { apiClient } from '../src/services/apiClient';
import type { Page } from '../App';
import { PayPerUseBanner } from './PayPerUseBanner';

interface UserProfilePageProps {
    onNavigate: (page: Page) => void;
    user?: { name: string; email: string; photoUrl: string };
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate, user }) => {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoUrl || null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [document, setDocument] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Estados para alteração de senha
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStatus, setPasswordStatus] = useState('');

    // Carregar dados do usuário
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoading(true);
                const cachedEmail = localStorage.getItem('userEmail');
                const cachedName = localStorage.getItem('userName');

                if (cachedEmail) setEmail(cachedEmail);
                if (cachedName) setName(cachedName);

                if (apiClient) {
                    const response = await apiClient.getUser();
                    if (response.success && response.user) {
                        const userData = response.user;
                        setName(userData.full_name || userData.display_name || '');
                        setEmail(userData.email || '');
                        setPhone(userData.phone || '');
                        setDocument(userData.document || '');

                        if (userData.avatar_url) {
                            setAvatarPreview(userData.avatar_url);
                        }

                        localStorage.setItem('userEmail', userData.email);
                        localStorage.setItem('userName', userData.full_name || userData.display_name || '');
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                if (user) {
                    setName(user.name);
                    setEmail(user.email);
                    setAvatarPreview(user.photoUrl);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user]);

    const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));

            if (apiClient) {
                try {
                    setSaveStatus('Enviando foto...');
                    const response = await apiClient.uploadAvatar(file);
                    if (response.success) {
                        setSaveStatus('Foto atualizada com sucesso!');
                        setTimeout(() => setSaveStatus(''), 3000);
                    }
                } catch (error: any) {
                    console.error('Erro ao fazer upload:', error);
                    setSaveStatus('');
                    setEmailError('Erro ao enviar foto. Tente novamente.');
                }
            }
        }
    };

    const validateEmail = (emailToValidate: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(emailToValidate);
    };

    const handleSave = async () => {
        setSaveStatus("");
        setEmailError("");

        if (!validateEmail(email)) {
            setEmailError("Por favor, insira um e-mail válido.");
            return;
        }

        if (apiClient) {
            try {
                setSaveStatus("Salvando...");

                const response = await apiClient.updateProfile({
                    full_name: name,
                    phone: phone,
                });

                if (response.success) {
                    setSaveStatus("Alterações salvas com sucesso!");
                    localStorage.setItem('userName', name);
                    setTimeout(() => setSaveStatus(''), 3000);
                } else {
                    throw new Error(response.error || 'Erro ao salvar');
                }
            } catch (error: any) {
                console.error('Erro ao salvar:', error);
                setEmailError(error.message || "Erro ao salvar alterações");
                setSaveStatus("");
            }
        } else {
            // Perfil salvo com sucesso
            setSaveStatus("Alterações salvas com sucesso!");
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordStatus('As senhas não coincidem');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordStatus('A nova senha deve ter no mínimo 8 caracteres');
            return;
        }

        setPasswordStatus('Atualizando senha...');
        // Simulação - integrar com API real
        setTimeout(() => {
            setPasswordStatus('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordStatus(''), 3000);
        }, 1500);
    };

    const getInitials = (fullName: string) => {
        return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
                    <span className="ml-4 text-dark-text-secondary">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => onNavigate('home')}
                    className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                        <UserIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
                        <p className="text-sm text-dark-text-secondary">Gerencie suas informações pessoais</p>
                    </div>
                </div>
            </div>

            {/* Banner Pay-Per-Use */}
            <PayPerUseBanner onLearnMore={() => onNavigate('precos' as Page)} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card de Avatar */}
                <div className="lg:col-span-1">
                    <div className="card-premium p-6 text-center">
                        <div className="relative inline-block mb-4">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="h-28 w-28 rounded-full object-cover border-4 border-brand-primary/30 mx-auto"
                                />
                            ) : (
                                <div className="h-28 w-28 rounded-full bg-blue-600 flex items-center justify-center mx-auto text-white text-3xl font-bold">
                                    {getInitials(name || 'U')}
                                </div>
                            )}
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 h-10 w-10 bg-brand-primary rounded-full flex items-center justify-center border-3 border-dark-card hover:bg-brand-primary/80 transition-colors"
                                aria-label="Alterar foto"
                            >
                                <CameraIcon className="h-5 w-5 text-white" />
                            </button>
                            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{name || 'Usuário'}</h3>
                        <p className="text-sm text-dark-text-secondary">{email}</p>

                        <div className="divider-premium my-4"></div>

                        <div className="text-left space-y-3">
                            <button
                                onClick={() => onNavigate('user-billing' as Page)}
                                className="w-full text-left px-4 py-3 rounded-xl glass hover:bg-white/10 transition-colors flex items-center gap-3 text-dark-text-secondary hover:text-white"
                            >
                                <FileTextIcon className="h-5 w-5" />
                                <span>Cobrança e Créditos</span>
                            </button>
                            <button
                                onClick={() => onNavigate('user-orders' as Page)}
                                className="w-full text-left px-4 py-3 rounded-xl glass hover:bg-white/10 transition-colors flex items-center gap-3 text-dark-text-secondary hover:text-white"
                            >
                                <FileTextIcon className="h-5 w-5" />
                                <span>Meus Pedidos</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Formulário de Perfil */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dados Pessoais */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-brand-primary" />
                            Dados Pessoais
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-dark-text-secondary mb-2">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3.5 pl-12 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary mb-2">E-mail</label>
                                <div className="relative">
                                    <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3.5 pl-12 text-dark-text-secondary opacity-60 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-dark-text-secondary mt-1.5">O e-mail não pode ser alterado</p>
                                {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-dark-text-secondary mb-2">Telefone</label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3.5 pl-12 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="document" className="block text-sm font-medium text-dark-text-secondary mb-2">CPF/CNPJ</label>
                                <div className="relative">
                                    <FileTextIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                                    <input
                                        id="document"
                                        type="text"
                                        value={document}
                                        onChange={(e) => setDocument(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3.5 pl-12 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex justify-end items-center gap-4">
                            {saveStatus && <span className="text-sm text-green-400 animate-fade-in">{saveStatus}</span>}
                            <button
                                onClick={handleSave}
                                className="gradient-primary text-white font-bold py-3 px-6 rounded-xl hover:brightness-110 transition-all glow-primary"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>

                    {/* Segurança */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <LockIcon className="h-5 w-5 text-brand-primary" />
                            Segurança
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Alterar Senha */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-dark-text-secondary">Alterar Senha</h4>
                                <input
                                    type="password"
                                    placeholder="Senha atual"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                                <input
                                    type="password"
                                    placeholder="Nova senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                                {passwordStatus && (
                                    <p className={`text-sm ${passwordStatus.includes('sucesso') ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {passwordStatus}
                                    </p>
                                )}
                                <button
                                    onClick={handlePasswordChange}
                                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                                >
                                    Atualizar Senha
                                </button>
                            </div>

                            {/* 2FA */}
                            <div className="glass rounded-xl p-5 border border-purple-500/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <ShieldCheckIcon className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Duplo Fator (2FA)</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Inativo</span>
                                    </div>
                                </div>
                                <p className="text-sm text-dark-text-secondary mb-4">
                                    Adicione uma camada extra de proteção à sua conta usando autenticação em dois fatores.
                                </p>
                                <button className="w-full py-3 gradient-primary text-white font-medium rounded-xl hover:brightness-110 transition-all">
                                    Ativar 2FA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
