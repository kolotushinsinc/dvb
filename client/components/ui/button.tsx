import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-300 to-primary-500 text-primary-900 hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
        destructive:
          'bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
        outline:
          'border-2 border-secondary-200 bg-white hover:border-primary-300 hover:text-primary-600 shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
        secondary:
          'bg-gradient-to-r from-secondary-500 to-secondary-600 text-secondary-foreground hover:from-secondary-600 hover:to-secondary-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
        ghost: 'hover:bg-primary-50 hover:text-primary-600 transform hover:-translate-y-0.5',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700',
        premium: 'bg-gradient-to-r from-gold-400 to-gold-600 text-charcoal-900 hover:from-gold-500 hover:to-gold-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-gold-300',
        accent: 'bg-gradient-to-r from-accent-400 to-accent-500 text-white hover:from-accent-500 hover:to-accent-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
      },
      size: {
        default: 'h-11 px-5 py-2.5 rounded-lg',
        sm: 'h-9 rounded-md px-3 py-2 text-xs',
        lg: 'h-12 rounded-lg px-8 py-3 text-base',
        xl: 'h-14 rounded-xl px-10 py-4 text-lg',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
