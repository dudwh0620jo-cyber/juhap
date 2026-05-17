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
  food: string
}

export type PairRankingSummary = PairMeta & {
  rating: number
  count: number
}

const DEFAULT_META: PairMeta = { drink: "추천 술", food: "추천 안주" }

// 홈 화면(주간 랭킹) 기준 Top5 고정 매핑
const HOME_WEEKLY_TOP5_META_BY_ID: Record<number, PairMeta> = {
  1005: { drink: "진로 이즈백", food: "삼겹살" },
  99003: { drink: "화요25", food: "회무침" },
  1006: { drink: "복순도가 막걸리", food: "해물파전" },
  1025: { drink: "카스", food: "후라이드 치킨" },
  1010: { drink: "클라렛 2010", food: "등심 스테이크" },
}

const RANKING_META_BY_ID: Record<number, PairMeta> = {
  ...HOME_WEEKLY_TOP5_META_BY_ID,
  1005: { drink: "카스", food: "닭목살 소금구이" },
  1002: { drink: "모엣 샹동 브뤼 임페리얼", food: "트러플 크림 파스타" },
  1006: { drink: "느린마을 막걸리", food: "감자전" },
  1025: { drink: "하이네켄", food: "토마토 파스타" },
  1009: { drink: "복순도가", food: "해물탕" },
  1010: { drink: "브뤼 샴페인", food: "브리치즈" },
  1001: { drink: "장수 생막걸리", food: "해물파전" },
  99003: { drink: "화요 25", food: "회무침" },
  1101: { drink: "닷사이 23", food: "우니" },
  1003: { drink: "국순당 밤막걸리", food: "도토리묵" },
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
  { id: 92003, rank: 3, pair: "참이슬 후레쉬 + 광어회", category: "soju", score: 0, votes: 9786, delta: "-1", disabled: true },
  { id: 92004, rank: 4, pair: "참이슬 오리지널 + 삼겹살", category: "soju", score: 0, votes: 9531, delta: "+1", disabled: true },
  { id: 92005, rank: 5, pair: "참이슬 후레쉬 + 골뱅이무침", category: "soju", score: 0, votes: 9314, delta: "-2", disabled: true },
  { id: 92006, rank: 6, pair: "처음처럼 + 닭발", category: "soju", score: 0, votes: 9078, delta: "+2", disabled: true },
  { id: 92007, rank: 7, pair: "진로 이즈 백 + 육회", category: "soju", score: 0, votes: 8842, delta: "—", disabled: true },
  { id: 92008, rank: 8, pair: "새로 + 보쌈", category: "soju", score: 0, votes: 8619, delta: "-1", disabled: true },
  { id: 92009, rank: 9, pair: "좋은데이 + 해물파전", category: "soju", score: 0, votes: 8365, delta: "+1", disabled: true },
  { id: 92010, rank: 10, pair: "처음처럼 + 곱창구이", category: "soju", score: 0, votes: 8027, delta: "-3", disabled: true },
]

export const wineDummyRankingItems: Array<RankingRow & { category: "wine" }> = [
  { id: 93004, rank: 4, pair: "산타헬레나 까베르네 소비뇽 + 스테이크", category: "wine", score: 0, votes: 9821, delta: "+2", disabled: true },
  { id: 93005, rank: 5, pair: "옐로우테일 모스카토 + 치즈 플래터", category: "wine", score: 0, votes: 9473, delta: "-1", disabled: true },
  { id: 93006, rank: 6, pair: "1865 소비뇽 블랑 + 연어 샐러드", category: "wine", score: 0, votes: 9138, delta: "+1", disabled: true },
  { id: 93007, rank: 7, pair: "빌라엠 로제 + 딸기 디저트", category: "wine", score: 0, votes: 8842, delta: "—", disabled: true },
  { id: 93008, rank: 8, pair: "몬테스 알파 샤르도네 + 감바스", category: "wine", score: 0, votes: 8527, delta: "-2", disabled: true },
  { id: 93009, rank: 9, pair: "로버트 몬다비 피노누아 + 트러플 파스타", category: "wine", score: 0, votes: 8016, delta: "+1", disabled: true },
  { id: 93010, rank: 10, pair: "프리마크 아마로네 + 바비큐 플래터", category: "wine", score: 0, votes: 7429, delta: "—", disabled: true },
]

