type Props = {
  authorName: string
  profile?: string
  badgeClassName: string
  badgeText: string
  followButtonClassName: string
  followAriaLabel: string
  followText: string
  onToggleFollow: () => void
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
}: Props) {
  return (
    <header className="feed_card_header">
      <div className="avatar" />
      <div className="feed_card_header_info">
        <div className="feed_author_row">
          <h3>{authorName}</h3>
          <span className={badgeClassName}>{badgeText}</span>
        </div>
        {profile ? <p>{profile}</p> : null}
      </div>
      <button type="button" className={followButtonClassName} aria-label={followAriaLabel} onClick={onToggleFollow}>
        {followText}
      </button>
    </header>
  )
}
