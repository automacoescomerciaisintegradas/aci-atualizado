import React, { useEffect } from 'react';

// Declare FB global type
declare global {
    interface Window {
        FB: {
            XFBML: {
                parse: (element?: HTMLElement) => void;
            };
            init: (params: {
                appId: string;
                cookie?: boolean;
                xfbml?: boolean;
                version: string;
            }) => void;
            AppEvents: {
                logPageView: () => void;
            };
        };
        fbAsyncInit: () => void;
    }
}

interface FacebookLikeButtonProps {
    href: string;
    width?: number;
    layout?: 'standard' | 'box_count' | 'button_count' | 'button';
    action?: 'like' | 'recommend';
    size?: 'small' | 'large';
    share?: boolean;
    showFaces?: boolean;
    colorScheme?: 'light' | 'dark';
}

interface FacebookCommentsProps {
    href: string;
    width?: string | number;
    numPosts?: number;
    orderBy?: 'social' | 'reverse_time' | 'time';
    colorScheme?: 'light' | 'dark';
}

interface FacebookShareButtonProps {
    href: string;
    layout?: 'box_count' | 'button_count' | 'button' | 'icon_link' | 'icon' | 'link';
    size?: 'small' | 'large';
}

/**
 * Componente de Botão Curtir do Facebook
 */
export const FacebookLikeButton: React.FC<FacebookLikeButtonProps> = ({
    href,
    width = 450,
    layout = 'standard',
    action = 'like',
    size = 'small',
    share = true,
    showFaces = true,
    colorScheme = 'dark'
}) => {
    useEffect(() => {
        // Parse XFBML quando o componente montar ou href mudar
        if (window.FB) {
            window.FB.XFBML.parse();
        }
    }, [href]);

    return (
        <div
            className="fb-like"
            data-href={href}
            data-width={width}
            data-layout={layout}
            data-action={action}
            data-size={size}
            data-share={share}
            data-show-faces={showFaces}
            data-colorscheme={colorScheme}
        />
    );
};

/**
 * Componente de Comentários do Facebook
 */
export const FacebookComments: React.FC<FacebookCommentsProps> = ({
    href,
    width = '100%',
    numPosts = 5,
    orderBy = 'social',
    colorScheme = 'dark'
}) => {
    useEffect(() => {
        if (window.FB) {
            window.FB.XFBML.parse();
        }
    }, [href]);

    return (
        <div
            className="fb-comments"
            data-href={href}
            data-width={width}
            data-numposts={numPosts}
            data-order-by={orderBy}
            data-colorscheme={colorScheme}
        />
    );
};

/**
 * Componente de Botão Compartilhar do Facebook
 */
export const FacebookShareButton: React.FC<FacebookShareButtonProps> = ({
    href,
    layout = 'button_count',
    size = 'small'
}) => {
    useEffect(() => {
        if (window.FB) {
            window.FB.XFBML.parse();
        }
    }, [href]);

    return (
        <div
            className="fb-share-button"
            data-href={href}
            data-layout={layout}
            data-size={size}
        />
    );
};

/**
 * Hook para inicializar o SDK do Facebook
 */
export const useFacebookSDK = (appId: string = '3728761024095089') => {
    useEffect(() => {
        // Se o SDK já foi carregado, apenas parse
        if (window.FB) {
            window.FB.XFBML.parse();
            return;
        }

        // Inicialização assíncrona
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: appId,
                cookie: true,
                xfbml: true,
                version: 'v19.0'
            });
            window.FB.AppEvents.logPageView();
        };

        // Carregar SDK se não existir
        const script = document.getElementById('facebook-jssdk');
        if (!script) {
            const js = document.createElement('script');
            js.id = 'facebook-jssdk';
            js.src = 'https://connect.facebook.net/pt_BR/sdk.js';
            js.async = true;
            js.defer = true;
            const fjs = document.getElementsByTagName('script')[0];
            fjs.parentNode?.insertBefore(js, fjs);
        }
    }, [appId]);
};

/**
 * Componente wrapper que inclui Like + Comentários
 */
export const FacebookSocialBox: React.FC<{
    url: string;
    title?: string;
    showLike?: boolean;
    showComments?: boolean;
    showShare?: boolean;
}> = ({
    url,
    title = 'Interaja com este conteúdo',
    showLike = true,
    showComments = true,
    showShare = true
}) => {
        useFacebookSDK();

        return (
            <div className="card-premium p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-blue-500">📘</span>
                    {title}
                </h3>

                {/* Like e Share */}
                {(showLike || showShare) && (
                    <div className="flex flex-wrap items-center gap-4">
                        {showLike && (
                            <FacebookLikeButton
                                href={url}
                                layout="button_count"
                                size="large"
                                share={false}
                                showFaces={false}
                            />
                        )}
                        {showShare && (
                            <FacebookShareButton
                                href={url}
                                layout="button_count"
                                size="large"
                            />
                        )}
                    </div>
                )}

                {/* Comentários */}
                {showComments && (
                    <div className="pt-4 border-t border-white/10">
                        <FacebookComments
                            href={url}
                            numPosts={5}
                            orderBy="social"
                            colorScheme="dark"
                        />
                    </div>
                )}
            </div>
        );
    };

export default {
    FacebookLikeButton,
    FacebookComments,
    FacebookShareButton,
    FacebookSocialBox,
    useFacebookSDK
};
