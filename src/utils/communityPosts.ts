export type FeedPost = {
  id: number
  authorId: number
  authorName?: string
  title: string
  body: string
  pairingSummary?: string
  photoIds?: string[]
  createdAt: string
  likeCount: number
  commentCount: number
  popularityScore: number
  locationLabel?: string
  isQna?: boolean
  answerPreview?: string
  answerCount?: number
  searchTags?: string[]
  drinkType?: string
  categories?: string[]
  detailCategories?: string[]
  features?: string[]
  foods?: string[]
  priceWon?: number
  abv?: number
}

export const extractPairingTitle = (title: string) => {
  const match = title.match(/([^\n+]{2,}?)\s*\+\s*([^\n+]{2,}?)(?=[,.\n]|$)/)
  if (!match) {
    return title
  }
  const left = match[1].trim()
  const right = match[2].trim()
  return `${left} + ${right}`
}

export const getPairingTagsFromTitle = (title: string) => {
  const pairingTitle = extractPairingTitle(title)
  if (!pairingTitle.includes("+")) return { liquorTag: "", foodTag: "" }
  const [left, right] = pairingTitle.split("+").map((value) => value.trim())
  return { liquorTag: left ?? "", foodTag: right ?? "" }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const getPairingSummaryText = (post: Pick<FeedPost, "pairingSummary" | "body" | "title">) => {
  const summary = post.pairingSummary?.trim()
  if (summary) return summary

  const body = post.body?.trim()
  if (!body) return ""

  const firstSentence = body.split(/[.!?]\s+/)[0]?.trim()
  if (firstSentence) return firstSentence

  return body.split("\n")[0]?.trim() ?? ""
}

export const getPairingDetailBodyText = (post: Pick<FeedPost, "pairingSummary" | "body" | "title">, summaryText = "") => {
  const body = post.body?.trim() ?? ""
  if (!body) return ""

  const summary = summaryText.trim() || post.pairingSummary?.trim() || ""
  const title = post.title?.trim() ?? ""

  for (const prefix of [summary, title]) {
    if (!prefix) continue
    const stripped = body.replace(new RegExp(`^${escapeRegExp(prefix)}[\\s.。!?…-]*`, "u"), "").trim()
    if (stripped && stripped !== body) return stripped
  }

  return body
}

export const feedPosts: FeedPost[] = [
  {
    id: 1001,
    authorId: 2003,
    title: "하이볼 + 삼겹살",
    body: "집에서 해먹을 때는 기름기 있는 부위일수록 도수/탄산 선택이 달라지더라고요. 저만의 기준 공유합니다.",
    createdAt: "2026-05-01T09:12:00+09:00",
    likeCount: 320,
    commentCount: 28,
    popularityScore: 402,
    locationLabel: "아늑한 내방",
    searchTags: ["기타", "하이볼", "소주토닉", "삼겹살", "가벼운", "톡쏘는", "과일향"],
    drinkType: "기타",
    categories: ["하이볼"],
    detailCategories: ["소주토닉"],
    features: ["가벼운", "톡쏘는", "과일향"],
    foods: ["삼겹살"],
    priceWon: 15000,
    abv: 9,
  },
  {
    id: 1002,
    authorId: 2001,
    title: "막걸리 + 해물파전",
    body: "바삭한 전이랑 산미 있는 막걸리 조합이 너무 좋아요. 추천 막걸리 있으면 알려주세요.",
    createdAt: "2026-04-30T21:40:00+09:00",
    likeCount: 188,
    commentCount: 19,
    popularityScore: 260,
    locationLabel: "비 오는 베란다",
    searchTags: ["전통주", "막걸리", "해물파전", "부드러운", "가벼운"],
    drinkType: "전통주",
    categories: ["막걸리"],
    detailCategories: ["비살균"],
    features: ["부드러운", "가벼운"],
    foods: ["해물파전"],
    priceWon: 12000,
    abv: 6,
  },
  {
    id: 1003,
    authorId: 2003,
    title: "첫 위스키 입문 후기 공유해요",
    body: "처음은 버번 하이볼로 시작했는데 생각보다 부담 없고 달달해서 좋았어요. 다음은 스카치도 도전해보려구요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 96,
    commentCount: 34,
    popularityScore: 330,
    locationLabel: "자주가는 바",
    isQna: true,
    searchTags: ["위스키", "하이볼", "버번", "부드러운", "무거운", "오크향"],
    drinkType: "위스키",
    categories: ["하이볼"],
    detailCategories: ["버번"],
    features: ["부드러운", "무거운", "오크향"],
    foods: ["치즈"],
    priceWon: 79000,
    abv: 40,
  },
  {
    id: 1004,
    authorId: 2004,
    title: "사케에 잘 맞는 집안주 몇 개 추천",
    body: "사시미 없을 때는 가라아게/오뎅/명란구이 조합이 제일 무난했어요. 차갑게 마시면 기름기도 잘 잡히더라구요.",
    createdAt: "2026-04-29T18:05:00+09:00",
    likeCount: 84,
    commentCount: 21,
    popularityScore: 210,
    locationLabel: "늦은 밤 식탁",
    isQna: true,
    searchTags: ["사케", "사케준마이", "가라아게", "부드러운", "가벼운", "오뎅", "명란구이"],
    drinkType: "사케",
    categories: ["사케준마이"],
    detailCategories: ["준마이"],
    features: ["부드러운", "가벼운"],
    foods: ["가라아게", "오뎅", "명란구이"],
    priceWon: 33000,
    abv: 15,
  },
  {
    id: 1005,
    authorId: 2001,
    title: "레드 와인 + 스테이크",
    body: "레어로 구웠을 때 탄닌이 기름을 잡아주는 느낌이 확실히 있어요. 소스는 과하지 않게!",
    createdAt: "2026-04-28T22:15:00+09:00",
    likeCount: 540,
    commentCount: 63,
    popularityScore: 720,
    locationLabel: "아늑한 우리집",
    searchTags: ["와인", "레드", "스테이크", "오크숙성", "무거운", "오크향"],
    drinkType: "와인",
    categories: ["레드"],
    detailCategories: ["오크숙성"],
    features: ["무거운", "오크향"],
    foods: ["스테이크"],
    priceWon: 29000,
    abv: 13,
  },
  {
    id: 1006,
    authorId: 2002,
    title: "IPA + 햄버거",
    body: "홉의 씁쓸함이 느끼함을 잡아주고 향이 치즈랑 잘 맞아요. 추천 IPA도 남겨요.",
    createdAt: "2026-04-27T20:33:00+09:00",
    likeCount: 410,
    commentCount: 40,
    popularityScore: 590,
    locationLabel: "햇살 드는 거실",
    searchTags: ["맥주", "IPA", "크래프트", "뉴잉글랜드", "부드러운", "과일향", "햄버거", "치즈"],
    drinkType: "맥주",
    categories: ["IPA", "크래프트"],
    detailCategories: ["뉴잉글랜드"],
    features: ["부드러운", "과일향"],
    foods: ["햄버거", "치즈"],
    priceWon: 9000,
    abv: 6.5,
  },
  {
    id: 1007,
    authorId: 2101,
    title: "소주 + 족발",
    body: "족발은 기름질 것 같지만 새우젓/마늘이랑 같이 먹으면 소주가 느끼함을 잘 잡아줘요.",
    createdAt: "2026-05-01T08:02:00+09:00",
    likeCount: 66,
    commentCount: 11,
    popularityScore: 120,
    locationLabel: "우리집 야식상",
    searchTags: ["소주", "증류주", "족발", "부드러운", "무거운"],
    drinkType: "소주",
    categories: ["증류주"],
    detailCategories: ["블렌디드"],
    features: ["부드러운", "무거운"],
    foods: ["족발"],
    priceWon: 10000,
    abv: 17,
  },
  {
    id: 1008,
    authorId: 2104,
    title: "회 먹을 때는 전 사케파예요",
    body: "간장/와사비가 강한 날엔 사케가 감칠맛이랑 잘 맞고, 산뜻하게 먹고 싶으면 화이트 와인도 좋아요. 저는 보통 사케로 갑니다.",
    createdAt: "2026-04-30T23:55:00+09:00",
    likeCount: 51,
    commentCount: 17,
    popularityScore: 160,
    locationLabel: "작은 주방 테이블",
    isQna: true,
    searchTags: ["사케", "사케준마이", "회", "부드러운", "가벼운"],
    drinkType: "사케",
    categories: ["사케준마이"],
    detailCategories: ["긴죠"],
    features: ["과일향", "가벼운"],
    foods: ["회"],
    priceWon: 28000,
    abv: 15,
  },
  {
    id: 1009,
    authorId: 2102,
    title: "칵테일 + 타코",
    body: "라임/시트러스 계열이 타코의 향신료랑 잘 붙는 느낌. 데킬라 베이스 추천!",
    createdAt: "2026-04-30T12:20:00+09:00",
    likeCount: 140,
    commentCount: 22,
    popularityScore: 310,
    locationLabel: "친구들과 홈파티",
    searchTags: ["기타", "칵테일", "시트러스", "톡쏘는", "과일향", "타코"],
    drinkType: "기타",
    categories: ["칵테일"],
    detailCategories: ["시트러스"],
    features: ["톡쏘는", "과일향"],
    foods: ["타코"],
    priceWon: 18000,
    abv: 12,
  },
  {
    id: 1010,
    authorId: 2103,
    title: "라거 + 감자튀김",
    body: "짭짤함이랑 탄산/청량감 조합은 실패가 없네요. 소금 대신 시즈닝 바꿔도 좋고요.",
    createdAt: "2026-04-29T20:10:00+09:00",
    likeCount: 92,
    commentCount: 9,
    popularityScore: 180,
    locationLabel: "퇴근 후 소파 앞",
    searchTags: ["맥주", "라거/필스너", "드라이", "가벼운", "감자튀김"],
    drinkType: "맥주",
    categories: ["라거/필스너"],
    detailCategories: ["드라이"],
    features: ["가벼운"],
    foods: ["감자튀김"],
    priceWon: 8000,
    abv: 5,
  },
  {
    id: 1011,
    authorId: 2019,
    title: "버번 + 다크초콜릿",
    body: "달달한 버번이랑 쌉싸름한 다크초콜릿 같이 먹으니까 밸런스가 딱이었어요. 늦은 밤에 한 잔 하기 좋네요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 97,
    commentCount: 34,
    popularityScore: 330,
    locationLabel: "잔잔한 밤 방구석",
    isQna: true,
    searchTags: ["위스키", "증류주", "싱글몰트", "무거운", "오크향", "부드러운", "다크초콜릿"],
    drinkType: "위스키",
    categories: ["증류주"],
    detailCategories: ["싱글몰트"],
    features: ["무거운", "오크향", "부드러운"],
    foods: ["다크초콜릿"],
    priceWon: 99000,
    abv: 45,
  },
  {
    id: 1012,
    authorId: 2025,
    title: "주말 홈파티 페어링 기록",
    body: "라거 + 치킨은 역시 실패가 없고, 막걸리 + 해물파전도 반응이 좋았어요. 다음엔 와인 쪽도 준비해보려구요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 98,
    commentCount: 34,
    popularityScore: 330,
    locationLabel: "주말 홈파티",
    isQna: true,
    searchTags: ["맥주", "라거/필스너", "치킨", "가벼운", "톡쏘는", "전통주", "막걸리", "해물파전"],
    drinkType: "맥주",
    categories: ["라거/필스너"],
    detailCategories: ["클래식"],
    features: ["가벼운", "톡쏘는"],
    foods: ["치킨", "해물파전"],
    priceWon: 16000,
    abv: 5,
  },
]

