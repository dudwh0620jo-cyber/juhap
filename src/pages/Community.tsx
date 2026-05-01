import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"

type TopTab = "ranking" | "feed"
type FeedFilter = "review" | "free" | "popular" | "follow"

type RankingPeriod = "weekly" | "daily" | "monthly" | "all"
type RankingCategory = "all" | "soju" | "wine" | "beer" | "whisky_spirit" | "tradition" | "sake" | "etc"

const normalizeTopTab = (value: string | null): TopTab | null => {
  if (value === "ranking" || value === "feed") {
    return value
  }
  return null
}

const normalizeRankingPeriod = (value: string | null): RankingPeriod | null => {
  if (value === "weekly" || value === "daily" || value === "monthly" || value === "all") {
    return value
  }
  return null
}

const normalizeRankingCategory = (value: string | null): RankingCategory | null => {
  if (
    value === "all" ||
    value === "soju" ||
    value === "wine" ||
    value === "beer" ||
    value === "whisky_spirit" ||
    value === "tradition" ||
    value === "sake" ||
    value === "etc"
  ) {
    return value
  }
  return null
}

type RankingRow = {
  id: number
  rank: number
  pair: string
  category: RankingCategory
  score: number
  votes: number
  delta: string
}

type RankingPodium = {
  id: number
  rank: 1 | 2 | 3
  pair: string
  category: RankingCategory
  score: number
  thumbVariant?: "default" | "bottle"
}

type FeedPost = {
  id: number
  authorId: number
  authorName: string
  title: string
  body: string
  createdAt: string
  likeCount: number
  commentCount: number
  popularityScore: number
  profile?: string
  isQna?: boolean
  answerPreview?: string
  answerCount?: number
}

type FollowUser = {
  id: number
  name: string
  profile: string
  bio: string
}

const rankingPeriods: Array<{ key: RankingPeriod; label: string }> = [
  { key: "weekly", label: "주간" },
  { key: "daily", label: "일간" },
  { key: "monthly", label: "월간" },
  { key: "all", label: "전체" },
]

const rankingCategories: Array<{ key: RankingCategory; label: string }> = [
  { key: "all", label: "전체" },
  { key: "soju", label: "소주" },
  { key: "wine", label: "와인" },
  { key: "beer", label: "맥주" },
  { key: "whisky_spirit", label: "위스키/증류주" },
  { key: "tradition", label: "전통주" },
  { key: "sake", label: "사케" },
  { key: "etc", label: "기타" },
]

const rankingDataByPeriod: Record<
  RankingPeriod,
  { podiumByCategory: Record<RankingCategory, RankingPodium[]>; rows: RankingRow[] }
