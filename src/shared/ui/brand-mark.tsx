export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="text-accent">
      <path
        d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M12 9v8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
