import { useEffect, useMemo, useReducer, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"
import ChatStepPanel from "../components/ChatStepPanel"
import "../styles/chat.css"
import {
  getTopRecommendations,
  foodCategoryOptions,
  glossaryDefinitionByTopic,
  glossaryOptions,
  introPromptOptions,
  partyMoodOptions,
  wineCandidatesMock,
  type ChatMessage,
  type ChatSession,
  type ChatStep,
  type WineCandidate,
} from "../utils/chatBotFlow"

type ChatProps = {
  onClose: () => void
  userName?: string
}

type ChatState = {
  step: ChatStep
  session: ChatSession
  messages: ChatMessage[]
  selectedWine: WineCandidate | null
}

type ChatAction =
  | { type: "SELECT_INTRO_PROMPT"; value: (typeof introPromptOptions)[number] }
  | { type: "SELECT_GLOSSARY_TOPIC"; value: string }
  | { type: "SELECT_PARTY_MOOD"; value: string }
  | { type: "SELECT_FOOD"; value: string }
  | { type: "SELECT_WINE_STYLE"; value: string }
  | { type: "SELECT_RECOMMENDATION"; wineId: string }
  | { type: "OPEN_DETAIL"; wineId: string }
  | { type: "OPEN_PAIRING" }
  | { type: "BACK_TO_RECOMMEND" }
  | { type: "SHOW_MORE_RECOMMENDATIONS"; currentIds: string[] }
  | { type: "CONFIRM_SELECTION" }
  | { type: "APPEND_USER_MESSAGE"; text: string }

const scanPromptLabel = "주류 스캔하기" satisfies (typeof introPromptOptions)[number]
const fastPromptLabel = "오늘의 추천 빠르게 받기" satisfies (typeof introPromptOptions)[number]
const glossaryPromptLabel = "주류 문화 용어 알아보기" satisfies (typeof introPromptOptions)[number]
const PANEL_TRANSITION_MS = 120
const AI_TYPING_BUBBLE_MS = 260
const STEP_PANEL_APPEAR_MS = 80

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "")
}

function findBestOptionMatch(options: readonly string[], rawInput: string) {
  const input = normalizeKeyword(rawInput)
  if (!input) return null

  const exact = options.find((option) => normalizeKeyword(option) === input)
  if (exact) return exact

  return (
    options.find((option) => normalizeKeyword(option).includes(input)) ??
    options.find((option) => input.includes(normalizeKeyword(option))) ??
    null
  )
}

