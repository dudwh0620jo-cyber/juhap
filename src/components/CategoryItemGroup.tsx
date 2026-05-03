import CategoryItemCard from "./CategoryItemCard"
import type { CategoryListItem } from "./CategoryItemCard"

type Props = {
  group: {
    subGroup: string
    items: CategoryListItem[]
  }
}

export default function CategoryItemGroup({ group }: Props) {
  return (
    <section className="category_item_group" aria-label={group.subGroup}>
      <h3 className="category_group_title">{group.subGroup}</h3>
      <div className="category_group_cards">
        {group.items.map((item) => (
          <CategoryItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
