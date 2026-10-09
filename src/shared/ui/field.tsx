import * as Label from '@radix-ui/react-label'
import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/shared/lib/cn'

export const controlSizes = { md: 'min-h-8', lg: 'min-h-10' } as const

export const controlClasses =
  'w-full cursor-pointer rounded-md border border-border-strong bg-bg px-2.5 text-small text-fg transition-colors duration-(--duration-fast) ease-ui placeholder:text-fg-muted hover:border-fg-muted disabled:cursor-not-allowed disabled:opacity-45 aria-[invalid]:border-danger'

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  size?: keyof typeof controlSizes
  error?: string
  hint?: string
  trailing?: ReactNode
  ref?: Ref<HTMLInputElement>
}

export function Field({
  label,
  error,
  hint,
  trailing,
  size = 'md',
  className,
  id,
  ref,
  ...props
}: Readonly<FieldProps>) {
  const generated = useId()
  const inputId = id ?? generated
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={inputId} className="text-caption font-semibold text-fg-muted">
        {label}
      </Label.Root>
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(controlClasses, controlSizes[size], trailing && 'pr-10', className)}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-caption text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-danger-fg">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextareaField({
  label,
  error,
  className,
  id,
  ...props
}: Readonly<TextareaFieldProps>) {
  const generated = useId()
  const fieldId = id ?? generated
  const errorId = `${fieldId}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={fieldId} className="text-caption font-semibold text-fg-muted">
        {label}
      </Label.Root>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(controlClasses, 'min-h-20 py-2', className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-caption text-danger-fg">
          {error}
        </p>
      )}
    </div>
  )
}

export function CheckboxField({
  label,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  return (
    <label className={cn('flex min-h-8 items-center gap-2 text-small', className)}>
      <input type="checkbox" className="size-4 accent-accent" {...props} />
      {label}
    </label>
  )
}
