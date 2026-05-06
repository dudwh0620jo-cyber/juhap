import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import SakeGuideAccordion from "../components/SakeGuideAccordion"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconHouse from "../assets/svg/house.svg"
import verifiedIcon from "../assets/svg/ic_baseline-verified.svg"
import iconShare from "../assets/svg/sharenetwork.svg"
import { useProductDetailPageData } from "../hooks/useProductDetailPageData"
import "../styles/product-detail.css"

const tabItems = ["술정보", "후기", "페어링추천"] as const

export default function ProductDetail() {
  const { mockProductById, defaultProduct } = useProductDetailPageData()
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<(typeof tabItems)[number]>("술정보")

  const product = useMemo(() => {
    if (id && mockProductById[id]) return mockProductById[id]
    return defaultProduct
  }, [defaultProduct, id, mockProductById])

  return (
    <section className="product_detail_page page_screen" aria-label="상품 상세">
      <header className="product_detail_header" aria-label="상단 메뉴">
        <button type="button" className="product_icon_button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <img src={iconCaretLeft} alt="" />
        </button>
        <div className="product_header_actions">
          <Link className="product_icon_button" to="/home" aria-label="홈">
            <img src={iconHouse} alt="" />
          </Link>
          <button type="button" className="product_icon_button" aria-label="공유">
            <img src={iconShare} alt="" />
          </button>
        </div>
      </header>

      <div className="product_hero" aria-label="상품 이미지">
        <div className="product_hero_bottle" role="img" aria-label="닷사이 23 이미지 영역" />
      </div>

      <section className="product_summary" aria-label="상품 요약">
        <p className="product_breadcrumb">
          {product.breadcrumb} <img className="product_verified_icon" src={verifiedIcon} alt="" />{" "}
          <span className="product_rating">★★★★★</span>
        </p>
        <h1 className="product_title">{product.name}</h1>
        <p className="product_price_row">
          <span>판매가</span>
          <strong>{product.price}</strong>
        </p>
      </section>

      <nav className="product_tabs" aria-label="상세 탭">
        {tabItems.map((item) => (
          <button
            key={item}
            type="button"
            className={activeTab === item ? "is_active" : ""}
            onClick={() => setActiveTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      {activeTab === "술정보" ? (
        <>
          <section className="product_card product_basic_info" aria-label="기본정보">
            <h2>기본정보</h2>
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
                <button
                  className="purchase_card"
                  type="button"
                  key={shop.id}
                  onClick={() => window.open(shop.url, "_blank", "noopener,noreferrer")}
                >
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
              <p>현재 주변에 살만한 곳을 찾지 못했어요</p>
            </div>
          </section>
        </>
      ) : (
        <section className="product_card product_placeholder_panel">
          <p>아직 준비 중인 탭이에요.</p>
        </section>
      )}
    </section>
  )
}
