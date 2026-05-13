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
      const scoreLabel = typeof score === "number" ? `★ ${score.toFixed(1)}` : "★ --"
      const descriptionSource = post.pairingSummary?.trim() || post.body?.trim() || ""
      const description = descriptionSource.length > 60 ? `${descriptionSource.slice(0, 60).trim()}…` : descriptionSource

      const photoId = Array.isArray(post.photoIds) ? post.photoIds[0] : undefined
      const imageSrc = typeof photoId === "string" ? resolveReviewImage(photoId) : undefined

      return {
        popularityScore: typeof post.popularityScore === "number" ? post.popularityScore : 0,
        id: post.id,
        badge: badge || "추천",
        scoreLabel,
        title: hasPairing ? pairingTitle : post.title,
        description: description || "오늘은 어떤 조합이 어울릴까요?",
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
    footer: "혼자 마시는 시간에 부담 없이 즐기기 좋은 조합이에요.",
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
    drink: { emoji: "🍺", name: "캔맥주 6입", desc: "여럿이 나누기 좋은 기본 맥주" },
    snack: { emoji: "🍟", name: "감자 스낵 플래터", desc: "가볍게 집어먹기 좋아요" },
    footer: "여럿이 편하게 즐기기 좋은 가성비 조합이에요.",
    match: {
      situationKeywords: ["홈파티", "파티", "모임"],
      drinkTypeKeywords: ["맥주", "하이볼"],
      traitKeywords: ["가벼운", "톡쏘는"],
    },
  },
  {
    id: 3,
    label: "비오는날",
    recommendCount: 2107,
    drink: { emoji: "🍶", name: "막걸리", desc: "비 오는 날 생각나는 클래식" },
    snack: { emoji: "🥞", name: "해물파전", desc: "고소한 풍미가 잘 어울려요" },
    footer: "비 오는 날 감성과 가장 잘 맞는 편안한 페어링이에요.",
    match: {
      situationKeywords: ["비오는날", "비", "장마"],
      drinkTypeKeywords: ["전통주", "막걸리"],
      traitKeywords: ["부드러운", "무거운"],
    },
  },
  {
    id: 4,
    label: "선물",
    recommendCount: 756,
    drink: { emoji: "🍾", name: "스파클링 와인", desc: "패키지까지 깔끔한 선택" },
    snack: { emoji: "🧀", name: "치즈 세트", desc: "호불호 적은 구성" },
    footer: "센스 있는 선물로 보여주기 좋은 조합이에요.",
    match: {
      situationKeywords: ["선물", "기념일"],
      drinkTypeKeywords: ["와인", "화이트와인", "스파클링"],
      traitKeywords: ["과일향", "부드러운"],
    },
  },
  {
    id: 5,
    label: "캠핑",
    recommendCount: 1329,
    drink: { emoji: "🥃", name: "하이볼 캔", desc: "휴대가 간편해서 좋아요" },
    snack: { emoji: "🍢", name: "바비큐 꼬치", desc: "불향과 특히 잘 어울려요" },
    footer: "캠핑 분위기에 자연스럽게 어울리는 조합이에요.",
    match: {
      situationKeywords: ["캠핑", "야외"],
      drinkTypeKeywords: ["하이볼", "위스키", "맥주"],
      traitKeywords: ["톡쏘는", "가벼운"],
    },
  },
  {
    id: 6,
    label: "고기먹을때",
    recommendCount: 1894,
    drink: { emoji: "🍷", name: "레드 와인", desc: "탄닌감 있는 스타일 추천" },
    snack: { emoji: "🥩", name: "스테이크", desc: "진한 풍미와 좋은 궁합" },
    footer: "고기의 여운을 더 깊게 살려주는 묵직한 조합이에요.",
    match: {
      situationKeywords: ["고기먹을때", "고기", "식사"],
      drinkTypeKeywords: ["와인", "레드와인", "소주"],
      traitKeywords: ["무거운", "과일향"],
    },
  },
]

const weeklyDrinkItems: WeeklyDrinkItem[] = [
  {
    id: "weekly-caymus-2023",
    name: "케이머스 나파 밸리 카버네 소비뇽 2023",
    type: "레드와인",
    origin: "미국(U.S.A), California",
    variety: "Cabernet Sauvignon",
    rating: 4.0,
    sweetness: "낮은 당도",
    thumbId: "drink_caymus_napa_valley",
  },
  {
    id: "weekly-dassai-23",
    name: "닷사이 23 준마이 다이긴죠",
    type: "사케",
    origin: "일본",
    variety: "준마이 다이긴죠",
    rating: 4.5,
    sweetness: "낮은 당도",
    thumbId: "drink_dassai_45",
  },
  {
    id: "weekly-kendall-jackson",
    name: "캔달잭슨 빈트너스 리저브 샤르도네",
    type: "화이트와인",
    origin: "미국, 캘리포니아",
    variety: "Chardonnay",
    rating: 4.0,
    sweetness: "낮은 당도",
    thumbId: "drink_kendall_jackson",
  },
]

function normalizeKeyword(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/[·/,_-]/g, "")
    .trim()
}

function isMeaningfulPreference(value: string) {
  const normalized = normalizeKeyword(value)
  if (!normalized) return false
  return !normalized.includes("없음")
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
        scoreLabel: fallback?.scoreLabel ?? "★ --",
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
