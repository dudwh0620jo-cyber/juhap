import type { ReactNode } from "react"
import iconCaretLeft from "../assets/svg/caretleft.svg"

type Props = {
  onBack: () => void
  className?: string
  backButtonClassName?: string
  backAriaLabel?: string
  rightAction?: ReactNode
}

export default function DetailHeaderTop({
  onBack,
  className = "",
  backButtonClassName = "detail_back_button",
  backAriaLabel = "이전 페이지로 이동",
  rightAction,
}: Props) {
  const rootClassName = ["detail_header_top", className].filter(Boolean).join(" ")

  return (
    <div className={rootClassName}>
      <button type="button" className={backButtonClassName} aria-label={backAriaLabel} onClick={onBack}>
        <img src={iconCaretLeft} alt="" aria-hidden="true" />
      </button>
      {rightAction}
    </div>
  )
}
