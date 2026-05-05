import { Link } from "react-router"
import RelatedContentPostCardHeader from "./RelatedContentPostCardHeader"
import FeedActions from "./FeedActions"

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
  hideAvatar?: boolean
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
  hideAvatar,
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
        hideAvatar={hideAvatar}
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
          <div className="feed_images" aria-label="사진">
            <div className="feed_image" />
            <div className="feed_image" />
          </div>
          <strong className="review_pair_title">{title}</strong>
          <p className="feed_body">{body}</p>
        </Link>
      )}

      <FeedActions
        likeActive={likeActive}
        likeAriaLabel={likeAriaLabel}
        likeText={likeText}
        onToggleLike={onToggleLike}
        commentAriaLabel="댓글 보기"
        commentText={commentText}
        onViewComments={onViewComments}
        bookmarkActive={bookmarkActive}
        bookmarkAriaLabel={bookmarkAriaLabel}
        onBookmark={onOpenBookmarkPicker}
      />
    </article>
  )
}

