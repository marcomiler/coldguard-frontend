import type { ReactNode } from 'react'

type PageHeaderProps = Readonly<{
  id: string
  title: string
  children?: ReactNode
}>

export function PageHeader({ id, title, children }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3">
      <h1 id={id} className="text-heading-1 font-semibold">
        {title}
      </h1>
      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}
