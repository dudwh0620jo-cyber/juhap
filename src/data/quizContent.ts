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
  rewardPoints?: number
  isToday?: boolean
}

export const quizTodayId = "quiz-today-2026-05-15"

export const quizItems: QuizItem[] = [
  {
    id: quizTodayId,
    isToday: true,
    rewardPoints: 30,
    question: '위스키에서 “싱글몰트”의 의미는?',
    choices: [
      { id: "a", label: "한 종류의 곡물만 사용" },
      { id: "b", label: "한 증류소에서 만든 몰트 위스키" },
      { id: "c", label: "한 병만 생산된 위스키" },
      { id: "d", label: "한 국가에서만 판매되는 위스키" },
    ],
    correctChoiceId: "b",
    explanationTitle: "싱글몰트는 하나의 증류소에서 만든 몰트 위스키를 뜻해요.",
    explanationBody:
      "“싱글”은 한 병, 한 곡물, 한 국가가 아니라 ‘하나의 증류소’를 의미해요.\n“몰트”는 보리 맥아를 뜻하므로, 싱글몰트는 한 증류소에서 만든 보리 맥아 기반 위스키라고 이해하면 됩니다.",
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
    explanationTitle: "A. 쌀",
    explanationBody:
      "사케는 쌀을 발효해 만든 일본 전통주예요.\n쌀을 깎아내는 정도(정미율)에 따라 향과 풍미가 달라집니다.",
  },
  {
    id: "quiz-prev-2",
    question: "IPA 맥주의 특징으로 가장 가까운 것은?",
    choices: [
      { id: "a", label: "달콤한 과일향" },
      { id: "b", label: "강한 홉의 향과 쌉쌀함" },
      { id: "c", label: "쌀의 은은한 단맛" },
      { id: "d", label: "높은 산미" },
    ],
    correctChoiceId: "b",
    explanationTitle: "IPA는 홉 향과 쌉쌀함이 특징이에요.",
    explanationBody:
      "IPA(India Pale Ale)는 홉을 비교적 많이 사용해 향이 진하고 쌉쌀함이 도드라지는 스타일로 알려져요.",
  },
  {
    id: "quiz-prev-3",
    question: '와인의 “탄닌”은\n 어떤 느낌에 가까울까요?',
    choices: [
      { id: "a", label: "입안을 꽉 잡아주는 떫은 느낌" },
      { id: "b", label: "청량한 탄산감" },
      { id: "c", label: "강한 매운맛" },
      { id: "d", label: "짭짤한 감칠맛" },
    ],
    correctChoiceId: "a",
    explanationTitle: "탄닌은 떫고 마르는 듯한 감각이에요.",
    explanationBody:
      "탄닌은 주로 포도 껍질/씨, 오크 숙성 등에서 기인하며, 입안을 마르게 하거나 떫게 느껴지는 질감을 만들어요.",
  },
] as const

export const quizToday = quizItems.find((item) => item.id === quizTodayId)!
export const quizPreviousItems = quizItems.filter((item) => !item.isToday)
