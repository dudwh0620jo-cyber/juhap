import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import CategorySearch from "../components/CategorySearch"
import {
  CATEGORY_PREPARING_MESSAGE,
  READY_SUBCATEGORY,
  drinkCategories,
  subcategoryInfoByCategoryId,
  type DrinkCategory,
} from "../data/categoryData"
import "../styles/category.css"

export default function Category() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnedState = location.state as
    | { groupLabel?: string; categoryId?: string; scrollTop?: number }
    | null
  const returnedGroupLabel = returnedState?.groupLabel
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const scrollPanelRef = useRef<HTMLDivElement | null>(null)
  const leftListRef = useRef<HTMLDivElement | null>(null)
  const sectionHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isProgrammaticScrollRef = useRef(false)
  const programmaticScrollTimeoutRef = useRef<number | null>(null)
  const scrollRafRef = useRef<number | null>(null)

  const [activeCategoryId, setActiveCategoryId] = useState(() => {
    const returnedCategory = drinkCategories.find((category) => category.label === returnedGroupLabel)
    return returnedState?.categoryId ?? returnedCategory?.id ?? drinkCategories[0].id
  })
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    return () => {
      if (programmaticScrollTimeoutRef.current) window.clearTimeout(programmaticScrollTimeoutRef.current)
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current)
    }
  }, [])

  const visibleCategories = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()
    if (!normalizedQuery) return drinkCategories

    return drinkCategories.filter((category) => {
      const categoryMatches = category.label.toLowerCase().includes(normalizedQuery)
      const subcategoryMatches = category.subcategories.some((subcategory) =>
        subcategory.toLowerCase().includes(normalizedQuery),
      )

      return categoryMatches || subcategoryMatches
    })
  }, [searchValue])

  useEffect(() => {
    if (visibleCategories.length === 0) return
    if (visibleCategories.some((category) => category.id === activeCategoryId)) return
    setActiveCategoryId(visibleCategories[0].id)
  }, [activeCategoryId, visibleCategories])

  const categoriesWithVisibleSubcategories = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()
    if (!normalizedQuery) {
      return visibleCategories.map((category) => ({ category, subcategories: category.subcategories }))
    }

    return visibleCategories
      .map((category) => {
        const categoryMatches = category.label.toLowerCase().includes(normalizedQuery)

        const subcategories = categoryMatches
          ? category.subcategories
          : category.subcategories.filter((subcategory) => subcategory.toLowerCase().includes(normalizedQuery))

        return { category, subcategories }
      })
      .filter(({ subcategories }) => subcategories.length > 0)
  }, [searchValue, visibleCategories])

  const handleSubcategoryClick = (category: DrinkCategory, subcategory: string) => {
    const isReady = category.id === "sake" && subcategory === READY_SUBCATEGORY
    if (!isReady) {
      alert(CATEGORY_PREPARING_MESSAGE)
      return
    }

    const params = new URLSearchParams()
    params.set("group", category.label)
    params.set("sub", subcategory)
    navigate(`/category/list?${params.toString()}`, {
      state: { returnCategoryId: category.id, returnScrollTop: scrollPanelRef.current?.scrollTop ?? 0 },
    })
  }

  useEffect(() => {
    const root = scrollPanelRef.current
    const returnedScrollTop = returnedState?.scrollTop
    if (!root || returnedScrollTop === undefined) return

    isProgrammaticScrollRef.current = true
    root.scrollTo({ top: returnedScrollTop })
    if (programmaticScrollTimeoutRef.current) window.clearTimeout(programmaticScrollTimeoutRef.current)
    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 120)
  }, [returnedState?.scrollTop])

  useEffect(() => {
    const root = scrollPanelRef.current
    if (!root) return

    const pickActiveCategoryId = () => {
      if (isProgrammaticScrollRef.current) return

      const scrollTop = root.scrollTop
      const paddingTop = Number.parseFloat(window.getComputedStyle(root).paddingTop || "0") || 0
      const probeLine = scrollTop + paddingTop + 12

      if (categoriesWithVisibleSubcategories.length > 0) {
        const isNearBottom = scrollTop + root.clientHeight >= root.scrollHeight - 2
        if (isNearBottom) {
          const lastId = categoriesWithVisibleSubcategories[categoriesWithVisibleSubcategories.length - 1].category.id
          if (lastId !== activeCategoryId) setActiveCategoryId(lastId)
          return
        }
      }

      let nextActiveId: string | null = null
      for (const { category } of categoriesWithVisibleSubcategories) {
        const header = sectionHeaderRefs.current[category.id]
        if (!header) continue
        if (header.offsetTop <= probeLine) nextActiveId = category.id
        else break
      }

      if (nextActiveId && nextActiveId !== activeCategoryId) setActiveCategoryId(nextActiveId)
    }

    const onScroll = () => {
      if (scrollRafRef.current) return
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null
        pickActiveCategoryId()
      })
    }

    root.addEventListener("scroll", onScroll, { passive: true })
    pickActiveCategoryId()
    return () => root.removeEventListener("scroll", onScroll)
  }, [activeCategoryId, categoriesWithVisibleSubcategories])

  const scrollToCategory = (categoryId: string) => {
    const root = scrollPanelRef.current
    const target = sectionHeaderRefs.current[categoryId]
    if (!root || !target) {
      setActiveCategoryId(categoryId)
      return
    }

    const paddingTop = Number.parseFloat(window.getComputedStyle(root).paddingTop || "0") || 0
    isProgrammaticScrollRef.current = true
    setActiveCategoryId(categoryId)
    root.scrollTo({ top: Math.max(0, target.offsetTop - paddingTop), behavior: "smooth" })

    if (programmaticScrollTimeoutRef.current) window.clearTimeout(programmaticScrollTimeoutRef.current)
    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 450)
  }

  useEffect(() => {
    const leftRoot = leftListRef.current
    if (!leftRoot) return
    const el = leftRoot.querySelector(`[data-category-id="${activeCategoryId}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: "nearest" })
  }, [activeCategoryId])

  return (
    <section className="category_page page_screen" aria-label="카테고리">
      <CategorySearch ref={searchInputRef} value={searchValue} onChange={setSearchValue} />

      <div className="category_layout category_layout_v2">
        <aside className="category_group_list category_group_list_v2" aria-label="주종">
          <div className="category_group_list_inner" ref={leftListRef}>
            {categoriesWithVisibleSubcategories.map(({ category }) => (
              <button
                className={category.id === activeCategoryId ? "category_group_button is_selected" : "category_group_button"}
                key={category.id}
                type="button"
                data-category-id={category.id}
                onClick={() => scrollToCategory(category.id)}
              >
                <span className="category_group_text">
                  <strong>{category.label}</strong>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="category_subcategory_panel category_subcategory_panel_v2" aria-label="카테고리 목록">
          <div className="category_subcategory_scroll" ref={scrollPanelRef}>
            {categoriesWithVisibleSubcategories.length === 0 ? <p className="category_empty">검색 결과가 없어요</p> : null}
            {categoriesWithVisibleSubcategories.map(({ category, subcategories }) => (
              <div className="category_section" key={category.id} data-category-id={category.id}>
                <div
                  className="category_section_header"
                  data-category-id={category.id}
                  ref={(node) => {
                    sectionHeaderRefs.current[category.id] = node
                  }}
                >
                  <span className="category_section_title">
                    <strong>{category.label}</strong>
                    <small>{category.englishLabel}</small>
                  </span>
                  <span className="category_section_chevron" aria-hidden="true">
                    ›
                  </span>
                </div>

                <div className="category_subcategory_list">
                  {subcategories.map((subcategory) => {
                    const infoText = subcategoryInfoByCategoryId[category.id]?.[subcategory]
                    const isReady = category.id === "sake" && subcategory === READY_SUBCATEGORY
                    return (
                      <button
                        className={isReady ? "category_subcategory_row is_ready" : "category_subcategory_row is_disabled"}
                        key={subcategory}
                        type="button"
                        data-category-id={category.id}
                        data-subcategory={subcategory}
                        aria-disabled={!isReady}
                        onClick={() => handleSubcategoryClick(category, subcategory)}
                      >
                        <span className="category_subcategory_row_title">{subcategory}</span>
                        {infoText ? <span className="category_subcategory_row_desc">{infoText}</span> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
