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
    keywords: ["준마이 다이긴죠", "다이긴죠", "닷사이", "23", "과일향"],
    chat: {
      notes: ["입문자도 부담 없이 즐길 수 있는 깔끔한 스타일", "은은한 과실향과 부드러운 질감이 강점이에요."],
      tastingNotes: ["배, 멜론, 사과", "부드러운 질감, 긴 여운"],
      awards: [],
      pairingFoods: ["해산물", "구운 생선", "리코타 치즈"],
      tips: ["서빙 온도: 8~12℃ 추천", "약간 차갑게 마시면 향이 더 살아나요."],
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
    keywords: ["준마이 다이긴죠", "다이긴죠", "쿠보타", "만쥬", "드라이"],
    chat: {
      notes: ["깔끔하고 단정한 맛으로 식사와 잘 어울려요.", "부담 없이 여러 음식과 매칭하기 좋아요."],
      tastingNotes: ["은은한 향", "드라이, 정돈된 피니시"],
      awards: [],
      pairingFoods: ["사시미", "차가운 전채", "담백한 튀김"],
      tips: ["서빙 온도: 8~12℃ 추천", "식사 시작부터 끝까지 무난하게 좋아요."],
    },
  },
  {
    id: "sake-kamoshibito-kuheiji",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "카모시비토 쿠헤이지",
    subtitle: "Kamoshibito Kuheiji",
    priceWon: 53400,
    tags: ["사케", "와인감", "16도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "쿠헤이지", "카모시비토", "와인"],
    chat: {
      notes: ["와인처럼 산미와 향이 살아 있는 타입이에요.", "치즈/크림 계열 음식과도 잘 맞아요."],
      tastingNotes: ["시트러스", "선명한 산미, 긴 피니시"],
      awards: [],
      pairingFoods: ["치즈 플래터", "가벼운 구이", "크림 파스타"],
      tips: ["화이트와인 잔으로 마시면 향이 좋아요.", "10~12℃ 정도로 추천해요."],
    },
  },
  {
    id: "sake-hakkaisan-daiginjo",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "핫카이산 다이긴죠",
    subtitle: "Hakkaisan Daiginjo",
    priceWon: 29800,
    tags: ["사케", "깔끔", "17도"],
    keywords: ["다이긴죠", "핫카이산", "깔끔", "드라이"],
    chat: {
      notes: ["차갑게 마셔도 좋고, 살짝 온도를 올려도 괜찮아요.", "담백하고 깔끔한 맛이 특징이에요."],
      tastingNotes: ["맑은 과일향", "담백, 드라이한 여운"],
      awards: [],
      pairingFoods: ["구이류", "나베", "담백한 안주"],
      tips: ["너무 차갑기만 하게 마시기보다 10℃ 전후도 추천해요.", "온도에 따라 맛이 달라져요."],
    },
  },
  {
    id: "sake-nabeshima-daiginjo",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "나베시마 다이긴죠",
    subtitle: "Nabeshima Daiginjo",
    priceWon: 68000,
    tags: ["사케", "화사한 향", "16도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "나베시마", "향"],
    chat: {
      notes: ["향이 화사하고 밸런스가 좋아요.", "격식 있는 자리에도 잘 어울려요."],
      tastingNotes: ["복숭아, 배", "균형감, 부드러운 피니시"],
      awards: [],
      pairingFoods: ["흰살생선", "회", "가벼운 전채"],
      tips: ["8~12℃로 차갑게 즐기면 향이 좋아요.", "첫 잔으로 추천해요."],
    },
  },
  {
    id: "sake-denshu-junmai-daiginjo",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "덴슈 준마이 다이긴죠",
    subtitle: "Denshu Junmai Daiginjo",
    priceWon: 92000,
    tags: ["사케", "쌀향", "16도"],
    keywords: ["준마이 다이긴죠", "덴슈", "쌀향", "깔끔"],
    chat: {
      notes: ["쌀 본연의 향과 깔끔한 마무리가 매력적이에요.", "정갈한 음식과 잘 어울려요."],
      tastingNotes: ["은은한 쌀향", "깔끔, 깨끗한 피니시"],
      awards: [],
      pairingFoods: ["스시", "두부 요리", "담백한 해산물"],
      tips: ["차갑게(8~12℃) 마시면 깨끗한 맛이 강조돼요.", "여운을 천천히 느껴보세요."],
    },
  },
  {
    id: "sake-juyondai-series",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "쥬욘다이 (시리즈)",
    subtitle: "Juyondai (Series)",
    priceWon: 130000,
    tags: ["사케", "프리미엄", "16도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "쥬욘다이", "프리미엄"],
    chat: {
      notes: ["프리미엄 라인업으로 유명한 시리즈예요.", "화사한 향과 고급스러운 밸런스가 특징이에요."],
      tastingNotes: ["꽃향, 과일향", "부드러움, 긴 여운"],
      awards: [],
      pairingFoods: ["고급 스시", "게/새우 요리", "트러플 오일 파스타"],
      tips: ["너무 차갑게만 마시기보다 10~12℃도 추천해요.", "향을 즐기기 좋게 잔을 선택해보세요."],
    },
  },
  {
    id: "sake-gekkeikan-horin",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "월계관 호린",
    subtitle: "Gekkeikan Horin",
    priceWon: 45000,
    tags: ["사케", "부드러움", "15도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "월계관", "호린"],
    chat: {
      notes: ["부드럽고 깔끔해 선물용으로도 좋아요.", "여러 음식과 무난하게 어울려요."],
      tastingNotes: ["은은한 과실향", "부드러운 질감"],
      awards: [],
      pairingFoods: ["샐러드", "가벼운 튀김", "치킨"],
      tips: ["8~12℃로 가볍게 즐기기 좋아요.", "잔에 따라 향이 달라져요."],
    },
  },
  {
    id: "sake-onnanakase",
    categoryId: "sake",
    subcategory: SAKE_READY_SUBCATEGORY,
    name: "온나나카세",
    subtitle: "Onnanakase",
    priceWon: 56000,
    tags: ["사케", "은은한 향", "16도"],
    keywords: ["준마이 다이긴죠", "다이긴죠", "온나나카세", "향"],
    chat: {
      notes: ["은은한 향과 부드러운 밸런스가 좋아요.", "담백한 요리와 함께 추천해요."],
      tastingNotes: ["배, 은은한 꽃향", "부드러운 피니시"],
      awards: [],
      pairingFoods: ["회", "샤브샤브", "흰살 생선"],
      tips: ["8~12℃로 차갑게 즐기기 좋아요.", "첫 잔 혹은 메인 술로 무난해요."],
    },
  },
]

