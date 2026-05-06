import { COMMUNITY_FOLLOWED_USERS_KEY, COMMUNITY_LIKED_POSTS_KEY, COMMUNITY_SEARCH_RECENT_KEY } from "../utils/communityStorage"
import { defaultFollowedUserIdsMock } from "../utils/usersMock"

export type FeedFilter = "review" | "free" | "follow"

export type PopupChipGroup = {
  title: string
  chips: string[]
}

const MAX_RECENT_TERMS = 10
const PRICE_MIN_WON = 0
const PRICE_MAX_WON = 1_000_000
const ABV_MIN = 0
const ABV_MAX = 65



const feedFilterItems: Array<{ key: FeedFilter; label: string }> = [
  { key: "review", label: "후기" },
  { key: "free", label: "질문" },
  { key: "follow", label: "팔로우" },
]

const bookmarkLists = [
  { id: "default", label: "기본 북마크" },
  { id: "wine", label: "와인 페어링" },
  { id: "whisky", label: "위스키 페어링" },
] as const

const popupCategoryByDrinkType: Record<string, string[]> = {
  사케: ["준마이 다이긴죠", "다이긴죠", "준마이 긴죠", "긴죠", "준마이", "혼죠조", "후츠슈(일반주)"],
  소주: ["데일리(희석식)", "프리미엄(증류식)", "플레이버"],
  와인: ["레드", "화이트", "로제", "스파클링", "내추럴", "포트", "디저트"],
  맥주: ["라거/필스너", "에일/IPA", "흑맥주(스타우트)", "과일맥주"],
  위스키: ["싱글몰트", "블렌디드 몰트", "블렌디드", "아메리칸(버번/라이/테네시)", "그레인", "기타 국가 위스키"],
  증류주: ["백주/고량주", "진", "보드카", "테킬라", "럼", "브랜디(꼬냑/아르마냑)"],
  전통주: ["막걸리/탁주", "약주/청주", "전통 증류주", "과실주(한국 와인)"],
  기타: ["리큐르", "하이볼", "칵테일", "논알콜/저도수"],
}

const popupFeaturesByDrinkType: Record<string, string[]> = {
  사케: [
    "과일향(긴죠향)",
    "쌀향",
    "누룩향",
    "꽃향",
    "단맛(아마구치)",
    "드라이(카라구치)",
    "산미",
    "감칠맛(우마미)",
    "부드러움",
    "깔끔함",
    "무게감(바디)",
  ],
  소주: [
    "곡물향",
    "알코올향",
    "무향(깔끔함)",
    "과일향(플레이버)",
    "단맛",
    "쓴맛",
    "고소함",
    "가벼움",
    "화함(알코올 타격감)",
    "오일리함",
  ],
  와인: [
    "레드과일",
    "블랙과일",
    "오크향",
    "지구향(흙/가죽)",
    "꽃향",
    "산도",
    "당도",
    "탄닌(떫은맛)",
    "과실미",
    "라이트/풀바디",
    "실키함",
    "발포성(탄산)",
  ],
  맥주: [
    "홉(시트러스/열대과일)",
    "맥아(고소함/카라멜)",
    "효모향",
    "커피/초콜릿",
    "쓴맛(IBU)",
    "단맛",
    "고소함",
    "산미",
    "탄산감",
    "크리미함",
    "바디감",
  ],
  위스키: [
    "피트(스모키)",
    "바닐라/카라멜",
    "과일",
    "스파이시",
    "견과류",
    "단맛",
    "짠맛(해조류)",
    "매운맛",
    "오크맛",
    "묵직함",
    "오일리함",
    "긴 여운(Finish)",
  ],
  증류주: [
    "농향(화려함)",
    "장향(진함)",
    "청향(깨끗함)",
    "미향(은은함)",
    "파인애플",
    "곡물",
    "누룩",
    "단맛",
    "화한 매운맛",
    "감칠맛",
    "부드러움",
    "강한 타격감",
    "깔끔한 끝맛",
  ],
  전통주: [
    "곡물향",
    "누룩향",
    "과실향",
    "산뜻한 향",
    "당도",
    "산미(신맛)",
    "구수함",
    "떫은맛",
    "걸쭉함(바디)",
    "탄산감",
    "청량감",
  ],
  기타: ["맥주향", "와인향", "과일", "허브", "커피", "크림", "견과류", "단맛", "쌉쌀함", "청량함", "탄산감"],
}

const popupFoodCategories = [
  "디저트",
  "과일",
  "치즈",
  "육류",
  "구이",
  "해산물",
  "튀김",
  "국물/탕",
  "면",
  "과자",
  "베지테리안",
]

export function useCommunityPageData() {
  return {
    COMMUNITY_SEARCH_RECENT_KEY,
    COMMUNITY_FOLLOWED_USERS_KEY,
    COMMUNITY_LIKED_POSTS_KEY,
    MAX_RECENT_TERMS,
    PRICE_MIN_WON,
    PRICE_MAX_WON,
    ABV_MIN,
    ABV_MAX,
    feedFilterItems,
    bookmarkLists,
    popupCategoryByDrinkType,
    popupFeaturesByDrinkType,
    popupFoodCategories,
    defaultFollowedUserIdsMock,
  }
}

