import React from 'react';
import type { Page } from '../App';
import { FacebookIcon, InstagramIcon, CheckCircleIcon, AlertTriangleIcon, ChevronLeftIcon } from './Icons';

interface FacebookIntegrationTutorialPageProps {
    onBack?: () => void;
    onNavigate: (page: Page) => void;
}

export const FacebookIntegrationTutorialPage: React.FC<FacebookIntegrationTutorialPageProps> = ({ onBack, onNavigate }) => {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center text-dark-text-secondary hover:text-dark-text-primary mb-4 transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5 mr-1" />
                        Voltar
                    </button>
                )}
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2 flex items-center gap-3">
                    <FacebookIcon className="h-8 w-8 text-blue-500" />
                    Como integrar com o Facebook e Instagram
                </h1>
                <p className="text-dark-text-secondary">
                    Aprenda a conectar suas contas para gerenciar atendimentos diretamente na plataforma.
                </p>
            </div>

            {/* Requisitos */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6 mb-8">
                <h2 className="text-xl font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
                    <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />
                    Requisitos e Importante
                </h2>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-6">
                    <p className="text-yellow-200 text-sm font-medium">
                        ⚠️ Somente usuários com permissão administrador podem realizar essa configuração!
                    </p>
                </div>

                <h3 className="text-md font-semibold text-dark-text-primary mb-3">Requisitos Mínimos:</h3>
                <ul className="space-y-2 mb-6 text-dark-text-secondary">
                    <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Conta ativa no Facebook</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Página comercial no Facebook</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Conta profissional válida no Instagram</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>O usuário que for realizar a integração precisa ter acesso à página do Facebook</span>
                    </li>
                </ul>
                <p className="text-sm text-dark-text-secondary italic">
                    * Não é obrigatório a integração com as duas redes sociais, podendo escolher a que melhor te atende.
                </p>
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-dark-text-primary">
                        <strong>Importante:</strong> Algumas etapas se repetem caso vá integrar as duas redes sociais. Caso já tenha dado a permissão na primeira integração, mantenha ao realizar a segunda.
                    </p>
                </div>
            </div>

            {/* Passo a Passo Facebook */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6 mb-8">
                <h2 className="text-2xl font-bold text-dark-text-primary mb-6 flex items-center gap-2">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                        <FacebookIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    Integrando com o Facebook
                </h2>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                    {/* Passo 1 */}
                    <div className="relative flex items-start group">
                        <div className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-xl group-hover:scale-110 transition-transform z-10">
                            <span className="font-bold text-white">1</span>
                        </div>
                        <div className="ml-16">
                            <h3 className="text-lg font-bold text-dark-text-primary mb-2">Acesse Integrações</h3>
                            <p className="text-dark-text-secondary">
                                Vá até o menu <strong>"Integrações"</strong> e clique em <strong>"Gerenciar"</strong> no card do Facebook.
                            </p>
                        </div>
                    </div>

                    {/* Passo 2 */}
                    <div className="relative flex items-start group">
                        <div className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-xl group-hover:scale-110 transition-transform z-10">
                            <span className="font-bold text-white">2</span>
                        </div>
                        <div className="ml-16">
                            <h3 className="text-lg font-bold text-dark-text-primary mb-2">Conectar</h3>
                            <p className="text-dark-text-secondary mb-2">
                                Após ler os requisitos, clique no botão <strong>Conectar Facebook</strong>.
                            </p>
                            <p className="text-dark-text-secondary">
                                Faça login na sua conta do Facebook na janela que se abrirá.
                            </p>
                        </div>
                    </div>

                    {/* Passo 3 */}
                    <div className="relative flex items-start group">
                        <div className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-xl group-hover:scale-110 transition-transform z-10">
                            <span className="font-bold text-white">3</span>
                        </div>
                        <div className="ml-16">
                            <h3 className="text-lg font-bold text-dark-text-primary mb-2">Permissões de Empresa</h3>
                            <p className="text-dark-text-secondary mb-3">
                                Você terá duas opções de permissão:
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <strong className="text-white block mb-1">Todas as empresas (Recomendado)</strong>
                                    <p className="text-sm text-dark-text-secondary">Permite acesso a empresas atuais e futuras. Ideal para quem gerencia múltiplas contas.</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <strong className="text-white block mb-1">Apenas empresas atuais</strong>
                                    <p className="text-sm text-dark-text-secondary">Restringe o acesso apenas ao que você selecionar agora. Novas empresas precisarão ser autorizadas manualmente depois.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Passo 4 */}
                    <div className="relative flex items-start group">
                        <div className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-xl group-hover:scale-110 transition-transform z-10">
                            <span className="font-bold text-white">4</span>
                        </div>
                        <div className="ml-16">
                            <h3 className="text-lg font-bold text-dark-text-primary mb-2">Vincular Página</h3>
                            <p className="text-dark-text-secondary mb-2">
                                Selecione a <strong>Página Comercial</strong> do Facebook que deseja vincular.
                            </p>
                            <p className="text-dark-text-secondary text-sm bg-slate-800 p-2 rounded">
                                Nota: Se você gerencia múltiplas páginas, selecione apenas a que deseja usar nesta integração específica caso solicitado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Passo a Passo Instagram */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                <h2 className="text-2xl font-bold text-dark-text-primary mb-6 flex items-center gap-2">
                    <div className="p-2 bg-pink-600/20 rounded-lg">
                        <InstagramIcon className="h-6 w-6 text-pink-500" />
                    </div>
                    Integrando com Instagram
                </h2>

                <div className="space-y-6 text-dark-text-secondary">
                    <p>
                        O processo é muito similar ao do Facebook. Na tela de <strong>Integrações</strong>, clique em <strong>Gerenciar</strong> no card do <strong>Instagram</strong>.
                    </p>

                    <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-3">Pontos de Atenção Específicos:</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                Você precisará selecionar a <strong>Conta do Instagram</strong> (Business) vinculada à sua página do Facebook.
                            </li>
                            <li>
                                Nas permissões, ao escolher "Aceitar apenas contas atuais", lembre-se que novas contas não aparecerão automaticamente no futuro.
                            </li>
                            <li>
                                Finalize clicando em <strong>Salvar</strong> e depois em <strong>Entendi</strong>.
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-4 bg-green-900/20 border border-green-700/30 p-4 rounded-lg">
                        <div className="p-2 bg-green-500/20 rounded-full">
                            <span className="text-xl">🎉</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Pronto!</h4>
                            <p className="text-sm text-green-300">
                                Após confirmar, o sistema já estará integrado com sua conta do Instagram e Página do Facebook.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => onNavigate('instagram-connect')}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-1"
                    >
                        Ir para Conexão do Instagram
                    </button>
                </div>
            </div>
        </div>
    );
};
