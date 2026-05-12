import type { ReactNode } from "react"

type ChatChoiceRowProps = {
  echoText: string | null
  echoAriaLabel?: string
  children: ReactNode
}

export default function ChatChoiceRow({ echoText, echoAriaLabel = "방금 선택한 답변", children }: ChatChoiceRowProps) {
  return (
    <div className="chat_choice_row">
      <div className="chat_chip_group">{children}</div>
      {echoText ? (
        <div className="chat_choice_echo chat_bubble_row user_bubble_row" aria-label={echoAriaLabel}>
          <p>{echoText}</p>
        </div>
      ) : null}
    </div>
  )
}
