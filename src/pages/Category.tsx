import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import CategorySearch from "../components/CategorySearch"
import "../styles/category.css"

type DrinkCategory = {
  id: string
  label: string
  englishLabel: string
  subcategories: string[]
}

const READY_CATEGORY_ID = "sake"
const READY_SUBCATEGORY = "준마이 다이긴죠 / 다이긴죠"
const PREPARING_MESSAGE = "아직 준비 중인 기능이에요, 곧 만나보실 수 있어요!"

const drinkCategories: DrinkCategory[] = [
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

export default function Category() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnedGroupLabel = (location.state as { groupLabel?: string } | null)?.groupLabel
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [activeCategoryId, setActiveCategoryId] = useState(() => {
    const returnedCategory = drinkCategories.find((category) => category.label === returnedGroupLabel)
    return returnedCategory?.id ?? drinkCategories[0].id
  })
  const [searchValue, setSearchValue] = useState("")

  const activeCategory = drinkCategories.find((category) => category.id === activeCategoryId) ?? drinkCategories[0]

  const visibleCategories = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()
    if (!normalizedQuery) return drinkCategories

    return drinkCategories.filter((category) => {
      const categoryMatches =
        category.label.toLowerCase().includes(normalizedQuery) ||
        category.englishLabel.toLowerCase().includes(normalizedQuery)
      const subcategoryMatches = category.subcategories.some((subcategory) =>
        subcategory.toLowerCase().includes(normalizedQuery),
      )

      return categoryMatches || subcategoryMatches
    })
  }, [searchValue])

  const selectedCategory =
    visibleCategories.find((category) => category.id === activeCategoryId) ?? visibleCategories[0] ?? activeCategory

  const visibleSubcategories = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()
    if (!normalizedQuery) return selectedCategory.subcategories

    const selectedCategoryMatches =
      selectedCategory.label.toLowerCase().includes(normalizedQuery) ||
      selectedCategory.englishLabel.toLowerCase().includes(normalizedQuery)

    if (selectedCategoryMatches) return selectedCategory.subcategories

    return selectedCategory.subcategories.filter((subcategory) => subcategory.toLowerCase().includes(normalizedQuery))
  }, [searchValue, selectedCategory])

  const handleSubcategoryClick = (category: DrinkCategory, subcategory: string) => {
    if (category.id !== READY_CATEGORY_ID || subcategory !== READY_SUBCATEGORY) {
      alert(PREPARING_MESSAGE)
      return
    }

    const params = new URLSearchParams()
    params.set("group", category.label)
    params.set("sub", subcategory)
    navigate(`/category/list?${params.toString()}`)
  }

  return (
    <section className="category_page page_screen" aria-label="카테고리">
      <CategorySearch ref={searchInputRef} value={searchValue} onChange={setSearchValue} />

      <div className="category_layout">
        <aside className="category_group_list" aria-label="대분류">
          {visibleCategories.map((category, index) => (
            <button
              className={category.id === selectedCategory.id ? "category_group_button is_selected" : "category_group_button"}
              key={category.id}
              type="button"
              onClick={() => setActiveCategoryId(category.id)}
            >
              <span className="category_group_number">{index + 1}</span>
              <span className="category_group_text">
                <strong>{category.label}</strong>
                <small>{category.englishLabel}</small>
              </span>
            </button>
          ))}
        </aside>

        <section className="category_subcategory_panel" aria-label={`${selectedCategory.label} 하위 카테고리`}>
          <header className="category_subcategory_header">
            <h2>{selectedCategory.label}</h2>
            <p>{selectedCategory.englishLabel}</p>
          </header>

          <div className="category_subcategory_list">
            {visibleSubcategories.length === 0 ? <p className="category_empty">검색 결과가 없어요.</p> : null}
            {visibleSubcategories.map((subcategory) => (
              <button
                className="category_subcategory_button"
                key={subcategory}
                type="button"
                onClick={() => handleSubcategoryClick(selectedCategory, subcategory)}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
