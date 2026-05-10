import { ABV_MAX, ABV_MIN, FEATURE_CHIPS } from "../data/categoryFilterConfig"
import { drinkCategories } from "../data/categoryData"
import {
  MAX_RECENT_TERMS,
  PRICE_MAX_WON,
  PRICE_MIN_WON,
  bookmarkLists,
  feedFilterItems,
  popupFoodCategories,
  reviewSortItems,
} from "../data/communityFilterConfig"
import { COMMUNITY_FOLLOWED_USERS_KEY, COMMUNITY_LIKED_POSTS_KEY, COMMUNITY_SEARCH_RECENT_KEY } from "../utils/communityStorage"
import { defaultFollowedUserIdsMock } from "../utils/usersMock"
export type { FeedFilter, ReviewSortKey } from "../data/communityFilterConfig"

export type PopupChipGroup = {
  title: string
  chips: string[]
}

const popupCategoryByDrinkType: Record<string, string[]> = Object.fromEntries(
  drinkCategories.map((category) => [category.label, category.subcategories]),
)

const popupFeaturesByDrinkType: Record<string, string[]> = Object.fromEntries(
  drinkCategories.map((category) => [category.label, [...FEATURE_CHIPS]]),
)

export function useCommunityPageData() {
  return {
    COMMUNITY_SEARCH_RECENT_KEY,
    COMMUNITY_FOLLOWED_USERS_KEY,
    COMMUNITY_LIKED_POSTS_KEY,
    MAX_RECENT_TERMS,
    PRICE_MIN_WON,
    PRICE_MAX_WON,
    ABV_MIN,
    ABV_MAX,
    feedFilterItems,
    reviewSortItems,
    bookmarkLists,
    popupCategoryByDrinkType,
    popupFeaturesByDrinkType,
    popupFoodCategories,
    defaultFollowedUserIdsMock,
  }
}
