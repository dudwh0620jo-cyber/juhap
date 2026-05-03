type Props = {
  mode: "review" | "free"
  ariaLabel: string
  onClick?: () => void
}

export default function FeedWriteRow({ mode, ariaLabel, onClick }: Props) {
  return (
    <div className="feed_write_row" aria-label={ariaLabel}>
      <button type="button" className="feed_write_button" onClick={onClick}>
        {mode === "review" ? "페어링 후기 남기기" : "오늘의 자유로운 글남기기"}
        <span className="feed_write_action">+ 작성</span>
      </button>
    </div>
  )
}

