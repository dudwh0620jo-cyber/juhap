import type { ReactNode } from "react"

type Props = {
  title: string
  chips: readonly string[]
  isExpanded: boolean
  showToggle: boolean
  onToggleExpanded: () => void
  setGroupRef: (element: HTMLDivElement | null) => void
  renderChip: (chip: string) => ReactNode
}

export default function FeedFilterGroup({
  title,
  chips,
  isExpanded,
  showToggle,
  onToggleExpanded,
  setGroupRef,
  renderChip,
}: Props) {
  return (
    <div className="feed_filter_group">
      <div className="feed_filter_group_header">
        <h3 className="feed_filter_group_title">{title}</h3>
        {showToggle ? (
          <button
            type="button"
            className={isExpanded ? "feed_filter_group_toggle is_expanded" : "feed_filter_group_toggle"}
            aria-label={isExpanded ? "접기" : "펼치기"}
            onClick={onToggleExpanded}
          />
        ) : null}
      </div>
      <div
        ref={setGroupRef}
        className={isExpanded ? "feed_filter_group_chips" : "feed_filter_group_chips is_collapsed"}
      >
        {chips.map((chip) => renderChip(chip))}
      </div>
    </div>
  )
}