> = {
  weekly: {
    podiumByCategory: {
      all: [
        { id: 101, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 98.4 },
        { id: 102, rank: 2, pair: "소주 + 삼겹살", category: "soju", score: 97.9 },
        { id: 103, rank: 3, pair: "레드 와인 + 스테이크", category: "wine", score: 96.8, thumbVariant: "bottle" },
      ],
      soju: [
        { id: 111, rank: 1, pair: "소주 + 삼겹살", category: "soju", score: 98.2 },
        { id: 112, rank: 2, pair: "소주 + 회", category: "soju", score: 97.1 },
        { id: 113, rank: 3, pair: "소주 + 닭갈비", category: "soju", score: 96.4 },
      ],
      wine: [
        { id: 121, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 98.0, thumbVariant: "bottle" },
        { id: 122, rank: 2, pair: "화이트 와인 + 굴", category: "wine", score: 97.3, thumbVariant: "bottle" },
        { id: 123, rank: 3, pair: "로제 와인 + 샐러드", category: "wine", score: 96.2, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 131, rank: 1, pair: "라거 맥주 + 치킨", category: "beer", score: 97.6 },
        { id: 132, rank: 2, pair: "IPA + 버거", category: "beer", score: 96.9 },
        { id: 133, rank: 3, pair: "흑맥주 + 피자", category: "beer", score: 96.1 },
      ],
      whisky_spirit: [
        { id: 141, rank: 1, pair: "위스키 + 다크초콜릿", category: "whisky_spirit", score: 97.8 },
        { id: 142, rank: 2, pair: "하이볼 + 나초", category: "whisky_spirit", score: 97.0 },
        { id: 143, rank: 3, pair: "진 + 토닉 + 올리브", category: "whisky_spirit", score: 96.3 },
      ],
      tradition: [
        { id: 151, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 98.4 },
        { id: 152, rank: 2, pair: "청주 + 모둠전", category: "tradition", score: 97.2 },
        { id: 153, rank: 3, pair: "약주 + 생선구이", category: "tradition", score: 96.0 },
      ],
      sake: [
        { id: 161, rank: 1, pair: "사케 + 사시미", category: "sake", score: 97.5 },
        { id: 162, rank: 2, pair: "사케 + 가라아게", category: "sake", score: 96.8 },
        { id: 163, rank: 3, pair: "사케 + 오뎅", category: "sake", score: 95.9 },
      ],
      etc: [
        { id: 171, rank: 1, pair: "샴페인 + 굴", category: "etc", score: 97.2, thumbVariant: "bottle" },
        { id: 172, rank: 2, pair: "칵테일 + 타코", category: "etc", score: 96.5 },
        { id: 173, rank: 3, pair: "무알콜 맥주 + 피자", category: "etc", score: 95.8 },
      ],
    },
    rows: [
      { id: 104, rank: 4, pair: "라거 맥주 + 치킨", category: "beer", score: 94.1, votes: 7621, delta: "-1" },
      { id: 105, rank: 5, pair: "레드 와인 + 스테이크", category: "wine", score: 92.7, votes: 5432, delta: "+5" },
      { id: 106, rank: 6, pair: "하이볼 + 나초", category: "whisky_spirit", score: 91.3, votes: 4218, delta: "+2" },
      { id: 107, rank: 7, pair: "소주 + 삼겹살", category: "soju", score: 90.0, votes: 3891, delta: "-2" },
      { id: 108, rank: 8, pair: "위스키 + 다크초콜릿", category: "whisky_spirit", score: 89.4, votes: 3660, delta: "+1" },
      { id: 109, rank: 9, pair: "막걸리 + 해물파전", category: "tradition", score: 88.9, votes: 3428, delta: "+3" },
      { id: 110, rank: 10, pair: "사케 + 사시미", category: "sake", score: 88.1, votes: 3180, delta: "-1" },
    ],
  },
  daily: {
    podiumByCategory: {
      all: [
        { id: 201, rank: 1, pair: "소주 + 삼겹살", category: "soju", score: 98.9 },
        { id: 202, rank: 2, pair: "라거 맥주 + 감자튀김", category: "beer", score: 97.4 },
        { id: 203, rank: 3, pair: "화이트 와인 + 치즈", category: "wine", score: 96.2, thumbVariant: "bottle" },
      ],
      soju: [
        { id: 211, rank: 1, pair: "소주 + 삼겹살", category: "soju", score: 98.9 },
        { id: 212, rank: 2, pair: "소주 + 곱창", category: "soju", score: 97.3 },
        { id: 213, rank: 3, pair: "소주 + 제육볶음", category: "soju", score: 96.0 },
      ],
      wine: [
        { id: 221, rank: 1, pair: "화이트 와인 + 치즈", category: "wine", score: 97.2, thumbVariant: "bottle" },
        { id: 222, rank: 2, pair: "레드 와인 + 파스타", category: "wine", score: 96.6, thumbVariant: "bottle" },
        { id: 223, rank: 3, pair: "샴페인 + 굴", category: "wine", score: 95.9, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 231, rank: 1, pair: "라거 맥주 + 감자튀김", category: "beer", score: 97.4 },
        { id: 232, rank: 2, pair: "IPA + 버거", category: "beer", score: 96.5 },
        { id: 233, rank: 3, pair: "밀맥주 + 피자", category: "beer", score: 95.6 },
      ],
      whisky_spirit: [
        { id: 241, rank: 1, pair: "위스키 + 견과류", category: "whisky_spirit", score: 97.0 },
        { id: 242, rank: 2, pair: "하이볼 + 나초", category: "whisky_spirit", score: 96.1 },
        { id: 243, rank: 3, pair: "진 + 토닉 + 올리브", category: "whisky_spirit", score: 95.3 },
      ],
      tradition: [
        { id: 251, rank: 1, pair: "막걸리 + 파전", category: "tradition", score: 96.8 },
        { id: 252, rank: 2, pair: "청주 + 생선구이", category: "tradition", score: 95.9 },
        { id: 253, rank: 3, pair: "약주 + 수육", category: "tradition", score: 95.0 },
      ],
      sake: [
        { id: 261, rank: 1, pair: "사케 + 사시미", category: "sake", score: 96.7 },
        { id: 262, rank: 2, pair: "사케 + 오뎅", category: "sake", score: 95.8 },
        { id: 263, rank: 3, pair: "사케 + 스시", category: "sake", score: 95.1 },
      ],
      etc: [
        { id: 271, rank: 1, pair: "칵테일 + 타코", category: "etc", score: 96.2 },
        { id: 272, rank: 2, pair: "하드셀처 + 나초", category: "etc", score: 95.7 },
        { id: 273, rank: 3, pair: "무알콜 칵테일 + 샐러드", category: "etc", score: 95.0 },
      ],
    },
    rows: [
      { id: 204, rank: 4, pair: "막걸리 + 파전", category: "tradition", score: 95.3, votes: 2210, delta: "+1" },
      { id: 205, rank: 5, pair: "위스키 + 견과류", category: "whisky_spirit", score: 94.0, votes: 1982, delta: "-2" },
      { id: 206, rank: 6, pair: "IPA + 버거", category: "beer", score: 93.2, votes: 1751, delta: "+4" },
      { id: 207, rank: 7, pair: "소주 + 제육볶음", category: "soju", score: 92.1, votes: 1620, delta: "+2" },
      { id: 208, rank: 8, pair: "레드 와인 + 파스타", category: "wine", score: 91.7, votes: 1496, delta: "-1" },
      { id: 209, rank: 9, pair: "사케 + 오뎅", category: "sake", score: 90.9, votes: 1322, delta: "+6" },
      { id: 210, rank: 10, pair: "칵테일 + 타코", category: "etc", score: 90.1, votes: 1210, delta: "-3" },
    ],
  },
  monthly: {
    podiumByCategory: {
      all: [
        { id: 301, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 99.1, thumbVariant: "bottle" },
        { id: 302, rank: 2, pair: "소주 + 삼겹살", category: "soju", score: 98.3 },
        { id: 303, rank: 3, pair: "막걸리 + 해물파전", category: "tradition", score: 97.7 },
      ],
      soju: [
        { id: 311, rank: 1, pair: "소주 + 삼겹살", category: "soju", score: 98.5 },
        { id: 312, rank: 2, pair: "소주 + 닭볶음탕", category: "soju", score: 97.2 },
        { id: 313, rank: 3, pair: "소주 + 회", category: "soju", score: 96.8 },
      ],
      wine: [
        { id: 321, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 99.1, thumbVariant: "bottle" },
        { id: 322, rank: 2, pair: "화이트 와인 + 회", category: "wine", score: 98.2, thumbVariant: "bottle" },
        { id: 323, rank: 3, pair: "로제 와인 + 샐러드", category: "wine", score: 97.4, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 331, rank: 1, pair: "IPA + 피자", category: "beer", score: 97.9 },
        { id: 332, rank: 2, pair: "라거 맥주 + 치킨", category: "beer", score: 97.1 },
        { id: 333, rank: 3, pair: "스타우트 + 디저트", category: "beer", score: 96.2 },
      ],
      whisky_spirit: [
        { id: 341, rank: 1, pair: "버번 위스키 + 바비큐", category: "whisky_spirit", score: 98.0 },
        { id: 342, rank: 2, pair: "위스키 + 다크초콜릿", category: "whisky_spirit", score: 97.1 },
        { id: 343, rank: 3, pair: "진 + 토닉 + 올리브", category: "whisky_spirit", score: 96.5 },
      ],
      tradition: [
        { id: 351, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 97.7 },
        { id: 352, rank: 2, pair: "청주 + 생선구이", category: "tradition", score: 96.8 },
        { id: 353, rank: 3, pair: "약주 + 수육", category: "tradition", score: 95.9 },
      ],
      sake: [
        { id: 361, rank: 1, pair: "사케 + 스시", category: "sake", score: 97.2 },
        { id: 362, rank: 2, pair: "사케 + 사시미", category: "sake", score: 96.6 },
        { id: 363, rank: 3, pair: "사케 + 가라아게", category: "sake", score: 95.8 },
      ],
      etc: [
        { id: 371, rank: 1, pair: "샴페인 + 굴", category: "etc", score: 97.0, thumbVariant: "bottle" },
        { id: 372, rank: 2, pair: "칵테일 + 타코", category: "etc", score: 96.2 },
        { id: 373, rank: 3, pair: "무알콜 칵테일 + 샐러드", category: "etc", score: 95.6 },
      ],
    },
    rows: [
      { id: 304, rank: 4, pair: "화이트 와인 + 회", category: "wine", score: 95.7, votes: 12480, delta: "+3" },
      { id: 305, rank: 5, pair: "소주 + 닭볶음탕", category: "soju", score: 95.0, votes: 11302, delta: "-1" },
      { id: 306, rank: 6, pair: "IPA + 피자", category: "beer", score: 94.2, votes: 9820, delta: "+2" },
      { id: 307, rank: 7, pair: "청주 + 생선구이", category: "tradition", score: 93.8, votes: 9041, delta: "+1" },
      { id: 308, rank: 8, pair: "버번 위스키 + 바비큐", category: "whisky_spirit", score: 93.0, votes: 8710, delta: "-2" },
      { id: 309, rank: 9, pair: "사케 + 스시", category: "sake", score: 92.6, votes: 8444, delta: "+4" },
      { id: 310, rank: 10, pair: "칵테일 + 타코", category: "etc", score: 92.1, votes: 8111, delta: "-3" },
    ],
  },
  all: {
    podiumByCategory: {
      all: [
        { id: 401, rank: 1, pair: "소주 + 삼겹살", category: "soju", score: 99.4 },
        { id: 402, rank: 2, pair: "막걸리 + 해물파전", category: "tradition", score: 99.1 },
        { id: 403, rank: 3, pair: "레드 와인 + 스테이크", category: "wine", score: 98.8, thumbVariant: "bottle" },
      ],
      soju: [
        { id: 411, rank: 1, pair: "소주 + 삼겹살", category: "soju", score: 99.4 },
        { id: 412, rank: 2, pair: "소주 + 회", category: "soju", score: 98.7 },
        { id: 413, rank: 3, pair: "소주 + 곱창", category: "soju", score: 98.2 },
      ],
      wine: [
        { id: 421, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 98.8, thumbVariant: "bottle" },
        { id: 422, rank: 2, pair: "화이트 와인 + 치즈", category: "wine", score: 98.1, thumbVariant: "bottle" },
        { id: 423, rank: 3, pair: "샴페인 + 굴", category: "wine", score: 97.8, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 431, rank: 1, pair: "라거 맥주 + 치킨", category: "beer", score: 98.1 },
        { id: 432, rank: 2, pair: "IPA + 버거", category: "beer", score: 97.6 },
        { id: 433, rank: 3, pair: "흑맥주 + 피자", category: "beer", score: 97.0 },
      ],
      whisky_spirit: [
        { id: 441, rank: 1, pair: "위스키 + 다크초콜릿", category: "whisky_spirit", score: 98.3 },
        { id: 442, rank: 2, pair: "버번 위스키 + 바비큐", category: "whisky_spirit", score: 97.9 },
        { id: 443, rank: 3, pair: "하이볼 + 나초", category: "whisky_spirit", score: 97.4 },
      ],
      tradition: [
        { id: 451, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 99.1 },
        { id: 452, rank: 2, pair: "청주 + 모둠전", category: "tradition", score: 98.5 },
        { id: 453, rank: 3, pair: "약주 + 수육", category: "tradition", score: 97.9 },
      ],
      sake: [
        { id: 461, rank: 1, pair: "사케 + 사시미", category: "sake", score: 97.6 },
        { id: 462, rank: 2, pair: "사케 + 스시", category: "sake", score: 97.1 },
        { id: 463, rank: 3, pair: "사케 + 가라아게", category: "sake", score: 96.7 },
      ],
      etc: [
        { id: 471, rank: 1, pair: "칵테일 + 타코", category: "etc", score: 97.3 },
        { id: 472, rank: 2, pair: "하드셀처 + 나초", category: "etc", score: 96.9 },
        { id: 473, rank: 3, pair: "무알콜 칵테일 + 샐러드", category: "etc", score: 96.5 },
      ],
    },
    rows: [
      { id: 404, rank: 4, pair: "위스키 + 다크초콜릿", category: "whisky_spirit", score: 98.1, votes: 62510, delta: "+2" },
      { id: 405, rank: 5, pair: "IPA + 버거", category: "beer", score: 97.6, votes: 58922, delta: "+1" },
      { id: 406, rank: 6, pair: "화이트 와인 + 치즈", category: "wine", score: 97.0, votes: 55201, delta: "-2" },
      { id: 407, rank: 7, pair: "소주 + 회", category: "soju", score: 96.5, votes: 52418, delta: "+3" },
      { id: 408, rank: 8, pair: "청주 + 모둠전", category: "tradition", score: 95.9, votes: 50110, delta: "-1" },
      { id: 409, rank: 9, pair: "사케 + 사시미", category: "sake", score: 95.4, votes: 48102, delta: "+5" },
      { id: 410, rank: 10, pair: "칵테일 + 타코", category: "etc", score: 94.8, votes: 46339, delta: "-4" },
    ],
  },
}

