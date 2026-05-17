import { ABV_MAX, ABV_MIN, FEATURE_CHIPS } from "./categoryFilterConfig"
import { drinkCategories } from "./categoryData"
import { sakeProductsMock } from "./sakeProductsMock"
import { sojuProductsMock } from "./sojuProductsMock"
import { wineProductsMock } from "./wineProductsMock"
import { beerProductsMock } from "./beerProductsMock"
import { whiskeyProductsMock } from "./whiskeyProductsMock"
import { spiritsProductsMock } from "./spiritsProductsMock"
import { traditionalProductsMock } from "./traditionalProductsMock"
import { etcProductsMock } from "./etcProductsMock"
import {
  MAX_RECENT_TERMS,
  PRICE_MAX_WON,
  PRICE_MIN_WON,
  bookmarkLists,
  feedFilterItems,
  popupFoodCategories,
  reviewSortItems,
} from "./communityFilterConfig"
import { COMMUNITY_FOLLOWED_USERS_KEY, COMMUNITY_LIKED_POSTS_KEY, COMMUNITY_SEARCH_RECENT_KEY } from "../utils/communityStorage"
import { defaultFollowedUserIdsMock } from "../utils/usersMock"
export type { FeedFilter, ReviewSortKey } from "./communityFilterConfig"

export type PopupChipGroup = {
  title: string
  chips: string[]
}

const popupCategoryByDrinkType: Record<string, string[]> = Object.fromEntries(
  drinkCategories.map((category) => [category.label, category.subcategories]),
)

type MockProduct = {
  categoryId: string
  tags?: string[]
  keywords?: string[]
}

const allProductsByCategoryId: Record<string, MockProduct[]> = {
  sake: sakeProductsMock,
  soju: sojuProductsMock,
  wine: wineProductsMock,
  beer: beerProductsMock,
  whisky: whiskeyProductsMock,
  spirits: spiritsProductsMock,
  traditional: traditionalProductsMock,
  etc: etcProductsMock,
}

const inferFeatureChips = (tokens: string[]) => {
  const joined = tokens.join(" ").toLowerCase()
  const features: string[] = []

  if (joined.includes("과일") || joined.includes("fruity")) features.push("과일향")
  if (joined.includes("상큼") || joined.includes("산뜻") || joined.includes("fresh") || joined.includes("citrus")) features.push("상큼한")
  if (joined.includes("은은") || joined.includes("섬세") || joined.includes("delicate")) features.push("은은함")
  if (joined.includes("부드") || joined.includes("스무") || joined.includes("smooth")) features.push("부드러운")
  if (joined.includes("가벼") || joined.includes("라이트") || joined.includes("light")) features.push("가벼운")
  if (joined.includes("진한") || joined.includes("묵직") || joined.includes("무거") || joined.includes("heavy")) features.push("무거운")
  if (joined.includes("탄산") || joined.includes("sparkling") || joined.includes("톡쏘")) features.push("톡쏘는")
  if (joined.includes("오크") || joined.includes("oak")) features.push("오크향")

  FEATURE_CHIPS.forEach((feature) => {
    if (joined.includes(feature.toLowerCase())) features.push(feature)
  })

  return Array.from(new Set(features)).filter((feature) => FEATURE_CHIPS.includes(feature as (typeof FEATURE_CHIPS)[number]))
}

const popupFeaturesByDrinkType: Record<string, string[]> = Object.fromEntries(
  drinkCategories.map((category) => {
    const products = allProductsByCategoryId[category.id] ?? []
    const inferred = new Set<string>()

    products.forEach((product) => {
      const tokens = [...(product.tags ?? []), ...(product.keywords ?? [])]
      inferFeatureChips(tokens).forEach((feature) => inferred.add(feature))
    })

    const ordered = FEATURE_CHIPS.filter((feature) => inferred.has(feature))
    return [category.label, ordered]
  }),
)

export const communityPageData = {
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
