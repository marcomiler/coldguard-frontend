import * as Label from '@radix-ui/react-label'
import { useId, type InputHTMLAttributes, type Ref } from 'react'
import { cn } from '@/shared/lib/cn'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

/** Input con label visible, error asociado vía aria-describedby y aria-invalid. */
export function Field({ label, error, className, id, ref, ...props }: FieldProps) {
  const generated = useId()
  const inputId = id ?? generated
  const errorId = `${inputId}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={inputId} className="text-sm font-medium">
        {label}
      </Label.Root>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600 aria-[invalid]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
