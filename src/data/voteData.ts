export const VOTE_INITIAL_COUNT = 5
export const FEATURED_VOTE_ID = 1

export type VoteItem = {
  id: number
  question: string
  date: string
  options: [{ title: string; percent: number }, { title: string; percent: number }]
  totalVotes: number
  myPickIndex: 0 | 1 | null
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const voteItems: VoteItem[] = [
  {
    id: 1,
    question: "불금을 달려줄 조합은?",
    date: daysAgo(0),
    options: [
      { title: "맥주와 피자", percent: 62 },
      { title: "와인에 스테이크", percent: 38 },
    ],
    totalVotes: 1284,
    myPickIndex: null,
  },
  {
    id: 2,
    question: "시장안주 최고의 선택은?",
    date: daysAgo(1),
    options: [
      { title: "막걸리와 전", percent: 55 },
      { title: "소주와 라면", percent: 45 },
    ],
    totalVotes: 2108,
    myPickIndex: 0,
  },
  {
    id: 3,
    question: "고기 구울 때 어울리는 술은?",
    date: daysAgo(2),
    options: [
      { title: "소주", percent: 71 },
      { title: "맥주", percent: 29 },
    ],
    totalVotes: 3450,
    myPickIndex: 0,
  },
  {
    id: 4,
    question: "비 오는 날 최고 조합은?",
    date: daysAgo(3),
    options: [
      { title: "막걸리와 해물파전", percent: 83 },
      { title: "와인에 치즈", percent: 17 },
    ],
    totalVotes: 987,
    myPickIndex: null,
  },
  {
    id: 5,
    question: "설렘 가득한 야외에서 마시기 좋은 술은?",
    date: daysAgo(4),
    options: [
      { title: "시원한 캔맥주", percent: 68 },
      { title: "보드카 믹스", percent: 32 },
    ],
    totalVotes: 761,
    myPickIndex: 1,
  },
  {
    id: 6,
    question: "안주 없이 마신다면 어떤 술?",
    date: daysAgo(5),
    options: [
      { title: "소주", percent: 44 },
      { title: "맥주", percent: 56 },
    ],
    totalVotes: 1530,
    myPickIndex: 1,
  },
  {
    id: 7,
    question: "2차로 가기 좋은 조합은?",
    date: daysAgo(6),
    options: [
      { title: "하이볼과 감자튀김", percent: 73 },
      { title: "막걸리와 전", percent: 27 },
    ],
    totalVotes: 2045,
    myPickIndex: 0,
  },
  {
    id: 8,
    question: "집에서 혼자 마시기 좋은 술은?",
    date: daysAgo(7),
    options: [
      { title: "편의점 캔맥주", percent: 60 },
      { title: "미니 와인 보틀", percent: 40 },
    ],
    totalVotes: 891,
    myPickIndex: null,
  },
]
