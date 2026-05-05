import type { ReactNode } from "react"

type Props = {
  isOpen: boolean
  ariaLabel: string
  onClose: () => void
  children: ReactNode
}

export default function SearchFilterModal({ isOpen, ariaLabel, onClose, children }: Props) {
  if (!isOpen) return null

  return (
    <div className="feed_filter_overlay" role="presentation" onClick={onClose}>
      <div
        className="feed_filter_popup"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

