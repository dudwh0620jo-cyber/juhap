import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
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
  const [isGuideOpen, setIsGuideOpen] = useState(false)

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
          {product.breadcrumb} <img className="product_verified_icon" src={verifiedIcon} alt="" /> <span className="product_rating">★★★★★</span>
        </p>
        <h1 className="product_title">{product.name}</h1>
        <p className="product_price_row">
          <span>판매정가</span>
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

          <section className="product_guide" aria-label="사케 입문 가이드">
            <button className="product_guide_toggle" type="button" onClick={() => setIsGuideOpen((current) => !current)}>
              <span>사케 입문 가이드</span>
              <img
                className={isGuideOpen ? "product_guide_caret is_open" : "product_guide_caret"}
                src={iconCaretLeft}
                alt=""
                aria-hidden="true"
              />
            </button>

            {isGuideOpen ? (
              <div className="product_guide_body">
                <article className="product_guide_section">
                  <h3>쌀과 정미율</h3>
                  <p>사케는 정미율에 따라 등급이 나뉩니다.</p>
                  <div className="polish_table" aria-label="정미율 표">
                    <div className="polish_row is_header">
                      <strong>정미율</strong>
                      <span>70% 이하</span>
                      <span>60% 이하</span>
                      <span>50% 이하</span>
                    </div>
                    <div className="polish_row">
                      <strong>주정 무첨가</strong>
                      <span>준마이<br />(정미율 제한 X)</span>
                      <span>준마이 긴죠</span>
                      <span>준마이<br />다이긴죠</span>
                    </div>
                    <div className="polish_row">
                      <strong>주정 첨가</strong>
                      <span>혼죠조</span>
                      <span>긴죠</span>
                      <span>다이긴죠</span>
                    </div>
                  </div>
                </article>

                <article className="product_guide_section">
                  <h3>일본 주도</h3>
                  <p>일본 주도는 술의 비중, 즉 단맛을 표현하는 단위입니다.</p>
                  <div className="guide_scale">
                    <span>-</span>
                    <span>←</span>
                    <strong>±0</strong>
                    <span>→</span>
                    <span>+</span>
                    <div className="guide_scale_caption is_left">달콤한<br />부드러운<br />아마구치</div>
                    <div className="guide_scale_bottle" aria-hidden="true" />
                    <div className="guide_scale_caption is_right">드라이한<br />깔끔한<br />가라구치</div>
                  </div>
                  <p>당분이 많아 술의 비중이 물보다 커질 때 -로 표시합니다. 사케에 입문한다면 -2 정도의 달콤한 맛부터 시작해보세요.</p>
                </article>

                <article className="product_guide_section">
                  <h3>산도</h3>
                  <p>산도는 사케에 포함된 산의 양을 뜻합니다.</p>
                  <div className="guide_scale">
                    <span>-</span>
                    <span>←</span>
                    <strong>0</strong>
                    <span>→</span>
                    <span>+</span>
                    <div className="guide_scale_caption is_left">담백한<br />깔끔한</div>
                    <div className="guide_scale_bottle" aria-hidden="true" />
                    <div className="guide_scale_caption is_right">깊은<br />농후한</div>
                  </div>
                  <p>사케의 산도는 제조 과정에서 생긴 젖산, 사과산 등을 의미합니다. 산도의 평균은 1.3~1.5이기 때문에 1~1.5 사이를 고르는 것을 추천합니다.</p>
                </article>
              </div>
            ) : null}
          </section>

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
                  <span className="purchase_badge">주문하러<br />가기</span>
                </button>
              ))}
            </div>
          </section>

          <section className="product_offline" aria-label="오프라인 구매처">
            <h2>오프라인 구매처</h2>
            <div className="offline_empty">
              <div className="offline_mascot" aria-hidden="true" />
              <p>현재 주변에 살만된 곳을 찾지 못했어요</p>
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
