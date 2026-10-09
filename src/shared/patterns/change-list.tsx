import type { ChangeLine } from '@/shared/lib/describe-change'

/** "Label: before → after" lines under a collapsible summary; renders a dash when nothing changed. */
export function ChangeList({ changes }: { readonly changes: readonly ChangeLine[] }) {
  if (changes.length === 0) return '—'
  return (
    <details>
      <summary className="text-small text-accent">
        {changes.length === 1 ? '1 cambio' : `${changes.length} cambios`}
      </summary>
      <dl className="mt-1.5 flex max-w-sm flex-col gap-1 text-small">
        {changes.map((change) => (
          <div key={change.label}>
            <dt className="text-caption text-fg-muted">{change.label}</dt>
            <dd>
              {change.before !== undefined && (
                <span className="text-fg-muted">{change.before} → </span>
              )}
              {change.after}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
