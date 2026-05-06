import { useMemo } from "react"
import type { CategoryListItem } from "../components/CategoryItemCard"

export type SortKey = "default" | "recommended" | "lowPrice" | "highPrice"

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "default", label: "기본순" },
  { key: "recommended", label: "추천순" },
  { key: "lowPrice", label: "낮은가격순" },
  { key: "highPrice", label: "높은가격순" },
]

const sakeDaiginjoItems: CategoryListItem[] = [
  {
    id: "sake-dassai-23",
    name: "닷사이 23",
    price: 88000,
    tags: ["사케", "과일향", "16도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "닷사이", "과일향"],
  },
  {
    id: "sake-kubota-manju",
    name: "쿠보타 만쥬",
    price: 53800,
    tags: ["사케", "드라이", "15.5도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "쿠보타", "드라이"],
  },
  {
    id: "sake-kamoshibito-kuheiji",
    name: "카모시비토 쿠헤이지",
    price: 53400,
    tags: ["사케", "와인맛", "16도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "쿠헤이지", "와인"],
  },
  {
    id: "sake-hakkaisan-daiginjo",
    name: "핫카이산 다이긴죠",
    price: 29800,
    tags: ["사케", "데운 술", "17도"],
    keywords: ["다이긴죠", "핫카이산", "데운 술"],
  },
  {
    id: "sake-nabeshima-daiginjo",
    name: "나베시마 다이긴죠",
    price: 79800,
    tags: ["사케", "프루티", "17도"],
    keywords: ["다이긴죠", "나베시마", "프루티"],
  },
  {
    id: "sake-denshu-junmai-daiginjo",
    name: "덴슈 준마이 다이긴죠",
    price: 129000,
    tags: ["사케", "신맛", "16.8도"],
    keywords: ["준마이 다이긴죠", "덴슈", "신맛"],
  },
  {
    id: "sake-juyondai-series",
    name: "쥬욘다이 (시리즈)",
    price: 5550000,
    tags: ["사케", "고급감", "16도"],
    keywords: ["준마이 다이긴죠", "쥬욘다이", "고급"],
  },
  {
    id: "sake-wolgyegwan-horin",
    name: "월계관 호린",
    price: 115000,
    tags: ["사케", "꽃향기", "16.7도"],
    keywords: ["준마이 다이긴죠", "월계관", "호린", "꽃향기"],
  },
  {
    id: "sake-onna-nakase",
    name: "온나나카세",
    price: 43000,
    tags: ["사케", "부드러움", "17도"],
    keywords: ["다이긴죠", "온나나카세", "부드러움"],
  },
]

export function useCategoryListPageData() {
  return useMemo(() => ({ sakeDaiginjoItems, sortOptions }), [])
}
