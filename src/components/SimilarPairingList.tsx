export type SimilarPairingItem = {
  id: number
  pairingTitle: string
  label?: string
  authorId: number
  authorName: string
  profile: string
  locationLabel: string
  drinkType: string
}

type Props = {
  items: SimilarPairingItem[]
  onSelect: (item: SimilarPairingItem) => void
  title?: string
}

export default function SimilarPairingList({ items, onSelect, title }: Props) {
  return (
    <>
      <h3 className="similar_title">{title ?? "유사한 분위기 조합 둘러보기"}</h3>
      <div className="similar_list" aria-label="유사한 페어링 추천">
        {items.map((item) => (
          <button key={item.id} type="button" className="similar_card" onClick={() => onSelect(item)}>
            <div className="similar_thumb" aria-hidden="true" />
            <div className="similar_pairing_tags" aria-label="주류+음식 태그">
              {item.pairingTitle
                .split("+")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 2)
                .map((tag) => (
                  <span key={`${item.id}-${tag}`} className="similar_pairing_tag">
                    {tag}
                  </span>
                ))}
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
