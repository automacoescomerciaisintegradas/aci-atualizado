import React from 'react';
import { ShoppingCartIcon } from '../Icons.js';

interface FeaturedProductSectionProps {
  affiliateLink: string;
  images: string[];
}

export const FeaturedProductSection: React.FC<FeaturedProductSectionProps> = ({ affiliateLink, images }) => {
  return (
    <section className="mt-16 py-16 bg-dark-card/50 rounded-2xl border border-dark-border animate-slide-in-up">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-dark-text-primary leading-tight mb-4">
          ✨ Destaque da Semana: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Mini Impressora Portátil</span>
        </h2>
        <p className="text-lg text-dark-text-secondary max-w-3xl mx-auto">
          Imprima fotos, notas e o que mais sua imaginação mandar, direto do seu celular e sem usar tinta!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Video Column */}
        <div className="animate-fade-in sticky top-24">
          <div className="aspect-w-9 aspect-h-16 bg-dark-bg rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-dark-border h-[600px] relative">
            {/* Tentativa 1: YouTube Embed com nocookie */}
            <iframe
              src="https://www.youtube-nocookie.com/embed/F5vMVttmjN4?enablejsapi=1&origin=https://replit.dev&widget_referrer=https://replit.dev"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
              onError={(e) => {
                // Fallback: mostrar link
                const iframe = e.currentTarget;
                iframe.style.display = 'none';
                const fallback = iframe.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            ></iframe>

            {/* Fallback: Link direto para o YouTube */}
            <div className="hidden absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex-col items-center justify-center p-8 text-center">
              <svg className="w-24 h-24 text-red-500 mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4">Vídeo com Restrições de Incorporação</h3>
              <p className="text-gray-300 mb-6">Este vídeo não pode ser reproduzido aqui, mas você pode assistir diretamente no YouTube.</p>
              <a
                href="https://www.youtube.com/watch?v=F5vMVttmjN4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                Assistir no YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Details and Images Column */}
        <div className="space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <a href={images[0]} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl group block border border-dark-border">
            <img src={images[0]} alt="Mini Impressora Portátil" className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
          </a>

          <div>
            <h3 className="text-xl font-bold text-dark-text-primary mb-3">Liberte sua Criatividade</h3>
            <p className="text-dark-text-secondary">
              Com a mini impressora térmica portátil, você leva suas memórias para o papel em segundos. Imprima fotos, etiquetas, notas de estudo e o que mais sua imaginação permitir, direto do seu celular. É a ferramenta perfeita para organizar, decorar e eternizar momentos.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-dark-text-secondary list-disc list-inside">
              <li><strong>Conexão Bluetooth:</strong> Rápida e sem fios.</li>
              <li><strong>Impressão Térmica:</strong> Diga adeus aos cartuchos de tinta!</li>
              <li><strong>Bateria de Longa Duração:</strong> Leve para qualquer lugar.</li>
              <li><strong>App Exclusivo:</strong> Cheio de fontes, filtros e templates.</li>
            </ul>
          </div>

          {/* Image Gallery */}
          <div>
            <h3 className="text-xl font-bold text-dark-text-primary mb-3">Galeria</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.slice(1).map((img, index) => (
                <a href={img} target="_blank" rel="noopener noreferrer" key={index} className="overflow-hidden rounded-lg aspect-square group border border-dark-border">
                  <img src={img} alt={`Mini Impressora - Imagem ${index + 2}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg shadow-orange-500/30 text-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Comprar Agora na Shopee</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};