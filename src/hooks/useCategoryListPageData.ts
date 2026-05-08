import { useMemo } from "react"
import type { CategoryListItem } from "../components/CategoryItemCard"
import { sakeProductsMock } from "../data/sakeProductsMock"
import imgDassai23 from "../assets/product_dassai_23.png"

export type SortKey = "default" | "recommended" | "lowPrice" | "highPrice"

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "default", label: "기본순" },
  { key: "recommended", label: "추천순" },
  { key: "lowPrice", label: "낮은 가격순" },
  { key: "highPrice", label: "높은 가격순" },
]

const sakeDaiginjoItems: CategoryListItem[] = sakeProductsMock
  .filter((product) => product.id === "sake-dassai-23")
  .map((product) => ({
    id: product.id,
    name: product.name,
    imageSrc: imgDassai23,
    price: product.priceWon,
    tags: product.tags,
    keywords: product.keywords,
  }))

export function useCategoryListPageData() {
  return useMemo(() => ({ sakeDaiginjoItems, sortOptions }), [])
}

