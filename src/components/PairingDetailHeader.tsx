import iconBell from "../assets/svg/bell.svg"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import iconSearch from "../assets/svg/magnifyingglass.svg"
import { resolveUserAvatar } from "../utils/userAvatars"

type Props = {
  authorId: number | null
  authorName: string
  profile: string
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
  authorId,
  authorName,
  profile,
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
  const authorAvatarSrc = authorId !== null ? resolveUserAvatar(authorId) : undefined

  return (
    <header className="detail_header">
      <div className="detail_header_top">
        <button type="button" className="detail_back_button" aria-label="이전 페이지로 이동" onClick={onBack}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
        <div className="detail_header_quick_actions" aria-label="상세 페이지 상단 액션">
          <button type="button" className="detail_header_action_button" aria-label="검색">
            <img src={iconSearch} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="detail_header_action_button" aria-label="알림">
            <img src={iconBell} alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="detail_header_profile_row">
        <div className="avatar" aria-hidden="true">
          {authorAvatarSrc ? <img className="avatar_image" src={authorAvatarSrc} alt="" aria-hidden="true" /> : null}
        </div>

        <div className="detail_header_identity">
          <h1>
            {authorName} {showTier ? <span className={tierClassName}>{tierLabel}</span> : null}
            {typeof onOpenMenu !== "function" ? <span className="detail_follow_divider">ㆍ</span> : null}
            {typeof onOpenMenu !== "function" ? (
              <button
                type="button"
                className={isFollowing ? "follow_button is_active" : "follow_button"}
                aria-pressed={isFollowing}
                disabled={followDisabled}
                onClick={onToggleFollow}
              >
                {isFollowing ? "언팔로우" : "팔로우"}
              </button>
            ) : null}
          </h1>
          <p>{profile}</p>
        </div>

        {typeof onOpenMenu === "function" ? (
          <button type="button" className="detail_menu_button" aria-label={menuAriaLabel ?? "설정"} onClick={onOpenMenu}>
            <img className="detail_menu_icon" src={iconDots} alt="" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </header>
  )
}
