
import React, { useState, useRef, useEffect } from 'react';
import { TelegramIcon, SpinnerIcon, AlertTriangleIcon, CheckIcon, PlayIcon, PauseIcon } from './Icons';

export const TelegramIdPage: React.FC = () => {
    const [botToken, setBotToken] = useState('');
    const [isPolling, setIsPolling] = useState(false);
    const [status, setStatus] = useState<'idle' | 'waiting_start' | 'waiting_forward' | 'found' | 'error'>('idle');
    const [foundId, setFoundId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);
    const lastUpdateIdRef = useRef<number | null>(null);

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
    };

    const sendMessage = async (userChatId: number, text: string, parseMode?: string) => {
        const params: { chat_id: string; text: string; parse_mode?: string } = {
            chat_id: String(userChatId),
            text,
        };
        if (parseMode) {
            params.parse_mode = parseMode;
        }
        
        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
        } catch (e) {
            console.error("Failed to send reply message:", e);
        }
    };
    
    const pollUpdates = async () => {
        const offset = lastUpdateIdRef.current ? `?offset=${lastUpdateIdRef.current + 1}` : '';
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates${offset}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.description || 'Failed to fetch updates.');
            }
            const data = await response.json();

            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    lastUpdateIdRef.current = update.update_id;
                    const message = update.message;
                    if (!message) continue;

                    const userChatId = message.chat.id;

                    if (message.text === '/start') {
                        setStatus('waiting_forward');
                        await sendMessage(userChatId, 'Pesquise por produtos, selecione os que deseja e envie ofertas em massa para seu canal do Telegram.');
                    } else if (message.forward_from_chat) {
                        const targetId = String(message.forward_from_chat.id);
                        setFoundId(targetId);
                        setStatus('found');
                        await sendMessage(userChatId, `✅ ID do Chat/Canal encontrado:\n\n\`${targetId}\`\n\nVocê já pode usar este ID nas configurações do ACI.`, 'Markdown');
                        stopPolling();
                    } else if (message.forward_from) {
                        const targetId = String(message.forward_from.id);
                        setFoundId(targetId);
                        setStatus('found');
                         await sendMessage(userChatId, `✅ ID de Usuário encontrado:\n\n\`${targetId}\`\n\nEste é o ID de um usuário, não de um canal.`, 'Markdown');
                        stopPolling();
                    }
                }
            }
        } catch (e) {
            console.error(e);
            setErrorMessage(e instanceof Error ? e.message : 'An unknown error occurred.');
            setStatus('error');
            stopPolling();
        }
    };


    const handleTogglePolling = async () => {
        if (isPolling) {
            stopPolling();
            setStatus('idle');
        } else {
            if (!botToken.match(/^\d{8,10}:[a-zA-Z0-9_-]{35}$/)) {
                setErrorMessage("Formato de Token do Bot inválido.");
                setStatus('error');
                return;
            }
            // Verify token before starting
            try {
                 const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
                 const result = await response.json();
                 if(!result.ok) {
                     setErrorMessage(`Token inválido: ${result.description}`);
                     setStatus('error');
                     return;
                 }
            } catch(e) {
                setErrorMessage('Falha ao verificar o token. Verifique sua conexão.');
                setStatus('error');
                return;
            }

            setIsPolling(true);
            setStatus('waiting_start');
            setErrorMessage(null);
            setFoundId(null);
            lastUpdateIdRef.current = null;
            intervalRef.current = window.setInterval(pollUpdates, 2000);
        }
    };
    
    useEffect(() => {
      // Cleanup on unmount
      return () => stopPolling();
    }, []);

    const getStatusComponent = () => {
        switch (status) {
            case 'waiting_start':
                return (
                    <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-dark-border">
                        <SpinnerIcon />
                        <p className="mt-2 text-dark-text-secondary">Abra seu bot no Telegram e envie o comando <code className="bg-slate-700 px-1 rounded">/start</code>.</p>
                    </div>
                );
            case 'waiting_forward':
                return (
                    <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-dark-border">
                        <CheckIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="font-semibold text-dark-text-primary">Bot ativo!</p>
                        <p className="mt-2 text-dark-text-secondary">Agora, encaminhe uma mensagem do canal ou grupo desejado para este chat.</p>
                    </div>
                );
            case 'found':
                return (
                    <div className="text-center p-6 bg-green-900/40 rounded-lg border border-green-700">
                        <h3 className="text-lg font-bold text-green-300">ID Capturado com Sucesso!</h3>
                        <div className="my-4 p-3 bg-dark-bg rounded-md text-2xl font-mono text-white tracking-wider">{foundId}</div>
                        <p className="text-sm text-green-300/80">O bot também respondeu no Telegram com este ID.</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangleIcon />
                        <p>{errorMessage}</p>
                    </div>
                );
            default:
                return (
                    <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-dashed border-dark-border">
                        <p className="text-dark-text-secondary">O status do bot e o ID capturado aparecerão aqui.</p>
                    </div>
                );
        }
    }

    return (
         <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">ID Catcher - Telegram</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 space-y-6">
                    <div>
                         <h3 className="text-lg font-semibold mb-2">1. Insira seu Token</h3>
                         <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-3 rounded-lg flex items-start gap-3 text-sm mb-4">
                            <AlertTriangleIcon className="h-8 w-8 flex-shrink-0 mt-0.5" />
                            <p><strong>Aviso de Segurança:</strong> Seu token do bot será usado diretamente no navegador. Isso é inseguro para produção. Use apenas para obter o ID e remova o token depois.</p>
                        </div>
                        <label htmlFor="botToken" className="block text-sm font-medium text-dark-text-secondary mb-2">
                            Token do Bot do Telegram
                        </label>
                        <input
                            type="password"
                            id="botToken"
                            value={botToken}
                            onChange={(e) => setBotToken(e.target.value)}
                            className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary"
                            placeholder="Cole seu token aqui (ex: 12345:ABC-DEF)"
                            disabled={isPolling}
                        />
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2">2. Inicie o Bot</h3>
                        <p className="text-sm text-dark-text-secondary mb-4">Clique no botão abaixo para ativar o "modo de escuta". O bot começará a aguardar por mensagens.</p>
                         <button
                            onClick={handleTogglePolling}
                            disabled={!botToken}
                            className={`w-full flex items-center justify-center gap-3 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isPolling ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                        >
                            {isPolling ? <><PauseIcon className="h-5 w-5"/> Parar Bot</> : <><PlayIcon className="h-5 w-5"/> Iniciar Bot</>}
                        </button>
                    </div>
                </div>
                
                 <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 space-y-4">
                     <h3 className="text-lg font-semibold">3. Siga os Passos no Telegram</h3>
                     <ul className="space-y-3 text-dark-text-secondary text-sm list-decimal list-inside">
                         <li>Abra o Telegram e encontre seu bot (você pode pesquisar pelo nome de usuário dele).</li>
                         <li>Envie o comando <code className="bg-slate-700 px-1 rounded">/start</code> para iniciar a conversa.</li>
                         <li>Vá para o canal, grupo ou chat com o usuário do qual você precisa do ID.</li>
                         <li>Encaminhe qualquer mensagem desse chat para a conversa com o seu bot.</li>
                         <li>O ID será capturado e exibido abaixo.</li>
                     </ul>
                      <div className="pt-4">{getStatusComponent()}</div>
                 </div>

            </div>
         </div>
    );
};
