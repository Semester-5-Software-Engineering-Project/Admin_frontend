import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';
import { motion } from 'framer-motion';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl hover:border-yellow-200 transition-all duration-300',
      bordered: 'bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-yellow-400 hover:shadow-md transition-all duration-300',
      elevated: 'bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:border-yellow-100 border-2 border-transparent transition-all duration-300',
    };

    if (hoverable) {
      // Framer Motion typing conflict workaround: cast props to any minimally.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const motionProps: any = props;
      return (
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className={cn(variants[variant], className)}
          {...motionProps}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 border-t', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';
