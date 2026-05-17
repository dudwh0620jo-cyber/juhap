import { useEffect, useMemo, useState } from "react"
import { Navigate, useLocation, useNavigate, useParams } from "react-router"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import CommentSection from "../components/CommentSection"
import ProductReviewLikeButton from "../components/ProductReviewLikeButton"
import ScrollTopButton from "../components/ScrollTopButton"
import iconBookmark from "../assets/svg/bookmarksimple_p.svg"
import iconBookmarkActive from "../assets/svg/bookmarksimple_active.svg"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconChatDots from "../assets/svg/chatcircledots_p.svg"
import iconShare from "../assets/svg/sharenetwork_p.svg"
import iconStar from "../assets/svg/star.svg"
import iconCheck from "../assets/svg/check_g.svg"
import iconWarning from "../assets/svg/worning_r.svg"
import imgDefaultUserAvatar from "../assets/user_avatar_defult.png"
import { communityPageData } from "../data/communityPageData"
import { drinkReviews } from "../data/productReviewsMock"
import { useMyOnboardingMeta } from "../hooks/useMyOnboardingMeta"
import { COMMUNITY_BOOKMARK_LIST_BY_POST_KEY, readStoredPairingCommentCount } from "../utils/communityStorage"
import { getDrinkReviewBookmarkPostId } from "../utils/drinkReviewBookmark"
import { isAlcoholReviewPost, readStoredMyWrittenPosts, toStoredDrinkReview } from "../utils/myWrittenPosts"
import { getPairingTierLabelByUserId, getUserGradeBadgeClassNameByUserId } from "../utils/pairingTier"
import { useStoredNullableStringRecord } from "../utils/storage"
import { resolveMyUserAvatar } from "../utils/userAvatars"
import { currentUserMock } from "../utils/usersMock"
import "../styles/pairing-detail.css"
import "../styles/product-review-detail.css"

