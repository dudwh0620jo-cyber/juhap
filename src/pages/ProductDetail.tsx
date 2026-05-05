import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import ProductDetailHeader from "../components/ProductDetailHeader"
import ProductTabs, { type DetailTab } from "../components/ProductTabs"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import ReviewCard, { type ReviewCardData } from "../components/ReviewCard"
import SpecSection, { type PurchaseShop } from "../components/SpecSection"
import { useProductDetailPageData } from "../hooks/useProductDetailPageData"
import "../styles/product-detail.css"

export default function ProductDetail() {
  const { mockProductById } = useProductDetailPageData()
  const navigate = useNavigate()
  const { id } = useParams()
  const [tab, setTab] = useState<DetailTab>("spec")
  const [purchaseConfirmShop, setPurchaseConfirmShop] = useState<PurchaseShop | null>(null)

  const product = useMemo(() => {
    if (id && mockProductById[id]) return mockProductById[id]
    return mockProductById["caymus-2023-1"]
  }, [id, mockProductById])

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
