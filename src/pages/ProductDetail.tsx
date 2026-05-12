import { useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import AlertModal from "../components/AlertModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import SakeGuideAccordion from "../components/SakeGuideAccordion"
import imgOfflineEmptyCharacter from "../assets/fd_offline_empty_character.png"
import imgProductHero from "../assets/fd_product_hero_image.png"
import imgPurchaseThumb1 from "../assets/fd_purchase_thumb1.png"
import imgPurchaseThumb2 from "../assets/fd_purchase_thumb2.png"
import imgPurchaseThumb3 from "../assets/fd_purchase_thumb3.png"
import iconBookmark from "../assets/svg/bookmarksimple.svg"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconCaretRight from "../assets/svg/caretright.svg"
import iconShare from "../assets/svg/sharenetwork.svg"
import iconTasteAroma from "../assets/svg/fd_product_taste_rows_aroma.svg"
import iconTasteFinish from "../assets/svg/fd_product_taste_rows_finish.svg"
import iconTasteTaste from "../assets/svg/fd_product_taste_rows_taste.svg"
import iconStar from "../assets/svg/star.svg"
import { useProductDetailPageData } from "../hooks/useProductDetailPageData"
import "../styles/product-detail.css"

const tabItems = ["술정보", "후기", "페어링추천"] as const
const reviewCount = "13,422"
const purchaseThumbs = [imgPurchaseThumb1, imgPurchaseThumb2, imgPurchaseThumb3]
const purchaseDiscounts = ["62%", "30%", "21%"]
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

  const product = useMemo(() => {
    if (id && mockProductById[id]) return mockProductById[id]
    return defaultProduct
  }, [defaultProduct, id, mockProductById])

  const ratingWidth = `${Math.max(0, Math.min(100, (product.rating / 5) * 100))}%`
  const bestOnlinePrice = product.onlineShops[0]?.price ?? product.price
  const breadcrumbItems = product.breadcrumb.split(">").map((item) => item.trim()).filter(Boolean)

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
        <section className="product_card product_placeholder_panel product_review_panel" aria-label="주류 후기">
          <p>이 술에 대한 후기를 남겨보세요.</p>
          <button type="button" className="product_write_button" onClick={() => navigate(`/product/${product.id}/write`)}>
            주류 후기 글쓰기
          </button>
        </section>
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

      <button className="product_scroll_top" type="button" aria-label="맨 위로 이동" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑
      </button>
    </section>
  )
}
