import React, { useState } from 'react';

export const WhatsAppFloat: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleWhatsAppClick = () => {
        const whatsappUrl = "https://chat.whatsapp.com/BSsknrWToFpJGHz3EnkDUd?text=Olá!%20Preciso%20de%20ajuda%20com%20meu%20atendimento.";
        window.open(whatsappUrl, '_blank');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Message Bubble */}
            <div className="relative mb-4 mr-2">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 max-w-xs border border-gray-200 dark:border-slate-700 animate-fade-in-up">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-sm z-10"
                    >
                        ✕
                    </button>
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-lg">👋</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                Suporte ACI
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                                Olá! Tem dúvidas sobre a plataforma? Entre no nosso Grupo VIP!
                            </p>
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800 transform translate-y-full drop-shadow-sm"></div>
                </div>
            </div>

            {/* WhatsApp Button */}
            <button
                onClick={handleWhatsAppClick}
                className="group relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                aria-label="Falar no WhatsApp"
            >
                <svg
                    className="w-8 h-8 relative z-10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386" />
                </svg>

                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
            </button>
        </div>
    );
};
