import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useNavigationType, useParams, useSearchParams } from "react-router"
import AlertModal from "../components/AlertModal"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import ProductReviewLikeButton from "../components/ProductReviewLikeButton"
import ScrollTopButton from "../components/ScrollTopButton"
import SakeGuideAccordion from "../components/SakeGuideAccordion"
import imgGallery1 from "../assets/fd_img_gallery1.png"
import imgGallery2 from "../assets/fd_img_gallery2.png"
import imgGallery3 from "../assets/fd_img_gallery3.png"
import imgGallery4 from "../assets/fd_img_gallery4.png"
import imgOfflineEmptyCharacter from "../assets/fd_offline_empty_character.png"
import imgProductHero from "../assets/fd_product_hero_image.png"
import imgPurchaseThumb1 from "../assets/fd_purchase_thumb1.png"
import imgPurchaseThumb2 from "../assets/fd_purchase_thumb2.png"
import imgPurchaseThumb3 from "../assets/fd_purchase_thumb3.png"
import imgDefaultUserAvatar from "../assets/user_avatar_defult.png"
import iconBookmark from "../assets/svg/bookmarksimple.svg"
import iconBookmarkActive from "../assets/svg/bookmarksimple_active.svg"
import iconBookmarkPoint from "../assets/svg/bookmarksimple_p.svg"
import iconLocation from "../assets/svg/mappin.svg"
import iconCaretDown from "../assets/svg/caretdown.svg"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconCaretRight from "../assets/svg/caretright.svg"
import iconChatDots from "../assets/svg/chatcircledots_p.svg"
import iconPencil from "../assets/svg/pencilsimple_p.svg"
import iconShare from "../assets/svg/sharenetwork.svg"
import iconSharePoint from "../assets/svg/sharenetwork_p.svg"
import iconCheck from "../assets/svg/check_g.svg"
import iconWarning from "../assets/svg/worning_r.svg"
import iconTasteAroma from "../assets/svg/fd_product_taste_rows_aroma.svg"
import iconTasteFinish from "../assets/svg/fd_product_taste_rows_finish.svg"
import iconTasteTaste from "../assets/svg/fd_product_taste_rows_taste.svg"
import iconStar from "../assets/svg/star.svg"
import {
  productDetailTabItems,
  productPurchaseDiscounts,
  productReviewCount,
  productReviewScoreRows,
  productReviewSortItems,
} from "../data/productDetailContent"
import { communityPageData } from "../data/communityPageData"
import { productDetailPageData } from "../data/productDetailData"
import { drinkReviews, productPairingReviews } from "../data/productReviewsMock"
import { useProductReviewInteractions } from "../hooks/useProductReviewInteractions"
import { COMMUNITY_BOOKMARK_LIST_BY_POST_KEY, readStoredPairingCommentCount } from "../utils/communityStorage"
import { getDrinkReviewBookmarkPostId } from "../utils/drinkReviewBookmark"
import { USER_POSTS_UPDATED_EVENT } from "../utils/communityFeed"
import { addSavedAlcoholProductId, hasSavedAlcoholProductId, removeSavedAlcoholProductId } from "../utils/savedAlcohol"
import {
  isAlcoholReviewPost,
  isPairingReviewPost,
  matchesWrittenPostProductName,
  readStoredMyWrittenPosts,
  toStoredDrinkReview,
  toStoredPairingReview,
} from "../utils/myWrittenPosts"
import type { PairingDetailNavState } from "../utils/pairingDetail"
import { getVisibleProductReviews } from "../utils/productReviews"
import type { DrinkReview } from "../utils/productReviews"
import { useStoredNullableStringRecord } from "../utils/storage"
import { useMyOnboardingMeta } from "../hooks/useMyOnboardingMeta"
import "../styles/product-detail.css"
import imgFoodMatch1 from "../assets/fd_food_match1.svg"
import imgFoodMatch2 from "../assets/fd_food_match2.svg"
import imgFoodMatch3 from "../assets/fd_food_match3.svg"

const tabItems = productDetailTabItems
const reviewCount = productReviewCount
const purchaseThumbs = [imgPurchaseThumb1, imgPurchaseThumb2, imgPurchaseThumb3]
const purchaseDiscounts = productPurchaseDiscounts
const reviewGalleryImages = [imgGallery1, imgGallery2, imgGallery3, imgGallery4]
const reviewSortItems = productReviewSortItems
type ReviewSortKey = (typeof reviewSortItems)[number]["key"]
const reviewScoreRows = productReviewScoreRows
const REVIEW_PAGE_SIZE = 5
type ProductBookmarkPicker =
  | { kind: "review"; reviewId: string; postId: number; selectedListId: string }
  | { kind: "pairing"; reviewId: string; postId: number; selectedListId: string }
type DrinkReviewBookmarkConfirm = { postId: number; active: boolean } | null