function buildGreetingMessage(userName: string) {
  return [
    `안녕하세요! ${userName}님!`,
    "어떤 자리의 술을 찾고 계신가요?",
    "상황을 알려주시면",
    "완벽한 한 잔을 추천해드릴게요!",
  ].join("\n")
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function pushAi(messages: ChatMessage[], text: string) {
  return [...messages, { id: createMessageId(), role: "ai" as const, text }]
}

function pushUser(messages: ChatMessage[], text: string) {
  return [...messages, { id: createMessageId(), role: "user" as const, text }]
}

function getNextAiPrompt(step: ChatStep) {
  switch (step) {
    case "glossary":
      return "알고 싶은 용어를 골라주세요."
    case "party_mood":
      return "어떤 분위기의 모임인가요? 캐주얼한지, 조금 더 격식 있는지 알려주세요."
    case "food":
      return "어떤 음식과 함께 드실 예정인가요? 가장 가까운 걸 골라주세요."
    case "wine_style":
      return "선호하는 주종이 있나요? 와인/사케 중에서 가장 끌리는 스타일을 골라주세요."
    case "recommend":
      return "좋은 선택이에요! 상황에 맞는 추천을 준비해볼게요."
    case "detail":
      return "좋아요. 이 추천 주류에 대해 핵심만 정리해드릴게요."
    case "pairing":
      return "페어링까지 준비하면 완벽해요. 같이 즐기면 좋은 음식도 알려드릴게요."
    case "done":
      return "선택 완료! 이 구성으로 준비하면 정말 좋을 것 같아요."
    default:
      return ""
  }
}

function getWineById(wineId: string) {
  return wineCandidatesMock.find((candidate) => candidate.id === wineId) ?? null
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "APPEND_USER_MESSAGE":
      return { ...state, messages: pushUser(state.messages, action.text) }

    case "SELECT_INTRO_PROMPT": {
      const session = { ...state.session, introPrompt: action.value }
      const messagesAfterUser = pushUser(state.messages, action.value)

      if (action.value === glossaryPromptLabel) {
        const messages = pushAi(messagesAfterUser, "원하는 용어를 골라주시면 쉽게 설명해드릴게요.")
        return { ...state, step: "glossary", session, messages }
      }

      const messages = pushAi(messagesAfterUser, getNextAiPrompt("party_mood"))
      return { ...state, step: "party_mood", session, messages }
    }

    case "SELECT_GLOSSARY_TOPIC": {
      const session = { ...state.session, glossaryTopic: action.value }
      const definition = glossaryDefinitionByTopic[action.value as keyof typeof glossaryDefinitionByTopic]
      const messagesAfterDefinition = definition ? pushAi(state.messages, definition) : state.messages
      const messages = pushAi(messagesAfterDefinition, "다른 용어도 궁금하면 또 골라주세요.")
      return { ...state, step: "glossary", session, messages }
    }

    case "SELECT_PARTY_MOOD": {
      const session = { ...state.session, partyMood: action.value }
      const messages = pushAi(state.messages, getNextAiPrompt("food"))
      return { ...state, step: "food", session, messages }
    }

    case "SELECT_FOOD": {
      const session = { ...state.session, foodCategory: action.value }
      const messages = pushAi(state.messages, getNextAiPrompt("wine_style"))
      return { ...state, step: "wine_style", session, messages }
    }

    case "SELECT_WINE_STYLE": {
      const session: ChatSession = {
        ...state.session,
        wineStyle: action.value,
        recommendationCursor: 0,
        lastRecommendationIds: [],
      }
      const messages = pushAi(state.messages, getNextAiPrompt("recommend"))
      return { ...state, step: "recommend", session, messages }
    }

    case "SHOW_MORE_RECOMMENDATIONS": {
      const currentCursor = state.session.recommendationCursor ?? 0
      const session = {
        ...state.session,
        recommendationCursor: currentCursor + 2,
        lastRecommendationIds: action.currentIds,
        selectedWineId: undefined,
      }
      return { ...state, session, selectedWine: null }
    }

    case "SELECT_RECOMMENDATION": {
      const selectedWine = getWineById(action.wineId)
      if (!selectedWine) return state
      const session = { ...state.session, selectedWineId: selectedWine.id }
      return { ...state, session, selectedWine }
    }

    case "OPEN_DETAIL": {
      const selectedWine = getWineById(action.wineId)
      if (!selectedWine) return state
      const session = { ...state.session, selectedWineId: selectedWine.id }
      const messages = pushAi(state.messages, getNextAiPrompt("detail"))
      return { ...state, step: "detail", session, messages, selectedWine }
    }

    case "OPEN_PAIRING": {
      if (!state.selectedWine) return state
      const messages = pushAi(state.messages, getNextAiPrompt("pairing"))
      return { ...state, step: "pairing", messages }
    }

    case "BACK_TO_RECOMMEND": {
      const messages = pushAi(state.messages, "다른 추천도 볼까요? 아래에서 골라주세요.")
      return { ...state, step: "recommend", messages }
    }

    case "CONFIRM_SELECTION": {
      if (!state.selectedWine) return state
      const messages = pushAi(state.messages, getNextAiPrompt("done"))
      return { ...state, step: "done", messages }
    }

    default:
      return state
  }
}

