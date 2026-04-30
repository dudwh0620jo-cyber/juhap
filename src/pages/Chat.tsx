import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import "../styles/chat.css"

const quickSuggestions = [
  "라벨 스캔하기",
  "오늘의 날씨에 맞는 추천 자세히 받아보기",
  "주류문화 용어 알기",
]

export default function Chat() {
  const navigate = useNavigate()
  const [isCompact, setIsCompact] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(quickSuggestions[1])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 12)
    return () => clearTimeout(timer)
  }, [])

  function closeModal() {
    setIsVisible(false)
    setTimeout(() => navigate("/home"), 220)
  }

  function selectSuggestion(suggestion: string) {
    setSelectedPrompt(suggestion)
    setIsCompact(true)
  }

  function focusInput() {
    setIsCompact(true)
  }

  return (
    <section className="chat-page page-screen" aria-label="채팅">
      <div className={isVisible ? "chat-sheet is-open" : "chat-sheet"}>
        <header className="chat-header">
          <button type="button" aria-label="닫기" onClick={closeModal}>
            <span />
            <span />
          </button>
        </header>

        {!isCompact ? (
          <section className="chat-intro">
            <div className="chat-hero">
              <div className="ai-face ai-face--large" aria-hidden="true">
                <span />
              </div>
              <p>“비 오는 화요일 퇴근길이네요. 오늘은 차분한 화이트 와인 한 잔 어떠세요?”</p>
            </div>

            <div className="chat-suggestion-list">
              {quickSuggestions.map((item) => (
                <button type="button" key={item} onClick={() => selectSuggestion(item)}>
                  {item}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="chat-thread">
            <button type="button" className="selected-chip">
              {selectedPrompt}
            </button>
            <div className="chat-bubble-row">
              <div className="ai-face ai-face--small" aria-hidden="true">
                <span />
              </div>
              <p>비 오는 화요일 퇴근길이네요. 오늘은 차분한 화이트 와인 한 잔 어떠세요?</p>
            </div>
          </section>
        )}

        <footer className="chat-input-bar">
          <button type="button" aria-label="이전">
            ↩
          </button>
          <input
            placeholder="메시지를 입력해보세요"
            onFocus={focusInput}
            aria-label="채팅 입력"
          />
          <button type="button" aria-label="카메라">
            📷
          </button>
        </footer>
      </div>
    </section>
  )
}
