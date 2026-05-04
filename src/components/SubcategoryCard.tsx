import { useRef, useState } from "react"

export type SubcategorySearchResult = {
  groupId: string
  groupLabel: string
  itemLabel: string
}

type Props = {
  result: SubcategorySearchResult
  isSojuFlavor: boolean
  onClick: (groupLabel: string, itemLabel: string) => void
}

export default function SubcategoryCard({ result, isSojuFlavor, onClick }: Props) {
  const [isInfoVisible, setIsInfoVisible] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const openInfo = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setIsInfoVisible(true)
    timeoutRef.current = window.setTimeout(() => setIsInfoVisible(false), 5000)
  }

  if (!isSojuFlavor) {
    return (
      <div className="subcategory_card">
        <button
          className="subcategory_card_button"
          type="button"
          onClick={() => onClick(result.groupLabel, result.itemLabel)}
        >
          {result.itemLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="subcategory_card">
      <button
        className="subcategory_card_button"
        type="button"
        onClick={() => onClick(result.groupLabel, result.itemLabel)}
      >
        {result.itemLabel}
      </button>
      <button
        type="button"
        className="subcategory_info_button"
        aria-label="플레이버 안내"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          openInfo()
        }}
      >
        i
      </button>
      <div
        className={isInfoVisible ? "subcategory_info_bubble is_visible" : "subcategory_info_bubble"}
        role="status"
        aria-live="polite"
      >
        과일향이나 특정 향/맛이 가향된 소주를 말해요.
      </div>
    </div>
  )
}
