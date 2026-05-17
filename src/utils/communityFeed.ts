import type { FeedFilter, ReviewSortKey } from "../data/communityFilterConfig"
import type { PopupChipGroup } from "../data/communityPageData"
import { type FeedPost, extractPairingTitle } from "./communityPosts"
import { includesNormalized, normalizeSearchText } from "./text"
import { usersMockById } from "./usersMock"

export const USER_POSTS_UPDATED_EVENT = "community:user-posts-updated"

export type CommunityFeedFilters = {
  query: string
  isSearchConfirmed: boolean
  selectedDrinkType: string | null
  selectedCategories: Set<string>
  selectedFeatures: Set<string>
  selectedFoods: Set<string>
  selectedSituations: Set<string>
}

export const COMMUNITY_FOOD_FILTER_CHIPS = ["한식", "양식", "일식", "중식", "스낵", "기타"] as const
export const COMMUNITY_SITUATION_FILTER_CHIPS = ["혼술", "가족", "데이트", "친구/파티", "모임/단체"] as const

export const readStoredCommunityUserPosts = (storageKey: string): FeedPost[] => {
  try {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as FeedPost[]) : []
  } catch {
    return []
  }
}

export const writeStoredCommunityUserPosts = (storageKey: string, posts: FeedPost[]) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(posts.slice(0, 50)))
    window.dispatchEvent(new Event(USER_POSTS_UPDATED_EVENT))
  } catch {
    // ignore storage errors
  }
}

export const getEffectiveSelectedFeatures = (selectedFeatures: Set<string>, availableFeatures: string[]) => {
  if (selectedFeatures.size === 0) return selectedFeatures
  const valid = new Set(availableFeatures)
  return new Set(Array.from(selectedFeatures).filter((item) => valid.has(item)))
}

export const buildPopupChipGroups = ({
  popupCategoryByDrinkType,
  popupFeaturesByDrinkType,
  selectedDrinkType,
  selectedCategories,
}: {
  popupCategoryByDrinkType: Record<string, string[]>
  popupFeaturesByDrinkType: Record<string, string[]>
  selectedDrinkType: string | null
  selectedCategories: Set<string>
}) => {
  const availableCategories = selectedDrinkType ? popupCategoryByDrinkType[selectedDrinkType] ?? [] : []
  const availableFeatures =
    selectedDrinkType && selectedCategories.size > 0 ? popupFeaturesByDrinkType[selectedDrinkType] ?? [] : []

  const popupChipGroups: PopupChipGroup[] = [{ title: "주종", chips: Object.keys(popupCategoryByDrinkType) }]

  if (selectedDrinkType) {
    popupChipGroups.push({ title: "카테고리", chips: availableCategories })
  }

  if (selectedDrinkType && selectedCategories.size > 0) {
    popupChipGroups.push({ title: "특징", chips: availableFeatures })
  }

  popupChipGroups.push(
    { title: "음식", chips: [...COMMUNITY_FOOD_FILTER_CHIPS] },
    { title: "상황", chips: [...COMMUNITY_SITUATION_FILTER_CHIPS] },
  )

  return {
    availableFeatures,
    popupChipGroups,
  }
}

export const buildSearchAllChipGroups = (
  popupCategoryByDrinkType: Record<string, string[]>,
  popupFeaturesByDrinkType: Record<string, string[]>,
) => {
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
    { title: "음식", chips: [...COMMUNITY_FOOD_FILTER_CHIPS] },
    { title: "상황", chips: [...COMMUNITY_SITUATION_FILTER_CHIPS] },
  ] satisfies PopupChipGroup[]
}

