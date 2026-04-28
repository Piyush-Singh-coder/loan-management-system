import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:from-indigo-300 disabled:to-violet-300 disabled:shadow-none disabled:transform-none',
      secondary: 'bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:bg-slate-50 disabled:text-slate-400 disabled:transform-none',
      outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:border-indigo-300 disabled:text-indigo-300 disabled:transform-none',
      danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:from-red-300 disabled:to-rose-300 disabled:shadow-none disabled:transform-none',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:bg-transparent disabled:text-slate-400 disabled:transform-none',
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-6 py-2 text-sm',
      lg: 'h-14 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
