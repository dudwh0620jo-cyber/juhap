import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import AlertModal from "../components/AlertModal"
import CategorySearch from "../components/CategorySearch"
import CategorySearchFilterPanel from "../components/CategorySearchFilterPanel"
import {
  DEFAULT_DRINK_TYPE_LABEL,
  READY_SUBCATEGORY,
  drinkCategories,
  subcategoryInfoByCategoryId,
  type DrinkCategory,
} from "../data/categoryData"
import {
  ABV_MAX,
  ABV_MIN,
  FEATURE_CHIPS,
  PRICE_MAX,
  PRICE_MIN,
  type CategoryFilterPayload,
} from "../data/categoryFilterConfig"
import { sakeProductsMock } from "../data/sakeProductsMock"
import { sojuProductsMock } from "../data/sojuProductsMock"
import { wineProductsMock } from "../data/wineProductsMock"
import { beerProductsMock } from "../data/beerProductsMock"
import { whiskeyProductsMock } from "../data/whiskeyProductsMock"
import { spiritsProductsMock } from "../data/spiritsProductsMock"
import { traditionalProductsMock } from "../data/traditionalProductsMock"
import { etcProductsMock } from "../data/etcProductsMock"
import { useCategorySearchExperience } from "../hooks/useCategorySearchExperience"
import { useCategorySearchFilterState } from "../hooks/useCategorySearchFilterState"
import { resolvePricePresetToggle } from "../utils/pricePreset"
import { calculateRangePercent } from "../utils/range"
import "../styles/category.css"

const inferSearchableFeatures = (tokens: string[]) => {
  const joined = tokens.join(" ").toLowerCase()
  const features: string[] = []
  if (joined.includes("과일")) features.push("과일향")
  if (joined.includes("부드")) features.push("부드러운")
  if (joined.includes("가벼")) features.push("가벼운")
  if (joined.includes("묵직") || joined.includes("무거")) features.push("무거운")
  if (joined.includes("탄산") || joined.includes("톡")) features.push("톡쏘는")
  if (joined.includes("오크")) features.push("오크향")
  FEATURE_CHIPS.forEach((feature) => {
    if (joined.includes(feature.toLowerCase())) features.push(feature)
  })
  return Array.from(new Set(features)).filter((feature) => FEATURE_CHIPS.includes(feature as (typeof FEATURE_CHIPS)[number]))
}