const feedPosts: FeedPost[] = [
  {
    id: 1001,
    authorId: 2003,
    authorName: "서연",
    title: "소주 + 삼겹살 조합, 깔끔하게 정리해봤어요",
    body: "집에서 해먹을 때는 기름기 있는 부위일수록 도수/탄산 선택이 달라지더라고요. 저만의 기준 공유합니다.",
    createdAt: "2026-05-01T09:12:00+09:00",
    likeCount: 320,
    commentCount: 28,
    popularityScore: 402,
    profile: "30대 / 서울 / 소주 · 맥주 선호",
  },
  {
    id: 1002,
    authorId: 2001,
    authorName: "민지",
    title: "막걸리 + 해물파전은 왜 이렇게 잘 맞을까요?",
    body: "바삭한 전이랑 산미 있는 막걸리 조합이 너무 좋아요. 추천 막걸리 있으면 알려주세요.",
    createdAt: "2026-04-30T21:40:00+09:00",
    likeCount: 188,
    commentCount: 19,
    popularityScore: 260,
    profile: "20대 / 부산 / 전통주 입문",
  },
  {
    id: 1003,
    authorId: 2003,
    authorName: "서연",
    title: "자유) 위스키 입문은 어떤 라인업이 좋아요?",
    body: "버번/스카치/아이리시 중에 입문 난이도 낮은 걸로 추천 부탁드려요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 96,
    commentCount: 34,
    popularityScore: 330,
    profile: "30대 / 경기 / 위스키 관심",
    isQna: true,
    answerCount: 7,
    answerPreview:
      "처음이면 하이볼로 접근 가능한 버번부터 추천해요. 달콤한 향이 익숙해서 부담이 적습니다.",
  },
  {
    id: 1004,
    authorId: 2004,
    authorName: "지훈",
    title: "자유) 사케는 어떤 음식이랑 제일 무난해요?",
    body: "사시미 말고도 어울리는 메뉴가 궁금해요. 집에서 간단히 먹을 수 있는 걸로요!",
    createdAt: "2026-04-29T18:05:00+09:00",
    likeCount: 84,
    commentCount: 21,
    popularityScore: 210,
    profile: "20대 / 인천 / 사케 입문",
    isQna: true,
    answerCount: 5,
    answerPreview:
      "가라아게/오뎅/명란처럼 짭짤한 안주가 무난해요. 차갑게 마시면 기름기도 잘 잡아줍니다.",
  },
  {
    id: 1005,
    authorId: 2001,
    authorName: "민지",
    title: "레드 와인 + 스테이크, 너무 클래식하지만 정답",
    body: "레어로 구웠을 때 탄닌이 기름을 잡아주는 느낌이 확실히 있어요. 소스는 과하지 않게!",
    createdAt: "2026-04-28T22:15:00+09:00",
    likeCount: 540,
    commentCount: 63,
    popularityScore: 720,
    profile: "30대 / 서울 / 와인 선호",
  },
  {
    id: 1006,
    authorId: 2002,
    authorName: "현우",
    title: "IPA + 버거 조합이 인기인 이유",
    body: "홉의 씁쓸함이 느끼함을 잡아주고 향이 치즈랑 잘 맞아요. 추천 IPA도 남겨요.",
    createdAt: "2026-04-27T20:33:00+09:00",
    likeCount: 410,
    commentCount: 40,
    popularityScore: 590,
    profile: "20대 / 대전 / 맥주 러버",
  },
  {
    id: 1007,
    authorId: 2101,
    authorName: "유나",
    title: "소주 + 족발, 생각보다 깔끔해요",
    body: "족발은 기름질 것 같지만 새우젓/마늘이랑 같이 먹으면 소주가 느끼함을 잘 잡아줘요.",
    createdAt: "2026-05-01T08:02:00+09:00",
    likeCount: 66,
    commentCount: 11,
    popularityScore: 120,
    profile: "20대 / 서울 / 소주 · 전통주",
  },
  {
    id: 1008,
    authorId: 2104,
    authorName: "수빈",
    title: "자유) 회에 화이트 와인 vs 사케, 뭐가 더 무난해요?",
    body: "둘 다 좋다는데 상황에 따라 추천이 갈릴 것 같아서요. 기준이 있나요?",
    createdAt: "2026-04-30T23:55:00+09:00",
    likeCount: 51,
    commentCount: 17,
    popularityScore: 160,
    profile: "30대 / 제주 / 와인 · 사케",
    isQna: true,
    answerCount: 3,
    answerPreview:
      "산뜻한 산미면 화이트 와인, 감칠맛 중심이면 사케가 무난해요. 간장/와사비 강도도 고려해보세요.",
  },
  {
    id: 1009,
    authorId: 2102,
    authorName: "도윤",
    title: "칵테일 + 타코는 왜 이렇게 잘 맞을까",
    body: "라임/시트러스 계열이 타코의 향신료랑 잘 붙는 느낌. 데킬라 베이스 추천!",
    createdAt: "2026-04-30T12:20:00+09:00",
    likeCount: 140,
    commentCount: 22,
    popularityScore: 310,
    profile: "30대 / 대구 / 위스키 · 칵테일",
  },
  {
    id: 1010,
    authorId: 2103,
    authorName: "지민",
    title: "라거 + 감자튀김, 결국 클래식",
    body: "짭짤함이랑 탄산/청량감 조합은 실패가 없네요. 소금 대신 시즈닝 바꿔도 좋고요.",
    createdAt: "2026-04-29T20:10:00+09:00",
    likeCount: 92,
    commentCount: 9,
    popularityScore: 180,
    profile: "20대 / 광주 / 맥주 · 페어링",
  },
]

