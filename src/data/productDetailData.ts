import { sakeProductsMock } from "./sakeProductsMock"

export type ProductPurchaseShop = {
  id: string
  name: string
  productName?: string
  delivery: string
  price: string
  url: string
}

export type ProductDetailData = {
  id: string
  breadcrumb: string
  name: string
  price: string
  rating: number
  basicInfo: Array<{ label: string; value: string }>
  tasteNotes: Array<{ label: string; value: string; subValue: string }>
  brandStory: string[]
  onlineShops: ProductPurchaseShop[]
}

export const defaultProduct: ProductDetailData = {
  id: "sake-dassai-23",
  breadcrumb: "사케 > 준마이 다이긴죠 / 다이긴죠",
  name: "닷사이 23",
  price: "98,900원",
  rating: 5.0,
  basicInfo: [
    { label: "종류", value: "사케" },
    { label: "용량", value: "720ml" },
    { label: "도수", value: "15~16도" },
    { label: "정미율", value: "23%" },
    { label: "산도", value: "1.1" },
    { label: "일본도", value: "+4" },
  ],
  tasteNotes: [
    { label: "Aroma", value: "온화한, 꽃, 꿀, 은은한", subValue: "향" },
    { label: "Taste", value: "경쾌한, 감칠맛, 섬세한", subValue: "맛" },
    { label: "Finish", value: "부드러운, 시원한, 깔끔한", subValue: "피니시" },
  ],
  brandStory: [
    `"닷사이"의 뜻은 "수달 축제"로 제조 지역인 야마구치현에서 가까운 강가에 수달이 많이 노니던 곳에서 사용했던 단어입니다.
이는 수달들이 마치 축제를 벌이듯 잡은 물고기를 해안가에 늘어놓은 모습이 마치 학자들이 서적들을 펼쳐놓고 연구하는 모습과 같아, 술을 빚기 위해 자료를 찾고 연구하며 사케의 새로운 시대를 열겠다는 닷사이의 포부가 담긴 이름입니다.
“취하기 위한, 판매하기 위한 술이 아니라 맛보는 술을 추구"를 신념으로 정성으로 맛있는 술을 만들고 있는 장인 정신의 브랜드입니다.`,
  ],
  onlineShops: [
    {
      id: "shop-kihya-1",
      name: "키햐",
      productName: "준마이 다이긴죠 닷사이 23",
      delivery: "무료배송",
      price: "75,900원",
      url: "https://example.com/kihya",
    },
    {
      id: "shop-marketkurly-1",
      name: "마켓컬리",
      productName: "닷사이 23",
      delivery: "무료배송",
      price: "82,900원",
      url: "https://example.com/marketkurly",
    },
    {
      id: "shop-kihya-2",
      name: "키햐",
      productName: "사케 준마이 다이긴죠 닷사이 23",
      delivery: "무료배송",
      price: "88,900원",
      url: "https://example.com/kihya-2",
    },
  ],
}

export const mockProductById: Record<string, ProductDetailData> = {
  [defaultProduct.id]: defaultProduct,
  ...Object.fromEntries(
    sakeProductsMock
      .filter((product) => product.id !== defaultProduct.id)
      .map((product) => [
        product.id,
        {
          id: product.id,
          breadcrumb: "사케 > 준마이 다이긴죠 / 다이긴죠",
          name: product.name,
          price: `${product.priceWon.toLocaleString("ko-KR")}원`,
          rating: 4.0,
          basicInfo: [
            { label: "종류", value: "사케" },
            { label: "용량", value: "720ml" },
            { label: "도수", value: product.tags.find((tag) => tag.includes("도")) ?? "15~16도" },
            { label: "정미율", value: "-" },
            { label: "산도", value: "-" },
            { label: "일본도", value: "-" },
          ],
          tasteNotes: [
            { label: "Aroma", value: product.chat.tastingNotes[0] ?? "은은한 과실향", subValue: "향" },
            { label: "Taste", value: product.chat.notes[0] ?? "부드럽고 깔끔한 타입", subValue: "맛" },
            { label: "Finish", value: product.chat.tastingNotes[1] ?? "깨끗한 마무리", subValue: "피니시" },
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

export const productDetailPageData = { mockProductById, defaultProduct } as const
