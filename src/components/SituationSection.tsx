import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { homeMomentPickCards, homeMomentPickItems } from "../data/homeContent"

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
      setGlider({ x: activeTab.offsetLeft, width: activeTab.offsetWidth })

      const row = rowRef.current
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
        transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
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
  isActive,
}: {
  title: string
  subtitle: string
  thumbSrc: string
  tags: readonly string[]
  badgeText?: string
  isActive: boolean
}) {
  return (
    <motion.article
      className={`moment_pick_card${isActive ? " is_active" : " is_inactive"}`}
      animate={{ scale: isActive ? 1 : 0.92, opacity: isActive ? 1 : 0.9 }}
      transition={{ type: "spring", stiffness: 520, damping: 36, mass: 0.6 }}
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
  const selectedLabel = homeMomentPickItems.find((item) => item.key === selectedKey)?.label ?? ""
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  const cardWidth = 230
  const cardGap = 14
  const maxIndex = homeMomentPickCards.length - 1
  const maxDrag = useMemo(() => Math.max(0, maxIndex * (cardWidth + cardGap)), [maxIndex])
  const x = useMemo(() => -activeCardIndex * (cardWidth + cardGap), [activeCardIndex])

  return (
    <section className="home_block home_moment_pick" aria-label="Moment Pick">
      <div className="moment_pick_header_group">
        <div className="home_block_header">
        <h3>Moment Pick</h3>
      </div>

      <SituationScroll selectedKey={selectedKey} onSelect={(key) => setSelectedKey(key)} />
      </div>
      <div className="moment_pick_selected_label" aria-live="polite">
        <span className="moment_pick_selected_label_primary">{selectedLabel}</span>
        <span className="moment_pick_selected_label_rest">추천조합</span>
      </div>

      <div className="moment_pick_cards" aria-label="Moment Pick 추천 목록">
        <motion.div
          className="moment_pick_track"
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.08}
          animate={{ x }}
          transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.7 }}
          onDragEnd={(_, info) => {
            const swipePower = info.offset.x + info.velocity.x * 10
            if (swipePower < -60) setActiveCardIndex((prev) => Math.min(maxIndex, prev + 1))
            else if (swipePower > 60) setActiveCardIndex((prev) => Math.max(0, prev - 1))
          }}
        >
          {homeMomentPickCards.map((card, index) => (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveCardIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setActiveCardIndex(index)
              }}
              style={{ outline: "none" }}
            >
              <MomentPickCard
                title={card.title}
                subtitle={card.subtitle}
                thumbSrc={card.thumbSrc}
                tags={card.tags}
                badgeText={card.badgeText}
                isActive={index === activeCardIndex}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
