import iconBookmark from "../imgs/svg/bookmarksimple.svg"
import iconBookmarkActive from "../imgs/svg/bookmarksimple_active.svg"
import iconChat from "../imgs/svg/chatcircle.svg"
import iconBeerstein from "../imgs/svg/beerstein.svg"
import iconBeersteinActive from "../imgs/svg/beerstein_active.svg"
import iconShare from "../imgs/svg/sharenetwork.svg"

type Props = {
  variant?: "compact" | "detail"
  likeActive: boolean
  likeAriaLabel: string
  likeText: string
  onToggleLike: () => void
  commentAriaLabel: string
  commentText: string
  onViewComments: () => void
  bookmarkActive: boolean
  bookmarkAriaLabel: string
  onBookmark: () => void
  shareAriaLabel?: string
  onShare?: () => void
}

export default function FeedActions({
  variant = "compact",
  likeActive,
  likeAriaLabel,
  likeText,
  onToggleLike,
  commentAriaLabel,
  commentText,
  onViewComments,
  bookmarkActive,
  bookmarkAriaLabel,
  onBookmark,
  shareAriaLabel = "공유",
  onShare,
}: Props) {
  return (
    <div className={variant === "detail" ? "feed_actions is_detail" : "feed_actions"} aria-label="피드 액션">
      <div className="left_actions">
        <button
          type="button"
          className={likeActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={likeAriaLabel}
          aria-pressed={likeActive}
          onClick={onToggleLike}
        >
          <img
            className="feed_action_icon"
            src={likeActive ? iconBeersteinActive : iconBeerstein}
            alt=""
            aria-hidden="true"
          />
          <span className="feed_action_text">{likeText}</span>
        </button>

        <button type="button" className="feed_action_button" aria-label={commentAriaLabel} onClick={onViewComments}>
          <img className="feed_action_icon" src={iconChat} alt="" aria-hidden="true" />
          <span className="feed_action_text">{commentText}</span>
        </button>

        <button type="button" className="feed_action_button" aria-label={shareAriaLabel} onClick={onShare}>
          <img className="feed_action_icon" src={iconShare} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className="right_actions">
        <button
          type="button"
          className={bookmarkActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={bookmarkAriaLabel}
          aria-pressed={bookmarkActive}
          onClick={onBookmark}
        >
          <img
            className="feed_action_icon"
            src={bookmarkActive ? iconBookmarkActive : iconBookmark}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )
}
