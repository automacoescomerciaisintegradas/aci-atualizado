import React from 'react';

const CATEGORIES = [
    { name: 'Eletrônicos', image: 'https://placehold.co/400x600/1e293b/FFF?text=Eletronicos', color: 'from-blue-600 to-cyan-600' },
    { name: 'Moda Feminina', image: 'https://placehold.co/400x600/1e293b/FFF?text=Moda+Fem', color: 'from-pink-600 to-rose-600' },
    { name: 'Casa e Decoração', image: 'https://placehold.co/400x600/1e293b/FFF?text=Casa', color: 'from-green-600 to-emerald-600' },
    { name: 'Beleza e Cuidado', image: 'https://placehold.co/400x600/1e293b/FFF?text=Beleza', color: 'from-purple-600 to-violet-600' },
    { name: 'Esportes e Lazer', image: 'https://placehold.co/400x600/1e293b/FFF?text=Esportes', color: 'from-orange-600 to-amber-600' },
    { name: 'Brinquedos', image: 'https://placehold.co/400x600/1e293b/FFF?text=Brinquedos', color: 'from-yellow-500 to-orange-500' },
    { name: 'Automotivo', image: 'https://placehold.co/400x600/1e293b/FFF?text=Auto', color: 'from-red-600 to-orange-600' },
    { name: 'Pet Shop', image: 'https://placehold.co/400x600/1e293b/FFF?text=Pet', color: 'from-teal-600 to-green-600' },
    { name: 'Celulares', image: 'https://placehold.co/400x600/1e293b/FFF?text=Celulares', color: 'from-indigo-600 to-blue-600' },
    { name: 'Games', image: 'https://placehold.co/400x600/1e293b/FFF?text=Games', color: 'from-violet-600 to-fuchsia-600' },
];

const CATEGORIES_SECOND = [
    { name: 'Roupas Femininas', image: 'https://placehold.co/400x600/1e293b/FFF?text=Roupas+Fem', color: 'from-pink-600 to-rose-600' },
    { name: 'Sapatos Femininos', image: 'https://placehold.co/400x600/1e293b/FFF?text=Sapatos+Fem', color: 'from-purple-600 to-violet-600' },
    { name: 'Celulares e Dispositivos', image: 'https://placehold.co/400x600/1e293b/FFF?text=Celulares', color: 'from-blue-600 to-cyan-600' },
    { name: 'Saúde', image: 'https://placehold.co/400x600/1e293b/FFF?text=Saude', color: 'from-green-600 to-emerald-600' },
    { name: 'Animais Domésticos', image: 'https://placehold.co/400x600/1e293b/FFF?text=Pet', color: 'from-teal-600 to-green-600' },
    { name: 'Câmeras e Drones', image: 'https://placehold.co/400x600/1e293b/FFF?text=Cameras', color: 'from-gray-600 to-slate-600' },
    { name: 'Casa e Construção', image: 'https://placehold.co/400x600/1e293b/FFF?text=Casa', color: 'from-amber-600 to-orange-600' },
    { name: 'Sapatos Masculinos', image: 'https://placehold.co/400x600/1e293b/FFF?text=Sapatos+Masc', color: 'from-indigo-600 to-blue-600' },
    { name: 'Esportes e Lazer', image: 'https://placehold.co/400x600/1e293b/FFF?text=Esportes', color: 'from-orange-600 to-amber-600' },
    { name: 'Áudio', image: 'https://placehold.co/400x600/1e293b/FFF?text=Audio', color: 'from-violet-600 to-fuchsia-600' },
    { name: 'Papelaria', image: 'https://placehold.co/400x600/1e293b/FFF?text=Papelaria', color: 'from-yellow-500 to-orange-500' },
    { name: 'Viagens e Bagagens', image: 'https://placehold.co/400x600/1e293b/FFF?text=Viagem', color: 'from-cyan-600 to-blue-600' },
];

export const InfiniteCarousel: React.FC = () => {
    return (
        <div className="w-full overflow-hidden bg-black py-16 border-y border-white/5 relative group">
            {/* Gradient Overlays for smooth fade effect on edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

            <div className="flex animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]" style={{ animationDuration: '30s' }}>
                {/* Render list twice for seamless loop */}
                {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
                    <div
                        key={i}
                        className="mx-4 w-64 h-96 flex-shrink-0 relative group/card cursor-pointer overflow-hidden rounded-2xl border border-white/10 hover:border-brand-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(30,64,175,0.3)]"
                    >
                        {/* Background Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20 group-hover/card:opacity-40 transition-opacity duration-500`}></div>

                        {/* Image */}
                        <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-all duration-500 transform group-hover/card:scale-110 grayscale group-hover/card:grayscale-0"
                        />

                        {/* Content Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity"></div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                            <div className="w-12 h-1 bg-brand-primary mb-4 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                            <h3 className="text-white font-display font-bold text-xl uppercase tracking-wide mb-1 drop-shadow-lg">{cat.name}</h3>
                            <p className="text-xs text-gray-300 font-mono opacity-0 group-hover/card:opacity-100 transition-all duration-500 transform translate-y-4 group-hover/card:translate-y-0">
                                Ver Ofertas Exclusivas →
                            </p>
                        </div>

                        {/* Shopee Badge */}
                        <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover/card:translate-y-0">
                            SHOPEE
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SecondInfiniteCarousel: React.FC = () => {
    return (
        <div className="w-full overflow-hidden bg-black py-16 border-y border-white/5 relative group">
            {/* Gradient Overlays for smooth fade effect on edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

            <div className="flex animate-marquee-second whitespace-nowrap group-hover:[animation-play-state:paused]" style={{ animationDuration: '45s' }}>
                {/* Render list twice for seamless loop */}
                {[...CATEGORIES_SECOND, ...CATEGORIES_SECOND].map((cat, i) => (
                    <div
                        key={i}
                        className="mx-4 w-64 h-96 flex-shrink-0 relative group/card cursor-pointer overflow-hidden rounded-2xl border border-white/10 hover:border-brand-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(30,64,175,0.3)]"
                    >
                        {/* Background Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20 group-hover/card:opacity-40 transition-opacity duration-500`}></div>

                        {/* Image */}
                        <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-all duration-500 transform group-hover/card:scale-110 grayscale group-hover/card:grayscale-0"
                        />

                        {/* Content Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity"></div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                            <div className="w-12 h-1 bg-brand-primary mb-4 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                            <h3 className="text-white font-display font-bold text-xl uppercase tracking-wide mb-1 drop-shadow-lg">{cat.name}</h3>
                            <p className="text-xs text-gray-300 font-mono opacity-0 group-hover/card:opacity-100 transition-all duration-500 transform translate-y-4 group-hover/card:translate-y-0">
                                Ver Ofertas Exclusivas →
                            </p>
                        </div>

                        {/* Shopee Badge */}
                        <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover/card:translate-y-0">
                            SHOPEE
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};