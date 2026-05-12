import type { ReactNode } from "react"
import { resolveUserAvatar } from "../utils/userAvatars"

type Props = {
  userId: number | null
  title: ReactNode
  meta?: ReactNode
  titleMeta?: ReactNode
  rightAction?: ReactNode
  avatarFallback?: ReactNode
  onPressProfile?: () => void
  className?: string
  identityClassName?: string
  titleClassName?: string
  metaClassName?: string
}

export default function UserIdentityRow({
  userId,
  title,
  meta,
  titleMeta,
  rightAction,
  avatarFallback,
  onPressProfile,
  className,
  identityClassName,
  titleClassName,
  metaClassName,
}: Props) {
  const avatarSrc = userId !== null ? resolveUserAvatar(userId) : undefined
  const rootClassName = className ? `user_identity_row ${className}` : "user_identity_row"
  const textClassName = identityClassName ? `user_identity_text ${identityClassName}` : "user_identity_text"
  const headingClassName = titleClassName ? `user_identity_title ${titleClassName}` : "user_identity_title"
  const secondaryClassName = metaClassName ? `user_identity_meta ${metaClassName}` : "user_identity_meta"
  const avatarContent = avatarSrc ? (
    <img className="avatar_image" src={avatarSrc} alt="" aria-hidden="true" />
  ) : (
    avatarFallback
  )

  return (
    <div className={rootClassName}>
      {typeof onPressProfile === "function" ? (
        <button type="button" className="avatar user_identity_avatar_button" onClick={onPressProfile} aria-label="프로필 보기">
          {avatarContent}
        </button>
      ) : (
        <div className="avatar" aria-hidden="true">
          {avatarContent}
        </div>
      )}

      <div className={textClassName}>
        <div className={headingClassName}>
          {title}
          {titleMeta ? <span className="user_identity_title_meta">{titleMeta}</span> : null}
        </div>
        {meta ? <div className={secondaryClassName}>{meta}</div> : null}
      </div>

      {rightAction ? <div className="user_identity_action">{rightAction}</div> : null}
    </div>
  )
}
