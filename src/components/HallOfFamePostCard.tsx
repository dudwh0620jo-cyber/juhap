import { Link } from "react-router"

import iconBookmark from "../imgs/svg/bookmarksimple.svg"
import iconChat from "../imgs/svg/chatcircle.svg"
import iconHeart from "../imgs/svg/heart.svg"
import iconShare from "../imgs/svg/sharenetwork.svg"

type Chip = { key: string; label: string; variant?: "rank" | "tag" }

type Props = {
  postId: number
  linkTo: string
  linkState: Record<string, unknown>
  chips: Chip[]
  title: string
  body: string
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

export default function HallOfFamePostCard({
  postId,
  linkTo,
  linkState,
  chips,
  title,
  body,
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
    <article className="hof_card" key={postId}>
      <Link className="hof_link" to={linkTo} state={linkState}>
        <div className="hof_body">
          <div className="hof_thumb" aria-hidden="true" />
          <div className="hof_text">
            {chips.length > 0 ? (
              <div className="hof_chip_row" aria-label="태그">
                {chips.map((chip) => (
                  <span
                    key={chip.key}
                    className={chip.variant === "rank" ? "hof_chip is_rank" : "hof_chip"}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            ) : null}
            <strong className="hof_title">{title}</strong>
            <p className="hof_excerpt">{body}</p>
          </div>
        </div>
      </Link>
      <div className="feed_actions">
        <div className="left_actions">
          <button
          type="button"
          className={likeActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={likeAriaLabel}
          onClick={onToggleLike}
        >
          <img className="feed_action_icon" src={iconHeart} alt="" aria-hidden="true" />
          <span className="feed_action_text">{likeText}</span>
          </button>

        <button type="button" className="feed_action_button" aria-label="댓글 보기" onClick={onViewComments}>
          <img className="feed_action_icon" src={iconChat} alt="" aria-hidden="true" />
          <span className="feed_action_text">{commentText}</span>
        </button>

        <button type="button" className="feed_action_button" aria-label="공유">
          <img className="feed_action_icon" src={iconShare} alt="" aria-hidden="true" />
        </button>
        </div>
        <div className="right_actions">
          <button
          type="button"
          className={bookmarkActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={bookmarkAriaLabel}
          onClick={onOpenBookmarkPicker}
        >
          <img className="feed_action_icon" src={iconBookmark} alt="" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
