import { pairMetaById } from "./rankingData"

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
    const stripped = body.replace(new RegExp(`^${escapeRegExp(prefix)}[\\s.?!。！？]*`, "u"), "").trim()
    if (stripped && stripped !== body) return stripped
  }

  return body
}

const getMockPhotoIds = (postId: number) => {
  const count = Math.abs(postId) % 4 // 0~3
  if (count === 0) return undefined
  return Array.from({ length: count }).map((_, index) => `mock-photo-${postId}-${index + 1}`)
}

const pairTitle = (id: number) => {
  const meta = pairMetaById[id]
  return `${meta.drink} + ${meta.food}`
}

type PairPostSeed = {
  id: number
  authorId: number
  createdAt: string
  likeCount: number
  commentCount: number
  popularityScore: number
  locationLabel: string
  drinkType: string
  categories: string[]
  detailCategories: string[]
  features: string[]
  priceWon: number
  abv: number
  summary: string
  body: string
}

const pairPostSeeds: PairPostSeed[] = [
  {
    id: 1001,
    authorId: 2003,
    createdAt: "2026-05-01T09:12:00+09:00",
    likeCount: 320,
    commentCount: 28,
    popularityScore: 402,
    locationLabel: "집 앞 편의점",
    drinkType: "기타",
    categories: ["하이볼"],
    detailCategories: ["캔 하이볼"],
    features: ["청량한", "가벼운", "달콤한"],
    priceWon: 4500,
    abv: 5,
    summary: "짐빔 하이볼 + 삼겹살",
    body: "삼겹살을 굽는 날에는 맥주보다 짐빔 하이볼 캔이 더 잘 맞았어요. 탄산감이 살아 있어서 느끼함이 덜하고, 캔이라 준비가 편한 것도 장점입니다.",
  },
  {
    id: 1002,
    authorId: 2001,
    createdAt: "2026-04-30T21:40:00+09:00",
    likeCount: 188,
    commentCount: 19,
    popularityScore: 260,
    locationLabel: "비 오는 날 베란다",
    drinkType: "전통주",
    categories: ["막걸리"],
    detailCategories: ["생막걸리"],
    features: ["부드러운", "고소한", "가벼운"],
    priceWon: 2200,
    abv: 6,
    summary: "서울 장수 막걸리 + 해물파전",
    body: "파전 가장자리를 바삭하게 부치고 차갑게 식힌 서울 장수 막걸리를 곁들이면 부담 없이 오래 먹기 좋아요.",
  },
  {
    id: 1003,
    authorId: 2003,
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 96,
    commentCount: 34,
    popularityScore: 330,
    locationLabel: "친구들과 타코 밤",
    drinkType: "증류주",
    categories: ["데킬라"],
    detailCategories: ["블랑코"],
    features: ["강한", "상큼한", "드라이한"],
    priceWon: 35000,
    abv: 38,
    summary: "호세 쿠엘보 에스페셜 + 타코",
    body: "소금과 라임을 곁들이면 타코의 매콤함이 더 선명해집니다. 과하게 차갑게 하기보다 살짝 시원한 정도가 좋았어요.",
  },
  {
    id: 1004,
    authorId: 2004,
    createdAt: "2026-04-29T18:05:00+09:00",
    likeCount: 84,
    commentCount: 21,
    popularityScore: 210,
    locationLabel: "집 안주 테스트",
    drinkType: "사케",
    categories: ["준마이"],
    detailCategories: ["준마이"],
    features: ["부드러운", "담백한", "깔끔한"],
    priceWon: 33000,
    abv: 15,
    summary: "하쿠츠루 준마이 사케 + 가라아게",
    body: "가라아게에 레몬을 살짝 뿌리고 차갑게 식힌 사케를 곁들이면 집에서도 이자카야 느낌이 납니다.",
  },
  {
    id: 1005,
    authorId: 2001,
    createdAt: "2026-04-28T22:15:00+09:00",
    likeCount: 540,
    commentCount: 63,
    popularityScore: 720,
    locationLabel: "오늘의 홈스테이크",
    drinkType: "와인",
    categories: ["레드와인"],
    detailCategories: ["카베르네 소비뇽"],
    features: ["묵직한", "드라이한", "오크향"],
    priceWon: 29000,
    abv: 13,
    summary: "몬테스 클래식 카베르네 소비뇽 + 스테이크",
    body: "후추를 넉넉히 뿌린 스테이크와 함께 마시면 탄닌감이 고기의 풍미를 받쳐줍니다. 소스는 너무 달지 않은 쪽이 좋아요.",
  },
  {
    id: 1006,
    authorId: 2002,
    createdAt: "2026-04-27T20:33:00+09:00",
    likeCount: 410,
    commentCount: 40,
    popularityScore: 590,
    locationLabel: "금요일 저녁 거실",
    drinkType: "맥주",
    categories: ["IPA"],
    detailCategories: ["크래프트"],
    features: ["쌉쌀한", "향긋한", "청량한"],
    priceWon: 9000,
    abv: 5.9,
    summary: "구스 아일랜드 IPA + 햄버거",
    body: "진한 소스가 들어간 햄버거일수록 IPA의 쌉쌀함이 잘 맞습니다. 감자튀김까지 있으면 더 안정적인 조합이에요.",
  },
  {
    id: 1007,
    authorId: 2101,
    createdAt: "2026-05-01T08:02:00+09:00",
    likeCount: 166,
    commentCount: 21,
    popularityScore: 260,
    locationLabel: "동네 족발집",
    drinkType: "소주",
    categories: ["소주"],
    detailCategories: ["오리지널"],
    features: ["깔끔한", "드라이한", "묵직한"],
    priceWon: 1800,
    abv: 20.1,
    summary: "참이슬 오리지널 + 족발",
    body: "마늘, 새우젓, 쌈장까지 같이 먹을 때도 맛이 흐트러지지 않아서 족발에는 역시 클래식 소주가 편합니다.",
  },
  {
    id: 1008,
    authorId: 2104,
    createdAt: "2026-04-30T23:55:00+09:00",
    likeCount: 151,
    commentCount: 27,
    popularityScore: 260,
    locationLabel: "늦은 밤 식탁",
    drinkType: "사케",
    categories: ["준마이 다이긴죠"],
    detailCategories: ["다이긴죠"],
    features: ["향긋한", "깔끔한", "가벼운"],
    priceWon: 65000,
    abv: 16,
    summary: "닷사이 45 사케 + 명란구이",
    body: "명란구이를 너무 짜지 않게 굽고 마요네즈를 조금 곁들이면 닷사이 45의 향이 더 잘 살아납니다.",
  },
  {
    id: 1009,
    authorId: 2102,
    createdAt: "2026-04-30T12:20:00+09:00",
    likeCount: 140,
    commentCount: 22,
    popularityScore: 310,
    locationLabel: "친구들과 홈파티",
    drinkType: "기타",
    categories: ["칵테일"],
    detailCategories: ["럼 베이스"],
    features: ["상큼한", "달콤한", "청량한"],
    priceWon: 18000,
    abv: 12,
    summary: "모히토 (바카디) + 타코",
    body: "민트와 라임을 넉넉히 넣으면 타코의 향신료와 잘 붙습니다. 맵게 먹는 날에는 얼음을 충분히 넣어주세요.",
  },
  {
    id: 1010,
    authorId: 2103,
    createdAt: "2026-04-29T20:10:00+09:00",
    likeCount: 192,
    commentCount: 19,
    popularityScore: 280,
    locationLabel: "퇴근 후 소파",
    drinkType: "맥주",
    categories: ["라거"],
    detailCategories: ["페일 라거"],
    features: ["청량한", "가벼운", "깔끔한"],
    priceWon: 3500,
    abv: 5,
    summary: "하이네켄 + 감자튀김",
    body: "튀김이 식기 전에 차갑게 마시면 탄산감이 기름기를 잘 씻어줍니다. 케첩보다 아이올리 소스와도 잘 맞았어요.",
  },
  {
    id: 1011,
    authorId: 2019,
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 197,
    commentCount: 34,
    popularityScore: 330,
    locationLabel: "혼술 바 테이블",
    drinkType: "위스키",
    categories: ["버번"],
    detailCategories: ["켄터키 버번"],
    features: ["달콤한", "오크향", "묵직한"],
    priceWon: 59000,
    abv: 45,
    summary: "메이커스 마크 + 다크초콜릿",
    body: "초콜릿은 너무 단 것보다 카카오 함량이 높은 쪽이 좋습니다. 작은 잔에 천천히 마시면 향이 길게 남아요.",
  },
  {
    id: 1012,
    authorId: 2025,
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 198,
    commentCount: 34,
    popularityScore: 330,
    locationLabel: "주말 집술",
    drinkType: "사케",
    categories: ["사케"],
    detailCategories: ["팩 사케"],
    features: ["부드러운", "가벼운", "담백한"],
    priceWon: 16000,
    abv: 14.5,
    summary: "간바레 오토상 사케 + 오뎅탕",
    body: "따뜻한 오뎅탕에 차갑거나 미지근한 사케를 곁들이면 국물의 감칠맛이 더 편하게 느껴집니다.",
  },
  {
    id: 1013,
    authorId: 2102,
    createdAt: "2026-05-02T18:10:00+09:00",
    likeCount: 126,
    commentCount: 15,
    popularityScore: 240,
    locationLabel: "홈 바",
    drinkType: "증류주",
    categories: ["진"],
    detailCategories: ["런던 드라이 진"],
    features: ["향긋한", "드라이한", "깔끔한"],
    priceWon: 32000,
    abv: 47,
    summary: "봄베이 사파이어 + 올리브",
    body: "진토닉으로 마셔도 좋고, 아주 차갑게 만든 마티니 스타일로 올리브를 곁들여도 잘 어울립니다.",
  },
  {
    id: 1014,
    authorId: 2101,
    createdAt: "2026-05-02T19:22:00+09:00",
    likeCount: 210,
    commentCount: 18,
    popularityScore: 310,
    locationLabel: "고깃집",
    drinkType: "소주",
    categories: ["소주"],
    detailCategories: ["제로 슈거"],
    features: ["깔끔한", "가벼운", "드라이한"],
    priceWon: 1900,
    abv: 16,
    summary: "참이슬 새로 + 삼겹살",
    body: "쌈채소와 마늘을 곁들인 삼겹살에는 깔끔한 소주가 잘 맞습니다. 부담이 적어서 식사 자리에도 편해요.",
  },
  {
    id: 1015,
    authorId: 2001,
    createdAt: "2026-05-02T20:30:00+09:00",
    likeCount: 162,
    commentCount: 14,
    popularityScore: 250,
    locationLabel: "집밥 저녁",
    drinkType: "소주",
    categories: ["소주"],
    detailCategories: ["레트로 소주"],
    features: ["깔끔한", "부드러운", "드라이한"],
    priceWon: 1900,
    abv: 16.5,
    summary: "진로 이즈 백 + 김치찌개",
    body: "김치찌개가 조금 진할수록 소주의 깔끔함이 살아납니다. 두부와 돼지고기를 넉넉히 넣으면 더 좋았어요.",
  },
  {
    id: 1016,
    authorId: 2004,
    createdAt: "2026-05-03T19:00:00+09:00",
    likeCount: 138,
    commentCount: 16,
    popularityScore: 270,
    locationLabel: "와인 치즈 플레이트",
    drinkType: "와인",
    categories: ["레드와인"],
    detailCategories: ["카베르네 소비뇽"],
    features: ["과일향", "부드러운", "드라이한"],
    priceWon: 17000,
    abv: 13.5,
    summary: "옐로우 테일 카베르네 소비뇽 + 치즈",
    body: "체다나 고다처럼 너무 강하지 않은 치즈와 잘 맞습니다. 차갑지 않게 살짝 온도를 올려 마시면 과일 향이 살아나요.",
  },
  {
    id: 1017,
    authorId: 2019,
    createdAt: "2026-05-03T20:10:00+09:00",
    likeCount: 122,
    commentCount: 13,
    popularityScore: 230,
    locationLabel: "파스타 저녁",
    drinkType: "와인",
    categories: ["레드와인"],
    detailCategories: ["블렌드"],
    features: ["달콤한", "묵직한", "과일향"],
    priceWon: 22000,
    abv: 13.5,
    summary: "19 크라임스 레드 와인 + 라구 파스타",
    body: "진한 라구 소스에는 과일 향이 있는 레드 와인이 안정적입니다. 파마산을 올리면 와인의 단맛이 더 둥글게 느껴져요.",
  },
  {
    id: 1018,
    authorId: 2002,
    createdAt: "2026-05-03T21:25:00+09:00",
    likeCount: 174,
    commentCount: 19,
    popularityScore: 300,
    locationLabel: "치킨 포장한 밤",
    drinkType: "맥주",
    categories: ["IPA"],
    detailCategories: ["크래프트"],
    features: ["쌉쌀한", "향긋한", "청량한"],
    priceWon: 7500,
    abv: 5.6,
    summary: "브루독 펑크 IPA + 치킨",
    body: "후라이드 치킨과 가장 잘 맞고, 양념치킨과 먹을 때는 맥주의 쌉쌀함이 단맛을 눌러줍니다.",
  },
  {
    id: 1019,
    authorId: 2103,
    createdAt: "2026-05-04T18:40:00+09:00",
    likeCount: 116,
    commentCount: 11,
    popularityScore: 215,
    locationLabel: "바비큐 플레이트",
    drinkType: "위스키",
    categories: ["버번"],
    detailCategories: ["하이 프루프"],
    features: ["묵직한", "스모키한", "달콤한"],
    priceWon: 68000,
    abv: 50.5,
    summary: "와일드 터키 101 + 훈제 바비큐",
    body: "고기 맛이 진한 바비큐에는 도수가 있는 버번이 잘 버팁니다. 얼음을 조금 넣으면 단맛이 부드럽게 열려요.",
  },
  {
    id: 1020,
    authorId: 2003,
    createdAt: "2026-05-04T19:30:00+09:00",
    likeCount: 102,
    commentCount: 10,
    popularityScore: 200,
    locationLabel: "혼술 책상",
    drinkType: "위스키",
    categories: ["버번"],
    detailCategories: ["켄터키 버번"],
    features: ["부드러운", "바닐라", "오크향"],
    priceWon: 52000,
    abv: 45,
    summary: "버팔로 트레이스 + 견과류",
    body: "아몬드나 캐슈넛처럼 짠맛이 과하지 않은 견과류가 좋습니다. 니트로 마셔도 부담이 덜했어요.",
  },
  {
    id: 1021,
    authorId: 2001,
    createdAt: "2026-05-04T20:05:00+09:00",
    likeCount: 144,
    commentCount: 12,
    popularityScore: 255,
    locationLabel: "두부김치 한 접시",
    drinkType: "전통주",
    categories: ["막걸리"],
    detailCategories: ["쌀막걸리"],
    features: ["고소한", "부드러운", "가벼운"],
    priceWon: 2600,
    abv: 5,
    summary: "지평 막걸리 + 두부김치",
    body: "김치를 너무 달게 볶지 않고 두부를 따뜻하게 내면 막걸리의 고소함이 잘 살아납니다.",
  },
  {
    id: 1022,
    authorId: 2101,
    createdAt: "2026-05-04T21:15:00+09:00",
    likeCount: 132,
    commentCount: 12,
    popularityScore: 242,
    locationLabel: "감자전 부친 날",
    drinkType: "전통주",
    categories: ["막걸리"],
    detailCategories: ["프리미엄 막걸리"],
    features: ["부드러운", "고소한", "산뜻한"],
    priceWon: 3500,
    abv: 6,
    summary: "느린마을 막걸리 + 감자전",
    body: "감자전을 얇게 부쳐 바삭하게 먹으면 막걸리의 부드러운 질감과 대비가 좋아집니다.",
  },
  {
    id: 1023,
    authorId: 2104,
    createdAt: "2026-05-05T18:20:00+09:00",
    likeCount: 158,
    commentCount: 17,
    popularityScore: 275,
    locationLabel: "이자카야 스타일 집술",
    drinkType: "기타",
    categories: ["하이볼"],
    detailCategories: ["캔 하이볼"],
    features: ["청량한", "가벼운", "깔끔한"],
    priceWon: 4500,
    abv: 7,
    summary: "산토리 하이볼 캔 + 가라아게",
    body: "레몬을 곁들인 가라아게와 마시면 탄산감이 기름기를 씻어줘서 다음 한 입이 편합니다.",
  },
  {
    id: 1024,
    authorId: 2025,
    createdAt: "2026-05-05T19:10:00+09:00",
    likeCount: 118,
    commentCount: 11,
    popularityScore: 220,
    locationLabel: "가벼운 홈파티",
    drinkType: "증류주",
    categories: ["보드카"],
    detailCategories: ["보드카"],
    features: ["깔끔한", "드라이한", "청량한"],
    priceWon: 28000,
    abv: 40,
    summary: "앱솔루트 보드카 + 훈제연어",
    body: "토닉이나 탄산수와 가볍게 섞으면 훈제연어 카나페와 잘 맞습니다. 딜이나 레몬을 조금 더하면 더 산뜻해요.",
  },
]

