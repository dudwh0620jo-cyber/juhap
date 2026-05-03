import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import FeedSegmentTabs from "../components/FeedSegmentTabs"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import RelatedContentPostCard from "../components/RelatedContentPostCard"
import CommunitySearchInput from "../components/CommunitySearchInput"
import CommunityRankingSection from "../components/CommunityRankingSection"
import CommunityFeedFilterPopupBody from "../components/CommunityFeedFilterPopupBody"
import FeedWriteRow from "../components/FeedWriteRow"
import FeedWriteFab from "../components/FeedWriteFab"
import type { FeedFilter, FeedPost, PopupChipGroup } from "./community/types"
import {
  COMMUNITY_FOLLOWED_USERS_KEY,
  COMMUNITY_LIKED_POSTS_KEY,
  COMMUNITY_SEARCH_RECENT_KEY,
  MAX_RECENT_TERMS,
  bookmarkLists,
  feedFilterItems,
  pairingReviewGrades,
  popupCategoryByDrinkType,
  popupDetailByCategory,
  popupFeaturesByDetail,
  rankingCategories,
  rankingPeriods,
  userGradesByAuthorId,
} from "./community/constants"
import { feedPosts, followedUsersMock, rankingDataByPeriod } from "./community/mock"
import {
  createRankingFeatureTags,
  extractPairingTitle,
  getPodiumVotes,
  includesNormalized,
  normalizeRankingCategory,
  normalizeRankingPeriod,
  normalizeSearchText,
  normalizeTopTab,
} from "./community/utils"
import { useStoredBooleanRecordFromIds, useStoredNumberSet, useStoredStringArray } from "./community/hooks/useCommunityStorage"