export const filterPopupChipGroups = ({
  feedPosts,
  popupChipGroups,
  searchAllChipGroups,
  query,
  isSearchConfirmed,
}: {
  feedPosts: FeedPost[]
  popupChipGroups: PopupChipGroup[]
  searchAllChipGroups: PopupChipGroup[]
  query: string
  isSearchConfirmed: boolean
}) => {
  const trimmedQuery = query.trim()
  if (!isSearchConfirmed || !trimmedQuery) return popupChipGroups

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
      ...(post.categories ?? []),
      ...(post.features ?? []),
      ...(post.foods ?? []),
      ...(post.searchTags ?? []),
    ]

    if (!includesNormalized(postTargets.join(" "), trimmedQuery)) continue

    addRelated("주종", post.categories?.length ? [post.categories[0]] : [])
    addRelated("카테고리", post.detailCategories ?? [])
    addRelated("특징", post.features ?? [])
    addRelated("음식", getFoodFilterValues(post))
    addRelated("상황", getSituationFilterValues(post))
  }

  const results: PopupChipGroup[] = []
  for (const group of searchAllChipGroups) {
    const directMatches = group.chips.filter((chip) => includesNormalized(chip, trimmedQuery))
    const relatedMatches = Array.from(relatedByGroup.get(group.title) ?? [])
    const merged = Array.from(new Set([...directMatches, ...relatedMatches]))
    const isAlwaysVisibleGroup = group.title === "음식" || group.title === "상황"
    if (isAlwaysVisibleGroup) {
      results.push({ title: group.title, chips: merged.length > 0 ? merged : group.chips })
      continue
    }

    if (merged.length > 0) {
      results.push({ title: group.title, chips: merged })
    }
  }

  return results
}

export const isCommunityFeedSearchActive = ({
  query,
  isSearchConfirmed,
  selectedDrinkType,
  selectedCategories,
  selectedFeatures,
  selectedFoods,
  selectedSituations,
}: CommunityFeedFilters) =>
  Boolean(query.trim()) ||
  isSearchConfirmed ||
  Boolean(selectedDrinkType) ||
  selectedCategories.size > 0 ||
  selectedFeatures.size > 0 ||
  selectedFoods.size > 0 ||
  selectedSituations.size > 0

const normalizeFilterAlias = (value: string) => (value.trim() === "그외" ? "기타" : value.trim())

const isFoodFilterChip = (value: string) => COMMUNITY_FOOD_FILTER_CHIPS.includes(normalizeFilterAlias(value) as (typeof COMMUNITY_FOOD_FILTER_CHIPS)[number])
const isSituationFilterChip = (value: string) =>
  COMMUNITY_SITUATION_FILTER_CHIPS.includes(normalizeFilterAlias(value) as (typeof COMMUNITY_SITUATION_FILTER_CHIPS)[number])

const getFoodFilterValues = (post: FeedPost) =>
  [post.foodParentCategory, ...(post.searchTags ?? [])]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeFilterAlias)
    .filter(isFoodFilterChip)

const getSituationFilterValues = (post: FeedPost) =>
  [post.situation, ...(post.searchTags ?? [])]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeFilterAlias)
    .filter(isSituationFilterChip)

const matchesSelectedText = (value: string, selectedValue: string) => {
  const aliasedValue = normalizeFilterAlias(value)
  const aliasedSelectedValue = normalizeFilterAlias(selectedValue)
  return includesNormalized(aliasedValue, aliasedSelectedValue) || includesNormalized(aliasedSelectedValue, aliasedValue)
}

const matchesSelectedSet = (values: string[] | undefined, selectedValues: Set<string>) => {
  if (selectedValues.size === 0) return true
  const candidates = values ?? []
  return candidates.some((value) => Array.from(selectedValues).some((selectedValue) => matchesSelectedText(value, selectedValue)))
}

const matchesSelectedFilters = (post: FeedPost, filters: CommunityFeedFilters) => {
  const drinkTypeMatches = !filters.selectedDrinkType || (post.categories ?? []).includes(filters.selectedDrinkType)
  if (!drinkTypeMatches) return false

  return (
    matchesSelectedSet(post.detailCategories, filters.selectedCategories) &&
    matchesSelectedSet(post.features, filters.selectedFeatures) &&
    matchesSelectedSet(getFoodFilterValues(post), filters.selectedFoods) &&
    matchesSelectedSet(getSituationFilterValues(post), filters.selectedSituations)
  )
}

