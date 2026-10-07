import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-md border font-semibold whitespace-nowrap no-underline transition-colors duration-(--duration-fast) ease-ui active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45',
  {
    variants: {
      variant: {
        primary: 'border-transparent bg-accent text-accent-fg hover:bg-accent-hover',
        secondary: 'border-border-strong bg-surface text-fg hover:bg-surface-hover',
        ghost: 'border-transparent text-fg-muted hover:bg-surface-hover hover:text-fg',
        danger: 'border-danger bg-danger-subtle text-danger-fg hover:bg-danger hover:text-bg',
      },
      size: {
        sm: 'min-h-7 px-2.5 text-small',
        md: 'min-h-8 px-3 text-small',
        lg: 'min-h-10 px-4 text-body',
        icon: 'size-8 text-small',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  asChild?: boolean
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild,
  loading,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(button({ variant, size }), className)
  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    )
  }
  return (
    <button
      className={classes}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  )
}
