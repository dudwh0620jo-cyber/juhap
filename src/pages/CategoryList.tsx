import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import CategoryItemCard from "../components/CategoryItemCard"
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
import { ALL_SUBCATEGORY, getCategoryListItems, useCategoryListPageData, type SortKey } from "../hooks/useCategoryListPageData"
import { useCategorySearchExperience } from "../hooks/useCategorySearchExperience"
import { useCategorySearchFilterState } from "../hooks/useCategorySearchFilterState"
import { resolvePricePresetToggle } from "../utils/pricePreset"
import { calculateRangePercent } from "../utils/range"
import caretLeft from "../assets/svg/caretleft.svg"
import caretRight from "../assets/svg/caretright.svg"
import "../styles/category.css"
import "../styles/category-list.css"

const sortLabels: Record<SortKey, string> = {
  default: "최신순",
  recommended: "가격 낮은순",
  popular: "가격 높은순",
}

const normalizeFilterKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/\//g, "")
    .replace(/데킬라/g, "테킬라")
    .replace(/sober/g, "")
    .trim()

const toCanonicalFeature = (token: string) => {
  const normalized = normalizeFilterKey(token)
  return FEATURE_CHIPS.find((feature) => normalized.includes(normalizeFilterKey(feature))) ?? null
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
  const overlaySearchInputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [listFade, setListFade] = useState({ top: false, bottom: false })

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
  })

  const [filterPayload, setFilterPayload] = useState<CategoryFilterPayload | null>(returnState?.categoryFilterPayload ?? null)

  const visibleOverlayGroups = overlayFilterGroups

  const isFeatureChipEnabledByData = (chip: string) => {
    const drinkType = (selectedDrinkTypeLabel ?? group).trim()
    let pool = getCategoryListItems(drinkType, ALL_SUBCATEGORY)
    if (selectedCategoryChip) {
      pool = pool.filter((item) => normalizeFilterKey(item.subcategory ?? "") === normalizeFilterKey(selectedCategoryChip))
    }
    return pool.some((item) => {
      const featurePool = [...(item.features ?? []), ...(item.tags ?? [])]
      const needle = normalizeFilterKey(chip)
      return featurePool.some((token) => normalizeFilterKey(token).includes(needle))
    })
  }

  const isCategoryChipEnabledByFeatureData = (chip: string) => {
    const drinkType = (selectedDrinkTypeLabel ?? group).trim()
    const pool = getCategoryListItems(drinkType, ALL_SUBCATEGORY).filter(
      (item) => normalizeFilterKey(item.subcategory ?? "") === normalizeFilterKey(chip),
    )
    if (pool.length === 0) return false

    return pool.some((item) => {
      const canonicalSet = new Set<string>()
      ;[...(item.features ?? []), ...(item.tags ?? [])].forEach((token) => {
        const canonical = toCanonicalFeature(token)
        if (canonical) canonicalSet.add(canonical)
      })
      return canonicalSet.size > 0
    })
  }

  const isOverlayChipEnabledResolved = (groupTitle: string, chip: string) => {
    const baseEnabled = isOverlayChipEnabled(groupTitle, chip)
    if (!baseEnabled) return false
    if (groupTitle === "카테고리") return isCategoryChipEnabledByFeatureData(chip)
    if (groupTitle !== "특징") return true
    return isFeatureChipEnabledByData(chip)
  }

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
      const targetDrinkType = (drinkTypeLabel ?? group).trim()
      items = getCategoryListItems(targetDrinkType, ALL_SUBCATEGORY)

      items = items.filter((item) => {
        const drinkTypeMatches = !drinkTypeLabel || item.drinkTypeLabel === drinkTypeLabel
        const categoryMatches =
          !categoryChip ||
          normalizeFilterKey(item.subcategory ?? "") === normalizeFilterKey(categoryChip)
        const featurePool = [...(item.features ?? []), ...(item.tags ?? [])]
        const featureMatches =
          featureChips.length === 0 ||
          featureChips.some((feature) => {
            const needle = normalizeFilterKey(feature)
            return featurePool.some((token) => normalizeFilterKey(token).includes(needle))
          })
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
      return nextItems.sort((a, b) => {
        const aPrice = a.price ?? Number.MAX_SAFE_INTEGER
        const bPrice = b.price ?? Number.MAX_SAFE_INTEGER
        return aPrice - bPrice
      })
    }
    if (activeSortKey === "popular") {
      return nextItems.sort((a, b) => {
        const aPrice = a.price ?? Number.MIN_SAFE_INTEGER
        const bPrice = b.price ?? Number.MIN_SAFE_INTEGER
        return bPrice - aPrice
      })
    }
    return nextItems
  }, [activeSortKey, filteredItems])

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const updateFade = () => {
      const canScroll = el.scrollHeight - el.clientHeight > 2
      if (!canScroll) {
        setListFade({ top: false, bottom: false })
        return
      }
      const top = el.scrollTop > 2
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2
      setListFade({ top, bottom })
    }

    updateFade()
    el.addEventListener("scroll", updateFade, { passive: true })
    window.addEventListener("resize", updateFade)
    return () => {
      el.removeEventListener("scroll", updateFade)
      window.removeEventListener("resize", updateFade)
    }
  }, [sortedItems.length, filterPayload, searchValue])

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
          <img src={caretLeft} alt="" aria-hidden="true" />
        </button>
        <div className="category_list_meta_row">
          <button type="button" className="category_list_title" onClick={handleBack}>
            <span>{group}</span>
            <img src={caretRight} alt="" aria-hidden="true" />
            <span>{sub}</span>
          </button>
        </div>
        <div className="category_list_sort_row">
          <button className="category_sort_button" type="button" onClick={() => setIsSortSheetOpen(true)}>
            {sortLabels[activeSortKey]}
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className={`category_list_cards_shell${listFade.top ? " is_fade_top" : ""}${listFade.bottom ? " is_fade_bottom" : ""}`}
      >
        <div
          ref={listRef}
          className="category_list_cards"
          aria-label="카테고리 상품 목록"
        >
          {sortedItems.length === 0 ? <p className="category_list_empty">검색 결과가 없어요</p> : null}
          {sortedItems.map((item) => {
            const drinkType = item.drinkTypeLabel ?? group
            const isDisabled = drinkType !== defaultSakeLabel
            return <CategoryItemCard key={item.id} item={item} onOpen={handleOpenItem} disabled={isDisabled} />
          })}
        </div>
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
          isOverlayChipEnabled={isOverlayChipEnabledResolved}
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


