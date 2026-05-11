import PairingTagRow from "./PairingTagRow"
import iconStar from "../assets/svg/star.svg"

export type SimilarPairingItem = {
  id: number
  pairingTitle: string
  authorId: number
  authorName: string
  profile: string
  locationLabel: string
  drinkType: string
  foodTag?: string
  imageSrc?: string
  title?: string
  rating?: number
  reviewCount?: number
}

type Props = {
  items: SimilarPairingItem[]
  onSelect: (item: SimilarPairingItem) => void
  title?: string
  titleVariant?: "tag" | "text"
}

export default function SimilarPairingList({ items, onSelect, title, titleVariant = "tag" }: Props) {
  const isTextVariant = titleVariant === "text"

  return (
    <>
      <h3 className="similar_title">{title ?? "유사한 페어링 조합 둘러보기"}</h3>
      <div className="similar_list" aria-label="유사 페어링 추천">
        {items.map((item) => (
          <button key={item.id} type="button" className="similar_card" onClick={() => onSelect(item)}>
            <div className="similar_thumb" aria-hidden="true">
              {item.imageSrc ? <img className="similar_thumb_image" src={item.imageSrc} alt="" aria-hidden="true" /> : null}
            </div>
            {item.drinkType && item.foodTag ? (
              <PairingTagRow
                liquorTag={item.drinkType}
                foodTag={item.foodTag}
                containerClassName={isTextVariant ? "similar_card_title is_text" : "similar_card_title"}
                tagClassName={isTextVariant ? "similar_card_plain_tag" : "similar_card_tag"}
                joinerClassName="similar_card_joiner"
                lineClassName={isTextVariant ? "similar_card_text_line" : ""}
                showJoiner
                wrapJoinerToNextLine={isTextVariant}
              />
            ) : (
              <strong className="similar_card_title">{item.title ?? item.pairingTitle}</strong>
            )}
            {typeof item.rating === "number" ? (
              <p className="similar_card_meta">
                <img className="similar_card_star" src={iconStar} alt="" aria-hidden="true" />{" "}
                {item.rating.toFixed(1)} ({(item.reviewCount ?? 0).toLocaleString("ko-KR")})
              </p>
            ) : null}
          </button>
        ))}
      </div>
    </>
  )
}
