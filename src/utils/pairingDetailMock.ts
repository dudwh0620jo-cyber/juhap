import drinkJangsuMakgeolli from "../assets/drink_jangsu_makgeolli.png"
import recommendedIlpoomjinroYukhoe from "../assets/recommended_ilpoomjinro_yukhoe.png"
import recommendedNeurinmaeulGamjajeon from "../assets/recommended_neurinmaeul_gamjajeon.png"
import recommendedCassChickenSaltGrill from "../assets/recommended_cass_chicken_salt_grill.png"

export type PairingDetailProduct = {
  name: string
  priceText: string
  chips: string[]
  imageSrc: string
}

export type PairingDetailSimilar = {
  id: number
  pairingTitle: string
  authorId: number
  authorName: string
  profile: string
  locationLabel: string
  drinkType: string
  imageSrc: string
  title: string
  rating: number
  reviewCount: number
}

type PairingDetailMock = {
  product?: PairingDetailProduct
  similars?: PairingDetailSimilar[]
}

const DETAIL_MOCK_BY_KEY: Record<string, PairingDetailMock> = {
  jangsu_haemulpajeon: {
    product: {
      name: "장수 생막걸리",
      priceText: "판매정가 1,650원",
      chips: ["막걸리", "6도"],
      imageSrc: drinkJangsuMakgeolli,
    },
    similars: [
      {
        id: 91011,
        pairingTitle: "일품진로 + 육회",
        authorId: 2102,
        authorName: "도윤",
        profile: "30대 / 남 / 위스키 / 묵직한 향 선호",
        locationLabel: "서울 강남구",
        drinkType: "소주",
        imageSrc: recommendedIlpoomjinroYukhoe,
        title: "일품진로 & 육회",
        rating: 4.6,
        reviewCount: 13422,
      },
      {
        id: 91012,
        pairingTitle: "느린마을 막걸리 + 감자전",
        authorId: 2104,
        authorName: "유진",
        profile: "30대 / 여 / 전통주 / 산뜻한 향 선호",
        locationLabel: "인천 연수구",
        drinkType: "전통주",
        imageSrc: recommendedNeurinmaeulGamjajeon,
        title: "느린마을 막걸리 & 감자전",
        rating: 4.1,
        reviewCount: 10422,
      },
      {
        id: 91013,
        pairingTitle: "카스 + 닭목살 소금구이",
        authorId: 2025,
        authorName: "지훈",
        profile: "30대 / 남 / 맥주 / 청량한 맛 선호",
        locationLabel: "경기 성남시",
        drinkType: "맥주",
        imageSrc: recommendedCassChickenSaltGrill,
        title: "카스 & 닭목살 소금구이",
        rating: 4.0,
        reviewCount: 9422,
      },
    ],
  },
}

export function getPairingDetailMock(detailMockKey?: string | null): PairingDetailMock | null {
  const key = detailMockKey?.trim()
  if (!key) return null
  return DETAIL_MOCK_BY_KEY[key] ?? null
}
