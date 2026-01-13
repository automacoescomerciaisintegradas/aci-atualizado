import React from 'react';

export interface VideoEmbedProps {
    url: string;
    className?: string;
    title?: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, className = "", title = "" }) => {
    if (!url) return null;
    return (
        <div className={`bg-black aspect-video flex items-center justify-center text-white ${className}`}>
            Vídeo: {url}
        </div>
    );
};
