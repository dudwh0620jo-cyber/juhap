import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import ProductDetailHeader from "../components/ProductDetailHeader"
import ProductTabs, { type DetailTab } from "../components/ProductTabs"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import ReviewCard, { type ReviewCardData } from "../components/ReviewCard"
import SpecSection, { type PurchaseShop } from "../components/SpecSection"
import "../styles/product-detail.css"

type ProductSpec = {
  type: string
  volume: string
  abv: string
  country: string
  region: string
  grape: string
  case: string
}

type TasteScore = {
  label: string
  value: number
}

type TastingNote = {
  title: string
  items: Array<{ label: string; value: string }>
}

type PairingChip = {
  id: string
  label: string
}

type ProductDetailData = {
  breadcrumb: string
  name: string
  price: string
  spec: ProductSpec
  taste: TasteScore[]
  tastingNotes: TastingNote
  descriptionTitle: string
  descriptionBody: string
  purchase: PurchaseShop[]
  alcoholReviews: ReviewCardData[]
  pairingReviews: ReviewCardData[]
  pairingChips: PairingChip[]
}

const mockProductById: Record<string, ProductDetailData> = {
  "caymus-2023-1": {
    breadcrumb: "와인 > 레드와인(미국)",
    name: "케이머스 나파 밸리 카버네 소비뇽 2023",
    price: "138,000원",
    spec: {
      type: "레드 와인",
      volume: "750ml",
      abv: "14.6%",
      country: "미국",
      region: "나파 밸리",
      grape: "카버네 소비뇽(100%)",
      case: "없음",
    },
    taste: [
      { label: "바디", value: 5 },
      { label: "타닌", value: 4 },
      { label: "당도", value: 2 },
      { label: "산미", value: 3 },
    ],
    tastingNotes: {
      title: "Tasting Notes",
      items: [
        { label: "Aroma", value: "허브, 스파이스, 바이올렛, 바닐라, 오크" },
        { label: "Taste", value: "블랙베리, 자두, 다크 체리, 블랙커런트" },
        { label: "Finish", value: "코코아, 초콜릿, 타바코, 가죽" },
      ],
    },
    descriptionTitle: "나파 밸리의 정수를 담은 기념비적 까베르네",
    descriptionBody:
      "'케이머스 나파 밸리 카버네 소비뇽 50주년 에디션'은 카버네 소비뇽 생산 50년을 기념해 출시된 한정 레드 와인입니다.\n\n나파 밸리의 8개 지역에서 수확한 포도를 블렌딩해 복합적인 구조와 활달같은 균형을 이룹니다.\n\n비옥한 토양, 무라카 층반, 낮은 수확량, 완전한 숙성까지의 기다림이 '케이머스 스타일'의 핵심을 이룹니다.",
    purchase: [
      { id: "shop-1", name: "데일리샷", delivery: "무료배송", price: "138,000원", badge: "와인", url: "https://example.com/dailyshot" },
      { id: "shop-2", name: "와인나라", delivery: "오늘출발", price: "141,000원", badge: "와인", url: "https://example.com/winenara" },
    ],
    alcoholReviews: [
      {
        id: "r1",
        userName: "A씨",
        userMeta: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "스테이크",
        body: "스테이크랑 케이머스 나파 밸리 카버네 소비뇽랑 먹었는데 맛있다. 어쩌고 저쩌고 산미가 어쩌고...",
        likeCount: 847,
        commentCount: 124,
      },
      {
        id: "r2",
        userName: "B씨",
        userMeta: "20대 / 남 / 와인, 맥주 / 바디감 묵직한 편 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "파스타",
        body: "홈데이트 어쩌고저쩌고 와인이 파스타랑 분위기 어쩌고 맛은 어쩌고 ~",
        likeCount: 847,
        commentCount: 124,
      },
    ],
    pairingReviews: [
      {
        id: "pr1",
        rankingId: "pairing-1",
        userName: "A씨",
        userMeta: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "스테이크",
        body: "고기 지방의 고소함을 탄닌이 잡아줘서 밸런스가 좋았어요. 굽기나 소스에 따라 느낌이 달라져서 재밌습니다.",
        likeCount: 421,
        commentCount: 67,
      },
      {
        id: "pr2",
        rankingId: "pairing-2",
        userName: "B씨",
        userMeta: "20대 / 남 / 와인, 맥주 / 바디감 묵직한 편 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "파스타",
        body: "토마토/크림 소스에 따라 어울림이 달랐는데, 산미 있는 소스일수록 더 깔끔하게 느껴졌어요.",
        likeCount: 508,
        commentCount: 92,
      },
    ],
    pairingChips: [
      { id: "meat", label: "고기" },
      { id: "bbq", label: "바베큐" },
      { id: "pasta", label: "파스타" },
    ],
  },
}

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [tab, setTab] = useState<DetailTab>("spec")
  const [purchaseConfirmShop, setPurchaseConfirmShop] = useState<PurchaseShop | null>(null)

  const product = useMemo(() => {
    if (id && mockProductById[id]) return mockProductById[id]
    return mockProductById["caymus-2023-1"]
  }, [id])

  const initialLikeCounts = useMemo(() => {
    const items = [...product.alcoholReviews, ...product.pairingReviews]
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = item.likeCount
      return acc
    }, {})
  }, [product.alcoholReviews, product.pairingReviews])

  const [likedById, setLikedById] = useState<Record<string, boolean>>({})
  const [isFollowingByName, setIsFollowingByName] = useState<Record<string, boolean>>({})

  const handleToggleLike = (reviewId: string) => {
    setLikedById((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }))
  }

  const handleToggleFollow = (userName: string) => {
    setIsFollowingByName((prev) => ({ ...prev, [userName]: !prev[userName] }))
  }

  const handleConfirmPurchaseMove = () => {
    if (!purchaseConfirmShop) return
    window.open(purchaseConfirmShop.url, "_blank", "noopener,noreferrer")
    setPurchaseConfirmShop(null)
  }

  const getLikeCount = (review: ReviewCardData) =>
    (initialLikeCounts[review.id] ?? review.likeCount) + (likedById[review.id] ? 1 : 0)

  return (
    <section className="product_detail_page page_screen" aria-label="제품 상세">
      <ProductDetailHeader onBack={() => navigate(-1)} />

      <div className="product_hero" aria-label="제품 이미지">
        <div className="product_hero_image" role="img" aria-label="제품 이미지" />
      </div>

      <div className="product_summary">
        <p className="product_breadcrumb">{product.breadcrumb}</p>
        <div className="product_title_row">
          <h1 className="product_title">{product.name}</h1>
          <button type="button" className="product_bookmark" aria-label="인증마크">
            ✓
          </button>
        </div>
        <p className="product_price_row">
          <span className="product_price_label">판매정가</span>
          <strong className="product_price_value">{product.price}</strong>
        </p>
      </div>

      <ProductTabs activeTab={tab} onTabChange={setTab} />

      {tab === "spec" ? (
        <SpecSection
          spec={product.spec}
          taste={product.taste}
          tastingNotes={product.tastingNotes}
          descriptionTitle={product.descriptionTitle}
          descriptionBody={product.descriptionBody}
          purchase={product.purchase}
          onPurchaseSelect={setPurchaseConfirmShop}
        />
      ) : null}

      {tab === "review" ? (
        <section className="product_section" aria-label="후기">
          <div className="review_header">
            <h2 className="section_title">리뷰</h2>
            <button type="button" className="review_more_button">
              포토리뷰 모아보기
            </button>
          </div>
          <div className="review_cards">
            {product.alcoholReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isLiked={Boolean(likedById[review.id])}
                isFollowing={Boolean(isFollowingByName[review.userName])}
                likeCount={getLikeCount(review)}
                onToggleLike={() => handleToggleLike(review.id)}
                onToggleFollow={() => handleToggleFollow(review.userName)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {tab === "pairing" ? (
        <section className="product_section" aria-label="페어링추천">
          <div className="pairing_icons" aria-label="추천 페어링">
            {product.pairingChips.map((chip) => (
              <button key={chip.id} type="button" className="pairing_icon_button" aria-label={chip.label}>
                <div className="pairing_icon" aria-hidden="true" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
          <h3 className="section_title">연관컨텐츠</h3>
          <div className="review_cards">
            {product.pairingReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isLiked={Boolean(likedById[review.id])}
                isFollowing={Boolean(isFollowingByName[review.userName])}
                likeCount={getLikeCount(review)}
                onToggleLike={() => handleToggleLike(review.id)}
                onToggleFollow={() => handleToggleFollow(review.userName)}
                pairingLink={`/community/pairing/${review.rankingId ?? review.id}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {purchaseConfirmShop ? (
        <PurchaseConfirmModal
          shopName={purchaseConfirmShop.name}
          onConfirm={handleConfirmPurchaseMove}
          onCancel={() => setPurchaseConfirmShop(null)}
        />
      ) : null}
    </section>
  )
}
