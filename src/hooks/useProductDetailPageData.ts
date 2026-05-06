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
  price: "88,000원",
  basicInfo: [
    { label: "종류", value: "사케" },
    { label: "용량", value: "720ml" },
    { label: "도수", value: "15~16도" },
    { label: "정미율", value: "23%" },
    { label: "산도", value: "1.1" },
    { label: "주도", value: "+4" },
  ],
  tasteNotes: [
    { label: "Aroma", value: "온화한, 꽃, 끌, 은은한", subValue: "향" },
    { label: "Taste", value: "경쾌한, 감칠맛, 섬세한", subValue: "맛" },
    { label: "Finish", value: "부드러운, 시원한, 깔끔한", subValue: "피니쉬" },
  ],
  brandStory: [
    `"닷사이"의 뜻은 "수달 축제"로 제조 지역인 야마구치현에서 가까운 강가에 수달이 많이 노니던 곳에서 사용했던 단어입니다.`,
    `이는 수달들이 먼저 축제를 벌인 듯 작은 물고기를 해안가에 늘어놓은 모습이 마치 한자들이 시제들을 펼치고 연구하는 모습과 같아 술을 빚기 위한 자료를 찾고 연구하여 세계의 새로운 시대를 열겠다는 닷사이의 포부가 담긴 이름입니다.`,
    `“취하기 위한, 판매하기 위한 술이 아니라 맛보는 술을 추구"를 신념으로 정성으로 맛있는 술을 만들고 있는 장인 정신의 브랜드입니다.`,
  ],
  onlineShops: [
    { id: "shop-kihya-1", name: "키햐", delivery: "무료배송", price: "75,900원", url: "https://example.com/kihya" },
    { id: "shop-majil-1", name: "마켓컬리", delivery: "무료배송", price: "139,000원", url: "https://example.com/majil" },
    { id: "shop-kihya-2", name: "키햐", delivery: "무료배송", price: "158,500원", url: "https://example.com/kihya-2" },
  ],
}

const mockProductById: Record<string, ProductDetailData> = {
  [dassai23.id]: dassai23,
}

export function useProductDetailPageData() {
  return useMemo(() => ({ mockProductById, defaultProduct: dassai23 }), [])
}
