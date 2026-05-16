import { extractPairingTitle, feedPosts } from "./communityPosts"

export type RankingPeriod = "weekly" | "daily" | "monthly"

export type RankingCategory = "all" | "soju" | "wine" | "beer" | "whisky" | "spirits" | "traditional" | "sake" | "etc"

export type RankingRow = {
  id: number
  rank: number
  pair: string
  category: RankingCategory
  score: number
  votes: number
  delta: string
  disabled?: boolean
}

export type RankingPodium = {
  id: number
  rank: 1 | 2 | 3
  pair: string
  category: RankingCategory
  score: number
  votes?: number
  delta?: string
  disabled?: boolean
  thumbVariant?: "default" | "bottle"
}

export type PairMeta = {
  drink: string
  drinkEmoji: string
  food: string
  foodEmoji: string
}

export type PairRankingSummary = PairMeta & {
  rating: number
  count: number
}

const DEFAULT_META: PairMeta = { drink: "추천 술", drinkEmoji: "🍶", food: "추천 안주", foodEmoji: "🥘" }

// 홈 화면(주간 랭킹) 기준 Top5 고정 매핑
const HOME_WEEKLY_TOP5_META_BY_ID: Record<number, PairMeta> = {
  1005: { drink: "진로 이즈백", drinkEmoji: "🍶", food: "삼겹살", foodEmoji: "🥓" },
  99003: { drink: "화요25", drinkEmoji: "🍶", food: "회무침", foodEmoji: "🥗" },
  1006: { drink: "복순도가 막걸리", drinkEmoji: "🥛", food: "해물파전", foodEmoji: "🥘" },
  1025: { drink: "카스", drinkEmoji: "🍺", food: "후라이드 치킨", foodEmoji: "🍗" },
  1010: { drink: "클라렛 2010", drinkEmoji: "🍷", food: "등심 스테이크", foodEmoji: "🥩" },
}

const RANKING_META_BY_ID: Record<number, PairMeta> = {
  ...HOME_WEEKLY_TOP5_META_BY_ID,
  1005: { drink: "카스", drinkEmoji: "🍺", food: "닭목살 소금구이", foodEmoji: "🍗" },
  1002: { drink: "모엣 샹동 브뤼 임페리얼", drinkEmoji: "🥂", food: "트러플 크림 파스타", foodEmoji: "🍝" },
  1006: { drink: "느린마을 막걸리", drinkEmoji: "🍶", food: "감자전", foodEmoji: "🥞" },
  1025: { drink: "하이네켄", drinkEmoji: "🍺", food: "토마토 파스타", foodEmoji: "🍝" },
  1009: { drink: "복순도가", drinkEmoji: "🍶", food: "해물탕", foodEmoji: "🍲" },
  1010: { drink: "브뤼 샴페인", drinkEmoji: "🥂", food: "브리치즈", foodEmoji: "🧀" },
  1001: { drink: "장수 생막걸리", drinkEmoji: "🍶", food: "해물파전", foodEmoji: "🥞" },
  99003: { drink: "화요 25", drinkEmoji: "🍶", food: "회무침", foodEmoji: "🥗" },
  1101: { drink: "닷사이 23", drinkEmoji: "🍶", food: "우니", foodEmoji: "🍣" },
  1003: { drink: "국순당 밤막걸리", drinkEmoji: "🍶", food: "도토리묵", foodEmoji: "🥗" },
}

const resolvePairMetaFromPost = (id: number): PairMeta => {
  const override = RANKING_META_BY_ID[id]
  if (override) return override

  const post = feedPosts.find((item) => item.id === id)
  const title = post?.title ? extractPairingTitle(post.title) : ""
  if (title.includes("+")) {
    const [drink, food] = title.split("+").map((value) => value.trim())
    if (drink && food) return { ...DEFAULT_META, drink, food }
  }
  return DEFAULT_META
}

const pairLabel = (id: number) => {
  const meta = resolvePairMetaFromPost(id)
  return `${meta.drink} + ${meta.food}`
}

export const getRankingPairLabel = pairLabel

export const rankingPeriods: Array<{ key: RankingPeriod; label: string }> = [
  { key: "daily", label: "일간" },
  { key: "weekly", label: "주간" },
  { key: "monthly", label: "월간" },
]

export const rankingCategories: Array<{ key: RankingCategory; label: string }> = [
  { key: "all", label: "전체" },
  { key: "soju", label: "소주" },
  { key: "wine", label: "와인" },
  { key: "beer", label: "맥주" },
  { key: "whisky", label: "위스키" },
  { key: "spirits", label: "증류주" },
  { key: "traditional", label: "전통주" },
  { key: "sake", label: "사케" },
  { key: "etc", label: "기타" },
]

