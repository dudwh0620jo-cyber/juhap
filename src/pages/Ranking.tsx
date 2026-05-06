import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import CommunityRankingSection from "../components/CommunityRankingSection"
import SearchFilterModal from "../components/SearchFilterModal"
import CommunityFilterPanel from "../components/CommunityFilterPanel"
import { useRankingQueryParams } from "../hooks/useRankingQueryParams"
import {
  podiumVotesById,
  rankingCategories,
  rankingDataByPeriod,
  rankingPeriods,
  type RankingPodium,
} from "../utils/rankingData"
import { feedPosts, type FeedPost } from "../utils/communityPosts"
import { includesNormalized, normalizeSearchText } from "../utils/text"
import { useStoredStringArray } from "../utils/storage"
import { validatePostIdsExist } from "../utils/rankingValidation"
import { useCommunityPageData } from "../hooks/useCommunityPageData"
import { COMMUNITY_SEARCH_RECENT_KEY } from "../utils/communityStorage"
import { usersMockById } from "../utils/usersMock"

type PopupChipGroup = {
  title: string
  chips: string[]
}

const MAX_RECENT_TERMS = 10

const getPodiumVotes = (podium: RankingPodium) => {
  const explicitVotes = podium.votes ?? podiumVotesById[podium.id]
  if (typeof explicitVotes === "number" && Number.isFinite(explicitVotes)) {
    return Math.max(0, Math.round(explicitVotes))
  }

  const base = 5200
  const noise = (podium.id * 37 + podium.rank * 191) % 3600
  return base + noise
}

export default function CommunityRanking() {
  const { rankingPeriod, rankingCategory, setQueryParam } = useRankingQueryParams()
  const { PRICE_MIN_WON, PRICE_MAX_WON, ABV_MIN, ABV_MAX, popupCategoryByDrinkType, popupFeaturesByDrinkType, popupFoodCategories } =
    useCommunityPageData()

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

  const _legacyPopupChipGroups: PopupChipGroup[] = [
    { title: "상황", chips: ["혼술", "데이트", "파티/모임", "홈파티", "기타"] },
    { title: "음식", chips: ["고기류", "튀김", "매운음식", "해산물", "가벼운 안주"] },
    { title: "스타일", chips: ["가볍게", "진하게", "분위기용", "가성비"] },
    { title: "주종", chips: ["소주", "맥주", "와인", "위스키", "전통주", "기타"] },
    { title: "카테고리", chips: ["럼", "진", "꼬냑", "위스키", "보드카", "데킬라", "브랜디"] },
    { title: "특징", chips: ["부드러운", "무거운", "가벼운", "톡쏘는", "오크향", "과일향"] },
  ]

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

  void _legacyPopupChipGroups

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
    const denom = PRICE_MAX_WON - PRICE_MIN_WON
    if (denom <= 0) return 0
    return Math.round(((priceRange[0] - PRICE_MIN_WON) / denom) * 1000) / 10
  }, [PRICE_MAX_WON, PRICE_MIN_WON, priceRange])

  const priceMaxPct = useMemo(() => {
    const denom = PRICE_MAX_WON - PRICE_MIN_WON
    if (denom <= 0) return 100
    return Math.round(((priceRange[1] - PRICE_MIN_WON) / denom) * 1000) / 10
  }, [PRICE_MAX_WON, PRICE_MIN_WON, priceRange])

  const abvMinPct = useMemo(() => {
    const denom = ABV_MAX - ABV_MIN
    if (denom <= 0) return 0
    return Math.round(((abvRange[0] - ABV_MIN) / denom) * 1000) / 10
  }, [ABV_MAX, ABV_MIN, abvRange])

  const abvMaxPct = useMemo(() => {
    const denom = ABV_MAX - ABV_MIN
    if (denom <= 0) return 100
    return Math.round(((abvRange[1] - ABV_MIN) / denom) * 1000) / 10
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
  const rankingRows = useMemo(() => {
    return rankingCategory === "all"
      ? rankingData.rows
      : rankingData.rows.filter((row) => row.category === rankingCategory)
  }, [rankingCategory, rankingData.rows])

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
      const priceMatches =
        priceValue >= priceRange[0] && (priceRange[1] >= PRICE_MAX_WON ? true : priceValue <= priceRange[1])
      const abvValue = typeof post.abv === "number" && Number.isFinite(post.abv) ? post.abv : 0
      const abvMatches = abvValue >= abvRange[0] && (abvRange[1] >= ABV_MAX ? true : abvValue <= abvRange[1])

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

  const rankingPodium = rankingData.podiumByCategory[rankingCategory] ?? rankingData.podiumByCategory.all
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
      const priceMatches =
        priceValue >= priceRange[0] && (priceRange[1] >= PRICE_MAX_WON ? true : priceValue <= priceRange[1])
      const abvValue = typeof post.abv === "number" && Number.isFinite(post.abv) ? post.abv : 0
      const abvMatches = abvValue >= abvRange[0] && (abvRange[1] >= ABV_MAX ? true : abvValue <= abvRange[1])

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

  const isRankingNoResults =
    isCommunitySearchActive && filteredRankingRows.length === 0 && filteredRankingPodium.length === 0

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
    <section className="community_page page_screen" aria-label="랭킹">
      <CommunityHeader
        title="랭킹"
        topTab="ranking"
        openFilterAriaLabel="검색 필터 열기"
        onOpenFilter={openFeedFilterPopup}
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
            setIsFeedFilterPopupOpen(false)
            setIsFeedSearchConfirmed(true)
          }}
        />
      </SearchFilterModal>

      <CommunityRankingSection
        periodItems={rankingPeriods}
        activePeriod={rankingPeriod}
        onChangePeriod={(period) => setQueryParam("period", period)}
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
        rows={filteredRankingRows}
      />
    </section>
  )
}


