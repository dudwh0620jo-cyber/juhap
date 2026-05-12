import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import PurchaseConfirmModal from "./PurchaseConfirmModal"

export type RankingItem = {
  drink: string
  drinkEmoji: string
  food: string
  foodEmoji: string
  rating: number
  count: number
}

type RankingSectionProps = {
  title: string
  items: [RankingItem, RankingItem, RankingItem, RankingItem, RankingItem]
}

function RankingCard({ item, rank }: { item: RankingItem; rank: number }) {
  return (
    <div className="ranking_card">
      <div className={`ranking_card_badge is_rank_${rank}`} aria-hidden="true">
        {rank}
      </div>
      <div className="ranking_card_images">
        <span>{item.drinkEmoji}</span>
        <span>{item.foodEmoji}</span>
      </div>
      <strong className="ranking_card_drink">{item.drink}</strong>
      <span className="ranking_card_food">{item.food}</span>
      <div className="ranking_card_meta">
        <span className="ranking_card_rating">★ {item.rating}</span>
        <span className="ranking_card_count">{item.count.toLocaleString()}표</span>
      </div>
    </div>
  )
}

export default function RankingSection({ title, items }: RankingSectionProps) {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const dotCount = items.length
  const dots = useMemo(() => Array.from({ length: dotCount }, (_, index) => index), [dotCount])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>(".ranking_card")
    if (!card) return
    const cardWidth = card.getBoundingClientRect().width + 14
    const nextIndex = Math.round(el.scrollLeft / cardWidth)
    setActiveIndex((prev) => (prev === nextIndex ? prev : Math.max(0, Math.min(dotCount - 1, nextIndex))))
  }

  return (
    <>
      <section className="home_block">
        <div className="ranking_header">
          <h3>{title}</h3>
          <button type="button" className="more_button" onClick={() => setIsConfirmOpen(true)}>
            더보기
          </button>
        </div>
        <div className="ranking_carousel" ref={scrollRef} onScroll={handleScroll}>
          <div className="ranking_track">
            {items.map((item, index) => (
              <RankingCard key={item.drink + item.food + index} item={item} rank={index + 1} />
            ))}
          </div>
        </div>
        <div className="ranking_dots" aria-label="랭킹 페이지 표시">
          {dots.map((index) => (
            <span key={index} className={`ranking_dot${index === activeIndex ? " is_active" : ""}`} aria-hidden="true" />
          ))}
        </div>
      </section>

      {isConfirmOpen ? (
        <PurchaseConfirmModal
          ariaLabel="랭킹 이동 확인"
          message="랭킹에 들어가면 바로 참여가 진행되어 취소할 수 없어요. 이동할까요?"
          cancelLabel="취소"
          confirmLabel="이동"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false)
            navigate("/community/ranking")
          }}
        />
      ) : null}
    </>
  )
}
