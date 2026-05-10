import chatBotConfig from "../data/chatBotConfig.json"
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

type ChatBotConfigShape = {
  introPromptOptions: string[]
  glossaryOptions: string[]
  glossaryDefinitionByTopic: Record<string, string>
  situationOptions: string[]
  partyMoodOptions: string[]
  foodCategoryOptions: string[]
  wineStyleOptions: string[]
  extraWineCandidates: WineCandidate[]
}

const config = chatBotConfig as ChatBotConfigShape

export const introPromptOptions = config.introPromptOptions
export const glossaryOptions = config.glossaryOptions
export const glossaryDefinitionByTopic = config.glossaryDefinitionByTopic as Record<(typeof glossaryOptions)[number], string>
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
]

function scoreCandidate(candidate: WineCandidate, session: ChatSession) {
  const haystack = candidate.tags.join(" ")
  let score = 0
  if (session.wineStyle && haystack.includes(session.wineStyle.split(" ")[0])) score += 5
  if (session.foodCategory && haystack.includes(session.foodCategory)) score += 3
  if (session.situation && haystack.includes(session.situation)) score += 1
  return score
}

export function getTopRecommendations(session: ChatSession, count: number) {
  if (session.wineStyle?.includes("사케")) {
    return wineCandidatesMock.filter((candidate) => candidate.tags.includes("사케")).slice(0, Math.max(1, count))
  }
  const sorted = [...wineCandidatesMock].sort((a, b) => scoreCandidate(b, session) - scoreCandidate(a, session))
  return sorted.slice(0, Math.max(1, count))
}

export function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`
}
