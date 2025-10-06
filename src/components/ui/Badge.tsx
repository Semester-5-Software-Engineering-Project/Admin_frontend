import React from 'react';
import { cn } from '@/utils/helpers';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string; // optional native title attribute for tooltip
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  title
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-50 text-green-700 border border-green-200 shadow-sm',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border border-yellow-300 shadow-sm font-semibold',
    danger: 'bg-red-50 text-red-700 border border-red-200 shadow-sm',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      title={title}
    >
      {children}
    </span>
  );
};

export default Badge;