const tasteIconByLabel: Record<string, string> = {
  Aroma: iconTasteAroma,
  Taste: iconTasteTaste,
  Finish: iconTasteFinish,
}

const normalizeHashTagValue = (tag: string) => tag.replace(/^#/, "").trim()

const getPairingReviewPostId = (review: DrinkReview) => {
  if (typeof review.pairingPostId === "number" && Number.isFinite(review.pairingPostId)) return review.pairingPostId
  const matchedId = review.id.match(/^pairing-review-(\d+)$/)?.[1]
  return matchedId ? Number(matchedId) : NaN
}

const getProductReviewCommentTargetId = (review: DrinkReview) => {
  const pairingPostId = getPairingReviewPostId(review)
  if (Number.isFinite(pairingPostId)) return String(pairingPostId)
  return /^\d+$/.test(review.id) ? review.id : `product-review-comments-${review.id}`
}

const getProductReviewCommentCount = (review: DrinkReview) => readStoredPairingCommentCount(getProductReviewCommentTargetId(review))

const getFilledStarCount = (rating: number) => Math.max(0, Math.min(5, Math.round(rating)))

export default function ProductDetail() {
  const { mockProductById, defaultProduct } = productDetailPageData
  const { bookmarkLists } = communityPageData
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const location = useLocation()
  const { id } = useParams()
  const { nickname: myNickname } = useMyOnboardingMeta()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get("tab") === "pairing" ? "페어링추천" : searchParams.get("tab") === "review" ? "후기" : "상세정보"
  const [activeTab, setActiveTab] = useState<(typeof tabItems)[number]>(initialTab)
  const [pendingPurchaseShopName, setPendingPurchaseShopName] = useState<string | null>(null)
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false)
  const [isPhotoReviewOnly, setIsPhotoReviewOnly] = useState(false)
  const [isPairingPhotoOnly, setIsPairingPhotoOnly] = useState(false)
  const [reviewSort, setReviewSort] = useState<ReviewSortKey>("latest")
  const [pairingSort, setPairingSort] = useState<ReviewSortKey>("latest")
  const [isReviewSortSheetOpen, setIsReviewSortSheetOpen] = useState(false)
  const [sortSheetTarget, setSortSheetTarget] = useState<"review" | "pairing">("review")
  const [reviewVisibleCount, setReviewVisibleCount] = useState(REVIEW_PAGE_SIZE)
  const [pairingVisibleCount, setPairingVisibleCount] = useState(REVIEW_PAGE_SIZE)
  const [bookmarkPicker, setBookmarkPicker] = useState<ProductBookmarkPicker | null>(null)
  const [drinkReviewBookmarkConfirm, setDrinkReviewBookmarkConfirm] = useState<DrinkReviewBookmarkConfirm>(null)
  const [isProductSaved, setIsProductSaved] = useState(false)
  const [isProductSaveConfirmOpen, setIsProductSaveConfirmOpen] = useState(false)
  const [isProductSaveConfirmActive, setIsProductSaveConfirmActive] = useState(false)
  const productTabsRef = useRef<HTMLDivElement | null>(null)
  const productTabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [productTabsGlider, setProductTabsGlider] = useState({ x: 0, width: 0 })
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null)
  const [bookmarkToastMessage, setBookmarkToastMessage] = useState<string | null>(null)
  const [storedMyPosts, setStoredMyPosts] = useState(() => readStoredMyWrittenPosts())
  const { value: bookmarkListById, setValue: setBookmarkListById } = useStoredNullableStringRecord(COMMUNITY_BOOKMARK_LIST_BY_POST_KEY)
  const {
    animatingReviewId,
    confirmUnfollow,
    followedAuthorNames,
    likedReviewIds,
    pendingUnfollowName,
    requestToggleFollow,
    setPendingUnfollowName,
    toggleReviewLike,
  } = useProductReviewInteractions()

  const product = useMemo(() => {
    if (id && mockProductById[id]) return mockProductById[id]
    return defaultProduct
  }, [defaultProduct, id, mockProductById])

  useEffect(() => {
    setIsProductSaved(hasSavedAlcoholProductId(product.id))
  }, [product.id])

  const pairingReviews = useMemo(
    () => productPairingReviews.filter((review) => review.alcoholTag === product.name),
    [product.name]
  )
  const storedPairingReviews = useMemo(
    () =>
      storedMyPosts
        .filter(isPairingReviewPost)
        .filter((post) => matchesWrittenPostProductName(post, product.name))
        .map(toStoredPairingReview),
    [product.name, storedMyPosts],
  )
  const storedDrinkReviews = useMemo(
    () =>
      storedMyPosts
        .filter(isAlcoholReviewPost)
        .filter((post) => post.productId === product.id || post.drinkName === product.name)
        .map(toStoredDrinkReview),
    [product.id, product.name, storedMyPosts],
  )
  const ratingWidth = `${Math.max(0, Math.min(100, (product.rating / 5) * 100))}%`
  const bestOnlinePrice = product.onlineShops[0]?.price ?? product.price
  const breadcrumbItems = product.breadcrumb.split(">").map((item) => item.trim()).filter(Boolean)
  const reviewSortLabel = reviewSortItems.find((item) => item.key === reviewSort)?.label ?? "최신순"
  const pairingSortLabel = reviewSortItems.find((item) => item.key === pairingSort)?.label ?? "최신순"
  const visibleReviews = useMemo(
    () => getVisibleProductReviews([...storedDrinkReviews, ...drinkReviews], { photoOnly: isPhotoReviewOnly, sortKey: reviewSort }),
    [isPhotoReviewOnly, reviewSort, storedDrinkReviews],
  )
  const visiblePairingReviews = useMemo(
    () => getVisibleProductReviews([...storedPairingReviews, ...pairingReviews], { photoOnly: isPairingPhotoOnly, sortKey: pairingSort }),
    [isPairingPhotoOnly, pairingReviews, pairingSort, storedPairingReviews],
  )
  const reviewGalleryPreviewImages = useMemo(() => {
    const myFirstPhoto = storedDrinkReviews.find((review) => review.images.length > 0)?.images[0]
    if (!myFirstPhoto) return reviewGalleryImages

    const baseWithoutThird = reviewGalleryImages.filter((_, index) => index !== 2)
    return [myFirstPhoto, ...baseWithoutThird].slice(0, 4)
  }, [storedDrinkReviews])

  const isMyReviewAuthor = (authorName: string, reviewId: string) => reviewId.startsWith("user-review-") || authorName === myNickname

  const changeActiveTab = (nextTab: (typeof tabItems)[number]) => {
    setActiveTab(nextTab)
    const nextParams = new URLSearchParams(searchParams)

    if (nextTab === "페어링추천") {
      nextParams.set("tab", "pairing")
    } else if (nextTab === "페어링추천") {
      nextParams.set("tab", "review")
    } else {
      nextParams.delete("tab")
    }

    setSearchParams(nextParams, { replace: true })
  }

  useLayoutEffect(() => {
    const updateGlider = () => {
      const container = productTabsRef.current
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const tabCount = tabItems.length
      const activeIndex = Math.max(0, tabItems.indexOf(activeTab))
      const segmentWidth = containerRect.width / tabCount

      setProductTabsGlider({
        x: segmentWidth * activeIndex,
        width: segmentWidth,
      })
    }

    updateGlider()
    window.addEventListener("resize", updateGlider)
    return () => window.removeEventListener("resize", updateGlider)
  }, [activeTab])

  useEffect(() => {
    const readPosts = () => setStoredMyPosts(readStoredMyWrittenPosts())

    window.addEventListener(USER_POSTS_UPDATED_EVENT, readPosts)
    return () => window.removeEventListener(USER_POSTS_UPDATED_EVENT, readPosts)
  }, [])

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

  useEffect(() => {
    if (navigationType === "POP") return
    if (activeTab !== "후기") return
    const hash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash
    if (!hash) return
    const target = document.getElementById(hash)
    if (!target) return
    const timerId = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "auto", block: "center" })
    }, 0)
    return () => window.clearTimeout(timerId)
  }, [activeTab, location.hash, navigationType, reviewVisibleCount])

  const openPairingReviewDetail = (review: DrinkReview) => {
    const postId = getPairingReviewPostId(review)
    if (!Number.isFinite(postId)) return

    navigate(`/community/pairing/${postId}`, {
      state: {
        pairingTitle: [review.alcoholTag, review.foodTag].filter(Boolean).join(" + "),
        pairingSummary: review.title,
        body: review.body,
        authorName: review.author.name,
        profile: review.author.preference,
        locationLabel: review.location ?? "",
        drinkType: review.alcoholTag ?? "",
        foods: review.foodTag ? [review.foodTag] : undefined,
        bottomNavActive: "category",
      } satisfies PairingDetailNavState,
    })
  }

  const openProductReviewDetail = (review: DrinkReview) => {
    const reviewAnchorId = `review-card-${encodeURIComponent(review.id)}`
    navigate(`/product/${product.id}/review/${encodeURIComponent(review.id)}`, {
      state: {
        bottomNavActive: "category",
        returnToProductReview: { productId: product.id, reviewAnchorId },
      },
    })
  }

  const openProductReviewComments = (review: DrinkReview) => {
    navigate(`/product/${product.id}/review/${encodeURIComponent(review.id)}#comments`, {
      state: { bottomNavActive: "category" },
    })
  }

  const isReviewBookmarked = (review: DrinkReview) => {
    const postId = getPairingReviewPostId(review)
    if (Number.isFinite(postId)) return Boolean(bookmarkListById[postId])
    const reviewPostId = getDrinkReviewBookmarkPostId(review.id)
    if (!Number.isFinite(reviewPostId)) return false
    return Boolean(bookmarkListById[reviewPostId])
  }

  const openReviewBookmarkPicker = (review: DrinkReview) => {
    const postId = getPairingReviewPostId(review)

    if (Number.isFinite(postId)) {
      setBookmarkPicker({
        kind: "pairing",
        reviewId: review.id,
        postId,
        selectedListId: bookmarkListById[postId] ?? bookmarkLists[0]?.id ?? "default",
      })
      return
    }

    const reviewPostId = getDrinkReviewBookmarkPostId(review.id)
    if (!Number.isFinite(reviewPostId)) return
    setDrinkReviewBookmarkConfirm({ postId: reviewPostId, active: Boolean(bookmarkListById[reviewPostId]) })
  }

  const confirmDrinkReviewBookmark = () => {
    if (!drinkReviewBookmarkConfirm) return
    const nextActive = !drinkReviewBookmarkConfirm.active
    setBookmarkListById((prev) => ({
      ...prev,
      [drinkReviewBookmarkConfirm.postId]: nextActive ? (bookmarkLists[0]?.id ?? "default") : null,
    }))
    setBookmarkToastMessage(nextActive ? "저장했어요." : "저장을 취소했어요.")
    setDrinkReviewBookmarkConfirm(null)
  }

  const isBookmarkPickerActive = bookmarkPicker
    ? Boolean(bookmarkListById[bookmarkPicker.postId])
    : false

  const confirmBookmark = () => {
    if (!bookmarkPicker) return

    if (bookmarkPicker.kind === "pairing") {
      setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    } else {
      setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    }

    setBookmarkToastMessage("저장한 리스트에 추가했어요.")
    setBookmarkPicker(null)
  }

  const removeBookmark = () => {
    if (!bookmarkPicker) return

    if (bookmarkPicker.kind === "pairing") {
      setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    } else {
      setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    }

    setBookmarkPicker(null)
  }

  const cancelBookmark = () => setBookmarkPicker(null)

  const toggleProductSave = () => {
    setIsProductSaveConfirmActive(isProductSaved)
    setIsProductSaveConfirmOpen(true)
  }

  const confirmProductSave = () => {
    if (isProductSaveConfirmActive) {
      removeSavedAlcoholProductId(product.id)
      setIsProductSaved(false)
      setBookmarkToastMessage("저장을 취소했어요.")
      setIsProductSaveConfirmOpen(false)
      return
    }
    addSavedAlcoholProductId(product.id)
    setIsProductSaved(true)
    setBookmarkToastMessage("저장했어요.")
    setIsProductSaveConfirmOpen(false)
  }

  const showShareToast = () => {
    setShareToastMessage("현재 지원되지 않는 기능이에요.")
  }

  return (
    <section className="product_detail_page page_screen" aria-label="상품 상세">
      <div className="product_visual_intro">
        <header className="product_detail_header" aria-label="상단 메뉴">
          <button type="button" className="product_icon_button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
            <img src={iconCaretLeft} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="product_icon_button" aria-label="공유" onClick={showShareToast}>
            <img src={iconShare} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="product_hero" aria-label="상품 이미지">
          <img className="product_hero_image" src={imgProductHero} alt={product.name} />
        </div>
      </div>

      <section className="product_summary" aria-label="상품 요약">
        <div className="product_summary_top">
          <div className="product_summary_main">
            <p className="product_breadcrumb">
              {breadcrumbItems.map((item, index) => (
                <span className="product_breadcrumb_item" key={`${item}-${index}`}>
                  {index > 0 ? <img src={iconCaretRight} alt="" aria-hidden="true" /> : null}
                  <span>{item}</span>
                </span>
              ))}
            </p>
            <h1 className="product_title">{product.name}</h1>
            <div className="product_rating" aria-label={`평점 ${product.rating.toFixed(1)}점, 리뷰 ${reviewCount}개`}>
              <span className="product_rating_stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <img key={index} src={iconStar} alt="" />
                ))}
              </span>
              <span className="product_rating_value">{product.rating.toFixed(1)}</span>
              <span className="product_rating_count">({reviewCount})</span>
              <span className="product_rating_track" aria-hidden="true">
                ?끸쁾?끸쁾??              </span>
              <span className="product_rating_fill" style={{ width: ratingWidth }} aria-hidden="true">
                ?끸쁾?끸쁾??              </span>
            </div>
          </div>
          <button
            type="button"
            className="product_bookmark_button"
            aria-label={isProductSaved ? "상품 저장 취소" : "상품 저장"}
            aria-pressed={isProductSaved}
            onClick={toggleProductSave}
          >
            <img src={isProductSaved ? iconBookmarkActive : iconBookmark} alt="" aria-hidden="true" />
          </button>
        </div>
        <p className="product_price_row">
          <span>판매가격</span>
          <strong>{product.price}</strong>
        </p>
      </section>

      <nav className="product_tabs" aria-label="상세 탭" data-guide-id="product-detail-tabs">
        <div className="product_tabs_inner" ref={productTabsRef}>
          <span
            className="product_tabs_glider"
            aria-hidden="true"
            style={{ transform: `translateX(${productTabsGlider.x}px)`, width: `${productTabsGlider.width}px` }}
          />
          {tabItems.map((item) => (
            <button
              key={item}
              ref={(node) => {
                productTabButtonRefs.current[item] = node
              }}
              type="button"
              className={activeTab === item ? "is_active" : ""}
              onClick={() => changeActiveTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "상세정보" ? (
        <>
          <section className="product_card product_basic_info" aria-label="기본 정보">
            <h2>기본 정보</h2>
            <dl>
              {product.basicInfo.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="product_card product_taste" aria-label="Taste">
            <h2>Taste</h2>
            <div className="product_taste_rows">
              {product.tasteNotes.map((note) => (
                <div className="product_taste_row" key={note.label}>
                  <span className="product_taste_icon" aria-hidden="true">
                    <img src={tasteIconByLabel[note.label] ?? iconTasteTaste} alt="" />
                  </span>
                  <span className="product_taste_name">
                    <strong>{note.label}</strong>
                    <small>{note.subValue}</small>
                  </span>
                  <span className="product_taste_description">
                    <p>{note.value}</p>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="product_story" aria-label="Brand Story">
            <h2>Brand Story</h2>
            {product.brandStory.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <SakeGuideAccordion />

          <section className="product_purchase" aria-label="온라인 구매처">
            <div className="product_purchase_title_row">
              <h2>온라인 구매처</h2>
              <span>최저가 {bestOnlinePrice}~</span>
            </div>
            <div className="purchase_cards">
              {product.onlineShops.map((shop, index) => (
                <button className="purchase_card" type="button" key={shop.id} onClick={() => setPendingPurchaseShopName(shop.name)}>
                  <span className="purchase_thumb">
                    <img src={purchaseThumbs[index] ?? purchaseThumbs[0]} alt="" aria-hidden="true" />
                  </span>
                  <span className="purchase_text">
                    <strong>
                      <span className="purchase_shop_name">{shop.name}</span>
                      <span className="purchase_product_name">{shop.productName ?? product.name}</span>
                    </strong>
                    <small>{product.price}</small>
                    <span>
                      <b>{purchaseDiscounts[index] ?? purchaseDiscounts[0]}</b> {shop.price}
                    </span>
                    <em>{shop.delivery}</em>
                  </span>
                  <img className="purchase_arrow" src={iconCaretRight} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="product_offline" aria-label="오프라인 구매처">
            <h2>오프라인 구매처</h2>
            <div className="offline_empty">
              <p>
                현재 주변에는                <br />
                <strong>판매처를 찾지 못했어요</strong>
              </p>
              <img src={imgOfflineEmptyCharacter} alt="" aria-hidden="true" />
            </div>
          </section>
        </>
      ) : activeTab === "후기" ? (
        <section className="product_reviews" aria-label="주류 후기">
          <div className="review_score_summary">
            <div className="review_score_header">
              <strong>{product.rating.toFixed(1)}</strong>
              <span className="review_score_stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <img key={index} src={iconStar} alt="" />
                ))}
              </span>
              <span>리뷰 100+</span>
            </div>
            <div className="review_score_bars" aria-label="별점 분포">
              {reviewScoreRows.map((row) => (
                <div className="review_score_row" key={row.label}>
                  <span>{row.label}</span>
                  <i>
                    <b style={{ width: `${row.percent}%` }} />
                  </i>
                  <em>{row.count}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="review_gallery" aria-label="포토 리뷰 사진">
            {reviewGalleryPreviewImages.map((image, index) => (
              <button
                className="review_gallery_item"
                type="button"
                key={image}
                aria-label={index === reviewGalleryPreviewImages.length - 1 ? "사진 더보기" : `포토 리뷰 ${index + 1}`}
                onClick={() => {
                  if (index === reviewGalleryPreviewImages.length - 1) setIsPreparingModalOpen(true)
                }}
              >
                <img src={image} alt="" aria-hidden="true" />
                {index === reviewGalleryPreviewImages.length - 1 ? (
                  <span>
                    <strong>+99</strong>
                    사진 더보기                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="review_write_wrap">
            <button type="button" className="review_write_button" onClick={() => navigate(`/product/${product.id}/write`)}>
              <img src={iconPencil} alt="" aria-hidden="true" />
              글쓰기
            </button>
          </div>

          <div className="review_filter_bar">
            <label className="review_photo_filter">
              <input
                type="checkbox"
                checked={isPhotoReviewOnly}
                onChange={(event) => {
                  setIsPhotoReviewOnly(event.target.checked)
                  setReviewVisibleCount(REVIEW_PAGE_SIZE)
                }}
              />
              <span aria-hidden="true" />
              포토리뷰 모아보기
            </label>
            <button
              type="button"
              className="review_sort_button"
              onClick={() => {
                setSortSheetTarget("review")
                setIsReviewSortSheetOpen(true)
              }}
            >
              {reviewSortLabel}
              <img src={iconCaretDown} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="review_list">
            {visibleReviews.slice(0, reviewVisibleCount).map((review) => (
              <article
                id={`review-card-${encodeURIComponent(review.id)}`}
                className="review_card"
                key={review.id}
                role="link"
                tabIndex={0}
                onClick={() => openProductReviewDetail(review)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return
                  event.preventDefault()
                  openProductReviewDetail(review)
                }}
              >
                <div className="review_author_row">
                  <img className="review_profile" src={review.author.avatar || imgDefaultUserAvatar} alt="" aria-hidden="true" />
                  <div className="review_author_meta">
                    <p className="review_nickname">
                      <span className="review_author_name_grade">
                        <strong>{review.author.name}</strong>
                        <span>{review.author.grade}</span>
                        {isMyReviewAuthor(review.author.name, review.id) ? <span className="author_owner_badge">작성자</span> : null}
                      </span>
                      {isMyReviewAuthor(review.author.name, review.id) ? null : (
                        <button
                          type="button"
                          className={`${followedAuthorNames.has(review.author.name) ? "follow_toggle_button is_following" : "follow_toggle_button"} review_author_follow_button`}
                          aria-pressed={followedAuthorNames.has(review.author.name)}
                          onClick={(event) => {
                            event.stopPropagation()
                            requestToggleFollow(review.author.name)
                          }}
                        >
                          {followedAuthorNames.has(review.author.name) ? "언팔로우" : "팔로우"}
                        </button>
                      )}
                    </p>
                    <p className="review_user_desc">{review.author.preference}</p>
                    <p className="review_item_rating">
                      <span aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <img key={index} className={index < getFilledStarCount(review.rating) ? "" : "is_inactive"} src={iconStar} alt="" />
                        ))}
                      </span>
                      {review.rating}
                    </p>
                  </div>
                </div>

                {review.images.length > 0 ? (
                  <div className="review_card_photos">
                    {review.images.map((image) => (
                      <img key={image} src={image} alt="" aria-hidden="true" />
                    ))}
                  </div>
                ) : null}

                <div className="review_card_text">
                  <h2>{review.title}</h2>
                  <p>{review.body}</p>
                  <div className="review_tags">
                    {review.tags.map((tag) => (
                      <span key={tag}>#{normalizeHashTagValue(tag)}</span>
                    ))}
                  </div>
                </div>

                <div className="review_actions" onClick={(event) => event.stopPropagation()}>
                  <div className="review_actions_left">
                  <ProductReviewLikeButton
                    baseCount={review.likes}
                    isActive={Boolean(likedReviewIds[review.id])}
                    isAnimating={animatingReviewId === review.id}
                    onToggle={() => toggleReviewLike(review.id)}
                  />
                  <button
                    type="button"
                    className="review_comment_button"
                    aria-label="댓글 보기"
                    onClick={() => openProductReviewComments(review)}
                  >
                    <img src={iconChatDots} alt="" aria-hidden="true" />
                    {getProductReviewCommentCount(review)}
                  </button>
                  <button type="button" aria-label="공유" onClick={showShareToast}>
                    <img src={iconSharePoint} alt="" aria-hidden="true" />
                  </button>
                  </div>
                  <button
                    type="button"
                    aria-label={isReviewBookmarked(review) ? "저장 취소" : "저장"}
                    aria-pressed={isReviewBookmarked(review)}
                    onClick={() => openReviewBookmarkPicker(review)}
                  >
                    <img src={isReviewBookmarked(review) ? iconBookmarkActive : iconBookmarkPoint} alt="" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {reviewVisibleCount < visibleReviews.length ? (
            <button
              type="button"
              className="review_more_button"
              onClick={() => setReviewVisibleCount((prev) => Math.min(visibleReviews.length, prev + REVIEW_PAGE_SIZE))}
            >
              후기 더보기            </button>
          ) : null}
        </section>
      ) : (
        <section className="product_pairing_panel" aria-label="페어링 추천">
          <div className="product_pairing_food" aria-label="페어링 추천">
            <h2 className="product_pairing_title">페어링 추천</h2>
            <div className="product_pairing_food_box">
              <div className="product_pairing_food_item">
                <img src={imgFoodMatch1} alt="" aria-hidden="true" />
                <span>사시미 / 숙성회</span>
              </div>
              <div className="product_pairing_food_item">
                <img src={imgFoodMatch2} alt="" aria-hidden="true" />
                <span>연어 / 관자 / 해산물</span>
              </div>
              <div className="product_pairing_food_item">
                <img src={imgFoodMatch3} alt="" aria-hidden="true" />
                <span>튀김류 / 일식</span>
              </div>
            </div>
          </div>

          <div className="product_related_section" aria-label="관련 콘텐츠">
            <div className="product_related_header">
              <h2>관련 콘텐츠</h2>
            </div>
            <div className="review_filter_bar pairing_filter_bar">
              <label className="review_photo_filter">
                <input
                  type="checkbox"
                  checked={isPairingPhotoOnly}
                  onChange={(event) => {
                    setIsPairingPhotoOnly(event.target.checked)
                    setPairingVisibleCount(REVIEW_PAGE_SIZE)
                  }}
                />
                <span aria-hidden="true" />
                포토리뷰 모아보기
              </label>
              <button
                type="button"
                className="review_sort_button"
                onClick={() => {
                  setSortSheetTarget("pairing")
                  setIsReviewSortSheetOpen(true)
                }}
              >
                {pairingSortLabel}
                <img src={iconCaretDown} alt="" aria-hidden="true" />
              </button>
            </div>
            <div className="product_related_list">
              {visiblePairingReviews.slice(0, pairingVisibleCount).map((review) => (
                <article
                  className="pairing_review_card"
                  key={review.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openPairingReviewDetail(review)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return
                    event.preventDefault()
                    openPairingReviewDetail(review)
                  }}
                >
                  <div className="review_author_row">
                    <img className="review_profile" src={review.author.avatar || imgDefaultUserAvatar} alt="" aria-hidden="true" />
                    <div className="review_author_meta">
                      <p className="review_nickname">
                        <span className="review_author_name_grade">
                          <strong>{review.author.name}</strong>
                          <span>{review.author.grade}</span>
                          {isMyReviewAuthor(review.author.name, review.id) ? <span className="author_owner_badge">작성자</span> : null}
                        </span>
                        {isMyReviewAuthor(review.author.name, review.id) ? null : (
                          <button
                            type="button"
                            className={`${followedAuthorNames.has(review.author.name) ? "follow_toggle_button is_following" : "follow_toggle_button"} review_author_follow_button`}
                            aria-pressed={followedAuthorNames.has(review.author.name)}
                            onClick={(event) => {
                              event.stopPropagation()
                              requestToggleFollow(review.author.name)
                            }}
                          >
                            {followedAuthorNames.has(review.author.name) ? "언팔로우" : "팔로우"}
                          </button>
                        )}
                      </p>
                      <p className="review_user_desc">{review.author.preference}</p>
                    </div>
                  </div>

                  {review.images.length > 0 ? (
                    <div className="pairing_card_photos">
                      {review.images.map((image) => (
                        <img key={image} src={image} alt="" aria-hidden="true" />
                      ))}
                    </div>
                  ) : null}

                  <div className="pairing_card_text">
                    <h2>{review.title}</h2>
                    <div className="pairing_drink_chips">
                      {review.alcoholTag ? (
                        <Link
                          className="pairing_chip_alcohol"
                          to="/community/tag"
                          state={{ tagType: "liquor", tagValue: review.alcoholTag, bottomNavActive: "category" }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {review.alcoholTag}
                        </Link>
                      ) : null}
                      {review.foodTag ? (
                        <Link
                          className="pairing_chip_food"
                          to="/community/tag"
                          state={{ tagType: "food", tagValue: review.foodTag, bottomNavActive: "category" }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {review.foodTag}
                        </Link>
                      ) : null}
                    </div>
                    <p>{review.body}</p>
                  </div>

                  <div className="pairing_card_meta">
                    <div className="community_review_hashtags" aria-label="해시태그">
                      {review.tags.map((tag) => (
                        <span key={tag}>#{normalizeHashTagValue(tag)}</span>
                      ))}
                    </div>
                    {review.location ? (
                      <div className="community_review_location">
                        <img className="community_review_location_icon" src={iconLocation} alt="" aria-hidden="true" />
                        <span>{review.location}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="pairing_card_actions" onClick={(event) => event.stopPropagation()}>
                    <div className="pairing_card_actions_left">
                      <ProductReviewLikeButton
                        baseCount={review.likes}
                        isActive={Boolean(likedReviewIds[review.id])}
                        isAnimating={animatingReviewId === review.id}
                        onToggle={() => toggleReviewLike(review.id)}
                      />
                      <span>
                        <img src={iconChatDots} alt="" aria-hidden="true" />
                        {getProductReviewCommentCount(review)}
                      </span>
                      <button type="button" aria-label="공유" onClick={showShareToast}>
                        <img src={iconSharePoint} alt="" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={isReviewBookmarked(review) ? "저장 취소" : "저장"}
                      aria-pressed={isReviewBookmarked(review)}
                      onClick={() => openReviewBookmarkPicker(review)}
                    >
                      <img src={isReviewBookmarked(review) ? iconBookmarkActive : iconBookmarkPoint} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {pairingVisibleCount < visiblePairingReviews.length ? (
            <div className="pairing_more_wrap">
              <button
                type="button"
                className="review_more_button"
                onClick={() => setPairingVisibleCount((prev) => Math.min(visiblePairingReviews.length, prev + REVIEW_PAGE_SIZE))}
              >
                페어링 추천 더보기              </button>
            </div>
          ) : null}
        </section>
      )}

      {bookmarkPicker ? (
        <CommunityBookmarkPickerModal
          ariaLabel="북마크 리스트 선택"
          titleText={isBookmarkPickerActive ? "저장한 게시글을 취소할까요?" : "게시글을 저장할까요?"}
          helperText={
            isBookmarkPickerActive
              ? <>취소하면 마이정보 &gt; 저장한 리스트에서<br />이 게시글이 사라집니다.</>
              : <>저장한 게시글은 마이정보 &gt; 저장한 리스트에서<br />확인할 수 있어요.</>
          }
          secondaryLabel="취소"
          primaryLabel={isBookmarkPickerActive ? "저장 취소하기" : "저장하기"}
          onDismiss={cancelBookmark}
          onSecondary={cancelBookmark}
          onPrimary={isBookmarkPickerActive ? removeBookmark : confirmBookmark}
        />
      ) : null}

      {pendingUnfollowName ? (
        <PurchaseConfirmModal
          ariaLabel="언팔로우 확인"
          message={`${pendingUnfollowName}님을 언팔로우하시겠어요?`}
          cancelLabel="취소"
          confirmLabel="언팔로우"
          onCancel={() => setPendingUnfollowName(null)}
          onConfirm={confirmUnfollow}
        />
      ) : null}

      {pendingPurchaseShopName ? (
        <PurchaseConfirmModal
          ariaLabel="온라인 구매처 이동 확인"
          message={
            <>
              {pendingPurchaseShopName} 사이트로 이동하시겠어요?
              <br />
              현재는 목업이라 실제로 이동하지 않아요.
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setPendingPurchaseShopName(null)}
          onConfirm={() => setPendingPurchaseShopName(null)}
        />
      ) : null}

      {isProductSaveConfirmOpen ? (
        <PurchaseConfirmModal
          ariaLabel="주류 저장 확인"
          message={
            <>
              {isProductSaveConfirmActive ? "저장한 술을 삭제할까요?" : "술을 저장할까요?"}
              {isProductSaveConfirmActive ? null : (
                <>
                  <br />
                  저장한 술은 내정보 &gt; 주류상품에서 보실 수 있어요
                </>
              )}
            </>
          }
          cancelLabel="취소"
          confirmLabel={isProductSaveConfirmActive ? "삭제하기" : "저장"}
          onCancel={() => setIsProductSaveConfirmOpen(false)}
          onConfirm={confirmProductSave}
        />
      ) : null}

      {drinkReviewBookmarkConfirm ? (
        <PurchaseConfirmModal
          ariaLabel="주류 후기 저장 확인"
          message={
            <>
              {drinkReviewBookmarkConfirm.active ? "저장한 주류 후기를 삭제할까요?" : "주류 후기를 저장할까요?"}
              {drinkReviewBookmarkConfirm.active ? null : (
                <>
                  <br />
                  저장한 후기는 내정보 &gt; 기록 &gt; 주류후기에서 볼 수 있어요
                </>
              )}
            </>
          }
          cancelLabel="취소"
          confirmLabel={drinkReviewBookmarkConfirm.active ? "삭제하기" : "저장"}
          onCancel={() => setDrinkReviewBookmarkConfirm(null)}
          onConfirm={confirmDrinkReviewBookmark}
        />
      ) : null}

      {isPreparingModalOpen ? (
        <AlertModal
          title={"아직 준비 중인 서비스입니다.\n곧 만나보실 수 있어요."}
          confirmLabel="닫기"
          variant="preparing"
          onConfirm={() => setIsPreparingModalOpen(false)}
        />
      ) : null}

      {isReviewSortSheetOpen ? (
        <div className="product_review_sort_overlay" role="presentation" onClick={() => setIsReviewSortSheetOpen(false)}>
          <section
            className="product_review_sort_sheet"
            aria-label="후기 정렬"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="product_review_sort_handle" aria-hidden="true" />
            <div className="product_review_sort_options">
              {reviewSortItems.map((item) => {
                const activeSort = sortSheetTarget === "pairing" ? pairingSort : reviewSort
                const isActive = item.key === activeSort
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={isActive ? "product_review_sort_option is_active" : "product_review_sort_option"}
                    onClick={() => {
                      if (sortSheetTarget === "pairing") {
                        setPairingSort(item.key)
                        setPairingVisibleCount(REVIEW_PAGE_SIZE)
                      } else {
                        setReviewSort(item.key)
                        setReviewVisibleCount(REVIEW_PAGE_SIZE)
                      }
                      setIsReviewSortSheetOpen(false)
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive ? <span className="product_review_sort_check" aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
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


