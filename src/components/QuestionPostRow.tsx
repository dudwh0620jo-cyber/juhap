import { Link } from "react-router"

import iconChat from "../assets/svg/chatcircledots_p.svg"
import iconShare from "../assets/svg/sharenetwork_p.svg"
import { resolveQuestionImage } from "../utils/questionImages"

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
  onShare?: () => void
  linkTo: string
  linkState: Record<string, unknown>
  photoIds?: string[]
  thumbVariant?: "none" | "bottle" | "photo"
}

function formatRelativeKorean(createdAt: string) {
  const targetMs = new Date(createdAt).getTime()
  if (!Number.isFinite(targetMs)) return ""

  const diffMs = Date.now() - targetMs
  const diffMin = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMin < 60) return `${diffMin}분 전`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일 전`

  const hours = new Date(createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  return hours.replace(/\s/g, "")
}

export default function QuestionPostRow({
  postId,
  title,
  body,
  createdAt,
  commentCount,
  onViewComments,
  onShare,
  linkTo,
  linkState,
  photoIds,
  thumbVariant,
}: Props) {
  const timeLabel = formatRelativeKorean(createdAt)
  const firstPhotoId = photoIds?.[0]?.trim() ?? ""
  const hasThumb = Boolean((photoIds && photoIds.length > 0) || (thumbVariant && thumbVariant !== "none"))
  const resolvedQuestionThumb = resolveQuestionImage(firstPhotoId)
  const photoThumbStyle = firstPhotoId.startsWith("data:image/") || firstPhotoId.startsWith("blob:")
    ? { backgroundImage: `url(${firstPhotoId})` }
    : resolvedQuestionThumb
      ? { backgroundImage: `url(${resolvedQuestionThumb})` }
      : undefined

  return (
    <article className="question_row" key={postId}>
      <div className="question_row_top">
        <Link className={`question_row_link${hasThumb ? " has_thumb" : ""}`} to={linkTo} state={linkState}>
          <div className="question_row_text">
            <strong className="question_row_title">{title}</strong>
            <p className="question_row_excerpt">{body}</p>
          </div>
          {photoIds && photoIds.length > 0 ? (
            <div className="question_row_thumb is_photo" style={photoThumbStyle} aria-label={`사진 ${photoIds.length}장`}>
              {photoIds.length > 1 ? <span className="question_row_thumb_count">+{photoIds.length - 1}</span> : null}
            </div>
          ) : thumbVariant && thumbVariant !== "none" ? (
            <div className={thumbVariant === "bottle" ? "question_row_thumb is_bottle" : "question_row_thumb"} />
          ) : null}
        </Link>
      </div>

      <div className="question_row_meta">
        <button type="button" className="question_meta_button" aria-label="댓글 보기" onClick={onViewComments}>
          <img className="question_meta_icon" src={iconChat} alt="" aria-hidden="true" />
          <span className="question_meta_value">{commentCount.toLocaleString()}</span>
        </button>

        <span className="question_meta_time" aria-label="작성 시간">
          {timeLabel}
        </span>
        {onShare ? (
          <button type="button" className="question_meta_share" aria-label="공유" onClick={onShare}>
            <img className="question_meta_share_icon" src={iconShare} alt="" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  )
}
