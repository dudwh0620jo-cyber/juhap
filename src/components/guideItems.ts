export type FeatureGuidePosition = "top" | "bottom" | "left" | "right"

export type FeatureGuideItem = {
  id: string
  message: string
  position: FeatureGuidePosition
  routePrefixes: string[]
}

export const FEATURE_GUIDE_STORAGE_KEY = "juhap_feature_guide_dismissed_ids"

export const guideItems: FeatureGuideItem[] = [
  {
    id: "home-ai-scan",
    message: "사진 스캔으로 AI 추천 흐름을 체험해보세요. 결과에서 상품 상세까지 이어집니다.",
    position: "bottom",
    routePrefixes: ["/home"],
  },
  {
    id: "category-search-filter",
    message: "검색창을 누르면 주종, 맛, 가격, 도수 조건으로 술을 좁혀볼 수 있어요.",
    position: "bottom",
    routePrefixes: ["/category"],
  },
  {
    id: "product-detail-tabs",
    message: "탭을 바꾸면 술 정보, 후기, 페어링 추천을 한 화면에서 비교할 수 있어요.",
    position: "bottom",
    routePrefixes: ["/product/"],
  },
  {
    id: "community-feed-controls",
    message: "후기, 질문, 팔로우 탭과 필터를 바꿔 커뮤니티 흐름을 확인해보세요.",
    position: "bottom",
    routePrefixes: ["/community"],
  },
  {
    id: "pairing-detail-tags",
    message: "술/음식 칩을 누르면 같은 태그의 관련 글로 이동하고, 댓글도 이어서 체험할 수 있어요.",
    position: "bottom",
    routePrefixes: ["/community/pairing/"],
  },
]
