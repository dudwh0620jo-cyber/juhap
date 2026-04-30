import { useEffect, useState } from "react"
import "../styles/chat.css"

type ChatProps = {
  onClose: () => void
}

const quickSuggestions = [
  "라벨 스캔하기",
  "오늘의 날씨에 맞는 추천 자세히 받아보기",
  "주류문화 용어 알기",
]

export default function Chat({ onClose }: ChatProps) {
  const [isCompact, setIsCompact] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(quickSuggestions[1])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 12)
    return () => clearTimeout(timer)
  }, [])

  function closeModal() {
    setIsVisible(false)
    setTimeout(onClose, 220)
  }

  function selectSuggestion(suggestion: string) {
    setSelectedPrompt(suggestion)
    setIsCompact(true)
  }

  return (
    <section className="chat_page" aria-label="채팅">
      <div className={isVisible ? "chat_sheet is_open" : "chat_sheet"}>
        <header className="chat_header">
          <button type="button" aria-label="닫기" onClick={closeModal}>
            <span />
            <span />
          </button>
        </header>

        {!isCompact ? (
          <section className="chat_intro">
            <div className="chat_hero">
              <div className="ai_face ai_face_large" aria-hidden="true">
                <span />
              </div>
              <p>“비 오는 화요일 퇴근길이네요. 오늘은 차분한 화이트 와인 한 잔 어떠세요?”</p>
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
            <button type="button" className="selected_chip">
              {selectedPrompt}
            </button>
            <div className="chat_bubble_row">
              <div className="ai_face ai_face_small" aria-hidden="true">
                <span />
              </div>
              <p>비 오는 화요일 퇴근길이네요. 오늘은 차분한 화이트 와인 한 잔 어떠세요?</p>
            </div>
          </section>
        )}

        <footer className="chat_input_bar">
          <button type="button" aria-label="이전">
            ↩
          </button>
          <input
            aria-label="채팅 입력"
            onFocus={() => setIsCompact(true)}
            placeholder="메시지를 입력해보세요"
          />
          <button type="button" aria-label="카메라">
            📷
          </button>
        </footer>
      </div>
    </section>
  )
}
