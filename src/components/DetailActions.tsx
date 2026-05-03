type Props = {
  isLiked: boolean
  likeCount: number
  commentCount: number
  onToggleLike: () => void
  onScrollToComments: () => void
}

export default function DetailActions({
  isLiked,
  likeCount,
  commentCount,
  onToggleLike,
  onScrollToComments,
}: Props) {
  return (
    <div className="detail_actions" aria-label="액션">
      <button
        type="button"
        className={isLiked ? "detail_action_button is_active" : "detail_action_button"}
        aria-label="좋아요"
        aria-pressed={isLiked}
        onClick={onToggleLike}
      >
        {isLiked ? "♥" : "♡"} <span>{likeCount}</span>
      </button>
      <button
        type="button"
        className="detail_action_button"
        aria-label="댓글 달기"
        onClick={onScrollToComments}
      >
        💬 <span>{commentCount}</span>
      </button>
      <button type="button" className="detail_action_button" aria-label="공유">
        ↗ 공유
      </button>
      <button type="button" className="detail_action_button" aria-label="북마크">
        🔖 저장
      </button>
    </div>
  )
}
