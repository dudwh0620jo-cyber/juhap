type TopTabKey = "ranking" | "feed"

type CommunityHeaderTab = { key: TopTabKey; label: string }

type Props = {
  title: string
  topTab: TopTabKey
  tabs?: CommunityHeaderTab[]
  onOpenFilter: () => void
  onSelectTab?: (tab: TopTabKey) => void
  tabsAriaLabel?: string
  openFilterAriaLabel: string
}

export default function CommunityHeader({
  title,
  topTab,
  tabs,
  onOpenFilter,
  onSelectTab,
  tabsAriaLabel,
  openFilterAriaLabel,
}: Props) {
  const tabItems = tabs ?? []
  const showTabs = tabItems.length >= 2

  return (
    <header className="community_header">
      <h3 className="community_title">{title}</h3>
      <button className="search_button" type="button" aria-label={openFilterAriaLabel} onClick={onOpenFilter}>
        <span />
      </button>
      {showTabs ? (
        <div className="community_tabs" aria-label={tabsAriaLabel ?? "커뮤니티 탭"}>
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              className={topTab === tab.key ? "is_active" : ""}
              onClick={() => onSelectTab?.(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}
    </header>
  )
}

