import { useMemo } from "react"
import type { CategoryListItem } from "../components/CategoryItemCard"
import { FEATURE_CHIPS } from "../data/categoryFilterConfig"
import { drinkCategories } from "../data/categoryData"
import {
  DEFAULT_SEARCH_TAGS,
  DETAIL_CATEGORY_CHIPS,
  PREMIUM_SEARCH_TAG,
} from "../data/categoryListConfig"
import { sakeProductsMock } from "../data/sakeProductsMock"
import { sojuProductsMock } from "../data/sojuProductsMock"
import { wineProductsMock } from "../data/wineProductsMock"
import { beerProductsMock } from "../data/beerProductsMock"
import { productImageUrls } from "../data/productImageUrls"
import { whiskeyProductsMock } from "../data/whiskeyProductsMock"
import { spiritsProductsMock } from "../data/spiritsProductsMock"
import { traditionalProductsMock } from "../data/traditionalProductsMock"
import { etcProductsMock } from "../data/etcProductsMock"
import imgDassai23 from "../assets/product_dassai_23.png"
import imgKubotaManjyu from "../assets/drink_kubota_manjyu.png"
import imgKuheiji from "../assets/drink_kamoshibito_kuheiji.png"
import imgHakkaisanDaiginjo from "../assets/drink_hakkaisan_daiginjo.png"
import imgNabeshimaDaiginjo from "../assets/drink_nabeshima_daiginjo.png"
import imgDenshuJunmaiDaiginjo from "../assets/drink_denshu_junmai_daiginjo.png"
import imgJuyondaiSeries from "../assets/drink_juyondai_series.png"
import imgGekkeikanHorin from "../assets/drink_gekkeikan_horin.png"
import imgOnnanakase from "../assets/drink_onnanakase.png"
import imgDassai45 from "../assets/drink_dassai_45.png"
import imgHwayo25 from "../assets/drink_hwayo_25.png"
import imgJinroIsBack from "../assets/drink_jinro_is_back_01.png"
import imgCass from "../assets/drink_cass_01.png"
import imgCaymus from "../assets/drink_caymus_napa_valley.png"
import imgKendallJackson from "../assets/drink_kendall_jackson.png"
import imgMoetChandon from "../assets/drink_moet_chandon_brut_imperial_01.png"
import imgClaret from "../assets/drink_claret_2010.png"
import imgJangsuMakgeolli from "../assets/drink_jangsu_makgeolli.png"
import imgSlowVillageMakgeolli from "../assets/drink_slow_village_makgeolli_01.png"
import imgBoksoondogaMakgeolli from "../assets/drink_boksoondoga_makgeolli_01.png"
import imgVoteVodka from "../assets/vote_vodka_mix_01.png"
import imgVoteHighball from "../assets/vote_highball_fries_01.png"
import imgMiniWine from "../assets/vote_mini_wine_bottle_01.png"
import imgAutoPairingDrink from "../assets/auto_pairing_drink_01.png"
import imgProductHero from "../assets/fd_product_hero_image.png"

export type SortKey = "default" | "recommended" | "popular"

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "default", label: "최신순" },
  { key: "recommended", label: "가격 낮은순" },
  { key: "popular", label: "가격 높은순" },
]

const ALL_SUBCATEGORY = "전체"

const normalizeSubcategoryKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/\//g, "")
    .replace(/데킬라/g, "테킬라")
    .replace(/sober/g, "")
    .replace(/소주$/g, "")
    .replace(/soju$/g, "")
    .trim()

const isSameSubcategory = (a: string, b: string) => normalizeSubcategoryKey(a) === normalizeSubcategoryKey(b)

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
  "sake-dassai-39": imgDassai45,
  "soju-hwayo-25": imgHwayo25,
  "soju-jinro-isback": imgJinroIsBack,
  "beer-cass-fresh": imgCass,
  "wine-cabernet-sauvignon": imgCaymus,
  "wine-chardonnay": imgKendallJackson,
  "wine-champagne": imgMoetChandon,
  "wine-provence-rose": imgClaret,
  "traditional-neurinmaeul-makgeolli": imgSlowVillageMakgeolli,
  "traditional-boksoondoga-son-makgeolli": imgBoksoondogaMakgeolli,
  "traditional-jangsu-makgeolli": imgJangsuMakgeolli,
  "etc-suntory-highball": imgVoteHighball,
  "etc-jim-beam-highball": imgVoteHighball,
  "etc-low-abv-highball": imgVoteHighball,
}

