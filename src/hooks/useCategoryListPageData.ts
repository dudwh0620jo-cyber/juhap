import { useMemo } from "react"
import type { CategoryListItem } from "../components/CategoryItemCard"
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

export type SortKey = "default" | "recommended" | "lowPrice" | "highPrice"

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "default", label: "기본순" },
  { key: "recommended", label: "추천순" },
  { key: "lowPrice", label: "낮은 가격순" },
  { key: "highPrice", label: "높은 가격순" },
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

const sakeDaiginjoItems: CategoryListItem[] = sakeProductsMock.map((product) => ({
  id: product.id,
  name: product.name,
  imageSrc: imageByProductId[product.id],
  price: product.priceWon,
  tags: product.tags,
  keywords: product.keywords,
}))

export function useCategoryListPageData() {
  return useMemo(() => ({ sakeDaiginjoItems, sortOptions }), [])
}

