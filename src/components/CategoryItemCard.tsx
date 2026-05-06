import { Link } from "react-router"

export type CategoryListItem = {
  id: string
  name: string
  price?: number
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

  return (
    <article className="category_item_card">
      <div className="category_item_thumb" aria-hidden="true" />
      <div className="category_item_text">
        <strong className="category_item_name">{item.name}</strong>
        {priceText ? <span className="category_item_price">{priceText}</span> : null}
        <div className="category_item_tags" aria-label="태그">
          {item.tags.map((tag) => (
            <span className="category_item_tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      {onOpen ? (
        <button className="category_item_link" type="button" aria-label={`${item.name} 상세 보기`} onClick={() => onOpen(item)}>
          →
        </button>
      ) : (
        <Link className="category_item_link" to={`/product/${item.id}`} aria-label={`${item.name} 상세 보기`}>
          →
        </Link>
      )}
    </article>
  )
}
