import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { PricingCard } from './PricingCard';
import { PixIcon, CopyIcon, CheckIcon, LoaderIcon, CheckCircleIcon, FileTextIcon, UserIcon, DollarSignIcon, CreditIcon, ChevronLeftIcon } from './Icons';

interface PricingPageProps {
  onPaymentSuccess: (totalCredits: number) => void;
}

const creditOptions = [
    { value: 50, credits: 50000, label: 'R$ 50,00' },
    { value: 97, credits: 100000, label: 'R$ 97,00' },
    { value: 197, credits: 250000, label: 'R$ 197,00' },
];

const PROMOTION_BONUS_PERCENTAGE = 0.10; // 10%

type CheckoutStep = 'select_value' | 'billing_details' | 'show_pix' | 'confirmed';

const generateBrCode = (amount: number): string => {
    const pixKey = 'contato@automacoescomerciais.com.br';
    const merchantName = 'F.C.A. DE QUEIROZ';
    const city = 'JUAZEIRO DO NOR';
    const txId = '***';

    const formatField = (id: string, value: string): string => {
        const len = value.length.toString().padStart(2, '0');
        return `${id}${len}${value}`;
    };

    const merchantAccountInfo = formatField('00', 'br.gov.bcb.pix') + formatField('01', pixKey);
    
    let payload = [
        '000201',
        formatField('26', merchantAccountInfo),
        '52040000',
        '5303986',
        formatField('54', amount.toFixed(2)),
        '5802BR',
        formatField('59', merchantName.substring(0, 25)),
        formatField('60', city.substring(0, 15)),
        formatField('62', txId),
    ].join('');
    
    payload += '6304' + 'A1B2'; // Dummy CRC for demo
    return payload;
};

