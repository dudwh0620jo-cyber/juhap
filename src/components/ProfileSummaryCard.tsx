import type { KeyboardEvent } from "react"

type SummaryStat = {
  value: string
  label: string
}

type Props = {
  avatarSrc?: string
  title: string
  accentText?: string
  description?: string
  stats: SummaryStat[]
  menuAriaLabel?: string
  menuIconSrc?: string
  onMenuClick?: () => void
  onClick?: () => void
}

export default function ProfileSummaryCard({
  avatarSrc,
  title,
  accentText,
  description,
  stats,
  menuAriaLabel,
  menuIconSrc,
  onMenuClick,
  onClick,
}: Props) {
  const clickableProps =
    typeof onClick === "function"
      ? {
          role: "button" as const,
          tabIndex: 0,
          onClick,
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onClick()
            }
          },
        }
      : {}

  return (
    <article className={`community_follow_me_card${onClick ? " is_clickable" : ""}`} {...clickableProps}>
      <div className="community_follow_me_avatar" aria-hidden="true">
        {avatarSrc ? <img className="community_follow_me_avatar_image" src={avatarSrc} alt="" aria-hidden="true" /> : null}
      </div>
      <div className="community_follow_me_body">
        <div className="community_follow_me_top">
          <div className="community_follow_me_identity">
            <strong className="community_follow_me_name">{title}</strong>
            {accentText ? <span className="community_follow_me_grade">{accentText}</span> : null}
          </div>
          {menuAriaLabel && menuIconSrc && onMenuClick ? (
            <button
              type="button"
              className="community_follow_me_menu_button"
              aria-label={menuAriaLabel}
              onClick={(event) => {
                event.stopPropagation()
                onMenuClick()
              }}
            >
              <img className="community_follow_me_menu_icon" src={menuIconSrc} alt="" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {description ? <p className="community_follow_me_description">{description}</p> : null}
        <div className="community_follow_me_stats" aria-label="요약 정보">
          {stats.map((stat) => (
            <div className="community_follow_me_stat" key={`${stat.label}-${stat.value}`}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
