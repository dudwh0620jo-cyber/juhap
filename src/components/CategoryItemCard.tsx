import { Link } from "react-router"

export type CategoryListItem = {
  id: string
  name: string
  subGroup: string
  tags: string[]
  keywords: string[]
}

type Props = {
  item: CategoryListItem
}

export default function CategoryItemCard({ item }: Props) {
  return (
    <article className="category_item_card">
      <div className="category_item_thumb" aria-hidden="true" />
      <div className="category_item_text">
        <strong className="category_item_name">{item.name}</strong>
        <div className="category_item_tags" aria-label="태그">
          {item.tags.map((tag) => (
            <span className="category_item_tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Link className="category_item_link" to={`/product/${item.id}`} aria-label={`${item.name} 상세 보기`}>
        →
      </Link>
    </article>
  )
}
