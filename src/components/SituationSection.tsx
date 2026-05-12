import { useState } from "react"
import { Link } from "react-router"
import { homeMomentPickCards, homeMomentPickItems } from "../data/homeContent"

export type SituationItem = {
  id: number
  label: string
  recommendCount: number
  drink: { emoji: string; name: string; desc: string }
  snack: { emoji: string; name: string; desc: string }
  footer: string
}

function SituationButton({
  label,
  isActive,
  iconSrc,
  onSelect,
}: {
  label: string
  isActive: boolean
  iconSrc?: string
  onSelect: () => void
}) {
  return (
    <button
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
}

function SituationScroll({ selectedKey, onSelect }: { selectedKey: string; onSelect: (key: string) => void }) {
  return (
    <div className="moment_pick_row" role="tablist" aria-label="Moment Pick">
      {homeMomentPickItems.map((item) => (
        <SituationButton
          key={item.key}
          label={item.label}
          iconSrc={item.iconSrc}
          isActive={selectedKey === item.key}
          onSelect={() => onSelect(item.key)}
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
  badgeSrc,
}: {
  title: string
  subtitle: string
  thumbSrc: string
  tags: readonly string[]
  badgeSrc?: string
}) {
  return (
    <article className="moment_pick_card">
      <div className="moment_pick_card_photo" aria-hidden="true">
        <img className="moment_pick_card_img" src={thumbSrc} alt="" />
        {badgeSrc ? <img className="moment_pick_card_badge" src={badgeSrc} alt="" /> : null}
      </div>
      <div className="moment_pick_card_body">
        <div className="moment_pick_card_title">{title}</div>
        <div className="moment_pick_card_desc">{subtitle}</div>
        <div className="moment_pick_card_tags" aria-label="추천 태그">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <Link to="/community" className="moment_pick_card_link">
          자세히 보기 →
        </Link>
      </div>
    </article>
  )
}

export default function SituationSection({ items }: { items: SituationItem[] }) {
  void items
  const [selectedKey, setSelectedKey] = useState<string>(() => homeMomentPickItems[1]?.key ?? homeMomentPickItems[0].key)
  const selectedLabel = homeMomentPickItems.find((item) => item.key === selectedKey)?.label ?? ""

  return (
    <section className="home_block home_moment_pick" aria-label="Moment Pick">
      <div className="home_block_header">
        <h3>Moment Pick</h3>
      </div>

      <SituationScroll selectedKey={selectedKey} onSelect={(key) => setSelectedKey(key)} />
      <div className="moment_pick_selected_label" aria-live="polite">
        {selectedLabel} 추천조합
      </div>

      <div className="moment_pick_cards" aria-label="Moment Pick 추천 목록">
        {homeMomentPickCards.map((card) => (
          <MomentPickCard
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            thumbSrc={card.thumbSrc}
            tags={card.tags}
            badgeSrc={card.badgeSrc}
          />
        ))}
      </div>
    </section>
  )
}
