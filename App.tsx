
import React, { useState, useEffect, useCallback } from 'react';
import { LinkGenerator } from './components/LinkGenerator';
import { ProductSearchPage } from './components/ShopeeSearch';
import { TopSalesPage } from './components/TopSales';
import { TelegramPage } from './components/TelegramPage';
import { AdminPage } from './components/AdminPage';
import { AuthPage } from './components/AuthPage';
import { AciPage } from './components/AciPage';
import { InstagramConnectPage } from './components/InstagramConnectPage';
import { BlogShopeePage } from './components/BlogShopeePage';
import { HomePage } from './components/HomePage';
import { useSettings } from './hooks/useSettings';
import { SpinnerIcon } from './components/Icons';
import { ProfilePage } from './components/ProfilePage';
import { LandingPage } from './components/LandingPage';
import { TopNavbar } from './components/TopNavbar';
import { PricingPage } from './components/PricingPage';
import { TelegramShopeePage } from './components/TelegramShopeePage';
import { FaqPage } from './components/FaqPage';
import { MultiChannelPublisher } from './components/MultiChannelPublisher';
import { ShopeeLotePage } from './components/ShopeeLotePage';
import { BlogCreator } from './components/BlogCreator';
import { ChatPage } from './components/ChatPage';
import { ImageGenerator } from './components/ImageGenerator';
import { InstagramProfilePage } from './components/InstagramProfilePage';
import { TelegramIdPage } from './components/TelegramIdPage';
import { BlogsPage } from './components/BlogsPage';
import { CreateContentPage } from './components/CreateContentPage';
import { OAuthConsentPage } from './components/OAuthConsentPage';
import { PaymentMethodsPage } from './components/PaymentMethodsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { DashboardFooter } from './components/DashboardFooter';
import { SuperAdminPage } from './components/SuperAdminPage';
import { FacebookIntegrationTutorialPage } from './components/FacebookIntegrationTutorialPage';
import { UserProfilePage } from './components/UserProfilePage';
import { UserBillingPage } from './components/UserBillingPage';
import { UserOrdersPage } from './components/UserOrdersPage';
import { CreditPurchasePage } from './components/CreditPurchasePage';
import { InstagramCaptionGenerator } from './components/InstagramCaptionGenerator';
import { AutomationPage } from './components/AutomationPage';
import { WelcomeModal } from './components/WelcomeModal';
import { ComingSoonPage } from './components/ComingSoonPage';
import { ShopeeAffiliateProgramPage } from './components/ShopeeAffiliateProgramPage';
import { SupportPage } from './components/SupportPage';
import { IntegrationsHubPage } from './components/IntegrationsHubPage';

export type Page = 'home' | 'product-search' | 'generate' | 'top-sales' | 'telegram' | 'admin' | 'aci-posts' | 'instagram-connect' | 'blog' | 'profile' | 'telegram-shopee' | 'faq' | 'precos' | 'multi-channel-publisher' | 'shopee-lote' | 'instagram-caption' | 'blog-creator' | 'chat' | 'image-generator' | 'instagram-profile' | 'telegram-id-catcher' | 'wordpress-blogs' | 'wordpress-create' | 'payment-methods' | 'analytics' | 'user-settings' | 'facebook-integration-tutorial' | 'user-profile' | 'user-billing' | 'user-orders' | 'credit-purchase' | 'automation' | 'shopee-affiliate' | 'whatsapp-business' | 'api-integration' | 'ai-insights' | 'advanced-analytics' | 'custom-automations' | 'priority-support' | 'billing' | 'orders' | 'integrations-hub';

const transactions = [
  { id: 1, date: '15/07/2024', type: 'Compra', description: 'Compra de 50.000 créditos', amount: '+ R$ 50,00', credits: '+50000' },
  { id: 2, date: '14/07/2024', type: 'Uso', description: 'Uso de IA - Geração de Imagem', amount: '', credits: '- 50' },
  { id: 3, date: '13/07/2024', type: 'Uso', description: 'Uso de IA - Envio em Lote (25)', amount: '', credits: '- 250' },
  { id: 4, date: '10/07/2024', type: 'Compra', description: 'Compra de 10.000 créditos', amount: '+ R$ 10,00', credits: '+10000' },
];

const invoices = [
  { id: 'inv-0724-001', date: '15/07/2024', amount: 'R$ 50,00', status: 'Paga' as const, method: 'PIX' },
  { id: 'inv-0624-002', date: '10/06/2024', amount: 'R$ 10,00', status: 'Paga' as const, method: 'PIX' },
];

