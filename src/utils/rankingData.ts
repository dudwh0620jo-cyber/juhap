export type RankingPeriod = "weekly" | "daily" | "monthly" | "all"

export type RankingCategory =
  | "all"
  | "soju"
  | "wine"
  | "beer"
  | "whisky_spirit"
  | "tradition"
  | "sake"
  | "etc"

export type RankingRow = {
  id: number
  rank: number
  pair: string
  category: RankingCategory
  score: number
  votes: number
  delta: string
}

export type RankingPodium = {
  id: number
  rank: 1 | 2 | 3
  pair: string
  category: RankingCategory
  score: number
  votes?: number
  thumbVariant?: "default" | "bottle"
}

export const rankingPeriods: Array<{ key: RankingPeriod; label: string }> = [
  { key: "all", label: "전체" },
  { key: "daily", label: "일간" },
  { key: "weekly", label: "주간" },
  { key: "monthly", label: "월간" },
]

export const rankingCategories: Array<{ key: RankingCategory; label: string }> = [
  { key: "all", label: "전체" },
  { key: "soju", label: "소주" },
  { key: "wine", label: "와인" },
  { key: "beer", label: "맥주" },
  { key: "whisky_spirit", label: "위스키/증류주" },
  { key: "tradition", label: "전통주" },
  { key: "sake", label: "사케" },
  { key: "etc", label: "기타" },
]

export const podiumVotesById: Record<number, number> = {
  1001: 8122,
  1002: 8494,
  1005: 15432,
  1006: 7621,
  1007: 5981,
  1009: 3011,
  1010: 3891,
  1011: 3214,
}

export const normalizeRankingPeriod = (value: string | null): RankingPeriod | null => {
  if (value === "weekly" || value === "daily" || value === "monthly" || value === "all") return value
  return null
}