export const beerDummyRankingItems: Array<RankingRow & { category: "beer" }> = [
  { id: 94006, rank: 6, pair: "아사히 슈퍼드라이 + 연어사시미", category: "beer", score: 0, votes: 9701, delta: "+2", disabled: true },
  { id: 94007, rank: 7, pair: "기네스 + 바비큐 플래터", category: "beer", score: 0, votes: 9672, delta: "-1", disabled: true },
  { id: 94008, rank: 8, pair: "블랑1664 + 감바스", category: "beer", score: 0, votes: 9421, delta: "+3", disabled: true },
  { id: 94009, rank: 9, pair: "호가든 + 치즈 플래터", category: "beer", score: 0, votes: 9017, delta: "-2", disabled: true },
  { id: 94010, rank: 10, pair: "제주 위트에일 + 새우튀김", category: "beer", score: 0, votes: 8734, delta: "+1", disabled: true },
]

export const whiskyDummyPodiumItems: Array<RankingPodium & { category: "whisky" }> = [
  {
    id: 95001,
    rank: 1,
    pair: "맥캘란 12년 + 육포",
    category: "whisky",
    score: 0,
    votes: 8921,
    delta: "+1",
    disabled: true,
  },
  {
    id: 95002,
    rank: 2,
    pair: "잭다니엘 + 바비큐 플래터",
    category: "whisky",
    score: 0,
    votes: 8743,
    delta: "-1",
    disabled: true,
  },
  {
    id: 95003,
    rank: 3,
    pair: "글렌피딕 12년 + 치즈 플래터",
    category: "whisky",
    score: 0,
    votes: 8512,
    delta: "+2",
    disabled: true,
  },
]

export const whiskyDummyRankingItems: Array<RankingRow & { category: "whisky" }> = [
  { id: 95004, rank: 4, pair: "메이커스 마크 + 스테이크", category: "whisky", score: 0, votes: 8327, delta: "—", disabled: true },
  { id: 95005, rank: 5, pair: "라프로익 10년 + 훈제오리", category: "whisky", score: 0, votes: 8064, delta: "-2", disabled: true },
  { id: 95006, rank: 6, pair: "발베니 12년 + 트러플 파스타", category: "whisky", score: 0, votes: 7818, delta: "+1", disabled: true },
  { id: 95007, rank: 7, pair: "와일드터키 101 + 감자튀김", category: "whisky", score: 0, votes: 7429, delta: "-3", disabled: true },
  { id: 95008, rank: 8, pair: "조니워커 블랙 + 양갈비", category: "whisky", score: 0, votes: 7116, delta: "+2", disabled: true },
  { id: 95009, rank: 9, pair: "야마자키 12년 + 장어구이", category: "whisky", score: 0, votes: 6832, delta: "—", disabled: true },
  { id: 95010, rank: 10, pair: "글렌리벳 15년 + 버터구이 관자", category: "whisky", score: 0, votes: 6427, delta: "-1", disabled: true },
]

export const spiritsDummyPodiumItems: Array<RankingPodium & { category: "spirits" }> = [
  {
    id: 96001,
    rank: 1,
    pair: "봄베이 브램블(진) + 굴튀김",
    category: "spirits",
    score: 0,
    votes: 8942,
    delta: "—",
    disabled: true,
  },
  {
    id: 96002,
    rank: 2,
    pair: "돈 훌리오 블랑코 + 타코",
    category: "spirits",
    score: 0,
    votes: 8791,
    delta: "+1",
    disabled: true,
  },
  {
    id: 96003,
    rank: 3,
    pair: "앱솔루트 보드카 + 연어 카나페",
    category: "spirits",
    score: 0,
    votes: 8617,
    delta: "-1",
    disabled: true,
  },
]

export const spiritsDummyRankingItems: Array<RankingRow & { category: "spirits" }> = [
  { id: 96004, rank: 4, pair: "헨드릭스 진 + 오이 카나페", category: "spirits", score: 0, votes: 8364, delta: "—", disabled: true },
  { id: 96005, rank: 5, pair: "말리부 럼 + 코코넛 디저트", category: "spirits", score: 0, votes: 8128, delta: "+1", disabled: true },
  { id: 96006, rank: 6, pair: "예거마이스터 + 소시지 플래터", category: "spirits", score: 0, votes: 7895, delta: "-2", disabled: true },
  { id: 96007, rank: 7, pair: "패트론 실버 + 나초 플래터", category: "spirits", score: 0, votes: 7542, delta: "+2", disabled: true },
  { id: 96008, rank: 8, pair: "베일리스 + 티라미수", category: "spirits", score: 0, votes: 7216, delta: "+1", disabled: true },
  { id: 96009, rank: 9, pair: "그레이구스 + 캐비어 크래커", category: "spirits", score: 0, votes: 6884, delta: "—", disabled: true },
  { id: 96010, rank: 10, pair: "캡틴모건 스파이스 럼 + 바비큐 폭립", category: "spirits", score: 0, votes: 6439, delta: "+1", disabled: true },
]