const App: React.FC = () => {
  // Check for Reset Password URL
  if (window.location.pathname === '/reset-password' || window.location.search.includes('token=')) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      return <ResetPasswordPage onBackToLogin={() => {
        window.location.href = '/';
      }} />;
    }
  }

  // Check for OAuth Consent URL
  if (window.location.pathname === '/oauth/consent') {
    return <OAuthConsentPage />;
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [view, setView] = useState<'landing' | 'auth'>('landing'); // Start with landing page
  const [activePage, setActivePage] = useState<Page>('home');
  const { settings, saveSettings, isLoading: isLoadingSettings } = useSettings();
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [navigationContext, setNavigationContext] = useState<{ from?: Page } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);

  // Check for callback parameters (Instagram, Payments, etc)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status') || urlParams.get('instagram_status');
    const message = urlParams.get('message');

    if (status && message) {
      setToastMessage({
        type: status as 'success' | 'error' | 'warning',
        message: decodeURIComponent(message)
      });

      // Clean URL parameters but keep the page if present
      const page = urlParams.get('page');
      const newUrl = page ? `/?page=${page}` : '/';
      window.history.replaceState({}, document.title, newUrl);

      // Auto hide after 5 seconds
      setTimeout(() => setToastMessage(null), 5000);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    // Simple validation to check if it matches a known page type could be added here
    if (pageParam) {
      setActivePage(pageParam as Page);
    }
  }, []);


  useEffect(() => {
    if (!isLoadingSettings) {
      // Theme
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Primary Color
      document.documentElement.style.setProperty('--color-brand-primary', settings.primaryColor);
      document.documentElement.style.setProperty('--color-brand-secondary', settings.secondaryColor);

      // Font Family
      const fontStack = `${settings.fontFamily}, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
      document.body.style.fontFamily = fontStack;
    }
  }, [settings, isLoadingSettings]);


  const handleAddCredits = (totalCredits: number) => {
    saveSettings({ ...settings, credits: settings.credits + totalCredits });
  };

  const [user, setUser] = useState<{ name: string; email: string; photoUrl: string; isAdmin: boolean } | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleLogin = (userData: { name: string; email: string; photoUrl: string; isAdmin: boolean }, isNewUser?: boolean) => {
    setIsAuthenticated(true);
    setUser(userData);
    setActivePage('home');

    // Mostrar modal de boas-vindas para novos usuários
    if (isNewUser) {
      setShowWelcomeModal(true);
    }
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('landing'); // Go back to landing page on logout
    setActivePage('home');
  };

  const handleDownloadExtract = () => {
    const headers = ["ID", "Data", "Tipo", "Descrição", "Valor", "Créditos"];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [t.id, t.date, t.type, `"${t.description}"`, `"${t.amount}"`, `"${t.credits}"`].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'extrato_aci.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleNavigate = useCallback((page: Page, context?: { from: Page }) => {
    try {
      console.log('🔹 Navigating to:', page);
      setActivePage(page);
      setGlobalSearchTerm(''); // Clear search on navigation
      setNavigationContext(context || null); // Store navigation context
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Shift + Key combinations
      if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'h': // Home
            e.preventDefault();
            handleNavigate('home');
            break;
          case 'p': // Publicador
            e.preventDefault();
            handleNavigate('multi-channel-publisher');
            break;
          case 'l': // Link Generator
            e.preventDefault();
            handleNavigate('generate');
            break;
          case 's': // Search
            e.preventDefault();
            handleNavigate('product-search');
            break;
          case 'a': // Admin
            e.preventDefault();
            handleNavigate('admin');
            break;
          case 't': // Top Sales
            e.preventDefault();
            handleNavigate('top-sales');
            break;
          case 'c': // Chat
            e.preventDefault();
            handleNavigate('chat');
            break;
          case 'b': // Blog Creator
            e.preventDefault();
            handleNavigate('blog-creator');
            break;
          case 'o': // Ofertas (Blog)
            e.preventDefault();
            handleNavigate('blog');
            break;
          case 'm': // Metrics (Instagram Profile)
            e.preventDefault();
            handleNavigate('instagram-profile');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, handleNavigate]);


  if (!isAuthenticated) {
    if (view === 'landing') {
      return <LandingPage onAuthClick={() => setView('auth')} />;
    }
    return <AuthPage onLoginSuccess={handleLogin} onBackToLanding={() => setView('landing')} />;
  }

  if (isLoadingSettings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark-bg text-dark-text-primary">
        <SpinnerIcon />
        <span className="ml-3">Carregando configurações...</span>
      </div>
    );
  }

  const renderPage = () => {
    const onBack = navigationContext?.from ? () => handleNavigate(navigationContext.from as Page) : undefined;

    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={setActivePage} />;
      case 'admin':
        // Todos os usuários têm acesso ao painel admin
        return <AdminPage onBack={onBack} onNavigate={handleNavigate} />;
      case 'blog':
        return <BlogShopeePage onNavigate={setActivePage} />;
      case 'profile':
        return <ProfilePage onAddCreditsClick={() => handleNavigate('precos')} onDownloadExtract={handleDownloadExtract} transactions={transactions} invoices={invoices} user={user || undefined} />;
      case 'precos':
        return <PricingPage onPaymentSuccess={handleAddCredits} />;
      case 'aci-posts':
        return <AciPage onNavigate={handleNavigate} />;
      case 'instagram-connect':
        return <InstagramConnectPage onBack={onBack} onNavigate={handleNavigate} />;
      case 'instagram-caption':
        return <InstagramCaptionGenerator />;
      case 'telegram':
        return <TelegramPage />;
      case 'telegram-shopee':
        return <TelegramShopeePage />;
      case 'product-search':
        return <ProductSearchPage />;
      case 'top-sales':
        return <TopSalesPage />;
      case 'generate':
        return <LinkGenerator />;
      case 'faq':
        return <FaqPage />;
      case 'multi-channel-publisher':
        return <MultiChannelPublisher onNavigate={handleNavigate} onAddCreditsClick={() => handleNavigate('precos')} />;
      case 'shopee-lote':
        return <ShopeeLotePage />;
      case 'blog-creator':
        return <BlogCreator onNavigate={handleNavigate} />;
      case 'chat':
        return <ChatPage />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'instagram-profile':
        return <InstagramProfilePage />;
      case 'telegram-id-catcher':
        return <TelegramIdPage />;
      case 'wordpress-blogs':
        return <BlogsPage />;
      case 'payment-methods':
        return <PaymentMethodsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'user-settings':
        return <SuperAdminPage onBack={onBack} onNavigate={handleNavigate} />;
      case 'facebook-integration-tutorial':
        return <FacebookIntegrationTutorialPage onBack={onBack} onNavigate={handleNavigate} />;
      case 'user-profile':
        return <UserProfilePage onNavigate={handleNavigate} user={user || undefined} />;
      case 'user-billing':
        return <UserBillingPage onNavigate={handleNavigate} onAddCreditsClick={() => handleNavigate('credit-purchase' as Page)} />;
      case 'user-orders':
        return <UserOrdersPage onNavigate={handleNavigate} />;
      case 'credit-purchase':
        return <CreditPurchasePage onNavigate={handleNavigate} onPaymentSuccess={handleAddCredits} />;
      case 'automation':
        return <AutomationPage />;
      case 'integrations-hub':
        return <IntegrationsHubPage onNavigate={handleNavigate} />;

      // Páginas em desenvolvimento
      case 'shopee-affiliate':
        return <ShopeeAffiliateProgramPage onNavigate={handleNavigate} />;
      case 'whatsapp-business':
        return <ComingSoonPage title="WhatsApp Business" description="Conecte sua conta do WhatsApp Business para envio automático de mensagens, promoções e atendimento aos clientes." onNavigate={handleNavigate} />;
      case 'api-integration':
        return <ComingSoonPage title="Integração API" description="Acesse nossa API RESTful para integrar o ACI com suas próprias aplicações e automatizar processos." onNavigate={handleNavigate} />;
      case 'ai-insights':
        return <ComingSoonPage title="Análises com IA" description="Insights inteligentes sobre seus produtos, vendas e engajamento gerados por inteligência artificial." onNavigate={handleNavigate} />;
      case 'advanced-analytics':
        return <ComingSoonPage title="Analytics Avançado" description="Dashboards avançados com métricas detalhadas, comparativos e previsões de vendas." onNavigate={handleNavigate} />;
      case 'custom-automations':
        return <ComingSoonPage title="Automações Personalizadas" description="Crie fluxos de automação personalizados para otimizar seus processos de vendas." onNavigate={handleNavigate} />;
      case 'priority-support':
        return <SupportPage onNavigate={handleNavigate} />;
      case 'billing':
        return <UserBillingPage onNavigate={handleNavigate} onAddCreditsClick={() => handleNavigate('credit-purchase' as Page)} />;
      case 'orders':
        return <UserOrdersPage onNavigate={handleNavigate} />;

      // Default - página não encontrada
      default:
        return <ComingSoonPage title="Página não encontrada" description="Esta página ainda não foi implementada." onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-dark-text-primary font-sans">
      {/* Top Navigation Bar */}
      <TopNavbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onAddCreditsClick={() => handleNavigate('credit-purchase' as any)}
        isAdmin={user?.isAdmin}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="w-full max-w-[2048px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 flex flex-col min-h-full gap-4 md:gap-6">
          {renderPage()}
          <DashboardFooter onNavigate={handleNavigate} />
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md ${toastMessage.type === 'success' ? 'bg-green-500/90' :
            toastMessage.type === 'error' ? 'bg-red-500/90' :
              'bg-yellow-500/90'
            } text-white backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {toastMessage.type === 'success' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {toastMessage.type === 'error' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {toastMessage.type === 'warning' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{toastMessage.message}</p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="flex-shrink-0 text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal for New Users */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user?.name}
      />
    </div>
  );
};

export default App;