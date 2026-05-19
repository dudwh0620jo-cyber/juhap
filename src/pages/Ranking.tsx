import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "../styles/community.css"
import "../styles/ranking.css"
import CommunityHeader from "../components/CommunityHeader"
import CommunityRankingSection from "../components/CommunityRankingSection"
import SearchFilterModal from "../components/SearchFilterModal"
import CommunityFilterPanel from "../components/CommunityFilterPanel"
import { useRankingQueryParams } from "../hooks/useRankingQueryParams"
import {
  beerDummyRankingItems,
  etcDummyPodiumItems,
  etcDummyRankingItems,
  getRankingPairLabel,
  rankingCategories,
  rankingDataByPeriod,
  rankingPeriods,
  sakeDummyRankingItems,
  sojuDummyRankingItems,
  spiritsDummyPodiumItems,
  spiritsDummyRankingItems,
  traditionalDummyRankingItems,
  type RankingCategory,
  type RankingPodium,
  wineDummyRankingItems,
  whiskyDummyPodiumItems,
  whiskyDummyRankingItems,
} from "../utils/rankingData"
import { feedPosts, type FeedPost } from "../utils/communityPosts"
import { includesNormalized, normalizeSearchText } from "../utils/text"
import { useStoredStringArray } from "../utils/storage"
import { validatePostIdsExist } from "../utils/rankingValidation"
import { communityPageData } from "../data/communityPageData"
import { COMMUNITY_SEARCH_RECENT_KEY } from "../utils/communityStorage"
import { usersMockById } from "../utils/usersMock"
import { calculateRangePercent, isWithinRange } from "../utils/range"
import { usePreloadImages } from "../hooks/usePreloadImages"
import {
  getRankingBestCharacterSrc,
  getRankingDrinkSrcForItem,
  getRankingPostPhotoSrc,
  getRankingRankBadgeSrc,
  getRankingThumbSrc,
  getRankingThumbSrcById,
} from "../utils/rankingThumbAssets"

type PopupChipGroup = {
  title: string
  chips: string[]
}

const getRankingLikeCount = (postId: number) => {
  const fromPost = feedPosts.find((post) => post.id === postId)?.likeCount
  return typeof fromPost === "number" && Number.isFinite(fromPost) ? Math.max(0, Math.round(fromPost)) : 0
}

const RANKING_CATEGORY_BY_POST_CATEGORY: Record<string, RankingCategory> = {
  소주: "soju",
  와인: "wine",
  맥주: "beer",
  위스키: "whisky",
  증류주: "spirits",
  전통주: "traditional",
  사케: "sake",
  기타: "etc",
}

const getPostRankingCategory = (post: FeedPost): RankingCategory | null =>
  RANKING_CATEGORY_BY_POST_CATEGORY[post.categories?.[0] ?? ""] ?? null

const getPodiumVotes = (podium: RankingPodium) => {
  if (typeof podium.votes === "number" && Number.isFinite(podium.votes)) return Math.max(0, Math.round(podium.votes))
  return getRankingLikeCount(podium.id)
}

const MAX_VISIBLE_RANKING_ITEMS = 10

const RANKING_DELTA_BY_POST_ID: Record<number, string> = {
  1005: "+1",
  1002: "-1",
  1006: "+3",
  1025: "+1",
  1009: "-4",
  1010: "-2",
  1001: "+1",
  99003: "-1",
  1101: "+2",
  1003: "—",
  1004: "—",
  1007: "+1",
  91011: "+1",
}

const getRankingDelta = (postId: number) => RANKING_DELTA_BY_POST_ID[postId] ?? "—"

const WEEKLY_SOJU_VOTES_BY_ID: Record<number, number> = {
  91011: 13422,
  99003: 10018,
}

const WEEKLY_WINE_VOTES_BY_ID: Record<number, number> = {
  1008: 9942,
}

const WEEKLY_BEER_VOTES_BY_ID: Record<number, number> = {
  1005: 12480,
  1025: 11142,
  1004: 10012,
  1007: 9984,
  91013: 9726,
}

