import { useState } from "react"

export type SituationItem = {
  id: number
  emoji: string
  label: string
  recommendCount: number
  drink: { emoji: string; name: string; desc: string }
  snack: { emoji: string; name: string; desc: string }
  footer: string
}

type Product = SituationItem["drink"]

function SituationHeader() {
  return (
    <div className="situation_top">
      <h3>지금 이 순간</h3>
      <span className="situation_hint">상황을 선택하면 추천이 달라져요</span>
    </div>
  )
}

function SituationButton({
  item,
  isActive,
  onSelect,
}: {
  item: SituationItem
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <div className="situation_item_wrap">
      <button
        type="button"
        className={`situation_item${isActive ? " situation_item_active" : ""}`}
        onClick={onSelect}
      >
        <span className="situation_emoji">{item.emoji}</span>
      </button>
      <span className="situation_label">{item.label}</span>
    </div>
  )
}

function SituationScroll({
  items,
  selectedId,
  onSelect,
}: {
  items: SituationItem[]
  selectedId: number
  onSelect: (id: number) => void
}) {
  return (
    <div className="situation_scroll">
      {items.map((item) => (
        <SituationButton
          key={item.id}
          item={item}
          isActive={selectedId === item.id}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </div>
  )
}

function SituationProduct({ product }: { product: Product }) {
  return (
    <div className="situation_product">
      <span className="situation_product_emoji">{product.emoji}</span>
      <strong>{product.name}</strong>
      <span>{product.desc}</span>
    </div>
  )
}

function SituationRecCard({ rec }: { rec: SituationItem }) {
  return (
    <div className="situation_rec_card">
      <div className="situation_rec_head">
        <span className="situation_rec_title">
          {rec.emoji} {rec.label} 추천 1위
        </span>
        <span className="situation_rec_badge">🏆 {rec.recommendCount.toLocaleString()}명 추천</span>
      </div>
      <div className="situation_rec_products">
        <SituationProduct product={rec.drink} />
        <span className="situation_rec_plus">+</span>
        <SituationProduct product={rec.snack} />
      </div>
      <div className="situation_rec_footer">
        <p>{rec.footer}</p>
        <button type="button" className="situation_detail_btn">
          → 자세히 보기
        </button>
      </div>
    </div>
  )
}

export default function SituationSection({ items }: { items: SituationItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0].id)
  const selected = items.find((s) => s.id === selectedId)!

  return (
    <section className="home_block">
      <SituationHeader />
      <SituationScroll items={items} selectedId={selectedId} onSelect={setSelectedId} />
      <SituationRecCard rec={selected} />
    </section>
  )
}
