import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-teal hover:brightness-105 hover:shadow-lift active:brightness-100',
        secondary: 'bg-muted text-foreground hover:bg-muted/70',
        outline: 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary-soft/50',
        ghost: 'text-foreground hover:bg-muted',
        soft: 'bg-primary-soft text-accent-foreground hover:bg-primary-soft/70',
        danger: 'bg-destructive text-destructive-foreground hover:brightness-105',
        white: 'bg-white text-ink shadow-card hover:bg-white/90',
      },
      size: {
        sm: 'h-9 px-4 text-[13px] [&_svg]:size-4',
        md: 'h-11 px-5 text-sm [&_svg]:size-[18px]',
        lg: 'h-13 px-7 text-base [&_svg]:size-5',
        icon: 'size-10 [&_svg]:size-[18px]',
        iconSm: 'size-8 rounded-full [&_svg]:size-4',
        iconLg: 'size-12 [&_svg]:size-5',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, block, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
}
