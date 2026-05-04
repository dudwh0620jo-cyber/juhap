import type { FeedFilter, GradeTier, RankingCategory, RankingPeriod } from "./types"

export const COMMUNITY_SEARCH_RECENT_KEY = "community_search_recent_terms"
export const COMMUNITY_FOLLOWED_USERS_KEY = "community_followed_user_ids"
export const COMMUNITY_LIKED_POSTS_KEY = "community_liked_post_ids"
export const MAX_RECENT_TERMS = 10

export const pairingReviewGrades = ["뉴비 맛잘알", "찐조합러", "미식 탐험가", "페어링 고수", "조합 장인"] as const

export const userGradesByAuthorId: Record<
  number,
  { alcoholReviewTier: GradeTier; pairingReviewTier: GradeTier }
> = {
  2001: { alcoholReviewTier: 3, pairingReviewTier: 2 },
  2002: { alcoholReviewTier: 2, pairingReviewTier: 3 },
  2003: { alcoholReviewTier: 4, pairingReviewTier: 4 },
  2004: { alcoholReviewTier: 1, pairingReviewTier: 2 },
  2019: { alcoholReviewTier: 3, pairingReviewTier: 3 },
  2025: { alcoholReviewTier: 2, pairingReviewTier: 2 },
  2101: { alcoholReviewTier: 2, pairingReviewTier: 1 },
  2102: { alcoholReviewTier: 1, pairingReviewTier: 2 },
  2103: { alcoholReviewTier: 1, pairingReviewTier: 2 },
  2104: { alcoholReviewTier: 3, pairingReviewTier: 3 },
}

export const rankingPeriods: Array<{ key: RankingPeriod; label: string }> = [
  { key: "weekly", label: "주간" },
  { key: "daily", label: "일간" },
  { key: "monthly", label: "월간" },
  { key: "all", label: "전체" },
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

export const feedFilterItems: Array<{ key: FeedFilter; label: string }> = [
  { key: "review", label: "후기" },
  { key: "free", label: "자유" },
  { key: "popular", label: "인기" },
  { key: "follow", label: "팔로우" },
]

export const bookmarkLists = [
  { id: "default", label: "기본 북마크" },
  { id: "wine", label: "와인 페어링" },
  { id: "whisky", label: "위스키 페어링" },
] as const

export const popupCategoryByDrinkType: Record<string, string[]> = {
  소주: ["증류주"],
  맥주: ["라거/필스너", "IPA", "크래프트"],
  와인: ["레드", "화이트", "스파클링"],
  위스키: ["증류주"],
  전통주: ["막걸리"],
  사케: ["사케준마이"],
  기타: ["하이볼", "칵테일", "논알콜"],
}

export const popupDetailByCategory: Record<string, string[]> = {
  "라거/필스너": ["클래식", "드라이"],
  IPA: ["웨스트코스트", "뉴잉글랜드"],
  크래프트: ["세션", "임페리얼"],
  레드: ["오크숙성", "프루티"],
  화이트: ["시트러스", "트로피컬"],
  스파클링: ["브뤼", "스위트"],
  증류주: ["싱글몰트", "블렌디드", "버번"],
  하이볼: ["소주토닉", "버번", "블렌디드"],
  막걸리: ["비살균", "살균"],
  사케준마이: ["준마이", "긴죠"],
  칵테일: ["시트러스", "트로피컬"],
  논알콜: ["제로", "로우알콜"],
}

export const popupFeaturesByDetail: Record<
  string,
  Array<"부드러운" | "무거운" | "가벼운" | "톡쏘는" | "오크향" | "과일향">
> = {
  클래식: ["가벼운", "톡쏘는"],
  드라이: ["가벼운"],
  웨스트코스트: ["톡쏘는", "무거운"],
  뉴잉글랜드: ["부드러운", "과일향"],
  세션: ["가벼운", "톡쏘는"],
  임페리얼: ["무거운"],
  소주토닉: ["가벼운", "톡쏘는", "과일향"],
  오크숙성: ["무거운", "오크향"],
  프루티: ["가벼운", "과일향"],
  시트러스: ["톡쏘는", "과일향"],
  트로피컬: ["과일향", "가벼운"],
  브뤼: ["톡쏘는", "가벼운"],
  스위트: ["부드러운", "과일향"],
  싱글몰트: ["무거운", "오크향", "부드러운"],
  블렌디드: ["부드러운", "무거운"],
  버번: ["부드러운", "오크향", "무거운"],
  비살균: ["부드러운", "가벼운"],
  살균: ["가벼운"],
  준마이: ["부드러운", "가벼운"],
  긴죠: ["과일향", "가벼운"],
  제로: ["가벼운", "톡쏘는"],
  로우알콜: ["가벼운"],
}

