import { useMemo } from "react"
import type { RecommendationItem } from "../components/RecommendationCard"
import type { SituationItem } from "../components/SituationSection"
import type { WeeklyDrinkItem } from "../components/WeeklyDrink"
import { readUserProfile } from "../data/userProfile"
import { weeklyAllTop5 } from "../utils/rankingData"
import { extractPairingTitle, feedPosts } from "../utils/communityPosts"
import { resolveReviewImage } from "../utils/reviewImages"
import { homeTodayPairingBanners, homeTodayPairingCopy } from "../data/homeContent"

type SituationMatchMeta = {
  situationKeywords: string[]
  drinkTypeKeywords: string[]
  traitKeywords: string[]
}

type SituationSourceItem = SituationItem & {
  match: SituationMatchMeta
}

const buildRecommendationItems = (count: number): RecommendationItem[] => {
  const candidates: Array<RecommendationItem & { popularityScore: number }> = feedPosts
    .filter((post) => !post.isQna)
    .map((post) => {
      const pairingTitle = extractPairingTitle(post.title)
      const hasPairing = pairingTitle.includes("+")
      const badge = post.drinkType?.trim() || post.categories?.[0]?.trim() || ""
      const score = typeof post.rating === "number" ? post.rating : undefined
      const scoreLabel = typeof score === "number" ? `??${score.toFixed(1)}` : "??--"
      const descriptionSource = post.pairingSummary?.trim() || post.body?.trim() || ""
      const description = descriptionSource.length > 60 ? `${descriptionSource.slice(0, 60).trim()}...` : descriptionSource

      const photoId = Array.isArray(post.photoIds) ? post.photoIds[0] : undefined
      const imageSrc = typeof photoId === "string" ? resolveReviewImage(photoId) : undefined

      return {
        popularityScore: typeof post.popularityScore === "number" ? post.popularityScore : 0,
        id: post.id,
        badge: badge || "異붿쿇",
        scoreLabel,
        title: hasPairing ? pairingTitle : post.title,
        description: description || "?ㅻ뒛? ?대뼡 議고빀???댁슱由닿퉴??",
        imageSrc,
      }
    })

  return [...candidates]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, count)
    .map(({ popularityScore: _, ...rest }) => rest)
}

const situationItemsSource: SituationSourceItem[] = [
  {
    id: 1,
    label: "혼술",
    recommendCount: 1284,
    drink: { emoji: "🍶", name: "준마이 사케", desc: "300ml 타입으로 가볍게" },
    snack: { emoji: "🥜", name: "마른 안주 믹스", desc: "부담 없이 곁들이기 좋아요" },
    footer: "혼자 마시는 시간도 부담 없이 즐기기 좋은 조합이에요.",
    match: {
      situationKeywords: ["혼술", "혼자"],
      drinkTypeKeywords: ["사케"],
      traitKeywords: ["가벼운", "부드러운"],
    },
  },
  {
    id: 2,
    label: "홈파티",
    recommendCount: 983,
    drink: { emoji: "🍺", name: "캔맥주 6캔", desc: "함께 나누기 좋은 기본 맥주" },
    snack: { emoji: "🍟", name: "감자·나초 플래터", desc: "가볍게 집어먹기 좋아요" },
    footer: "친구들과 편하게 즐기기 좋은 가성비 조합이에요.",
    match: {
      situationKeywords: ["홈파티", "파티", "모임"],
      drinkTypeKeywords: ["맥주", "하이볼"],
      traitKeywords: ["가벼운", "상큼한"],
    },
  },
  {
    id: 3,
    label: "비오는 날",
    recommendCount: 2107,
    drink: { emoji: "🥛", name: "막걸리", desc: "비 오는 날 생각나는 레트로" },
    snack: { emoji: "🥘", name: "해물파전", desc: "고소한 풍미가 잘 어울려요" },
    footer: "비 오는 날 감성과 가장 잘 맞는 조합이에요.",
    match: {
      situationKeywords: ["비오는날", "비", "장마"],
      drinkTypeKeywords: ["막걸리", "전통주"],
      traitKeywords: ["부드러운", "묵직한"],
    },
  },
  {
    id: 4,
    label: "특별한 날",
    recommendCount: 756,
    drink: { emoji: "🥂", name: "스파클링 와인", desc: "분위기까지 깔끔하게" },
    snack: { emoji: "🧀", name: "치즈 플래터", desc: "깔끔한 구성" },
    footer: "기념일 무드를 살려주는 조합이에요.",
    match: {
      situationKeywords: ["특별한날", "기념일"],
      drinkTypeKeywords: ["와인", "스파클링"],
      traitKeywords: ["과일향", "부드러운"],
    },
  },
  {
    id: 5,
    label: "피크닉",
    recommendCount: 1329,
    drink: { emoji: "🍷", name: "화이트 와인", desc: "야외에서도 가볍게" },
    snack: { emoji: "🥗", name: "샐러드·과일", desc: "산뜻하게 즐겨요" },
    footer: "피크닉 분위기에 자연스럽게 어울리는 조합이에요.",
    match: {
      situationKeywords: ["피크닉", "야외"],
      drinkTypeKeywords: ["와인", "화이트"],
      traitKeywords: ["상큼한", "가벼운"],
    },
  },
  {
    id: 6,
    label: "고기 먹을 때",
    recommendCount: 1894,
    drink: { emoji: "🥃", name: "레드 와인", desc: "풍미를 살려주는 한 잔" },
    snack: { emoji: "🥩", name: "스테이크", desc: "진한 풍미와 찰떡" },
    footer: "고기와 함께 먹기 좋은 정석 조합이에요.",
    match: {
      situationKeywords: ["고기", "스테이크", "식사"],
      drinkTypeKeywords: ["와인", "레드"],
      traitKeywords: ["묵직한", "과일향"],
    },
  },
]
const weeklyDrinkItems: WeeklyDrinkItem[] = [
  {
    id: "weekly-dassai-23",
    name: "닷사이 45\n준마이 다이긴죠",
    type: "사케",
    origin: "일본",
    variety: "쌀",
    rating: 4.2,
    sweetness: "낮음",
    abv: "15~16",
    priceLabel: "₩48,000원",
    tags: ["깔끔한 맛", "해산물", "가벼운 식사"],
    theme: "sake",
    thumbId: "drink_dassai_45",
  },
  {
    id: "weekly-kendall-jackson",
    name: "캔달잭슨 빈터너스\n리저브 샤르도네",
    type: "화이트와인",
    origin: "미국",
    variety: "Chardonnay",
    rating: 4.0,
    sweetness: "낮음",
    abv: "13.5",
    priceLabel: "₩35,000원",
    tags: ["가족식사", "치즈", "가벼운 디너"],
    theme: "white",
    thumbId: "drink_kendall_jackson",
  },
  {
    id: "weekly-caymus-2023",
    name: "케이머스 나파 밸리\n카베네 소비뇽",
    type: "레드와인",
    origin: "미국",
    variety: "Cabernet\nSauvignon",
    rating: 4.0,
    sweetness: "낮음",
    abv: "14.2",
    priceLabel: "₩240,000원",
    tags: ["가족식사", "행사와 기념일", "비지니스 다이닝"],
    theme: "red",
    thumbId: "drink_caymus_napa_valley",
  },
]
function normalizeKeyword(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/[쨌/,_-]/g, "")
    .trim()
}

