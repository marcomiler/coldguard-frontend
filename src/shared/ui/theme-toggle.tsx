import { cn } from '@/shared/lib/cn'
import { useTheme } from '@/shared/lib/theme'
import { MoonIcon, SunIcon } from './icons'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Tema oscuro"
      onClick={toggle}
      className="inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-1 text-caption text-fg-muted transition-colors duration-(--duration-fast) ease-ui hover:text-fg"
    >
      <span className="relative inline-flex h-6 w-11 items-center rounded-full border border-border-strong bg-surface-hover">
        <span
          className={cn(
            'absolute left-0.5 inline-flex size-4.5 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-(--duration-base) ease-ui motion-reduce:transition-none',
            dark && 'translate-x-5',
          )}
        >
          {dark ? <MoonIcon width="12" height="12" /> : <SunIcon width="12" height="12" />}
        </span>
      </span>
      {dark ? 'Oscuro' : 'Claro'}
    </button>
  )
}
