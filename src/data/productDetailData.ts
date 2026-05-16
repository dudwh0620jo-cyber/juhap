import { sakeProductsMock } from "./sakeProductsMock"
import { whiskeyProductsMock } from "./whiskeyProductsMock"
import { spiritsProductsMock } from "./spiritsProductsMock"
import { traditionalProductsMock } from "./traditionalProductsMock"
import { etcProductsMock } from "./etcProductsMock"

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
          breadcrumb: `사케 > ${product.subcategory}`,
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
  ...Object.fromEntries(
    whiskeyProductsMock.map((product) => [
      product.id,
      {
        id: product.id,
        breadcrumb: `위스키 > ${product.subcategory}`,
        name: product.name,
        price: `${product.priceWon.toLocaleString("ko-KR")}원`,
        rating: 4.0,
        basicInfo: [
          { label: "종류", value: "위스키" },
          { label: "용량", value: "700ml" },
          { label: "도수", value: product.abv ? `${product.abv}도` : "-" },
          { label: "세부 종류", value: product.subcategory },
          { label: "향미", value: product.tags.join(", ") },
          { label: "키워드", value: product.keywords.join(", ") },
        ],
        tasteNotes: [
          { label: "Aroma", value: product.tags[0] ?? "풍부한 향", subValue: "향" },
          { label: "Taste", value: product.keywords[1] ?? product.tags[1] ?? "균형 잡힌 맛", subValue: "맛" },
          { label: "Finish", value: product.tags[1] ?? "깔끔한 마무리", subValue: "피니시" },
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
  ...Object.fromEntries(
    spiritsProductsMock.map((product) => [
      product.id,
      {
        id: product.id,
        breadcrumb: `증류주 > ${product.subcategory}`,
        name: product.name,
        price: `${product.priceWon.toLocaleString("ko-KR")}원`,
        rating: 4.0,
        basicInfo: [
          { label: "종류", value: "증류주" },
          { label: "용량", value: "700ml" },
          { label: "도수", value: product.abv ? `${product.abv}도` : "-" },
          { label: "세부 종류", value: product.subcategory },
          { label: "향미", value: product.tags.join(", ") },
          { label: "키워드", value: product.keywords.join(", ") },
        ],
        tasteNotes: [
          { label: "Aroma", value: product.tags[0] ?? "풍부한 향", subValue: "향" },
          { label: "Taste", value: product.keywords[1] ?? product.tags[1] ?? "균형 잡힌 맛", subValue: "맛" },
          { label: "Finish", value: product.tags[1] ?? "깔끔한 마무리", subValue: "피니시" },
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
  ...Object.fromEntries(
    traditionalProductsMock.map((product) => [
      product.id,
      {
        id: product.id,
        breadcrumb: `전통주 > ${product.subcategory}`,
        name: product.name,
        price: `${product.priceWon.toLocaleString("ko-KR")}원`,
        rating: 4.0,
        basicInfo: [
          { label: "종류", value: "전통주" },
          { label: "용량", value: "750ml" },
          { label: "도수", value: product.abv ? `${product.abv}도` : "-" },
          { label: "세부 종류", value: product.subcategory },
          { label: "향미", value: product.tags.join(", ") },
          { label: "키워드", value: product.keywords.join(", ") },
        ],
        tasteNotes: [
          { label: "Aroma", value: product.tags[0] ?? "은은한 향", subValue: "향" },
          { label: "Taste", value: product.keywords[1] ?? product.tags[1] ?? "균형 잡힌 맛", subValue: "맛" },
          { label: "Finish", value: product.tags[1] ?? "깔끔한 마무리", subValue: "피니시" },
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
  ...Object.fromEntries(
    etcProductsMock.map((product) => [
      product.id,
      {
        id: product.id,
        breadcrumb: `기타 > ${product.subcategory}`,
        name: product.name,
        price: `${product.priceWon.toLocaleString("ko-KR")}원`,
        rating: 4.0,
        basicInfo: [
          { label: "종류", value: "기타" },
          { label: "용량", value: "700ml" },
          { label: "도수", value: product.abv !== undefined ? `${product.abv}도` : "-" },
          { label: "세부 종류", value: product.subcategory },
          { label: "향미", value: product.tags.join(", ") },
          { label: "키워드", value: product.keywords.join(", ") },
        ],
        tasteNotes: [
          { label: "Aroma", value: product.tags[0] ?? "은은한 향", subValue: "향" },
          { label: "Taste", value: product.keywords[1] ?? product.tags[1] ?? "균형 잡힌 맛", subValue: "맛" },
          { label: "Finish", value: product.tags[1] ?? "깔끔한 마무리", subValue: "피니시" },
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

const customProductById: Record<string, ProductDetailData> = {
  "sake-hakurakusei-junmai-ginjo": {
    id: "sake-hakurakusei-junmai-ginjo",
    breadcrumb: "사케 > 준마이 긴죠/긴죠",
    name: "하쿠라쿠세이",
    price: "30,800원",
    rating: 4.8,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "15%" },
      { label: "정미율", value: "55%" },
      { label: "산도", value: "1.6" },
      { label: "주도", value: "+4" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "은은한 과일향, 패션프루트, 배", subValue: "향" },
      { label: "Taste", value: "쌀고유의 단맛, 시트러스, 배", subValue: "맛" },
      { label: "Finish", value: "신선함, 가벼움, 깔끔함", subValue: "여운" },
    ],
    brandStory: [
      "하쿠라쿠세이(Hakurakusei)는 최고 품질의 쌀과 깨끗한 물을 사용해 사케를 빚는 일본 전통 브랜드입니다.",
      "준마이긴죠 스타일의 신선한 과일 향과 부드러운 질감이 특징이며, 전통 양조 기술과 현대적 품질 관리의 균형이 강점입니다.",
    ],
    onlineShops: [
      { id: "hakurakusei-shop-1", name: "데일리샷", delivery: "무료배송", price: "36,700원", url: "https://example.com/dailyshot" },
      { id: "hakurakusei-shop-2", name: "GS샵", delivery: "무료배송", price: "56,000원", url: "https://example.com/gsshop" },
    ],
  },
  "sake-kubota-senjyu": {
    id: "sake-kubota-senjyu",
    breadcrumb: "사케 > 준마이 긴죠/긴죠",
    name: "쿠보타 센쥬",
    price: "14,800원",
    rating: 4.6,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "15%" },
      { label: "정미율", value: "55%" },
      { label: "산도", value: "1.1" },
      { label: "주도", value: "+5" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "약간의 알코올 향", subValue: "향" },
      { label: "Taste", value: "과실맛, 부드러운 목넘김", subValue: "맛" },
      { label: "Finish", value: "깔끔한, 드라이한", subValue: "여운" },
    ],
    brandStory: [
      "쿠보타는 니가타 사케의 드라이한 카라구치 스타일을 대표하는 브랜드입니다.",
      "센쥬는 은은하고 투명한 감칠맛이 특징으로 다양한 음식과 안정적인 궁합을 보여줍니다.",
    ],
    onlineShops: [
      { id: "kubota-senjyu-shop-1", name: "데일리샷", delivery: "무료배송", price: "32,500원", url: "https://example.com/dailyshot" },
      { id: "kubota-senjyu-shop-2", name: "키햐", delivery: "무료배송", price: "41,900원", url: "https://example.com/kihya" },
    ],
  },
  "sake-jikon-junmai-ginjo": {
    id: "sake-jikon-junmai-ginjo",
    breadcrumb: "사케 > 준마이 긴죠/긴죠",
    name: "지콘 준마이 긴죠",
    price: "328,000원",
    rating: 4.9,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "1,800ml" },
      { label: "도수", value: "15.5%" },
      { label: "정미율", value: "50%" },
      { label: "산도", value: "1.6" },
      { label: "주도", value: "+1" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "꽃, 멜론, 잘 익은 과일", subValue: "향" },
      { label: "Taste", value: "깔끔한, 풍성한, 산뜻한", subValue: "맛" },
      { label: "Finish", value: "바닐라, 멜론, 쌀 고유의 단맛", subValue: "여운" },
    ],
    brandStory: [
      "1818년부터 이어진 키야쇼 양조장의 대표 브랜드로, 이가 지역의 기후·수질·쌀을 기반으로 생산됩니다.",
      "저온 발효와 세밀한 제국 공정을 통해 신선한 과실감과 밸런스를 구현한 지사케로 평가받습니다.",
    ],
    onlineShops: [{ id: "jikon-shop-1", name: "데일리샷", delivery: "무료배송", price: "299,000원", url: "https://example.com/dailyshot" }],
  },
  "sake-dewazakura-oka": {
    id: "sake-dewazakura-oka",
    breadcrumb: "사케 > 준마이 긴죠/긴죠",
    name: "데와자쿠라 오카 준마이 긴죠",
    price: "64,800원",
    rating: 4.7,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "16%" },
      { label: "정미율", value: "50%" },
      { label: "산도", value: "1.4" },
      { label: "주도", value: "+4" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "청사과, 리치, 복숭아, 곡물, 꽃", subValue: "향" },
      { label: "Taste", value: "곡물 단맛, 과실감, 감칠맛", subValue: "맛" },
      { label: "Finish", value: "부드러운 목넘김, 긴 피니시", subValue: "여운" },
    ],
    brandStory: [
      "데와자쿠라는 '긴죠를 세계의 언어로'를 목표로 긴죠슈 상품화를 선도한 양조장입니다.",
      "철저한 수작업 기반 양조와 안정적인 품질로 글로벌 시장에서도 높은 평가를 받고 있습니다.",
    ],
    onlineShops: [
      { id: "dewazakura-shop-1", name: "데일리샷", delivery: "무료배송", price: "46,000원", url: "https://example.com/dailyshot" },
      { id: "dewazakura-shop-2", name: "키햐", delivery: "무료배송", price: "56,700원", url: "https://example.com/kihya" },
    ],
  },
  "sake-tengumai-yamahai-junmai": {
    id: "sake-tengumai-yamahai-junmai",
    breadcrumb: "사케 > 준마이",
    name: "텐구마이 야마하이 준마이",
    price: "47,000원",
    rating: 4.6,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "15.9%" },
      { label: "정미율", value: "60%" },
      { label: "산도", value: "1.8" },
      { label: "주도", value: "+3" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "농밀한, 은은한", subValue: "향" },
      { label: "Taste", value: "곡산미, 감칠맛, 깊은", subValue: "맛" },
      { label: "Finish", value: "부드러운", subValue: "여운" },
    ],
    brandStory: [
      "샤타 주조는 1823년부터 이어진 이시카와 지역의 장기 양조장으로 '기술보다 감성' 철학을 강조합니다.",
      "야마하이 스타일의 밀도감 있는 구조와 음식 친화성이 강점입니다.",
    ],
    onlineShops: [
      { id: "tengumai-shop-1", name: "데일리샷", delivery: "무료배송", price: "36,200원", url: "https://example.com/dailyshot" },
      { id: "tengumai-shop-2", name: "키햐", delivery: "무료배송", price: "44,600원", url: "https://example.com/kihya" },
    ],
  },
  "sake-hakkaisan-honjozo": {
    id: "sake-hakkaisan-honjozo",
    breadcrumb: "사케 > 혼죠조/후츠슈",
    name: "핫카이산 혼죠조",
    price: "55,000원",
    rating: 4.6,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "15.5%" },
      { label: "정미율", value: "55%" },
      { label: "산도", value: "1.8" },
      { label: "주도", value: "+3" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "쌀, 쌀 고유의 단맛", subValue: "향" },
      { label: "Taste", value: "달콤한, 부드러운", subValue: "맛" },
      { label: "Finish", value: "담백한", subValue: "여운" },
    ],
    brandStory: [
      "핫카이 양조장은 니가타 핫카이산의 연수를 기반으로 맑고 부드러운 주질을 구현합니다.",
      "연수 기반 양조 특성으로 음식과의 조화가 뛰어난 스타일입니다.",
    ],
    onlineShops: [
      { id: "hakkaisan-honjozo-shop-1", name: "데일리샷", delivery: "무료배송", price: "27,000원", url: "https://example.com/dailyshot" },
      { id: "hakkaisan-honjozo-shop-2", name: "키햐", delivery: "무료배송", price: "32,900원", url: "https://example.com/kihya" },
    ],
  },
  "sake-koshinokanbai-futsushu-white-label": {
    id: "sake-koshinokanbai-futsushu-white-label",
    breadcrumb: "사케 > 혼죠조/후츠슈",
    name: "코시노칸바이 후츠슈 화이트라벨",
    price: "55,000원",
    rating: 4.5,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "15.5%" },
      { label: "정미율", value: "55%" },
      { label: "산도", value: "1.8" },
      { label: "주도", value: "+3" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "신선한 쌀 향기, 약간의 과일 향, 꽃 향기", subValue: "향" },
      { label: "Taste", value: "부드러운 쌀 맛, 은은한 단맛, 깔끔한 텍스처", subValue: "맛" },
      { label: "Finish", value: "깔끔하고 상쾌한 마무리, 쌀의 여운", subValue: "여운" },
    ],
    brandStory: [
      "코시노칸바이는 일본 전통 사케 브랜드로, 쌀과 물의 품질에 집중한 양조 철학을 유지합니다.",
      "후츠슈 화이트라벨은 가볍고 균형적인 데일리 스타일로 구성됩니다.",
    ],
    onlineShops: [
      { id: "koshino-shop-1", name: "드렁큰몽키", delivery: "무료배송", price: "28,000원", url: "https://example.com/drunkenmonkey" },
      { id: "koshino-shop-2", name: "키햐", delivery: "무료배송", price: "55,000원", url: "https://example.com/kihya" },
    ],
  },
  "sake-hakushika-goka-junmai-daiginjo-sennenju": {
    id: "sake-hakushika-goka-junmai-daiginjo-sennenju",
    breadcrumb: "사케 > 준마이 다이긴죠/다이긴죠",
    name: "하쿠시카 호화 준마이다이긴죠 천년수",
    price: "198,000원",
    rating: 4.8,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "15.7%" },
      { label: "정미율", value: "50%" },
      { label: "산도", value: "1.8" },
      { label: "주도", value: "+3" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "잘 익은 사과·배, 은은한 바나나, 곡물 향", subValue: "향" },
      { label: "Taste", value: "곡산미, 감칠맛, 깊은", subValue: "맛" },
      { label: "Finish", value: "부드러운", subValue: "여운" },
    ],
    brandStory: [
      "하쿠시카는 1662년부터 이어진 나다 지역의 유서 깊은 양조장으로, 장기간 축적된 양조 노하우를 보유합니다.",
      "고급 라인업은 밸런스와 향의 정교함을 중심으로 구성됩니다.",
    ],
    onlineShops: [
      { id: "hakushika-goka-shop-1", name: "GS SHOP", delivery: "무료배송", price: "55,000원", url: "https://example.com/gsshop" },
      { id: "hakushika-goka-shop-2", name: "키햐", delivery: "무료배송", price: "64,900원", url: "https://example.com/kihya" },
    ],
  },
  "sake-hakushika-tokubetsu-honjozo-yamadanishiki": {
    id: "sake-hakushika-tokubetsu-honjozo-yamadanishiki",
    breadcrumb: "사케 > 혼죠조/후츠슈",
    name: "하쿠시카 토쿠베츠혼죠조 야마다니시키",
    price: "34,000원",
    rating: 4.5,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "720ml" },
      { label: "도수", value: "14.7%" },
      { label: "정미율", value: "70%" },
      { label: "산도", value: "1.3~1.5" },
      { label: "주도", value: "+1" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "쌀, 쌀 고유의 단맛", subValue: "향" },
      { label: "Taste", value: "달콤한, 부드러운", subValue: "맛" },
      { label: "Finish", value: "담백한", subValue: "여운" },
    ],
    brandStory: [
      "하쿠시카 주조는 장기간 이어진 전통과 야마다니시키 중심 원료 운영으로 안정된 품질을 유지합니다.",
      "토쿠베츠 라인은 일상 식사와의 페어링 친화성을 목표로 설계된 제품군입니다.",
    ],
    onlineShops: [
      { id: "hakushika-tokubetsu-shop-1", name: "키햐", delivery: "무료배송", price: "24,300원", url: "https://example.com/kihya" },
      { id: "hakushika-tokubetsu-shop-2", name: "데일리샷", delivery: "무료배송", price: "31,900원", url: "https://example.com/dailyshot" },
    ],
  },
  "sake-ganbare-ottosan": {
    id: "sake-ganbare-ottosan",
    breadcrumb: "사케 > 혼죠조/후츠슈",
    name: "간바레 오또상!",
    price: "23,800원",
    rating: 4.4,
    basicInfo: [
      { label: "종류", value: "사케" },
      { label: "용량", value: "900ml" },
      { label: "도수", value: "14%" },
      { label: "정미율", value: "70%" },
      { label: "산도", value: "1.3" },
      { label: "주도", value: "-3" },
    ],
    tasteNotes: [
      { label: "Aroma", value: "부드럽고 달콤한 과일향, 깔끔한 쌀 향기", subValue: "향" },
      { label: "Taste", value: "약간 달콤, 부드럽고 신선한 맛, 쌀의 고소함", subValue: "맛" },
      { label: "Finish", value: "깨끗하고 상쾌한 여운", subValue: "여운" },
    ],
    brandStory: [
      "니가타 하쿠류주조의 전통과 현대적 양조 기술을 기반으로 기획된 데일리 사케입니다.",
      "부드러운 음용감과 식사 친화적인 밸런스가 핵심 포인트입니다.",
    ],
    onlineShops: [{ id: "ganbare-shop-1", name: "키햐", delivery: "무료배송", price: "19,000원", url: "https://example.com/kihya" }],
  },
}

Object.assign(mockProductById, customProductById)

export const productDetailPageData = { mockProductById, defaultProduct } as const
