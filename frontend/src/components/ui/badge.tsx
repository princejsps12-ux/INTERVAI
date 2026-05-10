import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-rajdhani',
  {
    variants: {
      variant: {
        default: 'border-neural-cyan/30 bg-neural-cyan/10 text-neural-cyan',
        secondary: 'border-neural-purple/30 bg-neural-purple/10 text-neural-purple',
        destructive: 'border-red-500/30 bg-red-500/10 text-red-400',
        outline: 'border-neural-border text-neural-text-muted',
        success: 'border-green-500/30 bg-green-500/10 text-green-400',
        warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
