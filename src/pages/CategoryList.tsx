import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import CategoryItemCard from "../components/CategoryItemCard"
import CategorySearch from "../components/CategorySearch"
import CategorySearchFilterPanel from "../components/CategorySearchFilterPanel"
import { DEFAULT_DRINK_TYPE_LABEL, READY_SUBCATEGORY, drinkCategories } from "../data/categoryData"
import {
  ABV_MAX,
  ABV_MIN,
  FEATURE_CHIPS,
  PRICE_MAX,
  PRICE_MIN,
  type CategoryFilterPayload,
} from "../data/categoryFilterConfig"
import { useCategoryListPageData, type SortKey } from "../hooks/useCategoryListPageData"
import { useCategorySearchExperience } from "../hooks/useCategorySearchExperience"
import { useCategorySearchFilterState } from "../hooks/useCategorySearchFilterState"
import { resolvePricePresetToggle } from "../utils/pricePreset"
import { calculateRangePercent } from "../utils/range"
import "../styles/category.css"
import "../styles/category-list.css"

const sortLabels: Record<SortKey, string> = {
  default: "최신순",
  recommended: "추천순",
  popular: "인기순",
}

export default function CategoryList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const defaultSakeLabel = useMemo(() => DEFAULT_DRINK_TYPE_LABEL, [])
  const group = searchParams.get("group") ?? defaultSakeLabel
  const sub = searchParams.get("sub") ?? READY_SUBCATEGORY
  const initialQuery = searchParams.get("q") ?? ""
  const { items: categoryItems, sortOptions } = useCategoryListPageData(group, sub)

  const [searchValue, setSearchValue] = useState(initialQuery)
  const [activeSortKey, setActiveSortKey] = useState<SortKey>("default")
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false)
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)
  const [searchStarted, setSearchStarted] = useState(false)
  const [searchSubmitted, setSearchSubmitted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const overlaySearchInputRef = useRef<HTMLInputElement | null>(null)

  const returnState = location.state as
    | {
        returnCategoryId?: string
        returnScrollTop?: number
        categoryFilterPayload?: CategoryFilterPayload
        resetCategorySearch?: boolean
      }
    | null

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
    initialDrinkTypeLabel: returnState?.categoryFilterPayload?.drinkTypeLabel ?? null,
    initialCategoryChip: returnState?.categoryFilterPayload?.categoryChip ?? null,
    initialFeatureChips: returnState?.categoryFilterPayload?.featureChips ?? [],
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
    abvMin: ABV_MIN,
    abvMax: ABV_MAX,
    drinkCategories,
    featureChips: FEATURE_CHIPS,
    readySubcategory: READY_SUBCATEGORY,
  })

  const [filterPayload, setFilterPayload] = useState<CategoryFilterPayload | null>(returnState?.categoryFilterPayload ?? null)

  const visibleOverlayGroups = overlayFilterGroups

  const showPriceSection = true
  const showAbvSection = true
  const priceMinPct = useMemo(() => calculateRangePercent(priceRange[0], PRICE_MIN, PRICE_MAX), [priceRange])
  const priceMaxPct = useMemo(() => calculateRangePercent(priceRange[1], PRICE_MIN, PRICE_MAX), [priceRange])
  const abvMinPct = useMemo(() => calculateRangePercent(abvRange[0], ABV_MIN, ABV_MAX), [abvRange])
  const abvMaxPct = useMemo(() => calculateRangePercent(abvRange[1], ABV_MIN, ABV_MAX), [abvRange])

  const handleApplyFilters = () => {
    setSearchSubmitted(true)
    saveRecentSearch(searchValue)

    setFilterPayload({
      keywordQuery: searchValue.trim(),
      drinkTypeLabel: selectedDrinkTypeLabel ?? group,
      categoryChip: selectedCategoryChip,
      featureChips: Array.from(selectedFeatureChips),
      priceRange,
      abvRange,
    })
    setIsSearchOverlayOpen(false)
  }

  const handleConfirmInSearchInput = () => {
    setSearchSubmitted(true)
    setSearchStarted(false)
  }

  const filteredItems = useMemo(() => {
    let items = [...categoryItems]

    if (filterPayload) {
      const { drinkTypeLabel, categoryChip, featureChips, priceRange: payloadPriceRange, abvRange: payloadAbvRange } = filterPayload
      items = items.filter((item) => {
        const drinkTypeMatches = !drinkTypeLabel || item.drinkTypeLabel === drinkTypeLabel
        const categoryMatches = !categoryChip || item.subcategory === categoryChip
        const featureMatches = featureChips.length === 0 || featureChips.some((feature) => item.features?.includes(feature))
        const priceValue = item.price ?? 0
        const priceMatches = priceValue >= payloadPriceRange[0] && priceValue <= payloadPriceRange[1]
        const abvValue = item.abv ?? 0
        const abvMatches = abvValue >= payloadAbvRange[0] && abvValue <= payloadAbvRange[1]
        return drinkTypeMatches && categoryMatches && featureMatches && priceMatches && abvMatches
      })
    }

    const query = (searchValue || filterPayload?.keywordQuery || "").trim().toLowerCase()
    if (!query) return items

    return items.filter((item) => item.name.toLowerCase().includes(query))
  }, [filterPayload, categoryItems, searchValue])

  const { recentSearches, recommendedProducts, recommendedSearches, hasExactProductMatch, saveRecentSearch, removeRecentSearch } =
    useCategorySearchExperience({
      searchValue,
      searchableItems: categoryItems,
      recentSearchKey: "category_recent_searches",
    })

  const sortedItems = useMemo(() => {
    const nextItems = [...filteredItems]
    if (activeSortKey === "recommended") {
      return nextItems.sort((a, b) => (b.searchTags?.length ?? 0) - (a.searchTags?.length ?? 0))
    }
    if (activeSortKey === "popular") {
      return nextItems.sort((a, b) => b.tags.length - a.tags.length)
    }
    return nextItems
  }, [activeSortKey, filteredItems])

  const handleBack = () => {
    setSearchValue("")
    setSearchStarted(false)
    setSearchSubmitted(false)
    resetOverlayFilters()
    setFilterPayload(null)
    navigate("/category", {
      state: {
        groupLabel: group,
        categoryId: returnState?.returnCategoryId,
        scrollTop: returnState?.returnScrollTop,
        resetCategorySearch: true,
      },
    })
  }

  const handleOpenItem = (item: { id: string }) => {
    navigate(`/product/${item.id}`)
  }

  return (
    <section className="category_list_page page_screen" aria-label="카테고리 리스트">
      <header className="category_list_header">
        <button type="button" className="category_list_back" aria-label="카테고리로 돌아가기" onClick={handleBack}>
          ←
        </button>
        <CategorySearch
          ref={searchInputRef}
          value={searchValue}
          onChange={setSearchValue}
          showConfirmButton={false}
          onActivate={() => {
            setSearchStarted(false)
            setSearchSubmitted(false)
            setIsSearchOverlayOpen(true)
          }}
          readOnly
        />
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
        {sortedItems.length === 0 ? <p className="category_list_empty">검색 결과가 없어요.</p> : null}
        {sortedItems.map((item) => (
          <CategoryItemCard key={item.id} item={item} onOpen={handleOpenItem} />
        ))}
      </div>

      {isSortSheetOpen ? (
        <div className="category_sort_overlay" role="presentation" onClick={() => setIsSortSheetOpen(false)}>
          <section
            className="category_sort_sheet"
            aria-label="정렬"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="category_sort_handle" aria-hidden="true" />
            <div className="category_sort_options">
              {sortOptions.map((option) => {
                const isActive = activeSortKey === option.key

                return (
                  <button
                    className={isActive ? "category_sort_option is_active" : "category_sort_option"}
                    type="button"
                    key={option.key}
                    onClick={() => {
                      setActiveSortKey(option.key)
                      setIsSortSheetOpen(false)
                    }}
                  >
                    <span className="category_sort_label">
                      {option.label}
                      {option.key === "default" ? <small>정렬 기준</small> : null}
                    </span>
                    {isActive ? <span className="category_sort_check" aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      ) : null}

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
          onClose={() => {
            setSearchStarted(false)
            setSearchSubmitted(false)
            setIsSearchOverlayOpen(false)
          }}
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
          shellAriaLabel="카테고리 리스트 검색"
          inputAriaLabel="카테고리 리스트 검색어 입력"
          placeholder="카테고리 또는 종류 검색"
          showInputConfirmButton={false}
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
    </section>
  )
}