export const normalizeRankingCategory = (value: string | null): RankingCategory | null => {
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

export const rankingDataByPeriod: Record<
  RankingPeriod,
  { podiumByCategory: Record<RankingCategory, RankingPodium[]>; rows: RankingRow[] }
> = {
  weekly: {
    podiumByCategory: {
      all: [
        { id: 1005, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1002, rank: 2, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 14311 },
        { id: 1006, rank: 3, pair: "IPA + 햄버거", category: "beer", score: 4.6, votes: 12010 },
      ],
      soju: [
        { id: 1007, rank: 1, pair: "소주 + 족발", category: "soju", score: 4.6, votes: 5981 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "soju", score: 4.5, votes: 8122 },
        { id: 1010, rank: 3, pair: "라거 + 감자튀김", category: "soju", score: 4.4, votes: 3891 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1009, rank: 2, pair: "칵테일 + 타코", category: "wine", score: 4.6, votes: 8011, thumbVariant: "bottle" },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "wine", score: 4.5, votes: 8494, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: "IPA + 햄버거", category: "beer", score: 4.6, votes: 12010 },
        { id: 1010, rank: 2, pair: "라거 + 감자튀김", category: "beer", score: 4.5, votes: 10481 },
        { id: 1001, rank: 3, pair: "하이볼 + 삼겹살", category: "beer", score: 4.4, votes: 8122 },
      ],
      whisky_spirit: [
        { id: 1011, rank: 1, pair: "버번 + 다크초콜릿", category: "whisky_spirit", score: 4.7, votes: 3214 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "whisky_spirit", score: 4.5, votes: 8122 },
        { id: 1006, rank: 3, pair: "IPA + 햄버거", category: "whisky_spirit", score: 4.4, votes: 7621 },
      ],
      tradition: [
        { id: 1002, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 14311 },
        { id: 1007, rank: 2, pair: "소주 + 족발", category: "tradition", score: 4.6, votes: 5981 },
        { id: 1010, rank: 3, pair: "라거 + 감자튀김", category: "tradition", score: 4.5, votes: 3891 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 4.6, votes: 3328 },
        { id: 1008, rank: 2, pair: "회 먹을 때는 전 사케파예요", category: "sake", score: 4.5, votes: 2890 },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "sake", score: 4.4, votes: 2542 },
      ],
      etc: [
        { id: 1009, rank: 1, pair: "칵테일 + 타코", category: "etc", score: 4.6, votes: 8011 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "etc", score: 4.5, votes: 8122 },
        { id: 1006, rank: 3, pair: "IPA + 햄버거", category: "etc", score: 4.4, votes: 7621 },
      ],
    },
    rows: [
      { id: 1009, rank: 4, pair: "칵테일 + 타코", category: "etc", score: 4.6, votes: 8011, delta: "+2" },
      { id: 1010, rank: 5, pair: "라거 + 감자튀김", category: "beer", score: 4.5, votes: 10481, delta: "+1" },
      { id: 1001, rank: 6, pair: "하이볼 + 삼겹살", category: "etc", score: 4.5, votes: 8122, delta: "–" },
      { id: 1007, rank: 7, pair: "소주 + 족발", category: "soju", score: 4.6, votes: 5981, delta: "+3" },
      { id: 1011, rank: 8, pair: "버번 + 다크초콜릿", category: "whisky_spirit", score: 4.7, votes: 3214, delta: "-1" },
      { id: 1004, rank: 9, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 4.4, votes: 2542, delta: "+1" },
      { id: 1006, rank: 10, pair: "IPA + 햄버거", category: "beer", score: 4.6, votes: 12010, delta: "+5" },
    ],
  },
  daily: {
    podiumByCategory: {
      all: [
        { id: 1006, rank: 1, pair: "IPA + 햄버거", category: "beer", score: 98.9 },
        { id: 1010, rank: 2, pair: "라거 + 감자튀김", category: "beer", score: 97.4 },
        { id: 1005, rank: 3, pair: "레드 와인 + 스테이크", category: "wine", score: 96.2, thumbVariant: "bottle" },
      ],
      soju: [
        { id: 1007, rank: 1, pair: "소주 + 족발", category: "soju", score: 98.9 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "soju", score: 97.3 },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "soju", score: 96.0 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 97.2, thumbVariant: "bottle" },
        { id: 1009, rank: 2, pair: "칵테일 + 타코", category: "wine", score: 96.6, thumbVariant: "bottle" },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "wine", score: 95.9, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: "IPA + 햄버거", category: "beer", score: 97.4 },
        { id: 1010, rank: 2, pair: "라거 + 감자튀김", category: "beer", score: 96.5 },
        { id: 1001, rank: 3, pair: "하이볼 + 삼겹살", category: "beer", score: 95.6 },
      ],
      whisky_spirit: [
        { id: 1011, rank: 1, pair: "버번 + 다크초콜릿", category: "whisky_spirit", score: 97.0 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "whisky_spirit", score: 96.1 },
        { id: 1005, rank: 3, pair: "레드 와인 + 스테이크", category: "whisky_spirit", score: 95.3 },
      ],
      tradition: [
        { id: 1002, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 96.8 },
        { id: 1007, rank: 2, pair: "소주 + 족발", category: "tradition", score: 95.9 },
        { id: 1010, rank: 3, pair: "라거 + 감자튀김", category: "tradition", score: 95.0 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 96.4 },
        { id: 1008, rank: 2, pair: "회 먹을 때는 전 사케파예요", category: "sake", score: 95.7 },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "sake", score: 94.8 },
      ],
      etc: [
        { id: 1001, rank: 1, pair: "하이볼 + 삼겹살", category: "etc", score: 96.1 },
        { id: 1009, rank: 2, pair: "칵테일 + 타코", category: "etc", score: 95.4 },
        { id: 1006, rank: 3, pair: "IPA + 햄버거", category: "etc", score: 94.6 },
      ],
    },
    rows: [
      { id: 1005, rank: 4, pair: "레드 와인 + 스테이크", category: "wine", score: 97.0, votes: 1302, delta: "+1" },
      { id: 1010, rank: 5, pair: "라거 + 감자튀김", category: "beer", score: 96.5, votes: 1890, delta: "-1" },
      { id: 1002, rank: 6, pair: "막걸리 + 해물파전", category: "tradition", score: 96.8, votes: 1542, delta: "+3" },
      { id: 1004, rank: 7, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 96.4, votes: 1401, delta: "–" },
      { id: 1009, rank: 8, pair: "칵테일 + 타코", category: "etc", score: 96.6, votes: 1302, delta: "+2" },
      { id: 1007, rank: 9, pair: "소주 + 족발", category: "soju", score: 97.3, votes: 2109, delta: "+1" },
      { id: 1001, rank: 10, pair: "하이볼 + 삼겹살", category: "etc", score: 96.1, votes: 1903, delta: "-2" },
    ],
  },
  monthly: {
    podiumByCategory: {
      all: [
        { id: 1005, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1006, rank: 2, pair: "IPA + 햄버거", category: "beer", score: 4.7, votes: 14950 },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 14311 },
      ],
      soju: [
        { id: 1007, rank: 1, pair: "소주 + 족발", category: "soju", score: 4.7, votes: 13112 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "soju", score: 4.6, votes: 11023 },
        { id: 1010, rank: 3, pair: "라거 + 감자튀김", category: "soju", score: 4.5, votes: 10291 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1009, rank: 2, pair: "칵테일 + 타코", category: "wine", score: 4.7, votes: 12018, thumbVariant: "bottle" },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "wine", score: 91.3, votes: 9850, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: "IPA + 햄버거", category: "beer", score: 4.7, votes: 14950 },
        { id: 1010, rank: 2, pair: "라거 + 감자튀김", category: "beer", score: 4.6, votes: 10481 },
        { id: 1001, rank: 3, pair: "하이볼 + 삼겹살", category: "beer", score: 4.5, votes: 8832 },
      ],
      whisky_spirit: [
        { id: 1011, rank: 1, pair: "버번 + 다크초콜릿", category: "whisky_spirit", score: 4.6, votes: 8021 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "whisky_spirit", score: 4.5, votes: 7320 },
        { id: 1005, rank: 3, pair: "레드 와인 + 스테이크", category: "whisky_spirit", score: 4.4, votes: 6902 },
      ],
      tradition: [
        { id: 1002, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 14311 },
        { id: 1007, rank: 2, pair: "소주 + 족발", category: "tradition", score: 4.7, votes: 10320 },
        { id: 1010, rank: 3, pair: "라거 + 감자튀김", category: "tradition", score: 4.6, votes: 9108 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 4.6, votes: 8328 },
        { id: 1008, rank: 2, pair: "회 먹을 때는 전 사케파예요", category: "sake", score: 4.5, votes: 7890 },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "sake", score: 4.4, votes: 7542 },
      ],
      etc: [
        { id: 1009, rank: 1, pair: "칵테일 + 타코", category: "etc", score: 4.6, votes: 8011 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "etc", score: 4.5, votes: 7740 },
        { id: 1006, rank: 3, pair: "IPA + 햄버거", category: "etc", score: 4.4, votes: 7405 },
      ],
    },
    rows: [
      { id: 1010, rank: 4, pair: "라거 + 감자튀김", category: "beer", score: 4.6, votes: 10481, delta: "+1" },
      { id: 1007, rank: 5, pair: "소주 + 족발", category: "soju", score: 4.7, votes: 10320, delta: "+2" },
      { id: 1005, rank: 6, pair: "레드 와인 + 스테이크", category: "wine", score: 4.7, votes: 12018, delta: "-1" },
      { id: 1011, rank: 7, pair: "버번 + 다크초콜릿", category: "whisky_spirit", score: 4.6, votes: 8021, delta: "+3" },
      { id: 1004, rank: 8, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 4.6, votes: 8328, delta: "–" },
      { id: 1001, rank: 9, pair: "하이볼 + 삼겹살", category: "etc", score: 4.7, votes: 13112, delta: "+1" },
      { id: 1009, rank: 10, pair: "칵테일 + 타코", category: "whisky_spirit", score: 4.5, votes: 7320, delta: "-2" },
    ],
  },
  all: {
    podiumByCategory: {
      all: [
        { id: 1005, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 4.9, votes: 54321, thumbVariant: "bottle" },
        { id: 1002, rank: 2, pair: "막걸리 + 해물파전", category: "tradition", score: 4.8, votes: 49872 },
        { id: 1006, rank: 3, pair: "IPA + 햄버거", category: "beer", score: 4.7, votes: 46310 },
      ],
      soju: [
        { id: 1007, rank: 1, pair: "소주 + 족발", category: "soju", score: 4.8, votes: 49872 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "soju", score: 4.7, votes: 40318 },
        { id: 1010, rank: 3, pair: "라거 + 감자튀김", category: "soju", score: 4.6, votes: 38012 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: "레드 와인 + 스테이크", category: "wine", score: 4.9, votes: 54321, thumbVariant: "bottle" },
        { id: 1009, rank: 2, pair: "칵테일 + 타코", category: "wine", score: 4.8, votes: 45102, thumbVariant: "bottle" },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "wine", score: 91.3, votes: 32018, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: "IPA + 햄버거", category: "beer", score: 4.7, votes: 46310 },
        { id: 1010, rank: 2, pair: "라거 + 감자튀김", category: "beer", score: 4.6, votes: 35198 },
        { id: 1001, rank: 3, pair: "하이볼 + 삼겹살", category: "beer", score: 4.5, votes: 29012 },
      ],
      whisky_spirit: [
        { id: 1011, rank: 1, pair: "버번 + 다크초콜릿", category: "whisky_spirit", score: 4.7, votes: 28021 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "whisky_spirit", score: 4.6, votes: 26011 },
        { id: 1005, rank: 3, pair: "레드 와인 + 스테이크", category: "whisky_spirit", score: 4.5, votes: 23002 },
      ],
      tradition: [
        { id: 1002, rank: 1, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 24011 },
        { id: 1007, rank: 2, pair: "소주 + 족발", category: "tradition", score: 4.7, votes: 21098 },
        { id: 1010, rank: 3, pair: "라거 + 감자튀김", category: "tradition", score: 4.6, votes: 19012 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 4.6, votes: 18021 },
        { id: 1008, rank: 2, pair: "회 먹을 때는 전 사케파예요", category: "sake", score: 4.5, votes: 17003 },
        { id: 1002, rank: 3, pair: "막걸리 + 해물파전", category: "sake", score: 4.4, votes: 16011 },
      ],
      etc: [
        { id: 1009, rank: 1, pair: "칵테일 + 타코", category: "etc", score: 4.6, votes: 15011 },
        { id: 1001, rank: 2, pair: "하이볼 + 삼겹살", category: "etc", score: 4.5, votes: 14002 },
        { id: 1006, rank: 3, pair: "IPA + 햄버거", category: "etc", score: 4.4, votes: 13005 },
      ],
    },
    rows: [
      { id: 1009, rank: 4, pair: "칵테일 + 타코", category: "etc", score: 4.8, votes: 45102, delta: "+3" },
      { id: 1002, rank: 5, pair: "막걸리 + 해물파전", category: "tradition", score: 4.7, votes: 24011, delta: "+2" },
      { id: 1011, rank: 6, pair: "버번 + 다크초콜릿", category: "whisky_spirit", score: 4.7, votes: 28021, delta: "-1" },
      { id: 1010, rank: 7, pair: "라거 + 감자튀김", category: "beer", score: 4.6, votes: 35198, delta: "+1" },
      { id: 1004, rank: 8, pair: "사케에 잘 맞는 집안주 몇 개 추천", category: "sake", score: 4.6, votes: 18021, delta: "–" },
      { id: 1001, rank: 9, pair: "하이볼 + 삼겹살", category: "etc", score: 4.6, votes: 26011, delta: "+1" },
      { id: 1006, rank: 10, pair: "IPA + 햄버거", category: "beer", score: 4.5, votes: 23002, delta: "-2" },
    ],
  },
}
