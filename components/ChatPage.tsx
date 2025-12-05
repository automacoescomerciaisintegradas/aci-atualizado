import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { createChat } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { UserIcon, MagicWandIcon, TelegramIcon, SpinnerIcon } from './Icons';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatMessage: React.FC<Message> = ({ role, text }) => {
    const isModel = role === 'model';
    const Icon = isModel ? MagicWandIcon : UserIcon;
    const bubbleClasses = isModel
        ? 'bg-slate-700/50 text-dark-text-primary'
        : 'bg-brand-primary text-white';
    const containerClasses = isModel ? 'justify-start' : 'justify-end';

    // To prevent rendering an empty bubble with padding while waiting for stream
    if (isModel && !text) {
        return (
             <div className="flex items-start gap-3 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-dark-border"><Icon className="h-5 w-5 text-dark-text-secondary" /></div>
                <div className={`max-w-md lg:max-w-xl rounded-xl px-4 py-3 ${bubbleClasses}`}>
                     <SpinnerIcon />
                </div>
            </div>
        );
    }
    
    return (
        <div className={`flex items-start gap-3 ${containerClasses} animate-fade-in`}>
            {isModel && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-dark-border"><Icon className="h-5 w-5 text-dark-text-secondary" /></div>}
            <div className={`max-w-md lg:max-w-xl rounded-xl px-4 py-3 ${bubbleClasses}`}>
                 <p className="whitespace-pre-wrap break-words">{text}</p>
            </div>
            {!isModel && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-dark-border"><Icon className="h-5 w-5 text-dark-text-secondary" /></div>}
        </div>
    );
};


export const ChatPage: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setChat(createChat());
        inputRef.current?.focus();
    }, []);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 128; // approx 5 rows
            
            if (scrollHeight > maxHeight) {
                textarea.style.overflowY = 'auto';
                textarea.style.height = `${maxHeight}px`;
            } else {
                textarea.style.overflowY = 'hidden';
                textarea.style.height = `${scrollHeight}px`;
            }
        }
    }, [inputValue]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || isLoading || !chat) return;

        setInputValue('');
        setIsLoading(true);
        
        setMessages(prev => [ ...prev, { role: 'user', text } ]);
        
        try {
            const stream = await chat.sendMessageStream({ message: text });
            
            let fullResponse = '';
            let modelMessageAdded = false;

            for await (const chunk of stream) {
                fullResponse += chunk.text;

                if (!modelMessageAdded) {
                    setMessages(prev => [...prev, { role: 'model', text: fullResponse }]);
                    modelMessageAdded = true;
                } else {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = fullResponse;
                        return newMessages;
                    });
                }
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const message = error instanceof Error ? error.message : "Tente novamente.";
            setMessages(prev => [...prev, { role: 'model', text: `Desculpe, ocorreu um erro: ${message}` }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Chat IA</h1>
                <p className="text-md text-dark-text-secondary">Converse com o assistente ACI para tirar dúvidas e gerar insights.</p>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6">
                {messages.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-dark-text-secondary animate-fade-in">
                        <MagicWandIcon className="h-16 w-16 mb-4" />
                        <h2 className="text-2xl font-semibold text-dark-text-primary">Assistente ACI</h2>
                        <p>Como posso te ajudar hoje?</p>
                    </div>
                ) : (
                    messages.map((msg, index) => <ChatMessage key={index} role={msg.role} text={msg.text} />)
                )}
                 {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <ChatMessage role="model" text="" />
                 )}
            </div>

            <div className="mt-6 pt-4 border-t border-dark-border">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pr-14 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 resize-none"
                        placeholder="Digite sua mensagem..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 bg-brand-primary rounded-full text-white hover:bg-brand-primary/90 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                        aria-label="Enviar mensagem"
                    >
                        {isLoading ? <SpinnerIcon /> : <TelegramIcon className="h-5 w-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};