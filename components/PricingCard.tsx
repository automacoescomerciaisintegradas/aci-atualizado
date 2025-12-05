import React from 'react';
import { CheckIcon } from './Icons';

interface PricingCardProps {
    planName: string;
    price: string;
    features: string[];
    ctaText: string;
    onCtaClick: () => void;
    isActive?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ planName, price, features, ctaText, onCtaClick, isActive = false }) => {
    const cardClasses = isActive 
        ? 'bg-brand-primary/10 border-brand-primary' 
        : 'bg-slate-800/50 border-dark-border';
    
    const buttonClasses = isActive
        ? 'bg-slate-700 text-dark-text-secondary cursor-default'
        : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-indigo-500/30';

    return (
        <div className={`rounded-xl border p-6 flex flex-col ${cardClasses}`}>
            <h4 className="text-lg font-bold text-dark-text-primary">{planName}</h4>
            <p className="text-3xl font-extrabold text-white my-4">{price}</p>
            <ul className="space-y-2 text-sm text-dark-text-secondary flex-grow mb-6">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <CheckIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={onCtaClick}
                disabled={isActive}
                className={`w-full font-bold py-2.5 px-5 rounded-lg transition-colors ${buttonClasses}`}
            >
                {ctaText}
            </button>
        </div>
    );
};
