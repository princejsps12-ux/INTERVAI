import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-rajdhani tracking-wider',
  {
    variants: {
      variant: {
        default:
          'bg-neural-cyan text-neural-bg hover:bg-neural-cyan/90 shadow-[0_0_15px_rgba(0,245,255,0.4)]',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline:
          'border border-neural-cyan text-neural-cyan bg-transparent hover:bg-neural-cyan/10 shadow-[0_0_10px_rgba(0,245,255,0.2)]',
        secondary:
          'border border-neural-purple text-neural-purple bg-transparent hover:bg-neural-purple/10',
        ghost: 'text-neural-text-primary hover:bg-neural-surface hover:text-neural-cyan',
        link: 'text-neural-cyan underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-md px-8 text-base',
        xl: 'h-14 rounded-md px-10 text-lg',
        icon: 'h-10 w-10',
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
