import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import "../styles/product-detail.css"

type DetailTab = "spec" | "review" | "pairing"

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

type PurchaseShop = {
  id: string
  name: string
  delivery: string
  price: string
  badge: string
  url: string
}

type ReviewCard = {
  id: string
  rankingId?: string
  userName: string
  userMeta: string
  titleLeft: string
  titleRight: string
  body: string
  likeCount: number
  commentCount: number
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
  alcoholReviews: ReviewCard[]
  pairingReviews: ReviewCard[]
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
      "‘케이머스 나파 밸리 카버네 소비뇽 50주년 에디션’은 카버네 소비뇽 생산 50년을 기념해 출시된 한정 레드 와인입니다.\n\n나파 밸리의 8개 지역에서 수확한 포도를 블렌딩해 복합적인 구조와 활달같은 균형을 이룹니다.\n\n비옥한 토양, 무라카 층반, 낮은 수확량, 완전한 숙성까지의 기다림이 ‘케이머스 스타일’의 핵심을 이룹니다.",
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
    if (id && mockProductById[id]) {
      return mockProductById[id]
    }
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
    if (!purchaseConfirmShop) {
      return
    }
    window.open(purchaseConfirmShop.url, "_blank", "noopener,noreferrer")
    setPurchaseConfirmShop(null)
  }

  return (
    <section className="product_detail_page page_screen" aria-label="제품 상세">
      <header className="product_detail_header" aria-label="상단 메뉴">
        <button type="button" className="icon_button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="header_actions">
          <Link className="icon_button" to="/home" aria-label="홈">
            ⌂
          </Link>
          <button type="button" className="icon_button" aria-label="공유">
            ↗
          </button>
        </div>
      </header>

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

      <nav className="product_tabs" aria-label="상세 탭">
        {[
          { key: "spec" as const, label: "술정보" },
          { key: "review" as const, label: "후기" },
          { key: "pairing" as const, label: "페어링추천" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className={tab === item.key ? "is_active" : ""}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "spec" ? (
        <section className="product_section" aria-label="기본정보">
          <h2 className="section_title">기본정보</h2>

          <div className="spec_table" role="table" aria-label="기본정보 표">
            {[
              { label: "종류", value: product.spec.type },
              { label: "용량", value: product.spec.volume },
              { label: "도수", value: product.spec.abv },
              { label: "국가", value: product.spec.country },
              { label: "지역", value: product.spec.region },
              { label: "품종", value: product.spec.grape },
              { label: "케이스", value: product.spec.case },
            ].map((row) => (
              <div className="spec_row" role="row" key={row.label}>
                <span className="spec_label" role="cell">
                  {row.label}
                </span>
                <span className="spec_value" role="cell">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="taste_panel" aria-label="Taste">
            <h3 className="taste_title">Taste</h3>
            <div className="taste_rows">
              {product.taste.map((score) => (
                <div className="taste_row" key={score.label}>
                  <span className="taste_label">{score.label}</span>
                  <div className="taste_bar" role="img" aria-label={`${score.label} ${score.value}점`}>
                    <span className="taste_fill" style={{ width: `${(score.value / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="note_panel" aria-label={product.tastingNotes.title}>
            <h3 className="note_title">{product.tastingNotes.title}</h3>
            <div className="note_rows">
              {product.tastingNotes.items.map((note) => (
                <div className="note_row" key={note.label}>
                  <strong className="note_label">{note.label}</strong>
                  <p className="note_value">{note.value}</p>
                </div>
              ))}
            </div>
          </div>

          <article className="product_description" aria-label="제품 설명">
            <h3 className="description_title">{product.descriptionTitle}</h3>
            {product.descriptionBody.split("\n\n").map((paragraph) => (
              <p className="description_paragraph" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </article>

          <section className="product_purchase" aria-label="온라인 구매처">
            <h3 className="section_title">온라인구매처</h3>
            <div className="purchase_cards">
              {product.purchase.map((shop, index) => (
                <button
                  key={shop.id}
                  type="button"
                  className="purchase_card"
                  aria-label={`${shop.name}로 이동`}
                  onClick={() => setPurchaseConfirmShop(shop)}
                >
                  <span className="purchase_rank">{index + 1}</span>
                  <div className="purchase_thumb" aria-hidden="true" />
                  <div className="purchase_text">
                    <strong>{shop.name}</strong>
                    <p>{shop.delivery}</p>
                  </div>
                  <div className="purchase_meta">
                    <span className="purchase_price">{shop.price}</span>
                    <span className="purchase_badge">{shop.badge}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </section>
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
              <article className="review_card" key={review.id}>
                <header className="review_card_header">
                  <div className="review_avatar" aria-hidden="true" />
                  <div>
                    <h3>{review.userName}</h3>
                    <p>{review.userMeta}</p>
                  </div>
                  <button
                    type="button"
                    className="review_follow_button"
                    aria-pressed={Boolean(isFollowingByName[review.userName])}
                    onClick={() => handleToggleFollow(review.userName)}
                  >
                    {isFollowingByName[review.userName] ? "언팔로우" : "팔로우하기"}
                  </button>
                </header>
                <div className="review_images" aria-label="리뷰 이미지">
                  <div />
                  <div />
                </div>
                <div className="review_titles">
                  <span className="review_tag">{review.titleLeft}</span>
                  <span className="review_tag">{review.titleRight}</span>
                </div>
                <p className="review_body">{review.body}</p>
                <div className="review_actions">
                  <button
                    type="button"
                    className="review_action_button"
                    aria-pressed={Boolean(likedById[review.id])}
                    aria-label="좋아요"
                    onClick={() => handleToggleLike(review.id)}
                  >
                    {likedById[review.id] ? "♥" : "♡"}{" "}
                    {(initialLikeCounts[review.id] ?? review.likeCount) + (likedById[review.id] ? 1 : 0)}
                  </button>
                  <span>💬 {review.commentCount}</span>
                  <span>↗</span>
                  <span>🔖</span>
                </div>
              </article>
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
              <article className="review_card" key={review.id}>
                <header className="review_card_header">
                  <div className="review_avatar" aria-hidden="true" />
                  <div>
                    <h3>{review.userName}</h3>
                    <p>{review.userMeta}</p>
                  </div>
                  <button
                    type="button"
                    className="review_follow_button"
                    aria-pressed={Boolean(isFollowingByName[review.userName])}
                    onClick={() => handleToggleFollow(review.userName)}
                  >
                    {isFollowingByName[review.userName] ? "언팔로우" : "팔로우하기"}
                  </button>
                </header>
                <div className="review_images" aria-label="리뷰 이미지">
                  <div />
                  <div />
                </div>
                <Link
                  className="review_content_link"
                  to={`/community/pairing/${review.rankingId ?? review.id}`}
                  aria-label="페어링 글 상세보기"
                >
                  <div className="review_titles">
                    <span className="review_tag">{review.titleLeft}</span>
                    <span className="review_tag">{review.titleRight}</span>
                  </div>
                  <p className="review_body">{review.body}</p>
                </Link>
                <div className="review_actions">
                  <button
                    type="button"
                    className="review_action_button"
                    aria-pressed={Boolean(likedById[review.id])}
                    aria-label="좋아요"
                    onClick={() => handleToggleLike(review.id)}
                  >
                    {likedById[review.id] ? "♥" : "♡"}{" "}
                    {(initialLikeCounts[review.id] ?? review.likeCount) + (likedById[review.id] ? 1 : 0)}
                  </button>
                  <span>💬 {review.commentCount}</span>
                  <span>↗</span>
                  <span>🔖</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {purchaseConfirmShop ? (
        <div className="purchase_confirm_overlay" role="dialog" aria-modal="true" aria-label="이동 확인">
          <div className="purchase_confirm_modal">
            <p className="purchase_confirm_text">{purchaseConfirmShop.name}로 이동할까요?</p>
            <div className="purchase_confirm_actions">
              <button type="button" className="purchase_confirm_button is_cancel" onClick={() => setPurchaseConfirmShop(null)}>
                취소
              </button>
              <button type="button" className="purchase_confirm_button is_confirm" onClick={handleConfirmPurchaseMove}>
                이동
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
