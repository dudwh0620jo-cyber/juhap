import type { ReactNode } from "react"
import caretLeft from "../assets/svg/caretleft.svg"
import houseLine from "../assets/svg/house.svg"

type QuizDetailLayoutProps = {
  pageClassName: string
  pageAriaLabel: string
  bgClassName: string
  innerClassName: string
  onBack: () => void
  onHome: () => void
  topContent: ReactNode
  bodyContent: ReactNode
  onPrimaryAction: () => void
  onSecondaryAction: () => void
  primaryActionDisabled?: boolean
  actionsAriaLabel?: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
}

export default function QuizDetailLayout({
  pageClassName,
  pageAriaLabel,
  bgClassName,
  innerClassName,
  onBack,
  onHome,
  topContent,
  bodyContent,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionDisabled = false,
  actionsAriaLabel = "추천 이동",
  primaryActionLabel = "주아에게 해당 술 추천받기",
  secondaryActionLabel = "추천 리스트 보러가기",
}: QuizDetailLayoutProps) {
  return (
    <section className={pageClassName} aria-label={pageAriaLabel}>
      <div className={bgClassName} aria-hidden="true" />
      <div className={innerClassName}>
        <div>
          <header className="quiz_topbar">
            <button type="button" className="quiz_icon_button" onClick={onBack} aria-label="뒤로가기">
              <img src={caretLeft} alt="" aria-hidden="true" />
            </button>
            <div className="quiz_topbar_spacer" aria-hidden="true" />
            <button type="button" className="quiz_icon_button" onClick={onHome} aria-label="홈으로">
              <img src={houseLine} alt="" aria-hidden="true" />
            </button>
          </header>
          {topContent}
          {bodyContent}
        </div>

        <div className="quiz_previous_bottom">
          <div className="quiz_result_actions" aria-label={actionsAriaLabel}>
            <button
              type="button"
              className="quiz_result_action is_primary"
              onClick={onPrimaryAction}
              disabled={primaryActionDisabled}
            >
              {primaryActionLabel}
            </button>
            <button type="button" className="quiz_result_action is_secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
