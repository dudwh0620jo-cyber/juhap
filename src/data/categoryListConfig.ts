import config from "./categoryListConfig.json"

type CategoryListConfigShape = {
  drinkTypeLabel: string
  detailCategoryChips: string[]
  defaultSearchTags: string[]
  premiumSearchTag: string
}

const content = config as CategoryListConfigShape

export const CATEGORY_LIST_DRINK_TYPE_LABEL = content.drinkTypeLabel
export const DETAIL_CATEGORY_CHIPS = content.detailCategoryChips
export const DEFAULT_SEARCH_TAGS = content.defaultSearchTags
export const PREMIUM_SEARCH_TAG = content.premiumSearchTag
