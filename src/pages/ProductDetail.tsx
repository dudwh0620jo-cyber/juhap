import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import AlertModal from "../components/AlertModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import SakeGuideAccordion from "../components/SakeGuideAccordion"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconHouse from "../assets/svg/house.svg"
import verifiedIcon from "../assets/svg/ic_baseline-verified.svg"
import iconShare from "../assets/svg/sharenetwork.svg"
import imgDassai23 from "../assets/drink_dassai_23_detail.png"
import { useProductDetailPageData } from "../hooks/useProductDetailPageData"
import "../styles/product-detail.css"

const tabItems = ["상품정보", "후기", "페어링추천"] as const

export default function ProductDetail() {
  const { mockProductById, defaultProduct } = useProductDetailPageData()
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<(typeof tabItems)[number]>("상품정보")
  const [pendingPurchaseShopName, setPendingPurchaseShopName] = useState<string | null>(null)
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false)

  const product = useMemo(() => {
    if (id && mockProductById[id]) return mockProductById[id]
    return defaultProduct
  }, [defaultProduct, id, mockProductById])

  const ratingWidth = `${Math.max(0, Math.min(100, (product.rating / 5) * 100))}%`

  return (
    <section className="product_detail_page page_screen" aria-label="상품 상세">
      <header className="product_detail_header" aria-label="상단 메뉴">
        <button type="button" className="product_icon_button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <img src={iconCaretLeft} alt="" />
        </button>
        <div className="product_header_actions">
          <Link className="product_icon_button" to="/home" aria-label="홈으로 이동">
            <img src={iconHouse} alt="" />
          </Link>
          <button type="button" className="product_icon_button" aria-label="공유">
            <img src={iconShare} alt="" />
          </button>
        </div>
      </header>

      <div className="product_hero" aria-label="상품 이미지">
        <img className="product_hero_image" src={imgDassai23} alt="닷사이 23" />
      </div>

      <section className="product_summary" aria-label="상품 요약">
        <p className="product_breadcrumb">
          {product.breadcrumb} <img className="product_verified_icon" src={verifiedIcon} alt="" />{" "}
          <span className="product_rating" aria-label={`평점 ${product.rating.toFixed(1)}점`}>
            <span className="product_rating_track">★★★★★</span>
            <span className="product_rating_fill" style={{ width: ratingWidth }}>
              ★★★★★
            </span>
            <span className="product_rating_value">{product.rating.toFixed(1)}</span>
          </span>
        </p>
        <h1 className="product_title">{product.name}</h1>
        <p className="product_price_row">
          <span>판매가</span>
          <strong>{product.price}</strong>
        </p>
      </section>

      <nav className="product_tabs" aria-label="상세 탭">
        {tabItems.map((item) => (
          <button key={item} type="button" className={activeTab === item ? "is_active" : ""} onClick={() => setActiveTab(item)}>
            {item}
          </button>
        ))}
      </nav>

      {activeTab === "상품정보" ? (
        <>
          <section className="product_card product_basic_info" aria-label="기본 정보">
            <h2>기본 정보</h2>
            <dl>
              {product.basicInfo.map((row) => (
                <div key={row.label}>
                  <dt>{row.label} :</dt>
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
                  <strong>{note.label}</strong>
                  <span>{note.subValue}</span>
                  <p>{note.value}</p>
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
              <h2>온라인구매처</h2>
              <span>75,900원~</span>
            </div>
            <div className="purchase_cards">
              {product.onlineShops.map((shop, index) => (
                <button className="purchase_card" type="button" key={shop.id} onClick={() => setPendingPurchaseShopName(shop.name)}>
                  <span className="purchase_rank">{index + 1}</span>
                  <span className="purchase_thumb" aria-hidden="true" />
                  <span className="purchase_text">
                    <strong>{shop.name}</strong>
                    <small>{shop.delivery}</small>
                  </span>
                  <span className="purchase_price">{shop.price}</span>
                  <span className="purchase_badge">
                    주문하러
                    <br />
                    가기
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="product_offline" aria-label="오프라인 구매처">
            <h2>오프라인 구매처</h2>
            <div className="offline_empty">
              <div className="offline_mascot" aria-hidden="true" />
              <p>현재 주문할 수 있는 곳을 찾지 못했어요</p>
            </div>
          </section>
        </>
      ) : (
        <section className="product_card product_placeholder_panel">
          <p>아직 준비 중인 탭이에요.</p>
        </section>
      )}

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
    </section>
  )
}