import iconBookmark from "../imgs/svg/bookmarksimple.svg"
import iconChat from "../imgs/svg/chatcircle.svg"
import iconHeart from "../imgs/svg/heart.svg"
import iconShare from "../imgs/svg/sharenetwork.svg"

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
    <div className="detail_actions" aria-label="상세 액션">
      <button
        type="button"
        className={isLiked ? "detail_action_button is_active" : "detail_action_button"}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
        aria-pressed={isLiked}
        onClick={onToggleLike}
      >
        <img className="detail_action_icon" src={iconHeart} alt="" aria-hidden="true" />
        <span className="detail_action_value">{likeCount}</span>
      </button>

      <button
        type="button"
        className="detail_action_button"
        aria-label="댓글 보기"
        onClick={onScrollToComments}
      >
        <img className="detail_action_icon" src={iconChat} alt="" aria-hidden="true" />
        <span className="detail_action_value">{commentCount}</span>
      </button>

      <button type="button" className="detail_action_button" aria-label="공유">
        <img className="detail_action_icon" src={iconShare} alt="" aria-hidden="true" />
        <span className="detail_action_label">공유</span>
      </button>

      <button type="button" className="detail_action_button" aria-label="북마크">
        <img className="detail_action_icon" src={iconBookmark} alt="" aria-hidden="true" />
        <span className="detail_action_label">북마크</span>
      </button>
    </div>
  )
}
