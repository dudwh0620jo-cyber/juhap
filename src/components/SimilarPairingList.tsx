export type SimilarPairingItem = {
  id: number
  pairingTitle: string
  authorId: number
  authorName: string
  profile: string
  locationLabel: string
  drinkType: string
}

type Props = {
  items: SimilarPairingItem[]
  onSelect: (item: SimilarPairingItem) => void
}

export default function SimilarPairingList({ items, onSelect }: Props) {
  return (
    <>
      <h3 className="similar_title">유사한 분위기 조합 둘러보기</h3>
      <div className="similar_list" aria-label="유사한 페어링 추천">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="similar_card"
            onClick={() => onSelect(item)}
          >
            <div className="similar_thumb" aria-hidden="true" />
            <p>{item.pairingTitle}</p>
          </button>
        ))}
      </div>
    </>
  )
}
