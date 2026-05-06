export type DrinkCategory = {
  id: string
  label: string
  englishLabel: string
  subcategories: string[]
}

export const READY_CATEGORY_ID = "sake"
export const READY_SUBCATEGORY = "준마이 다이긴죠 / 다이긴죠"
export const CATEGORY_PREPARING_MESSAGE = "아직 준비 중인 기능이에요, 곧 만나보실 수 있어요!"

export const drinkCategories: DrinkCategory[] = [
  {
    id: "sake",
    label: "사케",
    englishLabel: "Sake",
    subcategories: ["준마이 다이긴죠 / 다이긴죠", "준마이 긴죠 / 긴죠", "준마이", "혼죠조 / 후츠슈"],
  },
  {
    id: "soju",
    label: "소주",
    englishLabel: "Soju",
    subcategories: ["데일리(희석식)", "프리미엄(증류식)", "플레이버"],
  },
  {
    id: "wine",
    label: "와인",
    englishLabel: "Wine",
    subcategories: ["레드 / 화이트 / 로제 / 스파클링", "내추럴", "포트", "디저트"],
  },
  {
    id: "beer",
    label: "맥주",
    englishLabel: "Beer",
    subcategories: ["라거 / 필스너", "에일 / IPA", "흑맥주(스타우트)", "과일맥주"],
  },
  {
    id: "whisky",
    label: "위스키",
    englishLabel: "Whisky",
    subcategories: ["싱글몰트", "블렌디드 몰트", "블렌디드", "아메리칸(버번/라이/테네시)", "그레인", "기타 국가"],
  },
  {
    id: "spirits",
    label: "증류주",
    englishLabel: "Spirits",
    subcategories: ["백주 / 고량주", "진 / 보드카", "테킬라 / 럼", "브랜디(꼬냑/아르마냑)"],
  },
  {
    id: "traditional",
    label: "전통주",
    englishLabel: "Traditional",
    subcategories: ["막걸리 / 탁주", "약주 / 청주", "전통 증류주", "과실주(한국 와인)"],
  },
  {
    id: "etc",
    label: "기타",
    englishLabel: "Etc.",
    subcategories: ["리큐르", "하이볼 / 칵테일", "논알콜 / 저도수 (Sober)"],
  },
]
