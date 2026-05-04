type Props = {
  ariaLabel: string
  isVisible: boolean
  onClick?: () => void
}

export default function FeedWriteFab({ ariaLabel, isVisible, onClick }: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={isVisible ? "review_write_fab is_visible" : "review_write_fab"}
      onClick={onClick}
    >
      +
    </button>
  )
}

