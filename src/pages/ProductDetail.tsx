import { useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import AlertModal from "../components/AlertModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import ProductReviewLikeButton from "../components/ProductReviewLikeButton"
import SakeGuideAccordion from "../components/SakeGuideAccordion"
import imgDrinkReviewProfile1 from "../assets/fd_drink_review_profile1.png"
import imgDrinkReviewProfile2 from "../assets/fd_drink_review_profile2.png"
import imgDrinkReviewProfile3 from "../assets/fd_drink_review_profile3.png"
import imgDrinkReviewProfile4 from "../assets/fd_drink_review_profile4.png"
import imgDrinkReviewProfile5 from "../assets/fd_drink_review_profile5.png"
import imgDrinkReview1 from "../assets/fd_drink_review_img1.png"
import imgDrinkReview2 from "../assets/fd_drink_review_img2.png"
import imgDrinkReview3 from "../assets/fd_drink_review_img3.png"
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
import { useProductDetailPageData } from "../hooks/useProductDetailPageData"
import { useProductReviewInteractions } from "../hooks/useProductReviewInteractions"
import { type DrinkReview, getVisibleProductReviews } from "../utils/productReviews"
import "../styles/product-detail.css"
import imgFoodMatch1 from "../assets/fd_food_match1.svg"
import imgFoodMatch2 from "../assets/fd_food_match2.svg"
import imgFoodMatch3 from "../assets/fd_food_match3.svg"
import imgPairingReview1_1 from "../assets/fd_pairing_review_img1_1.png"
import imgPairingReview2_1 from "../assets/fd_pairing_review_img2_1.png"
import imgPairingReview2_2 from "../assets/fd_pairing_review_img2_2.png"

const tabItems = productDetailTabItems
const reviewCount = productReviewCount
const purchaseThumbs = [imgPurchaseThumb1, imgPurchaseThumb2, imgPurchaseThumb3]
const purchaseDiscounts = productPurchaseDiscounts
const reviewGalleryImages = [imgGallery1, imgGallery2, imgGallery3, imgGallery4]
const reviewSortItems = productReviewSortItems
type ReviewSortKey = (typeof reviewSortItems)[number]["key"]
const reviewScoreRows = productReviewScoreRows
const drinkReviews: DrinkReview[] = [
  {
    id: "review-photo-1",
    title: "과일향이 은근하게 오래 남는 한 잔",
    body:
      "첫 향에서 배랑 멜론 같은 산뜻한 느낌이 살짝 올라오고, 마셨을 때 단맛이 과하게 남지 않아서 좋았어요. 차갑게 두고 천천히 마시니까 향이 더 또렷해졌고, 회나 담백한 안주랑 같이 두면 장점이 잘 살아나는 술이었습니다.",
    tags: ["#과일향", "#깔끔함", "#프리미엄", "#드라이"],
    images: [],
    likes: 542,
    comments: 253,
    rating: "5.0",
    createdAt: "2026-05-10T12:00:00+09:00",
    recommendScore: 98,
    author: {
      name: "순대렐라",
      grade: "테이스터",
      preference: "20대 / 여 / 사케, 화이트와인 / 은은한 과일향 선호",
      avatar: imgDrinkReviewProfile1,
    },
  },
  {
    id: "review-text-1",
    title: "회식 자리 분위기까지 좋아졌던 사케",
    body:
      "회식 자리에서 마셨는데 생각보다 훨씬 부담 없이 잘 들어갔어요. 향이 과하게 튀지 않고 드라이하게 정리돼서 술 잘 못 마시는 사람들도 반응이 괜찮았습니다. 가격대는 있지만 깔끔한 맛 덕분에 기름진 안주랑도 잘 어울렸어요.",
    tags: ["#과일향", "#부드러움"],
    images: [imgDrinkReview3],
    likes: 235,
    comments: 58,
    rating: "5.0",
    createdAt: "2026-05-12T09:00:00+09:00",
    recommendScore: 78,
    author: {
      name: "벼랑위의 당뇨",
      grade: "소믈리에",
      preference: "30대 / 남 / 사케, 와인 / 깔끔하고 드라이한 맛 선호",
      avatar: imgDrinkReviewProfile4,
    },
  },
  {
    id: "review-text-2",
    title: "입문자도 편하게 마실 수 있었어요",
    body:
      "사케를 자주 마시는 편은 아닌데 첫 잔부터 부담이 크지 않았어요. 단맛이 아주 강한 타입은 아니지만 목넘김이 부드러워서 천천히 마시기 좋았고, 끝에 남는 쌀향도 깔끔해서 입문용으로 추천하고 싶습니다.",
    tags: ["#과일향", "#부드러움"],
    images: [],
    likes: 235,
    comments: 58,
    rating: "5.0",
    createdAt: "2026-05-09T18:00:00+09:00",
    recommendScore: 84,
    author: {
      name: "이웃집 또터러",
      grade: "입문러",
      preference: "20대 / 남 / 사케 / 부담 없는 단맛과 부드러운 목넘김 선호",
      avatar: imgDrinkReviewProfile3,
    },
  },
  {
    id: "review-photo-2",
    title: "음식이랑 먹을 때 더 매력적이에요",
    body:
      "그냥 마셔도 괜찮지만 음식이랑 같이 먹을 때 훨씬 좋았어요. 생선구이나 가벼운 튀김처럼 기름기가 있는 안주를 깔끔하게 잡아주고, 향은 튀지 않아서 식사 흐름을 방해하지 않았습니다.",
    tags: ["#드라이", "#깔끔함"],
    images: [imgDrinkReview1, imgDrinkReview2],
    likes: 198,
    comments: 41,
    rating: "5.0",
    createdAt: "2026-05-11T21:00:00+09:00",
    recommendScore: 91,
    author: {
      name: "엄마곗돈",
      grade: "리뷰어",
      preference: "30대 / 여 / 사케, 맥주 / 음식과 잘 맞는 깔끔한 술 선호",
      avatar: imgDrinkReviewProfile2,
    },
  },
  {
    id: "review-text-3",
    title: "산뜻한 향 뒤에 여운이 길게 남아요",
    body:
      "처음에는 산뜻하고 깨끗한 인상이 강한데, 마시고 나면 쌀의 단정한 여운이 생각보다 길게 남습니다. 위스키처럼 강한 임팩트보다 균형 잡힌 향과 마무리를 보는 분들에게 잘 맞을 것 같아요.",
    tags: ["#과일향", "#부드러움"],
    images: [],
    likes: 235,
    comments: 58,
    rating: "5.0",
    createdAt: "2026-05-08T16:30:00+09:00",
    recommendScore: 72,
    author: {
      name: "달려야하니",
      grade: "탐험가",
      preference: "40대 / 남 / 사케, 위스키 / 산뜻한 향과 긴 여운 선호",
      avatar: imgDrinkReviewProfile5,
    },
  },
  {
    id: "pairing-review-1",
    title: "닷사이의 은은한 단맛과 우니의 진한 고소함",
    body: "닷사이23이 우니 특유의 진하고 바다향 강한 맛을 깔끔하게 정리해줘서 생각보다 훨씬 밸런스가 좋았어요. 은은한 단맛이 우니의 고소함이랑 자연스럽게 이어지고 끝맛이 깨끗해서 느끼하지 않게 계속 들어가는 느낌이었습니다. 가격대는 있는 조합이지만 조용한 이자카야나 분위기 있는 자리에서 먹으면 만족감 꽤 높은 페어링 같아요.",
    tags: ["#사케", "#비오는날"],
    images: [imgPairingReview1_1],
    likes: 542,
    comments: 253,
    rating: "5.0",
    createdAt: "2026-05-07T14:00:00+09:00",
    recommendScore: 95,
    alcoholTag: "닷사이 23",
    foodTag: "우니",
    location: "이자카야 유메",
    author: {
      name: "옹심이",
      grade: "셀렉터",
      preference: "50대 / 남 / 막걸리 / 달달하고 부드러운 맛 선호",
      avatar: imgDrinkReviewProfile3,
    },
  },
  {
    id: "pairing-review-2",
    title: "회식에서 부담없이 계속 마시기 좋음",
    body: "닷사이23이 사시미의 담백한 감칠맛을 깔끔하게 정리해줘서 회식 자리에서 부담 없이 계속 마시기 좋았어요. 향이 과하게 튀지 않아서 음식 흐름을 깨지 않고 자연스럽게 이어지고, 끝맛이 깨끗해서 기름진 부위 먹고 나서도 입안이 무겁지 않았습니다. 특히 방어나 도미 같은 흰살생선이랑 궁합이 좋았고, 술 잘 못 마시는 사람들도 부드럽게 넘어간다고 반응 괜찮았어요. 가격대는 있는 편이지만 분위기 있는 회식 자리에서 오늘 술 잘 골랐다는 얘기 나오기 좋은 조합 같습니다.",
    tags: ["#사케", "#회식"],
    images: [imgPairingReview2_1, imgPairingReview2_2],
    likes: 50,
    comments: 10,
    rating: "5.0",
    createdAt: "2026-05-06T11:00:00+09:00",
    recommendScore: 88,
    alcoholTag: "닷사이 23",
    foodTag: "사시미",
    location: "이자카야 와사비",
    author: {
      name: "사케가 좋아",
      grade: "셀렉터",
      preference: "40대 / 남 / 사케 / 깔끔하고 부드러운 맛 선호",
      avatar: imgDrinkReviewProfile4,
    },
  },
]
const tasteIconByLabel: Record<string, string> = {
  Aroma: iconTasteAroma,
  Taste: iconTasteTaste,
  Finish: iconTasteFinish,
}

export default function ProductDetail() {
  const { mockProductById, defaultProduct } = useProductDetailPageData()
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
