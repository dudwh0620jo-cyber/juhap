import { useMemo } from "react"
import type { CategoryListItem } from "../components/CategoryItemCard"
import { alcoholGroups } from "./useCategoryPageData"

const relatedTermsBySubcategory: Record<string, string[]> = Object.fromEntries(
  alcoholGroups
    .flatMap((g) => g.items)
    .filter((item) => item.relatedTerms && item.relatedTerms.length > 0)
    .map((item) => [item.label, item.relatedTerms!])
)

const mockItemsByKey: Record<string, CategoryListItem[]> = {
  "와인>레드": [
    {
      id: "wine-red-1",
      name: "케이머스 나파 밸리 카버네 소비뇽 2023",
      subGroup: "카버네 소비뇽",
      tags: ["레드와인", "탄닌", "240,000원"],
      keywords: ["나파", "cabernet", "dry", "오크"],
    },
    {
      id: "wine-red-2",
      name: "메를로 보르도 리저브 2021",
      subGroup: "메를로",
      tags: ["레드와인", "바디", "80,000원"],
      keywords: ["보르도", "merlot", "플럼", "초콜릿"],
    },
    {
      id: "wine-red-3",
      name: "피노 누아 부르고뉴 빌라쥬 2022",
      subGroup: "피노 누아",
      tags: ["레드와인", "산미", "70,000원"],
      keywords: ["부르고뉴", "pinot", "체리", "실키"],
    },
    {
      id: "wine-red-4",
      name: "쉬라 호주 바로사 2020",
      subGroup: "쉬라/시라",
      tags: ["레드와인", "스파이시", "49,000원"],
      keywords: ["barossa", "shiraz", "후추", "진한맛"],
    },
    {
      id: "wine-red-5",
      name: "말벡 아르헨티나 멘도사 2021",
      subGroup: "말벡",
      tags: ["레드와인", "진한맛", "25,900원"],
      keywords: ["mendoza", "malbec", "블랙베리", "바닐라"],
    },
    {
      id: "wine-red-6",
      name: "산지오베제 키안티 클라시코 2021",
      subGroup: "산지오베제",
      tags: ["레드와인", "산미", "30,000원"],
      keywords: ["chianti", "tomato", "허브", "드라이"],
    },
    {
      id: "wine-red-7",
      name: "까베르네 프랑 루아르 2022",
      subGroup: "까베르네 프랑",
      tags: ["레드와인", "허브", "30,000원"],
      keywords: ["loire", "cabernet franc", "그린", "산뜻"],
    },
    {
      id: "wine-red-8",
      name: "블렌드 레드 하우스 셀렉션 2022",
      subGroup: "블렌드",
      tags: ["레드와인", "입문", "25,000원"],
      keywords: ["blend", "밸런스", "데일리", "무난"],
    },
  ],
  "와인>화이트": [
    {
      id: "wine-white-1",
      name: "샤블리 샤르도네 2022",
      subGroup: "샤르도네",
      tags: ["화이트와인", "산뜻", "84,000원"],
      keywords: ["chablis", "citrus", "미네랄", "dry"],
    },
    {
      id: "wine-white-2",
      name: "리슬링 모젤 2021",
      subGroup: "리슬링",
      tags: ["화이트와인", "향", "30,000원"],
      keywords: ["riesling", "peach", "산미", "약간달콤"],
    },
    {
      id: "wine-white-3",
      name: "소비뇽 블랑 말보로 2023",
      subGroup: "소비뇨 블랑",
      tags: ["화이트와인", "시트러스", "26,000원"],
      keywords: ["sauvignon", "자몽", "허브", "상큼"],
    },
    {
      id: "wine-white-4",
      name: "피노 그리지오 이탈리아 2022",
      subGroup: "피노 그리지오",
      tags: ["화이트와인", "가벼움", "35,000원"],
      keywords: ["pinot grigio", "레몬", "데일리", "깔끔"],
    },
    {
      id: "wine-white-5",
      name: "게뷔르츠트라미너 알자스 2021",
      subGroup: "게뷔르츠트라미너",
      tags: ["화이트와인", "향", "58,000원"],
      keywords: ["alsace", "lychee", "장미", "아로마"],
    },
    {
      id: "wine-white-6",
      name: "비오니에 론 밸리 2022",
      subGroup: "비오니에",
      tags: ["화이트와인", "바디", "32,000원"],
      keywords: ["viognier", "살구", "풍미", "오일리"],
    },
    {
      id: "wine-white-7",
      name: "세미용 블렌드 화이트 2022",
      subGroup: "블렌드",
      tags: ["화이트와인", "무난", "29,920원"],
      keywords: ["semillon", "꿀", "부드러움", "데일리"],
    },
    {
      id: "wine-white-8",
      name: "모스카토 프루시안테 2023",
      subGroup: "모스카토",
      tags: ["화이트와인", "달콤", "25,600원"],
      keywords: ["moscato", "frizzante", "과일향", "가벼움"],
    },
  ],
  "맥주>라거/필스너": [
    {
      id: "beer-lager-1",
      name: "필스너 스타일 라거 500ml",
      subGroup: "필스너",
      tags: ["라거", "청량", "편의점", "2,500원"],
      keywords: ["pilsner", "깔끔", "탄산", "데일리"],
    },
    {
      id: "beer-lager-2",
      name: "독일식 헬레스 라거",
      subGroup: "헬레스",
      tags: ["라거", "몰티", "3,500원"],
      keywords: ["helles", "몰트", "부드러움", "밸런스"],
    },
    {
      id: "beer-lager-3",
      name: "체코식 필스너 클래식",
      subGroup: "필스너",
      tags: ["라거", "홉", "4,200원"],
      keywords: ["czech", "hop", "쌉싸름", "클래식"],
    },
    {
      id: "beer-lager-4",
      name: "드라이 라거 355ml",
      subGroup: "드라이 라거",
      tags: ["라거", "깔끔", "캔맥주", "2,800원"],
      keywords: ["dry", "청량", "가벼움", "차갑게"],
    },
    {
      id: "beer-lager-5",
      name: "필스너 라이트 라거",
      subGroup: "라이트",
      tags: ["라거", "가벼움", "저칼로리", "3,000원"],
      keywords: ["light", "가볍게", "운동", "입문"],
    },
    {
      id: "beer-lager-6",
      name: "라거 생맥주 스타일",
      subGroup: "생맥",
      tags: ["라거", "생맥", "청량", "3,500원"],
      keywords: ["draft", "거품", "부드러움", "펍"],
    },
    {
      id: "beer-lager-7",
      name: "필스너 홉 라거",
      subGroup: "홉 라거",
      tags: ["라거", "홉향", "5,300원"],
      keywords: ["hop", "aroma", "쌉싸름", "상쾌"],
    },
    {
      id: "beer-lager-8",
      name: "필스너/라거 믹스 팩",
      subGroup: "믹스",
      tags: ["라거", "입문", "세트", "14,900원"],
      keywords: ["mix", "추천", "다양", "테이스팅"],
    },
  ],
  "소주>플레이버": [
    {
      id: "soju-flavor-1",
      name: "자몽에이슬 360ml",
      subGroup: "자몽",
      tags: ["플레이버", "13도", "편의점", "2,200원"],
      keywords: ["자몽에이슬", "하이트진로", "저도수", "과일향"],
    },
    {
      id: "soju-flavor-2",
      name: "청포도에이슬 360ml",
      subGroup: "청포도",
      tags: ["플레이버", "13도", "편의점", "2,100원"],
      keywords: ["청포도에이슬", "하이트진로", "달콤", "과일"],
    },
    {
      id: "soju-flavor-3",
      name: "순하리 복숭아 360ml",
      subGroup: "복숭아",
      tags: ["플레이버", "12도", "편의점", "2,000원"],
      keywords: ["순하리", "롯데칠성", "복숭아향", "부드러움"],
    },
    {
      id: "soju-flavor-4",
      name: "좋은데이 유자 360ml",
      subGroup: "유자",
      tags: ["플레이버", "16.9도", "편의점", "1,900원"],
      keywords: ["좋은데이", "무학", "유자", "시트러스"],
    },
    {
      id: "soju-flavor-5",
      name: "처음처럼 쿨 360ml",
      subGroup: "라임",
      tags: ["플레이버", "16.5도", "편의점", "1,900원"],
      keywords: ["처음처럼", "롯데주류", "민트", "청량"],
    },
    {
      id: "soju-flavor-6",
      name: "좋은데이 요구르트 360ml",
      subGroup: "요구르트",
      tags: ["플레이버", "12도", "편의점", "1,800원"],
      keywords: ["좋은데이", "무학", "요구르트", "부드러움"],
    },
    {
      id: "soju-flavor-7",
      name: "딸기에이슬 360ml",
      subGroup: "딸기",
      tags: ["플레이버", "13도", "편의점", "1,800원"],
      keywords: ["딸기에이슬", "하이트진로", "딸기향", "달콤"],
    },
    {
      id: "soju-flavor-8",
      name: "순하리 사과 360ml",
      subGroup: "사과",
      tags: ["플레이버", "12도", "편의점", "1,800원"],
      keywords: ["순하리", "롯데칠성", "사과향", "입문"],
    },
  ],
  default: Array.from({ length: 8 }).map((_, index) => ({
    id: `mock-${index + 1}`,
    name: "소분류에 맞춘 더미 상품",
    subGroup: ["대표", "입문", "가성비", "프리미엄"][index % 4],
    tags: ["소분류", "라벨", (["25,000원", "18,000원", "15,000원", "45,000원"] as const)[index % 4]],
    keywords: ["추천", "테이스팅", "분류"],
  })),
}

const createFallbackItems = (group: string, sub: string): CategoryListItem[] => {
  const safeGroup = group || "카테고리"
  const safeSub = sub || "소분류"
  const baseTags = [safeGroup, safeSub].filter(Boolean)

  return Array.from({ length: 8 }).map((_, index) => ({
    id: `fallback-${safeGroup}-${safeSub}-${index + 1}`,
    name: `${safeSub} 추천 더미 상품 ${index + 1}`,
    subGroup: safeSub,
    tags: [...baseTags, `${index % 2 === 0 ? "입문" : "추천"}`, `${index % 2 === 0 ? "18,000원" : "25,000원"}`],
    keywords: [...baseTags, safeSub.replaceAll(" ", ""), safeGroup.replaceAll(" ", "")],
  }))
}

export function useCategoryListPageData() {
  return useMemo(() => ({ relatedTermsBySubcategory, mockItemsByKey, createFallbackItems }), [])
}
