import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import FeedSegmentTabs from "../components/FeedSegmentTabs"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import RelatedContentPostCard from "../components/RelatedContentPostCard"
import QuestionPostRow from "../components/QuestionPostRow"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import SearchFilterModal from "../components/SearchFilterModal"
import CommunityFilterPanel from "../components/CommunityFilterPanel"
import FeedWriteRow from "../components/FeedWriteRow"
import PostOwnerActionModal from "../components/PostOwnerActionModal"
import {
  extractPairingTitle,
  feedPosts as communityFeedPosts,
  type FeedPost,
} from "../utils/communityPosts"
import { type FeedFilter, type PopupChipGroup, useCommunityPageData } from "../hooks/useCommunityPageData"
import { includesNormalized, normalizeSearchText } from "../utils/text"
import { getPairingTierByUserId, getPairingTierLabelByUserId } from "../utils/pairingTier"
import { getTierClassName } from "../utils/tier"
import {
  useStoredBooleanRecordFromIds,
  useStoredNullableStringRecord,
  useStoredNumberSet,
  useStoredStringArray,
} from "../utils/storage"
import { usersMockById } from "../utils/usersMock"
import { COMMUNITY_BOOKMARK_LIST_BY_POST_KEY, COMMUNITY_USER_POSTS_KEY } from "../utils/communityStorage"
import { useMyOnboardingMeta } from "../hooks/useMyOnboardingMeta"

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
  const { value: bookmarkListById, setValue: setBookmarkListById } = useStoredNullableStringRecord(
    COMMUNITY_BOOKMARK_LIST_BY_POST_KEY,
  )
  const { value: recentSearchTerms, setValue: setRecentSearchTerms } = useStoredStringArray(
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
  )

  const [pendingDeletePostId, setPendingDeletePostId] = useState<number | null>(null)
  const [pendingUnfollowUser, setPendingUnfollowUser] = useState<{ userId: number; name: string } | null>(null)
  const [ownerPostAction, setOwnerPostAction] = useState<FeedPost | null>(null)
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(null)
  const [isFeedFilterPopupOpen, setIsFeedFilterPopupOpen] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => new Set())
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(() => new Set())
  const [feedSearchValue, setFeedSearchValue] = useState("")
  const [isFeedSearchConfirmed, setIsFeedSearchConfirmed] = useState(false)
  const feedSearchInputRef = useRef<HTMLInputElement | null>(null)
  const [expandedChipGroups, setExpandedChipGroups] = useState<Set<string>>(() => new Set())
  const chipGroupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

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
      if (!userPostIdSet.has(postId)) return
      setPendingDeletePostId(postId)
    },
    [userPostIdSet],
  )

  const requestToggleFollowUser = useCallback(
    (userId: number, authorName: string) => {
      if (followedUserIds.has(userId)) {
        setPendingUnfollowUser({ userId, name: authorName })
        return
      }
      toggleFollowUser(userId)
    },
    [followedUserIds, toggleFollowUser],
  )

  const openOwnPostEditor = useCallback(
    (post: FeedPost) => {
      const mode = post.isQna ? "free" : "review"
      navigate(`/community/write?mode=${mode}&editId=${post.id}`, {
        state: { editPost: post },
      })
    },
    [navigate],
  )

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

  const effectiveSelectedFeatures = useMemo(() => {
    if (selectedFeatures.size === 0) return selectedFeatures
    const valid = new Set(availableFeatures)
    return new Set(Array.from(selectedFeatures).filter((item) => valid.has(item)))
  }, [availableFeatures, selectedFeatures])

  const popupChipGroups: PopupChipGroup[] = useMemo(
    () => [
      { title: "주종", chips: Object.keys(popupCategoryByDrinkType) },
      { title: "카테고리", chips: availableCategories },
      { title: "특징", chips: availableFeatures },
      { title: "음식", chips: availableFoods },
    ],
    [availableCategories, availableFeatures, availableFoods, popupCategoryByDrinkType],
  )

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
    const query = feedSearchValue.trim()
    if (!isFeedSearchConfirmed || !query) {
      return popupChipGroups
    }

    const relatedByGroup = new Map<string, Set<string>>()
    for (const group of searchAllChipGroups) {
      relatedByGroup.set(group.title, new Set())
    }

    const addRelated = (groupTitle: string, values: string[]) => {
      const target = relatedByGroup.get(groupTitle)
      if (!target) return
      for (const value of values) {
        if (value?.trim()) target.add(value)
      }
    }

    for (const post of feedPosts) {
      const postTargets = [
        post.title,
        post.body,
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ]

      if (!includesNormalized(postTargets.join(" "), query)) continue

      addRelated("주종", post.drinkType ? [post.drinkType] : [])
      addRelated("카테고리", post.categories ?? [])
      addRelated("특징", post.features ?? [])
      addRelated("음식", post.foods ?? [])
    }

    const results: PopupChipGroup[] = []
    for (const group of searchAllChipGroups) {
      const directMatches = group.chips.filter((chip) => includesNormalized(chip, query))
      const relatedMatches = Array.from(relatedByGroup.get(group.title) ?? [])
      const merged = Array.from(new Set([...directMatches, ...relatedMatches]))

      if (group.title.includes(query)) {
        results.push(group)
        continue
      }

      if (merged.length > 0) {
        results.push({ title: group.title, chips: merged })
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
    selectedFoods.size > 0

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

      return queryMatches && drinkTypeMatches && categoryMatches && foodMatches && featureMatches
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    posts,
    selectedCategories,
    selectedDrinkType,
    effectiveSelectedFeatures,
    selectedFoods,
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
      const postTargets = [
        post.title,
        post.body,
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ].filter(Boolean)

      if (!includesNormalized(postTargets.join(" "), query)) continue

      const relatedTags = [
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ].filter(Boolean)

      for (const tag of relatedTags) {
        const normalizedTag = normalizeSearchText(tag)
        let score = 3
        if (normalizedTag.includes(normalizedQuery) || normalizedQuery.includes(normalizedTag)) {
          score += 5
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
            authorName: usersMockById[post.authorId]?.name ?? "??ъ구",
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

  const resetFilters = () => {
    setSelectedDrinkType(null)
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setSelectedFoods(new Set())
    setIsFeedSearchConfirmed(Boolean(feedSearchValue.trim()))
  }

  const toggleCategory = (chip: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFeature = (chip: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFood = (chip: string) => {
    setSelectedFoods((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const setChipGroupRef = useCallback(
    (title: string) => (element: HTMLDivElement | null) => {
      chipGroupRefs.current.set(title, element)
    },
    [],
  )

  const toggleChipGroupExpanded = (title: string) => {
    setExpandedChipGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
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
    if (!query) return

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

  const feedSectionTitle = feedFilter === "review" ? "후기" : feedFilter === "free" ? "질문" : "팔로우"

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <CommunityHeader
        title="커뮤니티"
        topTab="feed"
        openFilterAriaLabel="커뮤니티 검색 필터 열기"
        onOpenFilter={openFeedFilterPopup}
        onOpenNotifications={() => {}}
      />

      <SearchFilterModal
        isOpen={isFeedFilterPopupOpen}
        ariaLabel="커뮤니티 검색 필터"
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
          onReset={resetFilters}
          onApply={() => {
            setIsFeedFilterPopupOpen(false)
            setIsFeedSearchConfirmed(true)
          }}
        />
      </SearchFilterModal>

      <FeedSegmentTabs
        ariaLabel="커뮤니티 피드 필터"
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
      <div className={feedFilter === "free" ? "question_list" : "feed_cards"} aria-label="커뮤니티 피드 목록">
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
                photoIds={post.photoIds}
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
                badgeClassName={getTierClassName(getPairingTierByUserId(post.authorId), "feed_post_badge")}
                badgeText={getPairingTierLabelByUserId(post.authorId)}
                menuAriaLabel={userPostIdSet.has(post.id) ? "게시글 설정" : undefined}
                onOpenMenu={userPostIdSet.has(post.id) ? () => setOwnerPostAction(post) : undefined}
                followButtonClassName={followedUserIds.has(post.authorId) ? "follow_toggle_button is_following" : "follow_toggle_button"}
                followAriaLabel={feedFilter === "follow" ? "언팔로우" : followedUserIds.has(post.authorId) ? "팔로잉" : "팔로우"}
                followText={feedFilter === "follow" ? "언팔로우" : followedUserIds.has(post.authorId) ? "팔로잉" : "팔로우"}
                onToggleFollow={() =>
                  requestToggleFollowUser(post.authorId, post.authorName?.trim() || usersMockById[post.authorId]?.name || "익명")
                }
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
                title={post.isQna ? post.title : (post.pairingSummary ?? post.title)}
                body={post.body}
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
          titleText={bookmarkListById[bookmarkPicker.postId] ? "북마크를 어디로 옮길까요?" : "어느 리스트에 담을까요?"}
          listPickerAriaLabel="북마크 리스트"
          secondaryLabel={bookmarkListById[bookmarkPicker.postId] ? "해제" : "취소"}
          primaryLabel="확인"
          onDismiss={cancelBookmark}
          onSelectList={(listId) => setBookmarkPicker({ ...bookmarkPicker, selectedListId: listId })}
          onSecondary={bookmarkListById[bookmarkPicker.postId] ? removeBookmark : cancelBookmark}
          onPrimary={confirmBookmark}
        />
      ) : null}

      {pendingDeletePostId !== null ? (
        <PurchaseConfirmModal
          ariaLabel="게시글 삭제 확인"
          message="이 글을 삭제할까요?"
          cancelLabel="취소"
          confirmLabel="삭제"
          onCancel={() => setPendingDeletePostId(null)}
          onConfirm={() => {
            const postId = pendingDeletePostId
            setPendingDeletePostId(null)
            persistUserPosts(userPosts.filter((post) => post.id !== postId))
            setBookmarkListById((prev) => {
              if (!(postId in prev)) return prev
              const next = { ...prev }
              delete next[postId]
              return next
            })
          }}
        />
      ) : null}

      {ownerPostAction ? (
        <PostOwnerActionModal
          title="게시글 설정"
          onCancel={() => setOwnerPostAction(null)}
          onEdit={() => {
            const post = ownerPostAction
            setOwnerPostAction(null)
            openOwnPostEditor(post)
          }}
          onDelete={() => {
            const postId = ownerPostAction.id
            setOwnerPostAction(null)
            deleteUserPost(postId)
          }}
        />
      ) : null}

      {pendingUnfollowUser ? (
        <PurchaseConfirmModal
          ariaLabel="언팔로우 확인"
          message={`${pendingUnfollowUser.name}님을 언팔로우하시겠어요?`}
          cancelLabel="취소"
          confirmLabel="언팔로우"
          onCancel={() => setPendingUnfollowUser(null)}
          onConfirm={() => {
            toggleFollowUser(pendingUnfollowUser.userId)
            setPendingUnfollowUser(null)
          }}
        />
      ) : null}
    </section>
  )
}
