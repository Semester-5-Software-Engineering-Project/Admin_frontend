import React from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/utils/helpers';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="mb-6 p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl shadow-lg">
        <div className="text-yellow-600">
          {icon || <FileQuestion className="w-20 h-20" />}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-black mb-3">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-8 max-w-md font-medium">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
