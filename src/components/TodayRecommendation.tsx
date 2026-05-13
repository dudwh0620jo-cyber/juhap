import { useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import type { RecommendationItem } from "./RecommendationCard"

type TodayRecommendationProps = {
  title: string
  subtitle: string
  items: RecommendationItem[]
}

function formatHeroPairTitle(title: string) {
  if (!title.includes("+")) return title
  const [left, right] = title.split("+").map((value) => value.trim())
  if (!left || !right) return title
  return `${right} × ${left}`
}

export default function TodayRecommendation({ title, items }: TodayRecommendationProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const dotCount = items.length
  const dots = useMemo(() => Array.from({ length: dotCount }, (_, index) => index), [dotCount])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const slide = el.querySelector<HTMLElement>(".home_today_slide")
    if (!slide) return
    const slideWidth = slide.getBoundingClientRect().width
    if (!Number.isFinite(slideWidth) || slideWidth <= 0) return
    const nextIndex = Math.round(el.scrollLeft / slideWidth)
    setActiveIndex((prev) => (prev === nextIndex ? prev : Math.max(0, Math.min(dotCount - 1, nextIndex))))
  }

  return (
    <section className="home_block home_today">
      {items.length ? (
        <div className="home_today_carousel" ref={scrollRef} onScroll={handleScroll} aria-label="오늘의 추천 배너">
          <div className="home_today_track">
            {items.map((hero) => {
              const pairingParts =
                hero.title && hero.title.includes("+") ? hero.title.split("+").map((value) => value.trim()).filter(Boolean) : null
              const heroFood = pairingParts?.[1] ?? null
              const heroDrink = pairingParts?.[0] ?? null

              return (
                <Link key={hero.id} to={`/community/pairing/${hero.id}`} className="home_today_slide home_today_hero">
                  <div className="home_today_hero_media" aria-hidden="true">
                    {hero.imageSrc ? <img src={hero.imageSrc} alt="" /> : null}
                  </div>
                  <div className="home_today_hero_copy">
                    <div className="home_today_hero_label">{title}</div>
                    <strong className="home_today_hero_title">
                      {heroFood ? <span className="home_today_hero_food">{heroFood}</span> : formatHeroPairTitle(hero.title)}
                      {heroFood && heroDrink ? (
                        <>
                          <span className="home_today_hero_x"> × </span>
                          <span className="home_today_hero_drink">{heroDrink}</span>
                        </>
                      ) : null}
                    </strong>
                    <div className="home_today_hero_desc">{hero.description}</div>
                    <div className="home_today_hero_link" aria-hidden="true">
                      자세히보기 →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}

      {dots.length > 1 ? (
        <div className="home_today_dots" aria-label="배너 페이지 표시">
          {dots.map((index) => (
            <span key={index} className={`home_today_dot${index === activeIndex ? " is_active" : ""}`} aria-hidden="true" />
          ))}
        </div>
      ) : null}
    </section>
  )
}
