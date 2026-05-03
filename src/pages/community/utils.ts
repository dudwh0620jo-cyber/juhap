import { podiumVotesById } from "./votes"
import type { RankingCategory, RankingPeriod, RankingPodium, TopTab } from "./types"

export const normalizeTopTab = (value: string | null): TopTab | null => {
  if (value === "ranking" || value === "feed") {
    return value
  }
  return null
}

export const normalizeRankingPeriod = (value: string | null): RankingPeriod | null => {
  if (value === "weekly" || value === "daily" || value === "monthly" || value === "all") {
    return value
  }
  return null
}

export const normalizeRankingCategory = (value: string | null): RankingCategory | null => {
  if (
    value === "all" ||
    value === "soju" ||
    value === "wine" ||
    value === "beer" ||
    value === "whisky_spirit" ||
    value === "tradition" ||
    value === "sake" ||
    value === "etc"
  ) {
    return value
  }
  return null
}

export const extractPairingTitle = (title: string) => {
  const match = title.match(/([^\n+]{2,}?)\s*\+\s*([^\n+]{2,}?)(?=[,.\n]|$)/)
  if (!match) {
    return title
  }
  const left = match[1].trim()
  const right = match[2].trim()
  return `${left} + ${right}`
}

export const getPodiumVotes = (podium: RankingPodium) => {
  const explicitVotes = podium.votes ?? podiumVotesById[podium.id]
  if (typeof explicitVotes === "number" && Number.isFinite(explicitVotes)) {
    return Math.max(0, Math.round(explicitVotes))
  }

  const base = 5200
  const noise = (podium.id * 37 + podium.rank * 191) % 3600
  return base + noise
}

export const normalizeSearchText = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim()

export const includesNormalized = (value: string, query: string) => {
  const normalizedValue = normalizeSearchText(value)
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return true
  }
  return normalizedValue.includes(normalizedQuery)
}

export const createRankingFeatureTags = (category: RankingCategory, pairing: string) => {
  const tags: string[] = []
  const normalized = normalizeSearchText(pairing)

  if (category === "beer") {
    tags.push("가벼운", "톡쏘는")
  } else if (category === "soju") {
    tags.push("가벼운", "톡쏘는")
  } else if (category === "wine") {
    tags.push("무거운", "과일향")
    if (normalized.includes("스테이크") || normalized.includes("치즈")) {
      tags.push("오크향")
    }
  } else if (category === "whisky_spirit") {
    tags.push("무거운", "오크향", "부드러운")
  } else if (category === "tradition") {
    tags.push("부드러운", "가벼운")
  } else if (category === "sake") {
    tags.push("부드러운", "가벼운")
  } else {
    tags.push("과일향", "톡쏘는")
  }

  return tags
}

