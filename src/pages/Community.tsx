import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import FeedSegmentTabs from "../components/FeedSegmentTabs"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import RelatedContentPostCard from "../components/RelatedContentPostCard"
import QuestionPostRow from "../components/QuestionPostRow"
import SearchFilterModal from "../components/SearchFilterModal"
import CommunityFilterPanel from "../components/CommunityFilterPanel"
import FeedWriteRow from "../components/FeedWriteRow"
import {
  extractPairingTitle,
  feedPosts as communityFeedPosts,
  getPairingSummaryText,
  type FeedPost,
} from "../utils/communityPosts"
import { type FeedFilter, type PopupChipGroup, useCommunityPageData } from "../hooks/useCommunityPageData"
import { includesNormalized, normalizeSearchText } from "../utils/text"
import { getPairingTierByUserId, getPairingTierLabelByUserId } from "../utils/pairingTier"
import { getTierClassName } from "../utils/tier"
import { useStoredBooleanRecordFromIds, useStoredNumberSet, useStoredStringArray } from "../utils/storage"
import { usersMockById } from "../utils/usersMock"
import { COMMUNITY_USER_POSTS_KEY } from "../utils/communityStorage"
import { useMyOnboardingMeta } from "../hooks/useMyOnboardingMeta"

// NOTE: The contents of `src/pages/community/*` were inlined into this file so the `community` folder can be deleted.
// This is intentionally a single-file bundle for the Community page (as requested).

// FeedPost is sourced from `src/utils/communityPosts.ts` so list/detail stay consistent.
// Shared helpers live in `src/utils/*` and are imported above.


const feedPosts: FeedPost[] = communityFeedPosts
const USER_POSTS_UPDATED_EVENT = "community:user-posts-updated"

