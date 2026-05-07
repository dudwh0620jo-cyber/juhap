export type SakeProductMock = {
  id: string
  categoryId: "sake"
  subcategory: string
  name: string
  subtitle: string
  priceWon: number
  tags: string[]
  keywords: string[]
  chat: {
    notes: string[]
    tastingNotes: string[]
    awards: string[]
    pairingFoods: string[]
    tips: string[]
  }
}

export const SAKE_READY_SUBCATEGORY = "준마이 다이긴죠 / 다이긴죠" as const

export const sakeProductsMock: SakeProductMock[] = [
  {
    id: "sake-dassai-23",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "닷사이 23",
    subtitle: "Dassai 23 Junmai Daiginjo",
    priceWon: 88000,
    tags: ["사케", "과일향", "16도", "드라이"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "닷사이", "과일향"],
    chat: {
      notes: ["입문자도 부담 없이 즐길 수 있는 깔끔한 스타일.", "은은한 과실향과 부드러운 질감이 강점이에요."],
      tastingNotes: ["배, 멜론, 흰꽃", "부드러운 질감, 깨끗한 피니시"],
      awards: [],
      pairingFoods: ["회/해산물", "구운 생선", "담백한 치즈"],
      tips: ["서빙 온도: 8~12℃ 권장", "잔을 살짝 차갑게 하면 향이 또렷해져요."],
    },
  },
  {
    id: "sake-kubota-manju",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "쿠보타 만쥬",
    subtitle: "Kubota Manju Junmai Daiginjo",
    priceWon: 53800,
    tags: ["사케", "드라이", "15.5도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "쿠보타", "드라이"],
    chat: {
      notes: ["깔끔하고 단정한 맛으로 식사와 잘 어울려요.", "과하지 않은 향이어서 다양한 음식과 매칭하기 좋아요."],
      tastingNotes: ["은은한 꽃, 쌀의 단맛", "드라이, 정돈된 피니시"],
      awards: [],
      pairingFoods: ["스시", "찜/구이", "가벼운 튀김"],
      tips: ["서빙 온도: 8~12℃ 권장", "식사 시작부터 끝까지 무난한 타입이에요."],
    },
  },
  {
    id: "sake-kamoshibito-kuheiji",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "카모시비토 쿠헤이지",
    subtitle: "Kamoshibito Kuheiji",
    priceWon: 53400,
    tags: ["사케", "와인맛", "16도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "쿠헤이지", "와인"],
    chat: {
      notes: ["와인처럼 향과 산미가 또렷해서 색다르게 즐길 수 있어요.", "치즈/플래터와도 잘 어울리는 편이에요."],
      tastingNotes: ["화이트 플로럴, 시트러스", "선명한 산미, 길게 이어지는 여운"],
      awards: [],
      pairingFoods: ["치즈 플래터", "가벼운 육류", "샐러드"],
      tips: ["화이트 와인잔으로 마시면 향이 더 잘 느껴져요.", "너무 차갑게만 마시지 말고 10~12℃도 추천."],
    },
  },
  {
    id: "sake-hakkaisan-daiginjo",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "핫카이산 다이긴죠",
    subtitle: "Hakkaisan Daiginjo",
    priceWon: 29800,
    tags: ["사케", "데운 술", "17도"],
    keywords: ["다이긴죠", "핫카이산", "데운 술"],
    chat: {
      notes: ["차갑게도 좋고, 살짝 온도를 올려도 밸런스가 좋아요.", "담백하고 깨끗한 맛이 특징이에요."],
      tastingNotes: ["깨끗한 쌀 향, 은은한 과일", "담백, 드라이, 산뜻"],
      awards: [],
      pairingFoods: ["구이류", "나베", "담백한 안주"],
      tips: ["따뜻하게 마실 땐 뜨겁게 말고 미지근하게(약 40℃ 전후) 추천.", "온도에 따라 향이 달라져요."],
    },
  },
]

