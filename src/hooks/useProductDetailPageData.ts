import { useMemo } from "react"
import type { ReviewCardData } from "../components/ReviewCard"
import type { PurchaseShop } from "../components/SpecSection"

export type ProductSpec = {
  type: string
  volume: string
  abv: string
  country: string
  region: string
  grape: string
  case: string
}

export type TasteScore = {
  label: string
  value: number
}

export type TastingNote = {
  title: string
  items: Array<{ label: string; value: string }>
}

export type PairingChip = {
  id: string
  label: string
}

export type ProductDetailData = {
  breadcrumb: string
  name: string
  price: string
  spec: ProductSpec
  taste: TasteScore[]
  tastingNotes: TastingNote
  descriptionTitle: string
  descriptionBody: string
  purchase: PurchaseShop[]
  alcoholReviews: ReviewCardData[]
  pairingReviews: ReviewCardData[]
  pairingChips: PairingChip[]
}

const mockProductById: Record<string, ProductDetailData> = {
  "caymus-2023-1": {
    breadcrumb: "와인 > 레드와인(미국)",
    name: "케이머스 나파 밸리 카버네 소비뇽 2023",
    price: "138,000원",
    spec: {
      type: "레드 와인",
      volume: "750ml",
      abv: "14.6%",
      country: "미국",
      region: "나파 밸리",
      grape: "카버네 소비뇽(100%)",
      case: "없음",
    },
    taste: [
      { label: "바디", value: 5 },
      { label: "타닌", value: 4 },
      { label: "당도", value: 2 },
      { label: "산미", value: 3 },
    ],
    tastingNotes: {
      title: "Tasting Notes",
      items: [
        { label: "Aroma", value: "허브, 스파이스, 바이올렛, 바닐라, 오크" },
        { label: "Taste", value: "블랙베리, 자두, 다크 체리, 블랙커런트" },
        { label: "Finish", value: "코코아, 초콜릿, 타바코, 가죽" },
      ],
    },
    descriptionTitle: "나파 밸리의 정수를 담은 기념비적 까베르네",
    descriptionBody:
      "'케이머스 나파 밸리 카버네 소비뇽 50주년 에디션'은 카버네 소비뇽 생산 50년을 기념해 출시된 한정 레드 와인입니다.\n\n나파 밸리의 8개 지역에서 수확한 포도를 블렌딩해 복합적인 구조와 활달같은 균형을 이룹니다.\n\n비옥한 토양, 무라카 층반, 낮은 수확량, 완전한 숙성까지의 기다림이 '케이머스 스타일'의 핵심을 이룹니다.",
    purchase: [
      { id: "shop-1", name: "데일리샷", delivery: "무료배송", price: "138,000원", badge: "와인", url: "https://example.com/dailyshot" },
      { id: "shop-2", name: "와인나라", delivery: "오늘출발", price: "141,000원", badge: "와인", url: "https://example.com/winenara" },
    ],
    alcoholReviews: [
      {
        id: "r1",
        userName: "A씨",
        userMeta: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "스테이크",
        body: "스테이크랑 케이머스 나파 밸리 카버네 소비뇽랑 먹었는데 맛있다. 어쩌고 저쩌고 산미가 어쩌고...",
        likeCount: 847,
        commentCount: 124,
      },
      {
        id: "r2",
        userName: "B씨",
        userMeta: "20대 / 남 / 와인, 맥주 / 바디감 묵직한 편 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "파스타",
        body: "홈데이트 어쩌고저쩌고 와인이 파스타랑 분위기 어쩌고 맛은 어쩌고 ~",
        likeCount: 847,
        commentCount: 124,
      },
    ],
    pairingReviews: [
      {
        id: "pr1",
        rankingId: "pairing-1",
        userName: "A씨",
        userMeta: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "스테이크",
        body: "고기 지방의 고소함을 탄닌이 잡아줘서 밸런스가 좋았어요. 굽기나 소스에 따라 느낌이 달라져서 재밌습니다.",
        likeCount: 421,
        commentCount: 67,
      },
      {
        id: "pr2",
        rankingId: "pairing-2",
        userName: "B씨",
        userMeta: "20대 / 남 / 와인, 맥주 / 바디감 묵직한 편 선호",
        titleLeft: "케이머스 나파 밸리 카버네 소비뇽",
        titleRight: "파스타",
        body: "토마토/크림 소스에 따라 어울림이 달랐는데, 산미 있는 소스일수록 더 깔끔하게 느껴졌어요.",
        likeCount: 508,
        commentCount: 92,
      },
    ],
    pairingChips: [
      { id: "meat", label: "고기" },
      { id: "bbq", label: "바베큐" },
      { id: "pasta", label: "파스타" },
    ],
  },
}

export function useProductDetailPageData() {
  return useMemo(() => ({ mockProductById }), [])
}
