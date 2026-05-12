import drinkJangsuMakgeolli from "../assets/drink_jangsu_makgeolli.png"

export type PairingDetailProduct = {
  name: string
  priceText: string
  chips: string[]
  imageSrc: string
}

type PairingDetailMock = {
  product?: PairingDetailProduct
  similarPostIds?: number[]
}

const PAIRING_DETAIL_SIMILAR_POST_IDS = [91011, 91012, 91013] as const

const DETAIL_MOCK_BY_KEY: Record<string, PairingDetailMock> = {
  jangsu_haemulpajeon: {
    product: {
      name: "장수 생막걸리",
      priceText: "마트가 1,650원",
      chips: ["막걸리", "6%"],
      imageSrc: drinkJangsuMakgeolli,
    },
    similarPostIds: [...PAIRING_DETAIL_SIMILAR_POST_IDS],
  },
}

export function getPairingDetailMock(detailMockKey?: string | null): PairingDetailMock | null {
  const key = detailMockKey?.trim()
  if (!key) return null
  return DETAIL_MOCK_BY_KEY[key] ?? null
}

