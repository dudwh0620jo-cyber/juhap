import drinkJangsuMakgeolli from "../assets/drink_jangsu_makgeolli.png"
import recommendedCassChickenSaltGrill from "../assets/recommended_cass_chicken_salt_grill.png"
import recommendedIlpoomjinroYukhoe from "../assets/recommended_ilpoomjinro_yukhoe.png"
import recommendedNeurinmaeulGamjajeon from "../assets/recommended_neurinmaeul_gamjajeon.png"

export type PairingDetailProduct = {
  name: string
  priceText: string
  chips: string[]
  imageSrc: string
}

export type PairingDetailSimilarPostSeed = {
  id: number
  pairingTitle: string
  authorId: number
  locationLabel: string
  drinkType: string
  imageSrc: string
  title: string
  rating: number
  reviewCount: number
}

type PairingDetailMock = {
  product?: PairingDetailProduct
  similarPostIds?: number[]
}

const PAIRING_DETAIL_SIMILAR_POSTS: PairingDetailSimilarPostSeed[] = [
  {
    id: 91011,
    pairingTitle: "일품진로 + 육회",
    authorId: 2102,
    locationLabel: "서울 강남구",
    drinkType: "소주",
    imageSrc: recommendedIlpoomjinroYukhoe,
    title: "일품진로 + 육회",
    rating: 4.6,
    reviewCount: 13422,
  },
  {
    id: 91012,
    pairingTitle: "느린마을 막걸리 + 감자전",
    authorId: 2104,
    locationLabel: "인천 연수구",
    drinkType: "전통주",
    imageSrc: recommendedNeurinmaeulGamjajeon,
    title: "느린마을 막걸리 + 감자전",
    rating: 4.1,
    reviewCount: 10422,
  },
  {
    id: 91013,
    pairingTitle: "카스 + 치킨 소금구이",
    authorId: 2025,
    locationLabel: "경기 성남시",
    drinkType: "맥주",
    imageSrc: recommendedCassChickenSaltGrill,
    title: "카스 + 치킨 소금구이",
    rating: 4.0,
    reviewCount: 9422,
  },
]

const DETAIL_MOCK_BY_KEY: Record<string, PairingDetailMock> = {
  jangsu_haemulpajeon: {
    product: {
      name: "장수 생막걸리",
      priceText: "마트가 1,650원",
      chips: ["막걸리", "6도"],
      imageSrc: drinkJangsuMakgeolli,
    },
    similarPostIds: PAIRING_DETAIL_SIMILAR_POSTS.map((item) => item.id),
  },
}

const SIMILAR_POST_MAP = Object.fromEntries(PAIRING_DETAIL_SIMILAR_POSTS.map((item) => [item.id, item])) as Record<number, PairingDetailSimilarPostSeed>

export function getPairingDetailMock(detailMockKey?: string | null): PairingDetailMock | null {
  const key = detailMockKey?.trim()
  if (!key) return null
  return DETAIL_MOCK_BY_KEY[key] ?? null
}

export function getAllPairingDetailSimilarPosts(): PairingDetailSimilarPostSeed[] {
  return PAIRING_DETAIL_SIMILAR_POSTS
}

export function getPairingDetailSimilarPostById(id: number): PairingDetailSimilarPostSeed | null {
  return SIMILAR_POST_MAP[id] ?? null
}
