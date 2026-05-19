import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import { homeMomentPickCardsBySituation, homeMomentPickItems } from "../data/homeContent"
import { feedPosts, matchesCommunityTag } from "../utils/communityPosts"

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
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState<string>(() => homeMomentPickItems[0]?.key ?? "")
  const cardsRef = useRef<HTMLDivElement | null>(null)
  const [edgeFades, setEdgeFades] = useState({ left: false, right: false })
  const visibleCards = useMemo(() => {
    type MomentPickCard = {
      id: string
      title: string
      subtitle: string
      thumbSrc: string
      tags: readonly string[]
      badgeText?: string
    }
    const cardsByKey: Record<string, readonly MomentPickCard[]> = {
      solo: homeMomentPickCardsBySituation.solo,
      friends: homeMomentPickCardsBySituation.friends,
      family: homeMomentPickCardsBySituation.family,
      date: homeMomentPickCardsBySituation.date,
      group: homeMomentPickCardsBySituation.group,
    }
    return cardsByKey[selectedKey] ?? cardsByKey.solo
  }, [selectedKey])

  const pairingRouteByCardId = useMemo(() => {
    const parsePairing = (title: string) => {
      const normalized = title.replace(/\s+/g, " ").trim()
      const parts =
        normalized.includes("×")
          ? normalized.split("×")
          : normalized.includes("+")
            ? normalized.split("+")
            : normalized.match(/\s[xX]\s/) // avoid splitting on names like "xxx"
              ? normalized.split(/\s[xX]\s/)
              : null

      if (!parts || parts.length < 2) return null
      const liquorTag = (parts[0] ?? "").trim()
      const foodTag = (parts.slice(1).join(" ") ?? "").trim()
      if (!liquorTag || !foodTag) return null
      return { liquorTag, foodTag }
    }

    const hasSharingPosts = ({ liquorTag, foodTag }: { liquorTag: string; foodTag: string }) => {
      return feedPosts.some((post) => {
        if (post.isQna) return false
        return matchesCommunityTag(post, "liquor", liquorTag) && matchesCommunityTag(post, "food", foodTag)
      })
    }

    const map = new Map<string, { liquorTag: string; foodTag: string } | null>()
    visibleCards.forEach((card) => {
      const pairing = parsePairing(card.title)
      map.set(card.id, pairing && hasSharingPosts(pairing) ? pairing : null)
    })
    return map
  }, [visibleCards])

  useEffect(() => {
    const cards = cardsRef.current
    if (!cards) return
    cards.scrollTo({ left: 0, behavior: "auto" })
    setEdgeFades({ left: false, right: cards.scrollWidth > cards.clientWidth + 1 })
  }, [selectedKey])

  useEffect(() => {
    const cards = cardsRef.current
    if (!cards) return

    const update = () => {
      const maxScrollLeft = Math.max(0, cards.scrollWidth - cards.clientWidth)
      const left = cards.scrollLeft > 1
      const right = cards.scrollLeft < maxScrollLeft - 1
      setEdgeFades((prev) => (prev.left === left && prev.right === right ? prev : { left, right }))
    }

    update()
    cards.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cards.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <section className="home_block home_moment_pick" aria-label="Moment Pick">
      <div className="moment_pick_header_group">
        <div className="home_block_header">
        <h3>Moment Pick</h3>
      </div>

      <SituationScroll selectedKey={selectedKey} onSelect={(key) => setSelectedKey(key)} />
      </div>
      <div
        className={[
          "moment_pick_cards_shell",
          edgeFades.left ? "has_left_fade" : "",
          edgeFades.right ? "has_right_fade" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div ref={cardsRef} className="moment_pick_cards" aria-label="Moment Pick 추천 목록">
          <div className="moment_pick_track">
            {visibleCards.map((card, index) => (
              (() => {
                const pairing = pairingRouteByCardId.get(card.id)
                const isDisabled = !pairing

                return (
              <button
                key={card.id}
                tabIndex={isDisabled ? -1 : 0}
                type="button"
                className={`moment_pick_card_button${index === 0 ? " is_first" : " is_second"}`}
                disabled={isDisabled}
                onClick={() => {
                  if (!pairing) return
                  navigate("/community/tag", { state: { liquorTag: pairing.liquorTag, foodTag: pairing.foodTag } })
                }}
                aria-disabled={isDisabled}
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
                )
              })()
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
