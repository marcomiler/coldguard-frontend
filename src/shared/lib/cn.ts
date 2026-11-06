import { clsx, type ClassValue } from 'clsx'

// No tailwind-merge: an external className may only add classes, not override a utility.
export const cn = (...inputs: ClassValue[]) => clsx(inputs)
