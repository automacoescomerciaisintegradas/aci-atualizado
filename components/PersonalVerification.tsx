import React, { useState, useRef, ChangeEvent } from 'react';
import { UserIcon, FileTextIcon, PhoneIcon, MailIcon, CameraIcon, ShieldCheckIcon } from './Icons';
import { sendPersonalVerificationEmail } from '../services/emailService.js';

interface PersonalVerificationProps {
  user?: { 
    name: string; 
    email: string; 
    photoUrl: string;
    phone?: string;
    document?: string;
  };
  onCompleteVerification?: () => void;
}

const PersonalVerification: React.FC<PersonalVerificationProps> = ({ user, onCompleteVerification }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoUrl || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [document, setDocument] = useState(user?.document || '');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'submitted' | 'verified'>('pending');
  const [emailError, setEmailError] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validateEmail = (emailToValidate: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailToValidate);
  };

  const validateDocument = (doc: string) => {
    // Simple CPF/CNPJ validation (removing formatting)
    const cleanDoc = doc.replace(/[^\d]/g, '');
    return cleanDoc.length === 11 || cleanDoc.length === 14;
  };

  const handleSave = async () => {
    setEmailError("");
    setDocumentError("");
    
    let isValid = true;
    
    if (!validateEmail(email)) {
      setEmailError("Por favor, insira um e-mail válido.");
      isValid = false;
    }
    
    if (!validateDocument(document)) {
      setDocumentError("Por favor, insira um CPF ou CNPJ válido.");
      isValid = false;
    }
    
    if (!isValid) return;

    setIsSubmitting(true);
    
    // Enviar e-mail de verificação
    try {
      const result = await sendPersonalVerificationEmail(
        user?.email || email,
        user?.name || name,
        { name, email, phone, document }
      );
      
      if (result.success) {
        console.log("E-mail de verificação enviado com sucesso");
        setVerificationStatus('submitted');
        
        if (onCompleteVerification) {
          onCompleteVerification();
        }
      } else {
        console.error("Erro ao enviar e-mail de verificação:", result.error);
        // Mesmo com erro no e-mail, continuamos o fluxo para UX
        setVerificationStatus('submitted');
        
        if (onCompleteVerification) {
          onCompleteVerification();
        }
      }
    } catch (error) {
      console.error("Erro inesperado ao enviar e-mail:", error);
      // Mesmo com erro, continuamos o fluxo para UX
      setVerificationStatus('submitted');
      
      if (onCompleteVerification) {
        onCompleteVerification();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDocument = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 11) {
      // CPF format: XXX.XXX.XXX-XX
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ format: XX.XXX.XXX/XXXX-XX
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const handleDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setDocument(formatted);
    if (documentError) setDocumentError('');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Verificação Pessoal</h1>
        <p className="text-md text-dark-text-secondary">
          Complete as informações abaixo para verificar sua identidade. Esta verificação é aplicável a usuários individuais, a conta pertence ao indivíduo.
        </p>
      </div>

      <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheckIcon className="h-6 w-6 text-brand-primary" />
          <h3 className="text-xl font-semibold text-dark-text-primary">Informações Pessoais</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-32 w-32">
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=128`}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover bg-slate-700"
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 h-9 w-9 bg-slate-700 rounded-full flex items-center justify-center border-2 border-dark-card hover:bg-slate-600 transition-colors"
                aria-label="Alterar foto"
              >
                <CameraIcon className="h-5 w-5 text-dark-text-secondary" />
              </button>
              <input 
                type="file" 
                ref={avatarInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <p className="text-sm text-dark-text-secondary text-center">
              Foto de perfil (opcional)
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-dark-text-secondary mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                <input 
                  id="fullName" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12" 
                  placeholder="Digite seu nome completo"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary mb-2">
                Email *
              </label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12" 
                  placeholder="seu@email.com"
                />
              </div>
              {emailError && <p className="text-red-400 text-xs mt-1 ml-1">{emailError}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-dark-text-secondary mb-2">
                Telefone
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                <input 
                  id="phone" 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12" 
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="document" className="block text-sm font-medium text-dark-text-secondary mb-2">
                Documento (CPF/CNPJ) *
              </label>
              <div className="relative">
                <FileTextIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                <input 
                  id="document" 
                  type="text" 
                  value={document} 
                  onChange={handleDocumentChange} 
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 pl-12" 
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>
              {documentError && <p className="text-red-400 text-xs mt-1 ml-1">{documentError}</p>}
              <p className="text-xs text-dark-text-secondary mt-1 ml-1">
                Este documento será usado apenas para fins de verificação de identidade
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-dark-border pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-dark-text-primary">Proteção de Dados</p>
                <p className="text-xs text-dark-text-secondary">
                  Suas informações pessoais estão protegidas e serão usadas apenas para verificação de identidade.
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-lg transition-colors ${
                isSubmitting 
                  ? 'bg-brand-primary/50 text-white cursor-not-allowed' 
                  : 'bg-brand-primary text-white hover:bg-brand-primary/90'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                'Enviar para Verificação'
              )}
            </button>
          </div>
        </div>
        
        {verificationStatus === 'submitted' && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-900/50 rounded-lg flex items-start gap-3">
            <ShieldCheckIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-400">Verificação Enviada!</p>
              <p className="text-xs text-green-300">
                Suas informações foram enviadas para verificação. Você receberá um e-mail em {user?.email || email} assim que o processo for concluído.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalVerification;