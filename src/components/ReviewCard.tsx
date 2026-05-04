import { Link } from "react-router"

export type ReviewCardData = {
  id: string
  rankingId?: string
  userName: string
  userMeta: string
  titleLeft: string
  titleRight: string
  body: string
  likeCount: number
  commentCount: number
}

type Props = {
  review: ReviewCardData
  isLiked: boolean
  isFollowing: boolean
  likeCount: number
  onToggleLike: () => void
  onToggleFollow: () => void
  pairingLink?: string
}

export default function ReviewCard({
  review,
  isLiked,
  isFollowing,
  likeCount,
  onToggleLike,
  onToggleFollow,
  pairingLink,
}: Props) {
  const content = (
    <>
      <div className="review_titles">
        <span className="review_tag">{review.titleLeft}</span>
        <span className="review_tag">{review.titleRight}</span>
      </div>
      <p className="review_body">{review.body}</p>
    </>
  )

  return (
    <article className="review_card">
      <header className="review_card_header">
        <div className="review_avatar" aria-hidden="true" />
        <div>
          <h3>{review.userName}</h3>
          <p>{review.userMeta}</p>
        </div>
        <button
          type="button"
          className="review_follow_button"
          aria-pressed={isFollowing}
          onClick={onToggleFollow}
        >
          {isFollowing ? "언팔로우" : "팔로우하기"}
        </button>
      </header>
      <div className="review_images" aria-label="리뷰 이미지">
        <div />
        <div />
      </div>
      {pairingLink ? (
        <Link className="review_content_link" to={pairingLink} aria-label="페어링 글 상세보기">
          {content}
        </Link>
      ) : content}
      <div className="review_actions">
        <button
          type="button"
          className="review_action_button"
          aria-pressed={isLiked}
          aria-label="좋아요"
          onClick={onToggleLike}
        >
          {isLiked ? "♥" : "♡"} {likeCount}
        </button>
        <span>💬 {review.commentCount}</span>
        <span>↗</span>
        <span>🔖</span>
      </div>
    </article>
  )
}
