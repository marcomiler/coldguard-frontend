import { useState, type ComponentProps } from 'react'
import { Field } from './field'
import { EyeIcon, EyeOffIcon } from './icons'

type PasswordFieldProps = Omit<ComponentProps<typeof Field>, 'type' | 'trailing'>

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <Field
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((value) => !value)}
          className="flex size-8 items-center justify-center rounded-sm text-fg-muted hover:text-fg"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  )
}
