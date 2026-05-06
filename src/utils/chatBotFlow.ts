export type ChatStep =
  | "intro"
  | "glossary"
  | "party_mood"
  | "food"
  | "wine_style"
  | "recommend"
  | "detail"
  | "pairing"
  | "done"

export type ChatRole = "ai" | "user"

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

export type ChatSession = {
  introPrompt?: string
  glossaryTopic?: string
  situation?: string
  partyMood?: string
  foodCategory?: string
  wineStyle?: string
  selectedWineId?: string
  lastRecommendationSeed?: number
}

export type WineCandidate = {
  id: string
  name: string
  subtitle: string
  priceWon: number
  tags: string[]
  notes: string[]
  tastingNotes: string[]
  awards: string[]
  pairingFoods: string[]
  tips: string[]
}

export const introPromptOptions = ["주류 스캔하기", "오늘의 추천 빠르게 받기", "주류 문화 용어 알아보기"] as const

export const glossaryOptions = ["도수(ABV)", "바디(Body)", "타닌(Tannin)", "산도(Acidity)", "드라이(Dry)", "빈티지(Vintage)"] as const

export const glossaryDefinitionByTopic: Record<(typeof glossaryOptions)[number], string> = {
  "도수(ABV)": "ABV는 Alcohol By Volume의 약자로, 술에 포함된 알코올의 비율(%)을 뜻해요.",
  "바디(Body)": "바디는 입안에서 느껴지는 무게감/질감을 말해요. 라이트·미디엄·풀바디로 표현해요.",
  "타닌(Tannin)": "타닌은 주로 포도 껍질/씨/오크에서 오는 떫은 느낌이에요. 붉은 고기와 잘 맞는 편이에요.",
  "산도(Acidity)": "산도는 신선하고 상큼한 느낌을 만드는 요소예요. 기름진 음식과 밸런스가 좋아요.",
  "드라이(Dry)": "드라이는 단맛이 거의 없다는 뜻이에요. '덜 달다'에 가깝고, 도수와는 별개예요.",
  "빈티지(Vintage)": "빈티지는 포도를 수확한 연도예요. 같은 와인이라도 연도에 따라 맛이 달라질 수 있어요.",
}

export const situationOptions = ["홈파티", "데이트", "기념일", "친구 모임", "선물용", "기타"] as const
export const partyMoodOptions = ["캐주얼한 모임", "좀 더 격식 있는 모임이에요", "특별한 기념 파티를 열거예요"] as const
export const foodCategoryOptions = ["해산물", "고기 요리", "파스타/면", "샐러드/채소", "치즈/플래터", "기타"] as const
export const wineStyleOptions = ["가벼운 화이트", "드라이한 화이트", "레드 와인", "스파클링/샴페인", "사케"] as const

