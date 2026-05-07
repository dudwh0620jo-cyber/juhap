export type OnboardingInfoSlide = {
  title: string
  description: string
}

export type PreferenceGroup = {
  key: string
  title: string
  type: "single" | "multi"
  maxSelections?: number
  options: string[]
}

export const onboardingStartSlide = {
  title: "주합",
  hanja: "酒合",
  subtitle: "한 번의 선택으로,\n오늘을 완성해요",
}

export const onboardingInfoSlides: OnboardingInfoSlide[] = [
  {
    title: "고민 없이, 실패없이\n완벽한 페어링을 경험해보세요",
    description: "사용자님의 취향과 상황에 맞춰서\nai가 술과 음식 페어링 조합을 추천해요.",
  },
  {
    title: "다양한 사람들과\n경험을 나눠요",
    description: "커뮤니티에서 추천, 후기, 페어링 팁을\n나누고 더 넓은 주류 라이프를 즐겨보세요.",
  },
  {
    title: "내 취향을 알아야\n제대로 추천해드릴 수 있어요",
    description: "좋아하는 맛, 타입, 분위기 등을\n선택하면 더 정확한 추천이 가능해요.",
  },
]

export const profileSetupCopy = {
  title: "개인정보를 입력해주세요",
  subtitle: "당신의 취향을 찾기 위한\n첫 걸음이에요.",
}

export const MAX_MULTI_SELECTIONS = 3
export const NONE_OPTION = "상관없음"

export const preferenceGroups: PreferenceGroup[] = [
  {
    key: "situation",
    title: "어떤 상황에 페어링이 필요하신가요?",
    type: "single",
    options: [
      "가볍게 마시고 싶어요",
      "음식과 잘 맞는 술을 원해요",
      "분위기 있는 술을 원해요",
      "실패 없는 무난한 술이 좋아요",
      "새로운 술을 도전해보고 싶어요",
      "선물/모임용 술이 필요해요",
    ],
  },
  {
    key: "drinkType",
    title: "어떤 주종을 가장 선호하시나요?",
    type: "single",
    options: ["맥주", "소주", "와인", "하이볼", "전통주", "위스키", "사케", "기타", NONE_OPTION],
  },
  {
    key: "trait",
    title: "좋아하는 술의 특징은 어떤 건가요?",
    type: "multi",
    maxSelections: 2,
    options: ["달콤한", "깔끔한", "상큼한", "묵직한", "탄산감 있는", "드라이한", "기타", NONE_OPTION],
  },
  {
    key: "avoid",
    title: "피하고 싶은 술이 있다면 알려주세요",
    type: "single",
    options: ["고도수는 싫어요", "너무 단 건 싫어요", "향이 강한 건 싫어요", "너무 비싼 건 싫어요"],
  },
  {
    key: "purchase",
    title: "보통 어디서 술을 구매하시나요?",
    type: "single",
    options: ["편의점", "대형마트", "와인샵/바틀샵", "술집/이자카야", "온라인/구독"],
  },
]
