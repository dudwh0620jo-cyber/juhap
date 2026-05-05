import { Link } from "react-router"

import iconChat from "../imgs/svg/chatcircle.svg"
import iconHeart from "../imgs/svg/heart.svg"

type Props = {
  postId: number
  title: string
  body: string
  createdAt: string
  likeCount: number
  commentCount: number
  likeActive: boolean
  likeAriaLabel: string
  onToggleLike: () => void
  onViewComments: () => void
  linkTo: string
  linkState: Record<string, unknown>
  thumbVariant?: "none" | "bottle" | "photo"
}

function formatRelativeKorean(createdAt: string) {
  const targetMs = new Date(createdAt).getTime()
  if (!Number.isFinite(targetMs)) return ""

  const diffMs = Date.now() - targetMs
  const diffMin = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMin < 60) return `${diffMin}분전`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간전`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일전`

  const hours = new Date(createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  return hours.replace(/\s/g, "")
}

export default function QuestionPostRow({
  postId,
  title,
  body,
  createdAt,
  likeCount,
  commentCount,
  likeActive,
  likeAriaLabel,
  onToggleLike,
  onViewComments,
  linkTo,
  linkState,
  thumbVariant,
}: Props) {
  const timeLabel = formatRelativeKorean(createdAt)

  return (
    <article className="question_row" key={postId}>
      <div className="question_row_top">
        <Link className="question_row_link" to={linkTo} state={linkState}>
          <div className="question_row_text">
            <strong className="question_row_title">{title}</strong>
            <p className="question_row_excerpt">{body}</p>
          </div>
          {thumbVariant && thumbVariant !== "none" ? (
            <div className={thumbVariant === "bottle" ? "question_row_thumb is_bottle" : "question_row_thumb"} />
          ) : null}
        </Link>
      </div>

      <div className="question_row_meta">
        <button
          type="button"
          className={likeActive ? "question_meta_button is_active" : "question_meta_button"}
          aria-label={likeAriaLabel}
          onClick={onToggleLike}
        >
          <img className="question_meta_icon" src={iconHeart} alt="" aria-hidden="true" />
          <span className="question_meta_value">{likeCount.toLocaleString()}</span>
        </button>

        <button type="button" className="question_meta_button" aria-label="댓글 보기" onClick={onViewComments}>
          <img className="question_meta_icon" src={iconChat} alt="" aria-hidden="true" />
          <span className="question_meta_value">{commentCount.toLocaleString()}</span>
        </button>

        <span className="question_meta_time" aria-label="작성 시간">
          {timeLabel}
        </span>
      </div>
    </article>
  )
}

