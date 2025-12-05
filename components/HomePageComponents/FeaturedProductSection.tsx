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
          <div className="aspect-w-9 aspect-h-16 bg-dark-bg rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-dark-border h-[600px]">
            <iframe 
              src="https://www.youtube.com/embed/3fBXcYGg_3A" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
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