const colorBySubcategory: Record<string, { bottle: string; label: string; accent: string }> = {
  "준마이 다이긴죠/다이긴죠": { bottle: "#dbeafe", label: "#1d4ed8", accent: "#93c5fd" },
  "준마이 긴죠/긴죠": { bottle: "#e0f2fe", label: "#0369a1", accent: "#7dd3fc" },
  "준마이": { bottle: "#fef3c7", label: "#92400e", accent: "#fbbf24" },
  "혼죠조/후츠슈": { bottle: "#f3f4f6", label: "#374151", accent: "#d1d5db" },
  "데일리(희석식)": { bottle: "#dcfce7", label: "#166534", accent: "#86efac" },
  "프리미엄(증류식)": { bottle: "#fef9c3", label: "#854d0e", accent: "#fde047" },
  "플레이버": { bottle: "#ffe4e6", label: "#be123c", accent: "#fda4af" },
  "레드": { bottle: "#fee2e2", label: "#991b1b", accent: "#f87171" },
  "화이트": { bottle: "#fefce8", label: "#a16207", accent: "#fde68a" },
  "로제": { bottle: "#ffe4e6", label: "#be123c", accent: "#fda4af" },
  "스파클링": { bottle: "#e0f2fe", label: "#075985", accent: "#7dd3fc" },
  "내추럴": { bottle: "#ecfccb", label: "#3f6212", accent: "#bef264" },
  "포트": { bottle: "#f3e8ff", label: "#6b21a8", accent: "#c084fc" },
  "디저트": { bottle: "#fce7f3", label: "#9d174d", accent: "#f9a8d4" },
  "라거/필스너": { bottle: "#fef3c7", label: "#b45309", accent: "#fcd34d" },
  "에일/IPA": { bottle: "#ffedd5", label: "#9a3412", accent: "#fdba74" },
  "흑맥주(스타우트)": { bottle: "#e7e5e4", label: "#292524", accent: "#a8a29e" },
  "과일맥주": { bottle: "#fee2e2", label: "#be123c", accent: "#fb7185" },
  "싱글몰트 위스키": { bottle: "#ffedd5", label: "#7c2d12", accent: "#fb923c" },
  "블렌디드 몰트": { bottle: "#fef3c7", label: "#92400e", accent: "#f59e0b" },
  "블렌디드 위스키": { bottle: "#fde68a", label: "#78350f", accent: "#d97706" },
  "아메리칸(버번/라이/테네시)": { bottle: "#fed7aa", label: "#9a3412", accent: "#ea580c" },
  "그레인 위스키": { bottle: "#f5f5f4", label: "#57534e", accent: "#d6d3d1" },
  "기타 국가 위스키": { bottle: "#e0e7ff", label: "#3730a3", accent: "#a5b4fc" },
  "백주/고량주": { bottle: "#f8fafc", label: "#b91c1c", accent: "#fecaca" },
  "진/보드카": { bottle: "#e0f2fe", label: "#0f766e", accent: "#99f6e4" },
  "테킬라/럼": { bottle: "#fef3c7", label: "#854d0e", accent: "#facc15" },
  "브랜디(꼬냑/아르마냑)": { bottle: "#ffedd5", label: "#7c2d12", accent: "#fb923c" },
  "막걸리/탁주": { bottle: "#f8fafc", label: "#334155", accent: "#cbd5e1" },
  "약주/청주": { bottle: "#fefce8", label: "#854d0e", accent: "#fde68a" },
  "과실주(한국 와인)": { bottle: "#fce7f3", label: "#9d174d", accent: "#f9a8d4" },
  "리큐르": { bottle: "#f3e8ff", label: "#7e22ce", accent: "#d8b4fe" },
  "하이볼/칵테일": { bottle: "#dbeafe", label: "#1d4ed8", accent: "#93c5fd" },
  "논알콜/저도수 (Sober)": { bottle: "#dcfce7", label: "#15803d", accent: "#86efac" },
}

