import React from 'react';
import { VideoEmbed } from '../Common/VideoEmbed';
import { PlayIcon, ShoppingCartIcon, SparklesIcon } from '../Icons.js';

interface VideoCardData {
    id: string;
    title: string;
    videoUrl: string;
    productUrl: string;
    price: string;
    platform: 'Shopee' | 'Amazon' | 'Mercado Livre';
}

const videoOffers: VideoCardData[] = [
    {
        id: '1',
        title: 'Showcase Especial - FCO de Queiroz',
        videoUrl: 'https://www.tiktok.com/@fco_de_queiroz/video/7538005600488148230',
        productUrl: 'https://shopee.com.br',
        price: 'Sob Consulta',
        platform: 'Shopee'
    },
    {
        id: '2',
        title: 'Review: Gadget de Cozinha Inteligente',
        videoUrl: 'https://www.youtube.com/watch?v=F5vMVttmjN4',
        productUrl: 'https://amazon.com.br',
        price: 'R$ 89,90',
        platform: 'Amazon'
    },
    {
        id: '3',
        title: 'Dica de Setup: Mouse Gamer RGB',
        videoUrl: 'https://www.tiktok.com/@douglascomp/video/7449576403565251846',
        productUrl: 'https://mercadolivre.com.br',
        price: 'R$ 159,00',
        platform: 'Mercado Livre'
    },
    {
        id: '4',
        title: 'Unboxing: Monitor Curvo 4K Extreme',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        productUrl: 'https://amazon.com.br',
        price: 'R$ 2.899,00',
        platform: 'Amazon'
    },
    {
        id: '5',
        title: 'Achadinhos: Organizador de Geladeira',
        videoUrl: 'https://www.tiktok.com/@achadinhos/video/7312345678901234567',
        productUrl: 'https://shopee.com.br',
        price: 'R$ 45,90',
        platform: 'Shopee'
    },
    {
        id: '6',
        title: 'Reels: Nova Coleção de Verão',
        videoUrl: 'https://www.instagram.com/reels/C8X_abcdef/',
        productUrl: 'https://shopee.com.br',
        price: 'R$ 79,00',
        platform: 'Shopee'
    }
];

export const VideoOffersSection: React.FC = () => {
    return (
        <section className="mt-16 py-12 border-t border-slate-800">
            <div className="flex items-center justify-between mb-8 px-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                        <PlayIcon className="h-8 w-8 text-pink-500" />
                        Vistos & Recomendados
                    </h2>
                    <p className="text-slate-400 mt-1">Produtos em ação para você decidir melhor.</p>
                </div>
                <button className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    Ver tudo <SparklesIcon className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                {videoOffers.map((video) => (
                    <div key={video.id} className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-pink-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/5 hover:-translate-y-1">
                        <div className="p-3">
                            <VideoEmbed
                                url={video.videoUrl}
                                className="rounded-xl overflow-hidden shadow-lg group-hover:shadow-pink-500/10 transition-shadow"
                            />
                        </div>

                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${video.platform === 'Shopee' ? 'bg-orange-500/20 text-orange-400' :
                                    video.platform === 'Amazon' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {video.platform}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold">• Top Recomendado</span>
                            </div>

                            <h3 className="font-bold text-white mb-4 line-clamp-1 group-hover:text-pink-400 transition-colors">{video.title}</h3>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Preço Estimado</span>
                                    <span className="text-xl font-black text-white">{video.price}</span>
                                </div>

                                <a
                                    href={video.productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2.5 px-4 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-pink-500/20 text-sm whitespace-nowrap"
                                >
                                    <ShoppingCartIcon className="h-4 w-4" />
                                    Ir para Loja
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