const questionFeedPosts: FeedPost[] = [
  {
    id: 91001,
    authorId: 2003,
    title: "버번 입문, 메이커스 마크 다음으로 뭐가 좋을까요?",
    body: "메이커스 마크를 맛있게 마셨는데 다음 병을 고르려니 고민돼요. 너무 맵지 않고 바닐라 향이 있는 버번 추천 부탁드려요.",
    createdAt: "2026-05-05T21:20:00+09:00",
    likeCount: 42,
    commentCount: 7,
    popularityScore: 118,
    locationLabel: "자주가는 바",
    isQna: true,
    answerCount: 7,
    answerPreview: "와일드 터키 101은 힘이 있고, 버팔로 트레이스는 더 부드러워서 입문 다음 단계로 좋아요.",
    searchTags: ["위스키", "버번", "입문", "메이커스 마크", "와일드 터키", "버팔로 트레이스"],
    drinkType: "위스키",
    categories: ["버번"],
    detailCategories: ["켄터키 버번"],
    features: ["부드러운", "바닐라", "오크향"],
    foods: ["다크초콜릿", "견과류"],
    priceWon: 60000,
    abv: 45,
  },
  {
    id: 91002,
    authorId: 2104,
    title: "사케랑 집에서 먹기 좋은 안주 뭐가 있을까요?",
    body: "회 말고 집에서 간단히 준비할 수 있는 사케 안주를 찾고 있어요. 너무 무겁지 않고 만들기 쉬운 조합이면 좋겠습니다.",
    createdAt: "2026-05-04T22:05:00+09:00",
    likeCount: 38,
    commentCount: 6,
    popularityScore: 104,
    locationLabel: "집 안주 테스트",
    isQna: true,
    answerCount: 6,
    answerPreview: "가라아게, 명란구이, 오뎅탕처럼 짭짤하고 따뜻한 안주가 사케랑 잘 맞아요.",
    searchTags: ["사케", "집안주", "가라아게", "명란구이", "오뎅탕"],
    drinkType: "사케",
    categories: ["준마이", "사케"],
    detailCategories: ["준마이"],
    features: ["담백한", "깔끔한", "가벼운"],
    foods: ["가라아게", "명란구이", "오뎅탕"],
    priceWon: 30000,
    abv: 15,
  },
  {
    id: 91003,
    authorId: 2102,
    title: "홈파티에 와인 한 병만 고르면 레드가 나을까요?",
    body: "음식이 파스타, 치즈, 간단한 고기류로 섞여 있어요. 한 병만 산다면 무난한 레드 와인이 좋을지 추천 받고 싶어요.",
    createdAt: "2026-05-03T19:40:00+09:00",
    likeCount: 31,
    commentCount: 5,
    popularityScore: 92,
    locationLabel: "친구들과 홈파티",
    isQna: true,
    answerCount: 5,
    answerPreview: "몬테스 클래식이나 옐로우 테일 카베르네 소비뇽처럼 너무 무겁지 않은 레드가 무난해요.",
    searchTags: ["와인", "레드와인", "홈파티", "치즈", "파스타"],
    drinkType: "와인",
    categories: ["레드와인"],
    detailCategories: ["카베르네 소비뇽"],
    features: ["과일향", "드라이한", "부드러운"],
    foods: ["치즈", "라구 파스타", "스테이크"],
    priceWon: 25000,
    abv: 13,
  },
  {
    id: 91004,
    authorId: 2002,
    title: "치킨에는 라거랑 IPA 중에 뭐가 더 잘 맞나요?",
    body: "후라이드 치킨을 먹을 예정인데 하이네켄 같은 라거가 나을지, 브루독 펑크 IPA처럼 향 있는 맥주가 나을지 고민입니다.",
    createdAt: "2026-05-02T20:15:00+09:00",
    likeCount: 27,
    commentCount: 4,
    popularityScore: 84,
    locationLabel: "치킨 포장한 밤",
    isQna: true,
    answerCount: 4,
    answerPreview: "깔끔하게 먹고 싶으면 라거, 튀김 향을 더 산뜻하게 잡고 싶으면 IPA가 좋아요.",
    searchTags: ["맥주", "라거", "IPA", "치킨", "하이네켄", "브루독"],
    drinkType: "맥주",
    categories: ["라거", "IPA"],
    detailCategories: ["크래프트"],
    features: ["청량한", "쌉쌀한", "향긋한"],
    foods: ["치킨", "감자튀김"],
    priceWon: 9000,
    abv: 5.5,
  },
]

const pairingFeedPosts: FeedPost[] = pairPostSeeds.map((seed) => {
  const meta = pairMetaById[seed.id]

  return {
    id: seed.id,
    authorId: seed.authorId,
    title: pairTitle(seed.id),
    body: seed.body,
    pairingSummary: seed.summary,
    createdAt: seed.createdAt,
    likeCount: seed.likeCount,
    commentCount: seed.commentCount,
    popularityScore: seed.popularityScore,
    locationLabel: seed.locationLabel,
    searchTags: [
      seed.drinkType,
      meta.drink,
      meta.food,
      ...seed.categories,
      ...seed.detailCategories,
      ...seed.features,
    ],
    drinkType: seed.drinkType,
    categories: seed.categories,
    detailCategories: seed.detailCategories,
    features: seed.features,
    foods: [meta.food],
    priceWon: seed.priceWon,
    abv: seed.abv,
  }
})

const rawFeedPosts: FeedPost[] = [...pairingFeedPosts, ...questionFeedPosts]

export const feedPosts: FeedPost[] = rawFeedPosts.map((post) => {
  if (post.isQna) return post
  if (post.photoIds) return post
  const photoIds = getMockPhotoIds(post.id)
  if (!photoIds) return post
  return { ...post, photoIds }
})