const WEEKLY_SAKE_VOTES_BY_ID: Record<number, number> = {
  99001: 9981,
  99002: 9874,
  1102: 9728,
}

const WEEKLY_TRADITIONAL_VOTES_BY_ID: Record<number, number> = {
  1006: 10003,
  91012: 9991,
}

const WEEKLY_TRADITIONAL_DELTA_BY_ID: Record<number, string> = {
  91012: "+5",
}

export default function CommunityRanking() {
  const { rankingPeriod, rankingCategory, setQueryParam } = useRankingQueryParams()
  const { MAX_RECENT_TERMS, PRICE_MIN_WON, PRICE_MAX_WON, ABV_MIN, ABV_MAX, popupCategoryByDrinkType, popupFeaturesByDrinkType, popupFoodCategories } =
    communityPageData

  const [isFeedFilterPopupOpen, setIsFeedFilterPopupOpen] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => new Set())
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(() => new Set())
  const [feedSearchValue, setFeedSearchValue] = useState("")
  const [isFeedSearchConfirmed, setIsFeedSearchConfirmed] = useState(false)
  const feedSearchInputRef = useRef<HTMLInputElement | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN_WON, PRICE_MAX_WON])
  const [abvRange, setAbvRange] = useState<[number, number]>([ABV_MIN, ABV_MAX])
  const [expandedChipGroups, setExpandedChipGroups] = useState<Set<string>>(() => new Set())
  const [collapsibleChipGroups, setCollapsibleChipGroups] = useState<Set<string>>(() => new Set())
  const chipGroupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const { value: recentSearchTerms, setValue: setRecentSearchTerms } = useStoredStringArray(
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
  )

  useEffect(() => {
    const rankingData = rankingDataByPeriod[rankingPeriod]
    const requiredIds = new Set<number>()
    for (const podiumItems of Object.values(rankingData.podiumByCategory)) {
      for (const item of podiumItems) requiredIds.add(item.id)
    }
    for (const row of rankingData.rows) requiredIds.add(row.id)

    const availableIds = feedPosts.map((post) => post.id)
    const { ok, missing } = validatePostIdsExist(availableIds, Array.from(requiredIds))
    if (!ok) {
      console.warn("[ranking] missing posts for ranking ids:", missing)
    }
  }, [rankingPeriod])

  const availableCategories = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupCategoryByDrinkType[selectedDrinkType] ?? []
  }, [popupCategoryByDrinkType, selectedDrinkType])

  const availableFeatures = useMemo(() => {
    if (!selectedDrinkType) return []
    if (selectedCategories.size === 0) return []
    return popupFeaturesByDrinkType[selectedDrinkType] ?? []
  }, [popupFeaturesByDrinkType, selectedCategories, selectedDrinkType])

  const availableFoods = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupFoodCategories
  }, [popupFoodCategories, selectedDrinkType])

  const popupChipGroups: PopupChipGroup[] = useMemo(() => {
    const groups: PopupChipGroup[] = [
      { title: "주종", chips: Object.keys(popupCategoryByDrinkType) },
      { title: "카테고리", chips: availableCategories },
      { title: "특징", chips: availableFeatures },
      {
        title: "음식",
        chips: availableFoods,
      },
    ]
    return groups
  }, [availableCategories, availableFeatures, availableFoods, popupCategoryByDrinkType])

  const searchAllChipGroups: PopupChipGroup[] = useMemo(() => {
    const categorySet = new Set<string>()
    for (const list of Object.values(popupCategoryByDrinkType)) {
      for (const item of list) categorySet.add(item)
    }
    const featureSet = new Set<string>()
    for (const list of Object.values(popupFeaturesByDrinkType)) {
      for (const item of list) featureSet.add(item)
    }

    return [
      { title: "주종", chips: Object.keys(popupCategoryByDrinkType) },
      { title: "카테고리", chips: Array.from(categorySet) },
      { title: "특징", chips: Array.from(featureSet) },
      { title: "음식", chips: popupFoodCategories },
    ]
  }, [popupCategoryByDrinkType, popupFeaturesByDrinkType, popupFoodCategories])

  const filteredPopupChipGroups = useMemo(() => {
    const query = feedSearchValue.trim().toLowerCase()
    if (!isFeedSearchConfirmed || !query) {
      return popupChipGroups
    }

    const results: PopupChipGroup[] = []
    for (const group of searchAllChipGroups) {
      if (group.title.toLowerCase().includes(query)) {
        results.push(group)
        continue
      }

      const chips = group.chips.filter((chip) => includesNormalized(chip, query))
      if (chips.length > 0) {
        results.push({ title: group.title, chips })
      }
    }

    return results
  }, [feedSearchValue, isFeedSearchConfirmed, popupChipGroups, searchAllChipGroups])

  const isPopupSearchNoResults =
    isFeedSearchConfirmed && Boolean(feedSearchValue.trim()) && filteredPopupChipGroups.length === 0

  const isCommunitySearchActive =
    Boolean(feedSearchValue.trim()) ||
    isFeedSearchConfirmed ||
    Boolean(selectedDrinkType) ||
    selectedCategories.size > 0 ||
    selectedFeatures.size > 0 ||
    selectedFoods.size > 0 ||
    priceRange[0] !== PRICE_MIN_WON ||
    priceRange[1] !== PRICE_MAX_WON ||
    abvRange[0] !== ABV_MIN ||
    abvRange[1] !== ABV_MAX

  const priceMinPct = useMemo(() => {
    return calculateRangePercent(priceRange[0], PRICE_MIN_WON, PRICE_MAX_WON)
  }, [PRICE_MAX_WON, PRICE_MIN_WON, priceRange])

  const priceMaxPct = useMemo(() => {
    return calculateRangePercent(priceRange[1], PRICE_MIN_WON, PRICE_MAX_WON)
  }, [PRICE_MAX_WON, PRICE_MIN_WON, priceRange])

  const abvMinPct = useMemo(() => {
    return calculateRangePercent(abvRange[0], ABV_MIN, ABV_MAX)
  }, [ABV_MAX, ABV_MIN, abvRange])

  const abvMaxPct = useMemo(() => {
    return calculateRangePercent(abvRange[1], ABV_MIN, ABV_MAX)
  }, [ABV_MAX, ABV_MIN, abvRange])

  const searchSuggestionTags = useMemo(() => {
    const query = feedSearchValue.trim()
    if (!query) {
      return []
    }

    const normalizedQuery = normalizeSearchText(query)
    const filterPostWithoutQuery = (post: FeedPost) => {
      const drinkTypeMatches =
        !selectedDrinkType ||
        post.drinkType === selectedDrinkType ||
        (post.categories ?? []).some((item) => (popupCategoryByDrinkType[selectedDrinkType] ?? []).includes(item))
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))
      return drinkTypeMatches && categoryMatches && foodMatches && featureMatches
    }

    const candidates = new Map<string, number>()
    const bump = (tag: string, score: number) => {
      const trimmed = tag.trim()
      if (!trimmed) return
      candidates.set(trimmed, Math.max(candidates.get(trimmed) ?? 0, score))
    }

    for (const post of feedPosts) {
      const tagPool = [
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ].filter(Boolean)

      const haystack = normalizeSearchText([post.title, post.body, ...tagPool].join(" "))
      const baseScore = haystack.includes(normalizedQuery) ? 3 : 0

      for (const tag of tagPool) {
        const normalizedTag = normalizeSearchText(tag)
        let score = baseScore
        if (normalizedTag.includes(normalizedQuery) || normalizedQuery.includes(normalizedTag)) {
          score += 5
        } else if (normalizedTag && normalizedQuery && normalizedTag[0] === normalizedQuery[0]) {
          score += 1
        }
        bump(tag, score)
      }
    }

    const hasResultsForTag = (tag: string) => {
      for (const post of feedPosts) {
        if (!filterPostWithoutQuery(post)) continue
        const tagPool = [
          post.title,
          post.body,
          post.drinkType ?? "",
          ...(post.categories ?? []),
          ...(post.features ?? []),
          ...(post.foods ?? []),
          ...(post.searchTags ?? []),
        ].filter(Boolean)

        if (includesNormalized(tagPool.join(" "), tag)) {
          return true
        }
      }
      return false
    }

    return Array.from(candidates.entries())
      .filter(([tag]) => hasResultsForTag(tag))
      .filter(([tag]) => {
        if (selectedDrinkType && tag === selectedDrinkType) return false
        if (selectedCategories.has(tag)) return false
        if (selectedFeatures.has(tag)) return false
        if (selectedFoods.has(tag)) return false
        return true
      })
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 8)
  }, [
    feedSearchValue,
    popupCategoryByDrinkType,
    selectedCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])

  const rankingData = rankingDataByPeriod[rankingPeriod]
  const allRankingStatsById = useMemo(() => {
    const next = new Map<number, { votes?: number; delta?: string }>()
    for (const podium of rankingData.podiumByCategory.all) {
      next.set(podium.id, { votes: podium.votes, delta: podium.delta })
    }
    for (const row of rankingData.rows) {
      next.set(row.id, { votes: row.votes, delta: row.delta })
    }
    return next
  }, [rankingData])

  const getCategoryRankingVotes = useCallback(
    (postId: number) => {
      if (rankingPeriod === "weekly" && rankingCategory === "soju") {
        const weeklySojuVotes = WEEKLY_SOJU_VOTES_BY_ID[postId]
        if (typeof weeklySojuVotes === "number") return weeklySojuVotes
      }
      if (rankingPeriod === "weekly" && rankingCategory === "wine") {
        const weeklyWineVotes = WEEKLY_WINE_VOTES_BY_ID[postId]
        if (typeof weeklyWineVotes === "number") return weeklyWineVotes
      }
      if (rankingPeriod === "weekly" && rankingCategory === "beer") {
        const weeklyBeerVotes = WEEKLY_BEER_VOTES_BY_ID[postId]
        if (typeof weeklyBeerVotes === "number") return weeklyBeerVotes
      }
      if (rankingPeriod === "weekly" && rankingCategory === "sake") {
        const weeklySakeVotes = WEEKLY_SAKE_VOTES_BY_ID[postId]
        if (typeof weeklySakeVotes === "number") return weeklySakeVotes
      }
      if (rankingPeriod === "weekly" && rankingCategory === "traditional") {
        const weeklyTraditionalVotes = WEEKLY_TRADITIONAL_VOTES_BY_ID[postId]
        if (typeof weeklyTraditionalVotes === "number") return weeklyTraditionalVotes
      }
      const votes = allRankingStatsById.get(postId)?.votes
      return typeof votes === "number" && Number.isFinite(votes) ? Math.max(0, Math.round(votes)) : getRankingLikeCount(postId)
    },
    [allRankingStatsById, rankingCategory, rankingPeriod],
  )

  const getCategoryRankingDelta = useCallback(
    (postId: number) => {
      if (rankingPeriod === "weekly" && rankingCategory === "traditional") {
        const weeklyTraditionalDelta = WEEKLY_TRADITIONAL_DELTA_BY_ID[postId]
        if (weeklyTraditionalDelta) return weeklyTraditionalDelta
      }
      return allRankingStatsById.get(postId)?.delta ?? getRankingDelta(postId)
    },
    [allRankingStatsById, rankingCategory, rankingPeriod],
  )

  const categoryRankedPosts = useMemo(() => {
    if (rankingCategory === "all") return []
    return feedPosts
      .filter((post) => getPostRankingCategory(post) === rankingCategory)
      .sort((a, b) => getCategoryRankingVotes(b.id) - getCategoryRankingVotes(a.id))
  }, [getCategoryRankingVotes, rankingCategory])

  const rankingPodium = useMemo(() => {
    if (rankingCategory === "all") return rankingData.podiumByCategory.all
    if (rankingPeriod === "weekly" && rankingCategory === "whisky") return whiskyDummyPodiumItems
    if (rankingPeriod === "weekly" && rankingCategory === "spirits") return spiritsDummyPodiumItems
    if (rankingPeriod === "weekly" && rankingCategory === "etc") return etcDummyPodiumItems
    const dynamicPodium = categoryRankedPosts.slice(0, rankingCategory === "soju" ? 2 : 3).map((post, index) => ({
      id: post.id,
      rank: (index + 1) as 1 | 2 | 3,
      pair: getRankingPairLabel(post.id),
      category: rankingCategory,
      score: 0,
      votes: getCategoryRankingVotes(post.id),
      delta: getCategoryRankingDelta(post.id),
    }))
    if (rankingCategory !== "soju") return dynamicPodium

    const thirdSojuItem = sojuDummyRankingItems[0]
    return [
      ...dynamicPodium,
      {
        id: thirdSojuItem.id,
        rank: 3 as const,
        pair: thirdSojuItem.pair,
        category: "soju" as const,
        score: thirdSojuItem.score,
        votes: thirdSojuItem.votes,
        delta: thirdSojuItem.delta,
        disabled: true,
      },
    ]
  }, [categoryRankedPosts, getCategoryRankingDelta, getCategoryRankingVotes, rankingCategory, rankingData.podiumByCategory.all, rankingPeriod])

  const rankingRows = useMemo(() => {
    if (rankingCategory === "all") return rankingData.rows
    if (rankingCategory === "soju") return sojuDummyRankingItems.slice(1)
    if (rankingPeriod === "weekly" && rankingCategory === "wine") return wineDummyRankingItems
    if (rankingPeriod === "weekly" && rankingCategory === "whisky") return whiskyDummyRankingItems
    if (rankingPeriod === "weekly" && rankingCategory === "spirits") return spiritsDummyRankingItems
    if (rankingPeriod === "weekly" && rankingCategory === "etc") return etcDummyRankingItems
    if (rankingPeriod === "weekly" && rankingCategory === "traditional") {
      const linkedRows = categoryRankedPosts.slice(3, 5).map((post, index) => ({
        id: post.id,
        rank: index + 4,
        pair: getRankingPairLabel(post.id),
        category: rankingCategory,
        score: 0,
        votes: getCategoryRankingVotes(post.id),
        delta: getCategoryRankingDelta(post.id),
      }))
      return [...linkedRows, ...traditionalDummyRankingItems]
    }
    if (rankingPeriod === "weekly" && rankingCategory === "sake") {
      const linkedRows = categoryRankedPosts.slice(3, 4).map((post, index) => ({
        id: post.id,
        rank: index + 4,
        pair: getRankingPairLabel(post.id),
        category: rankingCategory,
        score: 0,
        votes: getCategoryRankingVotes(post.id),
        delta: getCategoryRankingDelta(post.id),
      }))
      return [...linkedRows, ...sakeDummyRankingItems]
    }
    if (rankingPeriod === "weekly" && rankingCategory === "beer") {
      const linkedRows = categoryRankedPosts.slice(3, 5).map((post, index) => ({
        id: post.id,
        rank: index + 4,
        pair: getRankingPairLabel(post.id),
        category: rankingCategory,
        score: 0,
        votes: getCategoryRankingVotes(post.id),
        delta: getCategoryRankingDelta(post.id),
      }))
      return [...linkedRows, ...beerDummyRankingItems]
    }
    return categoryRankedPosts.slice(3).map((post, index) => ({
      id: post.id,
      rank: index + 4,
      pair: getRankingPairLabel(post.id),
      category: rankingCategory,
      score: 0,
      votes: getCategoryRankingVotes(post.id),
      delta: getCategoryRankingDelta(post.id),
    }))
  }, [categoryRankedPosts, getCategoryRankingDelta, getCategoryRankingVotes, rankingCategory, rankingData.rows, rankingPeriod])

  const filteredRankingRows = useMemo(() => {
    if (!isCommunitySearchActive) {
      return rankingRows
    }

    const query = feedSearchValue.trim()
    return rankingRows.filter((row) => {
      const post = feedPosts.find((item) => item.id === row.id)
      if (!post) {
        return false
      }

      const targets = [
        post.title,
        post.body,
        usersMockById[post.authorId]?.profile ?? "",
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches = !selectedDrinkType || post.drinkType === selectedDrinkType
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))
      const priceValue = typeof post.priceWon === "number" && Number.isFinite(post.priceWon) ? post.priceWon : 0
      const priceMatches = isWithinRange(priceValue, priceRange[0], priceRange[1], priceRange[1] >= PRICE_MAX_WON)
      const abvValue = typeof post.abv === "number" && Number.isFinite(post.abv) ? post.abv : 0
      const abvMatches = isWithinRange(abvValue, abvRange[0], abvRange[1], abvRange[1] >= ABV_MAX)

      return queryMatches && drinkTypeMatches && categoryMatches && foodMatches && featureMatches && priceMatches && abvMatches
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    rankingRows,
    selectedCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
    priceRange,
    abvRange,
    ABV_MAX,
    PRICE_MAX_WON,
  ])

  const podiumRankOrder: Array<1 | 2 | 3> = [2, 1, 3]

  const filteredRankingPodium = useMemo(() => {
    if (!isCommunitySearchActive) {
      return rankingPodium
    }

    const query = feedSearchValue.trim()
    return rankingPodium.filter((podium) => {
      const post = feedPosts.find((item) => item.id === podium.id)
      if (!post) {
        return false
      }

      const targets = [
        post.title,
        post.body,
        usersMockById[post.authorId]?.profile ?? "",
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches = !selectedDrinkType || post.drinkType === selectedDrinkType
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))
      const priceValue = typeof post.priceWon === "number" && Number.isFinite(post.priceWon) ? post.priceWon : 0
      const priceMatches = isWithinRange(priceValue, priceRange[0], priceRange[1], priceRange[1] >= PRICE_MAX_WON)
      const abvValue = typeof post.abv === "number" && Number.isFinite(post.abv) ? post.abv : 0
      const abvMatches = isWithinRange(abvValue, abvRange[0], abvRange[1], abvRange[1] >= ABV_MAX)

      return queryMatches && drinkTypeMatches && categoryMatches && foodMatches && featureMatches && priceMatches && abvMatches
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    rankingPodium,
    selectedCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
    priceRange,
    abvRange,
    ABV_MAX,
    PRICE_MAX_WON,
  ])

  const visibleRankingRows = useMemo(() => {
    const rankOffset = filteredRankingPodium.length
    const maxRowCount = Math.max(0, MAX_VISIBLE_RANKING_ITEMS - rankOffset)
    const podiumIdSet = new Set(filteredRankingPodium.map((item) => item.id))

    return filteredRankingRows
      .filter((row) => !podiumIdSet.has(row.id))
      .slice(0, maxRowCount)
      .map((row, index) => ({
        ...row,
        votes: row.votes || getRankingLikeCount(row.id),
        rank: rankOffset + index + 1,
      }))
  }, [filteredRankingPodium, filteredRankingRows])

  const preloadUrls = useMemo(() => {
    const urls: Array<string | null | undefined> = []

    urls.push(
      getRankingBestCharacterSrc(),
      getRankingRankBadgeSrc(1),
      getRankingRankBadgeSrc(2),
      getRankingRankBadgeSrc(3),
    )

    const collectPairImages = (id: number, rank: number, pair: string) => {
      const [drink, food] = pair.split(" + ")
      const drinkSrc =
        getRankingDrinkSrcForItem(id, rank as 1 | 2 | 3) ??
        getRankingThumbSrcById("drink", id) ??
        getRankingThumbSrc("drink", drink ?? "")
      const photoSrc = getRankingPostPhotoSrc(id)
      const sideImageSrc = photoSrc ?? getRankingThumbSrcById("food", id) ?? getRankingThumbSrc("food", food ?? "")

      urls.push(sideImageSrc, drinkSrc)
    }

    filteredRankingPodium.forEach((podium) => collectPairImages(podium.id, podium.rank, podium.pair))
    visibleRankingRows.forEach((row) => collectPairImages(row.id, row.rank, row.pair))

    return Array.from(new Set(urls.filter((value): value is string => Boolean(value))))
  }, [filteredRankingPodium, visibleRankingRows])

  usePreloadImages(preloadUrls, { decode: true })

  const isRankingNoResults =
    isCommunitySearchActive && visibleRankingRows.length === 0 && filteredRankingPodium.length === 0

  useEffect(() => {
    if (!isFeedFilterPopupOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFeedFilterPopupOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFeedFilterPopupOpen])

  useEffect(() => {
    if (!isFeedFilterPopupOpen) {
      return
    }

    window.setTimeout(() => feedSearchInputRef.current?.focus(), 0)
  }, [isFeedFilterPopupOpen])

  useEffect(() => {
    const next = new Set<string>()

    for (const group of filteredPopupChipGroups) {
      const el = chipGroupRefs.current.get(group.title)
      if (!el) {
        continue
      }
      if (el.scrollHeight > el.clientHeight + 1) {
        next.add(group.title)
      }
    }

    const frameId = window.requestAnimationFrame(() => {
      setCollapsibleChipGroups(next)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [filteredPopupChipGroups, expandedChipGroups])

  const openFeedFilterPopup = () => {
    setIsFeedSearchConfirmed(false)
    setIsFeedFilterPopupOpen(true)
  }

  const confirmFeedSearch = (term?: string) => {
    const query = (term ?? feedSearchValue).trim()
    if (!query) {
      return
    }

    setFeedSearchValue(query)
    setIsFeedSearchConfirmed(true)
    setRecentSearchTerms((prev) => {
      const normalized = query.toLowerCase()
      const next = [query, ...prev.filter((item) => item.toLowerCase() !== normalized)]
      return next.slice(0, MAX_RECENT_TERMS)
    })
    feedSearchInputRef.current?.blur()
  }

  const resetFilters = () => {
    setSelectedDrinkType(null)
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setSelectedFoods(new Set())
    setPriceRange([PRICE_MIN_WON, PRICE_MAX_WON])
    setAbvRange([ABV_MIN, ABV_MAX])
  }

  const toggleDrinkType = (nextDrinkType: string) => {
    setSelectedDrinkType((prev) => (prev === nextDrinkType ? null : nextDrinkType))
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setIsFeedSearchConfirmed(true)
  }

  const toggleCategory = (chip: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setSelectedFeatures(new Set())
    setIsFeedSearchConfirmed(true)
  }

  const toggleFeature = (chip: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFood = (chip: string) => {
    setSelectedFoods((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const setChipGroupRef = useCallback((title: string) => {
    return (element: HTMLDivElement | null) => {
      chipGroupRefs.current.set(title, element)
    }
  }, [])

  const toggleChipGroupExpanded = (title: string) => {
    setExpandedChipGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  return (
    <section className="ranking_page page_screen" aria-label="랭킹">
      <CommunityHeader
        title="랭킹"
        topTab="ranking"
        openFilterAriaLabel="검색 필터 열기"
        onOpenFilter={openFeedFilterPopup}
        showFilterAction={false}
      />

      <SearchFilterModal
        isOpen={isFeedFilterPopupOpen}
        ariaLabel="랭킹 검색"
        onClose={() => setIsFeedFilterPopupOpen(false)}
      >
        <CommunityFilterPanel
          shellAriaLabel="랭킹 검색"
          inputAriaLabel="랭킹 검색어 입력"
          clearAriaLabel="검색어 지우기"
          placeholder="조합, 주류, 안주 검색"
          searchValue={feedSearchValue}
          inputRef={feedSearchInputRef}
          onChangeSearchValue={(nextValue) => {
            setFeedSearchValue(nextValue)
            setIsFeedSearchConfirmed(Boolean(nextValue.trim()))
          }}
          onConfirmSearch={confirmFeedSearch}
          onClearSearch={() => {
            setFeedSearchValue("")
            setIsFeedSearchConfirmed(false)
          }}
          onClose={() => setIsFeedFilterPopupOpen(false)}
          isNoResults={isPopupSearchNoResults}
          chipGroups={filteredPopupChipGroups}
          collapsibleGroupTitles={collapsibleChipGroups}
          expandedGroupTitles={expandedChipGroups}
          setGroupRef={setChipGroupRef}
          onToggleGroupExpanded={toggleChipGroupExpanded}
          selectedDrinkType={selectedDrinkType}
          selectedCategories={selectedCategories}
          selectedFeatures={selectedFeatures}
          selectedFoods={selectedFoods}
          onChipClick={(groupTitle, chip) => {
            if (groupTitle === "주종") {
              toggleDrinkType(chip)
              return
            }
            if (groupTitle === "카테고리") {
              toggleCategory(chip)
              return
            }
            if (groupTitle === "특징") {
              toggleFeature(chip)
              return
            }
            if (groupTitle === "음식") {
              toggleFood(chip)
            }
          }}
          recentSearchTerms={recentSearchTerms}
          onSelectRecentSearch={(term) => confirmFeedSearch(term)}
          onDeleteRecentSearch={(term) => {
            setRecentSearchTerms((prev) => prev.filter((item) => item !== term))
          }}
          onResetSearch={() => {
            setFeedSearchValue("")
            setIsFeedSearchConfirmed(false)
            resetFilters()
          }}
          priceRange={priceRange}
          priceMin={PRICE_MIN_WON}
          priceMax={PRICE_MAX_WON}
          priceMinPct={priceMinPct}
          priceMaxPct={priceMaxPct}
          onChangePriceMin={(nextMin) => {
            setPriceRange((prev) => [Math.min(nextMin, prev[1]), prev[1]])
          }}
          onChangePriceMax={(nextMax) => {
            setPriceRange((prev) => [prev[0], Math.max(nextMax, prev[0])])
          }}
          onSetPriceRange={(next) => setPriceRange(next)}
          abvRange={abvRange}
          abvMin={ABV_MIN}
          abvMax={ABV_MAX}
          abvMinPct={abvMinPct}
          abvMaxPct={abvMaxPct}
          onChangeAbvMin={(nextMin) => {
            setAbvRange((prev) => [Math.min(nextMin, prev[1]), prev[1]])
          }}
          onChangeAbvMax={(nextMax) => {
            setAbvRange((prev) => [prev[0], Math.max(nextMax, prev[0])])
          }}
          onReset={resetFilters}
          onApply={() => {
            if (feedSearchValue.trim()) {
              confirmFeedSearch(feedSearchValue)
            } else {
              setIsFeedSearchConfirmed(true)
            }
            setIsFeedFilterPopupOpen(false)
          }}
        />
      </SearchFilterModal>

      <CommunityRankingSection
        periodItems={rankingPeriods}
        activePeriod={rankingPeriod}
        onChangePeriod={(period) => setQueryParam("period", period)}
        disabledPeriodKeys={["daily", "monthly"]}
        categoryItems={rankingCategories}
        activeCategory={rankingCategory}
        onChangeCategory={(category) => setQueryParam("cat", category)}
        podiumRankOrder={podiumRankOrder}
        podiumItems={filteredRankingPodium}
        getPodiumVotes={getPodiumVotes}
        isNoResults={isRankingNoResults}
        suggestionTags={searchSuggestionTags}
        onSelectSuggestionTag={(tag) => {
          setFeedSearchValue(tag)
          setIsFeedSearchConfirmed(true)
        }}
        rows={visibleRankingRows}
      />
    </section>
  )
}
