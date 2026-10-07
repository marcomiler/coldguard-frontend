import * as Label from '@radix-ui/react-label'
import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { controlClasses, controlSizes } from './field'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function SelectField({ label, className, id, children, ...props }: SelectFieldProps) {
  const generated = useId()
  const selectId = id ?? generated
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={selectId} className="text-caption font-semibold text-fg-muted">
        {label}
      </Label.Root>
      <select id={selectId} className={cn(controlClasses, controlSizes.md, className)} {...props}>
        {children}
      </select>
    </div>
  )
}
