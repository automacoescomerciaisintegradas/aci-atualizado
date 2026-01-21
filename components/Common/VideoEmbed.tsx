import React from 'react';

export interface VideoEmbedProps {
    url: string;
    className?: string;
    title?: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, className = "", title = "Video Player" }) => {
    if (!url) return null;

    // Helper para extrair ID do Youtube
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(url);

    if (youtubeId) {
        return (
            <div className={`relative overflow-hidden rounded-xl bg-black ${className}`} style={{ aspectRatio: '16/9' }}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    // Fallback para TikTok ou outros (Melhorado visualmente)
    return (
        <div className={`bg-[#0f1115] rounded-xl flex flex-col items-center justify-center text-slate-500 border border-white/5 shadow-inner ${className}`} style={{ aspectRatio: '9/16' }}>
            <div className="p-4 bg-white/5 rounded-full mb-4">
                <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-40 px-6 text-center">Visualização de vídeo externa</span>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-full hover:bg-blue-600/30 transition-colors"
            >
                Assistir no TikTok
            </a>
        </div>
    );
};
