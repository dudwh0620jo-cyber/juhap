export type RankingPeriod = "weekly" | "daily" | "monthly" | "all"

export type RankingCategory =
  | "all"
  | "soju"
  | "wine"
  | "beer"
  | "whisky"
  | "spirits"
  | "traditional"
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

export type PairMeta = {
  drink: string
  drinkEmoji: string
  food: string
  foodEmoji: string
}

export const pairMetaById: Record<number, PairMeta> = {
  1001: { drink: "진토닉 하이볼 캔", drinkEmoji: "🥃", food: "삼겹살", foodEmoji: "🥩" },
  1002: { drink: "서울 약수 막걸리", drinkEmoji: "🍶", food: "해물파전", foodEmoji: "🥞" },
  1003: { drink: "인디고 퀸 보드카 칵테일", drinkEmoji: "🍸", food: "타코", foodEmoji: "🌮" },
  1004: { drink: "핫카이산 준마이 사케", drinkEmoji: "🍶", food: "가리비 구이", foodEmoji: "🦪" },
  1005: { drink: "모스카토 블랙 카버네 소비뇽", drinkEmoji: "🍷", food: "스테이크", foodEmoji: "🥩" },
  1006: { drink: "구스 아일랜드 IPA", drinkEmoji: "🍺", food: "수제버거", foodEmoji: "🍔" },
  1007: { drink: "참이슬 오리지널", drinkEmoji: "🥃", food: "조개찜", foodEmoji: "🦪" },
  1008: { drink: "닷사이 45 사케", drinkEmoji: "🍶", food: "문어숙회", foodEmoji: "🐙" },
  1009: { drink: "모히또", drinkEmoji: "🍸", food: "타코", foodEmoji: "🌮" },
  1010: { drink: "하이네켄", drinkEmoji: "🍺", food: "감자튀김", foodEmoji: "🍟" },
  1011: { drink: "메이커스 마크", drinkEmoji: "🥃", food: "다크초콜릿", foodEmoji: "🍫" },
  1012: { drink: "가모츠루 사케", drinkEmoji: "🍶", food: "연어회", foodEmoji: "🍣" },
  1013: { drink: "블루큐라소 샤워", drinkEmoji: "🍸", food: "바비큐 립", foodEmoji: "🍖" },
  1014: { drink: "참이슬 제로", drinkEmoji: "🥃", food: "삼겹살", foodEmoji: "🥩" },
  1015: { drink: "진로 이즈 백", drinkEmoji: "🥃", food: "김치찌개", foodEmoji: "🍲" },
  1016: { drink: "샤르도네 화이트 와인", drinkEmoji: "🍷", food: "치즈", foodEmoji: "🧀" },
  1017: { drink: "19 크라임스 레드 와인", drinkEmoji: "🍷", food: "양고기 파스타", foodEmoji: "🍝" },
  1018: { drink: "브루독 펑크 IPA", drinkEmoji: "🍺", food: "치킨", foodEmoji: "🍗" },
  1019: { drink: "와일드 터키 101", drinkEmoji: "🥃", food: "수제 바비큐", foodEmoji: "🍖" },
  1020: { drink: "버팔로 트레이스", drinkEmoji: "🥃", food: "견과류", foodEmoji: "🥜" },
  1021: { drink: "지평 막걸리", drinkEmoji: "🍶", food: "묵은지김치", foodEmoji: "🥬" },
  1022: { drink: "느린마을 막걸리", drinkEmoji: "🍶", food: "감자전", foodEmoji: "🥔" },
  1023: { drink: "산토리 하이볼 캔", drinkEmoji: "🥃", food: "가리비 버터구이", foodEmoji: "🦪" },
  1024: { drink: "앱솔루트 보드카", drinkEmoji: "🍸", food: "수제 연어롤", foodEmoji: "🍣" }
}

const pairLabel = (id: number) => {
  const meta = pairMetaById[id]
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
  ) {
    return value
  }
  return null
}

const makePodium = (
  ids: [number, number, number],
  category: RankingCategory,
  scores: [number, number, number],
  votes?: [number?, number?, number?],
  thumbVariant?: "default" | "bottle",
): RankingPodium[] =>
  ids.map((id, index) => ({
    id,
    rank: (index + 1) as 1 | 2 | 3,
    pair: pairLabel(id),
    category,
    score: scores[index],
    votes: votes?.[index],
    thumbVariant: thumbVariant && category === "wine" ? thumbVariant : undefined,
  }))

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
      all: makePodium([1005, 1002, 1006], "all", [4.8, 4.7, 4.6], [15432, 14311, 12010], "bottle"),
      soju: makePodium([1007, 1014, 1015], "soju", [4.6, 4.5, 4.4], [5981, 8122, 3891]),
      wine: makePodium([1005, 1016, 1017], "wine", [4.8, 4.6, 4.5], [15432, 8011, 8494], "bottle"),
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
      [1001, 6, "etc", 4.5, 8122, "유지"],
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
      [1004, 7, "sake", 96.4, 1401, "유지"],
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
      [1004, 8, "sake", 4.6, 8328, "유지"],
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
      [1004, 8, "sake", 4.6, 18021, "유지"],
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
  const meta = pairMetaById[entry.id]
  return { ...meta, rating: entry.score, count: entry.votes ?? 0 }
}) as [HomeRankingItem, HomeRankingItem, HomeRankingItem, HomeRankingItem, HomeRankingItem]
