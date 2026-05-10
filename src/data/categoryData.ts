import categoryData from "./categoryData.json"

export type DrinkCategory = {
  id: string
  label: string
  englishLabel: string
  subcategories: string[]
}

export type SubcategoryInfoMap = Record<string, string>

type CategoryDataShape = {
  readyCategoryId: string
  readySubcategory: string
  categoryPreparingMessage: string
  drinkCategories: DrinkCategory[]
  subcategoryInfoByCategoryId: Record<string, SubcategoryInfoMap>
}

const content = categoryData as CategoryDataShape

export const READY_CATEGORY_ID = content.readyCategoryId
export const READY_SUBCATEGORY = content.readySubcategory
export const CATEGORY_PREPARING_MESSAGE = content.categoryPreparingMessage
export const drinkCategories = content.drinkCategories
export const subcategoryInfoByCategoryId = content.subcategoryInfoByCategoryId
export const DEFAULT_DRINK_TYPE_LABEL =
  drinkCategories.find((category) => category.id === "sake")?.label ?? drinkCategories[0]?.label ?? "사케"
