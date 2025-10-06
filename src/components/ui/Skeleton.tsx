import React from 'react';
import { cn } from '@/utils/helpers';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rectangle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangle' 
}) => {
  const variants = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    rectangle: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 bg-[length:200%_100%] animate-shimmer',
        variants[variant],
        className
      )}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card-base space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
};

export default Skeleton;
