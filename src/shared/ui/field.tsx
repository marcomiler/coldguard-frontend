import * as Label from '@radix-ui/react-label'
import { useId, type InputHTMLAttributes, type Ref } from 'react'
import { cn } from '@/shared/lib/cn'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

export function Field({ label, error, className, id, ref, ...props }: FieldProps) {
  const generated = useId()
  const inputId = id ?? generated
  const errorId = `${inputId}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={inputId} className="text-small font-medium">
        {label}
      </Label.Root>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-10 rounded-md border border-border-strong bg-surface px-3 text-small text-fg aria-[invalid]:border-danger',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-small text-danger-fg">
          {error}
        </p>
      )}
    </div>
  )
}
