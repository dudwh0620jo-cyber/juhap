import { extractPairingTitle, feedPosts } from "./communityPosts"

export type RankingPeriod = "weekly" | "daily" | "monthly" | "all"

export type RankingCategory = "all" | "soju" | "wine" | "beer" | "whisky" | "spirits" | "traditional" | "sake" | "etc"

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

const resolvePairMetaFromPost = (id: number): PairMeta => {
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
  { key: "whisky", label: "위스키" },
  { key: "spirits", label: "증류주" },
  { key: "traditional", label: "전통주" },
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
): RankingPodium[] => {
  return ids.map((id, index) => ({
    id,
    rank: ((index + 1) as 1 | 2 | 3),
    pair: pairLabel(id),
    category,
    score: scores[index],
    votes: votes?.[index],
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
      all: makePodium([1005, 1002, 1006], "all", [4.7, 4.6, 4.5], [15432, 14311, 12010], "bottle"),
      soju: makePodium([1007, 1014, 1015], "soju", [4.7, 4.6, 4.5], [10320, 11023, 10291]),
      wine: makePodium([1005, 1016, 1017], "wine", [4.8, 4.7, 4.6], [15432, 12018, 9850], "bottle"),
      beer: makePodium([1006, 1010, 1018], "beer", [4.6, 4.5, 4.4], [12010, 10481, 8122]),
      whisky: makePodium([1011, 1019, 1020], "whisky", [4.7, 4.5, 4.4], [3214, 8122, 7621]),
      spirits: makePodium([1003, 1013, 1024], "spirits", [4.6, 4.5, 4.4], [4230, 3608, 8122]),
      traditional: makePodium([1002, 1021, 1022], "traditional", [4.7, 4.6, 4.5], [14311, 5981, 3891]),
      sake: makePodium([1004, 1008, 1012], "sake", [4.6, 4.5, 4.4], [3328, 2890, 2542]),
      etc: makePodium([1009, 1001, 1023], "etc", [4.6, 4.5, 4.4], [8011, 8122, 7621]),
    },
    rows: makeRows([
      [1009, 4, "etc", 4.6, 8011, "+2"],
      [1010, 5, "beer", 4.5, 10481, "+1"],
      [1001, 6, "etc", 4.5, 8122, "—"],
      [1007, 7, "soju", 4.6, 5981, "+3"],
      [1011, 8, "whisky", 4.7, 3214, "-1"],
      [1004, 9, "sake", 4.4, 2542, "+1"],
      [1006, 10, "beer", 4.6, 12010, "+5"],
    ]),
  },
  daily: {
    podiumByCategory: {
      all: makePodium([1006, 1010, 1005], "all", [98.9, 97.4, 96.2], undefined, "bottle"),
      soju: makePodium([1007, 1014, 1015], "soju", [98.9, 97.3, 96.0]),
      wine: makePodium([1005, 1016, 1017], "wine", [97.2, 96.6, 95.9], undefined, "bottle"),
      beer: makePodium([1006, 1010, 1018], "beer", [97.4, 96.5, 95.6]),
      whisky: makePodium([1011, 1019, 1020], "whisky", [97.0, 96.1, 95.3]),
      spirits: makePodium([1003, 1013, 1024], "spirits", [96.7, 95.8, 95.1]),
      traditional: makePodium([1002, 1021, 1022], "traditional", [96.8, 95.9, 95.0]),
      sake: makePodium([1004, 1008, 1012], "sake", [96.4, 95.7, 94.8]),
      etc: makePodium([1001, 1009, 1023], "etc", [96.1, 95.4, 94.6]),
    },
    rows: makeRows([
      [1005, 4, "wine", 97.0, 1302, "+1"],
      [1010, 5, "beer", 96.5, 1890, "-1"],
      [1002, 6, "traditional", 96.8, 1542, "+3"],
      [1004, 7, "sake", 96.4, 1401, "—"],
      [1009, 8, "etc", 96.6, 1302, "+2"],
      [1007, 9, "soju", 97.3, 2109, "+1"],
      [1001, 10, "etc", 96.1, 1903, "-2"],
    ]),
  },
  monthly: {
    podiumByCategory: {
      all: makePodium([1005, 1006, 1002], "all", [4.8, 4.7, 4.7], [15432, 14950, 14311], "bottle"),
      soju: makePodium([1007, 1014, 1015], "soju", [4.7, 4.6, 4.5], [13112, 11023, 10291]),
      wine: makePodium([1005, 1016, 1017], "wine", [4.8, 4.7, 4.6], [15432, 12018, 9850], "bottle"),
      beer: makePodium([1006, 1010, 1018], "beer", [4.7, 4.6, 4.5], [14950, 10481, 8832]),
      whisky: makePodium([1011, 1019, 1020], "whisky", [4.6, 4.5, 4.4], [8021, 7320, 6902]),
      spirits: makePodium([1003, 1013, 1024], "spirits", [4.6, 4.5, 4.4], [7420, 6218, 7320]),
      traditional: makePodium([1002, 1021, 1022], "traditional", [4.7, 4.7, 4.6], [14311, 10320, 9108]),
      sake: makePodium([1004, 1008, 1012], "sake", [4.6, 4.5, 4.4], [8328, 7890, 7542]),
      etc: makePodium([1009, 1001, 1023], "etc", [4.6, 4.5, 4.4], [8011, 7740, 7405]),
    },
    rows: makeRows([
      [1010, 4, "beer", 4.6, 10481, "+1"],
      [1007, 5, "soju", 4.7, 10320, "+2"],
      [1005, 6, "wine", 4.7, 12018, "-1"],
      [1011, 7, "whisky", 4.6, 8021, "+3"],
      [1004, 8, "sake", 4.6, 8328, "—"],
      [1001, 9, "etc", 4.7, 13112, "+1"],
      [1009, 10, "etc", 4.5, 7320, "-2"],
    ]),
  },
  all: {
    podiumByCategory: {
      all: makePodium([1005, 1002, 1006], "all", [4.9, 4.8, 4.7], [54321, 49872, 46310], "bottle"),
      soju: makePodium([1007, 1014, 1015], "soju", [4.8, 4.7, 4.6], [49872, 40318, 38012]),
      wine: makePodium([1005, 1016, 1017], "wine", [4.9, 4.8, 4.7], [54321, 45102, 32018], "bottle"),
      beer: makePodium([1006, 1010, 1018], "beer", [4.7, 4.6, 4.5], [46310, 35198, 29012]),
      whisky: makePodium([1011, 1019, 1020], "whisky", [4.7, 4.6, 4.5], [28021, 26011, 23002]),
      spirits: makePodium([1003, 1013, 1024], "spirits", [4.6, 4.5, 4.4], [22014, 20130, 19002]),
      traditional: makePodium([1002, 1021, 1022], "traditional", [4.7, 4.7, 4.6], [24011, 21098, 19012]),
      sake: makePodium([1004, 1008, 1012], "sake", [4.6, 4.5, 4.4], [18021, 17003, 16011]),
      etc: makePodium([1009, 1001, 1023], "etc", [4.6, 4.5, 4.4], [15011, 14002, 13005]),
    },
    rows: makeRows([
      [1009, 4, "etc", 4.8, 45102, "+3"],
      [1002, 5, "traditional", 4.7, 24011, "+2"],
      [1011, 6, "whisky", 4.7, 28021, "-1"],
      [1010, 7, "beer", 4.6, 35198, "+1"],
      [1004, 8, "sake", 4.6, 18021, "—"],
      [1001, 9, "etc", 4.6, 26011, "+1"],
      [1006, 10, "beer", 4.5, 23002, "-2"],
    ]),
  },
}

const weeklyAll = rankingDataByPeriod.weekly
const weeklyTop5Entries = [
  ...weeklyAll.podiumByCategory.all,
  ...weeklyAll.rows.filter((row) => row.rank === 4 || row.rank === 5).sort((a, b) => a.rank - b.rank),
]

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