const imageBySubcategory: Record<string, string> = {
  "준마이 다이긴죠/다이긴죠": imgDassai23,
  "준마이 긴죠/긴죠": imgDassai45,
  "준마이": imgGekkeikanHorin,
  "혼죠조/후츠슈": imgOnnanakase,
  "데일리(희석식)": imgJinroIsBack,
  "프리미엄(증류식)": imgHwayo25,
  "플레이버": imgJinroIsBack,
  "레드": imgCaymus,
  "화이트": imgKendallJackson,
  "로제": imgClaret,
  "스파클링": imgMoetChandon,
  "내추럴": imgMiniWine,
  "포트": imgMiniWine,
  "디저트": imgMiniWine,
  "라거/필스너": imgCass,
  "에일/IPA": imgCass,
  "흑맥주(스타우트)": imgCass,
  "과일맥주": imgCass,
  "싱글몰트 위스키": imgProductHero,
  "블렌디드 몰트": imgProductHero,
  "블렌디드 위스키": imgProductHero,
  "아메리칸(버번/라이/테네시)": imgProductHero,
  "그레인 위스키": imgProductHero,
  "기타 국가 위스키": imgProductHero,
  "백주/고량주": imgHwayo25,
  "진/보드카": imgVoteVodka,
  "테킬라/럼": imgVoteVodka,
  "브랜디(꼬냑/아르마냑)": imgProductHero,
  "막걸리/탁주": imgJangsuMakgeolli,
  "약주/청주": imgHwayo25,
  "과실주(한국 와인)": imgMiniWine,
  "리큐르": imgVoteVodka,
  "하이볼/칵테일": imgVoteHighball,
  "논알콜/저도수 (Sober)": imgAutoPairingDrink,
}

const splitLabel = (value: string) => {
  const compact = value.trim()
  if (compact.length <= 8) return [compact]
  const parts = compact.split(/\s+/)
  if (parts.length >= 2) {
    const first = parts.slice(0, Math.ceil(parts.length / 2)).join(" ")
    const second = parts.slice(Math.ceil(parts.length / 2)).join(" ")
    return [first, second]
  }
  return [compact.slice(0, 8), compact.slice(8, 16)]
}

const createLabelImage = (name: string, subcategory: string) => {
  const palette = colorBySubcategory[subcategory] ?? { bottle: "#f8fafc", label: "#334155", accent: "#cbd5e1" }
  const labelLines = splitLabel(name)
  const escapedName = labelLines.map((line) =>
    line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
  )
  const escapedSubcategory = subcategory.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <rect width="220" height="220" rx="32" fill="#f8fafc"/>
  <ellipse cx="110" cy="190" rx="48" ry="10" fill="#d1d5db" opacity=".7"/>
  <path d="M92 34h36v26c0 12 17 21 17 41v75c0 12-10 22-22 22H97c-12 0-22-10-22-22v-75c0-20 17-29 17-41V34Z" fill="${palette.bottle}" stroke="#334155" stroke-width="4"/>
  <rect x="91" y="22" width="38" height="22" rx="6" fill="${palette.label}"/>
  <rect x="82" y="96" width="56" height="64" rx="10" fill="#fff" stroke="${palette.accent}" stroke-width="4"/>
  <rect x="90" y="106" width="40" height="8" rx="4" fill="${palette.accent}"/>
  ${escapedName
    .map((line, index) => `<text x="110" y="${130 + index * 19}" text-anchor="middle" font-size="${line.length > 8 ? 13 : 15}" font-weight="800" font-family="Arial, sans-serif" fill="${palette.label}">${line}</text>`)
    .join("")}
  <text x="110" y="181" text-anchor="middle" font-size="11" font-weight="700" font-family="Arial, sans-serif" fill="#64748b">${escapedSubcategory}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const getListImage = (productId: string, subcategory: string, name: string) =>
  productImageUrls[productId] ??
  imageByProductId[productId] ??
  createLabelImage(name, subcategory) ??
  imageBySubcategory[subcategory]

const inferFeatures = (tokens: string[]) => {
  const joined = tokens.join(" ").toLowerCase()
  const features: string[] = []
  if (joined.includes("과일") || joined.includes("fruity")) features.push("과일향")
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

const createSakeItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  sakeProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: inferAbv([...product.tags, ...product.keywords]),
      drinkTypeLabel,
      subcategory: product.subcategory,
      detailCategories: inferDetailCategories([...product.tags, ...product.keywords]),
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: product.tags,
      keywords: product.keywords,
    }))

const createSojuItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  sojuProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: product.abv,
      drinkTypeLabel,
      subcategory: product.subcategory,
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: [drinkTypeLabel, ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
      keywords: product.keywords,
    }))

const createWineItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  wineProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: product.abv,
      drinkTypeLabel,
      subcategory: product.subcategory,
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: [drinkTypeLabel, ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
      keywords: product.keywords,
    }))

const createBeerItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  beerProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: product.abv,
      drinkTypeLabel,
      subcategory: product.subcategory,
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: [drinkTypeLabel, ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
      keywords: product.keywords,
    }))

const createWhiskeyItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  whiskeyProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: product.abv,
      drinkTypeLabel,
      subcategory: product.subcategory,
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: [drinkTypeLabel, ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
      keywords: product.keywords,
    }))

const createSpiritsItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  spiritsProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: product.abv,
      drinkTypeLabel,
      subcategory: product.subcategory,
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: [drinkTypeLabel, ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
      keywords: product.keywords,
    }))

const createTraditionalItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  traditionalProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: product.abv,
      drinkTypeLabel,
      subcategory: product.subcategory,
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: [drinkTypeLabel, ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
      keywords: product.keywords,
    }))

const createEtcItems = (drinkTypeLabel: string, subcategory: string): CategoryListItem[] =>
  etcProductsMock
    .filter((product) => isSameSubcategory(product.subcategory, subcategory))
    .map((product) => ({
      id: product.id,
      name: product.name,
      imageSrc: getListImage(product.id, product.subcategory, product.name),
      price: product.priceWon,
      abv: product.abv,
      drinkTypeLabel,
      subcategory: product.subcategory,
      features: inferFeatures([...product.tags, ...product.keywords]),
      searchTags: inferSearchTags([...product.tags, ...product.keywords]),
      tags: [drinkTypeLabel, ...(product.abv !== undefined ? [`${product.abv}도`] : []), ...product.tags],
      keywords: product.keywords,
    }))

export function useCategoryListPageData(group = "사케", sub = "준마이 다이긴죠/다이긴죠") {
  const items = useMemo(() => {
    if (sub === ALL_SUBCATEGORY) {
      const category = drinkCategories.find((item) => item.label === group)
      if (!category) return []

      return category.subcategories.flatMap((subcategory) => {
        if (category.id === "sake") return createSakeItems(group, subcategory)
        if (category.id === "soju") return createSojuItems(group, subcategory)
        if (category.id === "wine") return createWineItems(group, subcategory)
        if (category.id === "beer") return createBeerItems(group, subcategory)
        if (category.id === "whisky") return createWhiskeyItems(group, subcategory)
        if (category.id === "spirits") return createSpiritsItems(group, subcategory)
        if (category.id === "traditional") return createTraditionalItems(group, subcategory)
        if (category.id === "etc") return createEtcItems(group, subcategory)
        return []
      })
    }
    if (group === "소주") {
      if (sub === "데일리(희석식)" || sub === "프리미엄(증류식)" || sub === "플레이버") {
        return createSojuItems(group, sub)
      }
      return []
    }

    if (group === "와인") {
      if (
        sub === "레드 와인" ||
        sub === "화이트 와인" ||
        sub === "로제 와인" ||
        sub === "스파클링 와인" ||
        sub === "내추럴 와인" ||
        sub === "포트 와인" ||
        sub === "디저트 와인"
      ) {
        return createWineItems(group, sub)
      }
      return []
    }

    if (group === "맥주") {
      if (sub === "라거/필스너" || sub === "에일 / IPA" || sub === "흑맥주 (스타우트)" || sub === "과일맥주") {
        return createBeerItems(group, sub)
      }
      return []
    }

    if (group === "위스키") {
      if (
        sub === "싱글몰트 위스키" ||
        sub === "블렌디드 몰트" ||
        sub === "블렌디드 위스키" ||
        sub === "아메리칸(버번/라이/테네시)" ||
        sub === "그레인 위스키" ||
        sub === "기타 국가 위스키"
      ) {
        return createWhiskeyItems(group, sub)
      }
      return []
    }

    if (group === "증류주") {
      if (sub === "백주/고량주" || sub === "진/보드카" || sub === "테킬라/럼" || sub === "브랜디(꼬냑/아르마냑)") {
        return createSpiritsItems(group, sub)
      }
      return []
    }

    if (group === "전통주") {
      if (sub === "막걸리/탁주" || sub === "약주/청주" || sub === "과실주(한국 와인)") {
        return createTraditionalItems(group, sub)
      }
      return []
    }

    if (group === "기타") {
      if (sub === "리큐르" || sub === "하이볼/칵테일" || sub === "논알콜/저도수 (Sober)") {
        return createEtcItems(group, sub)
      }
      return []
    }

    if (group === "사케") {
      if (sub === "준마이 다이긴죠/다이긴죠" || sub === "준마이 긴죠/긴죠" || sub === "준마이" || sub === "혼죠조/후츠슈") {
        return createSakeItems(group, sub)
      }
      return []
    }

    return []
  }, [group, sub])

  return useMemo(() => ({ items, sortOptions }), [items])
}