const StepIndicator: React.FC<{ currentStep: CheckoutStep }> = ({ currentStep }) => {
    const steps = [
        { id: 'select_value', label: '1. Valor' },
        { id: 'billing_details', label: '2. Dados' },
        { id: 'show_pix', label: '3. Pagamento' },
        { id: 'confirmed', label: '4. Concluído' }
    ];
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index <= currentIndex ? 'bg-brand-primary text-white' : 'bg-slate-700 text-dark-text-secondary'}`}>
                        {index < currentIndex ? <CheckIcon className="w-5 h-5"/> : index + 1}
                    </div>
                    <span className={`ml-2 text-sm font-semibold ${index <= currentIndex ? 'text-dark-text-primary' : 'text-dark-text-secondary'}`}>
                        {step.label.split('. ')[1]}
                    </span>
                    {index < steps.length - 1 && <div className="hidden sm:block w-12 h-0.5 bg-slate-700 ml-4"></div>}
                </div>
            ))}
        </div>
    );
};

export const PricingPage: React.FC<PricingPageProps> = ({ onPaymentSuccess }) => {
    const [step, setStep] = useState<CheckoutStep>('select_value');
    const [selectedValue, setSelectedValue] = useState<number>(50);
    const [customValue, setCustomValue] = useState<string>('');
    const [finalAmount, setFinalAmount] = useState<number>(50);
    
    const [docType, setDocType] = useState<'cpf' | 'cnpj'>('cpf');
    const [doc, setDoc] = useState('');
    const [name, setName] = useState('');

    const [pixCode, setPixCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    
    const handleNextToBilling = () => {
        const amount = customValue ? parseFloat(customValue) : selectedValue;
        if (customValue && (amount < 50 || isNaN(amount))) {
            alert("O valor personalizado deve ser um número igual ou maior que R$ 50,00.");
            return;
        }
        setFinalAmount(amount);
        setStep('billing_details');
    }

    const handleGeneratePix = () => {
        if(!doc || !name) {
            alert("Por favor, preencha todos os detalhes de faturamento.");
            return;
        }
        const generatedCode = generateBrCode(finalAmount);
        setPixCode(generatedCode);
        setStep('show_pix');

        setTimeout(() => {
            const baseCredits = creditOptions.find(opt => opt.value === finalAmount)?.credits ?? finalAmount * 1000;
            const bonusCredits = Math.floor(baseCredits * PROMOTION_BONUS_PERCENTAGE);
            onPaymentSuccess(baseCredits + bonusCredits);
            setStep('confirmed');
        }, 7000); // 7s simulation
    };

    const handleCopyPixCode = () => {
        if (!pixCode) return;
        navigator.clipboard.writeText(pixCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const currentAmount = customValue ? parseFloat(customValue) || 0 : selectedValue;
    const baseCredits = creditOptions.find(opt => opt.value === currentAmount)?.credits ?? currentAmount * 1000;
    const bonus = Math.floor(baseCredits * PROMOTION_BONUS_PERCENTAGE);
    const totalCredits = baseCredits + bonus;

    const renderStepContent = () => {
        switch (step) {
            case 'select_value':
                return (
                    <div className="animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-dark-text-primary mb-2">Selecione o Valor da Recarga</h2>
                            <p className="text-md text-dark-text-secondary mb-4">Selecione um pacote ou defina um valor personalizado.</p>
                             <div className="bg-green-900/40 border border-green-700 text-green-300 p-3 rounded-lg text-sm mb-6 inline-block">
                                <strong>Promoção:</strong> Ganhe <strong>10% de bônus</strong> em qualquer recarga!
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            {creditOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { setSelectedValue(opt.value); setCustomValue(''); }}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${selectedValue === opt.value && !customValue ? 'bg-brand-primary/20 border-brand-primary' : 'bg-slate-800 border-dark-border hover:border-slate-600'}`}
                                >
                                    <p className="font-bold text-lg text-dark-text-primary">{opt.label}</p>
                                    <p className="text-xs text-dark-text-secondary">{opt.credits.toLocaleString('pt-BR')} créditos</p>
                                </button>
                            ))}
                        </div>
                         <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary font-semibold">R$</span>
                            <input 
                                type="number"
                                value={customValue}
                                onChange={(e) => { setCustomValue(e.target.value); setSelectedValue(0); }}
                                placeholder="Outro valor (mínimo R$ 50,00)"
                                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-dark-border rounded-lg text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary"
                            />
                         </div>
                        
                         <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-dark-border">
                             <p className="text-sm text-dark-text-secondary">
                                Você receberá <strong className="text-dark-text-primary">{baseCredits.toLocaleString('pt-BR')}</strong> créditos
                                + <strong className="text-green-400">{bonus.toLocaleString('pt-BR')} de bônus</strong>.
                            </p>
                            <p className="mt-1">
                                Total de <strong className="text-xl font-bold text-purple-400">{totalCredits.toLocaleString('pt-BR')}</strong> créditos.
                            </p>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button onClick={handleNextToBilling} disabled={!currentAmount || currentAmount < 50} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">
                                Continuar para Faturamento
                            </button>
                        </div>
                    </div>
                );
            case 'billing_details':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-dark-text-primary mb-6 text-center">Detalhes de Faturamento</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex bg-slate-800 rounded-lg p-1 border border-dark-border">
                                        <button onClick={() => setDocType('cpf')} className={`w-1/2 py-1.5 text-sm rounded-md transition-colors ${docType === 'cpf' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary'}`}>CPF</button>
                                        <button onClick={() => setDocType('cnpj')} className={`w-1/2 py-1.5 text-sm rounded-md transition-colors ${docType === 'cnpj' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary'}`}>CNPJ</button>
                                    </div>
                                     <div className="relative mt-2">
                                        <FileTextIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary"/>
                                        <input type="text" value={doc} onChange={(e) => setDoc(e.target.value)} placeholder={`Informe seu ${docType.toUpperCase()}`} className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-dark-border rounded-lg text-dark-text-primary"/>
                                    </div>
                                 </div>
                                  <div>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary"/>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Completo / Razão Social" className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-dark-border rounded-lg text-dark-text-primary"/>
                                    </div>
                                 </div>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-lg border border-dark-border">
                                <h3 className="font-semibold mb-3 text-dark-text-primary">Resumo do Pedido</h3>
                                <div className="flex justify-between items-center text-sm py-3 border-b border-dark-border">
                                    <span className="text-dark-text-secondary">Créditos a adicionar</span>
                                    <span className="font-semibold text-dark-text-primary flex items-center gap-1"><CreditIcon className="h-4 w-4"/> {totalCredits.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold pt-4">
                                     <span className="text-dark-text-primary">Total a Pagar</span>
                                     <span className="text-purple-400">R$ {finalAmount.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                         </div>
                         <div className="mt-8 flex justify-between items-center">
                              <button onClick={() => setStep('select_value')} className="text-sm text-dark-text-secondary hover:text-dark-text-primary font-semibold flex items-center gap-2"><ChevronLeftIcon className="h-4 w-4" /> Voltar</button>
                              <button onClick={handleGeneratePix} disabled={!doc || !name} className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">
                                <PixIcon className="h-5 w-5" />
                                Finalizar e Gerar PIX
                            </button>
                        </div>
                    </div>
                );
            case 'show_pix':
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}&bgcolor=141414&color=f1f5f9&qzone=1`;
                return (
                     <div className="text-center animate-fade-in">
                        <h2 className="text-2xl font-bold text-dark-text-primary mb-2">Pague com PIX para Concluir</h2>
                        <p className="text-md text-dark-text-secondary mb-6">Use o app do seu banco para ler o QR Code ou copie o código abaixo.</p>
                        
                        <div className="p-4 bg-dark-card border border-dark-border rounded-lg inline-block my-4">
                            <img src={qrCodeUrl} alt="QR Code PIX" width="250" height="250" />
                        </div>

                        <div className="max-w-md mx-auto space-y-4">
                            <div className="p-3 bg-slate-800 border border-dark-border rounded-lg">
                                <p className="text-xs text-dark-text-secondary break-all">{pixCode}</p>
                            </div>
                            <button onClick={handleCopyPixCode} className="w-full flex items-center justify-center gap-2 bg-slate-700 text-dark-text-primary font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">
                                {isCopied ? <CheckIcon className="text-green-400"/> : <CopyIcon />}
                                {isCopied ? 'Copiado!' : 'Copiar Código PIX'}
                            </button>
                             <div className="flex items-center justify-center gap-2 text-dark-text-secondary pt-4">
                                <LoaderIcon />
                                <span className="font-semibold">Aguardando confirmação de pagamento...</span>
                            </div>
                        </div>
                    </div>
                );
            case 'confirmed':
                 return (
                     <div className="p-12 text-center flex flex-col items-center justify-center animate-fade-in">
                        <CheckCircleIcon className="h-20 w-20 text-green-400 mb-4" />
                        <h2 className="text-3xl font-bold text-dark-text-primary mb-2">Pagamento Aprovado!</h2>
                        <p className="text-lg text-dark-text-secondary">
                           Seus <strong>{totalCredits.toLocaleString('pt-BR')} créditos</strong> foram adicionados à sua conta.
                        </p>
                    </div>
                );
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-10 text-center">
                <DollarSignIcon className="h-16 w-16 text-brand-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Créditos & Planos</h1>
                <p className="text-md text-dark-text-secondary max-w-2xl mx-auto">Adicione créditos para usar nossas ferramentas ou escolha um plano. Sem mensalidades, seus créditos não expiram.</p>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
                     <div className="mb-8">
                        <StepIndicator currentStep={step} />
                    </div>
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};
