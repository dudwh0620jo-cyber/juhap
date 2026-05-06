import iconPencil from "../assets/svg/pencil.svg"

type Props = {
  ariaLabel: string
  onClickReview?: () => void
  onClickFree?: () => void
}

export default function FeedWriteRow({ ariaLabel, onClickReview, onClickFree }: Props) {
  const hasSplit = Boolean(onClickReview) && Boolean(onClickFree)

  return (
    <div className="feed_write_row" aria-label={ariaLabel}>
      {hasSplit ? (
        <div className="feed_write_split">
          <button type="button" className="feed_write_button" onClick={onClickReview}>
            <img className="feed_write_icon" src={iconPencil} alt="" aria-hidden="true" />
            <span className="feed_write_label">후기 글쓰기</span>
          </button>
          <button type="button" className="feed_write_button" onClick={onClickFree}>
            <img className="feed_write_icon" src={iconPencil} alt="" aria-hidden="true" />
            <span className="feed_write_label">질문 글쓰기</span>
          </button>
        </div>
      ) : (
        <button type="button" className="feed_write_button" onClick={onClickReview ?? onClickFree}>
          <img className="feed_write_icon" src={iconPencil} alt="" aria-hidden="true" />
          <span className="feed_write_label">글쓰기</span>
        </button>
      )}
    </div>
  )
}
