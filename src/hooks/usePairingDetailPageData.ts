import { useMemo } from "react"
import type { SimilarPairingItem } from "../components/SimilarPairingList"
import {
  COMMUNITY_BOOKMARKED_POSTS_KEY,
  COMMUNITY_FOLLOWED_USERS_KEY,
  COMMUNITY_LIKED_POSTS_KEY,
  getPairingCommentsStorageKey,
} from "../utils/communityStorage"
import {
  getPairingTierLabel as getTierLabel,
  getPairingTierLabelByUserId as getTierLabelByUserId,
  getUserGradeBadgeClassNameByTier as getPairingTierClassName,
  getUserGradeBadgeClassNameByUserId as getTierClassNameByUserId,
  pairingTiersByAuthorId as userPairingTiersById,
} from "../utils/pairingTier"

type RecommendedProduct = {
  id: string
  name: string
  categoryLabel: string
  subLabel: string
  priceLabel: string
}

const similarPairingsMock: SimilarPairingItem[] = [
  {
    id: 1002,
    pairingTitle: "막걸리 + 해물파전",
    authorId: 2001,
    authorName: "민지",
    profile: "20대 / 부산 / 전통주 입문",
    locationLabel: "비 오는 베란다",
    drinkType: "전통주",
  },
  {
    id: 1006,
    pairingTitle: "IPA + 햄버거",
    authorId: 2002,
    authorName: "현우",
    profile: "20대 / 대전 / 맥주 러버",
    locationLabel: "햇살 드는 거실",
    drinkType: "맥주",
  },
  {
    id: 1005,
    pairingTitle: "레드 와인 + 스테이크",
    authorId: 2001,
    authorName: "민지",
    profile: "30대 / 서울 / 와인 선호",
    locationLabel: "아늑한 우리집",
    drinkType: "와인",
  },
  {
    id: 1009,
    pairingTitle: "칵테일 + 타코",
    authorId: 2102,
    authorName: "도윤",
    profile: "30대 / 대구 / 위스키 · 칵테일",
    locationLabel: "친구들과 홈파티",
    drinkType: "기타",
  },
]

const recommendedProductByDrinkType: Record<string, RecommendedProduct> = {
  소주: {
    id: "soju-jinro-classic-1",
    name: "진로 클래식",
    categoryLabel: "소주",
    subLabel: "17.0%",
    priceLabel: "4,500원",
  },
  맥주: {
    id: "beer-cass-lager-1",
    name: "카스 라거",
    categoryLabel: "맥주",
    subLabel: "라거",
    priceLabel: "3,900원",
  },
  와인: {
    id: "wine-cabernet-1",
    name: "카베르네 소비뇽",
    categoryLabel: "와인",
    subLabel: "레드",
    priceLabel: "29,000원",
  },
  위스키: {
    id: "whisky-single-malt-1",
    name: "싱글몰트 위스키",
    categoryLabel: "위스키",
    subLabel: "싱글몰트",
    priceLabel: "79,000원",
  },
  전통주: {
    id: "tradition-makgeolli-1",
    name: "프리미엄 막걸리",
    categoryLabel: "전통주",
    subLabel: "막걸리",
    priceLabel: "9,900원",
  },
  사케: {
    id: "sake-junmai-1",
    name: "준마이 사케",
    categoryLabel: "사케",
    subLabel: "준마이",
    priceLabel: "33,000원",
  },
  기타: {
    id: "etc-highball-can-1",
    name: "하이볼 캔",
    categoryLabel: "기타",
    subLabel: "하이볼",
    priceLabel: "12,000원",
  },
}

const priceRangeTagByDrinkType: Record<string, string> = {
  소주: "1만원 이하",
  맥주: "1만원 이하",
  와인: "2~5만원",
  위스키: "3~8만원",
  전통주: "1~3만원",
  사케: "2~5만원",
  기타: "1~3만원",
}

const currentUser = { id: 9999, name: "나", meta: "서울 · 20대" }

export function usePairingDetailPageData() {
  // Memoize to keep stable references when destructuring in pages.
  return useMemo(
    () => ({
      COMMUNITY_FOLLOWED_USERS_KEY,
      COMMUNITY_LIKED_POSTS_KEY,
      COMMUNITY_BOOKMARKED_POSTS_KEY,
      getPairingCommentsStorageKey,
      similarPairingsMock,
      recommendedProductByDrinkType,
      priceRangeTagByDrinkType,
      userPairingTiersById,
      getTierClassName: getPairingTierClassName,
      getTierLabel,
      getTierClassNameByUserId,
      getTierLabelByUserId,
      currentUser,
    }),
    [],
  )
}
