import { Link } from "react-router"
import RelatedContentPostCardHeader from "./RelatedContentPostCardHeader"

type Props = {
  postId: number
  isQna?: boolean
  authorName: string
  profile?: string
  badgeClassName: string
  badgeText: string
  followButtonClassName: string
  followAriaLabel: string
  followText: string
  onToggleFollow: () => void
  linkTo: string
  linkState: Record<string, unknown>
  title: string
  body: string
  answerCount?: number
  answerPreview?: string
  likeActive: boolean
  likeAriaLabel: string
  likeText: string
  onToggleLike: () => void
  commentText: string
  onViewComments: () => void
  bookmarkActive: boolean
  bookmarkAriaLabel: string
  onOpenBookmarkPicker: () => void
}

export default function RelatedContentPostCard({
  postId,
  isQna,
  authorName,
  profile,
  badgeClassName,
  badgeText,
  followButtonClassName,
  followAriaLabel,
  followText,
  onToggleFollow,
  linkTo,
  linkState,
  title,
  body,
  answerCount,
  answerPreview,
  likeActive,
  likeAriaLabel,
  likeText,
  onToggleLike,
  commentText,
  onViewComments,
  bookmarkActive,
  bookmarkAriaLabel,
  onOpenBookmarkPicker,
}: Props) {
  return (
    <article className={isQna ? "feed_card is_free" : "feed_card"} key={postId}>
      <RelatedContentPostCardHeader
        authorName={authorName}
        profile={profile}
        badgeClassName={badgeClassName}
        badgeText={badgeText}
        followButtonClassName={followButtonClassName}
        followAriaLabel={followAriaLabel}
        followText={followText}
        onToggleFollow={onToggleFollow}
      />

      {isQna ? (
        <Link className="feed_text_link is_free" to={linkTo} state={linkState}>
          <div className="free_layout">
            <div className="free_badge_row">
              {typeof answerCount === "number" ? <span className="free_meta">답변 {answerCount}</span> : null}
            </div>
            <strong className="free_title">{title}</strong>
            <p className="free_body">{body}</p>
            {answerPreview ? (
              <div className="free_answer_preview">
                <span className="free_answer_label">답변</span>
                <p className="free_answer">{answerPreview}</p>
              </div>
            ) : null}
          </div>
        </Link>
      ) : (
        <Link className="feed_text_link" to={linkTo} state={linkState}>
          <div className="review_pair_row">
            <div className="review_pair_thumbs" aria-hidden="true">
              <span className="review_pair_thumb" />
              <span className="review_pair_thumb is_food" />
            </div>
            <div className="review_pair_text">
              <strong className="review_pair_title">{title}</strong>
              <div className="review_pair_rating" aria-label="평점">
                <span className="review_stars" aria-hidden="true">
                  ★★★★★
                </span>
                <span className="review_score">4.9</span>
              </div>
            </div>
          </div>
          <p className="feed_body">{body}</p>
        </Link>
      )}

      <hr></hr>
      <div className="feed_actions">
        <button
          type="button"
          className={likeActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={likeAriaLabel}
          onClick={onToggleLike}
        >
          {likeText}
        </button>

        <button type="button" className="feed_action_button" aria-label="댓글 보기" onClick={onViewComments}>
          {commentText}
        </button>

        <button type="button" className="feed_action_button" aria-label="공유">
          ↗
        </button>

        <button
          type="button"
          className={bookmarkActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={bookmarkAriaLabel}
          onClick={onOpenBookmarkPicker}
        >
          🔖
        </button>
      </div>
    </article>
  )
}
