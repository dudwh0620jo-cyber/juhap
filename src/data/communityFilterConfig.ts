import config from "./communityFilterConfig.json"

export type FeedFilter = "review" | "free" | "follow"
export type ReviewSortKey = "latest" | "recommend" | "popular"

type FeedFilterItem = { key: FeedFilter; label: string }
type ReviewSortItem = { key: ReviewSortKey; label: string }
type BookmarkListItem = { id: string; label: string }

type CommunityFilterConfigShape = {
  maxRecentTerms: number
  priceMinWon: number
  priceMaxWon: number
  feedFilterItems: FeedFilterItem[]
  reviewSortItems: ReviewSortItem[]
  bookmarkLists: BookmarkListItem[]
  popupFoodCategories: string[]
}

const content = config as CommunityFilterConfigShape

export const MAX_RECENT_TERMS = content.maxRecentTerms
export const PRICE_MIN_WON = content.priceMinWon
export const PRICE_MAX_WON = content.priceMaxWon
export const feedFilterItems = content.feedFilterItems
export const reviewSortItems = content.reviewSortItems
export const bookmarkLists = content.bookmarkLists
export const popupFoodCategories = content.popupFoodCategories
