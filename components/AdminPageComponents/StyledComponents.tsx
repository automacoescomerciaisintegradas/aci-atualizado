import React from 'react';

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
  ...props 
}) => {
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
          className={`w-full bg-[#2f3245] border border-[#3b4253] rounded-md px-3.5 py-2.5 text-[#d0d2d6] placeholder-[#676d7d] focus:ring-2 focus:ring-[#6d6bfb] focus:border-transparent transition duration-200 ${className}`}
          {...props}
        />
        {isSecret && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b4b7bd] hover:text-[#d0d2d6]"
            aria-label="Toggle secret visibility"
          >
            <EyeIcon className="h-5 w-5" />
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

// Ícones para o input de senha
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
  </svg>
);