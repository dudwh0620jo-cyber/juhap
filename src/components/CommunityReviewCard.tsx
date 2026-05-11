import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router"

import iconLocation from "../assets/svg/mappin.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import FeedActions from "./FeedActions"
import PairingTagRow from "./PairingTagRow"
import { getPairingTagsFromTitle } from "../utils/communityPosts"
import { resolveReviewImage } from "../utils/reviewImages"
import { resolveUserAvatar } from "../utils/userAvatars"

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
  pairingTitle,
  body,
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
  const { liquorTag, foodTag } = getPairingTagsFromTitle(pairingTitle)
  const visibleHashtags = (hashtags ?? []).slice(0, 5)
  const authorInitial = authorName.trim().slice(0, 1) || "?"
  const authorAvatarSrc = resolveUserAvatar(authorId)

  return (
    <article className="community_review_card" key={postId}>
      <header className="community_review_header">
        <div className="community_review_avatar" aria-hidden="true">
          {authorAvatarSrc ? (
            <img className="community_review_avatar_image" src={authorAvatarSrc} alt="" aria-hidden="true" />
          ) : (
            authorInitial
          )}
        </div>

        <div className="community_review_author">
          <div className="community_review_author_row">
            <strong className="community_review_author_name">{authorName}</strong>
            <span className={badgeClassName}>{badgeText}</span>
            {typeof onOpenMenu === "function" ? (
              <button
                type="button"
                className="community_review_menu_button"
                aria-label={menuAriaLabel ?? "게시글 설정"}
                onClick={onOpenMenu}
              >
                <img className="community_review_menu_icon" src={iconDots} alt="" aria-hidden="true" />
              </button>
            ) : (
              <>
                <span className="community_review_follow_divider" aria-hidden="true">ㆍ</span>
                <button
                  type="button"
                  className={followButtonClassName}
                  aria-label={followAriaLabel}
                  onClick={onToggleFollow}
                >
                  {followText}
                </button>
              </>
            )}
          </div>
          {authorMeta ? <p className="community_review_author_meta">{authorMeta}</p> : null}
        </div>
      </header>

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
          <span className="community_review_image_count">1/{imageTotal}</span>
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
        <h3 className="community_review_title">{title}</h3>

        <PairingTagRow
          liquorTag={liquorTag}
          foodTag={foodTag}
          liquorTo="/community/tag"
          foodTo="/community/tag"
          liquorState={{ tagType: "liquor", tagValue: liquorTag }}
          foodState={{ tagType: "food", tagValue: foodTag }}
        />

        <p className="community_review_body">{body}</p>

        {visibleHashtags.length > 0 ? (
          <div className="community_review_hashtags" aria-label="해시태그">
            {visibleHashtags.map((tag) => (
              <Link key={tag} to="/community/tag" state={{ tagType: "hashtag", tagValue: tag }}>
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}

        {locationLabel ? (
          <p className="community_review_location">
            <img src={iconLocation} alt="" aria-hidden="true" />
            <span>{locationLabel}</span>
          </p>
        ) : null}
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