export const wineCandidatesMock: WineCandidate[] = [
  {
    id: "dassai-45-junmai-daiginjo",
    name: "닷사이 45 준마이 다이긴죠",
    subtitle: "Dassai 45 Junmai Daiginjo",
    priceWon: 36000,
    tags: ["사케", "드라이", "해산물", "캐주얼", "격식", "기념일"],
    notes: [
      "깔끔하고 은은한 과실향으로 음식과 함께 즐기기 좋은 사케예요.",
      "처음 사케를 고를 때도 부담이 적고, 페어링 폭이 넓어요.",
    ],
    tastingNotes: ["배, 멜론, 흰꽃", "부드러운 질감, 깨끗한 피니시"],
    awards: [],
    pairingFoods: ["회/해산물", "구운 생선", "담백한 치즈"],
    tips: ["서빙 온도: 8~12℃ 권장", "잔을 살짝 차갑게 하면 향이 또렷해져요."],
  },
  {
    id: "cloudy-bay-sb-2022",
    name: "클라우디 베이 소비뇽 블랑 2022",
    subtitle: "Cloudy Bay Sauvignon Blanc",
    priceWon: 32000,
    tags: ["화이트", "드라이", "해산물", "샐러드", "캐주얼", "홈파티"],
    notes: ["뉴질랜드 말보로 지역의 대표 소비뇽 블랑.", "산뜻한 시트러스와 허브 향이 인상적."],
    tastingNotes: ["향: 자몽, 레몬, 패션프루트, 허브", "맛: 산뜻한 산미, 미네랄리티, 열대 과일"],
    awards: ["James Suckling 91점 (2022 빈티지)", "Wine Spectator Top 100 (2021)"],
    pairingFoods: ["굴 & 해산물", "연어 샐러드", "생크림 파스타"],
    tips: ["서빙 온도: 8~10℃가 가장 좋아요.", "오픈 후 3일 정도 두면 맛이 더 살아나요."],
  },
  {
    id: "fleur-de-chablis-2021",
    name: "플뢰르 드 샤블리 2021",
    subtitle: "Fleur de Chablis",
    priceWon: 28000,
    tags: ["화이트", "드라이", "해산물", "치즈", "격식", "데이트"],
    notes: ["샤블리 특유의 미네랄리티와 깔끔한 피니시.", "기름진 음식과도 균형이 좋아요."],
    tastingNotes: ["향: 사과, 시트러스, 젖은 돌", "맛: 드라이, 미네랄, 선명한 산미"],
    awards: ["Vivino 4.0+ (목업)"],
    pairingFoods: ["가리비 구이", "치즈 플래터", "화이트 소스 파스타"],
    tips: ["너무 차갑게 마시면 향이 닫혀요(8~12℃ 권장).", "가벼운 잔(화이트 와인잔)에 추천."],
  },
  {
    id: "prosecco-brut",
    name: "프로세코 브뤼",
    subtitle: "Prosecco Brut",
    priceWon: 19000,
    tags: ["스파클링", "드라이", "캐주얼", "홈파티", "치즈", "샐러드"],
    notes: ["가볍고 산뜻한 버블로 시작하기 좋아요.", "친구 모임/홈파티에 무난한 선택."],
    tastingNotes: ["향: 배, 사과, 흰꽃", "맛: 산뜻, 가벼운 바디, 깔끔한 피니시"],
    awards: [],
    pairingFoods: ["치즈 플래터", "가벼운 튀김", "과일"],
    tips: ["샴페인 플루트/화이트 잔 모두 OK.", "처음 한 잔은 단독으로 즐겨보세요."],
  },
  {
    id: "pinot-noir",
    name: "피노 누아",
    subtitle: "Pinot Noir",
    priceWon: 39000,
    tags: ["레드", "라이트", "고기", "격식", "기념일", "데이트"],
    notes: ["섬세한 과실향과 부드러운 탄닌.", "무거운 레드가 부담스러울 때 좋아요."],
    tastingNotes: ["향: 체리, 라즈베리, 은은한 스파이스", "맛: 부드러운 탄닌, 균형감, 긴 여운"],
    awards: [],
    pairingFoods: ["오리/치킨", "버섯 요리", "가벼운 스테이크"],
    tips: ["서빙 온도: 14~16℃ 추천.", "너무 뜨거우면 알코올이 튀어요."],
  },
  {
    id: "cabernet-sauvignon",
    name: "까베르네 소비뇽",
    subtitle: "Cabernet Sauvignon",
    priceWon: 45000,
    tags: ["레드", "풀바디", "고기", "홈파티", "기념일", "격식"],
    notes: ["진한 바디와 탄닌으로 고기 요리와 궁합이 좋아요.", "격식 있는 모임에서도 안정적인 선택."],
    tastingNotes: ["향: 블랙커런트, 오크, 초콜릿", "맛: 탄닌, 묵직한 바디, 스파이시"],
    awards: [],
    pairingFoods: ["스테이크", "바비큐", "진한 치즈"],
    tips: ["디캔팅 20~30분 추천.", "진한 소스가 있는 고기와 특히 좋아요."],
  },
]

function scoreCandidate(candidate: WineCandidate, session: ChatSession) {
  let score = 0
  const tagText = candidate.tags.join(" ")

  const match = (value?: string) => (value ? tagText.includes(value) : false)

  const styleTag = session.wineStyle?.includes("화이트")
    ? "화이트"
    : session.wineStyle?.includes("레드")
      ? "레드"
      : session.wineStyle?.includes("스파클링")
        ? "스파클링"
        : session.wineStyle?.includes("사케")
          ? "사케"
        : null
  if (styleTag && match(styleTag)) score += 5

  if (match(session.foodCategory)) score += 3
  const moodTag = session.partyMood?.includes("캐주얼")
    ? "캐주얼"
    : session.partyMood?.includes("격식")
      ? "격식"
      : session.partyMood
        ? "기념일"
        : null
  if (moodTag && match(moodTag)) score += 2
  if (match(session.situation)) score += 1

  return score
}

export function getTopRecommendations(session: ChatSession, count: number) {
  if (session.wineStyle?.includes("사케")) {
    const sakeOnly = wineCandidatesMock.filter((candidate) => candidate.tags.includes("사케"))
    return sakeOnly.slice(0, Math.max(1, count))
  }

  const baseSorted = [...wineCandidatesMock].sort((a, b) => scoreCandidate(b, session) - scoreCandidate(a, session))
  const filtered = baseSorted.filter((candidate) => scoreCandidate(candidate, session) > 0)
  const pool = filtered.length >= count ? filtered : baseSorted
  return pool.slice(0, Math.max(1, count))
}

export function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`
}
