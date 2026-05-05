import iconBell from "../imgs/svg/bell.svg"
import iconSearch from "../imgs/svg/magnifyingglass.svg"

type TopTabKey = "ranking" | "feed"

type CommunityHeaderTab = { key: TopTabKey; label: string }

type Props = {
  title: string
  topTab: TopTabKey
  tabs?: CommunityHeaderTab[]
  onOpenFilter: () => void
  onOpenNotifications?: () => void
  onSelectTab?: (tab: TopTabKey) => void
  tabsAriaLabel?: string
  openFilterAriaLabel: string
  openNotificationsAriaLabel?: string
}

export default function CommunityHeader({
  title,
  topTab,
  tabs,
  onOpenFilter,
  onOpenNotifications,
  onSelectTab,
  tabsAriaLabel,
  openFilterAriaLabel,
  openNotificationsAriaLabel,
}: Props) {
  const tabItems = tabs ?? []
  const showTabs = tabItems.length >= 2

  return (
    <header className="community_header">
      <h3 className="community_title">{title}</h3>

      <div className="community_header_actions" aria-label="커뮤니티 헤더 액션">
        <button
          className="community_header_action_button"
          type="button"
          aria-label={openFilterAriaLabel}
          onClick={onOpenFilter}
        >
          <img className="community_header_action_icon" src={iconSearch} alt="" aria-hidden="true" />
        </button>

        {onOpenNotifications ? (
          <button
            className="community_header_action_button"
            type="button"
            aria-label={openNotificationsAriaLabel ?? "알림 열기"}
            onClick={onOpenNotifications}
          >
            <img className="community_header_action_icon" src={iconBell} alt="" aria-hidden="true" />
          </button>
        ) : null}
      </div>

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

