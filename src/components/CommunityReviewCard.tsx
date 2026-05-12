import { useRef, useState } from "react"
import { useNavigate } from "react-router"

import iconDots from "../assets/svg/dotsthreevertical.svg"
import FeedActions from "./FeedActions"
import ReviewContentBlock from "./ReviewContentBlock"
import UserIdentityRow from "./UserIdentityRow"
import { resolveReviewImage } from "../utils/reviewImages"

type Props = {
  postId: number
  authorId: number
  authorName: string
  authorMeta: string
  badgeClassName: string
  badgeText: string
  followButtonClassName: string
  followAriaLabel: string
  followText: string
  onToggleFollow: () => void
  menuAriaLabel?: string
  onOpenMenu?: () => void
  linkTo: string
  linkState: Record<string, unknown>
  title: string
  pairingTitle: string
  body: string
  liquorTag: string
  foodTag: string
  photoIds?: string[]
  hashtags?: string[]
  locationLabel?: string
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

export default function CommunityReviewCard({
  postId,
  authorId,
  authorName,
  authorMeta,
  badgeClassName,
  badgeText,
  followButtonClassName,
  followAriaLabel,
  followText,
  onToggleFollow,
  menuAriaLabel,
  onOpenMenu,
  linkTo,
  linkState,
  title,
  body,
  liquorTag,
  foodTag,
  photoIds,
  hashtags,
  locationLabel,
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
  const navigate = useNavigate()
  const safePhotoIds = photoIds?.slice(0, 3) ?? []
  const imageTotal = safePhotoIds.length
  const imageListRef = useRef<HTMLDivElement | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const authorInitial = authorName.trim().slice(0, 1) || "?"

  return (
    <article className="community_review_card" key={postId}>
      <UserIdentityRow
        userId={authorId}
        className="community_review_header"
        identityClassName="community_review_author"
        titleClassName="community_review_author_row"
        metaClassName="community_review_author_meta"
        avatarFallback={<span className="community_review_avatar_fallback">{authorInitial}</span>}
        title={
          <>
            <strong className="community_review_author_name">{authorName}</strong>
            <span className={badgeClassName}>{badgeText}</span>
          </>
        }
        titleMeta={
          typeof onOpenMenu === "function" ? null : (
            <>
              <span className="community_review_follow_divider" aria-hidden="true">
                ㆍ
              </span>
              <button
                type="button"
                className={followButtonClassName}
                aria-label={followAriaLabel}
                onClick={onToggleFollow}
              >
                {followText}
              </button>
            </>
          )
        }
        meta={authorMeta}
        rightAction={
          typeof onOpenMenu === "function" ? (
            <button
              type="button"
              className="community_review_menu_button"
              aria-label={menuAriaLabel ?? "게시글 설정"}
              onClick={onOpenMenu}
            >
              <img className="community_review_menu_icon" src={iconDots} alt="" aria-hidden="true" />
            </button>
          ) : null
        }
      />

      {imageTotal > 0 ? (
        <div className="community_review_media">
          <div
            ref={imageListRef}
            className="community_review_images"
            aria-label="후기 사진"
            onScroll={() => {
              const target = imageListRef.current
              if (!target) return
              const nextIndex = Math.round(target.scrollLeft / Math.max(1, target.clientWidth))
              setActiveImageIndex(Math.min(imageTotal - 1, Math.max(0, nextIndex)))
            }}
          >
            {safePhotoIds.map((photoId) => {
              const imageSrc = resolveReviewImage(photoId)
              return (
                <figure className="community_review_image_frame" key={photoId}>
                  {imageSrc ? (
                    <img className="community_review_image" src={imageSrc} alt="" aria-hidden="true" />
                  ) : (
                    <span className="community_review_image_placeholder" aria-hidden="true" />
                  )}
                </figure>
              )
            })}
          </div>
          <span className="community_review_image_count">{activeImageIndex + 1}/{imageTotal}</span>
        </div>
      ) : null}

      {imageTotal > 1 ? (
        <div className="community_review_dots" aria-label={`사진 ${imageTotal}장`}>
          {safePhotoIds.map((photoId, index) => (
            <span key={photoId} className={index === activeImageIndex ? "is_active" : ""} />
          ))}
        </div>
      ) : null}

      <div
        className="community_review_content"
        role="link"
        tabIndex={0}
        onClick={() => navigate(linkTo, { state: linkState })}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          navigate(linkTo, { state: linkState })
        }}
      >
        <ReviewContentBlock
          title={<h3 className="community_review_title">{title}</h3>}
          liquorTag={liquorTag}
          foodTag={foodTag}
          body={body}
          hashtags={hashtags}
          locationLabel={locationLabel}
          titleClassName="community_review_title_wrap"
          bodyClassName="community_review_body"
          hashtagLinkTo="/community/tag"
          getHashtagState={(tag) => ({ tagType: "hashtag", tagValue: tag })}
          liquorTo="/community/tag"
          foodTo="/community/tag"
          liquorState={{ tagType: "liquor", tagValue: liquorTag }}
          foodState={{ tagType: "food", tagValue: foodTag }}
          locationIconClassName="community_review_location_icon"
        />
      </div>

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
