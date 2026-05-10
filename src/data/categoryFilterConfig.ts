import config from "./categoryFilterConfig.json"

type CategoryFilterConfigShape = {
  priceMin: number
  priceMax: number
  abvMin: number
  abvMax: number
  featureChips: string[]
}

const content = config as CategoryFilterConfigShape

export const PRICE_MIN = content.priceMin
export const PRICE_MAX = content.priceMax
export const ABV_MIN = content.abvMin
export const ABV_MAX = content.abvMax
export const FEATURE_CHIPS = content.featureChips as readonly string[]

export type FilterGroup = {
  title: string
  chips: readonly string[]
}

export type CategoryFilterPayload = {
  keywordQuery: string
  drinkTypeLabel: string
  categoryChip: string | null
  featureChips: string[]
  priceRange: [number, number]
  abvRange: [number, number]
}
