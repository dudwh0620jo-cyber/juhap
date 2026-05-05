import { useMemo } from "react"

export type SubcategoryItem = {
  label: string
  relatedTerms?: string[]
}

export type AlcoholGroup = {
  id: string
  label: string
  items: SubcategoryItem[]
}

export const alcoholGroups: AlcoholGroup[] = [
  {
    id: "soju",
    label: "소주",
    items: [
      { label: "데일리(희석식)" },
      { label: "프리미엄(증류식)" },
      { label: "플레이버" },
    ],
  },
  {
    id: "wine",
    label: "와인",
    items: [
      { label: "레드", relatedTerms: ["레드와인", "red", "레드", "드라이", "탄닌"] },
      { label: "화이트", relatedTerms: ["화이트와인", "white", "화이트", "산뜻", "시트러스"] },
      { label: "로제", relatedTerms: ["로제", "rose", "핑크와인"] },
      { label: "스파클링", relatedTerms: ["스파클링", "sparkling", "샴페인", "버블"] },
      { label: "내추럴 와인", relatedTerms: ["내추럴", "natural", "오렌지와인", "내추럴와인"] },
    ],
  },
  {
    id: "beer",
    label: "맥주",
    items: [
      { label: "라거/필스너", relatedTerms: ["라거", "lager", "필스너", "pilsner"] },
      { label: "에일/IPA", relatedTerms: ["에일", "ale", "ipa", "홉", "홉향"] },
      { label: "흑맥주(스타우트)", relatedTerms: ["흑맥주", "스타우트", "stout", "포터", "porter"] },
      { label: "과일맥주", relatedTerms: ["과일맥주", "프루티", "fruit", "상큼"] },
    ],
  },
  {
    id: "spirits",
    label: "위스키/증류주",
    items: [
      { label: "싱글몰트" },
      { label: "블렌디드" },
      { label: "버번" },
      { label: "진/보드카" },
      { label: "테킬라" },
      { label: "럼" },
    ],
  },
  {
    id: "traditional",
    label: "전통주",
    items: [
      { label: "막걸리/탁주" },
      { label: "청주/약주" },
      { label: "과실주" },
    ],
  },
  {
    id: "sake",
    label: "사케",
    items: [
      { label: "다이긴죠 / 긴죠", relatedTerms: ["다이긴죠", "긴죠", "ginjo", "daiginjo", "향"] },
      { label: "준마이", relatedTerms: ["준마이", "junmai", "쌀", "감칠맛"] },
      { label: "혼죠조 / 일반주", relatedTerms: ["혼죠조", "honjozo", "일반주", "데일리"] },
    ],
  },
  {
    id: "other",
    label: "기타",
    items: [
      { label: "하이볼" },
      { label: "칵테일 (Mix)" },
      { label: "논알콜/저도수 (Sober)" },
    ],
  },
]

export function useCategoryPageData() {
  return useMemo(() => ({ alcoholGroups }), [])
}