export const sojuDummyRankingItems: Array<RankingRow & { category: "soju" }> = [
  { id: 92003, rank: 3, pair: "참이슬 후레쉬 + 광어회", category: "soju", score: 0, votes: 492, delta: "-1", disabled: true },
  { id: 92004, rank: 4, pair: "참이슬 오리지널 + 삼겹살", category: "soju", score: 0, votes: 471, delta: "+1", disabled: true },
  { id: 92005, rank: 5, pair: "참이슬 후레쉬 + 골뱅이무침", category: "soju", score: 0, votes: 438, delta: "-2", disabled: true },
  { id: 92006, rank: 6, pair: "처음처럼 + 닭발", category: "soju", score: 0, votes: 404, delta: "+2", disabled: true },
  { id: 92007, rank: 7, pair: "진로 이즈 백 + 육회", category: "soju", score: 0, votes: 377, delta: "—", disabled: true },
  { id: 92008, rank: 8, pair: "새로 + 보쌈", category: "soju", score: 0, votes: 256, delta: "-1", disabled: true },
  { id: 92009, rank: 9, pair: "좋은데이 + 해물파전", category: "soju", score: 0, votes: 118, delta: "+1", disabled: true },
  { id: 92010, rank: 10, pair: "처음처럼 + 곱창구이", category: "soju", score: 0, votes: 103, delta: "-3", disabled: true },
]

export const podiumVotesById: Record<number, number> = {
  1001: 8122,
  99003: 6124,
  1005: 7621,
  1006: 6321,
  1007: 5981,
  1009: 3011,
  1010: 5421,
  1011: 3214,
  1025: 5921,
}

export const normalizeRankingPeriod = (value: string | null): RankingPeriod | null => {
  if (value === "weekly" || value === "daily" || value === "monthly") return value
  return null
}

export const normalizeRankingCategory = (value: string | null): RankingCategory | null => {
  if (
    value === "all" ||
    value === "soju" ||
    value === "wine" ||
    value === "beer" ||
    value === "whisky" ||
    value === "spirits" ||
    value === "traditional" ||
    value === "sake" ||
    value === "etc"
  )
    return value
  return null
}

const makePodium = (
  ids: readonly [number, number, number],
  category: RankingCategory,
  scores: readonly [number, number, number],
  votes?: readonly [number, number, number],
  thumbVariant?: RankingPodium["thumbVariant"],
  deltas?: readonly [string, string, string],
): RankingPodium[] => {
  return ids.map((id, index) => ({
    id,
    rank: ((index + 1) as 1 | 2 | 3),
    pair: pairLabel(id),
    category,
    score: scores[index],
    votes: votes?.[index],
    delta: deltas?.[index],
    thumbVariant,
  }))
}

const makeRows = (entries: Array<[number, number, RankingCategory, number, number, string]>): RankingRow[] =>
  entries.map(([id, rank, category, score, votes, delta]) => ({
    id,
    rank,
    pair: pairLabel(id),
    category,
    score,
    votes,
    delta,
  }))

export const rankingDataByPeriod: Record<
  RankingPeriod,
  { podiumByCategory: Record<RankingCategory, RankingPodium[]>; rows: RankingRow[] }
