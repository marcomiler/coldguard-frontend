import type { SVGProps } from 'react'

function Icon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export const SunIcon = (props: Readonly<SVGProps<SVGSVGElement>>) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </Icon>
)

export const MoonIcon = (props: Readonly<SVGProps<SVGSVGElement>>) => (
  <Icon {...props}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
  </Icon>
)

export const CloseIcon = (props: Readonly<SVGProps<SVGSVGElement>>) => (
  <Icon width="14" height="14" {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const EyeIcon = (props: Readonly<SVGProps<SVGSVGElement>>) => (
  <Icon {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeOffIcon = (props: Readonly<SVGProps<SVGSVGElement>>) => (
  <Icon {...props}>
    <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Icon>
)
