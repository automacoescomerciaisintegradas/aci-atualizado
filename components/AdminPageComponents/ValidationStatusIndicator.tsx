import React from 'react';
import { AlertTriangleIcon, ClockIcon, CheckIcon, XIcon, SpinnerIcon } from '../Icons.js';

interface ValidationStatusIndicatorProps {
  status: 'idle' | 'loading' | 'valid' | 'invalid';
}

export const ValidationStatusIndicator: React.FC<ValidationStatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case 'loading': return <div className="h-10 w-10 flex items-center justify-center"><SpinnerIcon /></div>;
    case 'valid': return <div className="h-10 w-10 flex items-center justify-center"><CheckIcon className="h-5 w-5 text-green-400" /></div>;
    case 'invalid': return <div className="h-10 w-10 flex items-center justify-center"><XIcon className="h-5 w-5 text-red-400" /></div>;
    default: return <div className="h-10 w-10"></div>;
  }
};