type Props = {
  label: string
  isActive: boolean
  onClick: () => void
}

export default function FeedFilterChip({ label, isActive, onClick }: Props) {
  return (
    <button
      type="button"
      className={isActive ? "feed_filter_chip is_active" : "feed_filter_chip"}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

