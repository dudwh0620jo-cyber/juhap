type Props = {
  authorName: string
  profile: string
  locationLabel: string
  tierClassName: string
  tierLabel: string
  showTier: boolean
  isFollowing: boolean
  followDisabled: boolean
  onBack: () => void
  onToggleFollow: () => void
}

export default function PairingDetailHeader({
  authorName,
  profile,
  locationLabel,
  tierClassName,
  tierLabel,
  showTier,
  isFollowing,
  followDisabled,
  onBack,
  onToggleFollow,
}: Props) {
  return (
    <header className="detail_header">
      <button
        type="button"
        className="detail_back_button"
        aria-label="이전 페이지로 이동"
        onClick={onBack}
      >
        ←
      </button>
      <div className="avatar" aria-hidden="true" />
      <div>
        <h1>
          {authorName}{" "}
          {showTier ? <span className={tierClassName}>{tierLabel}</span> : null}
        </h1>
        <p>{profile}</p>
        <span className="detail_location">{locationLabel}</span>
      </div>
      <button
        type="button"
        className={isFollowing ? "follow_button is_active" : "follow_button"}
        aria-pressed={isFollowing}
        disabled={followDisabled}
        onClick={onToggleFollow}
      >
        {isFollowing ? "언팔로우" : "팔로우"}
      </button>
    </header>
  )
}
