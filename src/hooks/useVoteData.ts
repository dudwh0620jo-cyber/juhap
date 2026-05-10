import { useMemo } from "react"
import type { VoteItem } from "../components/VoteListCard"

export const VOTE_INITIAL_COUNT = 5
export const FEATURED_VOTE_ID = 1

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const voteItems: VoteItem[] = [
  {
    id: 1,
    question: "불금에 어울리는 조합은?",
    date: daysAgo(0),
    options: [
      { title: "맥주에 치킨", percent: 62 },
      { title: "와인에 스테이크", percent: 38 },
    ],
    totalVotes: 1284,
    myPickIndex: null,
  },
  {
    id: 2,
    question: "혼술할 때 최고인 선택은?",
    date: daysAgo(1),
    options: [
      { title: "막걸리에 파전", percent: 55 },
      { title: "소주에 라면", percent: 45 },
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
      { title: "막걸리에 해물파전", percent: 83 },
      { title: "와인에 치즈", percent: 17 },
    ],
    totalVotes: 987,
    myPickIndex: null,
  },
  {
    id: 5,
    question: "여름철 야외에서 마시기 좋은 술은?",
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
      { title: "하이볼과 감튀", percent: 73 },
      { title: "사장막걸리와 전", percent: 27 },
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
      { title: "미니 와인 병", percent: 40 },
    ],
    totalVotes: 891,
    myPickIndex: null,
  },
]

export function useVoteData() {
  return useMemo(() => ({ voteItems }), [])
}
