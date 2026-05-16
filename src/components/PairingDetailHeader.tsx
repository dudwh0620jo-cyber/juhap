import iconBell from "../assets/svg/bell.svg"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import iconSearch from "../assets/svg/magnifyingglass.svg"
import UserIdentityRow from "./UserIdentityRow"

type Props = {
  authorId: number | null
  authorName: string
  profile: string
  tierClassName: string
  tierLabel: string
  showTier: boolean
  isFollowing: boolean
  followDisabled: boolean
  isAuthor?: boolean
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
  isAuthor = false,
  menuAriaLabel,
  onOpenMenu,
  onBack,
  onToggleFollow,
}: Props) {
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

      <UserIdentityRow
        userId={authorId}
        className="detail_header_profile_row"
        identityClassName="detail_header_identity"
        titleClassName="detail_header_title"
        metaClassName="detail_header_meta"
        title={
          <span className="detail_author_line">
            <span className="detail_author_name_grade">
              {authorName} {showTier ? <span className={tierClassName}>{tierLabel}</span> : null}
              {isAuthor ? <span className="author_owner_badge">작성자</span> : null}
            </span>
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
          </span>
        }
        meta={profile}
        rightAction={
          typeof onOpenMenu === "function" ? (
            <button type="button" className="detail_menu_button" aria-label={menuAriaLabel ?? "설정"} onClick={onOpenMenu}>
              <img className="detail_menu_icon" src={iconDots} alt="" aria-hidden="true" />
            </button>
          ) : null
        }
      />
    </header>
  )
}
