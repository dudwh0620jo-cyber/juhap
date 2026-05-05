type Props = {
  liquorTag: string
  foodTag: string
  onSelectLiquor: () => void
  onSelectFood: () => void
}

export default function PairingTagRow({ liquorTag, foodTag, onSelectLiquor, onSelectFood }: Props) {
  if (!liquorTag || !foodTag) return null

  return (
    <div className="detail_pairing_tag_row" aria-label="주류+음식 태그">
      <button type="button" className="detail_pairing_tag" onClick={onSelectLiquor}>
        {liquorTag}
      </button>

      <button type="button" className="detail_pairing_tag" onClick={onSelectFood}>
        {foodTag}
      </button>
    </div>
  )
}

