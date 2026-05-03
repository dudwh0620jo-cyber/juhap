type RankingTabItem<T extends string> = {
  key: T
  label: string
}

type Props<T extends string> = {
  items: readonly RankingTabItem<T>[]
  activeKey: T
  onChange: (key: T) => void
}

export default function RankingCategoryTabs<T extends string>({ items, activeKey, onChange }: Props<T>) {
  return (
    <div className="ranking_tags">
      {items.map((item) => (
        <button
          className={activeKey === item.key ? "is_active" : ""}
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

