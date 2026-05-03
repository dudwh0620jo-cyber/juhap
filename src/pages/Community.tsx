import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

const extractPairingTitle = (title: string) => {
  const match = title.match(/([^\n+]{2,}?)\s*\+\s*([^\n+]{2,}?)(?=[,.\n]|$)/)
  if (!match) {
    return title
  }
  const left = match[1].trim()
  const right = match[2].trim()
  return `${left} + ${right}`
}

const pairingReviewGrades = ["뉴비 맛잘알", "찐조합러", "미식 탐험가", "페어링 고수", "조합 장인"] as const

type GradeTier = 1 | 2 | 3 | 4 | 5

const userGradesByAuthorId: Record<
  number,
  { alcoholReviewTier: GradeTier; pairingReviewTier: GradeTier }
> = {
  2001: { alcoholReviewTier: 3, pairingReviewTier: 2 },
  2002: { alcoholReviewTier: 2, pairingReviewTier: 3 },
  2003: { alcoholReviewTier: 4, pairingReviewTier: 4 },
  2004: { alcoholReviewTier: 1, pairingReviewTier: 2 },
  2019: { alcoholReviewTier: 3, pairingReviewTier: 3 },
  2025: { alcoholReviewTier: 2, pairingReviewTier: 2 },
  2101: { alcoholReviewTier: 2, pairingReviewTier: 1 },
  2102: { alcoholReviewTier: 1, pairingReviewTier: 2 },
  2103: { alcoholReviewTier: 1, pairingReviewTier: 2 },
  2104: { alcoholReviewTier: 3, pairingReviewTier: 3 },
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
  votes?: number
  thumbVariant?: "default" | "bottle"
}

const podiumVotesById: Record<number, number> = {
  101: 8122,
  102: 8494,
  103: 8494,
}

const getPodiumVotes = (podium: RankingPodium) => {
  const explicitVotes = podium.votes ?? podiumVotesById[podium.id]
  if (typeof explicitVotes === "number" && Number.isFinite(explicitVotes)) {
    return Math.max(0, Math.round(explicitVotes))
  }

  const base = 5200
  const noise = (podium.id * 37 + podium.rank * 191) % 3600
  return base + noise
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
  searchTags?: string[]
  drinkType?: string
  categories?: string[]
  detailCategories?: string[]
  features?: Array<"부드러운" | "무거운" | "가벼운" | "톡쏘는" | "오크향" | "과일향">
  foods?: string[]
}

type FollowUser = {
  id: number
  name: string
  profile: string
  bio: string
}

type PopupChipGroup = {
  title: string
  chips: string[]
}

const COMMUNITY_SEARCH_RECENT_KEY = "community_search_recent_terms"
const COMMUNITY_FOLLOWED_USERS_KEY = "community_followed_user_ids"
const MAX_RECENT_TERMS = 10

const popupCategoryByDrinkType: Record<string, string[]> = {
  소주: ["증류주", "하이볼"],
  맥주: ["라거/필스너", "IPA", "크래프트"],
  와인: ["레드", "화이트", "스파클링"],
  위스키: ["하이볼", "증류주"],
  전통주: ["막걸리"],
  사케: ["사케준마이"],
  기타: ["칵테일", "논알콜"],
}

const popupDetailByCategory: Record<string, string[]> = {
  "라거/필스너": ["클래식", "드라이"],
  IPA: ["웨스트코스트", "뉴잉글랜드"],
  크래프트: ["세션", "임페리얼"],
  레드: ["오크숙성", "프루티"],
  화이트: ["시트러스", "트로피컬"],
  스파클링: ["브뤼", "스위트"],
  증류주: ["싱글몰트", "블렌디드", "버번"],
  하이볼: ["버번", "블렌디드"],
  막걸리: ["비살균", "살균"],
  사케준마이: ["준마이", "긴죠"],
  칵테일: ["시트러스", "트로피컬"],
  논알콜: ["제로", "로우알콜"],
}

const popupFeaturesByDetail: Record<string, Array<"부드러운" | "무거운" | "가벼운" | "톡쏘는" | "오크향" | "과일향">> = {
  클래식: ["가벼운", "톡쏘는"],
  드라이: ["가벼운"],
  웨스트코스트: ["톡쏘는", "무거운"],
  뉴잉글랜드: ["부드러운", "과일향"],
  세션: ["가벼운", "톡쏘는"],
  임페리얼: ["무거운"],
  오크숙성: ["무거운", "오크향"],
  프루티: ["가벼운", "과일향"],
  시트러스: ["톡쏘는", "과일향"],
  트로피컬: ["과일향", "가벼운"],
  브뤼: ["톡쏘는", "가벼운"],
  스위트: ["부드러운", "과일향"],
  싱글몰트: ["무거운", "오크향", "부드러운"],
  블렌디드: ["부드러운", "무거운"],
  버번: ["부드러운", "오크향", "무거운"],
  비살균: ["부드러운", "가벼운"],
  살균: ["가벼운"],
  준마이: ["부드러운", "가벼운"],
  긴죠: ["과일향", "가벼운"],
  제로: ["가벼운", "톡쏘는"],
  로우알콜: ["가벼운"],
}

const normalizeSearchText = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim()

const includesNormalized = (value: string, query: string) => {
  const normalizedValue = normalizeSearchText(value)
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return true
  }
  return normalizedValue.includes(normalizedQuery)
}

