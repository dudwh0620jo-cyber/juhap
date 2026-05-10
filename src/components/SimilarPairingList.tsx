export type SimilarPairingItem = {
  id: number
  pairingTitle: string
  authorId: number
  authorName: string
  profile: string
  locationLabel: string
  drinkType: string
  imageSrc?: string
  title?: string
  rating?: number
  reviewCount?: number
}

type Props = {
  items: SimilarPairingItem[]
  onSelect: (item: SimilarPairingItem) => void
  title?: string
}

export default function SimilarPairingList({ items, onSelect, title }: Props) {
  return (
    <>
      <h3 className="similar_title">{title ?? "유사한 입맛의 조합 둘러보기"}</h3>
      <div className="similar_list" aria-label="유사 페어링 추천">
        {items.map((item) => (
          <button key={item.id} type="button" className="similar_card" onClick={() => onSelect(item)}>
            <div className="similar_thumb" aria-hidden="true">
              {item.imageSrc ? <img className="similar_thumb_image" src={item.imageSrc} alt="" aria-hidden="true" /> : null}
            </div>
            <strong className="similar_card_title">{item.title ?? item.pairingTitle}</strong>
            {typeof item.rating === "number" ? (
              <p className="similar_card_meta">
                <span className="similar_card_star">★</span> {item.rating.toFixed(1)} ({(item.reviewCount ?? 0).toLocaleString("ko-KR")})
              </p>
            ) : null}
          </button>
        ))}
      </div>
    </>
  )
}
