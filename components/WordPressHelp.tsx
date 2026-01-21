import React from 'react';
import { ChevronLeftIcon, CheckIcon, ClipboardIcon, XIcon, ExternalLinkIcon, InfoIcon } from './Icons';
import type { Page } from '../App';

interface WordPressHelpProps {
    onBack: () => void;
}

export const WordPressHelp: React.FC<WordPressHelpProps> = ({ onBack }) => {
    const [copied, setCopied] = React.useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const htaccessCode = `RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1`;

    const nginxCode = `fastcgi_pass_request_headers on;
fastcgi_param HTTP_AUTHORIZATION $http_authorization;`;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Correção: Autenticação WordPress</h1>
                    <p className="text-sm text-dark-text-secondary">Resolva erros de conexão em servidores Apache ou Nginx</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Intro Alert */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <InfoIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-blue-400 font-bold mb-1">Por que isso acontece?</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Muitas hospedagens removem o cabeçalho <code className="bg-white/5 px-1.5 py-0.5 rounded text-blue-300">Authorization</code> por segurança.
                            Sem ele, o WordPress não consegue validar sua Senha de Aplicativo, retornando erro de "Não logado".
                        </p>
                    </div>
                </div>

                {/* Apache Section */}
                <div className="card-premium p-8 overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/5 blur-[60px] rounded-full"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <span className="text-xl">🚀</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">Solução para Apache / cPanel / Hostinger</h2>
                    </div>

                    <p className="text-slate-400 text-sm mb-4">
                        Edite o arquivo <code className="text-orange-400 font-mono">.htaccess</code> na raiz do seu WordPress e adicione no topo:
                    </p>

                    <div className="relative group">
                        <pre className="bg-slate-950/50 border border-white/5 rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
                            {htaccessCode}
                        </pre>
                        <button
                            onClick={() => copyToClipboard(htaccessCode, 'apache')}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                        >
                            {copied === 'apache' ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Nginx Section */}
                <div className="card-premium p-8 overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 blur-[60px] rounded-full"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="text-xl">🌐</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">Solução para Nginx (Easypanel / VPS)</h2>
                    </div>

                    <p className="text-slate-400 text-sm mb-4">
                        Adicione estas linhas no bloco de configuração do seu site ou vhost:
                    </p>

                    <div className="relative group">
                        <pre className="bg-slate-950/50 border border-white/5 rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
                            {nginxCode}
                        </pre>
                        <button
                            onClick={() => copyToClipboard(nginxCode, 'nginx')}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                        >
                            {copied === 'nginx' ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Quick Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card-premium p-6">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <CheckIcon className="h-5 w-5 text-green-500" />
                            Checklist Final
                        </h4>
                        <ul className="space-y-3">
                            {[
                                'Criado Senha de Aplicativo no WordPress?',
                                'Senha copiada sem espaços extras?',
                                '.htaccess ou Nginx atualizados?',
                                'Plugins de segurança verificados?'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card-premium p-6 flex flex-col justify-center items-center text-center">
                        <p className="text-slate-400 text-sm mb-4">Ainda com problemas? Entre em contato com nosso suporte especializado.</p>
                        <button
                            className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-all"
                            onClick={() => window.open('https://wa.me/5588921567214', '_blank')}
                        >
                            Falar com Suporte <ExternalLinkIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
