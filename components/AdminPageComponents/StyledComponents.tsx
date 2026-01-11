import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../Icons';

// Button component based on the design system
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon-only';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = "font-medium transition-all duration-200 flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-[#6d6bfb] hover:bg-[#5a58e0] text-white rounded-md shadow-[0_4px_14px_0_rgba(109,107,251,0.4)] px-5 py-2.5",
    ghost: "bg-transparent border border-[#3f4258] text-[#d0d2d6] hover:bg-[#3f4258] hover:text-white rounded-md px-5 py-2.5",
    'icon-only': "bg-transparent text-[#b4b7bd] hover:text-[#d0d2d6] p-2 rounded-md"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

// Card component based on the design system
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#252735] rounded-lg border border-[#3b4253] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
};

// Input component based on the design system
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  isSecret?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  description, 
  isSecret = false, 
  id, 
  className = '', 
  type = 'text',
  ...props 
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const inputType = isSecret ? (showSecret ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#b4b7bd] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full bg-[#2f3245] border border-[#3b4253] rounded-md px-3.5 py-2.5 text-[#d0d2d6] placeholder-[#676d7d] focus:ring-2 focus:ring-[#6d6bfb] focus:border-transparent transition duration-200 ${className}`}
          {...props}
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b4b7bd] hover:text-[#d0d2d6]"
            aria-label={showSecret ? "Hide password" : "Show password"}
          >
            {showSecret ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
      </div>
      {description && <p className="text-xs text-[#676d7d] mt-2">{description}</p>}
    </div>
  );
};

// Badge component based on the design system
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase bg-[rgba(40,199,111,0.15)] text-[#28c76f] ${className}`}>
      {children}
    </span>
  );
};

// Alert component based on the design system
interface AlertProps {
  children: React.ReactNode;
  variant: 'danger' | 'info';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant,
  className = '' 
}) => {
  const classes = variant === 'danger' 
    ? "bg-[linear-gradient(90deg,#ea5455,#ff6b6b)] text-white rounded py-3 px-3 font-semibold" 
    : "bg-[linear-gradient(90deg,#ff9f43,#ff6b6b)] text-white rounded py-2 px-3";
    
  return (
    <div className={`${classes} ${className}`}>
      {children}
    </div>
  );
};
