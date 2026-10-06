import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const button = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-small font-medium transition-colors  disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
        secondary: 'border border-border-strong bg-surface text-fg hover:bg-surface-hover',
        ghost: 'text-fg-muted hover:bg-surface-hover',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  asChild?: boolean
}

export function Button({ className, variant, asChild, type = 'button', ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(button({ variant }), className)}
      type={asChild ? undefined : type}
      {...props}
    />
  )
}
