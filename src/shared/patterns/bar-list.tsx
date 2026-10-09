import type { ReactNode } from 'react'

export interface BarItem {
  readonly key: string
  readonly label: ReactNode
  readonly value: number
  /** `fill-*` token class. */
  readonly fill: string
}

/** Horizontal bars sharing one scale; each row reads as "label, bar, number" for any viewer. */
export function BarList({
  items,
  caption,
}: {
  readonly items: readonly BarItem[]
  caption: string
}) {
  const max = Math.max(1, ...items.map((item) => item.value))
  return (
    <ul aria-label={caption} className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-small">{item.label}</span>
          <svg width="100%" height="8" aria-hidden="true" className="min-w-0 flex-1">
            <rect width="100%" height="8" rx="4" className="fill-border" />
            {item.value > 0 && (
              <rect
                width={`${(item.value / max) * 100}%`}
                height="8"
                rx="4"
                className={item.fill}
              />
            )}
          </svg>
          <span className="w-10 shrink-0 text-right font-mono text-small tabular-nums">
            {item.value}
          </span>
        </li>
      ))}
    </ul>
  )
}
