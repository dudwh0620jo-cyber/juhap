import { Link } from "react-router"
import arrowRightIcon from "../assets/svg/arrowright_p.svg"

export type CategoryListItem = {
  id: string
  name: string
  imageSrc?: string
  price?: number
  abv?: number
  drinkTypeLabel?: string
  subcategory?: string
  detailCategories?: string[]
  features?: string[]
  searchTags?: string[]
  priceLabel?: string
  subGroup?: string
  tags: string[]
  keywords: string[]
}

type Props = {
  item: CategoryListItem
  onOpen?: (item: CategoryListItem) => void
}

export default function CategoryItemCard({ item, onOpen }: Props) {
  const priceText = item.price !== undefined ? `${item.price.toLocaleString()}원` : item.priceLabel
  const isCardClickable = Boolean(onOpen)

  return (
    <article
      className="category_item_card"
      onClick={onOpen ? () => onOpen(item) : undefined}
      role={isCardClickable ? "button" : undefined}
      tabIndex={isCardClickable ? 0 : undefined}
      onKeyDown={
        onOpen
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onOpen(item)
              }
            }
          : undefined
      }
    >
      <div className="category_item_thumb" aria-hidden="true">
        {item.imageSrc ? <img className="category_item_thumb_img" src={item.imageSrc} alt="" aria-hidden="true" /> : null}
      </div>
      <div className="category_item_text">
        <div className="category_item_main">
          <strong className="category_item_name">{item.name}</strong>
          {priceText ? <span className="category_item_price">{priceText}</span> : null}
        </div>
        <div className="category_item_tags" aria-label="태그">
          {item.tags.map((tag) => (
            <span className="category_item_tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      {onOpen ? (
        <button
          className="category_item_link"
          type="button"
          aria-label={`${item.name} 상세 보기`}
          onClick={(event) => {
            event.stopPropagation()
            onOpen(item)
          }}
        >
          <img className="category_item_link_icon" src={arrowRightIcon} alt="" aria-hidden="true" />
        </button>
      ) : (
        <Link className="category_item_link" to={`/product/${item.id}`} aria-label={`${item.name} 상세 보기`}>
          <img className="category_item_link_icon" src={arrowRightIcon} alt="" aria-hidden="true" />
        </Link>
      )}
    </article>
  )
}

