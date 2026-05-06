import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import CategorySearch from "../components/CategorySearch"
import {
  CATEGORY_PREPARING_MESSAGE,
  READY_CATEGORY_ID,
  READY_SUBCATEGORY,
  drinkCategories,
  type DrinkCategory,
} from "../data/categoryData"
import "../styles/category.css"

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
      alert(CATEGORY_PREPARING_MESSAGE)
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