export const sakeDummyRankingItems: Array<RankingRow & { category: "sake" }> = [
  { id: 97005, rank: 5, pair: "핫카이산 준마이 + 연어사시미", category: "sake", score: 0, votes: 9586, delta: "+2", disabled: true },
  { id: 97006, rank: 6, pair: "쿠보타 센쥬 + 굴튀김", category: "sake", score: 0, votes: 9442, delta: "-1", disabled: true },
  { id: 97007, rank: 7, pair: "하쿠라쿠세이 + 참치타다키", category: "sake", score: 0, votes: 9315, delta: "—", disabled: true },
  { id: 97008, rank: 8, pair: "닷사이45 + 치즈 플래터", category: "sake", score: 0, votes: 9184, delta: "+1", disabled: true },
  { id: 97009, rank: 9, pair: "오토코야마 + 장어구이", category: "sake", score: 0, votes: 9072, delta: "-2", disabled: true },
  { id: 97010, rank: 10, pair: "키쿠마사무네 + 해물나베", category: "sake", score: 0, votes: 9011, delta: "+1", disabled: true },
]

export const traditionalDummyRankingItems: Array<RankingRow & { category: "traditional" }> = [
  { id: 99006, rank: 6, pair: "해창막걸리 + 해물파전", category: "traditional", score: 0, votes: 9987, delta: "+2", disabled: true },
  { id: 99007, rank: 7, pair: "설화 + 보쌈", category: "traditional", score: 0, votes: 9734, delta: "-1", disabled: true },
  { id: 99008, rank: 8, pair: "복순도가 + 치즈 플래터", category: "traditional", score: 0, votes: 9512, delta: "—", disabled: true },
  { id: 99009, rank: 9, pair: "서울의밤 + 육회", category: "traditional", score: 0, votes: 9286, delta: "+1", disabled: true },
  { id: 99010, rank: 10, pair: "문배술23 + 훈제오리", category: "traditional", score: 0, votes: 9043, delta: "-2", disabled: true },
]

export const etcDummyPodiumItems: Array<RankingPodium & { category: "etc" }> = [
  {
    id: 98001,
    rank: 1,
    pair: "산토리 하이볼 + 가라아게",
    category: "etc",
    score: 0,
    votes: 9924,
    delta: "+3",
    disabled: true,
  },
  {
    id: 98002,
    rank: 2,
    pair: "모히토 + 새우타코",
    category: "etc",
    score: 0,
    votes: 9158,
    delta: "+1",
    disabled: true,
  },
  {
    id: 98003,
    rank: 3,
    pair: "베일리스 + 티라미수",
    category: "etc",
    score: 0,
    votes: 8421,
    delta: "-1",
    disabled: true,
  },
]

export const etcDummyRankingItems: Array<RankingRow & { category: "etc" }> = [
  { id: 98004, rank: 4, pair: "말리부 + 코코넛 케이크", category: "etc", score: 0, votes: 7714, delta: "+2", disabled: true },
  { id: 98005, rank: 5, pair: "예거마이스터 + 소시지 플래터", category: "etc", score: 0, votes: 7033, delta: "-2", disabled: true },
  { id: 98006, rank: 6, pair: "네그로니 + 치즈 플래터", category: "etc", score: 0, votes: 6398, delta: "+1", disabled: true },
  { id: 98007, rank: 7, pair: "에스프레소 마티니 + 브라우니", category: "etc", score: 0, votes: 5716, delta: "+4", disabled: true },
  { id: 98008, rank: 8, pair: "캡틴모건 럼 + 바비큐 폭립", category: "etc", score: 0, votes: 4982, delta: "-1", disabled: true },
  { id: 98009, rank: 9, pair: "깔루아 밀크 + 초코 쿠키", category: "etc", score: 0, votes: 4127, delta: "-3", disabled: true },
  { id: 98010, rank: 10, pair: "논알콜 모히토 + 나초칩", category: "etc", score: 0, votes: 3264, delta: "+2", disabled: true },
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
      [1025, 4, "beer", 4.6, 13687, "+1"],
      [1009, 5, "traditional", 4.5, 12943, "-4"],
      [1010, 6, "wine", 4.5, 12318, "-2"],
      [1001, 7, "traditional", 4.4, 11876, "+1"],
      [99003, 8, "soju", 4.4, 11362, "-1"],
      [1101, 9, "sake", 4.3, 10791, "+2"],
      [1003, 10, "traditional", 4.2, 10024, "—"],
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
  91011: { drink: "일품진로", food: "육회", rating: 4.6, count: 13422 },
  91013: { drink: "카스", food: "닭목살 소금구이", rating: 4.0, count: 9422 },
}

export const getRankingPreviewById = (id: number): PairRankingSummary | null => {
  return rankingPreviewById[id] ?? null
}
