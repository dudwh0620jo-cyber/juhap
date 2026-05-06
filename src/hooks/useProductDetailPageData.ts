import { useMemo } from "react"

export type ProductPurchaseShop = {
  id: string
  name: string
  delivery: string
  price: string
  url: string
}

export type ProductDetailData = {
  id: string
  breadcrumb: string
  name: string
  price: string
  basicInfo: Array<{ label: string; value: string }>
  tasteNotes: Array<{ label: string; value: string; subValue: string }>
  brandStory: string[]
  onlineShops: ProductPurchaseShop[]
}

const dassai23: ProductDetailData = {
  id: "sake-dassai-23",
  breadcrumb: "사케 > 준마이 다이긴죠",
  name: "닷사이 23",
  price: "200,000원",
  basicInfo: [
    { label: "종류", value: "사케" },
    { label: "용량", value: "720ml" },
    { label: "도수", value: "15~16도" },
    { label: "정미율", value: "23%" },
    { label: "산도", value: "1.1" },
    { label: "주도", value: "+4" },
  ],
  tasteNotes: [
    { label: "Aroma", value: "은은한 꽃, 배, 몽글함", subValue: "향" },
    { label: "Taste", value: "청량한, 감칠맛, 섬세함", subValue: "맛" },
    { label: "Finish", value: "부드러운, 시원한, 깔끔함", subValue: "피니시" },
  ],
  brandStory: [
    '"닷사이"는 "수달의 축제"로, 제조 지역인 일본 야마구치현에 가까운 강가에 수달이 많이 모인다는 이야기에서 시작된 이름입니다.',
    "이는 수달들이 물고기를 늘어놓는 모습이 마치 술 장인이 재료를 정성스럽게 다루는 모습과 닮았다고 여겨져, 완성도 높은 사케를 만들겠다는 브랜드의 철학을 담고 있습니다.",
    '"팔기 위한, 판매하기 위한 술이 아니라 맛보는 술을 추구"를 신념으로 정성스럽게 맛있는 술을 만들고 있는 장인 정신의 브랜드입니다.',
  ],
  onlineShops: [
    { id: "shop-kihya-1", name: "키햐", delivery: "무료배송", price: "75,900원", url: "https://example.com/kihya" },
    { id: "shop-majil-1", name: "마켓컬리", delivery: "무료배송", price: "139,000원", url: "https://example.com/marketkurly" },
    { id: "shop-kihya-2", name: "키햐", delivery: "무료배송", price: "158,500원", url: "https://example.com/kihya-2" },
  ],
}

const mockProductById: Record<string, ProductDetailData> = {
  [dassai23.id]: dassai23,
}

export function useProductDetailPageData() {
  return useMemo(() => ({ mockProductById, defaultProduct: dassai23 }), [])
}
