import { useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import AlertModal from "../components/AlertModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import ProductReviewLikeButton from "../components/ProductReviewLikeButton"
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
import iconBookmark from "../assets/svg/bookmarksimple.svg"
import iconCaretDown from "../assets/svg/caretdown.png"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconCaretRight from "../assets/svg/caretright.svg"
import iconChatDots from "../assets/svg/chatcircledots_p.svg"
import iconPencil from "../assets/svg/pencilsimple_p.svg"
import iconShare from "../assets/svg/sharenetwork.svg"
import iconSharePoint from "../assets/svg/sharenetwork_p.svg"
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
import { productDetailPageData } from "../data/productDetailData"
import { drinkReviews } from "../data/productReviewsMock"
import { useProductReviewInteractions } from "../hooks/useProductReviewInteractions"
import { getVisibleProductReviews } from "../utils/productReviews"
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
const tasteIconByLabel: Record<string, string> = {
  Aroma: iconTasteAroma,
  Taste: iconTasteTaste,
  Finish: iconTasteFinish,
}

export default function ProductDetail() {
  const { mockProductById, defaultProduct } = productDetailPageData
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get("tab") === "pairing" ? "페어링추천" : searchParams.get("tab") === "review" ? "후기" : "술정보"
  const [activeTab, setActiveTab] = useState<(typeof tabItems)[number]>(initialTab)
  const [pendingPurchaseShopName, setPendingPurchaseShopName] = useState<string | null>(null)
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false)
  const [isPhotoReviewOnly, setIsPhotoReviewOnly] = useState(false)
  const [reviewSort, setReviewSort] = useState<ReviewSortKey>("latest")
  const [isReviewSortSheetOpen, setIsReviewSortSheetOpen] = useState(false)
  const [reviewVisibleCount, setReviewVisibleCount] = useState(4)
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

  const pairingReviews = useMemo(
    () => drinkReviews.filter((review) => review.alcoholTag === product.name),
    [product.name]
  )
  const ratingWidth = `${Math.max(0, Math.min(100, (product.rating / 5) * 100))}%`
  const bestOnlinePrice = product.onlineShops[0]?.price ?? product.price
  const breadcrumbItems = product.breadcrumb.split(">").map((item) => item.trim()).filter(Boolean)
  const reviewSortLabel = reviewSortItems.find((item) => item.key === reviewSort)?.label ?? "최신순"
  const visibleReviews = useMemo(
    () => getVisibleProductReviews(drinkReviews, { photoOnly: isPhotoReviewOnly, sortKey: reviewSort }),
    [isPhotoReviewOnly, reviewSort],
  )

  return (
    <section className="product_detail_page page_screen" aria-label="상품 상세">
      <div className="product_visual_intro">
        <header className="product_detail_header" aria-label="상단 메뉴">
          <button type="button" className="product_icon_button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
            <img src={iconCaretLeft} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="product_icon_button" aria-label="공유">
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
                ★★★★★
              </span>
              <span className="product_rating_fill" style={{ width: ratingWidth }} aria-hidden="true">
                ★★★★★
              </span>
            </div>
          </div>
          <button type="button" className="product_bookmark_button" aria-label="상품 저장">
            <img src={iconBookmark} alt="" aria-hidden="true" />
          </button>
        </div>
        <p className="product_price_row">
          <span>판매정가</span>
          <strong>{product.price}</strong>
        </p>
      </section>

      <nav className="product_tabs" aria-label="상세 탭">
        <div className="product_tabs_inner">
          {tabItems.map((item) => (
            <button key={item} type="button" className={activeTab === item ? "is_active" : ""} onClick={() => setActiveTab(item)}>
              {item}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "술정보" ? (
        <>
          <section className="product_card product_basic_info" aria-label="기본 정보">
            <h2>기본정보</h2>
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
                현재 주변에
                <br />
                <strong>살만한 곳을 찾지 못했어요</strong>
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
            {reviewGalleryImages.map((image, index) => (
              <button
                className="review_gallery_item"
                type="button"
                key={image}
                aria-label={index === reviewGalleryImages.length - 1 ? "사진 더보기" : `포토 리뷰 ${index + 1}`}
                onClick={() => {
                  if (index === reviewGalleryImages.length - 1) setIsPreparingModalOpen(true)
                }}
              >
                <img src={image} alt="" aria-hidden="true" />
                {index === reviewGalleryImages.length - 1 ? (
                  <span>
                    <strong>+99</strong>
                    사진 더보기
                  </span>
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
              <input type="checkbox" checked={isPhotoReviewOnly} onChange={(event) => setIsPhotoReviewOnly(event.target.checked)} />
              <span aria-hidden="true" />
              포토리뷰 모아보기
            </label>
            <button type="button" className="review_sort_button" onClick={() => setIsReviewSortSheetOpen(true)}>
              {reviewSortLabel}
              <img src={iconCaretDown} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="review_list">
            {visibleReviews.slice(0, reviewVisibleCount).map((review) => (
              <article className="review_card" key={review.id}>
                <div className="review_author_row">
                  {"avatar" in review.author && review.author.avatar ? (
                    <img className="review_profile" src={review.author.avatar} alt="" aria-hidden="true" />
                  ) : (
                    <span className="review_profile" aria-hidden="true" />
                  )}
                  <div className="review_author_meta">
                    <p className="review_nickname">
                      <strong>{review.author.name}</strong>
                      <span>{review.author.grade}</span>
                      <i>ㆍ</i>
                      <button
                        type="button"
                        className={followedAuthorNames.has(review.author.name) ? "follow_toggle_button is_following" : "follow_toggle_button"}
                        aria-pressed={followedAuthorNames.has(review.author.name)}
                        onClick={() => requestToggleFollow(review.author.name)}
                      >
                        {followedAuthorNames.has(review.author.name) ? "언팔로우" : "팔로우"}
                      </button>
                    </p>
                    <p className="review_user_desc">{review.author.preference}</p>
                    <p className="review_item_rating">
                      <span aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <img key={index} src={iconStar} alt="" />
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
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="review_actions">
                  <ProductReviewLikeButton
                    baseCount={review.likes}
                    isActive={Boolean(likedReviewIds[review.id])}
                    isAnimating={animatingReviewId === review.id}
                    onToggle={() => toggleReviewLike(review.id)}
                  />
                  <span>
                    <img src={iconChatDots} alt="" aria-hidden="true" />
                    {review.comments}
                  </span>
                  <button type="button" aria-label="공유">
                    <img src={iconSharePoint} alt="" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {reviewVisibleCount < visibleReviews.length ? (
            <button type="button" className="review_more_button" onClick={() => setReviewVisibleCount((prev) => prev + 1)}>
              후기 더보기
            </button>
          ) : null}
        </section>
      ) : (
        <section className="product_pairing_panel" aria-label="페어링 추천">
          <div className="product_pairing_food" aria-label="페어링추천">
            <h2 className="product_pairing_title">페어링추천</h2>
            <div className="product_pairing_food_box">
              <div className="product_pairing_food_item">
                <img src={imgFoodMatch1} alt="" aria-hidden="true" />
                <span>사시미 / 숙성회</span>
              </div>
              <div className="product_pairing_food_item">
                <img src={imgFoodMatch2} alt="" aria-hidden="true" />
                <span>우니 / 관자 / 해산물</span>
              </div>
              <div className="product_pairing_food_item">
                <img src={imgFoodMatch3} alt="" aria-hidden="true" />
                <span>담백한 일식</span>
              </div>
            </div>
          </div>

          <div className="product_related_section" aria-label="연관컨텐츠">
            <div className="product_related_header">
              <h2>연관컨텐츠</h2>
            </div>
            <div className="product_related_list">
              {pairingReviews.map((review) => (
                <article className="pairing_review_card" key={review.id}>
                  <div className="review_author_row">
                    <img className="review_profile" src={review.author.avatar} alt="" aria-hidden="true" />
                    <div className="review_author_meta">
                      <p className="review_nickname">
                        <strong>{review.author.name}</strong>
                        <span>{review.author.grade}</span>
                        <i>ㆍ</i>
                        <button
                          type="button"
                          className={followedAuthorNames.has(review.author.name) ? "follow_toggle_button is_following" : "follow_toggle_button"}
                          aria-pressed={followedAuthorNames.has(review.author.name)}
                          onClick={() => requestToggleFollow(review.author.name)}
                        >
                          {followedAuthorNames.has(review.author.name) ? "언팔로우" : "팔로우"}
                        </button>
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
                      {review.alcoholTag ? <span className="pairing_chip_alcohol">{review.alcoholTag}</span> : null}
                      {review.foodTag ? <span className="pairing_chip_food">{review.foodTag}</span> : null}
                    </div>
                    <p>{review.body}</p>
                  </div>

                  <div className="pairing_card_meta">
                    <div className="review_tags">
                      {review.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    {review.location ? (
                      <div className="pairing_location">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                          <path d="M9 1.5C6.51472 1.5 4.5 3.51472 4.5 6C4.5 9.75 9 16.5 9 16.5C9 16.5 13.5 9.75 13.5 6C13.5 3.51472 11.4853 1.5 9 1.5ZM9 8.25C7.75736 8.25 6.75 7.24264 6.75 6C6.75 4.75736 7.75736 3.75 9 3.75C10.2426 3.75 11.25 4.75736 11.25 6C11.25 7.24264 10.2426 8.25 9 8.25Z" fill="#6e6e6e" />
                        </svg>
                        <span>{review.location}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="pairing_card_actions">
                    <div className="pairing_card_actions_left">
                      <ProductReviewLikeButton
                        baseCount={review.likes}
                        isActive={Boolean(likedReviewIds[review.id])}
                        isAnimating={animatingReviewId === review.id}
                        onToggle={() => toggleReviewLike(review.id)}
                      />
                      <span>
                        <img src={iconChatDots} alt="" aria-hidden="true" />
                        {review.comments}
                      </span>
                      <button type="button" aria-label="공유">
                        <img src={iconSharePoint} alt="" aria-hidden="true" />
                      </button>
                    </div>
                    <button type="button" aria-label="저장">
                      <img src={iconBookmark} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="pairing_more_wrap">
            <button type="button" className="review_more_button" onClick={() => setIsPreparingModalOpen(true)}>
              페어링 추천 더보기
            </button>
          </div>
        </section>
      )}

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
          message={`${pendingPurchaseShopName} 사이트로 이동하시겠어요? 현재는 목업이라 실제로 이동하지 않아요.`}
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setPendingPurchaseShopName(null)}
          onConfirm={() => {
            setPendingPurchaseShopName(null)
            setIsPreparingModalOpen(true)
          }}
        />
      ) : null}

      {isPreparingModalOpen ? (
        <AlertModal
          title={"아직 준비 중인 서비스 입니다\n곧 만나뵐 수 있어용"}
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
                const isActive = item.key === reviewSort
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={isActive ? "product_review_sort_option is_active" : "product_review_sort_option"}
                    onClick={() => {
                      setReviewSort(item.key)
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

      <button className="product_scroll_top" type="button" aria-label="맨 위로 이동" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑
      </button>
    </section>
  )
}
