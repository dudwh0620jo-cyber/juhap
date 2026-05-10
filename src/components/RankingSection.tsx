import { useEffect, useRef, useState } from "react"
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

const BADGE_COLORS = ["#ca9e52", "#9b9b9b", "#b87333", "#c4a882", "#c4a882"]

function RankingCard({ item, rank }: { item: RankingItem; rank: number }) {
  return (
    <div className="ranking_card">
      <div className="ranking_card_badge" style={{ background: BADGE_COLORS[rank - 1] }}>
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
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const speed = 0.4

    const animate = () => {
      offsetRef.current += speed
      const halfWidth = track.scrollWidth / 2
      if (offsetRef.current >= halfWidth) {
        offsetRef.current = 0
      }
      track.style.transform = `translateX(-${offsetRef.current}px)`

      const centerX = container.clientWidth / 2
      const cards = track.querySelectorAll<HTMLElement>(".ranking_card")
      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2 - offsetRef.current
        const distance = Math.abs(cardCenter - centerX)
        const t = Math.max(0, 1 - distance / (container.clientWidth * 0.5))
        const scale = 0.75 + 0.25 * t
        card.style.transform = `scale(${scale.toFixed(3)})`
        card.style.zIndex = String(Math.round(t * 10))
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const loopItems = [...items, ...items]

  return (
    <>
      <section className="home_block">
        <div className="ranking_header">
          <h3>{title}</h3>
          <button type="button" className="more_button" onClick={() => setIsConfirmOpen(true)}>
            더보기
          </button>
        </div>
        <div className="ranking_carousel" ref={containerRef}>
          <div className="ranking_track" ref={trackRef}>
            {loopItems.map((item, index) => (
              <RankingCard key={index} item={item} rank={(index % items.length) + 1} />
            ))}
          </div>
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