export const sortCommunityFeedPosts = (items: FeedPost[], reviewSort: ReviewSortKey) => {
  const copy = [...items]
  if (reviewSort === "popular") {
    return copy.sort((a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount))
  }
  if (reviewSort === "recommend") {
    return copy.sort((a, b) => b.popularityScore - a.popularityScore)
  }
  return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

const isCommunityPairingReviewPost = (post: FeedPost) =>
  !post.isQna &&
  post.sourceType !== "drink-review" &&
  (post.sourceType === "pairing-review" ||
    (!post.drinkName && Array.isArray(post.foods) && post.foods.some((food) => typeof food === "string" && food.trim())))

export const getCommunityFeedPosts = ({
  feedPosts,
  userPosts,
  feedFilter,
  followedUserIds,
  myUserId,
  reviewSort,
}: {
  feedPosts: FeedPost[]
  userPosts: FeedPost[]
  feedFilter: FeedFilter
  followedUserIds: Set<number>
  myUserId: number
  reviewSort: ReviewSortKey
}) => {
  const copy = [...userPosts, ...feedPosts]

  if (feedFilter === "review") return sortCommunityFeedPosts(copy.filter(isCommunityPairingReviewPost), reviewSort)
  if (feedFilter === "free") return sortCommunityFeedPosts(copy.filter((post) => post.isQna), reviewSort)
  if (feedFilter === "follow") {
    return sortCommunityFeedPosts(
      copy.filter((post) => isCommunityPairingReviewPost(post) && followedUserIds.has(post.authorId) && post.authorId !== myUserId),
      reviewSort,
    )
  }

  return []
}

export const filterCommunityFeedPosts = ({
  posts,
  filters,
}: {
  posts: FeedPost[]
  filters: CommunityFeedFilters
}) => {
  if (!isCommunityFeedSearchActive(filters)) return posts

  const query = filters.query.trim()
  return posts.filter((post) => {
    const targets = [
      post.title,
      post.body,
      usersMockById[post.authorId]?.profile ?? "",
      ...(post.categories ?? []),
      ...(post.features ?? []),
      ...(post.foods ?? []),
      post.foodParentCategory ?? "",
      post.situation ?? "",
      ...(post.searchTags ?? []),
    ]
    const queryMatches = !query || includesNormalized(targets.join(" "), query)

    return queryMatches && matchesSelectedFilters(post, filters)
  })
}

export const getCommunitySearchSuggestionTags = ({
  feedPosts,
  filters,
}: {
  feedPosts: FeedPost[]
  filters: CommunityFeedFilters
}) => {
  const query = filters.query.trim()
  if (!query) return []

  const normalizedQuery = normalizeSearchText(query)
  const filterPostWithoutQuery = (post: FeedPost) => {
    return matchesSelectedFilters(post, filters)
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
      ...(post.categories ?? []),
      ...(post.features ?? []),
      ...(post.foods ?? []),
      post.foodParentCategory ?? "",
      post.situation ?? "",
      ...(post.searchTags ?? []),
    ].filter(Boolean)

    if (!includesNormalized(postTargets.join(" "), query)) continue

    const relatedTags = [
      ...(post.categories ?? []),
      ...(post.features ?? []),
      ...(post.foods ?? []),
      post.foodParentCategory ?? "",
      post.situation ?? "",
      ...(post.searchTags ?? []),
    ].filter(Boolean)

    for (const tag of relatedTags) {
      const normalizedTag = normalizeSearchText(tag)
      let score = 3
      if (normalizedTag.includes(normalizedQuery) || normalizedQuery.includes(normalizedTag)) score += 5
      bump(tag, score)
    }
  }

  const hasResultsForTag = (tag: string) => {
    for (const post of feedPosts) {
      if (!filterPostWithoutQuery(post)) continue
      const tagPool = [
        post.title,
        post.body,
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        post.foodParentCategory ?? "",
        post.situation ?? "",
        ...(post.searchTags ?? []),
      ].filter(Boolean)

      if (includesNormalized(tagPool.join(" "), tag)) return true
    }
    return false
  }

  return Array.from(candidates.entries())
    .filter(([tag]) => hasResultsForTag(tag))
    .filter(([tag]) => {
      if (filters.selectedDrinkType && tag === filters.selectedDrinkType) return false
      if (filters.selectedCategories.has(tag)) return false
      if (filters.selectedFeatures.has(tag)) return false
      if (filters.selectedFoods.has(tag)) return false
      if (filters.selectedSituations.has(tag)) return false
      return true
    })
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 8)
}

export const getPairingCommentNavigationState = (post: FeedPost | undefined) => {
  if (!post) return undefined
  const pairingTitle = extractPairingTitle(post.title)
  return {
    pairingTitle,
    authorId: post.authorId,
    authorName: usersMockById[post.authorId]?.name ?? "익명",
    profile: usersMockById[post.authorId]?.profile ?? "",
    locationLabel: post.locationLabel?.trim() ?? "",
    drinkType: post.drinkType ?? post.categories?.[0] ?? "",
    source: "feed",
  }
}
