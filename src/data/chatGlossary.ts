export const DIRECT_GLOSSARY_INPUT_LABEL = "직접 입력하시겠어요?"
export const CLEAN_SAKE_RECOMMEND_LABEL = "깔끔한 술 추천"

export const chatUnknownInputMessage = "이해하지 못했어요."
export const chatRecommendationFoundMessage = "조건에 맞는 완벽한 술을 찾았어요!"
export const glossaryIntroMessageTemplate = [
  "안녕하세요, {userName}님!",
  "어려운 주류용어를 쉽게 알려드릴게요!",
].join("\n")

export const glossaryOptions = [
  "도수",
  "바디감",
  "드라이",
  "산미",
  "탄닌",
  "페어링",
  DIRECT_GLOSSARY_INPUT_LABEL,
]

export const glossaryUserBubbleTextByTopic: Record<string, string> = {
  "정미율이 뭔지 궁금해요": "정미율이 뭔지 궁금해요",
}

export type GlossaryRecommendationConfig = {
  wineStyle: string
  productIds: string[]
  showFoundMessage: boolean
}

export const glossaryRecommendationByTopic: Record<string, GlossaryRecommendationConfig> = {
  [CLEAN_SAKE_RECOMMEND_LABEL]: {
    wineStyle: CLEAN_SAKE_RECOMMEND_LABEL,
    productIds: ["sake-dassai-23"],
    showFoundMessage: false,
  },
  "정미율이 뭔지 궁금해요": {
    wineStyle: CLEAN_SAKE_RECOMMEND_LABEL,
    productIds: ["sake-dassai-23"],
    showFoundMessage: false,
  },
}

export const glossaryRelatedOptions = [
  CLEAN_SAKE_RECOMMEND_LABEL,
  "사케 종류 차이",
  "바디감",
  "정미율이 뭔지 궁금해요",
  DIRECT_GLOSSARY_INPUT_LABEL,
]

export const glossaryDefinitionByTopic: Record<string, string> = {
  도수:
    "술에 들어 있는 알코올의 비율을 말해요.\n보통 %로 표시하고, 숫자가 높을수록 알코올감이 더 강하게 느껴질 수 있어요.",
  바디감:
    "입안에서 느껴지는 무게감과 질감을 말해요.\n가볍고 여린 느낌이면 라이트 바디, 묵직하고 진한 느낌이면 풀 바디에 가까워요.",
  드라이:
    "당도가 적고 깔끔하게 마무리되는 스타일을 말해요.\n와인이나 사케에서 자주 쓰는 표현이에요.",
  산미:
    "입안을 상큼하게 깨워주는 산뜻한 느낌이에요.\n산미가 있으면 음식의 기름진 맛을 정리해주기도 해요.",
  탄닌:
    "입안이 살짝 조이는 듯한 떫은 느낌을 말해요.\n레드 와인에서 자주 느껴지고 고기류와 잘 어울려요.",
  페어링:
    "술과 음식이 서로 잘 어울리도록 맞추는 것을 말해요.\n맛의 균형이나 향의 조화를 기준으로 고르는 경우가 많아요.",
  정미율: [
    "정미율은 사케를 만들 때 쌀을 얼마나 깎았는지 보여주는 수치예요.",
    "수치가 낮을수록 잡미 성분이 줄어들어 더 깔끔하고 섬세한 맛이 나는 경우가 많아요.",
    "정미율은 사케를 고를 때 많이 보는 용어 중 하나예요.",
  ].join("\n"),
  당도:
    "술에서 느껴지는 단맛의 정도예요. 당도가 높으면 부드럽거나 달달한 느낌이 나고, 낮으면 더 드라이하게 느껴져요.",
  아로마:
    "코에서 먼저 느껴지는 향을 말해요. 과일, 꽃, 허브 같은 향의 첫인상을 설명할 때 많이 써요.",
  피니시:
    "술을 삼킨 뒤 입안에 남는 여운이에요. 짧고 깔끔한 피니시도 있고, 향과 맛이 오래 이어지는 피니시도 있어요.",
  "정미율이 뭔지 궁금해요":
    "정미율은 쌀의 겉부분을 얼마나 깎았는지를 뜻해요. 보통 더 깔끔하고 섬세한 맛을 기대할 때 참고해요.",
  "사케 종류 차이":
    "사케는 정미율과 제조 방식에 따라 다이긴죠, 긴죠, 준마이 같은 이름으로 나뉘어요.",
  "깔끔한 술 추천":
    "깔끔하고 드라이한 느낌을 원하면 정미율이 낮은 준마이 다이긴죠 타입을 먼저 살펴보세요.",
}

export const glossarySearchTerms = [
  { topic: "정미율", aliases: ["정미율", "정미", "쌀 깎기", "쌀을 얼마나 깎"] },
  { topic: "도수", aliases: ["도수", "알코올", "abv"] },
  { topic: "바디감", aliases: ["바디감", "바디", "body"] },
  { topic: "드라이", aliases: ["드라이", "dry"] },
  { topic: "산미", aliases: ["산미", "신맛", "acidity"] },
  { topic: "탄닌", aliases: ["탄닌", "떫", "tannin"] },
  { topic: "페어링", aliases: ["페어링", "어울리는", "pairing"] },
  { topic: "당도", aliases: ["당도", "단맛", "sweet"] },
  { topic: "아로마", aliases: ["아로마", "향", "aroma"] },
  { topic: "피니시", aliases: ["피니시", "여운", "finish"] },
  { topic: "사케 종류 차이", aliases: ["사케종류", "사케 차이", "준마이", "긴죠", "다이긴죠"] },
  { topic: "정미율이 뭔지 궁금해요", aliases: ["정미율 궁금", "정미율 뭐야", "정미율 뜻"] },
]
