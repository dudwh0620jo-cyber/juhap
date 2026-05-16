import { useEffect, useReducer, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"
import AlertModal from "../components/AlertModal"
import ChatStepPanel from "../components/ChatStepPanel"
import introRecommendIcon from "../assets/banner_ai_recommend.png"
import introGlossaryIcon from "../assets/banner_drink_glossary.png"
import introScanIcon from "../assets/banner_label_scan.png"
import introBeerDeco from "../assets/chatbot_intro_beer_01.png"
import introHighballDeco from "../assets/chatbot_intro_highball_01.png"
import introSakeDeco from "../assets/chatbot_intro_sake_01.png"
import introSojuDeco from "../assets/chatbot_intro_soju_01.png"
import introWineDeco from "../assets/chatbot_intro_wine_01.png"
import iconCaretRight from "../assets/svg/caretright.svg"
import iconCaretRightWhite from "../assets/svg/caretright_w.svg"
import iconMicrophone from "../assets/svg/microphone.svg"
import iconSend from "../assets/svg/telegramlogo.svg"
import "../styles/chat.css"
import { findGlossaryTopicMatch } from "../utils/chatGlossarySearch"
import {
  buildGlossaryIntroMessage,
  chatRecommendationFoundMessage,
  chatUnknownInputMessage,
  DIRECT_GLOSSARY_INPUT_LABEL,
  foodCategoryOptions,
  getTopRecommendations,
  glossaryDefinitionByTopic,
  glossaryOptions,
  glossaryRecommendationByTopic,
  glossaryRelatedOptions,
  glossaryUserBubbleTextByTopic,
  introPromptOptions,
  partyMoodOptions,
  primaryRecommendationIds,
  wineStyleOptions,
  wineCandidatesMock,
  type ChatMessage,
  type ChatSession,
  type ChatStep,
  type WineCandidate,
} from "../utils/chatBotFlow"

type ChatProps = {
  onClose: () => void
  userName?: string
  isHidden?: boolean
}

type ChatState = {
  step: ChatStep
  session: ChatSession
  messages: ChatMessage[]
  selectedWine: WineCandidate | null
}

type ChatAction =
  | { type: "SELECT_INTRO_PROMPT"; value: (typeof introPromptOptions)[number]; userName?: string }
  | { type: "SELECT_GLOSSARY_TOPIC"; value: string }
  | { type: "SELECT_PARTY_MOOD"; value: string }
  | { type: "SELECT_FOOD"; value: string }
  | { type: "SELECT_WINE_STYLE"; value: string; skipPrompt?: boolean }
  | { type: "SELECT_RECOMMENDATION"; wineId: string }
  | { type: "OPEN_DETAIL"; wineId: string }
  | { type: "OPEN_PAIRING" }
  | { type: "BACK_TO_RECOMMEND" }
  | { type: "SHOW_MORE_RECOMMENDATIONS"; currentIds: string[] }
  | { type: "CONFIRM_SELECTION" }
  | { type: "APPEND_USER_MESSAGE"; text: string }
  | { type: "APPEND_AI_MESSAGE"; text: string }
  | { type: "GO_BACK" }
  | { type: "RESET_TO_INTRO"; userName: string }

const scanPromptLabel = "라벨 스캔하기" satisfies (typeof introPromptOptions)[number]
const fastPromptLabel = "나에게 맞는 추천받기" satisfies (typeof introPromptOptions)[number]
const glossaryPromptLabel = "주류문화 용어 알기" satisfies (typeof introPromptOptions)[number]
const PANEL_TRANSITION_MS = 120
const AI_TYPING_BUBBLE_MS = 260
const RECOMMENDATION_MATCHING_MS = 3000
const STEP_PANEL_APPEAR_MS = 80
const FEATURE_PREPARING_DELAY_MS = 700
const INITIAL_RECOMMENDATION_COUNT = 2
const MORE_RECOMMENDATION_COUNT = 3
const MICROPHONE_PERMISSION_MODAL = {
  title: "\uB9C8\uC774\uD06C \uAD8C\uD55C\uC774 \uD544\uC694\uD574\uC694",
  message: "\uC74C\uC131 \uC785\uB825\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74\n\uB9C8\uC774\uD06C \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.",
  confirmLabel: "\uD655\uC778",
} as const
const BACK_MESSAGE = "뒤로가기"
const MORE_DRINKS_MESSAGE = "다른 술 더보기"
const FEATURE_PREPARING_MESSAGE = "준비중인 기능이에요"

function getIntroPromptIcon(item: (typeof introPromptOptions)[number]) {
  if (item === scanPromptLabel) return introScanIcon
  if (item === fastPromptLabel) return introRecommendIcon
  return introGlossaryIcon
}

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

function findExactOptionMatch(options: readonly string[], rawInput: string) {
  const input = normalizeKeyword(rawInput)
  if (!input) return null

  return options.find((option) => normalizeKeyword(option) === input) ?? null
}

function buildGreetingMessage(userName: string) {
  return [
    `안녕하세요, ${userName}님!`,
    "어떤 자리에 술을 찾고 계신가요?",
    "상황을 알려주시면",
    "완벽한 한 잔을 추천해드릴게요.",
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
      return "궁금한 용어를 골라주세요."
    case "party_mood":
      return "어떤 자리에 술을 찾고 계신가요?"
    case "food":
      return "주로 어떤 음식과 함께하시나요?"
    case "wine_style":
      return "오늘은 어떤 느낌의 술이 좋으세요?"
    case "recommend":
      return "조건에 맞는 완벽한 술을 찾고 있어요."
    case "detail":
      return "좋아요. 추천 주류의 핵심만 정리해드릴게요."
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

function getSelectedSessionLabels(session: ChatSession) {
  return [session.partyMood, session.foodCategory, session.wineStyle].filter((item): item is string => Boolean(item))
}

function omitSessionKeys(session: ChatSession, keys: (keyof ChatSession)[]) {
  const nextSession = { ...session }
  for (const key of keys) {
    delete nextSession[key]
  }
  return nextSession
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "APPEND_USER_MESSAGE":
      return { ...state, messages: pushUser(state.messages, action.text) }

    case "APPEND_AI_MESSAGE":
      return { ...state, messages: pushAi(state.messages, action.text) }

    case "SELECT_INTRO_PROMPT": {
      const session = { ...state.session, introPrompt: action.value }

      if (action.value === glossaryPromptLabel) {
        const messages = pushAi([], buildGlossaryIntroMessage(action.userName ?? "회원"))
        return { ...state, step: "glossary", session, messages }
      }

      const messages = pushAi([], buildGreetingMessage(action.userName ?? "회원"))
      return { ...state, step: "party_mood", session, messages }
    }

    case "SELECT_GLOSSARY_TOPIC": {
      const session = { ...state.session, glossaryTopic: action.value }
      if (action.value === DIRECT_GLOSSARY_INPUT_LABEL) {
        return { ...state, step: "glossary", session }
      }
      const recommendationConfig = glossaryRecommendationByTopic[action.value]
      if (recommendationConfig) {
        const messages = recommendationConfig.showFoundMessage
          ? pushAi(state.messages, chatRecommendationFoundMessage)
          : state.messages
        return {
          ...state,
          step: "recommend",
          session: {
            ...session,
            wineStyle: recommendationConfig.wineStyle,
            recommendationCursor: 0,
            recommendationSource: "glossary",
            recommendationProductIds: recommendationConfig.productIds,
            lastRecommendationIds: [],
            selectedWineId: undefined,
          },
          messages,
          selectedWine: null,
        }
      }
      const definition = glossaryDefinitionByTopic[action.value as keyof typeof glossaryDefinitionByTopic]
      const messages = definition ? pushAi(state.messages, definition) : state.messages
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
        recommendationSource: "pairing",
        recommendationProductIds: undefined,
        lastRecommendationIds: [],
      }
      const messages = action.skipPrompt ? state.messages : pushAi(state.messages, getNextAiPrompt("recommend"))
      return { ...state, step: "recommend", session, messages }
    }

    case "SHOW_MORE_RECOMMENDATIONS": {
      const currentCursor = state.session.recommendationCursor ?? 0
      const session = {
        ...state.session,
        recommendationCursor: currentCursor + 1,
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

    case "GO_BACK": {
      if (state.step === "intro") return state
      if (state.step === "party_mood" || state.step === "glossary") {
        return { ...state, step: "intro", session: {}, messages: state.messages.slice(0, 1), selectedWine: null }
      }
      if (state.step === "food") {
        const session = omitSessionKeys(state.session, [
          "partyMood",
          "foodCategory",
          "wineStyle",
          "selectedWineId",
          "recommendationCursor",
          "recommendationSource",
          "recommendationProductIds",
          "lastRecommendationIds",
        ])
        const messages = pushAi(pushUser(state.messages, BACK_MESSAGE), getNextAiPrompt("party_mood"))
        return { ...state, step: "party_mood", session, messages, selectedWine: null }
      }
      if (state.step === "wine_style") {
        const session = omitSessionKeys(state.session, [
          "foodCategory",
          "wineStyle",
          "selectedWineId",
          "recommendationCursor",
          "recommendationSource",
          "recommendationProductIds",
          "lastRecommendationIds",
        ])
        const messages = pushAi(pushUser(state.messages, BACK_MESSAGE), getNextAiPrompt("food"))
        return { ...state, step: "food", session, messages, selectedWine: null }
      }
      if (state.step === "recommend") {
        if (state.session.recommendationSource === "glossary") {
          const session = omitSessionKeys(state.session, [
            "wineStyle",
            "selectedWineId",
            "recommendationCursor",
            "recommendationSource",
            "recommendationProductIds",
            "lastRecommendationIds",
          ])
          return { ...state, step: "glossary", session, messages: state.messages, selectedWine: null }
        }
        const session = omitSessionKeys(state.session, [
          "wineStyle",
          "selectedWineId",
          "recommendationCursor",
          "recommendationSource",
          "recommendationProductIds",
          "lastRecommendationIds",
        ])
        const messages = pushAi(pushUser(state.messages, BACK_MESSAGE), getNextAiPrompt("wine_style"))
        return { ...state, step: "wine_style", session, messages, selectedWine: null }
      }
      if (state.step === "detail" || state.step === "pairing" || state.step === "done") {
        if (state.session.recommendationSource === "glossary") {
          const session = omitSessionKeys(state.session, ["selectedWineId"])
          return { ...state, step: "recommend", session, messages: state.messages, selectedWine: null }
        }
        const session = omitSessionKeys(state.session, ["selectedWineId"])
        const messages = pushAi(pushUser(state.messages, BACK_MESSAGE), getNextAiPrompt("recommend"))
        return { ...state, step: "recommend", session, messages, selectedWine: null }
      }
      return state
    }

    case "RESET_TO_INTRO": {
      return {
        ...state,
        step: "intro",
        session: {},
        messages: [{ id: createMessageId(), role: "ai" as const, text: buildGreetingMessage(action.userName) }],
        selectedWine: null,
      }
    }

    default:
      return state
  }
}

export default function Chat({ onClose, userName: userNameProp, isHidden = false }: ChatProps) {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [messageValue, setMessageValue] = useState("")
  const [isIntroClosing, setIsIntroClosing] = useState(false)
  const [selectionEcho, setSelectionEcho] = useState<string | null>(null)
  const [matchingLabels, setMatchingLabels] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isStepPanelVisible, setIsStepPanelVisible] = useState(true)
  const [isMicrophoneModalOpen, setIsMicrophoneModalOpen] = useState(false)
  const actionLockRef = useRef(false)
  const messageInputRef = useRef<HTMLInputElement | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  const userName = userNameProp?.trim() ? userNameProp.trim() : "회원"
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
    if (isHidden) return

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
  }, [isHidden])

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

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight)
    const nextTop = el.scrollTop > 6
    const nextBottom = el.scrollTop < maxScrollTop - 6
    setShowTopFade(nextTop)
    setShowBottomFade(nextBottom)
  }, [state.messages.length, state.step, isTyping, isStepPanelVisible])

  function handleMessagesScroll(event: React.UIEvent<HTMLDivElement>) {
    const el = event.currentTarget
    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight)
    setShowTopFade(el.scrollTop > 6)
    setShowBottomFade(el.scrollTop < maxScrollTop - 6)
  }

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
    setMatchingLabels([])
    setIsIntroClosing(false)
    setIsTyping(false)
    setIsStepPanelVisible(true)
    actionLockRef.current = false
    setIsVisible(false)
    setTimeout(onClose, 220)
  }

  const isThread = state.step !== "intro"

  function handleBack() {
    if (state.step === "intro") {
      closeModal()
      return
    }
    setSelectionEcho(null)
    setMatchingLabels([])
    setIsTyping(false)
    setIsStepPanelVisible(true)
    actionLockRef.current = false
    dispatch({ type: "RESET_TO_INTRO", userName })
  }

  function dispatchAfterIntroClose(nextActions: ChatAction[]) {
    if (actionLockRef.current) return
    actionLockRef.current = true

    if (isThread) {
      setMessageValue("")
      for (const action of nextActions) dispatch(action)
      actionLockRef.current = false
      return
    }

    setMessageValue("")
    setIsIntroClosing(true)
    setIsStepPanelVisible(false)
    introTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsIntroClosing(false)
      setIsTyping(true)
      introTransitionTimeoutRef.current = window.setTimeout(() => {
        for (const action of nextActions) dispatch(action)
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

  function dispatchAfterSelectionEcho(text: string, actions: ChatAction[], panelAppearDelayMs = STEP_PANEL_APPEAR_MS) {
    if (actionLockRef.current) return
    actionLockRef.current = true
    setMessageValue("")

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
    const shouldShowMatching = actions.some((action) => action.type === "SELECT_WINE_STYLE")
      const typingDelayMs = shouldShowMatching
        ? RECOMMENDATION_MATCHING_MS
        : AI_TYPING_BUBBLE_MS
    setMatchingLabels(shouldShowMatching ? Array.from(new Set([...getSelectedSessionLabels(state.session), text])) : [])
    selectionEchoTimeoutRef.current = window.setTimeout(() => {
      setSelectionEcho(null)
      setIsTyping(true)
      selectionEchoTimeoutRef.current = window.setTimeout(() => {
        for (const action of actions) {
          if (action.type === "APPEND_USER_MESSAGE" && action.text === text) continue
          dispatch(action.type === "SELECT_WINE_STYLE" && shouldShowMatching ? { ...action, skipPrompt: true } : action)
        }
        if (shouldShowMatching) {
          dispatch({ type: "APPEND_AI_MESSAGE", text: chatRecommendationFoundMessage })
        }
        setIsTyping(false)
        setMatchingLabels([])
        stepPanelTimeoutRef.current = window.setTimeout(() => {
          setIsStepPanelVisible(true)
          actionLockRef.current = false
          stepPanelTimeoutRef.current = null
        }, panelAppearDelayMs)
        selectionEchoTimeoutRef.current = null
      }, typingDelayMs)
    }, PANEL_TRANSITION_MS)
  }

  function dispatchUnknownReply(text: string) {
    dispatchAfterSelectionEcho(text, [
      { type: "APPEND_USER_MESSAGE", text },
      { type: "APPEND_AI_MESSAGE", text: chatUnknownInputMessage },
    ])
  }

  function handleIntroPromptClick(item: (typeof introPromptOptions)[number]) {
    if (item === scanPromptLabel) {
      closeModal()
      navigate("/ai-scan?from=chat")
      return
    }
    setMessageValue("")
    dispatchAfterIntroClose([
      { type: "APPEND_USER_MESSAGE", text: item },
      { type: "SELECT_INTRO_PROMPT", value: item, userName },
    ])
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedMessage = messageValue.trim()
    if (!trimmedMessage) return

    if (state.step === "intro") {
      dispatchAfterIntroClose([
        { type: "APPEND_USER_MESSAGE", text: fastPromptLabel },
        { type: "SELECT_INTRO_PROMPT", value: fastPromptLabel, userName },
      ])
      setMessageValue("")
      return
    }

    if (state.step === "glossary") {
      const glossaryOptionsForStep = state.session.glossaryTopic ? glossaryRelatedOptions : glossaryOptions
      const selectableGlossaryOptions = glossaryOptionsForStep.filter((option) => option !== DIRECT_GLOSSARY_INPUT_LABEL)
      const matched =
        findGlossaryTopicMatch(trimmedMessage, selectableGlossaryOptions) ??
        findBestOptionMatch(selectableGlossaryOptions, trimmedMessage)
      if (matched) {
        dispatchAfterSelectionEcho(trimmedMessage, [
          { type: "APPEND_USER_MESSAGE", text: trimmedMessage },
          { type: "SELECT_GLOSSARY_TOPIC", value: matched },
        ])
        setMessageValue("")
        return
      }

      dispatchUnknownReply(trimmedMessage)
      setMessageValue("")
      return
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

      dispatchUnknownReply(trimmedMessage)
      setMessageValue("")
      return
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

      dispatchUnknownReply(trimmedMessage)
      setMessageValue("")
      return
    }

    if (state.step === "wine_style") {
      const matched = findExactOptionMatch(wineStyleOptions, trimmedMessage)
      if (matched) {
        dispatchAfterSelectionEcho(matched, [
          { type: "APPEND_USER_MESSAGE", text: matched },
          { type: "SELECT_WINE_STYLE", value: matched },
        ])
        setMessageValue("")
        return
      }

      dispatchUnknownReply(trimmedMessage)
      setMessageValue("")
      return
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
    if (state.session.recommendationProductIds?.length) {
      return state.session.recommendationProductIds
        .map((id) => pool.find((item) => item.id === id))
        .filter((item): item is WineCandidate => Boolean(item))
    }

    const primaryRecommendations = primaryRecommendationIds.map((id) => pool.find((item) => item.id === id)).filter(
      (item): item is WineCandidate => Boolean(item),
    )
    const primaryIds = new Set(primaryRecommendations.map((item) => item.id))
    const initialRecommendations = [
      ...primaryRecommendations,
      ...pool.filter((item) => !primaryIds.has(item.id)),
    ].slice(0, INITIAL_RECOMMENDATION_COUNT)

    const cursor = state.session.recommendationCursor ?? 0
    if (cursor === 0) return initialRecommendations

    const otherPool = pool.filter((item) => !primaryRecommendationIds.includes(item.id))
    if (!otherPool.length) return initialRecommendations

    const otherCursor = ((cursor - 1) * MORE_RECOMMENDATION_COUNT) % otherPool.length
    const slice = [...otherPool.slice(otherCursor), ...otherPool.slice(0, otherCursor)].slice(0, MORE_RECOMMENDATION_COUNT)

    const lastIds = state.session.lastRecommendationIds ?? []
    if (lastIds.length && otherPool.length > MORE_RECOMMENDATION_COUNT && slice.some((item) => lastIds.includes(item.id))) {
      const nextCursor = (otherCursor + MORE_RECOMMENDATION_COUNT) % otherPool.length
      return [...otherPool.slice(nextCursor), ...otherPool.slice(0, nextCursor)].slice(0, MORE_RECOMMENDATION_COUNT)
    }

    return slice
  })()

  const selectedSessionLabels = getSelectedSessionLabels(state.session)
  const matchingSessionLabels = matchingLabels.length ? matchingLabels : selectedSessionLabels
  const isMatchingRecommendations = isTyping && state.step === "wine_style" && matchingSessionLabels.length > 0
  const isGlossaryTyping = state.step === "glossary" && messageValue.trim().length > 0
  const visibleGlossaryItems =
    state.step === "glossary" && state.session.glossaryTopic ? glossaryRelatedOptions : glossaryOptions

  function getGlossaryUserBubbleText(value: string) {
    return glossaryUserBubbleTextByTopic[value] ?? value
  }

  return (
    <section className={isHidden ? "chat_page is_hidden" : "chat_page"} aria-label="AI 채팅" aria-hidden={isHidden} onClick={closeModal}>
      <div className="chat_overlay">
        <div
          className={`${isVisible ? "chat_sheet is_open" : "chat_sheet"} ${state.step === "done" ? "is_done" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
          <span className="chat_sheet_handle" aria-hidden="true" />
          <header className={isThread ? "chat_header" : "chat_header is_intro"}>
            <button type="button" aria-label="뒤로가기" onClick={handleBack}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M15 5L8 12L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <strong aria-hidden="true" />
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
                <div className="chat_intro_mascot_cluster" aria-hidden="true">
                  <img className="chat_intro_deco chat_intro_deco_wine" src={introWineDeco} alt="" />
                  <img className="chat_intro_deco chat_intro_deco_soju" src={introSojuDeco} alt="" />
                  <img className="chat_intro_deco chat_intro_deco_sake" src={introSakeDeco} alt="" />
                  <img className="chat_intro_deco chat_intro_deco_highball" src={introHighballDeco} alt="" />
                  <img className="chat_intro_deco chat_intro_deco_beer" src={introBeerDeco} alt="" />
                  <div className="ai_face ai_face_large" />
                </div>
                <p className="chat_intro_title">
                  반가워요.
                  <br />
                  무엇을 도와드릴까요?
                </p>
                <p className="chat_intro_subtitle">
                  주류용어, 페어링, 맛 설명까지 주아가 쉽게 알려드릴게요.
                </p>
              </div>
              <div className="chat_suggestion_list" aria-label="빠른 선택">
                {introPromptOptions.map((item) => (
                  <button type="button" key={item} onClick={() => handleIntroPromptClick(item)}>
                    <span className="chat_suggestion_icon" aria-hidden="true">
                      <img src={getIntroPromptIcon(item)} alt="" />
                    </span>
                    <span className="chat_suggestion_label">{item}</span>
                    <span className="chat_suggestion_arrow" aria-hidden="true">
                      <img className="chat_suggestion_arrow_img is_default" src={iconCaretRight} alt="" />
                      <img className="chat_suggestion_arrow_img is_active" src={iconCaretRightWhite} alt="" />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {isThread ? (
            <section className="chat_thread chat_panel is_active">
              <div className={`chat_messages_wrap${showTopFade ? " is_scroll_top" : ""}${showBottomFade ? " is_scroll_bottom" : ""}`}>
                <div
                  ref={messagesRef}
                  className="chat_messages"
                  onScroll={handleMessagesScroll}
                >
                  {state.step !== "done" && state.session.introPrompt === fastPromptLabel ? (
                    <div className="chat_thread_intro_hero" aria-hidden="true">
                      <div className="chat_thread_intro_mascot ai_face ai_face_large" />
                      <p className="chat_thread_intro_title">
                        반가워요.
                        <br />
                        무엇을 도와드릴까요?
                      </p>
                    </div>
                  ) : null}
                  {state.step !== "done"
                    ? state.messages.map((message) =>
                        message.role === "ai" ? (
                          <div className="chat_bubble_row" key={message.id}>
                            <p>{message.text}</p>
                          </div>
                        ) : (
                          <div className="chat_bubble_row user_bubble_row" key={message.id}>
                            <p>{message.text}</p>
                          </div>
                        ),
                      )
                    : null}

                  {state.step !== "done" && isTyping ? (
                    <div className="chat_bubble_row" aria-label={isMatchingRecommendations ? "추천 찾는 중" : "AI 입력 중"}>
                      <p className="chat_typing_bubble" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </p>
                    </div>
                  ) : null}
                  <ChatStepPanel
                    key={`${state.step}-${state.messages.length}`}
                    step={state.step}
                    isVisible={state.step === "done" ? isThread : isThread && isStepPanelVisible && !isTyping}
                    selectionEcho={selectionEcho}
                    glossaryItems={visibleGlossaryItems}
                    activeGlossaryOption={isGlossaryTyping ? DIRECT_GLOSSARY_INPUT_LABEL : null}
                    selectedWine={state.selectedWine}
                    recommendations={recommendations}
                    onSelectGlossaryTopic={(value) =>
                      value === DIRECT_GLOSSARY_INPUT_LABEL
                        ? messageInputRef.current?.focus()
                        : dispatchAfterSelectionEcho(getGlossaryUserBubbleText(value), [
                            { type: "APPEND_USER_MESSAGE", text: getGlossaryUserBubbleText(value) },
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
                    onGoBack={() =>
                      dispatchAfterSelectionEcho(BACK_MESSAGE, [
                        { type: "APPEND_USER_MESSAGE", text: BACK_MESSAGE },
                        { type: "GO_BACK" },
                      ])
                    }
                    onSelectRecommendation={(wineId) => dispatch({ type: "SELECT_RECOMMENDATION", wineId })}
                    onGoProductDetail={(wineId) => {
                      navigate(`/product/${wineId}?tab=pairing`)
                    }}
                    onBackToRecommend={() =>
                      dispatchAfterSelectionEcho("다른 주류 보기", [
                        { type: "APPEND_USER_MESSAGE", text: "다른 주류 보기" },
                        { type: "BACK_TO_RECOMMEND" },
                      ])
                    }
                    onMoreRecommendations={() =>
                      dispatchAfterSelectionEcho(
                        MORE_DRINKS_MESSAGE,
                        [
                          { type: "APPEND_USER_MESSAGE", text: MORE_DRINKS_MESSAGE },
                          { type: "APPEND_AI_MESSAGE", text: FEATURE_PREPARING_MESSAGE },
                        ],
                        FEATURE_PREPARING_DELAY_MS,
                      )
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
                <div className="chat_messages_fade chat_messages_fade_top" aria-hidden="true" />
                <div className="chat_messages_fade chat_messages_fade_bottom" aria-hidden="true" />
              </div>
            </section>
            ) : null}
          </div>

          {state.step !== "done" ? (
            <div className="chat_input_shell">
              <form className="chat_input_bar" onSubmit={submitMessage}>
              <input
                ref={messageInputRef}
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
              <button type="button" className="camera_button" aria-label="음성 입력" onClick={() => setIsMicrophoneModalOpen(true)}>
                <img src={iconMicrophone} alt="" aria-hidden="true" />
              </button>
              <button
                type="submit"
                className={messageValue.trim() ? "confirm_button is_visible" : "confirm_button"}
                aria-label="입력 확인"
                disabled={!messageValue.trim()}
              >
                <img src={iconSend} alt="" aria-hidden="true" />
              </button>
              </form>
            </div>
          ) : null}

          {isMicrophoneModalOpen ? (
            <AlertModal
              title={MICROPHONE_PERMISSION_MODAL.title}
              message={MICROPHONE_PERMISSION_MODAL.message}
              confirmLabel={MICROPHONE_PERMISSION_MODAL.confirmLabel}
              onConfirm={() => setIsMicrophoneModalOpen(false)}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