const normalizeHashTagValue = (tag: string) => tag.replace(/^#/, "").trim()
const getReviewCommentTargetId = (reviewId: string) => (/^\d+$/.test(reviewId) ? reviewId : `product-review-comments-${reviewId}`)
const getFilledStarCount = (rating: number | string) => {
  const numericRating = typeof rating === "number" ? rating : Number.parseFloat(rating)
  if (!Number.isFinite(numericRating)) return 0
  return Math.max(0, Math.min(5, Math.round(numericRating)))
}

export default function ProductReviewDetail() {
  const { bookmarkLists } = communityPageData
  const navigate = useNavigate()
  const location = useLocation()
  const { id, reviewId } = useParams()
  const { nickname: myNickname, metaLine: myMetaLine } = useMyOnboardingMeta()

  const decodedReviewId = reviewId ? decodeURIComponent(reviewId) : ""
  const review = useMemo(() => {
    const storedReviews = readStoredMyWrittenPosts().filter(isAlcoholReviewPost).map(toStoredDrinkReview)
    return [...storedReviews, ...drinkReviews].find((item) => item.id === decodedReviewId)
  }, [decodedReviewId])

  const currentUser = useMemo(() => ({ ...currentUserMock, name: myNickname, meta: myMetaLine }), [myMetaLine, myNickname])

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null)
  const [bookmarkToastMessage, setBookmarkToastMessage] = useState<string | null>(null)
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(null)

  const { value: bookmarkListById, setValue: setBookmarkListById } =
    useStoredNullableStringRecord(COMMUNITY_BOOKMARK_LIST_BY_POST_KEY)

  const commentTargetId = review ? getReviewCommentTargetId(review.id) : ""
  const [commentCountOverride, setCommentCountOverride] = useState<number | null>(() =>
    commentTargetId ? readStoredPairingCommentCount(commentTargetId) : null,
  )

  if (!review) {
    return <Navigate to={id ? `/product/${id}?tab=review` : "/category"} replace />
  }

  const isMyReview = review.id.startsWith("user-review-") || review.author.name === myNickname
  const displayAuthorName = isMyReview ? myNickname : review.author.name
  const displayAuthorGrade = isMyReview ? getPairingTierLabelByUserId(currentUserMock.id) : review.author.grade
  const displayAuthorProfile = isMyReview ? myMetaLine : review.author.preference
  const displayAuthorAvatar = isMyReview ? resolveMyUserAvatar() : review.author.avatar || imgDefaultUserAvatar

  const commentCount = commentCountOverride ?? readStoredPairingCommentCount(commentTargetId)
  const reviewBookmarkPostId = getDrinkReviewBookmarkPostId(review.id)
  const isBookmarked = Number.isFinite(reviewBookmarkPostId)
    ? Boolean(bookmarkListById[reviewBookmarkPostId])
    : false

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

  const openBookmarkPicker = () => {
    if (!Number.isFinite(reviewBookmarkPostId)) return
    setBookmarkPicker({
      postId: reviewBookmarkPostId,
      selectedListId: bookmarkListById[reviewBookmarkPostId] ?? bookmarkLists[0]?.id ?? "default",
    })
  }

  const confirmBookmark = () => {
    if (!bookmarkPicker) return
    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    setBookmarkToastMessage("저장한 리스트에 추가했어요.")
    setBookmarkPicker(null)
  }

  const removeBookmark = () => {
    if (!bookmarkPicker) return
    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    setBookmarkToastMessage("저장을 취소했어요.")
    setBookmarkPicker(null)
  }

  const cancelBookmark = () => setBookmarkPicker(null)

  const showShareToast = () => {
    setShareToastMessage("현재 지원되지 않는 기능이에요.")
  }

  const handleBack = () => {
    const returnInfo = (location.state as { returnToProductReview?: { productId?: string; reviewAnchorId?: string } } | null)
      ?.returnToProductReview

    if (returnInfo?.productId && returnInfo.reviewAnchorId) {
      navigate(`/product/${returnInfo.productId}?tab=review#${returnInfo.reviewAnchorId}`)
      return
    }

    navigate(-1)
  }

  useEffect(() => {
    if (location.hash !== "#comments") return
    window.setTimeout(() => {
      document.getElementById("product-review-comments")?.scrollIntoView({ behavior: "auto", block: "start" })
    }, 0)
  }, [location.hash])

  useEffect(() => {
    if (!shareToastMessage) return
    const timerId = window.setTimeout(() => setShareToastMessage(null), 1800)
    return () => window.clearTimeout(timerId)
  }, [shareToastMessage])

  useEffect(() => {
    if (!bookmarkToastMessage) return
    const timerId = window.setTimeout(() => setBookmarkToastMessage(null), 1800)
    return () => window.clearTimeout(timerId)
  }, [bookmarkToastMessage])

  return (
    <section className="product_review_detail_page page_screen" aria-label="후기 상세">
      <header className="product_review_detail_header" aria-label="상단 메뉴">
        <button type="button" className="product_review_detail_icon_button" aria-label="뒤로가기" onClick={handleBack}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
      </header>

      <article className="product_review_detail_card">
        <div className="product_review_detail_author">
          <img className="product_review_detail_avatar" src={displayAuthorAvatar} alt="" aria-hidden="true" />
          <div className="product_review_detail_author_text">
            <p className="product_review_detail_nickname">
              <strong>{displayAuthorName}</strong>
              <span className="product_review_detail_grade">{displayAuthorGrade}</span>
              {isMyReview ? (
                <span className="author_owner_badge">작성자</span>
              ) : (
                <>
                  <i aria-hidden="true">·</i>
                  <button type="button" onClick={() => setIsFollowing((prev) => !prev)}>
                    {isFollowing ? "언팔로우" : "팔로우"}
                  </button>
                </>
              )}
            </p>
            <p>{displayAuthorProfile}</p>
          </div>
        </div>

        {review.images.length > 0 ? (
          <div className="product_review_detail_media" aria-label="후기 이미지">
            <div className="product_review_detail_media_frame">
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
            </div>
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
                  <img key={index} className={index < getFilledStarCount(review.rating) ? "" : "is_inactive"} src={iconStar} alt="" />
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
            <button type="button" aria-label="공유" onClick={showShareToast}>
              <img src={iconShare} alt="" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            aria-label={isBookmarked ? "저장 취소" : "저장"}
            aria-pressed={isBookmarked}
            onClick={openBookmarkPicker}
          >
            <img src={isBookmarked ? iconBookmarkActive : iconBookmark} alt="" aria-hidden="true" />
          </button>
        </div>
      </article>

      <div className="product_review_detail_comments" id="product-review-comments">
        <CommentSection
          pairingId={commentTargetId}
          currentUser={currentUser}
          getTierClassName={getUserGradeBadgeClassNameByUserId}
          getTierLabel={getPairingTierLabelByUserId}
          onCountChange={setCommentCountOverride}
        />
      </div>

      {bookmarkPicker ? (
        <CommunityBookmarkPickerModal
          ariaLabel="북마크 리스트 선택"
          titleText={isBookmarked ? "저장한 게시글을 취소할까요?" : "게시글을 저장할까요?"}
          helperText={
            isBookmarked
              ? <>취소하면 내 정보 &gt; 저장한 리스트에서<br />이 게시글이 사라져요.</>
              : <>저장한 게시글은 내 정보 &gt; 저장한 리스트에서<br />확인할 수 있어요.</>
          }
          secondaryLabel="취소"
          primaryLabel={isBookmarked ? "저장 취소하기" : "저장하기"}
          onDismiss={cancelBookmark}
          onSecondary={cancelBookmark}
          onPrimary={isBookmarked ? removeBookmark : confirmBookmark}
        />
      ) : null}

      {shareToastMessage ? (
        <div className="app_alert_toast" role="status" aria-live="polite">
          <span className="app_alert_toast_icon is_warning">
            <img src={iconWarning} alt="" aria-hidden="true" />
          </span>
          <p>{shareToastMessage}</p>
        </div>
      ) : null}

      {bookmarkToastMessage ? (
        <div className="app_alert_toast" role="status" aria-live="polite">
          <span className="app_alert_toast_icon is_success">
            <img src={iconCheck} alt="" aria-hidden="true" />
          </span>
          <p>{bookmarkToastMessage}</p>
        </div>
      ) : null}

      <ScrollTopButton />
    </section>
  )
}