export default function Category() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnedState = location.state as
    | { groupLabel?: string; categoryId?: string; scrollTop?: number; resetCategorySearch?: boolean }
    | null
  const returnedGroupLabel = returnedState?.groupLabel

  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const overlaySearchInputRef = useRef<HTMLInputElement | null>(null)
  const scrollPanelRef = useRef<HTMLDivElement | null>(null)
  const leftListRef = useRef<HTMLDivElement | null>(null)
  const sectionHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const handledResetCategorySearchRef = useRef(false)
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false)
  const isProgrammaticScrollRef = useRef(false)
  const programmaticScrollTimeoutRef = useRef<number | null>(null)
  const scrollRafRef = useRef<number | null>(null)

  const [activeCategoryId, setActiveCategoryId] = useState(() => {
    const returnedCategory = drinkCategories.find((category) => category.label === returnedGroupLabel)
    return returnedState?.categoryId ?? returnedCategory?.id ?? drinkCategories[0].id
  })
  const [searchValue, setSearchValue] = useState("")
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)
  const [searchStarted, setSearchStarted] = useState(false)
  const [searchSubmitted, setSearchSubmitted] = useState(false)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(true)
  const defaultSakeLabel = useMemo(() => DEFAULT_DRINK_TYPE_LABEL, [])

  const searchableItems = useMemo(
    () =>
      [
        ...sakeProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: defaultSakeLabel,
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: product.tags,
          keywords: product.keywords,
        })),
        ...sojuProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "소주",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: product.tags,
          keywords: product.keywords,
        })),
        ...wineProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "와인",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["와인", ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...beerProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "맥주",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["맥주", ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...whiskeyProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "위스키",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["위스키", ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...spiritsProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "증류주",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["증류주", ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...traditionalProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "전통주",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["전통주", ...(product.abv ? [`${product.abv}도`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...etcProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "기타",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["기타", ...(product.abv !== undefined ? [`${product.abv}도`] : []), ...product.tags],
          keywords: product.keywords,
        })),
      ],
    [defaultSakeLabel],
  )

  const {
    selectedDrinkTypeLabel,
    selectedCategoryChip,
    selectedFeatureChips,
    priceRange,
    setPriceRange,
    pricePreset,
    setPricePreset,
    abvRange,
    setAbvRange,
    overlayFilterGroups,
    toggleFilterChip,
    isOverlayChipEnabled,
    resetOverlayFilters,
  } = useCategorySearchFilterState({
    initialDrinkTypeLabel: null,
    initialCategoryChip: null,
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
    abvMin: ABV_MIN,
    abvMax: ABV_MAX,
    drinkCategories,
    featureChips: FEATURE_CHIPS,
    readySubcategory: READY_SUBCATEGORY,
  })

  const openSearchOverlay = () => {
    setSearchStarted(false)
    setSearchSubmitted(false)
    setIsSearchOverlayOpen(true)
  }

  const closeSearchOverlay = () => {
    setSearchStarted(false)
    setSearchSubmitted(false)
    setIsSearchOverlayOpen(false)
  }

  useEffect(() => {
    return () => {
      if (programmaticScrollTimeoutRef.current) window.clearTimeout(programmaticScrollTimeoutRef.current)
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current)
    }
  }, [])

  const visibleOverlayGroups = overlayFilterGroups

  const showPriceSection = true
  const showAbvSection = true
  const priceMinPct = useMemo(() => calculateRangePercent(priceRange[0], PRICE_MIN, PRICE_MAX), [priceRange])
  const priceMaxPct = useMemo(() => calculateRangePercent(priceRange[1], PRICE_MIN, PRICE_MAX), [priceRange])
  const abvMinPct = useMemo(() => calculateRangePercent(abvRange[0], ABV_MIN, ABV_MAX), [abvRange])
  const abvMaxPct = useMemo(() => calculateRangePercent(abvRange[1], ABV_MIN, ABV_MAX), [abvRange])

  const visibleCategories = drinkCategories

  const categoriesWithVisibleSubcategories = useMemo(
    () => visibleCategories.map((category) => ({ category, subcategories: category.subcategories })),
    [visibleCategories],
  )

  const { recentSearches, recommendedProducts, recommendedSearches, hasExactProductMatch, saveRecentSearch, removeRecentSearch } =
    useCategorySearchExperience({
      searchValue,
      searchableItems,
      recentSearchKey: "category_recent_searches",
    })

  const effectiveActiveCategoryId = useMemo(() => {
    if (visibleCategories.length === 0) return activeCategoryId
    if (visibleCategories.some((category) => category.id === activeCategoryId)) return activeCategoryId
    return visibleCategories[0].id
  }, [activeCategoryId, visibleCategories])

  const isSubcategoryReady = (category: DrinkCategory, subcategory: string) =>
    (category.id === "sake" &&
      (subcategory === READY_SUBCATEGORY ||
        subcategory === "준마이 긴죠/긴죠" ||
        subcategory === "준마이" ||
        subcategory === "혼죠조/후츠슈")) ||
    (category.id === "soju" && (subcategory === "데일리(희석식)" || subcategory === "프리미엄(증류식)" || subcategory === "플레이버")) ||
    (category.id === "wine" && (subcategory === "레드" || subcategory === "화이트" || subcategory === "로제" || subcategory === "스파클링" || subcategory === "내추럴" || subcategory === "포트" || subcategory === "디저트")) ||
    (category.id === "beer" && (subcategory === "라거/필스너" || subcategory === "에일/IPA" || subcategory === "흑맥주(스타우트)" || subcategory === "과일맥주")) ||
    (category.id === "whisky" &&
      (subcategory === "싱글몰트 위스키" ||
        subcategory === "블렌디드 몰트" ||
        subcategory === "블렌디드 위스키" ||
        subcategory === "아메리칸(버번/라이/테네시)" ||
        subcategory === "그레인 위스키" ||
        subcategory === "기타 국가 위스키")) ||
    (category.id === "spirits" &&
      (subcategory === "백주/고량주" ||
        subcategory === "진/보드카" ||
        subcategory === "테킬라/럼" ||
        subcategory === "브랜디(꼬냑/아르마냑)")) ||
    (category.id === "traditional" &&
      (subcategory === "막걸리/탁주" ||
        subcategory === "약주/청주" ||
        subcategory === "과실주(한국 와인)")) ||
    (category.id === "etc" &&
      (subcategory === "리큐르" ||
        subcategory === "하이볼/칵테일" ||
        subcategory === "논알콜/저도수 (Sober)"))

  const handleSubcategoryClick = (category: DrinkCategory, subcategory: string) => {
    const isReady = isSubcategoryReady(category, subcategory)
    if (!isReady) {
      setIsPreparingModalOpen(true)
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

    const updateFadeVisibility = () => {
      const maxScrollTop = Math.max(0, root.scrollHeight - root.clientHeight)
      setShowTopFade(root.scrollTop > 2)
      setShowBottomFade(root.scrollTop < maxScrollTop - 2)
    }

    const pickActiveCategoryId = () => {
      if (isProgrammaticScrollRef.current) return

      const scrollTop = root.scrollTop
      const paddingTop = Number.parseFloat(window.getComputedStyle(root).paddingTop || "0") || 0
      const probeLine = scrollTop + paddingTop + 12

      if (categoriesWithVisibleSubcategories.length > 0) {
        const isNearBottom = scrollTop + root.clientHeight >= root.scrollHeight - 2
        if (isNearBottom) {
          const lastId = categoriesWithVisibleSubcategories[categoriesWithVisibleSubcategories.length - 1].category.id
          if (lastId !== effectiveActiveCategoryId) setActiveCategoryId(lastId)
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

      if (nextActiveId && nextActiveId !== effectiveActiveCategoryId) setActiveCategoryId(nextActiveId)
    }

    const onScroll = () => {
      if (scrollRafRef.current) return
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null
        updateFadeVisibility()
        pickActiveCategoryId()
      })
    }

    root.addEventListener("scroll", onScroll, { passive: true })
    updateFadeVisibility()
    pickActiveCategoryId()
    return () => root.removeEventListener("scroll", onScroll)
  }, [categoriesWithVisibleSubcategories, effectiveActiveCategoryId])

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
    const el = leftRoot.querySelector(`[data-category-id="${effectiveActiveCategoryId}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: "nearest" })
  }, [effectiveActiveCategoryId])

  useEffect(() => {
    if (!isSearchOverlayOpen) return
    overlaySearchInputRef.current?.focus()
  }, [isSearchOverlayOpen])

  useEffect(() => {
    if (!returnedState?.resetCategorySearch) {
      handledResetCategorySearchRef.current = false
      return
    }
    if (handledResetCategorySearchRef.current) return

    handledResetCategorySearchRef.current = true
    setSearchValue("")
    setSearchStarted(false)
    setSearchSubmitted(false)
    setIsSearchOverlayOpen(false)
    resetOverlayFilters()
  }, [returnedState?.resetCategorySearch, resetOverlayFilters])

  const handleApplyFilters = () => {
    setSearchSubmitted(true)
    saveRecentSearch(searchValue)

    const effectiveDrinkTypeLabel = selectedDrinkTypeLabel ?? (searchValue.trim() ? defaultSakeLabel : null)
    if (!effectiveDrinkTypeLabel) {
      closeSearchOverlay()
      return
    }

    const targetCategory = drinkCategories.find((category) => category.label === effectiveDrinkTypeLabel)
    if (!targetCategory) {
      closeSearchOverlay()
      return
    }

    const hasAdvancedFilters =
      searchValue.trim().length > 0 ||
      selectedFeatureChips.size > 0 ||
      priceRange[0] !== PRICE_MIN ||
      priceRange[1] !== PRICE_MAX ||
      abvRange[0] !== ABV_MIN ||
      abvRange[1] !== ABV_MAX

    if (!hasAdvancedFilters) {
      scrollToCategory(targetCategory.id)
      closeSearchOverlay()
      return
    }

    const payload: CategoryFilterPayload = {
      keywordQuery: searchValue.trim(),
      drinkTypeLabel: effectiveDrinkTypeLabel,
      categoryChip: selectedCategoryChip,
      featureChips: Array.from(selectedFeatureChips),
      priceRange,
      abvRange,
    }

    const params = new URLSearchParams()
    params.set("group", effectiveDrinkTypeLabel)
    params.set("sub", selectedCategoryChip ?? READY_SUBCATEGORY)
    if (searchValue.trim()) params.set("q", searchValue.trim())
    navigate(`/category/list?${params.toString()}`, {
      state: {
        returnCategoryId: targetCategory.id,
        returnScrollTop: scrollPanelRef.current?.scrollTop ?? 0,
        categoryFilterPayload: payload,
      },
    })
    closeSearchOverlay()
  }

  const handleConfirmInSearchInput = () => {
    setSearchSubmitted(true)
    setSearchStarted(false)
  }

  return (
    <section className="category_page page_screen" aria-label="카테고리 페이지">
      <CategorySearch
        ref={searchInputRef}
        value={searchValue}
        onChange={setSearchValue}
        onActivate={openSearchOverlay}
        readOnly
        guideId="category-search-filter"
      />

      <div className="category_layout category_layout_v2">
        <aside className="category_group_list category_group_list_v2" aria-label="주종 목록">
          <div className="category_group_list_inner" ref={leftListRef}>
            {categoriesWithVisibleSubcategories.map(({ category }) => (
              <button
                className={category.id === effectiveActiveCategoryId ? "category_group_button is_selected" : "category_group_button"}
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

        <section
          className={[
            "category_subcategory_panel",
            "category_subcategory_panel_v2",
            showTopFade ? "has_top_fade" : "",
            showBottomFade ? "has_bottom_fade" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="카테고리 상세 목록"
        >
          <div className="category_subcategory_scroll" ref={scrollPanelRef}>
            {categoriesWithVisibleSubcategories.length === 0 ? <p className="category_empty">검색 결과가 없어요.</p> : null}
            {categoriesWithVisibleSubcategories.map(({ category, subcategories }) => (
              <div className="category_section" key={category.id} data-category-id={category.id}>
                <div
                  className="category_section_header"
                  data-category-id={category.id}
                  ref={(node) => {
                    sectionHeaderRefs.current[category.id] = node
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToCategory(category.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      scrollToCategory(category.id)
                    }
                  }}
                >
                  <span className="category_section_title">
                    <strong>{category.label}</strong>
                    <small>{category.englishLabel}</small>
                  </span>
                </div>

                <div className="category_subcategory_list">
                  {subcategories.map((subcategory) => {
                    const infoText = subcategoryInfoByCategoryId[category.id]?.[subcategory]
                    const isReady = isSubcategoryReady(category, subcategory)
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

      {isSearchOverlayOpen ? (
        <CategorySearchFilterPanel
          searchValue={searchValue}
          searchStarted={searchStarted}
          searchSubmitted={searchSubmitted}
          hasExactProductMatch={hasExactProductMatch}
          overlaySearchInputRef={overlaySearchInputRef}
          visibleOverlayGroups={visibleOverlayGroups}
          selectedDrinkTypeLabel={selectedDrinkTypeLabel}
          selectedCategoryChip={selectedCategoryChip}
          selectedFeatureChips={selectedFeatureChips}
          isOverlayChipEnabled={isOverlayChipEnabled}
          toggleFilterChip={toggleFilterChip}
          onClose={closeSearchOverlay}
          onChangeSearchValue={(value) => {
            setSearchSubmitted(false)
            setSearchValue(value)
          }}
          onEnterSearch={handleConfirmInSearchInput}
          onClearSearch={() => {
            setSearchSubmitted(false)
            setSearchValue("")
          }}
          onStartSearch={() => {
            setSearchSubmitted(false)
            setSearchStarted(true)
          }}
          onCancelSearchMode={() => {
            setSearchSubmitted(false)
            setSearchStarted(false)
          }}
          pricePreset={pricePreset}
          priceRange={priceRange}
          priceMinPct={priceMinPct}
          priceMaxPct={priceMaxPct}
          abvRange={abvRange}
          abvMinPct={abvMinPct}
          abvMaxPct={abvMaxPct}
          onChangePriceMin={(nextMin) => {
            setPricePreset(null)
            setPriceRange((prev) => [Math.min(nextMin, prev[1]), prev[1]])
          }}
          onChangePriceMax={(nextMax) => {
            setPricePreset(null)
            setPriceRange((prev) => [prev[0], Math.max(nextMax, prev[0])])
          }}
          onSelectPricePreset500k={() => {
            setPricePreset((prev) => {
              const next = resolvePricePresetToggle(prev, "500k", PRICE_MIN, PRICE_MAX)
              setPriceRange(next.range)
              return next.preset
            })
          }}
          onSelectPricePreset1000k={() => {
            setPricePreset((prev) => {
              const next = resolvePricePresetToggle(prev, "1000k", PRICE_MIN, PRICE_MAX)
              setPriceRange(next.range)
              return next.preset
            })
          }}
          onChangeAbvMin={(nextMin) => setAbvRange((prev) => [Math.min(nextMin, prev[1]), prev[1]])}
          onChangeAbvMax={(nextMax) => setAbvRange((prev) => [prev[0], Math.max(nextMax, prev[0])])}
          onReset={resetOverlayFilters}
          onApply={handleApplyFilters}
          shellAriaLabel="카테고리 검색 필터"
          inputAriaLabel="카테고리 검색어 입력"
          placeholder="카테고리 또는 종류 검색"
          showPriceSection={showPriceSection}
          showAbvSection={showAbvSection}
          priceMin={PRICE_MIN}
          priceMax={PRICE_MAX}
          abvMin={ABV_MIN}
          abvMax={ABV_MAX}
          recommendedProducts={recommendedProducts}
          recommendedSearches={recommendedSearches}
          recentSearches={recentSearches}
          onSelectSuggestion={(value) => {
            setSearchSubmitted(false)
            setSearchValue(value)
            saveRecentSearch(value)
          }}
          onRemoveRecentSearch={removeRecentSearch}
        />
      ) : null}

      {isPreparingModalOpen ? (
        <AlertModal
          title={"아직 준비 중인 서비스 입니다\n곧 만나뵐 수 있어용"}
          confirmLabel="닫기"
          variant="preparing"
          onConfirm={() => setIsPreparingModalOpen(false)}
        />
      ) : null}
    </section>
  )
}
