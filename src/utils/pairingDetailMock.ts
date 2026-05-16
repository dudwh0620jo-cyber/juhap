import { beerProductsMock } from "../data/beerProductsMock"
import { etcProductsMock } from "../data/etcProductsMock"
import { productImageUrls } from "../data/productImageUrls"
import { mockProductById } from "../data/productDetailData"
import { sakeProductsMock } from "../data/sakeProductsMock"
import { sojuProductsMock } from "../data/sojuProductsMock"
import { spiritsProductsMock } from "../data/spiritsProductsMock"
import { traditionalProductsMock } from "../data/traditionalProductsMock"
import { whiskeyProductsMock } from "../data/whiskeyProductsMock"
import { wineProductsMock } from "../data/wineProductsMock"
import rankingDrink2 from "../assets/rankimg/ranking_drink2.png"
import rankingDrink17 from "../assets/rankimg/ranking_drink17.png"
import rankingDrink20 from "../assets/rankimg/ranking_drink20.png"
import rankingDrink21 from "../assets/rankimg/ranking_drink21.png"
import type { FeedPost } from "./communityPosts"

export type PairingDetailProduct = {
  id: string
  name: string
  priceText: string
  chips: string[]
  imageSrc: string
  disabled?: boolean
}

type PairingDetailMock = {
  product?: PairingDetailProduct
  similarPostIds?: number[]
}

type CategoryProduct = {
  id: string
  name: string
  subcategory: string
  priceWon: number
  tags?: string[]
  keywords?: string[]
  abv?: number
}

const PAIRING_DETAIL_SIMILAR_POST_IDS = [91011, 91012, 91013] as const
const ENABLED_PRODUCT_ID = "sake-dassai-23"

const CATEGORY_PRODUCTS: CategoryProduct[] = [
  ...sakeProductsMock,
  ...sojuProductsMock,
  ...wineProductsMock,
  ...beerProductsMock,
  ...whiskeyProductsMock,
  ...spiritsProductsMock,
  ...traditionalProductsMock,
  ...etcProductsMock,
]

const PRODUCT_ID_BY_ALIAS: Record<string, string> = {
  닷사이23: "sake-dassai-23",
  장수생막걸리: "traditional-makgeolli-jangsu",
  장수막걸리: "traditional-makgeolli-jangsu",
  화요25: "soju-premium-hwayo-25",
  카스: "beer-lager-cass-fresh",
}

const CUSTOM_PRODUCT_BY_ALIAS: Record<string, PairingDetailProduct> = {
  모엣샹동브뤼임페리얼: {
    id: "ranking-moet-chandon-brut-imperial",
    name: "모엣 샹동 브뤼 임페리얼",
    priceText: "판매정가 89,000원",
    chips: ["스파클링", "12도"],
    imageSrc: rankingDrink2,
    disabled: true,
  },
  샤도네이: {
    id: "ranking-chardonnay",
    name: "샤도네이",
    priceText: "판매정가 39,000원",
    chips: ["화이트", "13도"],
    imageSrc: rankingDrink17,
    disabled: true,
  },
  주욘다이혼마루: {
    id: "ranking-juyondai-honmaru",
    name: "쥬욘다이 혼마루",
    priceText: "판매정가 398,000원",
    chips: ["혼죠조/후츠슈", "15도"],
    imageSrc: rankingDrink20,
    disabled: true,
  },
  쥬욘다이혼마루: {
    id: "ranking-juyondai-honmaru",
    name: "쥬욘다이 혼마루",
    priceText: "판매정가 398,000원",
    chips: ["혼죠조/후츠슈", "15도"],
    imageSrc: rankingDrink20,
    disabled: true,
  },
  쿠보타만쥬: {
    id: "ranking-kubota-manju",
    name: "쿠보타 만쥬",
    priceText: "판매정가 128,000원",
    chips: ["준마이 다이긴죠/다이긴죠", "15도"],
    imageSrc: rankingDrink21,
    disabled: true,
  },
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()·/+\-_]/g, "")
    .trim()

const getDrinkNameFromPost = (post?: FeedPost | null, fallbackLiquorTag = "") => {
  if (post?.drinkName?.trim()) return post.drinkName.trim()
  if (fallbackLiquorTag.trim()) return fallbackLiquorTag.trim()
  const title = post?.title?.trim() ?? ""
  return title.includes("+") ? title.split("+")[0].trim() : title
}

const getProductByDrinkName = (drinkName: string) => {
  const normalizedDrinkName = normalize(drinkName)
  const aliasId = PRODUCT_ID_BY_ALIAS[normalizedDrinkName]
  if (aliasId) return CATEGORY_PRODUCTS.find((product) => product.id === aliasId) ?? null

  return (
    CATEGORY_PRODUCTS.find((product) => {
      const names = [product.name, ...(product.keywords ?? [])].map(normalize)
      return names.some((name) => name === normalizedDrinkName || name.includes(normalizedDrinkName) || normalizedDrinkName.includes(name))
    }) ?? null
  )
}

const getProductImageSrc = (productId: string) => productImageUrls[productId]

const getCategoryChip = (value?: string) => value?.trim() ?? ""

const getProductChips = (post: FeedPost | undefined, product: CategoryProduct) => {
  const categoryChip = getCategoryChip(post?.detailCategories?.[0] ?? product.subcategory)
  const abv = typeof post?.abv === "number" ? post.abv : product.abv
  const abvChip = typeof abv === "number" ? `${Number.isInteger(abv) ? abv : abv.toFixed(1)}도` : ""
  return [categoryChip, abvChip].filter(Boolean).slice(0, 2)
}

export function resolvePairingDetailProduct(post?: FeedPost, liquorTag = ""): PairingDetailProduct | null {
  const drinkName = getDrinkNameFromPost(post, liquorTag)
  const customProduct = CUSTOM_PRODUCT_BY_ALIAS[normalize(drinkName)]
  if (customProduct) return customProduct

  const product = getProductByDrinkName(drinkName)
  if (!product) return null

  const imageSrc = getProductImageSrc(product.id)
  if (!imageSrc) return null
  const productDetail = mockProductById[product.id]

  return {
    id: product.id,
    name: productDetail?.name ?? product.name,
    priceText: `판매정가 ${productDetail?.price ?? `${product.priceWon.toLocaleString("ko-KR")}원`}`,
    chips: getProductChips(post, product),
    imageSrc,
    disabled: product.id !== ENABLED_PRODUCT_ID,
  }
}

const DETAIL_MOCK_BY_KEY: Record<string, PairingDetailMock> = {
  jangsu_haemulpajeon: {
    similarPostIds: [...PAIRING_DETAIL_SIMILAR_POST_IDS],
  },
}

export function getPairingDetailMock(detailMockKey?: string | null): PairingDetailMock | null {
  const key = detailMockKey?.trim()
  if (!key) return null
  return DETAIL_MOCK_BY_KEY[key] ?? null
}