> = {
  weekly: {
    podiumByCategory: {
      // 홈 화면 주간 Top5(1~3위) 기준으로 votes(짠) 맞춤
      all: makePodium([1005, 1002, 1006], "all", [4.9, 4.8, 4.7], [15820, 14930, 13740], "bottle", ["+1", "-1", "+3"]),
      soju: [
        { id: 91011, rank: 1, pair: pairLabel(91011), category: "soju", score: 4.7 },
        { id: 99003, rank: 2, pair: pairLabel(99003), category: "soju", score: 4.6 },
      ],
      wine: makePodium([1002, 1010, 1008], "wine", [4.8, 4.7, 4.6], [1327, 927, 274], "bottle"),
      beer: makePodium([91013, 1005, 1025], "beer", [4.6, 4.5, 4.4], [9422, 1439, 1088]),
      whisky: [],
      spirits: [],
      traditional: makePodium([91012, 1006, 1009], "traditional", [4.7, 4.6, 4.5], [10422, 1194, 1036]),
      sake: makePodium([1101, 99001, 99002], "sake", [4.6, 4.5, 4.4], [638, 451, 125]),
      etc: [],
    },
    rows: makeRows([
      // 홈 화면 주간 Top5(4~5위) 기준으로 votes(짠) 맞춤
      [1025, 4, "beer", 4.6, 12480, "+1"],
      [1009, 5, "traditional", 4.5, 11630, "-4"],
      [1010, 6, "wine", 4.5, 10870, "-2"],
      [1001, 7, "traditional", 4.4, 9870, "+1"],
      [99003, 8, "soju", 4.4, 9210, "-1"],
      [1101, 9, "sake", 4.3, 8740, "+2"],
      [1003, 10, "traditional", 4.2, 8120, "—"],
      [1004, 11, "beer", 4.1, 7600, "—"],
      [1007, 12, "beer", 4.0, 7100, "+1"],
    ]),
  },
  daily: {
    podiumByCategory: {
      all: makePodium([1006, 1010, 1005], "all", [98.9, 97.4, 96.2], undefined, "bottle"),
      soju: [
        { id: 91011, rank: 1, pair: pairLabel(91011), category: "soju", score: 98.9 },
        { id: 99003, rank: 2, pair: pairLabel(99003), category: "soju", score: 97.3 },
      ],
      wine: makePodium([1002, 1010, 1008], "wine", [97.2, 96.6, 95.9], undefined, "bottle"),
      beer: makePodium([91013, 1005, 1025], "beer", [97.4, 96.5, 95.6]),
      whisky: [],
      spirits: [],
      traditional: makePodium([91012, 1006, 1009], "traditional", [96.8, 95.9, 95.0]),
      sake: makePodium([1101, 99001, 99002], "sake", [96.4, 95.7, 94.8]),
      etc: [],
    },
    rows: makeRows([
      [1005, 4, "beer", 97.0, 1302, "+1"],
      [1010, 5, "wine", 96.5, 1890, "-1"],
      [99003, 6, "soju", 96.8, 1542, "+3"],
      [1004, 7, "beer", 96.4, 1401, "—"],
      [1009, 8, "traditional", 96.6, 1302, "+2"],
      [1007, 9, "beer", 97.3, 2109, "+1"],
      [1001, 10, "traditional", 96.1, 1903, "-2"],
    ]),
  },
  monthly: {
    podiumByCategory: {
      all: makePodium([1005, 1006, 99003], "all", [4.8, 4.7, 4.7], [15432, 14950, 14311], "bottle"),
      soju: [
        { id: 91011, rank: 1, pair: pairLabel(91011), category: "soju", score: 4.7 },
        { id: 99003, rank: 2, pair: pairLabel(99003), category: "soju", score: 4.6 },
      ],
      wine: makePodium([1002, 1010, 1008], "wine", [4.8, 4.7, 4.6], [15432, 12018, 9850], "bottle"),
      beer: makePodium([91013, 1005, 1025], "beer", [4.7, 4.6, 4.5], [14950, 10481, 8832]),
      whisky: [],
      spirits: [],
      traditional: makePodium([91012, 1006, 1009], "traditional", [4.7, 4.7, 4.6], [14311, 10320, 9108]),
      sake: makePodium([1101, 99001, 99002], "sake", [4.6, 4.5, 4.4], [8328, 7890, 7542]),
      etc: [],
    },
    rows: makeRows([
      [1010, 4, "wine", 4.6, 10481, "+1"],
      [1007, 5, "beer", 4.7, 10320, "+2"],
      [1005, 6, "beer", 4.7, 12018, "-1"],
      [99003, 7, "soju", 4.6, 8021, "+3"],
      [1004, 8, "beer", 4.6, 8328, "—"],
      [1001, 9, "traditional", 4.7, 13112, "+1"],
      [1009, 10, "traditional", 4.5, 7320, "-2"],
    ]),
  },
}

const weeklyAll = rankingDataByPeriod.weekly
const weeklyTop5Rows = (() => {
  const rowsByRank = new Map<number, RankingRow>()
  for (const row of weeklyAll.rows) {
    if (row.rank !== 4 && row.rank !== 5) continue
    if (!rowsByRank.has(row.rank)) rowsByRank.set(row.rank, row)
  }
  return Array.from(rowsByRank.values()).sort((a, b) => a.rank - b.rank)
})()

const weeklyTop5Entries = [...weeklyAll.podiumByCategory.all, ...weeklyTop5Rows]

export type HomeRankingItem = PairMeta & { rating: number; count: number }

export const weeklyAllTop5 = weeklyTop5Entries.map((entry) => {
  const meta = resolvePairMetaFromPost(entry.id)
  return { ...meta, rating: entry.score, count: entry.votes ?? 0 }
}) as [HomeRankingItem, HomeRankingItem, HomeRankingItem, HomeRankingItem, HomeRankingItem]

const rankingPreviewById: Record<number, PairRankingSummary> = {
  91011: { drink: "일품진로", drinkEmoji: "🍶", food: "육회", foodEmoji: "🥩", rating: 4.6, count: 13422 },
  91013: { drink: "카스", drinkEmoji: "🍺", food: "닭목살 소금구이", foodEmoji: "🍗", rating: 4.0, count: 9422 },
}

export const getRankingPreviewById = (id: number): PairRankingSummary | null => {
  return rankingPreviewById[id] ?? null
}
