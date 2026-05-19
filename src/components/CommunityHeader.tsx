import iconBell from "../assets/svg/bell.svg"
import iconSearch from "../assets/svg/magnifyingglass.svg"

type TopTabKey = "ranking" | "feed"

type CommunityHeaderTab = { key: TopTabKey; label: string }

type Props = {
  title: string
  topTab: TopTabKey
  tabs?: CommunityHeaderTab[]
  onOpenFilter: () => void
  onOpenNotifications?: () => void
  notificationsDisabled?: boolean
  onSelectTab?: (tab: TopTabKey) => void
  tabsAriaLabel?: string
  openFilterAriaLabel: string
  openNotificationsAriaLabel?: string
  showFilterAction?: boolean
  hideActions?: boolean
}

export default function CommunityHeader({
  title,
  topTab,
  tabs,
  onOpenFilter,
  onOpenNotifications,
  notificationsDisabled = false,
  onSelectTab,
  tabsAriaLabel,
  openFilterAriaLabel,
  openNotificationsAriaLabel,
  showFilterAction = true,
  hideActions = false,
}: Props) {
  const tabItems = tabs ?? []
  const showTabs = tabItems.length >= 2
  const canShowActions = !hideActions && (showFilterAction || Boolean(onOpenNotifications) || notificationsDisabled)

  return (
    <header className="community_header">
      <h3 className="community_title">{title}</h3>

      {canShowActions ? (
        <div className="community_header_actions" aria-label="커뮤니티 헤더 액션">
          {showFilterAction ? (
            <button
              className="community_header_action_button"
              type="button"
              aria-label={openFilterAriaLabel}
              onClick={onOpenFilter}
            >
              <img className="community_header_action_icon" src={iconSearch} alt="" aria-hidden="true" />
            </button>
          ) : null}

          {onOpenNotifications || notificationsDisabled ? (
            <button
              className={notificationsDisabled ? "community_header_action_button is_disabled" : "community_header_action_button"}
              type="button"
              aria-label={openNotificationsAriaLabel ?? "알림 열기"}
              onClick={notificationsDisabled ? undefined : onOpenNotifications}
              disabled={notificationsDisabled}
            >
              <img className="community_header_action_icon" src={iconBell} alt="" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

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