const createRankingFeatureTags = (category: RankingCategory, pairing: string) => {
  const tags: string[] = []
  const normalized = normalizeSearchText(pairing)

  if (category === "beer") {
    tags.push("가벼운", "톡쏘는")
  } else if (category === "soju") {
    tags.push("가벼운", "톡쏘는")
  } else if (category === "wine") {
    tags.push("무거운", "과일향")
    if (normalized.includes("스테이크") || normalized.includes("치즈")) {
      tags.push("오크향")
    }
  } else if (category === "whisky_spirit") {
    tags.push("무거운", "오크향", "부드러운")
  } else if (category === "tradition") {
    tags.push("부드러운", "가벼운")
  } else if (category === "sake") {
    tags.push("부드러운", "가벼운")
  } else {
    tags.push("과일향", "톡쏘는")
  }

  return tags
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
        { id: 101, rank: 1, pair: "진로 이즈백 + 삼겹살", category: "soju", score: 4.7, votes: 8122 },
        { id: 102, rank: 2, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 8494 },
        { id: 103, rank: 3, pair: "레드 와인 + 스테이크", category: "wine", score: 4.8, votes: 8494, thumbVariant: "bottle" },
      ],
      soju: [
        { id: 111, rank: 1, pair: "진로 이즈백 + 삼겹살", category: "soju", score: 4.7, votes: 8122 },
        { id: 112, rank: 2, pair: "참이슬 + 제육볶음", category: "soju", score: 4.6, votes: 6438 },
        { id: 113, rank: 3, pair: "처음처럼 + 곱창", category: "soju", score: 4.5, votes: 5981 },
      ],
      wine: [
        { id: 121, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 4.8, votes: 8494, thumbVariant: "bottle" },
        { id: 122, rank: 2, pair: "샴페인 + 굴", category: "wine", score: 91.3, votes: 4218, thumbVariant: "bottle" },
        { id: 123, rank: 3, pair: "화이트 와인 + 치즈", category: "wine", score: 4.7, votes: 4021, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 131, rank: 1, pair: "카스 맥주 + 치킨", category: "beer", score: 4.7, votes: 7621 },
        { id: 132, rank: 2, pair: "테라 맥주 + 떡볶이", category: "beer", score: 4.6, votes: 3891 },
        { id: 133, rank: 3, pair: "IPA + 버거", category: "beer", score: 4.5, votes: 3422 },
      ],
      whisky_spirit: [
        { id: 141, rank: 1, pair: "발렌타인 + 다크초콜릿", category: "whisky_spirit", score: 4.6, votes: 3214 },
        { id: 142, rank: 2, pair: "하이볼 + 나초", category: "whisky_spirit", score: 4.5, votes: 2981 },
        { id: 143, rank: 3, pair: "진 + 토닉 + 올리브", category: "whisky_spirit", score: 4.4, votes: 2650 },
      ],
      tradition: [
        { id: 151, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 8494 },
        { id: 152, rank: 2, pair: "화요 25 + 회무침", category: "tradition", score: 4.7, votes: 5432 },
        { id: 153, rank: 3, pair: "청주 + 모둠전", category: "tradition", score: 4.6, votes: 4108 },
      ],
      sake: [
        { id: 161, rank: 1, pair: "사케 + 사시미", category: "sake", score: 4.6, votes: 3328 },
        { id: 162, rank: 2, pair: "사케 + 가라아게", category: "sake", score: 4.5, votes: 2890 },
        { id: 163, rank: 3, pair: "사케 + 오뎅", category: "sake", score: 4.4, votes: 2542 },
      ],
      etc: [
        { id: 171, rank: 1, pair: "칵테일 + 타코", category: "etc", score: 4.6, votes: 3011 },
        { id: 172, rank: 2, pair: "하드셀처 + 나초", category: "etc", score: 4.5, votes: 2740 },
        { id: 173, rank: 3, pair: "무알콜 칵테일 + 샐러드", category: "etc", score: 4.4, votes: 2405 },
      ],
    },
    rows: [
      { id: 104, rank: 4, pair: "카스 맥주 + 치킨", category: "beer", score: 4.7, votes: 7621, delta: "-1" },
      { id: 105, rank: 5, pair: "화요 25 + 회무침", category: "tradition", score: 4.7, votes: 5432, delta: "+5" },
      { id: 106, rank: 6, pair: "샴페인 + 굴", category: "wine", score: 91.3, votes: 4218, delta: "+2" },
      { id: 107, rank: 7, pair: "테라 맥주 + 떡볶이", category: "beer", score: 4.6, votes: 3891, delta: "-2" },
      { id: 108, rank: 8, pair: "발렌타인 + 다크초콜릿", category: "whisky_spirit", score: 4.6, votes: 3214, delta: "–" },
      { id: 109, rank: 9, pair: "사케 + 사시미", category: "sake", score: 4.6, votes: 3328, delta: "+1" },
      { id: 110, rank: 10, pair: "진로 이즈백 + 삼겹살", category: "soju", score: 4.7, votes: 8122, delta: "+3" },
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
    title: "소주 + 삼겹살",
    body: "집에서 해먹을 때는 기름기 있는 부위일수록 도수/탄산 선택이 달라지더라고요. 저만의 기준 공유합니다.",
    createdAt: "2026-05-01T09:12:00+09:00",
    likeCount: 320,
    commentCount: 28,
    popularityScore: 402,
    profile: "30대 / 서울 / 소주 · 맥주 선호",
    searchTags: ["소주", "증류주", "삼겹살", "부드러운", "무거운", "오크향"],
    drinkType: "소주",
    categories: ["증류주"],
    detailCategories: ["버번"],
    features: ["부드러운", "무거운", "오크향"],
    foods: ["삼겹살"],
  },
  {
    id: 1002,
    authorId: 2001,
    authorName: "민지",
    title: "막걸리 + 해물파전",
    body: "바삭한 전이랑 산미 있는 막걸리 조합이 너무 좋아요. 추천 막걸리 있으면 알려주세요.",
    createdAt: "2026-04-30T21:40:00+09:00",
    likeCount: 188,
    commentCount: 19,
    popularityScore: 260,
    profile: "20대 / 부산 / 전통주 입문",
    searchTags: ["전통주", "막걸리", "해물파전", "부드러운", "가벼운"],
    drinkType: "전통주",
    categories: ["막걸리"],
    detailCategories: ["비살균"],
    features: ["부드러운", "가벼운"],
    foods: ["해물파전"],
  },
  {
    id: 1003,
    authorId: 2003,
    authorName: "서연",
    title: "첫 위스키 입문 후기 공유해요",
    body: "처음은 버번 하이볼로 시작했는데 생각보다 부담 없고 달달해서 좋았어요. 다음은 스카치도 도전해보려구요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 96,
    commentCount: 34,
    popularityScore: 330,
    profile: "30대 / 경기 / 위스키 관심",
    isQna: true,
    searchTags: ["위스키", "하이볼", "버번", "부드러운", "무거운", "오크향"],
    drinkType: "위스키",
    categories: ["하이볼"],
    detailCategories: ["버번"],
    features: ["부드러운", "무거운", "오크향"],
    foods: ["치즈"],
  },
  {
    id: 1004,
    authorId: 2004,
    authorName: "지훈",
    title: "사케에 잘 맞는 집안주 몇 개 추천",
    body: "사시미 없을 때는 가라아게/오뎅/명란구이 조합이 제일 무난했어요. 차갑게 마시면 기름기도 잘 잡히더라구요.",
    createdAt: "2026-04-29T18:05:00+09:00",
    likeCount: 84,
    commentCount: 21,
    popularityScore: 210,
    profile: "20대 / 인천 / 사케 입문",
    isQna: true,
    searchTags: ["사케", "사케준마이", "가라아게", "부드러운", "가벼운", "오뎅", "명란구이"],
    drinkType: "사케",
    categories: ["사케준마이"],
    detailCategories: ["준마이"],
    features: ["부드러운", "가벼운"],
    foods: ["가라아게", "오뎅", "명란구이"],
  },
  {
    id: 1005,
    authorId: 2001,
    authorName: "민지",
    title: "레드 와인 + 스테이크",
    body: "레어로 구웠을 때 탄닌이 기름을 잡아주는 느낌이 확실히 있어요. 소스는 과하지 않게!",
    createdAt: "2026-04-28T22:15:00+09:00",
    likeCount: 540,
    commentCount: 63,
    popularityScore: 720,
    profile: "30대 / 서울 / 와인 선호",
    searchTags: ["와인", "레드", "스테이크", "오크숙성", "무거운", "오크향"],
    drinkType: "와인",
    categories: ["레드"],
    detailCategories: ["오크숙성"],
    features: ["무거운", "오크향"],
    foods: ["스테이크"],
  },
  {
    id: 1006,
    authorId: 2002,
    authorName: "현우",
    title: "IPA + 햄버거",
    body: "홉의 씁쓸함이 느끼함을 잡아주고 향이 치즈랑 잘 맞아요. 추천 IPA도 남겨요.",
    createdAt: "2026-04-27T20:33:00+09:00",
    likeCount: 410,
    commentCount: 40,
    popularityScore: 590,
    profile: "20대 / 대전 / 맥주 러버",
    searchTags: ["맥주", "IPA", "크래프트", "뉴잉글랜드", "부드러운", "과일향", "햄버거", "치즈"],
    drinkType: "맥주",
    categories: ["IPA", "크래프트"],
    detailCategories: ["뉴잉글랜드"],
    features: ["부드러운", "과일향"],
    foods: ["햄버거", "치즈"],
  },
  {
    id: 1007,
    authorId: 2101,
    authorName: "유나",
    title: "소주 + 족발",
    body: "족발은 기름질 것 같지만 새우젓/마늘이랑 같이 먹으면 소주가 느끼함을 잘 잡아줘요.",
    createdAt: "2026-05-01T08:02:00+09:00",
    likeCount: 66,
    commentCount: 11,
    popularityScore: 120,
    profile: "20대 / 서울 / 소주 · 전통주",
    searchTags: ["소주", "증류주", "족발", "부드러운", "무거운"],
    drinkType: "소주",
    categories: ["증류주"],
    detailCategories: ["블렌디드"],
    features: ["부드러운", "무거운"],
    foods: ["족발"],
  },
  {
    id: 1008,
    authorId: 2104,
    authorName: "수빈",
    title: "회 먹을 때는 전 사케파예요",
    body: "간장/와사비가 강한 날엔 사케가 감칠맛이랑 잘 맞고, 산뜻하게 먹고 싶으면 화이트 와인도 좋아요. 저는 보통 사케로 갑니다.",
    createdAt: "2026-04-30T23:55:00+09:00",
    likeCount: 51,
    commentCount: 17,
    popularityScore: 160,
    profile: "30대 / 제주 / 와인 · 사케",
    isQna: true,
    searchTags: ["사케", "사케준마이", "회", "부드러운", "가벼운"],
    drinkType: "사케",
    categories: ["사케준마이"],
    detailCategories: ["긴죠"],
    features: ["과일향", "가벼운"],
    foods: ["회"],
  },
  {
    id: 1009,
    authorId: 2102,
    authorName: "도윤",
    title: "칵테일 + 타코",
    body: "라임/시트러스 계열이 타코의 향신료랑 잘 붙는 느낌. 데킬라 베이스 추천!",
    createdAt: "2026-04-30T12:20:00+09:00",
    likeCount: 140,
    commentCount: 22,
    popularityScore: 310,
    profile: "30대 / 대구 / 위스키 · 칵테일",
    searchTags: ["기타", "칵테일", "시트러스", "톡쏘는", "과일향", "타코"],
    drinkType: "기타",
    categories: ["칵테일"],
    detailCategories: ["시트러스"],
    features: ["톡쏘는", "과일향"],
    foods: ["타코"],
  },
  {
    id: 1010,
    authorId: 2103,
    authorName: "지민",
    title: "라거 + 감자튀김",
    body: "짭짤함이랑 탄산/청량감 조합은 실패가 없네요. 소금 대신 시즈닝 바꿔도 좋고요.",
    createdAt: "2026-04-29T20:10:00+09:00",
    likeCount: 92,
    commentCount: 9,
    popularityScore: 180,
    profile: "20대 / 광주 / 맥주 · 페어링",
    searchTags: ["맥주", "라거/필스너", "드라이", "가벼운", "감자튀김"],
    drinkType: "맥주",
    categories: ["라거/필스너"],
    detailCategories: ["드라이"],
    features: ["가벼운"],
    foods: ["감자튀김"],
  },
  {
    id: 1011,
    authorId: 2019,
    authorName: "연훈",
    title: "버번 + 다크초콜릿",
    body: "달달한 버번이랑 쌉싸름한 다크초콜릿 같이 먹으니까 밸런스가 딱이었어요. 늦은 밤에 한 잔 하기 좋네요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 97,
    commentCount: 34,
    popularityScore: 330,
    profile: "30대 / 경기 / 위스키 관심",
    isQna: true,
    searchTags: ["위스키", "증류주", "싱글몰트", "무거운", "오크향", "부드러운", "다크초콜릿"],
    drinkType: "위스키",
    categories: ["증류주"],
    detailCategories: ["싱글몰트"],
    features: ["무거운", "오크향", "부드러운"],
    foods: ["다크초콜릿"],
  },
  {
    id: 1012,
    authorId: 2025,
    authorName: "수연",
    title: "주말 홈파티 페어링 기록",
    body: "라거 + 치킨은 역시 실패가 없고, 막걸리 + 해물파전도 반응이 좋았어요. 다음엔 와인 쪽도 준비해보려구요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 98,
    commentCount: 34,
    popularityScore: 330,
    profile: "30대 / 경기 / 위스키 관심",
    isQna: true,
    searchTags: ["맥주", "라거/필스너", "치킨", "가벼운", "톡쏘는", "전통주", "막걸리", "해물파전"],
    drinkType: "맥주",
    categories: ["라거/필스너"],
    detailCategories: ["클래식"],
    features: ["가벼운", "톡쏘는"],
    foods: ["치킨", "해물파전"],
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
    () => {
      try {
        const raw = window.localStorage.getItem(COMMUNITY_FOLLOWED_USERS_KEY)
        if (!raw) {
          return new Set(followedUsersMock.map((user) => user.id))
        }
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) {
          return new Set(followedUsersMock.map((user) => user.id))
        }
        const ids = parsed.filter((value): value is number => typeof value === "number" && Number.isFinite(value))
        return new Set(ids)
      } catch {
        return new Set(followedUsersMock.map((user) => user.id))
      }
    },
  )
  const [hasWriteFabScrolled, setHasWriteFabScrolled] = useState(false)
  const [isWriteFabVisible, setIsWriteFabVisible] = useState(false)
  const [likedById, setLikedById] = useState<Record<number, boolean>>({})
  const [bookmarkListById, setBookmarkListById] = useState<Record<number, string | null>>({})
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(
    null,
  )
  const [isFeedFilterPopupOpen, setIsFeedFilterPopupOpen] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [selectedDetailCategories, setSelectedDetailCategories] = useState<Set<string>>(() => new Set())
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => new Set())
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(() => new Set())
  const [feedSearchValue, setFeedSearchValue] = useState("")
  const [isFeedSearchConfirmed, setIsFeedSearchConfirmed] = useState(false)
  const feedSearchInputRef = useRef<HTMLInputElement | null>(null)
  const [expandedChipGroups, setExpandedChipGroups] = useState<Set<string>>(() => new Set())
  const [collapsibleChipGroups, setCollapsibleChipGroups] = useState<Set<string>>(() => new Set())
  const chipGroupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const [recentSearchTerms, setRecentSearchTerms] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(COMMUNITY_SEARCH_RECENT_KEY)
      if (!raw) {
        return []
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed.filter((term): term is string => typeof term === "string" && term.trim().length > 0)
    } catch {
      return []
    }
  })

  const topTab = normalizeTopTab(searchParams.get("top")) ?? "feed"
  const rankingPeriod = normalizeRankingPeriod(searchParams.get("period")) ?? "weekly"
  const rankingCategory = normalizeRankingCategory(searchParams.get("cat")) ?? "all"

  const feedFilterItems = [
    { key: "review" as const, label: "후기" },
    { key: "free" as const, label: "자유" },
    { key: "popular" as const, label: "인기" },
    { key: "follow" as const, label: "팔로우" },
  ]

  const _legacyPopupChipGroups: PopupChipGroup[] = [
    { title: "상황", chips: ["혼술", "데이트", "파티/모임", "홈파티", "기타"] },
    { title: "음식", chips: ["고기류", "튀김", "매운음식", "해산물", "가벼운 안주"] },
    { title: "스타일", chips: ["가볍게", "진하게", "분위기용", "가성비"] },
    { title: "주종", chips: ["소주", "맥주", "와인", "위스키", "전통주", "기타"] },
    { title: "카테고리", chips: ["럼", "진", "꼬냑", "위스키", "보드카", "데킬라", "브랜디"] },
    { title: "상세 카테고리", chips: ["싱글몰트", "그레인", "블렌디드", "블렌디드몰트"] },
    { title: "특징", chips: ["부드러운", "무거운", "가벼운", "톡쏘는", "오크향", "과일향"] },
  ]

  const availableCategories = useMemo(() => {
    if (!selectedDrinkType) {
      const merged = new Set<string>()
      for (const categories of Object.values(popupCategoryByDrinkType)) {
        for (const category of categories) {
          merged.add(category)
        }
      }
      return Array.from(merged)
    }
    return popupCategoryByDrinkType[selectedDrinkType] ?? []
  }, [selectedDrinkType])

  const availableDetailCategories = useMemo(() => {
    if (selectedCategories.size === 0) {
      return []
    }
    const merged = new Set<string>()
    for (const category of selectedCategories) {
      for (const detail of popupDetailByCategory[category] ?? []) {
        merged.add(detail)
      }
    }
    return Array.from(merged)
  }, [selectedCategories])

  const availableFeatures = useMemo(() => {
    if (selectedDetailCategories.size === 0) {
      return []
    }
    const merged = new Set<string>()
    for (const detail of selectedDetailCategories) {
      for (const feature of popupFeaturesByDetail[detail] ?? []) {
        merged.add(feature)
      }
    }
    return Array.from(merged)
  }, [selectedDetailCategories])

  useEffect(() => {
    const valid = new Set(availableDetailCategories)
    setSelectedDetailCategories((prev) => new Set(Array.from(prev).filter((item) => valid.has(item))))
  }, [availableDetailCategories])

  useEffect(() => {
    const valid = new Set(availableFeatures)
    setSelectedFeatures((prev) => new Set(Array.from(prev).filter((item) => valid.has(item))))
  }, [availableFeatures])

  const popupChipGroups: PopupChipGroup[] = useMemo(() => {
    const groups: PopupChipGroup[] = [
      { title: "주종", chips: Object.keys(popupCategoryByDrinkType) },
      { title: "카테고리", chips: availableCategories },
      { title: "상세카테고리", chips: availableDetailCategories },
      { title: "특징", chips: availableFeatures },
      {
        title: "음식",
        chips: [
          "치킨",
          "피자",
          "삼겹살",
          "회",
          "굴",
          "떡볶이",
          "파스타",
          "육회",
          "치즈",
          "족발",
          "해물파전",
          "스테이크",
          "햄버거",
          "감자튀김",
          "다크초콜릿",
          "타코",
          "가라아게",
          "오뎅",
          "명란구이",
        ],
      },
    ]

    return groups.filter((group) => group.title === "주종" || group.chips.length > 0)
  }, [availableCategories, availableDetailCategories, availableFeatures])

  void _legacyPopupChipGroups

  const filteredPopupChipGroups = useMemo(() => {
    const query = feedSearchValue.trim().toLowerCase()
    if (!isFeedSearchConfirmed || !query) {
      return popupChipGroups
    }

    const results: PopupChipGroup[] = []
    for (const group of popupChipGroups) {
      if (group.title.toLowerCase().includes(query)) {
        results.push(group)
        continue
      }

      const chips = group.chips.filter((chip) => chip.toLowerCase().includes(query))
      if (chips.length > 0) {
        results.push({ title: group.title, chips })
      }
    }

    return results
  }, [feedSearchValue, isFeedSearchConfirmed, popupChipGroups])

  const isPopupSearchNoResults =
    isFeedSearchConfirmed && feedSearchValue.trim() && filteredPopupChipGroups.length === 0

  const isCommunitySearchActive =
    Boolean(feedSearchValue.trim()) ||
    isFeedSearchConfirmed ||
    Boolean(selectedDrinkType) ||
    selectedCategories.size > 0 ||
    selectedDetailCategories.size > 0 ||
    selectedFeatures.size > 0 ||
    selectedFoods.size > 0

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
      try {
        window.localStorage.setItem(COMMUNITY_FOLLOWED_USERS_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // ignore storage errors
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

  const filteredPosts = useMemo(() => {
    if (!isCommunitySearchActive) {
      return posts
    }

    const query = feedSearchValue.trim()
    return posts.filter((post) => {
      const targets = [post.title, post.body, post.profile ?? "", ...(post.searchTags ?? [])]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches =
        !selectedDrinkType ||
        post.drinkType === selectedDrinkType ||
        (post.categories ?? []).some((item) => (popupCategoryByDrinkType[selectedDrinkType] ?? []).includes(item))
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        (post.detailCategories ?? []).some((item) => selectedDetailCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))

      return (
        queryMatches && drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    posts,
    selectedCategories,
    selectedDetailCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])

  const searchSuggestionTags = useMemo(() => {
    const query = feedSearchValue.trim()
    if (!query) {
      return []
    }

    const normalizedQuery = normalizeSearchText(query)
    const filterPostWithoutQuery = (post: FeedPost) => {
      const drinkTypeMatches =
        !selectedDrinkType ||
        post.drinkType === selectedDrinkType ||
        (post.categories ?? []).some((item) => (popupCategoryByDrinkType[selectedDrinkType] ?? []).includes(item))
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        (post.detailCategories ?? []).some((item) => selectedDetailCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))
      return drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
    }

    const candidates = new Map<string, number>()
    const bump = (tag: string, score: number) => {
      const trimmed = tag.trim()
      if (!trimmed) return
      candidates.set(trimmed, Math.max(candidates.get(trimmed) ?? 0, score))
    }

    for (const post of feedPosts) {
      const tagPool = [
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.detailCategories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ].filter(Boolean)

      const haystack = normalizeSearchText([post.title, post.body, ...tagPool].join(" "))
      const baseScore = haystack.includes(normalizedQuery) ? 3 : 0

      for (const tag of tagPool) {
        const normalizedTag = normalizeSearchText(tag)
        let score = baseScore
        if (normalizedTag.includes(normalizedQuery) || normalizedQuery.includes(normalizedTag)) {
          score += 5
        } else if (normalizedTag && normalizedQuery && (normalizedTag[0] === normalizedQuery[0])) {
          score += 1
        }
        bump(tag, score)
      }
    }

    const hasResultsForTag = (tag: string) => {
      for (const post of feedPosts) {
        if (!filterPostWithoutQuery(post)) continue
        const tagPool = [
          post.title,
          post.body,
          post.drinkType ?? "",
          ...(post.categories ?? []),
          ...(post.detailCategories ?? []),
          ...(post.features ?? []),
          ...(post.foods ?? []),
          ...(post.searchTags ?? []),
        ].filter(Boolean)

        if (includesNormalized(tagPool.join(" "), tag)) {
          return true
        }
      }
      return false
    }

    return Array.from(candidates.entries())
      .filter(([tag]) => hasResultsForTag(tag))
      .filter(([tag]) => {
        if (selectedDrinkType && tag === selectedDrinkType) return false
        if (selectedCategories.has(tag)) return false
        if (selectedDetailCategories.has(tag)) return false
        if (selectedFeatures.has(tag)) return false
        if (selectedFoods.has(tag)) return false
        return true
      })
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 8)
  }, [
    feedSearchValue,
    selectedCategories,
    selectedDetailCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])
  const rankingData = rankingDataByPeriod[rankingPeriod]
  const rankingRows = useMemo(() => {
    return rankingCategory === "all"
      ? rankingData.rows
      : rankingData.rows.filter((row) => row.category === rankingCategory)
  }, [rankingCategory, rankingData.rows])

  const filteredRankingRows = useMemo(() => {
    if (!isCommunitySearchActive) {
      return rankingRows
    }

    const query = feedSearchValue.trim()
    return rankingRows.filter((row) => {
      const categoryLabel = rankingCategories.find((category) => category.key === row.category)?.label ?? ""
      const featureTags = createRankingFeatureTags(row.category, row.pair)
      const targets = [row.pair, categoryLabel, ...featureTags]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches = !selectedDrinkType || includesNormalized(categoryLabel, selectedDrinkType)
      const categoryMatches =
        selectedCategories.size === 0 || Array.from(selectedCategories).some((item) => includesNormalized(targets.join(" "), item))
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        Array.from(selectedDetailCategories).some((item) => includesNormalized(targets.join(" "), item))
      const foodMatches =
        selectedFoods.size === 0 || Array.from(selectedFoods).some((item) => includesNormalized(row.pair, item))
      const featureMatches =
        selectedFeatures.size === 0 || featureTags.some((tag) => selectedFeatures.has(tag))

      return (
        queryMatches && drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    rankingRows,
    selectedCategories,
    selectedDetailCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])

  const rankingPodium = rankingData.podiumByCategory[rankingCategory] ?? rankingData.podiumByCategory.all
  const podiumRankOrder: Array<1 | 2 | 3> = [2, 1, 3]

  const filteredRankingPodium = useMemo(() => {
    if (!isCommunitySearchActive) {
      return rankingPodium
    }

    const query = feedSearchValue.trim()
    return rankingPodium.filter((podium) => {
      const categoryLabel = rankingCategories.find((category) => category.key === podium.category)?.label ?? ""
      const featureTags = createRankingFeatureTags(podium.category, podium.pair)
      const targets = [podium.pair, categoryLabel, ...featureTags]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches = !selectedDrinkType || includesNormalized(categoryLabel, selectedDrinkType)
      const categoryMatches =
        selectedCategories.size === 0 || Array.from(selectedCategories).some((item) => includesNormalized(targets.join(" "), item))
      const detailMatches =
        selectedDetailCategories.size === 0 ||
        Array.from(selectedDetailCategories).some((item) => includesNormalized(targets.join(" "), item))
      const foodMatches =
        selectedFoods.size === 0 || Array.from(selectedFoods).some((item) => includesNormalized(podium.pair, item))
      const featureMatches =
        selectedFeatures.size === 0 || featureTags.some((tag) => selectedFeatures.has(tag))

      return (
        queryMatches && drinkTypeMatches && categoryMatches && detailMatches && foodMatches && featureMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    rankingPodium,
    selectedCategories,
    selectedDetailCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])

  const isRankingNoResults = isCommunitySearchActive && filteredRankingRows.length === 0 && filteredRankingPodium.length === 0
  const isFeedNoResults = isCommunitySearchActive && filteredPosts.length === 0

  const setQueryParam = (key: "top" | "period" | "cat", value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(key, value)
    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    const handleScroll = () => {
      if (topTab !== "feed" || (feedFilter !== "review" && feedFilter !== "free")) {
        setIsWriteFabVisible(false)
        return
      }

      setHasWriteFabScrolled(true)
      const nextVisible = window.scrollY > 0
      setIsWriteFabVisible((prev) => (prev === nextVisible ? prev : nextVisible))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [feedFilter, topTab])

  useEffect(() => {
    if (!isFeedFilterPopupOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFeedFilterPopupOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFeedFilterPopupOpen])

  useEffect(() => {
    if (!isFeedFilterPopupOpen) {
      return
    }

    setIsFeedSearchConfirmed(false)
    window.setTimeout(() => feedSearchInputRef.current?.focus(), 0)
  }, [isFeedFilterPopupOpen])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        COMMUNITY_SEARCH_RECENT_KEY,
        JSON.stringify(recentSearchTerms.slice(0, MAX_RECENT_TERMS)),
      )
    } catch {
      // ignore storage errors
    }
  }, [recentSearchTerms])

  useEffect(() => {
    const next = new Set<string>()

    for (const group of filteredPopupChipGroups) {
      const el = chipGroupRefs.current.get(group.title)
      if (!el) {
        continue
      }
      if (el.scrollHeight > el.clientHeight + 1) {
        next.add(group.title)
      }
    }

    setCollapsibleChipGroups(next)
  }, [filteredPopupChipGroups, expandedChipGroups])

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
    const post = feedPosts.find((item) => item.id === postId)
    const pairingTitle = post?.title ? extractPairingTitle(post.title) : ""
    navigate(`/community/pairing/${postId}#comments`, {
      state: post
        ? {
            pairingTitle,
            authorId: post.authorId,
            authorName: post.authorName,
            profile: post.profile ?? "",
            source: "feed",
          }
        : undefined,
    })
  }

  const toggleDrinkType = (nextDrinkType: string) => {
    setSelectedDrinkType((prev) => (prev === nextDrinkType ? null : nextDrinkType))
    setSelectedCategories(new Set())
    setSelectedDetailCategories(new Set())
    setSelectedFeatures(new Set())
    setIsFeedSearchConfirmed(true)
  }

  const toggleCategory = (chip: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleDetailCategory = (chip: string) => {
    setSelectedDetailCategories((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFeature = (chip: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFood = (chip: string) => {
    setSelectedFoods((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const setChipGroupRef = useCallback((title: string) => {
    return (element: HTMLDivElement | null) => {
      chipGroupRefs.current.set(title, element)
    }
  }, [])

  const toggleChipGroupExpanded = (title: string) => {
    setExpandedChipGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const openFeedFilterPopup = () => setIsFeedFilterPopupOpen(true)

  const confirmFeedSearch = (term?: string) => {
    const query = (term ?? feedSearchValue).trim()
    if (!query) {
      return
    }

    setFeedSearchValue(query)
    setIsFeedSearchConfirmed(true)
    setRecentSearchTerms((prev) => {
      const normalized = query.toLowerCase()
      const next = [query, ...prev.filter((item) => item.toLowerCase() !== normalized)]
      return next.slice(0, MAX_RECENT_TERMS)
    })
    feedSearchInputRef.current?.blur()
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COMMUNITY_FOLLOWED_USERS_KEY)
      if (!raw) {
        window.localStorage.setItem(
          COMMUNITY_FOLLOWED_USERS_KEY,
          JSON.stringify(Array.from(followedUserIds)),
        )
      }
    } catch {
      // ignore storage errors
    }
  }, [followedUserIds])

  const changeFeedFilter = (nextFilter: FeedFilter) => {
    setHasWriteFabScrolled(false)
    setIsWriteFabVisible(false)
    setFeedFilter(nextFilter)
  }

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <header className="community_header">
        <h3 className="community_title">커뮤니티</h3>
        <button
          className="search_button"
          type="button"
          aria-label="검색 필터 열기"
          onClick={openFeedFilterPopup}
        >
          <span />
        </button>
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
      </header>

      {isFeedFilterPopupOpen ? (
        <div
          className="feed_filter_overlay"
          role="presentation"
          onClick={() => setIsFeedFilterPopupOpen(false)}
        >
          <div
            className="feed_filter_popup"
            role="dialog"
            aria-modal="true"
            aria-label="커뮤니티 검색"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="feed_filter_popup_top">
              
              <div className="feed_filter_search_shell" aria-label="커뮤니티 검색">
                <div className="feed_filter_search">
                  <span className="feed_filter_search_magnifier" aria-hidden="true" />
                  <input
                    ref={feedSearchInputRef}
                    className="feed_filter_search_input"
                    value={feedSearchValue}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setFeedSearchValue(nextValue)
                      setIsFeedSearchConfirmed(Boolean(nextValue.trim()))
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") {
                        return
                      }
                      event.preventDefault()
                      confirmFeedSearch()
                    }}
                    placeholder="조합, 주류, 안주 검색"
                    aria-label="커뮤니티 검색어 입력"
                  />
                  {feedSearchValue.trim() ? (
                    <button
                      type="button"
                      className="feed_filter_search_clear"
                      aria-label="검색어 지우기"
                      onClick={() => {
                        setFeedSearchValue("")
                        setIsFeedSearchConfirmed(false)
                        window.setTimeout(() => feedSearchInputRef.current?.focus(), 0)
                      }}
                    />
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                className="feed_filter_close_button"
                aria-label="취소"
                onClick={() => setIsFeedFilterPopupOpen(false)}
              >
                취소
              </button>
            </div>

            {isPopupSearchNoResults ? (
              <p className="feed_filter_no_results" role="status">
                검색 결과가 없어요
              </p>
            ) : null}

            <div className="feed_filter_popup_body">
              {filteredPopupChipGroups.map((group) => (
                <div className="feed_filter_group" key={group.title}>
                  <div className="feed_filter_group_header">
                    <h3 className="feed_filter_group_title">{group.title}</h3>
                    {collapsibleChipGroups.has(group.title) || expandedChipGroups.has(group.title) ? (
                      <button
                        type="button"
                        className={
                          expandedChipGroups.has(group.title)
                            ? "feed_filter_group_toggle is_expanded"
                            : "feed_filter_group_toggle"
                        }
                        aria-label={expandedChipGroups.has(group.title) ? "접기" : "펼치기"}
                        onClick={() => toggleChipGroupExpanded(group.title)}
                      />
                    ) : null}
                  </div>
                  <div
                    ref={setChipGroupRef(group.title)}
                    className={
                      expandedChipGroups.has(group.title)
                        ? "feed_filter_group_chips"
                        : "feed_filter_group_chips is_collapsed"
                    }
                  >
                    {group.chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className={
                          group.title === "주종"
                            ? selectedDrinkType === chip
                              ? "feed_filter_chip is_active"
                              : "feed_filter_chip"
                            : group.title === "카테고리"
                              ? selectedCategories.has(chip)
                                ? "feed_filter_chip is_active"
                                : "feed_filter_chip"
                              : group.title === "상세카테고리"
                                ? selectedDetailCategories.has(chip)
                                  ? "feed_filter_chip is_active"
                                  : "feed_filter_chip"
                                : group.title === "특징"
                                  ? selectedFeatures.has(chip)
                                    ? "feed_filter_chip is_active"
                                    : "feed_filter_chip"
                                  : group.title === "음식"
                                    ? selectedFoods.has(chip)
                                      ? "feed_filter_chip is_active"
                                      : "feed_filter_chip"
                                    : "feed_filter_chip"
                        }
                        onClick={() => {
                          if (group.title === "주종") {
                            toggleDrinkType(chip)
                            return
                          }
                          if (group.title === "카테고리") {
                            toggleCategory(chip)
                            return
                          }
                          if (group.title === "상세카테고리") {
                            toggleDetailCategory(chip)
                            return
                          }
                          if (group.title === "특징") {
                            toggleFeature(chip)
                            return
                          }
                          if (group.title === "음식") {
                            toggleFood(chip)
                          }
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {recentSearchTerms.length > 0 ? (
                <div className="feed_filter_group">
                  <h3 className="feed_filter_group_title">최근검색</h3>
                  <div className="feed_filter_group_chips">
                    {recentSearchTerms.map((term) => (
                      <div className="recent_search_item" key={term}>
                        <button
                          type="button"
                          className="feed_filter_chip"
                          onClick={() => confirmFeedSearch(term)}
                        >
                          {term}
                        </button>
                        <button
                          type="button"
                          className="recent_search_delete"
                          aria-label="최근검색 삭제"
                          onClick={() => {
                            setRecentSearchTerms((prev) => prev.filter((item) => item !== term))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

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
              const podium = filteredRankingPodium.find((item) => item.rank === rank)
              if (!podium) {
                return null
              }

              const [drink, food] = podium.pair.split(" + ")
              const deltaLabel =
                typeof podium.score === "number" && Number.isFinite(podium.score) ? podium.score.toFixed(1) : "0.0"
              const voteCount = getPodiumVotes(podium)

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
                  to={`/community/pairing/${podium.id}`}
                >
                  <span className="podium_rank">{podium.rank}</span>
                  <div className="podium_thumbs" aria-hidden="true">
                    <span
                      className={
                        podium.thumbVariant === "bottle"
                          ? "podium_thumb is_bottle"
                          : "podium_thumb is_drink"
                      }
                    />
                    <span className="podium_thumb is_food" />
                  </div>
                  <strong>{drink}</strong>
                  <p>{food}</p>
                  <em>{deltaLabel}</em>
                  <span className="podium_votes">{voteCount.toLocaleString()}명</span>
                </Link>
              )
            })}
          </article>

          <div className="ranking_list">
            {isRankingNoResults ? (
              <div className="search_no_results" role="status">
                <p className="search_no_results_title">검색 결과가 없어요</p>
                {searchSuggestionTags.length > 0 ? (
                  <div className="search_suggestion_row" aria-label="추천 태그">
                    {searchSuggestionTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="search_suggestion_chip"
                        onClick={() => {
                          setFeedSearchValue(tag)
                          setIsFeedSearchConfirmed(true)
                        }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {filteredRankingRows.map((row) => (
              <Link
                className="ranking_row"
                key={row.id}
                to={`/community/pairing/${row.id}`}
                state={{
                  pairingTitle: row.pair,
                  source: "ranking",
                }}
              >
                <strong className="row_rank">{row.rank}</strong>
                <div className="row_images">
                  <span />
                  <span />
                </div>
                <div className="row_text">
                  <h3>{row.pair}</h3>
                  <p className="row_meta">
                    <span className="row_score">★ {row.score}</span>
                    <span className="row_votes">
                      {row.votes.toLocaleString()}표
                      <span
                        className={
                          row.delta.startsWith("-")
                            ? "row_delta is_down"
                            : row.delta === "–"
                              ? "row_delta is_flat"
                              : "row_delta is_up"
                  }
                >
                        {row.delta === "–"
                          ? "–"
                          : row.delta.startsWith("-")
                            ? `▼${row.delta.slice(1)}`
                            : `▲${row.delta.replace("+", "")}`}
                      </span>
                    </span>
                  </p>
                </div>
                <span className="row_category">
                  {rankingCategories.find((category) => category.key === row.category)?.label ?? "전체"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="feed_page" aria-label="커뮤니티 피드">
          <div className="feed_segment_row" aria-label="피드 필터">
            {feedFilterItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={feedFilter === item.key ? "is_active" : ""}
                onClick={() => changeFeedFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="feed_cards">
            {isFeedNoResults ? (
              <div className="search_no_results" role="status">
                <p className="search_no_results_title">검색 결과가 없어요</p>
                {searchSuggestionTags.length > 0 ? (
                  <div className="search_suggestion_row" aria-label="추천 태그">
                    {searchSuggestionTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="search_suggestion_chip"
                        onClick={() => {
                          setFeedSearchValue(tag)
                          setIsFeedSearchConfirmed(true)
                        }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {feedFilter === "free" || feedFilter === "review" ? (
              <div className="feed_write_row" aria-label="글 작성">
                <button type="button" className="feed_write_button">
                  {feedFilter === "review" ? "페어링 후기 남기기" : "오늘의 자유로운 글남기기"}
                  <span className="feed_write_action">+ 작성</span>
                </button>
              </div>
            ) : null}
            {filteredPosts.map((post) => (
              <article className={post.isQna ? "feed_card is_free" : "feed_card"} key={post.id}>
                <header className="feed_card_header">
                  <div className="avatar" />
                  <div className="feed_card_header_info">
                    <div className="feed_author_row">
                      <h3>{post.authorName}</h3>
                      <span
                        className={
                          userGradesByAuthorId[post.authorId]?.pairingReviewTier === 5
                            ? "feed_post_badge is_tier5"
                            : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 4
                              ? "feed_post_badge is_tier4"
                              : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 3
                                ? "feed_post_badge is_tier3"
                                : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 2
                                  ? "feed_post_badge is_tier2"
                                  : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 1
                                    ? "feed_post_badge is_tier1"
                                    : "feed_post_badge"
                        }
                      >
                        {pairingReviewGrades[(userGradesByAuthorId[post.authorId]?.pairingReviewTier ?? 1) - 1]}
                      </span>
                    </div>
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
                  <Link
                    className="feed_text_link is_free"
                    to={`/community/pairing/${post.id}`}
                    state={{
                      pairingTitle: extractPairingTitle(post.title),
                      authorId: post.authorId,
                      authorName: post.authorName,
                      profile: post.profile ?? "",
                      source: "feed",
                    }}
                  >
                    <div className="free_layout">
                      <div className="free_badge_row">
                        {typeof post.answerCount === "number" ? (
                          <span className="free_meta">답변 {post.answerCount}</span>
                        ) : null}
                      </div>
                      <strong className="free_title">{post.title}</strong>
                      <p className="free_body">{post.body}</p>
                      {post.answerPreview ? (
                        <div className="free_answer_preview">
                          <span className="free_answer_label">답변</span>
                          <p className="free_answer">{post.answerPreview}</p>
                        </div>
                      ) : null}
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link
                      className="feed_text_link"
                      to={`/community/pairing/${post.id}`}
                      state={{
                        pairingTitle: extractPairingTitle(post.title),
                        authorId: post.authorId,
                        authorName: post.authorName,
                        profile: post.profile ?? "",
                        source: "feed",
                      }}
                    >
                      <div className="review_pair_row">
                        <div className="review_pair_thumbs" aria-hidden="true">
                          <span className="review_pair_thumb" />
                          <span className="review_pair_thumb is_food" />
                        </div>
                        <div className="review_pair_text">
                          <strong className="review_pair_title">{extractPairingTitle(post.title)}</strong>
                          <div className="review_pair_rating" aria-label="평점">
                            <span className="review_stars" aria-hidden="true">
                              ★★★★★
                            </span>
                            <span className="review_score">4.9</span>
                          </div>
                        </div>
                      </div>
                      <p className="feed_body">{post.body}</p>
                    </Link>
                  </>
                )}
                <hr></hr>
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

          {feedFilter === "review" || feedFilter === "free" ? (
            <button
              type="button"
              aria-label="글 작성"
              className={hasWriteFabScrolled && isWriteFabVisible ? "review_write_fab is_visible" : "review_write_fab"}
            >
              +
            </button>
          ) : null}
        </section>
      )}
    </section>
  )
}
