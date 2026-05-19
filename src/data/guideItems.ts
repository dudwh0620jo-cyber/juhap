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
    message: "AI 스캔으로 추천 페어링을 빠르게 확인해보세요. 결과에서 상품 상세까지 바로 이어져요.",
    position: "bottom",
    routePrefixes: ["/home"],
  },
  {
    id: "category-search-filter",
    message: "검색창을 누르면 주종, 맛, 가격, 도수 조건으로 골라볼 수 있어요.",
    position: "bottom",
    routePrefixes: ["/category"],
  },
  {
    id: "product-detail-tabs",
    message: "탭을 바꾸면 정보, 후기, 페어링 추천을 비교해서 볼 수 있어요.",
    position: "bottom",
    routePrefixes: ["/product/"],
  },
  {
    id: "community-feed-controls",
    message: "후기, 질문, 페어링을 탭과 필터로 바꿔가며 커뮤니티 글을 확인해보세요.",
    position: "bottom",
    routePrefixes: ["/community"],
  },
  {
    id: "pairing-detail-tags",
    message: "주류·음식 태그를 누르면 관련 글 리스트로 이동해요.",
    position: "bottom",
    routePrefixes: ["/community/pairing/"],
  },
]

