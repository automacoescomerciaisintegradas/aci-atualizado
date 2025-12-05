import React from 'react';
import { XIcon, AlertTriangleIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactElement;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  icon = <AlertTriangleIcon className="h-6 w-6" />
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
        <div className="bg-dark-card rounded-xl shadow-2xl border border-dark-border w-full max-w-lg relative animate-scale-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-dark-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
                    {icon}
                    {title}
                </h2>
                <button onClick={onClose} className="text-dark-text-secondary hover:text-dark-text-primary transition-colors">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-dark-text-secondary">
                {children}
            </div>
             <div className="p-4 bg-slate-900/50 border-t border-dark-border flex justify-end gap-4">
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-bold py-2 px-4 rounded-lg">
                    {cancelText}
                </button>
                <button onClick={onConfirm} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg">
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
  );
};