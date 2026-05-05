import iconPencil from "../imgs/svg/pencil.svg"

type Props = {
  mode: "review" | "free"
  ariaLabel: string
  onClick?: () => void
}

export default function FeedWriteRow({ mode, ariaLabel, onClick }: Props) {
  void mode

  return (
    <div className="feed_write_row" aria-label={ariaLabel}>
      <button type="button" className="feed_write_button" onClick={onClick}>
        <img className="feed_write_icon" src={iconPencil} alt="" aria-hidden="true" />
        <span className="feed_write_label">글쓰기</span>
      </button>
    </div>
  )
}