export default function Community() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { metaLine: myHeaderProfile } = useMyOnboardingMeta()
  const {
    COMMUNITY_FOLLOWED_USERS_KEY,
    COMMUNITY_LIKED_POSTS_KEY,
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
    PRICE_MIN_WON,
    PRICE_MAX_WON,
    ABV_MIN,
    ABV_MAX,
    feedFilterItems,
    bookmarkLists,
    popupCategoryByDrinkType,
    popupFeaturesByDrinkType,
    popupFoodCategories,
    defaultFollowedUserIdsMock,
  } = useCommunityPageData()

  const filterParam = searchParams.get("filter")
  const stateFilterRaw = (location.state as { initialFilter?: string } | null)?.initialFilter
  const stateFilter = stateFilterRaw === "free" || stateFilterRaw === "review" || stateFilterRaw === "follow" ? stateFilterRaw : null
  const initialFilter =
    filterParam === "free" || filterParam === "review" || filterParam === "follow" ? filterParam : stateFilter
  const [feedFilter, setFeedFilter] = useState<FeedFilter>(initialFilter ?? "review")
  const { value: followedUserIds, toggle: toggleFollowUser } = useStoredNumberSet(
    COMMUNITY_FOLLOWED_USERS_KEY,
    defaultFollowedUserIdsMock,
  )
  const { value: likedById, toggle: toggleLike } = useStoredBooleanRecordFromIds(COMMUNITY_LIKED_POSTS_KEY)
  const [bookmarkListById, setBookmarkListById] = useState<Record<number, string | null>>({})
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(
    null,
  )
  const [isFeedFilterPopupOpen, setIsFeedFilterPopupOpen] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => new Set())
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(() => new Set())
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN_WON, PRICE_MAX_WON])
  const [abvRange, setAbvRange] = useState<[number, number]>([ABV_MIN, ABV_MAX])
  const [feedSearchValue, setFeedSearchValue] = useState("")
  const [isFeedSearchConfirmed, setIsFeedSearchConfirmed] = useState(false)
  const feedSearchInputRef = useRef<HTMLInputElement | null>(null)
  const [expandedChipGroups, setExpandedChipGroups] = useState<Set<string>>(() => new Set())
  const chipGroupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const { value: recentSearchTerms, setValue: setRecentSearchTerms } = useStoredStringArray(
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
  )

  const readStoredUserPosts = useCallback((): FeedPost[] => {
    try {
      const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as FeedPost[]) : []
    } catch {
      return []
    }
  }, [])

  const [userPosts, setUserPosts] = useState<FeedPost[]>(() => readStoredUserPosts())



  const userPostIdSet = useMemo(() => new Set(userPosts.map((post) => post.id)), [userPosts])

  const persistUserPosts = useCallback((next: FeedPost[]) => {
    setUserPosts(next)
    try {
      window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
      window.dispatchEvent(new Event(USER_POSTS_UPDATED_EVENT))
    } catch {
      // ignore storage errors
    }
  }, [])

  const deleteUserPost = useCallback(
    (postId: number) => {
      const isMine = userPostIdSet.has(postId)
      if (!isMine) return
      const ok = window.confirm("이 글을 삭제할까요?")
      if (!ok) return

      persistUserPosts(userPosts.filter((post) => post.id !== postId))
      setBookmarkListById((prev) => {
        if (!(postId in prev)) return prev
        const next = { ...prev }
        delete next[postId]
        return next
      })
    },
    [persistUserPosts, userPostIdSet, userPosts],
  )

  useEffect(() => {
    const nextFilter =
      filterParam === "free" || filterParam === "review" || filterParam === "follow" ? filterParam : stateFilter
    if (!nextFilter) return
    setFeedFilter(nextFilter)
  }, [filterParam, stateFilter])

  useEffect(() => {
    const syncFromStorage = () => {
      setUserPosts(readStoredUserPosts())
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== COMMUNITY_USER_POSTS_KEY) return
      syncFromStorage()
    }

    window.addEventListener(USER_POSTS_UPDATED_EVENT, syncFromStorage)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(USER_POSTS_UPDATED_EVENT, syncFromStorage)
      window.removeEventListener("storage", handleStorage)
    }
  }, [readStoredUserPosts])

  // No effect needed: userPosts are initialized from localStorage and updated via storage events.

  const _legacyPopupChipGroups: PopupChipGroup[] = [
    { title: "상황", chips: ["혼술", "파티/모임",  "가족", "데이트", "캠핑/여행"] },
    { title: "음식", chips: ["고기류", "튀김", "매운음식", "해산물", "가벼운 안주"] },
    { title: "스타일", chips: ["가볍게", "진하게", "분위기용", "가성비"] },
    { title: "주종", chips: ["소주", "맥주", "와인", "위스키", "전통주", "기타"] },
    { title: "카테고리", chips: ["럼", "진", "꼬냑", "위스키", "보드카", "데킬라", "브랜디"] },
    { title: "상세 카테고리", chips: ["싱글몰트", "그레인", "블렌디드", "블렌디드몰트"] },
    { title: "특징", chips: ["부드러운", "무거운", "가벼운", "톡쏘는", "오크향", "과일향"] },
  ]

  const availableCategories = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupCategoryByDrinkType[selectedDrinkType] ?? []
  }, [selectedDrinkType])

  const availableFeatures = useMemo(() => {
    if (!selectedDrinkType) return []
    if (selectedCategories.size === 0) return []
    return popupFeaturesByDrinkType[selectedDrinkType] ?? []
  }, [selectedCategories, selectedDrinkType])

  const availableFoods = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupFoodCategories
  }, [selectedDrinkType])

  const effectiveSelectedFeatures = useMemo(() => {
    if (selectedFeatures.size === 0) return selectedFeatures
    const valid = new Set(availableFeatures)
    return new Set(Array.from(selectedFeatures).filter((item) => valid.has(item)))
  }, [availableFeatures, selectedFeatures])

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

    // Keep group titles visible even when chips are empty (step-by-step funnel UX).
    return groups
  }, [availableCategories, availableFeatures, availableFoods])

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
  }, [])

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
    effectiveSelectedFeatures.size > 0 ||
    selectedFoods.size > 0 ||
    priceRange[0] !== PRICE_MIN_WON ||
    priceRange[1] !== PRICE_MAX_WON ||
    abvRange[0] !== ABV_MIN ||
    abvRange[1] !== ABV_MAX

  const posts = useMemo(() => {
    const copy = [...userPosts, ...feedPosts]

    if (feedFilter === "review") {
      return copy
        .filter((post) => !post.isQna)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    if (feedFilter === "free") {
      return copy
        .filter((post) => post.isQna)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    if (feedFilter === "follow") {
      return copy
        .filter((post) => followedUserIds.has(post.authorId) && post.authorId !== 2001)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return []
  }, [feedFilter, followedUserIds, userPosts])

  const filteredPosts = useMemo(() => {
    if (!isCommunitySearchActive) {
      return posts
    }

    const query = feedSearchValue.trim()
    return posts.filter((post) => {
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
        effectiveSelectedFeatures.size === 0 ||
        (post.features ?? []).some((item) => effectiveSelectedFeatures.has(item))
      const priceValue = typeof post.priceWon === "number" && Number.isFinite(post.priceWon) ? post.priceWon : 0
      const priceMatches = priceValue >= priceRange[0] && (priceRange[1] >= PRICE_MAX_WON ? true : priceValue <= priceRange[1])
      const abvValue = typeof post.abv === "number" && Number.isFinite(post.abv) ? post.abv : 0
      const abvMatches =
        abvValue >= abvRange[0] && (abvRange[1] >= ABV_MAX ? true : abvValue <= abvRange[1])

      return (
        queryMatches && drinkTypeMatches && categoryMatches && foodMatches && featureMatches && priceMatches && abvMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    posts,
    selectedCategories,
    selectedDrinkType,
    effectiveSelectedFeatures,
    selectedFoods,
    priceRange,
    abvRange,
  ])

  const searchSuggestionTags = useMemo(() => {
    const query = feedSearchValue.trim()
    if (!query) {
      return []
    }

    const normalizedQuery = normalizeSearchText(query)
    const filterPostWithoutQuery = (post: FeedPost) => {
      const drinkTypeMatches = !selectedDrinkType || post.drinkType === selectedDrinkType
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        effectiveSelectedFeatures.size === 0 ||
        (post.features ?? []).some((item) => effectiveSelectedFeatures.has(item))
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
        } else if (normalizedTag && normalizedQuery && (normalizedTag[0] === normalizedQuery[0])) {
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
        if (effectiveSelectedFeatures.has(tag)) return false
        if (selectedFoods.has(tag)) return false
        return true
      })
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 8)
  }, [
    feedSearchValue,
    selectedCategories,
    selectedDrinkType,
    effectiveSelectedFeatures,
    selectedFoods,
  ])
  const isFeedNoResults = isCommunitySearchActive && filteredPosts.length === 0

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

  const getLikeCount = (post: FeedPost) => post.likeCount + (likedById[post.id] ? 1 : 0)
  const getCommentCount = (post: FeedPost) => post.commentCount

  const openBookmarkPicker = (postId: number) => {
    const currentListId = bookmarkListById[postId]
    setBookmarkPicker({ postId, selectedListId: currentListId ?? bookmarkLists[0].id })
  }

  const confirmBookmark = () => {
    if (!bookmarkPicker) {
      return
    }

    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    setBookmarkPicker(null)
  }

  const removeBookmark = () => {
    if (!bookmarkPicker) {
      return
    }

    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    setBookmarkPicker(null)
  }

  const cancelBookmark = () => setBookmarkPicker(null)

  const goToComments = (postId: number) => {
    const post = feedPosts.find((item) => item.id === postId)
    const pairingTitle = post?.title ? extractPairingTitle(post.title) : ""
    const locationLabel = post?.locationLabel?.trim() ?? ""
    navigate(`/community/pairing/${postId}#comments`, {
      state: post
        ? {
            pairingTitle,
            authorId: post.authorId,
            authorName: usersMockById[post.authorId]?.name ?? "익명",
            profile: usersMockById[post.authorId]?.profile ?? "",
            locationLabel,
            drinkType: post.drinkType ?? "",
            source: "feed",
          }
        : undefined,
    })
  }

  const toggleDrinkType = (nextDrinkType: string) => {
    setSelectedDrinkType((prev) => (prev === nextDrinkType ? null : nextDrinkType))
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setIsFeedSearchConfirmed(true)
  }

  const priceMinPct = useMemo(() => {
    const denom = PRICE_MAX_WON - PRICE_MIN_WON
    if (denom <= 0) return 0
    return Math.round(((priceRange[0] - PRICE_MIN_WON) / denom) * 1000) / 10
  }, [priceRange])

  const priceMaxPct = useMemo(() => {
    const denom = PRICE_MAX_WON - PRICE_MIN_WON
    if (denom <= 0) return 100
    return Math.round(((priceRange[1] - PRICE_MIN_WON) / denom) * 1000) / 10
  }, [priceRange])

  const abvMinPct = useMemo(() => {
    const denom = ABV_MAX - ABV_MIN
    if (denom <= 0) return 0
    return Math.round(((abvRange[0] - ABV_MIN) / denom) * 1000) / 10
  }, [abvRange])

  const abvMaxPct = useMemo(() => {
    const denom = ABV_MAX - ABV_MIN
    if (denom <= 0) return 100
    return Math.round(((abvRange[1] - ABV_MIN) / denom) * 1000) / 10
  }, [abvRange])

  const resetFilters = () => {
    setSelectedDrinkType(null)
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setSelectedFoods(new Set())
    setPriceRange([PRICE_MIN_WON, PRICE_MAX_WON])
    setAbvRange([ABV_MIN, ABV_MAX])
    setIsFeedSearchConfirmed(Boolean(feedSearchValue.trim()))
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

  const openFeedFilterPopup = () => {
    setIsFeedSearchConfirmed(false)
    setIsFeedFilterPopupOpen(true)
    window.setTimeout(() => feedSearchInputRef.current?.focus(), 0)
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

  const changeFeedFilter = (nextFilter: FeedFilter) => {
    setFeedFilter(nextFilter)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (initialFilter) {
      window.scrollTo(0, 0)
    }
  }, [initialFilter])

  const feedSectionTitle = feedFilter === "review" ? "페어링 후기" : feedFilter === "free" ? "질문" : "팔로우"

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <CommunityHeader
        title="커뮤니티"
        topTab="feed"
        openFilterAriaLabel="검색 필터 열기"
        onOpenFilter={openFeedFilterPopup}
        onOpenNotifications={() => {}}
      />

      <SearchFilterModal
        isOpen={isFeedFilterPopupOpen}
        ariaLabel="커뮤니티 검색"
        onClose={() => setIsFeedFilterPopupOpen(false)}
      >
        <CommunityFilterPanel
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
          collapsibleGroupTitles={new Set()}
          expandedGroupTitles={expandedChipGroups}
          setGroupRef={setChipGroupRef}
          onToggleGroupExpanded={toggleChipGroupExpanded}
          selectedDrinkType={selectedDrinkType}
          selectedCategories={selectedCategories}
          selectedFeatures={effectiveSelectedFeatures}
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

      <FeedSegmentTabs
        ariaLabel="커뮤니티 탭"
        items={feedFilterItems}
        activeKey={feedFilter}
        onChange={(key) => changeFeedFilter(key as FeedFilter)}
      />

      {feedFilter === "review" ? (
        <FeedWriteRow ariaLabel="후기 글쓰기" onClickReview={() => navigate("/community/write?mode=review")} />
      ) : null}

      {feedFilter === "free" ? (
        <FeedWriteRow ariaLabel="질문 글쓰기" onClickFree={() => navigate("/community/write?mode=free")} />
      ) : null}

      <h4 className="community_section_title">{feedSectionTitle}</h4>
      <div className={feedFilter === "free" ? "question_list" : "feed_cards"} aria-label="커뮤니티 글 목록">
        {isFeedNoResults ? (
          <div className="search_no_results" role="status">
            <p className="search_no_results_title">검색 결과가 없어요</p>
            {searchSuggestionTags.length > 0 ? (
              <div className="search_suggestion_row" aria-label="추천 태그">
                {searchSuggestionTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="search_suggestion_chip"
                    onClick={() => {
                      setFeedSearchValue(tag)
                      setIsFeedSearchConfirmed(true)
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {feedFilter === "free"
          ? filteredPosts.map((post, index) => (
            <QuestionPostRow
              key={post.id}
              postId={post.id}
              title={post.title}
              body={post.body}
              createdAt={post.createdAt}
              likeCount={getLikeCount(post)}
              commentCount={getCommentCount(post)}
              likeActive={Boolean(likedById[post.id])}
              likeAriaLabel={likedById[post.id] ? "좋아요 취소" : "좋아요"}
              onToggleLike={() => toggleLike(post.id)}
              onViewComments={() => goToComments(post.id)}
              linkTo={`/community/pairing/${post.id}`}
              linkState={{
                pairingTitle: extractPairingTitle(post.title),
                body: post.body,
                pairingSummary: post.pairingSummary ?? "",
                authorId: post.authorId,
                authorName: post.authorName?.trim() || usersMockById[post.authorId]?.name || "익명",
                profile: usersMockById[post.authorId]?.profile ?? "",
                locationLabel: post.locationLabel?.trim() ?? "",
                drinkType: post.drinkType ?? "",
                features: post.features ?? [],
                source: "feed",
                feedFilter: "free",
              }}
              thumbVariant={index % 3 === 1 ? "bottle" : index % 3 === 2 ? "photo" : "none"}
            />
          ))
          : filteredPosts.map((post) => (
            <RelatedContentPostCard
              key={post.id}
              postId={post.id}
              isQna={post.isQna}
              showImages={Boolean(post.photoIds?.length)}
              imageCount={post.photoIds?.length ?? 0}
              authorName={post.authorName?.trim() || usersMockById[post.authorId]?.name || "익명"}
              profile={post.authorId === 2001 ? myHeaderProfile : usersMockById[post.authorId]?.profile ?? ""}
              badgeClassName={
                getTierClassName(getPairingTierByUserId(post.authorId), "feed_post_badge")
              }
              badgeText={getPairingTierLabelByUserId(post.authorId)}
              menuAriaLabel={userPostIdSet.has(post.id) ? "내 글 설정" : undefined}
              onOpenMenu={userPostIdSet.has(post.id) ? () => deleteUserPost(post.id) : undefined}
              followButtonClassName={
                followedUserIds.has(post.authorId) ? "follow_toggle_button is_following" : "follow_toggle_button"
              }
              followAriaLabel={
                feedFilter === "follow"
                  ? "언팔로우"
                  : followedUserIds.has(post.authorId)
                    ? "언팔로잉"
                    : "팔로우"
              }
              followText={
                feedFilter === "follow" ? "언팔로우" : followedUserIds.has(post.authorId) ? "언팔로잉" : "팔로우"
              }
              onToggleFollow={() => toggleFollowUser(post.authorId)}
              linkTo={`/community/pairing/${post.id}`}
              linkState={{
                pairingTitle: extractPairingTitle(post.title),
                body: post.body,
                pairingSummary: post.pairingSummary ?? "",
                authorId: post.authorId,
                authorName: post.authorName?.trim() || usersMockById[post.authorId]?.name || "익명",
                profile: usersMockById[post.authorId]?.profile ?? "",
                locationLabel: post.locationLabel?.trim() ?? "",
                drinkType: post.drinkType ?? "",
                features: post.features ?? [],
                source: "feed",
                feedFilter: feedFilter,
              }}
              title={post.isQna ? post.title : extractPairingTitle(post.title)}
              body={getPairingSummaryText(post)}
              answerCount={post.answerCount}
              answerPreview={post.answerPreview}
              likeActive={Boolean(likedById[post.id])}
              likeAriaLabel={likedById[post.id] ? "좋아요 취소" : "좋아요"}
              likeText={`${getLikeCount(post)}`}
              onToggleLike={() => toggleLike(post.id)}
              commentText={`${getCommentCount(post)}`}
              onViewComments={() => goToComments(post.id)}
              bookmarkActive={Boolean(bookmarkListById[post.id])}
              bookmarkAriaLabel={bookmarkListById[post.id] ? "북마크 변경" : "북마크"}
              onOpenBookmarkPicker={() => openBookmarkPicker(post.id)}
            />
          ))}
      </div>

      {bookmarkPicker ? (
        <CommunityBookmarkPickerModal
          picker={bookmarkPicker}
          lists={bookmarkLists}
          ariaLabel="북마크 리스트 선택"
          titleText={
            bookmarkListById[bookmarkPicker.postId] ? "북마크를 어디로 옮길까요?" : "어느 리스트에 저장할까요?"
          }
          listPickerAriaLabel="북마크 리스트"
          secondaryLabel={bookmarkListById[bookmarkPicker.postId] ? "해제" : "취소"}
          primaryLabel="확인"
          onDismiss={cancelBookmark}
          onSelectList={(listId) => setBookmarkPicker({ ...bookmarkPicker, selectedListId: listId })}
          onSecondary={bookmarkListById[bookmarkPicker.postId] ? removeBookmark : cancelBookmark}
          onPrimary={confirmBookmark}
        />
      ) : null}
    </section>
  )
}
