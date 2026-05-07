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
  1001: { drink: "짐빔 하이볼 캔", drinkEmoji: "🥃", food: "삼겹살", foodEmoji: "🥩" },
  1002: { drink: "서울 장수 막걸리", drinkEmoji: "🍵", food: "해물파전", foodEmoji: "🥞" },
  1003: { drink: "호세 쿠엘보 에스페셜", drinkEmoji: "🥃", food: "타코", foodEmoji: "🌮" },
  1004: { drink: "하쿠츠루 준마이 사케", drinkEmoji: "🍶", food: "가라아게", foodEmoji: "🍗" },
  1005: { drink: "몬테스 클래식 카베르네 소비뇽", drinkEmoji: "🍷", food: "스테이크", foodEmoji: "🥩" },
  1006: { drink: "구스 아일랜드 IPA", drinkEmoji: "🍺", food: "햄버거", foodEmoji: "🍔" },
  1007: { drink: "참이슬 오리지널", drinkEmoji: "🍶", food: "족발", foodEmoji: "🍖" },
  1008: { drink: "닷사이 45 사케", drinkEmoji: "🍶", food: "명란구이", foodEmoji: "🐟" },
  1009: { drink: "모히토 (바카디)", drinkEmoji: "🍹", food: "타코", foodEmoji: "🌮" },
  1010: { drink: "하이네켄", drinkEmoji: "🍺", food: "감자튀김", foodEmoji: "🍟" },
  1011: { drink: "메이커스 마크", drinkEmoji: "🥃", food: "다크초콜릿", foodEmoji: "🍫" },
  1012: { drink: "간바레 오토상 사케", drinkEmoji: "🍶", food: "오뎅탕", foodEmoji: "🍢" },
  1013: { drink: "봄베이 사파이어", drinkEmoji: "🍸", food: "올리브", foodEmoji: "🫒" },
  1014: { drink: "참이슬 새로", drinkEmoji: "🍶", food: "삼겹살", foodEmoji: "🥩" },
  1015: { drink: "진로 이즈 백", drinkEmoji: "🍶", food: "김치찌개", foodEmoji: "🍲" },
  1016: { drink: "옐로우 테일 카베르네 소비뇽", drinkEmoji: "🍷", food: "치즈", foodEmoji: "🧀" },
  1017: { drink: "19 크라임스 레드 와인", drinkEmoji: "🍷", food: "라구 파스타", foodEmoji: "🍝" },
  1018: { drink: "브루독 펑크 IPA", drinkEmoji: "🍺", food: "치킨", foodEmoji: "🍗" },
  1019: { drink: "와일드 터키 101", drinkEmoji: "🥃", food: "훈제 바비큐", foodEmoji: "🍖" },
  1020: { drink: "버팔로 트레이스", drinkEmoji: "🥃", food: "견과류", foodEmoji: "🥜" },
  1021: { drink: "지평 막걸리", drinkEmoji: "🍵", food: "두부김치", foodEmoji: "🍲" },
  1022: { drink: "느린마을 막걸리", drinkEmoji: "🍵", food: "감자전", foodEmoji: "🥞" },
  1023: { drink: "산토리 하이볼 캔", drinkEmoji: "🥃", food: "가라아게", foodEmoji: "🍗" },
  1024: { drink: "앱솔루트 보드카", drinkEmoji: "🍸", food: "훈제연어", foodEmoji: "🐟" },
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

export const rankingDataByPeriod: Record<
  RankingPeriod,
  { podiumByCategory: Record<RankingCategory, RankingPodium[]>; rows: RankingRow[] }