function isMeaningfulPreference(value: string) {
  const normalized = normalizeKeyword(value)
  if (!normalized) return false
  return !normalized.includes("?놁쓬")
}

function matchesPreference(selectedValues: string[], keywords: string[]) {
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeKeyword(keyword)
    return selectedValues.some(
      (selected) => selected === normalizedKeyword || selected.includes(normalizedKeyword) || normalizedKeyword.includes(selected),
    )
  })
}

function scoreSituation(item: SituationSourceItem, selectedSituations: string[], selectedDrinkTypes: string[], selectedTraits: string[]) {
  let score = 0

  if (matchesPreference(selectedSituations, item.match.situationKeywords)) score += 100
  if (matchesPreference(selectedDrinkTypes, item.match.drinkTypeKeywords)) score += 20

  item.match.traitKeywords.forEach((keyword) => {
    if (matchesPreference(selectedTraits, [keyword])) score += 8
  })

  return score
}

export function useHomePageData() {
  const profile = readUserProfile()
  const recommendationItems = useMemo(() => {
    const fallbackItems = buildRecommendationItems(4)

    const base = homeTodayPairingCopy.map((copy, index) => {
      const fallback = fallbackItems[index]
      return {
        id: fallback?.id ?? 900000 + index,
        badge: fallback?.badge ?? "오늘의 추천 페어링",
        scoreLabel: fallback?.scoreLabel ?? "??--",
        title: copy.title,
        description: copy.description,
        imageSrc: homeTodayPairingBanners[index % homeTodayPairingBanners.length],
      }
    })

    return base
  }, [])

  const orderedSituationItems = useMemo(() => {
    const selectedSituations = (profile.tastePreferences.situation ?? [])
      .filter(isMeaningfulPreference)
      .map(normalizeKeyword)
    const selectedDrinkTypes = (profile.tastePreferences.drinkType ?? [])
      .filter(isMeaningfulPreference)
      .map(normalizeKeyword)
    const selectedTraits = (profile.tastePreferences.trait ?? [])
      .filter(isMeaningfulPreference)
      .map(normalizeKeyword)

    return [...situationItemsSource]
      .sort((a, b) => {
        const scoreDiff =
          scoreSituation(b, selectedSituations, selectedDrinkTypes, selectedTraits) -
          scoreSituation(a, selectedSituations, selectedDrinkTypes, selectedTraits)

        if (scoreDiff !== 0) return scoreDiff
        return a.id - b.id
      })
      .map((item) => ({
        id: item.id,
        label: item.label,
        recommendCount: item.recommendCount,
        drink: item.drink,
        snack: item.snack,
        footer: item.footer,
      }))
  }, [profile.tastePreferences.drinkType, profile.tastePreferences.situation, profile.tastePreferences.trait])

  return useMemo(
    () => ({ rankingItems: weeklyAllTop5, recommendationItems, situationItems: orderedSituationItems, weeklyDrinkItems }),
    [orderedSituationItems, recommendationItems],
  )
}


