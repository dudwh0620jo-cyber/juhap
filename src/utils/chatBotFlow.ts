import chatBotConfig from "../data/chatBotConfig.json"
import {
  CLEAN_SAKE_RECOMMEND_LABEL,
  DIRECT_GLOSSARY_INPUT_LABEL,
  glossaryDefinitionByTopic,
  glossaryIntroMessageTemplate,
  glossaryOptions,
  glossaryRecommendStyleByTopic,
  glossaryRelatedOptions,
  glossaryUserBubbleTextByTopic,
} from "../data/chatGlossary"
import { sakeProductsMock } from "../data/sakeProductsMock"

export type ChatStep = "intro" | "glossary" | "party_mood" | "food" | "wine_style" | "recommend" | "detail" | "pairing" | "done"
export type ChatRole = "ai" | "user"

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

export type ChatSession = {
  introPrompt?: string
  glossaryTopic?: string
  situation?: string
  partyMood?: string
  foodCategory?: string
  wineStyle?: string
  selectedWineId?: string
  recommendationCursor?: number
  lastRecommendationIds?: string[]
  recommendationSource?: "glossary" | "pairing"
}

export type WineCandidate = {
  id: string
  name: string
  subtitle: string
  priceWon: number
  tags: string[]
  notes: string[]
  tastingNotes: string[]
  awards: string[]
  pairingFoods: string[]
  tips: string[]
}

const fallbackChatById: Record<string, Pick<WineCandidate, "notes" | "tastingNotes" | "pairingFoods" | "tips">> = {
  "sake-dassai-23": {
    notes: ["요리의 풍미를 완성하는 투명함과 섬세한 향", "쌀을 23%만 남기고 깎아낸 최고급 준마이 다이긴죠"],
    tastingNotes: ["깔끔한 맛", "과일향", "균형감"],
    pairingFoods: ["해산물", "사시미", "가벼운 치즈"],
    tips: ["차갑게 칠링하면 과일향이 더 선명해져요.", "담백한 해산물과 함께하면 술의 섬세함이 살아나요."],
  },
  "sake-kubota-manju": {
    notes: ["일식의 섬세한 맛을 조화롭게 이어주는 밸런스", "향이 과하지 않고 부드럽게 넘어가는 프리미엄 사케"],
    tastingNotes: ["드라이", "프루티", "깊이감"],
    pairingFoods: ["해산물", "초밥", "맑은 국물 요리"],
    tips: ["대화가 긴 모임에서는 온도를 너무 낮추지 않는 편이 좋아요."],
  },
  "sake-hakkaisan-daiginjo": {
    notes: ["가볍고 산뜻한 질감에 톡쏘는 인상이 있는 사케", "기름진 안주를 깔끔하게 정리해줘요."],
    tastingNotes: ["톡쏘는", "가벼운", "깔끔한"],
    pairingFoods: ["튀김/안주류", "해산물", "배달음식"],
    tips: ["튀김류와 함께 마시면 느끼함을 줄여줘요."],
  },
}

const fallbackChat = {
  notes: ["부담 없이 즐기기 좋은 균형 잡힌 스타일"],
  tastingNotes: ["깔끔한", "부드러운", "향긋한"],
  pairingFoods: ["해산물", "가벼운 안주", "치즈"],
  tips: ["차갑게 준비하면 더 산뜻하게 즐길 수 있어요."],
}

function fillCandidateChat(candidate: WineCandidate): WineCandidate {
  const fallback = fallbackChatById[candidate.id] ?? fallbackChat

  return {
    ...candidate,
    notes: candidate.notes.length > 0 ? candidate.notes : fallback.notes,
    tastingNotes: candidate.tastingNotes.length > 0 ? candidate.tastingNotes : fallback.tastingNotes,
    pairingFoods: candidate.pairingFoods.length > 0 ? candidate.pairingFoods : fallback.pairingFoods,
    tips: candidate.tips.length > 0 ? candidate.tips : fallback.tips,
  }
}

type ChatBotConfigShape = {
  introPromptOptions: string[]
  situationOptions: string[]
  partyMoodOptions: string[]
  foodCategoryOptions: string[]
  wineStyleOptions: string[]
  extraWineCandidates: WineCandidate[]
}

const config = chatBotConfig as ChatBotConfigShape

export const introPromptOptions = config.introPromptOptions
export {
  CLEAN_SAKE_RECOMMEND_LABEL,
  DIRECT_GLOSSARY_INPUT_LABEL,
  glossaryDefinitionByTopic,
  glossaryOptions,
  glossaryRecommendStyleByTopic,
  glossaryRelatedOptions,
  glossaryUserBubbleTextByTopic,
}

export function buildGlossaryIntroMessage(userName: string) {
  return glossaryIntroMessageTemplate.replace("{userName}", userName.trim() || "회원")
}

export const situationOptions = config.situationOptions
export const partyMoodOptions = config.partyMoodOptions
export const foodCategoryOptions = config.foodCategoryOptions
export const wineStyleOptions = config.wineStyleOptions

export const wineCandidatesMock: WineCandidate[] = [
  ...sakeProductsMock.map((product) => ({
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    priceWon: product.priceWon,
    tags: product.tags,
    notes: product.chat.notes,
    tastingNotes: product.chat.tastingNotes,
    awards: product.chat.awards,
    pairingFoods: product.chat.pairingFoods,
    tips: product.chat.tips,
  })),
  ...config.extraWineCandidates,
].map(fillCandidateChat)

function scoreCandidate(candidate: WineCandidate, session: ChatSession) {
  const haystack = [...candidate.tags, ...candidate.pairingFoods, ...candidate.tastingNotes, candidate.name].join(" ")
  let score = 0
  if (session.wineStyle && haystack.includes(session.wineStyle.split(" ")[0])) score += 5
  if (session.foodCategory && haystack.includes(session.foodCategory)) score += 3
  if (session.partyMood && haystack.includes(session.partyMood)) score += 1
  if (session.foodCategory === "해산물" && candidate.tags.includes("사케")) score += 4
  if (session.foodCategory === "튀김/안주류" && candidate.tags.includes("톡쏘는")) score += 4
  if (session.wineStyle === "특별한 술" && candidate.tags.includes("사케")) score += 3
  return score
}

export function getTopRecommendations(session: ChatSession, count: number) {
  const sorted = [...wineCandidatesMock].sort((a, b) => scoreCandidate(b, session) - scoreCandidate(a, session))
  return sorted.slice(0, Math.max(1, count))
}

export function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`
}
