import { useMemo } from "react"
import type { CategoryListItem } from "../components/CategoryItemCard"
import { FEATURE_CHIPS } from "../data/categoryFilterConfig"
import {
  CATEGORY_LIST_DRINK_TYPE_LABEL,
  DEFAULT_SEARCH_TAGS,
  DETAIL_CATEGORY_CHIPS,
  PREMIUM_SEARCH_TAG,
} from "../data/categoryListConfig"
import { sakeProductsMock } from "../data/sakeProductsMock"
import imgDassai23 from "../assets/product_dassai_23.png"
import imgKubotaManjyu from "../assets/drink_kubota_manjyu.png"
import imgKuheiji from "../assets/drink_kamoshibito_kuheiji.png"
import imgHakkaisanDaiginjo from "../assets/drink_hakkaisan_daiginjo.png"
import imgNabeshimaDaiginjo from "../assets/drink_nabeshima_daiginjo.png"
import imgDenshuJunmaiDaiginjo from "../assets/drink_denshu_junmai_daiginjo.png"
import imgJuyondaiSeries from "../assets/drink_juyondai_series.png"
import imgGekkeikanHorin from "../assets/drink_gekkeikan_horin.png"
import imgOnnanakase from "../assets/drink_onnanakase.png"

export type SortKey = "default" | "recommended" | "popular"

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "default", label: "최신순" },
  { key: "recommended", label: "추천순" },
  { key: "popular", label: "인기순" },
]

const imageByProductId: Record<string, string> = {
  "sake-dassai-23": imgDassai23,
  "sake-kubota-manju": imgKubotaManjyu,
  "sake-kamoshibito-kuheiji": imgKuheiji,
  "sake-hakkaisan-daiginjo": imgHakkaisanDaiginjo,
  "sake-nabeshima-daiginjo": imgNabeshimaDaiginjo,
  "sake-denshu-junmai-daiginjo": imgDenshuJunmaiDaiginjo,
  "sake-juyondai-series": imgJuyondaiSeries,
  "sake-gekkeikan-horin": imgGekkeikanHorin,
  "sake-onnanakase": imgOnnanakase,
}

const inferFeatures = (tokens: string[]) => {
  const joined = tokens.join(" ").toLowerCase()
  const features: string[] = []
  if (joined.includes("과일") || joined.includes("fruity")) features.push("과일향")
  if (joined.includes("부드") || joined.includes("스무") || joined.includes("smooth")) features.push("부드러운")
  if (joined.includes("가벼") || joined.includes("라이트") || joined.includes("light")) features.push("가벼운")
  if (joined.includes("진한") || joined.includes("heavy")) features.push("무거운")
  if (joined.includes("탄산") || joined.includes("sparkling") || joined.includes("톡쏘")) features.push("톡쏘는")
  if (joined.includes("오크") || joined.includes("oak")) features.push("오크향")

  FEATURE_CHIPS.forEach((feature) => {
    if (joined.includes(feature.toLowerCase())) features.push(feature)
  })

  return Array.from(new Set(features)).filter((feature) => FEATURE_CHIPS.includes(feature as (typeof FEATURE_CHIPS)[number]))
}

const inferDetailCategories = (tokens: string[]) => {
  const joined = tokens.join(" ").toLowerCase()
  return DETAIL_CATEGORY_CHIPS.filter((detail) => joined.includes(detail.toLowerCase()))
}

const inferAbv = (tokens: string[]) => {
  const joined = tokens.join(" ")
  const matched = joined.match(/(\d+(?:\.\d+)?)\s*도/)
  if (!matched) return undefined
  const value = Number(matched[1])
  return Number.isFinite(value) ? value : undefined
}

const inferSearchTags = (tokens: string[]) => {
  const joined = tokens.join(" ").toLowerCase()
  if (joined.includes("다이긴죠") || joined.includes("준마이")) return [...DEFAULT_SEARCH_TAGS, PREMIUM_SEARCH_TAG]
  return DEFAULT_SEARCH_TAGS
}

const sakeDaiginjoItems: CategoryListItem[] = sakeProductsMock.map((product) => ({
  id: product.id,
  name: product.name,
  imageSrc: imageByProductId[product.id],
  price: product.priceWon,
  abv: inferAbv([...product.tags, ...product.keywords]),
  drinkTypeLabel: CATEGORY_LIST_DRINK_TYPE_LABEL,
  subcategory: product.subcategory,
  detailCategories: inferDetailCategories([...product.tags, ...product.keywords]),
  features: inferFeatures([...product.tags, ...product.keywords]),
  searchTags: inferSearchTags([...product.tags, ...product.keywords]),
  tags: product.tags,
  keywords: product.keywords,
}))

export function useCategoryListPageData() {
  return useMemo(() => ({ sakeDaiginjoItems, sortOptions }), [])
}
