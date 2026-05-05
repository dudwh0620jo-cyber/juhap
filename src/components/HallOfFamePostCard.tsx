import { Link } from "react-router"

import FeedActions from "./FeedActions"

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
