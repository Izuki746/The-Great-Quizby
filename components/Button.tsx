import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  icon,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-primary text-uom-purple shadow-[0_0_15px_rgba(238,140,43,0.4)] hover:shadow-[0_0_25px_rgba(238,140,43,0.6)] hover:bg-[#ff9e3d]",
    secondary: "bg-secondary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] hover:bg-[#8b4bf5]",
    outline: "border border-primary/30 text-primary hover:bg-primary/10",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-lg">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
