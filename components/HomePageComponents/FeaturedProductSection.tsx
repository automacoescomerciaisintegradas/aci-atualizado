import React from 'react';
import { ShoppingCartIcon } from '../Icons.js';
import { VideoEmbed } from '../Common/VideoEmbed';

interface FeaturedProductSectionProps {
  affiliateLink: string;
  images: string[];
  videoUrl?: string; // Permitir URL de vídeo dinâmica
}

export const FeaturedProductSection: React.FC<FeaturedProductSectionProps> = ({
  affiliateLink,
  images,
  videoUrl = "https://www.tiktok.com/@fco_de_queiroz/video/7538005600488148230"
}) => {
  return (
    <section className="mt-16 py-12 px-6 md:px-12 bg-[#1a1c24] rounded-3xl border border-white/5 relative overflow-hidden group">
      {/* Decorative background light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
            <span className="text-pink-500 text-[10px] font-black uppercase tracking-widest">Destaque da Semana</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tighter">
            Mini Impressora <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Portátil IA</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Imprima fotos, etiquetas e notas direto do celular, sem usar uma gota de tinta.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Video Column - vertical for mobile/tiktok style */}
          <div className="lg:col-span-4 xl:col-span-3">
            <VideoEmbed
              url={videoUrl}
              className="shadow-2xl shadow-black/50 ring-1 ring-white/10"
            />
          </div>

          {/* Details Column */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">Liberte sua Criatividade</h3>
                <p className="text-slate-400 leading-relaxed">
                  Leve suas memórias para o papel em segundos. Ideal para organizar estudos, decorar ambientes e eternizar momentos com praticidade.
                </p>
                <ul className="space-y-4">
                  {[
                    { label: 'Conexão Bluetooth', desc: 'Rápida e sem fios.' },
                    { label: 'Impressão Térmica', desc: 'Zero gastos com tinta.' },
                    { label: 'Portabilidade Total', desc: 'Leve na palma da mão.' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white">{item.label}</span>
                        <span className="text-xs text-slate-500">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {images.slice(0, 4).map((img, index) => (
                  <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-white/5 group/img relative">
                    <img src={img} alt="Product" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Ver Detalhes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative flex items-center justify-between p-1 pr-6 bg-orange-600 hover:bg-orange-500 rounded-2xl transition-all shadow-xl shadow-orange-900/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-black/20 rounded-xl">
                  <ShoppingCartIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="block text-white font-black text-lg">Garantir a Minha Agora</span>
                  <span className="text-orange-200 text-xs font-bold uppercase tracking-tighter">Oferta exclusiva Shopee</span>
                </div>
              </div>
              <svg className="w-6 h-6 text-white transform group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};