> = {
  weekly: {
    podiumByCategory: {
      all: [
        { id: 1005, rank: 1, pair: pairLabel(1005), category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1002, rank: 2, pair: pairLabel(1002), category: "traditional", score: 4.7, votes: 14311 },
        { id: 1006, rank: 3, pair: pairLabel(1006), category: "beer", score: 4.6, votes: 12010 },
      ],
      soju: [
        { id: 1007, rank: 1, pair: pairLabel(1007), category: "soju", score: 4.6, votes: 5981 },
        { id: 1014, rank: 2, pair: pairLabel(1014), category: "soju", score: 4.5, votes: 8122 },
        { id: 1015, rank: 3, pair: pairLabel(1015), category: "soju", score: 4.4, votes: 3891 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: pairLabel(1005), category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1016, rank: 2, pair: pairLabel(1016), category: "wine", score: 4.6, votes: 8011, thumbVariant: "bottle" },
        { id: 1017, rank: 3, pair: pairLabel(1017), category: "wine", score: 4.5, votes: 8494, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: pairLabel(1006), category: "beer", score: 4.6, votes: 12010 },
        { id: 1010, rank: 2, pair: pairLabel(1010), category: "beer", score: 4.5, votes: 10481 },
        { id: 1018, rank: 3, pair: pairLabel(1018), category: "beer", score: 4.4, votes: 8122 },
      ],
      whisky: [
        { id: 1011, rank: 1, pair: pairLabel(1011), category: "whisky", score: 4.7, votes: 3214 },
        { id: 1019, rank: 2, pair: pairLabel(1019), category: "whisky", score: 4.5, votes: 8122 },
        { id: 1020, rank: 3, pair: pairLabel(1020), category: "whisky", score: 4.4, votes: 7621 },
      ],
      spirits: [
        { id: 1003, rank: 1, pair: pairLabel(1003), category: "spirits", score: 4.6, votes: 4230 },
        { id: 1013, rank: 2, pair: pairLabel(1013), category: "spirits", score: 4.5, votes: 3608 },
        { id: 1024, rank: 3, pair: pairLabel(1024), category: "spirits", score: 4.4, votes: 8122 },
      ],
      traditional: [
        { id: 1002, rank: 1, pair: pairLabel(1002), category: "traditional", score: 4.7, votes: 14311 },
        { id: 1021, rank: 2, pair: pairLabel(1021), category: "traditional", score: 4.6, votes: 5981 },
        { id: 1022, rank: 3, pair: pairLabel(1022), category: "traditional", score: 4.5, votes: 3891 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: pairLabel(1004), category: "sake", score: 4.6, votes: 3328 },
        { id: 1008, rank: 2, pair: pairLabel(1008), category: "sake", score: 4.5, votes: 2890 },
        { id: 1012, rank: 3, pair: pairLabel(1012), category: "sake", score: 4.4, votes: 2542 },
      ],
      etc: [
        { id: 1009, rank: 1, pair: pairLabel(1009), category: "etc", score: 4.6, votes: 8011 },
        { id: 1001, rank: 2, pair: pairLabel(1001), category: "etc", score: 4.5, votes: 8122 },
        { id: 1023, rank: 3, pair: pairLabel(1023), category: "etc", score: 4.4, votes: 7621 },
      ],
    },
    rows: [
      { id: 1009, rank: 4, pair: pairLabel(1009), category: "etc", score: 4.6, votes: 8011, delta: "+2" },
      { id: 1010, rank: 5, pair: pairLabel(1010), category: "beer", score: 4.5, votes: 10481, delta: "+1" },
      { id: 1001, rank: 6, pair: pairLabel(1001), category: "etc", score: 4.5, votes: 8122, delta: "–" },
      { id: 1007, rank: 7, pair: pairLabel(1007), category: "soju", score: 4.6, votes: 5981, delta: "+3" },
      { id: 1011, rank: 8, pair: pairLabel(1011), category: "whisky", score: 4.7, votes: 3214, delta: "-1" },
      { id: 1004, rank: 9, pair: pairLabel(1004), category: "sake", score: 4.4, votes: 2542, delta: "+1" },
      { id: 1006, rank: 10, pair: pairLabel(1006), category: "beer", score: 4.6, votes: 12010, delta: "+5" },
    ],
  },
  daily: {
    podiumByCategory: {
      all: [
        { id: 1006, rank: 1, pair: pairLabel(1006), category: "beer", score: 98.9 },
        { id: 1010, rank: 2, pair: pairLabel(1010), category: "beer", score: 97.4 },
        { id: 1005, rank: 3, pair: pairLabel(1005), category: "wine", score: 96.2, thumbVariant: "bottle" },
      ],
      soju: [
        { id: 1007, rank: 1, pair: pairLabel(1007), category: "soju", score: 98.9 },
        { id: 1014, rank: 2, pair: pairLabel(1014), category: "soju", score: 97.3 },
        { id: 1015, rank: 3, pair: pairLabel(1015), category: "soju", score: 96.0 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: pairLabel(1005), category: "wine", score: 97.2, thumbVariant: "bottle" },
        { id: 1016, rank: 2, pair: pairLabel(1016), category: "wine", score: 96.6, thumbVariant: "bottle" },
        { id: 1017, rank: 3, pair: pairLabel(1017), category: "wine", score: 95.9, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: pairLabel(1006), category: "beer", score: 97.4 },
        { id: 1010, rank: 2, pair: pairLabel(1010), category: "beer", score: 96.5 },
        { id: 1018, rank: 3, pair: pairLabel(1018), category: "beer", score: 95.6 },
      ],
      whisky: [
        { id: 1011, rank: 1, pair: pairLabel(1011), category: "whisky", score: 97.0 },
        { id: 1019, rank: 2, pair: pairLabel(1019), category: "whisky", score: 96.1 },
        { id: 1020, rank: 3, pair: pairLabel(1020), category: "whisky", score: 95.3 },
      ],
      spirits: [
        { id: 1003, rank: 1, pair: pairLabel(1003), category: "spirits", score: 96.7 },
        { id: 1013, rank: 2, pair: pairLabel(1013), category: "spirits", score: 95.8 },
        { id: 1024, rank: 3, pair: pairLabel(1024), category: "spirits", score: 95.1 },
      ],
      traditional: [
        { id: 1002, rank: 1, pair: pairLabel(1002), category: "traditional", score: 96.8 },
        { id: 1021, rank: 2, pair: pairLabel(1021), category: "traditional", score: 95.9 },
        { id: 1022, rank: 3, pair: pairLabel(1022), category: "traditional", score: 95.0 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: pairLabel(1004), category: "sake", score: 96.4 },
        { id: 1008, rank: 2, pair: pairLabel(1008), category: "sake", score: 95.7 },
        { id: 1012, rank: 3, pair: pairLabel(1012), category: "sake", score: 94.8 },
      ],
      etc: [
        { id: 1001, rank: 1, pair: pairLabel(1001), category: "etc", score: 96.1 },
        { id: 1009, rank: 2, pair: pairLabel(1009), category: "etc", score: 95.4 },
        { id: 1023, rank: 3, pair: pairLabel(1023), category: "etc", score: 94.6 },
      ],
    },
    rows: [
      { id: 1005, rank: 4, pair: pairLabel(1005), category: "wine", score: 97.0, votes: 1302, delta: "+1" },
      { id: 1010, rank: 5, pair: pairLabel(1010), category: "beer", score: 96.5, votes: 1890, delta: "-1" },
      { id: 1002, rank: 6, pair: pairLabel(1002), category: "traditional", score: 96.8, votes: 1542, delta: "+3" },
      { id: 1004, rank: 7, pair: pairLabel(1004), category: "sake", score: 96.4, votes: 1401, delta: "–" },
      { id: 1009, rank: 8, pair: pairLabel(1009), category: "etc", score: 96.6, votes: 1302, delta: "+2" },
      { id: 1007, rank: 9, pair: pairLabel(1007), category: "soju", score: 97.3, votes: 2109, delta: "+1" },
      { id: 1001, rank: 10, pair: pairLabel(1001), category: "etc", score: 96.1, votes: 1903, delta: "-2" },
    ],
  },
  monthly: {
    podiumByCategory: {
      all: [
        { id: 1005, rank: 1, pair: pairLabel(1005), category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1006, rank: 2, pair: pairLabel(1006), category: "beer", score: 4.7, votes: 14950 },
        { id: 1002, rank: 3, pair: pairLabel(1002), category: "traditional", score: 4.7, votes: 14311 },
      ],
      soju: [
        { id: 1007, rank: 1, pair: pairLabel(1007), category: "soju", score: 4.7, votes: 13112 },
        { id: 1014, rank: 2, pair: pairLabel(1014), category: "soju", score: 4.6, votes: 11023 },
        { id: 1015, rank: 3, pair: pairLabel(1015), category: "soju", score: 4.5, votes: 10291 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: pairLabel(1005), category: "wine", score: 4.8, votes: 15432, thumbVariant: "bottle" },
        { id: 1016, rank: 2, pair: pairLabel(1016), category: "wine", score: 4.7, votes: 12018, thumbVariant: "bottle" },
        { id: 1017, rank: 3, pair: pairLabel(1017), category: "wine", score: 4.6, votes: 9850, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: pairLabel(1006), category: "beer", score: 4.7, votes: 14950 },
        { id: 1010, rank: 2, pair: pairLabel(1010), category: "beer", score: 4.6, votes: 10481 },
        { id: 1018, rank: 3, pair: pairLabel(1018), category: "beer", score: 4.5, votes: 8832 },
      ],
      whisky: [
        { id: 1011, rank: 1, pair: pairLabel(1011), category: "whisky", score: 4.6, votes: 8021 },
        { id: 1019, rank: 2, pair: pairLabel(1019), category: "whisky", score: 4.5, votes: 7320 },
        { id: 1020, rank: 3, pair: pairLabel(1020), category: "whisky", score: 4.4, votes: 6902 },
      ],
      spirits: [
        { id: 1003, rank: 1, pair: pairLabel(1003), category: "spirits", score: 4.6, votes: 7420 },
        { id: 1013, rank: 2, pair: pairLabel(1013), category: "spirits", score: 4.5, votes: 6218 },
        { id: 1024, rank: 3, pair: pairLabel(1024), category: "spirits", score: 4.4, votes: 7320 },
      ],
      traditional: [
        { id: 1002, rank: 1, pair: pairLabel(1002), category: "traditional", score: 4.7, votes: 14311 },
        { id: 1021, rank: 2, pair: pairLabel(1021), category: "traditional", score: 4.7, votes: 10320 },
        { id: 1022, rank: 3, pair: pairLabel(1022), category: "traditional", score: 4.6, votes: 9108 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: pairLabel(1004), category: "sake", score: 4.6, votes: 8328 },
        { id: 1008, rank: 2, pair: pairLabel(1008), category: "sake", score: 4.5, votes: 7890 },
        { id: 1012, rank: 3, pair: pairLabel(1012), category: "sake", score: 4.4, votes: 7542 },
      ],
      etc: [
        { id: 1009, rank: 1, pair: pairLabel(1009), category: "etc", score: 4.6, votes: 8011 },
        { id: 1001, rank: 2, pair: pairLabel(1001), category: "etc", score: 4.5, votes: 7740 },
        { id: 1023, rank: 3, pair: pairLabel(1023), category: "etc", score: 4.4, votes: 7405 },
      ],
    },
    rows: [
      { id: 1010, rank: 4, pair: pairLabel(1010), category: "beer", score: 4.6, votes: 10481, delta: "+1" },
      { id: 1007, rank: 5, pair: pairLabel(1007), category: "soju", score: 4.7, votes: 10320, delta: "+2" },
      { id: 1005, rank: 6, pair: pairLabel(1005), category: "wine", score: 4.7, votes: 12018, delta: "-1" },
      { id: 1011, rank: 7, pair: pairLabel(1011), category: "whisky", score: 4.6, votes: 8021, delta: "+3" },
      { id: 1004, rank: 8, pair: pairLabel(1004), category: "sake", score: 4.6, votes: 8328, delta: "–" },
      { id: 1001, rank: 9, pair: pairLabel(1001), category: "etc", score: 4.7, votes: 13112, delta: "+1" },
      { id: 1009, rank: 10, pair: pairLabel(1009), category: "etc", score: 4.5, votes: 7320, delta: "-2" },
    ],
  },
  all: {
    podiumByCategory: {
      all: [
        { id: 1005, rank: 1, pair: pairLabel(1005), category: "wine", score: 4.9, votes: 54321, thumbVariant: "bottle" },
        { id: 1002, rank: 2, pair: pairLabel(1002), category: "traditional", score: 4.8, votes: 49872 },
        { id: 1006, rank: 3, pair: pairLabel(1006), category: "beer", score: 4.7, votes: 46310 },
      ],
      soju: [
        { id: 1007, rank: 1, pair: pairLabel(1007), category: "soju", score: 4.8, votes: 49872 },
        { id: 1014, rank: 2, pair: pairLabel(1014), category: "soju", score: 4.7, votes: 40318 },
        { id: 1015, rank: 3, pair: pairLabel(1015), category: "soju", score: 4.6, votes: 38012 },
      ],
      wine: [
        { id: 1005, rank: 1, pair: pairLabel(1005), category: "wine", score: 4.9, votes: 54321, thumbVariant: "bottle" },
        { id: 1016, rank: 2, pair: pairLabel(1016), category: "wine", score: 4.8, votes: 45102, thumbVariant: "bottle" },
        { id: 1017, rank: 3, pair: pairLabel(1017), category: "wine", score: 4.7, votes: 32018, thumbVariant: "bottle" },
      ],
      beer: [
        { id: 1006, rank: 1, pair: pairLabel(1006), category: "beer", score: 4.7, votes: 46310 },
        { id: 1010, rank: 2, pair: pairLabel(1010), category: "beer", score: 4.6, votes: 35198 },
        { id: 1018, rank: 3, pair: pairLabel(1018), category: "beer", score: 4.5, votes: 29012 },
      ],
      whisky: [
        { id: 1011, rank: 1, pair: pairLabel(1011), category: "whisky", score: 4.7, votes: 28021 },
        { id: 1019, rank: 2, pair: pairLabel(1019), category: "whisky", score: 4.6, votes: 26011 },
        { id: 1020, rank: 3, pair: pairLabel(1020), category: "whisky", score: 4.5, votes: 23002 },
      ],
      spirits: [
        { id: 1003, rank: 1, pair: pairLabel(1003), category: "spirits", score: 4.6, votes: 22014 },
        { id: 1013, rank: 2, pair: pairLabel(1013), category: "spirits", score: 4.5, votes: 20130 },
        { id: 1024, rank: 3, pair: pairLabel(1024), category: "spirits", score: 4.4, votes: 19002 },
      ],
      traditional: [
        { id: 1002, rank: 1, pair: pairLabel(1002), category: "traditional", score: 4.7, votes: 24011 },
        { id: 1021, rank: 2, pair: pairLabel(1021), category: "traditional", score: 4.7, votes: 21098 },
        { id: 1022, rank: 3, pair: pairLabel(1022), category: "traditional", score: 4.6, votes: 19012 },
      ],
      sake: [
        { id: 1004, rank: 1, pair: pairLabel(1004), category: "sake", score: 4.6, votes: 18021 },
        { id: 1008, rank: 2, pair: pairLabel(1008), category: "sake", score: 4.5, votes: 17003 },
        { id: 1012, rank: 3, pair: pairLabel(1012), category: "sake", score: 4.4, votes: 16011 },
      ],
      etc: [
        { id: 1009, rank: 1, pair: pairLabel(1009), category: "etc", score: 4.6, votes: 15011 },
        { id: 1001, rank: 2, pair: pairLabel(1001), category: "etc", score: 4.5, votes: 14002 },
        { id: 1023, rank: 3, pair: pairLabel(1023), category: "etc", score: 4.4, votes: 13005 },
      ],
    },
    rows: [
      { id: 1009, rank: 4, pair: pairLabel(1009), category: "etc", score: 4.8, votes: 45102, delta: "+3" },
      { id: 1002, rank: 5, pair: pairLabel(1002), category: "traditional", score: 4.7, votes: 24011, delta: "+2" },
      { id: 1011, rank: 6, pair: pairLabel(1011), category: "whisky", score: 4.7, votes: 28021, delta: "-1" },
      { id: 1010, rank: 7, pair: pairLabel(1010), category: "beer", score: 4.6, votes: 35198, delta: "+1" },
      { id: 1004, rank: 8, pair: pairLabel(1004), category: "sake", score: 4.6, votes: 18021, delta: "–" },
      { id: 1001, rank: 9, pair: pairLabel(1001), category: "etc", score: 4.6, votes: 26011, delta: "+1" },
      { id: 1006, rank: 10, pair: pairLabel(1006), category: "beer", score: 4.5, votes: 23002, delta: "-2" },
    ],
  },
}

const weeklyAll = rankingDataByPeriod.weekly
const weeklyTop5Entries = [
  ...weeklyAll.podiumByCategory.all,
  ...weeklyAll.rows.filter((r) => r.rank === 4 || r.rank === 5).sort((a, b) => a.rank - b.rank),
]

export type HomeRankingItem = PairMeta & { rating: number; count: number }

export const weeklyAllTop5 = weeklyTop5Entries.map((entry) => {
  const meta = pairMetaById[entry.id]
  return { ...meta, rating: entry.score, count: entry.votes ?? 0 }
}) as [HomeRankingItem, HomeRankingItem, HomeRankingItem, HomeRankingItem, HomeRankingItem]
