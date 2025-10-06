import React from 'react';
import { cn, getInitials } from '@/utils/helpers';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  name, 
  size = 'md',
  className 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    xxl: 'w-24 h-24 text-2xl',
  } as const;

  const initials = name ? getInitials(name) : '?';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-bold overflow-hidden shadow-md ring-2 ring-white',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
