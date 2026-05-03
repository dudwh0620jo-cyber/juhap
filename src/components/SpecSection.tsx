export type PurchaseShop = {
  id: string
  name: string
  delivery: string
  price: string
  badge: string
  url: string
}

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

type Props = {
  spec: ProductSpec
  taste: TasteScore[]
  tastingNotes: TastingNote
  descriptionTitle: string
  descriptionBody: string
  purchase: PurchaseShop[]
  onPurchaseSelect: (shop: PurchaseShop) => void
}

export default function SpecSection({
  spec,
  taste,
  tastingNotes,
  descriptionTitle,
  descriptionBody,
  purchase,
  onPurchaseSelect,
}: Props) {
  const specRows = [
    { label: "종류", value: spec.type },
    { label: "용량", value: spec.volume },
    { label: "도수", value: spec.abv },
    { label: "국가", value: spec.country },
    { label: "지역", value: spec.region },
    { label: "품종", value: spec.grape },
    { label: "케이스", value: spec.case },
  ]

  return (
    <section className="product_section" aria-label="기본정보">
      <h2 className="section_title">기본정보</h2>

      <div className="spec_table" role="table" aria-label="기본정보 표">
        {specRows.map((row) => (
          <div className="spec_row" role="row" key={row.label}>
            <span className="spec_label" role="cell">{row.label}</span>
            <span className="spec_value" role="cell">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="taste_panel" aria-label="Taste">
        <h3 className="taste_title">Taste</h3>
        <div className="taste_rows">
          {taste.map((score) => (
            <div className="taste_row" key={score.label}>
              <span className="taste_label">{score.label}</span>
              <div className="taste_bar" role="img" aria-label={`${score.label} ${score.value}점`}>
                <span className="taste_fill" style={{ width: `${(score.value / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="note_panel" aria-label={tastingNotes.title}>
        <h3 className="note_title">{tastingNotes.title}</h3>
        <div className="note_rows">
          {tastingNotes.items.map((note) => (
            <div className="note_row" key={note.label}>
              <strong className="note_label">{note.label}</strong>
              <p className="note_value">{note.value}</p>
            </div>
          ))}
        </div>
      </div>

      <article className="product_description" aria-label="제품 설명">
        <h3 className="description_title">{descriptionTitle}</h3>
        {descriptionBody.split("\n\n").map((paragraph) => (
          <p className="description_paragraph" key={paragraph}>
            {paragraph}
          </p>
        ))}
      </article>

      <section className="product_purchase" aria-label="온라인 구매처">
        <h3 className="section_title">온라인구매처</h3>
        <div className="purchase_cards">
          {purchase.map((shop, index) => (
            <button
              key={shop.id}
              type="button"
              className="purchase_card"
              aria-label={`${shop.name}로 이동`}
              onClick={() => onPurchaseSelect(shop)}
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
  )
}