export default function Chat({ onClose, userName: userNameProp }: ChatProps) {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [messageValue, setMessageValue] = useState("")
  const [isIntroClosing, setIsIntroClosing] = useState(false)
  const [selectionEcho, setSelectionEcho] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isStepPanelVisible, setIsStepPanelVisible] = useState(true)
  const actionLockRef = useRef(false)

  const userName = userNameProp?.trim() ? userNameProp.trim() : "회원"
  const initialAiMessage = useMemo(() => buildGreetingMessage(userName), [userName])

  const [state, dispatch] = useReducer(chatReducer, undefined, () => ({
    step: "intro" as const,
    session: {},
    messages: [{ id: createMessageId(), role: "ai" as const, text: buildGreetingMessage(userName) }],
    selectedWine: null,
  }))

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null)
  const introTransitionTimeoutRef = useRef<number | null>(null)
  const selectionEchoTimeoutRef = useRef<number | null>(null)
  const stepPanelTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 12)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const bodyStyle = document.body.style
    const scrollY = window.scrollY

    const previous = {
      position: bodyStyle.position,
      top: bodyStyle.top,
      left: bodyStyle.left,
      right: bodyStyle.right,
      width: bodyStyle.width,
      overflow: bodyStyle.overflow,
    }

    bodyStyle.position = "fixed"
    bodyStyle.top = `-${scrollY}px`
    bodyStyle.left = "0"
    bodyStyle.right = "0"
    bodyStyle.width = "100%"
    bodyStyle.overflow = "hidden"

    return () => {
      bodyStyle.position = previous.position
      bodyStyle.top = previous.top
      bodyStyle.left = previous.left
      bodyStyle.right = previous.right
      bodyStyle.width = previous.width
      bodyStyle.overflow = previous.overflow
      window.scrollTo(0, scrollY)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (introTransitionTimeoutRef.current) window.clearTimeout(introTransitionTimeoutRef.current)
      if (selectionEchoTimeoutRef.current) window.clearTimeout(selectionEchoTimeoutRef.current)
      if (stepPanelTimeoutRef.current) window.clearTimeout(stepPanelTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ block: "end" })
  }, [state.messages.length, state.step, isTyping, isStepPanelVisible])

  function closeModal() {
    if (introTransitionTimeoutRef.current) {
      window.clearTimeout(introTransitionTimeoutRef.current)
      introTransitionTimeoutRef.current = null
    }
    if (selectionEchoTimeoutRef.current) {
      window.clearTimeout(selectionEchoTimeoutRef.current)
      selectionEchoTimeoutRef.current = null
    }
    if (stepPanelTimeoutRef.current) {
      window.clearTimeout(stepPanelTimeoutRef.current)
      stepPanelTimeoutRef.current = null
    }
    setSelectionEcho(null)
    setIsTyping(false)
    setIsStepPanelVisible(true)
    actionLockRef.current = false
    setIsVisible(false)
    setTimeout(onClose, 220)
  }

  const isThread = state.step !== "intro"

  function dispatchAfterIntroClose(nextAction: ChatAction) {
    if (actionLockRef.current) return
    actionLockRef.current = true

    if (isThread) {
      dispatch(nextAction)
      actionLockRef.current = false
      return
    }

    setIsIntroClosing(true)
    setIsStepPanelVisible(false)
    introTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsIntroClosing(false)
      setIsTyping(true)
      introTransitionTimeoutRef.current = window.setTimeout(() => {
        dispatch(nextAction)
        setIsTyping(false)
        stepPanelTimeoutRef.current = window.setTimeout(() => {
          setIsStepPanelVisible(true)
          actionLockRef.current = false
          stepPanelTimeoutRef.current = null
        }, STEP_PANEL_APPEAR_MS)
        introTransitionTimeoutRef.current = null
      }, AI_TYPING_BUBBLE_MS)
    }, PANEL_TRANSITION_MS)
  }

  function dispatchAfterSelectionEcho(text: string, actions: ChatAction[]) {
    if (actionLockRef.current) return
    actionLockRef.current = true

    if (selectionEchoTimeoutRef.current) {
      window.clearTimeout(selectionEchoTimeoutRef.current)
      selectionEchoTimeoutRef.current = null
    }
    if (stepPanelTimeoutRef.current) {
      window.clearTimeout(stepPanelTimeoutRef.current)
      stepPanelTimeoutRef.current = null
    }

    dispatch({ type: "APPEND_USER_MESSAGE", text })
    setSelectionEcho(text)
    setIsStepPanelVisible(false)
    setIsTyping(false)
    selectionEchoTimeoutRef.current = window.setTimeout(() => {
      setSelectionEcho(null)
      setIsTyping(true)
      selectionEchoTimeoutRef.current = window.setTimeout(() => {
        for (const action of actions) {
          if (action.type === "APPEND_USER_MESSAGE" && action.text === text) continue
          dispatch(action)
        }
        setIsTyping(false)
        stepPanelTimeoutRef.current = window.setTimeout(() => {
          setIsStepPanelVisible(true)
          actionLockRef.current = false
          stepPanelTimeoutRef.current = null
        }, STEP_PANEL_APPEAR_MS)
        selectionEchoTimeoutRef.current = null
      }, AI_TYPING_BUBBLE_MS)
    }, PANEL_TRANSITION_MS)
  }

  function handleIntroPromptClick(item: (typeof introPromptOptions)[number]) {
    if (item === scanPromptLabel) {
      closeModal()
      navigate("/ai-scan")
      return
    }
    dispatchAfterIntroClose({ type: "SELECT_INTRO_PROMPT", value: item })
  }

  function moveToScanPage() {
    closeModal()
    navigate("/ai-scan")
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedMessage = messageValue.trim()
    if (!trimmedMessage) return

    if (state.step === "intro") {
      dispatchAfterIntroClose({ type: "SELECT_INTRO_PROMPT", value: fastPromptLabel })
      setMessageValue("")
      return
    }

    if (state.step === "glossary") {
      const matched = findBestOptionMatch(glossaryOptions, trimmedMessage)
      if (matched) {
        dispatchAfterSelectionEcho(matched, [
          { type: "APPEND_USER_MESSAGE", text: matched },
          { type: "SELECT_GLOSSARY_TOPIC", value: matched },
        ])
        setMessageValue("")
        return
      }
    }

    if (state.step === "party_mood") {
      const matched = findBestOptionMatch(partyMoodOptions, trimmedMessage)
      if (matched) {
        dispatchAfterSelectionEcho(matched, [
          { type: "APPEND_USER_MESSAGE", text: matched },
          { type: "SELECT_PARTY_MOOD", value: matched },
        ])
        setMessageValue("")
        return
      }
    }

    if (state.step === "food") {
      const matched = findBestOptionMatch(foodCategoryOptions, trimmedMessage)
      if (matched) {
        dispatchAfterSelectionEcho(matched, [
          { type: "APPEND_USER_MESSAGE", text: matched },
          { type: "SELECT_FOOD", value: matched },
        ])
        setMessageValue("")
        return
      }
    }

    if (state.step === "wine_style") {
      const input = normalizeKeyword(trimmedMessage)
      const sakeCandidates = wineCandidatesMock.filter((candidate) => candidate.tags.includes("사케"))
      const matchedSakeProduct =
        sakeCandidates.find((candidate) => normalizeKeyword(candidate.name).includes(input)) ??
        sakeCandidates.find((candidate) => input.includes(normalizeKeyword(candidate.name))) ??
        null

      if (input.includes("사케") || matchedSakeProduct) {
        dispatchAfterSelectionEcho("사케", [
          { type: "APPEND_USER_MESSAGE", text: "사케" },
          { type: "SELECT_WINE_STYLE", value: "사케" },
        ])
        setMessageValue("")
        return
      }
    }

    if (state.step === "recommend") {
      const input = normalizeKeyword(trimmedMessage)
      const sakeCandidates = wineCandidatesMock.filter((candidate) => candidate.tags.includes("사케"))
      const matched =
        recommendations.find((candidate) => normalizeKeyword(candidate.name).includes(input)) ??
        recommendations.find((candidate) => input.includes(normalizeKeyword(candidate.name))) ??
        sakeCandidates.find((candidate) => normalizeKeyword(candidate.name).includes(input)) ??
        sakeCandidates.find((candidate) => input.includes(normalizeKeyword(candidate.name))) ??
        null

      if (matched) {
        dispatchAfterSelectionEcho(matched.name, [
          { type: "APPEND_USER_MESSAGE", text: matched.name },
          { type: "OPEN_DETAIL", wineId: matched.id },
        ])
        setMessageValue("")
        return
      }
    }

    dispatch({ type: "APPEND_USER_MESSAGE", text: trimmedMessage })
    setMessageValue("")
  }

  const recommendations: WineCandidate[] = (() => {
    if (state.step !== "recommend") return []

    const pool = getTopRecommendations(state.session, 20)
    if (pool.length <= 2) return pool.slice(0, 2)

    const cursor = (state.session.recommendationCursor ?? 0) % pool.length
    const slice = [...pool.slice(cursor), ...pool.slice(0, cursor)].slice(0, 2)

    const lastIds = state.session.lastRecommendationIds ?? []
    if (lastIds.length === 2 && slice.some((item) => lastIds.includes(item.id))) {
      const nextCursor = (cursor + 2) % pool.length
      return [...pool.slice(nextCursor), ...pool.slice(0, nextCursor)].slice(0, 2)
    }

    return slice
  })()

  return (
    <section className="chat_page" aria-label="AI 채팅" onClick={closeModal}>
      <div className="chat_overlay">
        <div
          className={`${isVisible ? "chat_sheet is_open" : "chat_sheet"} ${state.step === "done" ? "is_done" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="chat_header">
            <button type="button" aria-label="닫기" onClick={closeModal}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="chat_stage" data-mode={isThread ? "thread" : "intro"}>
            <section
              className={`chat_intro chat_panel ${!isThread ? "is_active" : ""} ${isIntroClosing ? "is_closing" : ""}`}
              aria-hidden={isThread}
            >
              <div className="chat_hero">
                <div className="ai_face ai_face_large" aria-hidden="true" />
                <p style={{ whiteSpace: "pre-line" }}>{initialAiMessage}</p>
              </div>
              <div className="chat_suggestion_list" aria-label="빠른 선택">
                {introPromptOptions.map((item) => (
                  <button type="button" key={item} onClick={() => handleIntroPromptClick(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className={`chat_thread chat_panel ${isThread ? "is_active" : ""}`} aria-hidden={!isThread}>
              <div className="chat_messages">
                {state.step !== "done"
                  ? state.messages.map((message) =>
                      message.role === "ai" ? (
                        <div className="chat_bubble_row" key={message.id}>
                          <div className="ai_face ai_face_small" aria-hidden="true" />
                          <p style={{ whiteSpace: "pre-line" }}>{message.text}</p>
                        </div>
                      ) : (
                        <div className="chat_bubble_row user_bubble_row" key={message.id}>
                          <p style={{ whiteSpace: "pre-line" }}>{message.text}</p>
                        </div>
                      ),
                    )
                  : null}

                {state.step !== "done" && isTyping ? (
                  <div className="chat_bubble_row" aria-label="AI 입력 중">
                    <div className="ai_face ai_face_small" aria-hidden="true" />
                    <p className="chat_typing_bubble" aria-hidden="true">
                      . . .
                    </p>
                  </div>
                ) : null}

                <ChatStepPanel
                  key={`${state.step}-${state.messages.length}`}
                  step={state.step}
                  isVisible={state.step === "done" ? isThread : isThread && isStepPanelVisible && !isTyping}
                  selectionEcho={selectionEcho}
                  selectedWine={state.selectedWine}
                  recommendations={recommendations}
                  onSelectGlossaryTopic={(value) =>
                    dispatchAfterSelectionEcho(value, [
                      { type: "APPEND_USER_MESSAGE", text: value },
                      { type: "SELECT_GLOSSARY_TOPIC", value },
                    ])
                  }
                  onSelectPartyMood={(value) =>
                    dispatchAfterSelectionEcho(value, [
                      { type: "APPEND_USER_MESSAGE", text: value },
                      { type: "SELECT_PARTY_MOOD", value },
                    ])
                  }
                  onSelectFood={(value) =>
                    dispatchAfterSelectionEcho(value, [
                      { type: "APPEND_USER_MESSAGE", text: value },
                      { type: "SELECT_FOOD", value },
                    ])
                  }
                  onSelectWineStyle={(value) =>
                    dispatchAfterSelectionEcho(value, [
                      { type: "APPEND_USER_MESSAGE", text: value },
                      { type: "SELECT_WINE_STYLE", value },
                    ])
                  }
                  onSelectRecommendation={(wineId) => dispatch({ type: "SELECT_RECOMMENDATION", wineId })}
                  onGoProductDetail={(wineId) => {
                    closeModal()
                    navigate(`/product/${wineId}`)
                  }}
                  onAskMore={(wineId, label) =>
                    dispatchAfterSelectionEcho(label, [
                      { type: "APPEND_USER_MESSAGE", text: label },
                      { type: "OPEN_DETAIL", wineId },
                    ])
                  }
                  onBackToRecommend={() =>
                    dispatchAfterSelectionEcho("다른 주류 보기", [
                      { type: "APPEND_USER_MESSAGE", text: "다른 주류 보기" },
                      { type: "BACK_TO_RECOMMEND" },
                    ])
                  }
                  onMoreRecommendations={() =>
                    dispatchAfterSelectionEcho("다른 추천 보기", [
                      { type: "APPEND_USER_MESSAGE", text: "다른 추천 보기" },
                      { type: "SHOW_MORE_RECOMMENDATIONS", currentIds: recommendations.map((item) => item.id) },
                    ])
                  }
                  onConfirmSelection={() =>
                    dispatchAfterSelectionEcho("이 주류로 선택할게요!", [
                      { type: "APPEND_USER_MESSAGE", text: "이 주류로 선택할게요!" },
                      { type: "CONFIRM_SELECTION" },
                    ])
                  }
                  onClose={closeModal}
                />

                <div ref={endOfMessagesRef} />
              </div>
            </section>
          </div>

          {state.step !== "done" ? (
            <form className="chat_input_bar" onSubmit={submitMessage}>
              <input
                aria-label="채팅 입력"
                placeholder="메시지를 입력해보세요"
                value={messageValue}
                onChange={(event) => setMessageValue(event.target.value)}
              />
              <button
                type="button"
                className={messageValue.length ? "input_clear_button is_visible" : "input_clear_button"}
                aria-label="입력 내용 지우기"
                onClick={() => setMessageValue("")}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 7L17 17M17 7L7 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="submit"
                className={messageValue.trim() ? "confirm_button is_visible" : "confirm_button"}
                aria-label="입력 확인"
                disabled={!messageValue.trim()}
              >
                확인
              </button>
              <button type="button" className="camera_button" aria-label="주류 스캔 페이지 이동" onClick={moveToScanPage}>
                +
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  )
}
