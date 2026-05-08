import { useMemo } from "react"
import { sakeProductsMock } from "../data/sakeProductsMock"

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
    { label: "일도", value: "+4" },
  ],
  tasteNotes: [
    { label: "Aroma", value: "은은한 배·멜론 계열 과실향", subValue: "향" },
    { label: "Taste", value: "부드럽고 깔끔한 균형감", subValue: "맛" },
    { label: "Finish", value: "길고 깨끗한 여운", subValue: "피니시" },
  ],
  brandStory: [
    "닷사이 23은 정미율 23%까지 깎아내 섬세한 향과 부드러운 질감을 강조한 준마이 다이긴죠 스타일입니다.",
    "차갑게(8~12℃) 즐기면 과실향과 깔끔한 피니시가 더 잘 느껴져요.",
  ],
  onlineShops: [
    { id: "shop-kihya-1", name: "키햐", delivery: "무료배송", price: "75,900원", url: "https://example.com/kihya" },
    { id: "shop-marketkurly-1", name: "마켓컬리", delivery: "무료배송", price: "139,000원", url: "https://example.com/marketkurly" },
    { id: "shop-kihya-2", name: "키햐", delivery: "무료배송", price: "158,500원", url: "https://example.com/kihya-2" },
  ],
}

const mockProductById: Record<string, ProductDetailData> = {
  [dassai23.id]: dassai23,
  ...Object.fromEntries(
    sakeProductsMock
      .filter((product) => product.id !== dassai23.id)
      .map((product) => [
        product.id,
        {
          id: product.id,
          breadcrumb: "사케 > 준마이 다이긴죠",
          name: product.name,
          price: `${product.priceWon.toLocaleString("ko-KR")}원`,
          basicInfo: [
            { label: "종류", value: "사케" },
            { label: "용량", value: "720ml" },
            { label: "도수", value: product.tags.find((tag) => tag.includes("도")) ?? "15~16도" },
            { label: "정미율", value: "-" },
            { label: "산도", value: "-" },
            { label: "일도", value: "-" },
          ],
          tasteNotes: [
            { label: "Aroma", value: product.chat.tastingNotes[0] ?? "은은한 향", subValue: "향" },
            { label: "Taste", value: product.chat.notes[0] ?? "부드러운 풍미", subValue: "맛" },
            { label: "Finish", value: product.chat.tastingNotes[1] ?? "깔끔한 피니시", subValue: "피니시" },
          ],
          brandStory: [
            `${product.name}의 브랜드 스토리는 준비 중이에요.`,
            "현재는 목업 데이터로 상세 내용을 구성하고 있어요.",
          ],
          onlineShops: [
            {
              id: `${product.id}-shop-1`,
              name: "키햐",
              delivery: "무료배송",
              price: `${product.priceWon.toLocaleString("ko-KR")}원`,
              url: "https://example.com/kihya",
            },
            {
              id: `${product.id}-shop-2`,
              name: "마켓컬리",
              delivery: "무료배송",
              price: `${product.priceWon.toLocaleString("ko-KR")}원`,
              url: "https://example.com/marketkurly",
            },
          ],
        } satisfies ProductDetailData,
      ]),
  ),
}

export function useProductDetailPageData() {
  return useMemo(() => ({ mockProductById, defaultProduct: dassai23 }), [])
}

