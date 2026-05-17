import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { homeMomentPickCardsBySituation, homeMomentPickItems } from "../data/homeContent"

export type SituationItem = {
  id: number
  label: string
  recommendCount: number
  drink: { emoji: string; name: string; desc: string }
  snack: { emoji: string; name: string; desc: string }
  footer: string
}

const SituationButton = forwardRef<
  HTMLButtonElement,
  {
    label: string
    isActive: boolean
    iconSrc?: string
    onSelect: () => void
  }
>(function SituationButton({ label, isActive, iconSrc, onSelect }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`moment_pick_chip${isActive ? " is_active" : ""}`}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <span className="moment_pick_icon" aria-hidden="true">
        {iconSrc ? <img src={iconSrc} alt="" /> : null}
      </span>
      <span className="moment_pick_label">{label}</span>
    </button>
  )
})

function SituationScroll({ selectedKey, onSelect }: { selectedKey: string; onSelect: (key: string) => void }) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [glider, setGlider] = useState({ x: 0, width: 0 })

  useLayoutEffect(() => {
    function updateGlider() {
      const activeTab = tabRefs.current[selectedKey]
      if (!activeTab || !rowRef.current) return
      const row = rowRef.current
      const activeRect = activeTab.getBoundingClientRect()
      const rowRect = row.getBoundingClientRect()

      const labelNode = activeTab.querySelector(".moment_pick_label") as HTMLElement | null
      const labelRect = labelNode?.getBoundingClientRect() ?? activeRect

      const targetWidth = 22
      const centerX = labelRect.left + labelRect.width / 2
      const left = centerX - rowRect.left + row.scrollLeft - targetWidth / 2
      setGlider({ x: Math.max(0, left), width: targetWidth })

      const targetCenter = activeTab.offsetLeft + activeTab.offsetWidth / 2
      const nextScrollLeft = Math.max(0, targetCenter - row.clientWidth / 2)
      const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth)
      row.scrollTo({
        left: Math.min(maxScrollLeft, nextScrollLeft),
        behavior: "smooth",
      })
    }

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !rowRef.current ? null : new ResizeObserver(() => updateGlider())
    if (rowRef.current) observer?.observe(rowRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
  }, [selectedKey])

  return (
    <div ref={rowRef} className="moment_pick_row" role="tablist" aria-label="Moment Pick">
      <motion.span
        className="moment_pick_glider"
        animate={glider}
        initial={false}
        transition={{ type: "spring", stiffness: 420, damping: 46, mass: 1 }}
        aria-hidden="true"
      />
      {homeMomentPickItems.map((item) => (
        <SituationButton
          key={item.key}
          label={item.label}
          iconSrc={item.iconSrc}
          isActive={selectedKey === item.key}
          onSelect={() => onSelect(item.key)}
          ref={(node) => {
            tabRefs.current[item.key] = node
          }}
        />
      ))}
    </div>
  )
}

function MomentPickCard({
  title,
  subtitle,
  thumbSrc,
  tags,
  badgeText,
  variant,
}: {
  title: string
  subtitle: string
  thumbSrc: string
  tags: readonly string[]
  badgeText?: string
  variant?: "primary" | "secondary"
}) {
  return (
    <motion.article
      className={variant === "secondary" ? "moment_pick_card is_secondary" : "moment_pick_card"}
    >
      <div className="moment_pick_card_surface">
        <div className="moment_pick_card_body">
          <div className="moment_pick_card_title">{title}</div>
          <div className="moment_pick_card_desc">{subtitle}</div>
          <div className="moment_pick_card_tags" aria-label="추천 태그">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="moment_pick_card_photo" aria-hidden="true">
        <img className="moment_pick_card_img" src={thumbSrc} alt="" />
        {badgeText ? <span className="moment_pick_card_badge">{badgeText}</span> : null}
      </div>
    </motion.article>
  )
}

export default function SituationSection({ items }: { items: SituationItem[] }) {
  void items
  const [selectedKey, setSelectedKey] = useState<string>(() => homeMomentPickItems[0]?.key ?? "")
  const visibleCards = useMemo(() => {
    const cardsByKey: Record<string, readonly (typeof homeMomentPickCardsBySituation.solo)[number][]> = {
      solo: homeMomentPickCardsBySituation.solo,
      family: homeMomentPickCardsBySituation.family,
      date: homeMomentPickCardsBySituation.date,
      group: homeMomentPickCardsBySituation.group,
    }
    return cardsByKey[selectedKey] ?? homeMomentPickCardsBySituation.solo
  }, [selectedKey])

  useEffect(() => {
    const cards = document.querySelector(".moment_pick_cards")
    if (cards instanceof HTMLElement) cards.scrollTo({ left: 0, behavior: "auto" })
  }, [selectedKey])

  return (
    <section className="home_block home_moment_pick" aria-label="Moment Pick">
      <div className="moment_pick_header_group">
        <div className="home_block_header">
        <h3>Moment Pick</h3>
      </div>

      <SituationScroll selectedKey={selectedKey} onSelect={(key) => setSelectedKey(key)} />
      </div>
      <div className="moment_pick_cards" aria-label="Moment Pick 추천 목록">
        <div className="moment_pick_track">
          {visibleCards.map((card, index) => (
            <button
              key={card.id}
              tabIndex={0}
              type="button"
              className={`moment_pick_card_button${index === 0 ? " is_first" : " is_second"}`}
            >
              <MomentPickCard
                title={card.title}
                subtitle={card.subtitle}
                thumbSrc={card.thumbSrc}
                tags={card.tags}
                badgeText={card.badgeText}
                variant={index === 1 ? "secondary" : "primary"}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
