import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import type { CategoryListItem } from "../components/CategoryItemCard"
import CategoryItemCard from "../components/CategoryItemCard"
import CategoryListSearch from "../components/CategoryListSearch"
import { useCategoryListPageData, type SortKey } from "../hooks/useCategoryListPageData"
import { READY_SUBCATEGORY } from "../data/categoryData"
import "../styles/category-list.css"

const sortLabels: Record<SortKey, string> = {
  default: "기본순",
  recommended: "추천순",
  lowPrice: "낮은 가격순",
  highPrice: "높은 가격순",
}

export default function CategoryList() {
  const { sakeDaiginjoItems, sortOptions } = useCategoryListPageData()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const group = searchParams.get("group") ?? "사케"
  const sub = searchParams.get("sub") ?? READY_SUBCATEGORY

  const [searchValue, setSearchValue] = useState("")
  const [activeSortKey, setActiveSortKey] = useState<SortKey>("default")
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return sakeDaiginjoItems

    return sakeDaiginjoItems.filter((item) => {
      const searchableText = [item.name, ...item.tags, ...item.keywords].join(" ").toLowerCase()
      return searchableText.includes(query)
    })
  }, [sakeDaiginjoItems, searchValue])

  const sortedItems = useMemo(() => {
    const nextItems = [...filteredItems]
    if (activeSortKey === "lowPrice") return nextItems.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (activeSortKey === "highPrice") return nextItems.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    if (activeSortKey === "default") return nextItems.sort((a, b) => a.name.localeCompare(b.name))
    return nextItems
  }, [activeSortKey, filteredItems])

  const returnState = location.state as { returnCategoryId?: string; returnScrollTop?: number } | null
  const handleBack = () => {
    navigate("/category", {
      state: { groupLabel: group, categoryId: returnState?.returnCategoryId, scrollTop: returnState?.returnScrollTop },
    })
  }

  function handleOpenItem(item: CategoryListItem) {
    navigate(`/product/${item.id}`)
  }

  return (
    <section className="category_list_page page_screen" aria-label="카테고리 리스트">
      <header className="category_list_header">
        <button type="button" className="category_list_back" aria-label="카테고리로 돌아가기" onClick={handleBack}>
          ‹
        </button>
        <CategoryListSearch ref={searchInputRef} value={searchValue} onChange={setSearchValue} onConfirm={() => undefined} />
      </header>

      <div className="category_list_meta_row">
        <button type="button" className="category_list_title" onClick={handleBack}>
          {group} &gt; {sub}
        </button>
        <button className="category_sort_button" type="button" onClick={() => setIsSortSheetOpen(true)}>
          {sortLabels[activeSortKey]}
          <span aria-hidden="true" />
        </button>
      </div>

      <div className="category_list_cards" aria-label="카테고리 상품 목록">
        {sortedItems.length === 0 ? <p className="category_list_empty">검색 결과가 없어요</p> : null}
        {sortedItems.map((item) => (
          <CategoryItemCard key={item.id} item={item} onOpen={handleOpenItem} />
        ))}
      </div>

      {isSortSheetOpen && (
        <div className="category_sort_overlay" role="presentation" onClick={() => setIsSortSheetOpen(false)}>
          <section
            className="category_sort_sheet"
            aria-label="정렬"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>정렬</h2>
            <div className="category_sort_options">
              {sortOptions.map((option) => (
                <button
                  className="category_sort_option"
                  type="button"
                  key={option.key}
                  onClick={() => {
                    setActiveSortKey(option.key)
                    setIsSortSheetOpen(false)
                  }}
                >
                  {option.label}
                  {activeSortKey === option.key ? <span aria-hidden="true">✓</span> : null}
                </button>
              ))}
            </div>
            <button className="category_sort_close" type="button" onClick={() => setIsSortSheetOpen(false)}>
              닫기
            </button>
          </section>
        </div>
      )}
    </section>
  )
}

