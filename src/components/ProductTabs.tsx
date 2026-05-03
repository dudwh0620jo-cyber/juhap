export type DetailTab = "spec" | "review" | "pairing"

const tabs: Array<{ key: DetailTab; label: string }> = [
  { key: "spec", label: "술정보" },
  { key: "review", label: "후기" },
  { key: "pairing", label: "페어링추천" },
]

type Props = {
  activeTab: DetailTab
  onTabChange: (tab: DetailTab) => void
}

export default function ProductTabs({ activeTab, onTabChange }: Props) {
  return (
    <nav className="product_tabs" aria-label="상세 탭">
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          className={activeTab === item.key ? "is_active" : ""}
          onClick={() => onTabChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
