import React, { useState } from 'react';
import { Card, Button } from './StyledComponents';
import { RocketIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon, ExternalLinkIcon, InfoIcon } from '../Icons';

export const DeployTab: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const handleDeploy = async () => {
        setStatus('loading');
        setMessage(null);

        try {
            // Usando a URL de deploy do EasyPanel fornecida pelo usuário
            const deployUrl = 'http://144.91.118.78:3000/api/deploy/4ab64faa6afac5a910b18f5b73c40e50569355ec85ce292a';

            // Note: Chamadas para IPs de rede local ou portas específicas podem sofrer bloqueio de CORS no navegador
            // mas como é um webhook de deploy, geralmente o servidor aceita requests simples.
            const response = await fetch(deployUrl, { method: 'GET', mode: 'no-cors' });

            // Com no-cors, não conseguimos ver o status da resposta, mas o request é enviado.
            setStatus('success');
            setMessage('Comando de deploy enviado à VPS com sucesso! O processo de build pode levar alguns minutos.');
        } catch (error) {
            console.error('Erro ao acionar deploy:', error);
            setStatus('error');
            setMessage('Falha ao conectar com o serviço de deploy. Verifique se a VPS está online.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <RocketIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Deploy & Produção</h2>
                    <p className="text-sm text-slate-400">Gerencie a publicação das alterações no servidor oficial (EasyPanel).</p>
                </div>
            </div>

            <Card className="p-8 border-indigo-500/10 bg-indigo-500/5 overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 blur-[60px] rounded-full"></div>

                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        Acionar Deploy Automático
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Ao clicar no botão abaixo, a VPS em <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">144.91.118.78</code> irá
                        automaticamente buscar a versão mais recente do código no repositório, reconstruir os containers Docker e atualizar o site em produção.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="primary"
                            onClick={handleDeploy}
                            disabled={status === 'loading'}
                            className="flex-1 py-4 text-base font-black uppercase tracking-widest glow-indigo"
                        >
                            {status === 'loading' ? (
                                <>
                                    <SpinnerIcon className="h-5 w-5 animate-spin mr-2" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <RocketIcon className="h-5 w-5 mr-2" />
                                    Publicar Alterações (Deploy)
                                </>
                            )}
                        </Button>

                        <a
                            href="https://aci.automacoescomerciais.com.br"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-4 glass text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            Ver Site Online <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-slide-up ${status === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {status === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}
            </Card>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <InfoIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-sm">
                    <h4 className="text-blue-400 font-bold mb-1">Informações de Infraestrutura</h4>
                    <p className="text-slate-400 mb-2">Se o site não atualizar em 5 minutos, verifique os logs da VPS via SSH:</p>
                    <code className="block bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 border border-white/5">
                        ssh root@144.91.118.78 "docker logs -f aci-app"
                    </code>
                </div>
            </div>
        </div>
    );
};
