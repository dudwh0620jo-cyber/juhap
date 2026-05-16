export type QuizChoice = {
  id: string
  label: string
}

export type QuizItem = {
  id: string
  question: string
  choices: QuizChoice[]
  correctChoiceId: string
  explanationTitle: string
  explanationBody: string
  explanationBodySuccess?: string
  explanationBodyFail?: string
  rewardPoints?: number
  isToday?: boolean
  relatedCategoryGroup?: string
}

export const quizTodayId = "quiz-today-2026-05-15"

export const quizItems: QuizItem[] = [
  {
    id: quizTodayId,
    isToday: true,
    rewardPoints: 30,
    question: "위스키에서 ‘싱글몰트’의 의미는?",
    choices: [
      { id: "a", label: "한 종류의 곡물만 사용" },
      { id: "b", label: "한 증류소에서 만든 몰트 위스키" },
      { id: "c", label: "한 병만 생산된 위스키" },
      { id: "d", label: "한 국가에서만 판매되는 위스키" },
    ],
    correctChoiceId: "b",
    explanationTitle: "\" 싱글몰트는 하나의 증류소에서 만든\n몰트 위스키를 뜻해요 \"",
    explanationBody:
      "싱글은 한 병, 한 곡물, 한 국가가 아니라\n하나의 증류소를 의미해요.\n\n" +
      "몰트는 보리 맥아를 뜻하고, 싱글몰트는\n한 증류소에서 만든 보리 맥아 기반 위스키입니다.",
    explanationBodySuccess:
      "싱글은 한 병, 한 곡물, 한 국가가 아니라\n하나의 증류소를 의미해요.\n\n" +
      "몰트는 보리 맥아를 뜻하고, 싱글몰트는\n한 증류소에서 만든 보리 맥아 기반 위스키입니다.",
    explanationBodyFail:
      "아쉬워요. 많이 헷갈리는 답이에요.\n" +
      "싱글몰트는 만드는 장소와 하나의 증류소에서\n 만들어졌는지가 중요해요.",
    relatedCategoryGroup: "위스키",
  },
  {
    id: "quiz-prev-1",
    question: "사케는 어떤 재료로 만들까요?",
    choices: [
      { id: "a", label: "쌀" },
      { id: "b", label: "보리" },
      { id: "c", label: "포도" },
      { id: "d", label: "감자" },
    ],
    correctChoiceId: "a",
    explanationTitle: "A.쌀",
    explanationBody:
      "사케는 쌀을 발효해 만든 일본 전통주예요.\n쌀을 깎아내는 정도(정미율)에 따라 \n향과 풍미가 달라집니다.",
    relatedCategoryGroup: "사케",
  },
  {
    id: "quiz-prev-2",
    question: "IPA 맥주의 특징으로 가장 가까운 것은?",
    choices: [
      { id: "a", label: "사과향 과일맥주" },
      { id: "b", label: "강한 홉의 향과 쓴맛" },
      { id: "c", label: "쌀로만 만든 담백함" },
      { id: "d", label: "높은 당도" },
    ],
    correctChoiceId: "b",
    explanationTitle: "IPA는 홉의 향과 \n쓴맛이 특징이에요",
    explanationBody:
      "IPA(India Pale Ale)는 \n홉을 비교적 많이 사용해서 향이 진하고 \n쓴맛이 도드라지는 스타일로 알려져 있어요.",
    relatedCategoryGroup: "맥주",
  },
  {
    id: "quiz-prev-3",
    question: "와인의 ‘탄닌’은 어떤 느낌에 가까울까요?",
    choices: [
      { id: "a", label: "입안을 살짝 조여주는 떫은 감각" },
      { id: "b", label: "청량한 탄산감" },
      { id: "c", label: "강한 매운맛" },
      { id: "d", label: "진한 단맛" },
    ],
    correctChoiceId: "a",
    explanationTitle: "탄닌은 \n떫고 마르게 하는 감각이에요",
    explanationBody:
      "탄닌은 주로 포도 껍질/씨/줄기 성분에서 \n기인하며, 입안을 마르게 하거나 살짝 \n조여지는 듯한 질감을 만듭니다.",
    relatedCategoryGroup: "와인",
  },
] as const

export const quizToday = quizItems.find((item) => item.id === quizTodayId)!
export const quizPreviousItems = quizItems.filter((item) => !item.isToday)
