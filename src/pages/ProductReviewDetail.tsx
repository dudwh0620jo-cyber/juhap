import { useMemo, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router"
import CommentSection from "../components/CommentSection"
import ProductReviewLikeButton from "../components/ProductReviewLikeButton"
import ScrollTopButton from "../components/ScrollTopButton"
import iconBell from "../assets/svg/bell.svg"
import iconBookmark from "../assets/svg/bookmarksimple_p.svg"
import iconBookmarkActive from "../assets/svg/bookmarksimple_active.svg"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconChatDots from "../assets/svg/chatcircledots_p.svg"
import iconMagnifyingGlass from "../assets/svg/magnifyingglass.svg"
import iconShare from "../assets/svg/sharenetwork_p.svg"
import iconStar from "../assets/svg/star.svg"
import imgDefaultUserAvatar from "../assets/user_avatar_defult.png"
import { drinkReviews } from "../data/productReviewsMock"
import { useMyOnboardingMeta } from "../hooks/useMyOnboardingMeta"
import { getPairingTierLabelByUserId, getUserGradeBadgeClassNameByUserId } from "../utils/pairingTier"
import { isAlcoholReviewPost, readStoredMyWrittenPosts, toStoredDrinkReview } from "../utils/myWrittenPosts"
import { readStoredPairingCommentCount } from "../utils/communityStorage"
import { currentUserMock } from "../utils/usersMock"
import "../styles/pairing-detail.css"
import "../styles/product-review-detail.css"

const normalizeHashTagValue = (tag: string) => tag.replace(/^#/, "").trim()

export default function ProductReviewDetail() {
  const navigate = useNavigate()
  const { id, reviewId } = useParams()
  const { nickname: myNickname } = useMyOnboardingMeta()
  const decodedReviewId = reviewId ? decodeURIComponent(reviewId) : ""
  const review = useMemo(() => {
    const storedReviews = readStoredMyWrittenPosts().filter(isAlcoholReviewPost).map(toStoredDrinkReview)
    return [...storedReviews, ...drinkReviews].find((item) => item.id === decodedReviewId)
  }, [decodedReviewId])
  const currentUser = useMemo(() => ({ ...currentUserMock, name: myNickname, meta: "작성자" }), [myNickname])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const commentTargetId = review ? `product-review-comments-${review.id}` : ""
  const [commentCountOverride, setCommentCountOverride] = useState<number | null>(() =>
    commentTargetId ? readStoredPairingCommentCount(commentTargetId) : null,
  )

  if (!review) {
    return <Navigate to={id ? `/product/${id}?tab=review` : "/category"} replace />
  }

  const commentCount = commentCountOverride ?? readStoredPairingCommentCount(commentTargetId)

  const toggleLike = () => {
    if (!isLiked) {
      setIsLikeAnimating(false)
      requestAnimationFrame(() => setIsLikeAnimating(true))
      window.setTimeout(() => setIsLikeAnimating(false), 900)
    }

    setIsLiked((prev) => !prev)
  }

  const scrollToComments = () => {
    document.getElementById("product-review-comments")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="product_review_detail_page page_screen" aria-label="후기 상세">
      <header className="product_review_detail_header" aria-label="상단 메뉴">
        <button type="button" className="product_review_detail_icon_button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
        <div className="product_review_detail_header_actions">
          <button type="button" className="product_review_detail_icon_button" aria-label="검색">
            <img src={iconMagnifyingGlass} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="product_review_detail_icon_button" aria-label="알림">
            <img src={iconBell} alt="" aria-hidden="true" />
          </button>
        </div>
      </header>

      <article className="product_review_detail_card">
        <div className="product_review_detail_author">
          <img className="product_review_detail_avatar" src={review.author.avatar || imgDefaultUserAvatar} alt="" aria-hidden="true" />
          <div className="product_review_detail_author_text">
            <p className="product_review_detail_nickname">
              <strong>{review.author.name}</strong>
              <span>{review.author.grade}</span>
              <i aria-hidden="true">ㆍ</i>
              <button type="button" onClick={() => setIsFollowing((prev) => !prev)}>
                {isFollowing ? "언팔로우" : "팔로우"}
              </button>
            </p>
            <p>{review.author.preference}</p>
          </div>
        </div>

        {review.images.length > 0 ? (
          <div className="product_review_detail_media" aria-label="후기 이미지">
            <div
              className="product_review_detail_images"
              onScroll={(event) => {
                const target = event.currentTarget
                const nextIndex = Math.round(target.scrollLeft / Math.max(1, target.clientWidth))
                setActiveImageIndex(Math.min(review.images.length - 1, Math.max(0, nextIndex)))
              }}
            >
              {review.images.map((image) => (
                <img key={image} src={image} alt="" aria-hidden="true" />
              ))}
            </div>
            <span className="product_review_detail_image_count">
              {activeImageIndex + 1}/{review.images.length}
            </span>
            {review.images.length > 1 ? (
              <div className="product_review_detail_dots" aria-label={`이미지 ${review.images.length}장`}>
                {review.images.map((image, index) => (
                  <span key={image} className={index === activeImageIndex ? "is_active" : ""} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="product_review_detail_body">
          <div className="product_review_detail_title_block">
            <h1>{review.title}</h1>
            <p className="product_review_detail_rating">
              <span aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <img key={index} src={iconStar} alt="" />
                ))}
              </span>
              {review.rating}
            </p>
          </div>
          <p className="product_review_detail_text">{review.body}</p>
          <div className="product_review_detail_tags">
            {review.tags.map((tag) => (
              <span key={tag}>#{normalizeHashTagValue(tag)}</span>
            ))}
          </div>
        </div>

        <div className="product_review_detail_actions">
          <div className="product_review_detail_actions_left">
            <ProductReviewLikeButton
              baseCount={review.likes}
              isActive={isLiked}
              isAnimating={isLikeAnimating}
              onToggle={toggleLike}
            />
            <button type="button" aria-label="댓글 보기" onClick={scrollToComments}>
              <img src={iconChatDots} alt="" aria-hidden="true" />
              <span>{commentCount}</span>
            </button>
            <button type="button" aria-label="공유">
              <img src={iconShare} alt="" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            aria-label={isBookmarked ? "저장 취소" : "저장"}
            aria-pressed={isBookmarked}
            onClick={() => setIsBookmarked((prev) => !prev)}
          >
            <img src={isBookmarked ? iconBookmarkActive : iconBookmark} alt="" aria-hidden="true" />
          </button>
        </div>
      </article>

      <div className="product_review_detail_comments" id="product-review-comments">
        <CommentSection
          pairingId={`product-review-comments-${review.id}`}
          currentUser={currentUser}
          getTierClassName={getUserGradeBadgeClassNameByUserId}
          getTierLabel={getPairingTierLabelByUserId}
          onCountChange={setCommentCountOverride}
        />
      </div>

      <ScrollTopButton />
    </section>
  )
}
