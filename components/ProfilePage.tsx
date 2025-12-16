import React, { useState, useRef, ChangeEvent } from 'react';
import { UserIcon, LockIcon, CreditIcon, ShieldCheckIcon, CameraIcon, FileTextIcon, ReceiptIcon, MailIcon, PhoneIcon, CreditCardIcon, PixIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';
import { PricingCard } from './PricingCard';
import { PixPaymentModal } from './PixPaymentModal';
import { apiClient } from '../src/services/apiClient';

interface Transaction {
    id: number;
    date: string;
    type: string;
    description: string;
    amount: string;
    credits: string;
}

interface Invoice {
    id: string;
    date: string;
    amount: string;
    status: 'Paga' | 'Pendente';
    method: string;
}

interface ProfilePageProps {
    onAddCreditsClick: () => void;
    onDownloadExtract: () => void;
    transactions: Transaction[];
    invoices: Invoice[];
    initialTab?: ProfileTab;
    user?: { name: string; email: string; photoUrl: string };
}

type ProfileTab = 'perfil' | 'seguranca' | 'assinatura' | 'historico';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-1 py-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${active
            ? 'border-brand-primary text-dark-text-primary'
            : 'border-transparent text-dark-text-secondary hover:border-gray-600 hover:text-dark-text-primary'
            }`}
    >
        {children}
    </button>
);

const ProfileTabContent: React.FC<{ user?: { name: string; email: string; photoUrl: string } }> = ({ user }) => {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoUrl || null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [document, setDocument] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados do usuário ao montar o componente
    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoading(true);

                // Buscar dados do localStorage primeiro (cache)
                const cachedEmail = localStorage.getItem('userEmail');
                const cachedName = localStorage.getItem('userName');

                if (cachedEmail) setEmail(cachedEmail);
                if (cachedName) setName(cachedName);

                // Buscar dados completos da API
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

                        // Atualizar cache
                        localStorage.setItem('userEmail', userData.email);
                        localStorage.setItem('userName', userData.full_name || userData.display_name || '');
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                // Usar dados do prop user como fallback
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
            // Preview local
            setAvatarPreview(URL.createObjectURL(file));

            // Upload para servidor
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
                    // email não pode ser atualizado aqui por segurança
                });

                if (response.success) {
                    setSaveStatus("Alterações salvas com sucesso!");

                    // Atualizar cache
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
            // Fallback local (desenvolvimento)
            console.log("Saving profile:", { name, email, phone, document });
            setSaveStatus("Alterações salvas com sucesso!");
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    <span className="ml-3 text-dark-text-secondary">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
            <h3 className="text-xl font-semibold text-dark-text-primary mb-6">Informações do Perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative h-32 w-32">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar"
                                className="h-full w-full rounded-full object-cover bg-slate-700"
                            />
                        ) : (
                            <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                                <svg
                                    width="80"
                                    height="80"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{ color: '#00f5ff' }}
                                >
                                    {/* Círculo externo */}
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />

                                    {/* Texto central */}
                                    <text
                                        x="20"
                                        y="23"
                                        textAnchor="middle"
                                        fontSize="10"
                                        fontWeight="700"
                                        fontFamily="Arial, Helvetica, sans-serif"
                                        fill="currentColor"
                                    >
                                        ACI
                                    </text>
                                </svg>
                            </div>
                        )}
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute bottom-0 right-0 h-9 w-9 bg-slate-700 rounded-full flex items-center justify-center border-2 border-dark-card hover:bg-slate-600 transition-colors"
                            aria-label="Alterar foto"
                        >
                            <CameraIcon className="h-5 w-5 text-dark-text-secondary" />
                        </button>
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-dark-text-secondary mb-2">Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                            <input id="fullName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary mb-2">Email</label>
                        <div className="relative">
                            <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12 opacity-60 cursor-not-allowed" />
                        </div>
                        <p className="text-xs text-dark-text-secondary mt-1">O email não pode ser alterado</p>
                        {emailError && <p className="text-red-400 text-xs mt-1 ml-1">{emailError}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-dark-text-secondary mb-2">Telefone</label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="document" className="block text-sm font-medium text-dark-text-secondary mb-2">Documento (CPF/CNPJ)</label>
                        <div className="relative">
                            <FileTextIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                            <input id="document" type="text" value={document} onChange={(e) => setDocument(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-dark-border flex justify-end items-center gap-4">
                {saveStatus && <span className="text-sm text-green-400 animate-fade-in">{saveStatus}</span>}
                <button onClick={handleSave} className="bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-brand-primary/90 transition-colors">
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};

const SecurityTabContent: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
                <h3 className="text-xl font-semibold text-dark-text-primary mb-6">Alterar Senha</h3>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword">Senha Atual</label>
                        <input id="currentPassword" type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 mt-2" />
                    </div>
                    <div>
                        <label htmlFor="newPassword">Nova Senha</label>
                        <input id="newPassword" type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 mt-2" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                        <input id="confirmPassword" type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 mt-2" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-brand-primary/90 transition-colors">
                            Atualizar Senha
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
                <h3 className="text-xl font-semibold text-dark-text-primary mb-6">Duplo Fator (2FA)</h3>
                <ShieldCheckIcon className="h-12 w-12 text-green-400 mb-4" />
                <p className="text-dark-text-secondary mb-1">Status: <span className="font-semibold text-yellow-400">Inativo</span></p>
                <p className="text-dark-text-secondary mb-6">Adicione uma camada extra de segurança à sua conta. Ao ativar, você precisará de um código do seu app autenticator para fazer login.</p>
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-bold py-3 px-4 rounded-lg transition-colors">
                    Ativar 2FA
                </button>
            </div>
        </div>
    );
};

const SubscriptionTabContent: React.FC<{ onAddCreditsClick: () => void; invoices: Invoice[] }> = ({ onAddCreditsClick, invoices }) => {
    const { settings } = useSettings();
    const [showAllPackages, setShowAllPackages] = useState(false);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

    // Dados do sistema de créditos pay-per-use
    const creditPackages = [
        {
            id: 'starter',
            name: 'Starter',
            credits: 100,
            bonus: 0,
            price: 29.90,
            pricePerCredit: 0.299,
            popular: false,
            features: ['100 créditos', 'Válido para sempre', 'Suporte por email', 'Todas as ferramentas'],
            savings: 0,
        },
        {
            id: 'pro',
            name: 'Pro',
            credits: 500,
            bonus: 75,
            price: 99.90,
            pricePerCredit: 0.174,
            popular: true,
            features: ['500 créditos', '+75 bônus grátis', 'Válido para sempre', 'Suporte prioritário', 'Todas as ferramentas'],
            savings: 42,
        },
        {
            id: 'business',
            name: 'Business',
            credits: 1000,
            bonus: 200,
            price: 179.90,
            pricePerCredit: 0.150,
            popular: false,
            features: ['1000 créditos', '+200 bônus grátis', 'Válido para sempre', 'Suporte VIP', 'Acesso antecipado'],
            savings: 50,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            credits: 2500,
            bonus: 750,
            price: 399.90,
            pricePerCredit: 0.123,
            popular: false,
            features: ['2500 créditos', '+750 bônus grátis', 'Válido para sempre', 'Suporte VIP 24/7', 'Consultoria inclusa', 'API dedicada'],
            savings: 59,
        },
    ];

    // Estatísticas simuladas
    const usageStats = {
        totalPurchased: 5000,
        totalUsed: settings.credits > 0 ? 5000 - settings.credits : 0,
        averageMonthly: 847,
        estimatedDays: settings.credits > 0 ? Math.round((settings.credits / 847) * 30) : 0,
    };

    // Determinar nível do usuário
    const getUserLevel = () => {
        if (usageStats.totalPurchased >= 10000) return { name: 'Diamond', color: 'text-cyan-400', bgColor: 'bg-cyan-900/30', icon: '💎' };
        if (usageStats.totalPurchased >= 5000) return { name: 'Gold', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', icon: '🏆' };
        if (usageStats.totalPurchased >= 1000) return { name: 'Silver', color: 'text-gray-300', bgColor: 'bg-gray-900/30', icon: '🥈' };
        return { name: 'Bronze', color: 'text-orange-400', bgColor: 'bg-orange-900/30', icon: '🥉' };
    };
    const userLevel = getUserLevel();

    // Calcular porcentagem de uso
    const usagePercentage = Math.min((settings.credits / 5000) * 100, 100);
    const getProgressColor = () => {
        if (usagePercentage > 60) return 'from-green-500 to-emerald-400';
        if (usagePercentage > 30) return 'from-yellow-500 to-orange-400';
        return 'from-red-500 to-rose-400';
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <>
            {/* Header com Modelo Pay-per-Use */}
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">💳</span>
                            <h3 className="text-2xl font-bold text-white">Sistema Pay-per-Use</h3>
                            <span className={`text-xs font-medium ${userLevel.color} ${userLevel.bgColor} px-3 py-1 rounded-full flex items-center gap-1`}>
                                {userLevel.icon} {userLevel.name}
                            </span>
                        </div>
                        <p className="text-dark-text-secondary">
                            Compre créditos quando precisar. Sem mensalidades, sem compromisso. Créditos nunca expiram!
                        </p>
                    </div>
                    <button
                        onClick={onAddCreditsClick}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
                    >
                        <CreditIcon className="h-5 w-5" />
                        Adicionar Créditos
                    </button>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-100 text-sm">Saldo Atual</span>
                        <CreditIcon className="w-5 h-5 text-blue-200" />
                    </div>
                    <div className="text-3xl font-bold text-white">{settings.credits.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-blue-200 mt-1">≈ {formatCurrency(settings.credits * 0.174)}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-text-secondary text-sm">Total Comprado</span>
                        <span className="text-green-400">📈</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{usageStats.totalPurchased.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">créditos histórico</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-text-secondary text-sm">Total Utilizado</span>
                        <span className="text-purple-400">✓</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{usageStats.totalUsed.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">créditos consumidos</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-text-secondary text-sm">Média Mensal</span>
                        <span className="text-amber-400">📊</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{usageStats.averageMonthly.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">~{usageStats.estimatedDays} dias restantes</p>
                </div>
            </div>

            {/* Barra de Progresso do Saldo */}
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-dark-text-primary">Status do Saldo</h4>
                    {settings.credits < 100 && (
                        <span className="text-xs text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                            ⚠️ Saldo Baixo
                        </span>
                    )}
                </div>
                <div className="relative mb-4">
                    <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-4 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out relative`}
                            style={{ width: `${usagePercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                style={{ animation: 'shimmer 2s infinite' }} />
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-dark-text-secondary mt-2">
                        <span>0</span>
                        <span>{settings.credits.toLocaleString('pt-BR')} / 5.000</span>
                    </div>
                </div>
                {usageStats.estimatedDays > 0 && (
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                        <p className="text-sm text-blue-300 flex items-center gap-2">
                            <span>💡</span>
                            Com seu uso médio de <strong>{usageStats.averageMonthly}</strong> créditos/mês,
                            seu saldo atual durará aproximadamente <strong>{usageStats.estimatedDays} dias</strong>.
                        </p>
                    </div>
                )}
            </div>

            {/* Pacotes de Créditos */}
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-dark-text-primary flex items-center gap-2">
                            <span className="text-2xl">🎁</span>
                            Pacotes de Créditos
                        </h3>
                        <p className="text-sm text-dark-text-secondary mt-1">Escolha o pacote ideal para suas necessidades</p>
                    </div>
                    <button
                        onClick={() => setShowAllPackages(!showAllPackages)}
                        className="text-sm font-medium text-purple-400 hover:text-purple-300"
                    >
                        {showAllPackages ? 'Ver menos' : 'Ver todos'}
                    </button>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 ${showAllPackages ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4`}>
                    {(showAllPackages ? creditPackages : creditPackages.filter(p => p.popular || p.id === 'starter')).map((pkg) => (
                        <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`relative bg-slate-800/50 border rounded-xl p-5 transition-all cursor-pointer hover:scale-[1.02] ${selectedPackageId === pkg.id
                                ? 'border-purple-500 shadow-xl shadow-purple-500/20 ring-2 ring-purple-500/50'
                                : pkg.popular
                                    ? 'border-purple-500/50'
                                    : 'border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <span>👑</span> Mais Popular
                                </div>
                            )}

                            <div className="text-center mb-4 pt-2">
                                <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                                <div className="text-3xl font-extrabold text-white my-2">
                                    {formatCurrency(pkg.price)}
                                </div>
                                <p className="text-dark-text-secondary text-xs">pagamento único</p>
                            </div>

                            <div className="bg-slate-900/50 rounded-lg p-3 mb-4 text-center">
                                <p className="text-2xl font-bold text-purple-400">
                                    {(pkg.credits + pkg.bonus).toLocaleString('pt-BR')}
                                </p>
                                <p className="text-xs text-dark-text-secondary">
                                    {pkg.credits.toLocaleString('pt-BR')} créditos
                                    {pkg.bonus > 0 && <span className="text-green-400"> +{pkg.bonus} bônus</span>}
                                </p>
                            </div>

                            <ul className="space-y-2 mb-4 text-sm">
                                {pkg.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-dark-text-secondary">
                                        <span className="text-green-400">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {pkg.savings > 0 && (
                                <div className="text-center text-xs text-green-400 mb-3">
                                    Economia de {pkg.savings}%
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddCreditsClick();
                                }}
                                className={`w-full py-2.5 font-bold rounded-lg transition-all ${pkg.popular || selectedPackageId === pkg.id
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                                    }`}
                            >
                                Comprar
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Métodos de Pagamento */}
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 mb-8">
                <h3 className="text-xl font-semibold text-dark-text-primary mb-6 flex items-center gap-2">
                    <CreditCardIcon className="h-6 w-6 text-purple-400" />
                    Métodos de Pagamento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* PIX */}
                    <div className="flex items-center gap-4 bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <span className="text-2xl">💚</span>
                        </div>
                        <div>
                            <p className="font-semibold text-white">PIX</p>
                            <p className="text-sm text-green-400">Aprovação instantânea</p>
                        </div>
                        <span className="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded-full">Recomendado</span>
                    </div>

                    {/* Cartão */}
                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-dark-border">
                        <div className="p-3 bg-slate-700 rounded-lg">
                            <CreditCardIcon className="h-6 w-6 text-dark-text-secondary" />
                        </div>
                        <div>
                            <p className="font-semibold text-dark-text-primary">Cartão de Crédito</p>
                            <p className="text-sm text-dark-text-secondary">Parcele em até 12x</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-dark-border">
                    <CreditCardIcon className="h-8 w-8 text-dark-text-secondary" />
                    <div>
                        <p className="font-semibold text-dark-text-primary">Nenhum cartão salvo</p>
                        <p className="text-sm text-dark-text-secondary">Adicione um cartão para pagamentos rápidos.</p>
                    </div>
                </div>
                <button className="mt-4 text-sm font-semibold text-brand-secondary hover:text-brand-primary flex items-center gap-1">
                    <span>+</span> Adicionar novo cartão
                </button>
            </div>

            {/* Faturas */}
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 mb-8">
                <h3 className="text-xl font-semibold text-dark-text-primary mb-6 flex items-center gap-2">
                    <ReceiptIcon className="h-6 w-6 text-purple-400" />
                    Histórico de Faturas
                </h3>
                {invoices.length === 0 ? (
                    <div className="text-center py-8">
                        <ReceiptIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-dark-text-secondary">Nenhuma fatura encontrada</p>
                        <p className="text-sm text-dark-text-secondary mt-1">Suas faturas aparecerão aqui após a primeira compra</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-dark-text-secondary">
                            <thead className="text-xs text-dark-text-primary uppercase bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">ID da Fatura</th>
                                    <th scope="col" className="px-6 py-3">Pacote</th>
                                    <th scope="col" className="px-6 py-3">Valor</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b border-dark-border hover:bg-slate-800/50">
                                        <td className="px-6 py-4">{invoice.date}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{invoice.id}</td>
                                        <td className="px-6 py-4 text-purple-400">Pay-per-use</td>
                                        <td className="px-6 py-4 font-semibold text-dark-text-primary">{invoice.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${invoice.status === 'Paga' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sm font-semibold text-brand-secondary hover:text-brand-primary">Baixar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Garantia */}
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30 p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-4xl">🛡️</span>
                    <div>
                        <h4 className="font-bold text-white mb-1">Garantia Total</h4>
                        <p className="text-green-300 text-sm">
                            Seus créditos nunca expiram. Compre com tranquilidade e use quando precisar.
                            Pagamento 100% seguro com PIX ou Cartão.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

const HistoryTabContent: React.FC<{ onDownloadExtract: () => void; transactions: Transaction[] }> = ({ onDownloadExtract, transactions }) => (
    <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold text-dark-text-primary">Histórico de Uso de Créditos</h3>
            <button
                onClick={onDownloadExtract}
                className="flex items-center justify-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
            >
                <FileTextIcon className="h-4 w-4" />
                <span>Baixar Extrato (.csv)</span>
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-dark-text-secondary">
                <thead className="text-xs text-dark-text-primary uppercase bg-slate-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Data</th>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3">Descrição</th>
                        <th scope="col" className="px-6 py-3 text-right">Valor</th>
                        <th scope="col" className="px-6 py-3 text-right">Créditos</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id} className="border-b border-dark-border hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.type === 'Compra' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                                    }`}>
                                    {tx.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-dark-text-primary">{tx.description}</td>
                            <td className={`px-6 py-4 text-right font-medium ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-dark-text-secondary'}`}>
                                {tx.amount || '-'}
                            </td>
                            <td className={`px-6 py-4 text-right font-medium ${tx.credits.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.credits}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


export const ProfilePage: React.FC<ProfilePageProps> = ({ onAddCreditsClick, onDownloadExtract, transactions, invoices, initialTab = 'perfil', user }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'perfil': return <ProfileTabContent user={user} />;
            case 'seguranca': return <SecurityTabContent />;
            case 'assinatura': return <SubscriptionTabContent onAddCreditsClick={onAddCreditsClick} invoices={invoices} />;
            case 'historico': return <HistoryTabContent onDownloadExtract={onDownloadExtract} transactions={transactions} />;
            default: return <ProfileTabContent user={user} />;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Minha Conta</h1>
                <p className="text-md text-dark-text-secondary">Gerencie suas informações de perfil, segurança e assinatura.</p>
            </div>

            <div className="border-b border-dark-border mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')}>
                        <UserIcon className="h-5 w-5" /> Perfil
                    </TabButton>
                    <TabButton active={activeTab === 'seguranca'} onClick={() => setActiveTab('seguranca')}>
                        <LockIcon className="h-5 w-5" /> Segurança
                    </TabButton>
                    <TabButton active={activeTab === 'assinatura'} onClick={() => setActiveTab('assinatura')}>
                        <CreditIcon className="h-5 w-5" /> Assinatura
                    </TabButton>
                    <TabButton active={activeTab === 'historico'} onClick={() => setActiveTab('historico')}>
                        <ReceiptIcon className="h-5 w-5" /> Histórico
                    </TabButton>
                </nav>
            </div>

            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};