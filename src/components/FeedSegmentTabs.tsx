type SegmentTabItem = {
  key: string
  label: string
}

type Props = {
  ariaLabel: string
  items: SegmentTabItem[]
  activeKey: string
  onChange: (key: string) => void
}

export default function FeedSegmentTabs({ ariaLabel, items, activeKey, onChange }: Props) {
  return (
    <div className="feed_segment_row" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={activeKey === item.key ? "is_active" : ""}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

