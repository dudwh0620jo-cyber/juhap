export const DIRECT_GLOSSARY_INPUT_LABEL = "직접 입력하시겠어요?"
export const CLEAN_SAKE_RECOMMEND_LABEL = "깔끔한 술 추천"

export const chatUnknownInputMessage = "이해하지 못했어요."
export const chatRecommendationFoundMessage = "조건에 맞는 완벽한 술을 찾았어요!"
export const glossaryIntroMessageTemplate = ["안녕하세요. {userName}님!", "어려운 주류용어를 쉽게 알려드릴께요!"].join("\n")

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
  "정미율 낮은 사케가 궁금하신가요?": "정미율이 낮은 사케가 궁금해요",
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
  "정미율 낮은 사케가 궁금하신가요?": {
    wineStyle: CLEAN_SAKE_RECOMMEND_LABEL,
    productIds: ["sake-dassai-23"],
    showFoundMessage: false,
  },
}

export const glossaryRelatedOptions = [
  CLEAN_SAKE_RECOMMEND_LABEL,
  "사케 종류 차이",
  "바디감",
  "정미율 낮은 사케가 궁금하신가요?",
  DIRECT_GLOSSARY_INPUT_LABEL,
]

export const glossaryDefinitionByTopic: Record<string, string> = {
  도수: "술에 들어 있는 알코올의 비율을 말해요. 보통 %로 표시하고, 숫자가 높을수록 알코올감이 더 강하게 느껴질 수 있어요.",
  바디감:
    "입안에서 느껴지는 무게감과 질감을 뜻해요. 가볍고 산뜻한 술은 라이트 바디, 묵직하고 진한 술은 풀 바디에 가까워요.",
  드라이: "단맛이 적고 깔끔하게 마무리되는 스타일을 말해요. 와인이나 사케에서 자주 쓰는 표현이에요.",
  산미: "입안을 산뜻하게 깨워주는 새콤한 느낌이에요. 산미가 있으면 음식의 기름진 맛을 정리해주기도 해요.",
  탄닌: "입안을 살짝 조이는 떫은 느낌을 말해요. 레드 와인에서 자주 느껴지고, 고기류와 잘 어울리는 경우가 많아요.",
  페어링: "술과 음식이 서로 잘 어울리도록 맞추는 것을 말해요. 맛의 균형이나 향의 조화를 기준으로 고르는 경우가 많아요.",
  정미율: [
    "정미율은 사케를 만들 때 쌀을 얼마나 깎았는지 보여주는 수치예요.",
    "쌀 바깥쪽에는 단백질과 지방 성분이 많아서 많이 남아있을수록 진하고 묵직한 맛이 나고,",
    "많이 깎을수록 잡맛이 줄어들어 더 깔끔하고 섬세한 스타일이 되는 경우가 많아요.",
    "정미율과 함께 많이 보는 용어도 있어요.",
  ].join("\n"),
  당도: "술에서 느껴지는 단맛의 정도예요. 단맛이 강하면 디저트나 매운 음식과 잘 맞고, 낮으면 깔끔하게 마무리되는 느낌이 커져요.",
  아로마: "잔에서 올라오는 향을 말해요. 과일, 꽃, 허브, 곡물처럼 술의 첫인상을 만드는 향을 설명할 때 많이 써요.",
  피니시: "술을 삼킨 뒤 입안에 남는 여운이에요. 짧고 깔끔한 피니시도 있고, 향과 맛이 오래 이어지는 피니시도 있어요.",
  "정미율 낮은 사케가 궁금하신가요?":
    "정미율이 낮다는 건 쌀을 더 많이 깎았다는 뜻이에요. 보통 더 깔끔하고 섬세한 향을 기대할 수 있어요.",
  "사케 종류 차이":
    "사케는 쌀을 깎은 정도와 양조 알코올 사용 여부에 따라 다이긴죠, 긴죠, 준마이 같은 이름으로 나뉘어요.",
}

export const glossarySearchTerms = [
  { topic: "정미율", aliases: ["정미율", "정미율이뭐야", "정미율은", "쌀깎", "쌀을얼마나"] },
  { topic: "도수", aliases: ["도수", "알코올", "abv"] },
  { topic: "바디감", aliases: ["바디감", "바디", "body"] },
  { topic: "드라이", aliases: ["드라이", "dry"] },
  { topic: "산미", aliases: ["산미", "신맛", "acidity"] },
  { topic: "탄닌", aliases: ["탄닌", "떫은맛", "tannin"] },
  { topic: "페어링", aliases: ["페어링", "어울리는", "pairing"] },
  { topic: "당도", aliases: ["당도", "단맛", "스위트", "sweet"] },
  { topic: "아로마", aliases: ["아로마", "향", "향기", "aroma"] },
  { topic: "피니시", aliases: ["피니시", "여운", "끝맛", "finish"] },
  { topic: "사케 종류 차이", aliases: ["사케종류", "사케종류차이", "준마이", "긴죠", "다이긴죠"] },
  {
    topic: "정미율 낮은 사케가 궁금하신가요?",
    aliases: ["궁금해", "응", "정미율낮은사케", "정미율낮은술", "낮은정미율"],
  },
]
