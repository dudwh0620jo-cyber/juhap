import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import "../styles/chat.css"

type ChatProps = {
  onClose: () => void
}

type ChatMessage = {
  id: number
  role: "ai" | "user"
  text: string
}

const quickSuggestions = ["라벨 스캔하기", "오늘의 날씨에 맞는 추천 자세히 받아보기", "주류문화 용어 알기"]

const initialAiMessage = "비 오는 화요일 퇴근길이네요. 오늘은 차분한 화이트 와인 한 잔 어떠세요?"

export default function Chat({ onClose }: ChatProps) {
  const [isCompact, setIsCompact] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(quickSuggestions[1])
  const [messageValue, setMessageValue] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, role: "ai", text: initialAiMessage },
  ])
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 12)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ block: "end" })
  }, [chatMessages, isCompact])

  function closeModal() {
    setIsVisible(false)
    setTimeout(onClose, 220)
  }

  function selectSuggestion(suggestion: string) {
    setSelectedPrompt(suggestion)
    setIsCompact(true)
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedMessage = messageValue.trim()
    if (!trimmedMessage) {
      return
    }

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length + 1, role: "user", text: trimmedMessage },
    ])
    setMessageValue("")
    setIsCompact(true)
  }

  return (
    <section className="chat_page" aria-label="채팅" onClick={closeModal}>
      <div className="chat_overlay">
        <div
          className={isVisible ? "chat_sheet is_open" : "chat_sheet"}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="chat_header">
            <button type="button" aria-label="닫기" onClick={closeModal}>
              <span />
              <span />
            </button>
          </header>

          {!isCompact ? (
            <section className="chat_intro">
              <div className="chat_hero">
                <div className="ai_face ai_face_large" aria-hidden="true" />
                <p>
                  비 오는 화요일 퇴근길이네요.
                  <br />
                  오늘은 차분한 화이트 와인 한 잔 어떠세요?
                </p>
              </div>

              <div className="chat_suggestion_list">
                {quickSuggestions.map((item) => (
                  <button type="button" key={item} onClick={() => selectSuggestion(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="chat_thread">
              <div className="chat_bubble_row">
                <div className="ai_face ai_face_small" aria-hidden="true" />
                <p>{chatMessages[0]?.text ?? initialAiMessage}</p>
              </div>
              <button type="button" className="selected_chip">
                {selectedPrompt}
              </button>
              <div className="chat_messages">
                {chatMessages.slice(1).map((message) =>
                  message.role === "ai" ? (
                    <div className="chat_bubble_row" key={message.id}>
                      <div className="ai_face ai_face_small" aria-hidden="true" />
                      <p>{message.text}</p>
                    </div>
                  ) : (
                    <div className="chat_bubble_row user_bubble_row" key={message.id}>
                      <p>{message.text}</p>
                    </div>
                  ),
                )}
                <div ref={endOfMessagesRef} />
              </div>
            </section>
          )}

          <form className="chat_input_bar" onSubmit={submitMessage}>
            <input
              aria-label="채팅 입력"
              onFocus={() => setIsCompact(true)}
              placeholder="메시지를 입력해보세요"
              value={messageValue}
              onChange={(event) => setMessageValue(event.target.value)}
            />
            <button
              type="submit"
              className={messageValue.trim() ? "confirm_button is_visible" : "confirm_button"}
              aria-label="입력 확인"
              disabled={!messageValue.trim()}
            >
              확인
            </button>
            <button type="button" className="camera_button" aria-label="카메라 스캔">
              📷
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
