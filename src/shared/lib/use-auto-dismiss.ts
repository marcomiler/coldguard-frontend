import { useEffect, useState } from 'react'

/**
 * A message that clears itself after `ms`. Showing a new message restarts the timer, even if the
 * text is identical.
 */
export function useAutoDismiss(ms = 6000) {
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), ms)
    return () => clearTimeout(timer)
  }, [notice, ms])

  return {
    message: notice?.text ?? null,
    show: (text: string) => setNotice((current) => ({ id: (current?.id ?? 0) + 1, text })),
    dismiss: () => setNotice(null),
  }
}