export default function Community() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [feedFilter, setFeedFilter] = useState<FeedFilter>("review")
  const { value: followedUserIds, toggle: toggleFollowUser } = useStoredNumberSet(
    COMMUNITY_FOLLOWED_USERS_KEY,
    followedUsersMock.map((user) => user.id),
  )
  const [hasWriteFabScrolled, setHasWriteFabScrolled] = useState(false)
  const [isWriteFabVisible, setIsWriteFabVisible] = useState(false)
  const { value: likedById, toggle: toggleLike } = useStoredBooleanRecordFromIds(COMMUNITY_LIKED_POSTS_KEY)
  const [bookmarkListById, setBookmarkListById] = useState<Record<number, string | null>>({})
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(
    null,
  )
  const [isFeedFilterPopupOpen, setIsFeedFilterPopupOpen] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [selectedDetailCategories, setSelectedDetailCategories] = useState<Set<string>>(() => new Set())
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => new Set())
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(() => new Set())
  const [feedSearchValue, setFeedSearchValue] = useState("")
  const [isFeedSearchConfirmed, setIsFeedSearchConfirmed] = useState(false)
  const feedSearchInputRef = useRef<HTMLInputElement | null>(null)
  const [expandedChipGroups, setExpandedChipGroups] = useState<Set<string>>(() => new Set())
  const [collapsibleChipGroups, setCollapsibleChipGroups] = useState<Set<string>>(() => new Set())
  const chipGroupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const { value: recentSearchTerms, setValue: setRecentSearchTerms } = useStoredStringArray(
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
  )

  const topTab = normalizeTopTab(searchParams.get("top")) ?? "feed"
  const rankingPeriod = normalizeRankingPeriod(searchParams.get("period")) ?? "weekly"
  const rankingCategory = normalizeRankingCategory(searchParams.get("cat")) ?? "all"

  const _legacyPopupChipGroups: PopupChipGroup[] = [
    { title: "상황", chips: ["혼술", "데이트", "파티/모임", "홈파티", "기타"] },
    { title: "음식", chips: ["고기류", "튀김", "매운음식", "해산물", "가벼운 안주"] },
    { title: "스타일", chips: ["가볍게", "진하게", "분위기용", "가성비"] },
    { title: "주종", chips: ["소주", "맥주", "와인", "위스키", "전통주", "기타"] },
    { title: "카테고리", chips: ["럼", "진", "꼬냑", "위스키", "보드카", "데킬라", "브랜디"] },
    { title: "상세 카테고리", chips: ["싱글몰트", "그레인", "블렌디드", "블렌디드몰트"] },
    { title: "특징", chips: ["부드러운", "무거운", "가벼운", "톡쏘는", "오크향", "과일향"] },
  ]

  const availableCategories = useMemo(() => {
    if (!selectedDrinkType) {
      const merged = new Set<string>()
      for (const categories of Object.values(popupCategoryByDrinkType)) {
        for (const category of categories) {
          merged.add(category)
        }
      }
      return Array.from(merged)
    }
    return popupCategoryByDrinkType[selectedDrinkType] ?? []
  }, [selectedDrinkType])

  const availableDetailCategories = useMemo(() => {
    if (selectedCategories.size === 0) {
      return []
    }
    const merged = new Set<string>()
    for (const category of selectedCategories) {
      for (const detail of popupDetailByCategory[category] ?? []) {
        merged.add(detail)
      }
    }
    return Array.from(merged)
  }, [selectedCategories])

  const availableFeatures = useMemo(() => {
    if (selectedDetailCategories.size === 0) {
      return []
    }
    const merged = new Set<string>()
    for (const detail of selectedDetailCategories) {
      for (const feature of popupFeaturesByDetail[detail] ?? []) {
        merged.add(feature)
      }
    }
    return Array.from(merged)
  }, [selectedDetailCategories])

  useEffect(() => {
    const valid = new Set(availableDetailCategories)
    setSelectedDetailCategories((prev) => new Set(Array.from(prev).filter((item) => valid.has(item))))
  }, [availableDetailCategories])

  useEffect(() => {
    const valid = new Set(availableFeatures)
    setSelectedFeatures((prev) => new Set(Array.from(prev).filter((item) => valid.has(item))))
  }, [availableFeatures])

  const popupChipGroups: PopupChipGroup[] = useMemo(() => {
    const groups: PopupChipGroup[] = [
      { title: "주종", chips: Object.keys(popupCategoryByDrinkType) },
      { title: "카테고리", chips: availableCategories },
      { title: "상세카테고리", chips: availableDetailCategories },
      { title: "특징", chips: availableFeatures },
      {
        title: "음식",
        chips: [
          "치킨",
          "피자",
          "삼겹살",
          "회",
          "굴",
          "떡볶이",
          "파스타",
          "육회",
          "치즈",
          "족발",
          "해물파전",
          "스테이크",
          "햄버거",
          "감자튀김",
          "다크초콜릿",
          "타코",
          "가라아게",
          "오뎅",
          "명란구이",
        ],
      },
    ]

    return groups.filter((group) => group.title === "주종" || group.chips.length > 0)
  }, [availableCategories, availableDetailCategories, availableFeatures])

  void _legacyPopupChipGroups

  const filteredPopupChipGroups = useMemo(() => {
    const query = feedSearchValue.trim().toLowerCase()
    if (!isFeedSearchConfirmed || !query) {
      return popupChipGroups
    }

    const results: PopupChipGroup[] = []
    for (const group of popupChipGroups) {
      if (group.title.toLowerCase().includes(query)) {
        results.push(group)
        continue
      }

      const chips = group.chips.filter((chip) => chip.toLowerCase().includes(query))
      if (chips.length > 0) {
        results.push({ title: group.title, chips })
      }
    }

    return results
  }, [feedSearchValue, isFeedSearchConfirmed, popupChipGroups])

  const isPopupSearchNoResults =
    isFeedSearchConfirmed && feedSearchValue.trim() && filteredPopupChipGroups.length === 0

  const isCommunitySearchActive =
    Boolean(feedSearchValue.trim()) ||
    isFeedSearchConfirmed ||
    Boolean(selectedDrinkType) ||
    selectedCategories.size > 0 ||
    selectedDetailCategories.size > 0 ||
    selectedFeatures.size > 0 ||
    selectedFoods.size > 0

  const posts = useMemo(() => {
    const copy = [...feedPosts]

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

    if (feedFilter === "popular") {
      return copy.sort((a, b) => b.popularityScore - a.popularityScore)
    }

    if (feedFilter === "follow") {
      return copy
        .filter((post) => followedUserIds.has(post.authorId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return []
  }, [feedFilter, followedUserIds])

  const filteredPosts = useMemo(() => {
    if (!isCommunitySearchActive) {
      return posts
    }

    const query = feedSearchValue.trim()
    return posts.filter((post) => {
      const targets = [post.title, post.body, post.profile ?? "", ...(post.searchTags ?? [])]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches =
        !selectedDrinkType ||
        post.drinkType === selectedDrinkType ||
        (post.categories ?? []).some((item) => (popupCategoryByDrinkType[selectedDrinkType] ?? []).includes(item))
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        (post.detailCategories ?? []).some((item) => selectedDetailCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))

      return (
        queryMatches && drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    posts,
    selectedCategories,
    selectedDetailCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])

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
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        (post.detailCategories ?? []).some((item) => selectedDetailCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))
      return drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
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
        ...(post.detailCategories ?? []),
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
          ...(post.detailCategories ?? []),
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
        if (selectedDetailCategories.has(tag)) return false
        if (selectedFeatures.has(tag)) return false
        if (selectedFoods.has(tag)) return false
        return true
      })
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 8)
  }, [
    feedSearchValue,
    selectedCategories,
    selectedDetailCategories,
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
      const categoryLabel = rankingCategories.find((category) => category.key === row.category)?.label ?? ""
      const featureTags = createRankingFeatureTags(row.category, row.pair)
      const targets = [row.pair, categoryLabel, ...featureTags]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches = !selectedDrinkType || includesNormalized(categoryLabel, selectedDrinkType)
      const categoryMatches =
        selectedCategories.size === 0 || Array.from(selectedCategories).some((item) => includesNormalized(targets.join(" "), item))
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        Array.from(selectedDetailCategories).some((item) => includesNormalized(targets.join(" "), item))
      const foodMatches =
        selectedFoods.size === 0 || Array.from(selectedFoods).some((item) => includesNormalized(row.pair, item))
      const featureMatches =
        selectedFeatures.size === 0 || featureTags.some((tag) => selectedFeatures.has(tag))

      return (
        queryMatches && drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    rankingRows,
    selectedCategories,
    selectedDetailCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])

  const rankingPodium = rankingData.podiumByCategory[rankingCategory] ?? rankingData.podiumByCategory.all
  const podiumRankOrder: Array<1 | 2 | 3> = [2, 1, 3]

  const filteredRankingPodium = useMemo(() => {
    if (!isCommunitySearchActive) {
      return rankingPodium
    }

    const query = feedSearchValue.trim()
    return rankingPodium.filter((podium) => {
      const categoryLabel = rankingCategories.find((category) => category.key === podium.category)?.label ?? ""
      const featureTags = createRankingFeatureTags(podium.category, podium.pair)
      const targets = [podium.pair, categoryLabel, ...featureTags]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches = !selectedDrinkType || includesNormalized(categoryLabel, selectedDrinkType)
      const categoryMatches =
        selectedCategories.size === 0 || Array.from(selectedCategories).some((item) => includesNormalized(targets.join(" "), item))
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        Array.from(selectedDetailCategories).some((item) => includesNormalized(targets.join(" "), item))
      const foodMatches =
        selectedFoods.size === 0 || Array.from(selectedFoods).some((item) => includesNormalized(podium.pair, item))
      const featureMatches =
        selectedFeatures.size === 0 || featureTags.some((tag) => selectedFeatures.has(tag))

      return (
        queryMatches && drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    rankingPodium,
    selectedCategories,
    selectedDetailCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])

  const isRankingNoResults = isCommunitySearchActive && filteredRankingRows.length === 0 && filteredRankingPodium.length === 0
  const isFeedNoResults = isCommunitySearchActive && filteredPosts.length === 0

  const setQueryParam = (key: "top" | "period" | "cat", value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(key, value)
    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    const handleScroll = () => {
      if (topTab !== "feed" || (feedFilter !== "review" && feedFilter !== "free")) {
        setIsWriteFabVisible(false)
        return
      }

      setHasWriteFabScrolled(true)
      const nextVisible = window.scrollY > 0
      setIsWriteFabVisible((prev) => (prev === nextVisible ? prev : nextVisible))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [feedFilter, topTab])

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

    setIsFeedSearchConfirmed(false)
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

    setCollapsibleChipGroups(next)
  }, [filteredPopupChipGroups, expandedChipGroups])

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
    const locationLabel = post?.profile?.split("/")?.[1]?.trim() ?? ""
    navigate(`/community/pairing/${postId}#comments`, {
      state: post
        ? {
            pairingTitle,
            authorId: post.authorId,
            authorName: post.authorName,
            profile: post.profile ?? "",
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
    setSelectedDetailCategories(new Set())
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
    setIsFeedSearchConfirmed(true)
  }

  const toggleDetailCategory = (chip: string) => {
    setSelectedDetailCategories((prev) => {
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

  const openFeedFilterPopup = () => setIsFeedFilterPopupOpen(true)

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
    setHasWriteFabScrolled(false)
    setIsWriteFabVisible(false)
    setFeedFilter(nextFilter)
  }

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <CommunityHeader
        title="커뮤니티"
        topTab={topTab}
        tabsAriaLabel="커뮤니티 탭"
        openFilterAriaLabel="검색 필터 열기"
        tabs={[
          { key: "ranking", label: "랭킹" },
          { key: "feed", label: "피드" },
        ]}
        onOpenFilter={openFeedFilterPopup}
        onSelectTab={(tab) => setQueryParam("top", tab)}
      />

      {isFeedFilterPopupOpen ? (
        <div
          className="feed_filter_overlay"
          role="presentation"
          onClick={() => setIsFeedFilterPopupOpen(false)}
        >
          <div
            className="feed_filter_popup"
            role="dialog"
            aria-modal="true"
            aria-label="커뮤니티 검색"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="feed_filter_popup_top">
              
              <CommunitySearchInput
                shellAriaLabel="커뮤니티 검색"
                inputAriaLabel="커뮤니티 검색어 입력"
                clearAriaLabel="검색어 지우기"
                placeholder="조합, 주류, 안주 검색"
                value={feedSearchValue}
                inputRef={feedSearchInputRef}
                onChange={(nextValue) => {
                  setFeedSearchValue(nextValue)
                  setIsFeedSearchConfirmed(Boolean(nextValue.trim()))
                }}
                onEnter={confirmFeedSearch}
                onClear={() => {
                  setFeedSearchValue("")
                  setIsFeedSearchConfirmed(false)
                }}
              />
              <button
                type="button"
                className="feed_filter_close_button"
                aria-label="취소"
                onClick={() => setIsFeedFilterPopupOpen(false)}
              >
                취소
              </button>
            </div>

            {isPopupSearchNoResults ? (
              <p className="feed_filter_no_results" role="status">
                검색 결과가 없어요
              </p>
            ) : null}

            <CommunityFeedFilterPopupBody
              groups={filteredPopupChipGroups}
              collapsibleGroupTitles={collapsibleChipGroups}
              expandedGroupTitles={expandedChipGroups}
              setGroupRef={setChipGroupRef}
              onToggleGroupExpanded={toggleChipGroupExpanded}
              selectedDrinkType={selectedDrinkType}
              selectedCategories={selectedCategories}
              selectedDetailCategories={selectedDetailCategories}
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
                if (groupTitle === "상세카테고리") {
                  toggleDetailCategory(chip)
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
            />
          </div>
        </div>
      ) : null}

      {topTab === "ranking" ? (
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
      ) : (
        <section className="feed_page" aria-label="커뮤니티 피드">
          <FeedSegmentTabs
            ariaLabel="피드 필터"
            items={feedFilterItems}
            activeKey={feedFilter}
            onChange={(key) => changeFeedFilter(key as FeedFilter)}
          />
          <div className="feed_cards">
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

            {feedFilter === "free" || feedFilter === "review" ? <FeedWriteRow ariaLabel="글 작성" mode={feedFilter} /> : null}
            {filteredPosts.map((post) => (
              <RelatedContentPostCard
                key={post.id}
                postId={post.id}
                isQna={post.isQna}
                authorName={post.authorName}
                profile={post.profile}
                badgeClassName={
                  userGradesByAuthorId[post.authorId]?.pairingReviewTier === 5
                    ? "feed_post_badge is_tier5"
                    : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 4
                      ? "feed_post_badge is_tier4"
                      : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 3
                        ? "feed_post_badge is_tier3"
                        : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 2
                          ? "feed_post_badge is_tier2"
                          : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 1
                            ? "feed_post_badge is_tier1"
                            : "feed_post_badge"
                }
                badgeText={pairingReviewGrades[(userGradesByAuthorId[post.authorId]?.pairingReviewTier ?? 1) - 1]}
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
                  authorId: post.authorId,
                  authorName: post.authorName,
                  profile: post.profile ?? "",
                  locationLabel: post.profile?.split("/")?.[1]?.trim() ?? "",
                  drinkType: post.drinkType ?? "",
                  source: "feed",
                }}
                title={post.isQna ? post.title : extractPairingTitle(post.title)}
                body={post.body}
                answerCount={post.answerCount}
                answerPreview={post.answerPreview}
                likeActive={Boolean(likedById[post.id])}
                likeAriaLabel={likedById[post.id] ? "좋아요 취소" : "좋아요"}
                likeText={`♥ ${getLikeCount(post)}`}
                onToggleLike={() => toggleLike(post.id)}
                commentText={`💬 ${getCommentCount(post)}`}
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

          {feedFilter === "review" || feedFilter === "free" ? (
            <FeedWriteFab ariaLabel="글 작성" isVisible={hasWriteFabScrolled && isWriteFabVisible} />
          ) : null}
        </section>
      )}
    </section>
  )
}
