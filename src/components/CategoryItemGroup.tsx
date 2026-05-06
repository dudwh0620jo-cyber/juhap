import CategoryItemCard from "./CategoryItemCard"
import type { CategoryListItem } from "./CategoryItemCard"

type Props = {
  group: {
    title: string
    items: CategoryListItem[]
  }
}

export default function CategoryItemGroup({ group }: Props) {
  return (
    <section className="category_item_group" aria-label={group.title}>
      <h3 className="category_group_title">{group.title}</h3>
      <div className="category_group_cards">
        {group.items.map((item) => (
          <CategoryItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