const followedUsersMock: FollowUser[] = [
  { id: 2001, name: "민지", profile: "30대 / 서울 / 와인 선호", bio: "퇴근 후 와인 한 잔, 페어링 기록합니다." },
  { id: 2002, name: "현우", profile: "20대 / 부산 / 맥주 러버", bio: "수제맥주, 안주 조합 찾는 중." },
  { id: 2003, name: "서연", profile: "30대 / 경기 / 위스키 관심", bio: "하이볼 레시피랑 입문 위스키 정리해요." },
  { id: 2004, name: "지훈", profile: "20대 / 인천 / 사케 입문", bio: "사케·일식 페어링 위주로 올립니다." },
]

export default function Community() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [feedFilter, setFeedFilter] = useState<FeedFilter>("review")
  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(
    () => new Set(followedUsersMock.map((user) => user.id)),
  )
  const [hasReviewFabScrolled, setHasReviewFabScrolled] = useState(false)
  const [isReviewWriteVisible, setIsReviewWriteVisible] = useState(false)
  const [likedById, setLikedById] = useState<Record<number, boolean>>({})
  const [bookmarkListById, setBookmarkListById] = useState<Record<number, string | null>>({})
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(
    null,
  )

  const topTab = normalizeTopTab(searchParams.get("top")) ?? "feed"
  const rankingPeriod = normalizeRankingPeriod(searchParams.get("period")) ?? "weekly"
  const rankingCategory = normalizeRankingCategory(searchParams.get("cat")) ?? "all"

  const bookmarkLists = [
    { id: "default", label: "기본 북마크" },
    { id: "wine", label: "와인 페어링" },
    { id: "whisky", label: "위스키 페어링" },
  ] as const

  const toggleFollowUser = (userId: number) => {
    setFollowedUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const posts = useMemo(() => {
    const copy = [...feedPosts]

    if (feedFilter === "review") {
      return copy
        .filter((post) => !post.isQna)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    if (feedFilter === "free") {
      return copy
        .filter((post) => post.isQna)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    if (feedFilter === "popular") {
      return copy.sort((a, b) => b.popularityScore - a.popularityScore)
    }

    if (feedFilter === "follow") {
      return copy
        .filter((post) => followedUserIds.has(post.authorId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return []
  }, [feedFilter, followedUserIds])
  const rankingData = rankingDataByPeriod[rankingPeriod]
  const rankingRows = useMemo(() => {
    return rankingCategory === "all"
      ? rankingData.rows
      : rankingData.rows.filter((row) => row.category === rankingCategory)
  }, [rankingCategory, rankingData.rows])

  const rankingPodium = rankingData.podiumByCategory[rankingCategory] ?? rankingData.podiumByCategory.all
  const podiumRankOrder: Array<1 | 2 | 3> = [2, 1, 3]

  const setQueryParam = (key: "top" | "period" | "cat", value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(key, value)
    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    const handleScroll = () => {
      if (topTab !== "feed" || feedFilter !== "review") {
        setIsReviewWriteVisible(false)
        return
      }

      setHasReviewFabScrolled(true)
      const nextVisible = window.scrollY > 0
      setIsReviewWriteVisible((prev) => (prev === nextVisible ? prev : nextVisible))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [feedFilter, topTab])

  const getLikeCount = (post: FeedPost) => post.likeCount + (likedById[post.id] ? 1 : 0)
  const getCommentCount = (post: FeedPost) => post.commentCount

  const toggleLike = (postId: number) => {
    setLikedById((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const openBookmarkPicker = (postId: number) => {
    const currentListId = bookmarkListById[postId]
    setBookmarkPicker({ postId, selectedListId: currentListId ?? bookmarkLists[0].id })
  }

  const confirmBookmark = () => {
    if (!bookmarkPicker) {
      return
    }

    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    setBookmarkPicker(null)
  }

  const removeBookmark = () => {
    if (!bookmarkPicker) {
      return
    }

    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    setBookmarkPicker(null)
  }

  const cancelBookmark = () => setBookmarkPicker(null)

  const goToComments = (postId: number) => {
    navigate(`/community/ranking/${postId}#comments`)
  }

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <header className="community_header">
        <div className="community_tabs" aria-label="커뮤니티 탭">
          <button
            className={topTab === "ranking" ? "is_active" : ""}
            onClick={() => setQueryParam("top", "ranking")}
            type="button"
          >
            랭킹
          </button>
          <button
            className={topTab === "feed" ? "is_active" : ""}
            onClick={() => setQueryParam("top", "feed")}
            type="button"
          >
            피드
          </button>
        </div>
        <button className="search_button" type="button" aria-label="검색">
          <span />
        </button>
      </header>

      {topTab === "ranking" ? (
        <section className="ranking_page" aria-label="랭킹 목록">
          <div className="ranking_periods">
            {rankingPeriods.map((item) => (
              <button
                className={rankingPeriod === item.key ? "is_active" : ""}
                key={item.key}
                type="button"
                onClick={() => setQueryParam("period", item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="ranking_tags">
            {rankingCategories.map((item) => (
              <button
                className={rankingCategory === item.key ? "is_active" : ""}
                key={item.key}
                type="button"
                onClick={() => setQueryParam("cat", item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <article className="ranking_podium">
            {podiumRankOrder.map((rank) => {
              const podium = rankingPodium.find((item) => item.rank === rank)
              if (!podium) {
                return null
              }

              const [drink, food] = podium.pair.split(" + ")

              return (
                <Link
                  key={podium.id}
                  className={
                    podium.rank === 1
                      ? "podium_card podium_first"
                      : podium.rank === 2
                        ? "podium_card podium_second"
                        : "podium_card podium_third"
                  }
                  to={`/community/ranking/${podium.id}`}
                >
                  <span className="podium_rank">{podium.rank}</span>
                  <div
                    className={
                      podium.thumbVariant === "bottle" ? "podium_thumb is_bottle" : "podium_thumb"
                    }
                  />
                  <strong>{drink}</strong>
                  <p>{food}</p>
                  <em>{podium.score.toFixed(1)}</em>
                </Link>
              )
            })}
          </article>

          <div className="ranking_list">
            {rankingRows.map((row) => (
              <Link className="ranking_row" key={row.id} to={`/community/ranking/${row.id}`}>
                <strong className="row_rank">{row.rank}</strong>
                <div className="row_images">
                  <span />
                  <span />
                </div>
                <div className="row_text">
                  <h3>{row.pair}</h3>
                  <p>
                    ★ {row.score} · {row.votes.toLocaleString()}표
                  </p>
                </div>
                <span className={row.delta.startsWith("-") ? "row_delta is_down" : "row_delta"}>
                  {row.delta}
                </span>
                <span className="row_category">
                  {rankingCategories.find((category) => category.key === row.category)?.label ?? "전체"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="feed_page" aria-label="커뮤니티 피드">
          <div className="feed_filter_row">
            {[
              { key: "review" as const, label: "후기" },
              { key: "free" as const, label: "자유" },
              { key: "popular" as const, label: "인기" },
              { key: "follow" as const, label: "팔로우" },
            ].map((item) => (
              <button
                className={feedFilter === item.key ? "is_active" : ""}
                key={item.key}
                onClick={() => {
                  if (item.key === "review") {
                    setHasReviewFabScrolled(false)
                    setIsReviewWriteVisible(false)
                  } else {
                    setHasReviewFabScrolled(false)
                    setIsReviewWriteVisible(false)
                  }
                  setFeedFilter(item.key)
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}
            <button className="feed_drop_button" type="button" aria-label="필터 확장">
              ▼
            </button>
          </div>

          <div className="feed_cards">
            {posts.map((post) => (
              <article className={post.isQna ? "feed_card is_free" : "feed_card"} key={post.id}>
                <header className="feed_card_header">
                  <div className="avatar" />
                  <div className="feed_card_header_info">
                    <h3>{post.authorName}</h3>
                    {post.profile ? <p>{post.profile}</p> : null}
                  </div>
                  <button
                    type="button"
                    className={
                      followedUserIds.has(post.authorId)
                        ? "follow_toggle_button is_following"
                        : "follow_toggle_button"
                    }
                    aria-label={
                      feedFilter === "follow"
                        ? "언팔로우"
                        : followedUserIds.has(post.authorId)
                          ? "언팔로잉"
                          : "팔로우"
                    }
                    onClick={() => toggleFollowUser(post.authorId)}
                  >
                    {feedFilter === "follow"
                      ? "언팔로우"
                      : followedUserIds.has(post.authorId)
                        ? "언팔로잉"
                        : "팔로우"}
                  </button>
                </header>

                {post.isQna ? (
                  <Link className="feed_text_link" to={`/community/ranking/${post.id}`}>
                    <div className="free_layout">
                      <strong>{post.title}</strong>
                      <p className="free_body">{post.body}</p>
                      {post.answerPreview ? <p className="free_answer">{post.answerPreview}</p> : null}
                      <span className="free_meta">답변 {post.answerCount ?? 0}</span>
                    </div>
                  </Link>
                ) : (
                  <>
                    <div className="feed_images">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div
                          className="feed_image"
                          key={index}
                          aria-label={`사진 ${index + 1}`}
                          role="img"
                        />
                      ))}
                    </div>
                    <Link className="feed_text_link" to={`/community/ranking/${post.id}`}>
                      <strong>{post.title}</strong>
                      <p className="feed_body">{post.body}</p>
                    </Link>
                  </>
                )}

                <div className="feed_actions">
                  <button
                    type="button"
                    className={likedById[post.id] ? "feed_action_button is_active" : "feed_action_button"}
                    aria-label={likedById[post.id] ? "좋아요 취소" : "좋아요"}
                    onClick={() => toggleLike(post.id)}
                  >
                    ♥ {getLikeCount(post)}
                  </button>

                  <button
                    type="button"
                    className="feed_action_button"
                    aria-label="댓글 보기"
                    onClick={() => goToComments(post.id)}
                  >
                    💬 {getCommentCount(post)}
                  </button>

                  <button type="button" className="feed_action_button" aria-label="공유">
                    ↗
                  </button>

                  <button
                    type="button"
                    className={bookmarkListById[post.id] ? "feed_action_button is_active" : "feed_action_button"}
                    aria-label={bookmarkListById[post.id] ? "북마크 변경" : "북마크"}
                    onClick={() => openBookmarkPicker(post.id)}
                  >
                    🔖
                  </button>
                </div>
              </article>
            ))}
          </div>

          {bookmarkPicker ? (
            <div className="bookmark_modal_backdrop" role="presentation" onClick={cancelBookmark}>
              <div
                className="bookmark_modal"
                role="dialog"
                aria-modal="true"
                aria-label="북마크 리스트 선택"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="bookmark_modal_title">
                  {bookmarkListById[bookmarkPicker.postId] ? "북마크를 어디로 옮길까요?" : "어느 리스트에 저장할까요?"}
                </p>

                <div className="bookmark_list_picker" role="radiogroup" aria-label="북마크 리스트">
                  {bookmarkLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      className={
                        bookmarkPicker.selectedListId === list.id
                          ? "bookmark_list_item is_active"
                          : "bookmark_list_item"
                      }
                      role="radio"
                      aria-checked={bookmarkPicker.selectedListId === list.id}
                      onClick={() => setBookmarkPicker({ ...bookmarkPicker, selectedListId: list.id })}
                    >
                      {list.label}
                    </button>
                  ))}
                </div>

                <div className="bookmark_modal_actions">
                  {bookmarkListById[bookmarkPicker.postId] ? (
                    <button type="button" className="bookmark_modal_button" onClick={removeBookmark}>
                      해제
                    </button>
                  ) : (
                    <button type="button" className="bookmark_modal_button" onClick={cancelBookmark}>
                      취소
                    </button>
                  )}
                  <button
                    type="button"
                    className="bookmark_modal_button is_primary"
                    onClick={confirmBookmark}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {feedFilter === "review" ? (
            <button
              type="button"
              aria-label="후기 작성"
              className={
                hasReviewFabScrolled && isReviewWriteVisible ? "review_write_fab is_visible" : "review_write_fab"
              }
            >
              +
            </button>
          ) : null}
        </section>
      )}
    </section>
  )
}
