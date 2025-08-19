'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `;

    const variantClasses = {
      primary: `
        bg-primary-600 hover:bg-primary-700 
        text-white 
        focus:ring-primary-500
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-gray-100 hover:bg-gray-200 
        text-gray-900 
        focus:ring-gray-500
        dark:bg-gray-700 dark:hover:bg-gray-600 
        dark:text-white
      `,
      outline: `
        border-2 border-primary-600 
        text-primary-600 hover:bg-primary-600 hover:text-white
        focus:ring-primary-500
        dark:border-primary-400 dark:text-primary-400
      `,
      ghost: `
        text-gray-700 hover:bg-gray-100
        focus:ring-gray-500
        dark:text-gray-300 dark:hover:bg-gray-700
      `,
      danger: `
        bg-red-600 hover:bg-red-700 
        text-white 
        focus:ring-red-500
        shadow-sm hover:shadow-md
      `,
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        {...props}
      >
        {loading && (
          <LoadingSpinner 
            size="sm" 
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} 
            className="mr-2" 
          />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;