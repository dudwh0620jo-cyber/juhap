import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"

type Props = {
  authorName: string
  profile: string
  locationLabel: string
  tierClassName: string
  tierLabel: string
  showTier: boolean
  isFollowing: boolean
  followDisabled: boolean
  menuAriaLabel?: string
  onOpenMenu?: () => void
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
  menuAriaLabel,
  onOpenMenu,
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
        <img src={iconCaretLeft} alt="" aria-hidden="true" />
      </button>
      <div className="avatar" aria-hidden="true" />
      <div>
        <h1>
          {authorName}{" "}
          {showTier ? <span className={tierClassName}>{tierLabel}</span> : null}
        </h1>
        <p>{profile}</p>
        {locationLabel ? <span className="detail_location">{locationLabel}</span> : null}
      </div>
      {typeof onOpenMenu === "function" ? (
        <button type="button" className="detail_menu_button" aria-label={menuAriaLabel ?? "설정"} onClick={onOpenMenu}>
          <img className="detail_menu_icon" src={iconDots} alt="" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          className={isFollowing ? "follow_button is_active" : "follow_button"}
          aria-pressed={isFollowing}
          disabled={followDisabled}
          onClick={onToggleFollow}
        >
          {isFollowing ? "언팔로우" : "팔로우"}
        </button>
      )}
    </header>
  )
}
