import type { ReactNode } from 'react'
import type { ChipVariant } from '../types'

const variantClass: Record<ChipVariant, string> = {
  teal: 'bg-teal-light text-teal-deep',
  purple: 'bg-brand-purple-light text-brand-purple-deep',
  amber: 'bg-amber-light text-amber-deep',
}

export function Chip({
  variant,
  children,
}: {
  variant: ChipVariant
  children: ReactNode
}) {
  return (
    <span
      className={`inline-block rounded-badge px-chip-h py-chip-v text-chip-label ${variantClass[variant]}`}
    >
      {children}
    </span>
  )
}
