import iconDots from "../assets/svg/dotsthreevertical.svg"

type Props = {
  authorName: string
  profile?: string
  badgeClassName: string
  badgeText: string
  followButtonClassName: string
  followAriaLabel: string
  followText: string
  onToggleFollow: () => void
  hideAvatar?: boolean
  menuAriaLabel?: string
  onOpenMenu?: () => void
}

export default function RelatedContentPostCardHeader({
  authorName,
  profile,
  badgeClassName,
  badgeText,
  followButtonClassName,
  followAriaLabel,
  followText,
  onToggleFollow,
  hideAvatar,
  menuAriaLabel,
  onOpenMenu,
}: Props) {
  return (
    <header className="feed_card_header">
      {hideAvatar ? null : <div className="avatar" />}
      <div className="feed_card_header_info">
        <div className="feed_author_row">
          <h3>{authorName}</h3>
          <span className={badgeClassName}>{badgeText}</span>
        </div>
        {profile ? <p>{profile}</p> : null}
      </div>
      {typeof onOpenMenu === "function" ? (
        <button
          type="button"
          className="feed_card_menu_button"
          aria-label={menuAriaLabel ?? "설정"}
          onClick={onOpenMenu}
        >
          <img className="feed_card_menu_icon" src={iconDots} alt="" aria-hidden="true" />
        </button>
      ) : (
        <button type="button" className={followButtonClassName} aria-label={followAriaLabel} onClick={onToggleFollow}>
          {followText}
        </button>
      )}
    </header>
  )
}
