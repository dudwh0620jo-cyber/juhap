import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { motion } from "motion/react"
import AlertModal from "../components/AlertModal"
import CategorySearch from "../components/CategorySearch"
import CategorySearchFilterPanel from "../components/CategorySearchFilterPanel"
import {
  DEFAULT_DRINK_TYPE_LABEL,
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
import { ALL_SUBCATEGORY } from "../hooks/useCategoryListPageData"
import { resolvePricePresetToggle } from "../utils/pricePreset"
import { calculateRangePercent } from "../utils/range"
import arrowRightPoint from "../assets/svg/arrowright_p.svg"
import "../styles/category.css"

const inferSearchableFeatures = (tokens: string[]) => {
  const joined = tokens.join(" ").toLowerCase()
  const features: string[] = []

  if (joined.includes("과일")) features.push("과일향")
  if (joined.includes("부드")) features.push("부드러운")
  if (joined.includes("가벼")) features.push("가벼운")
  if (joined.includes("무거") || joined.includes("묵직")) features.push("무거운")
  if (joined.includes("상큼") || joined.includes("산미")) features.push("상큼한")
  if (joined.includes("톡") || joined.includes("탄산")) features.push("톡쏘는")
  if (joined.includes("은은")) features.push("은은한")

  FEATURE_CHIPS.forEach((feature) => {
    if (joined.includes(feature.toLowerCase())) features.push(feature)
  })

  return Array.from(new Set(features)).filter((feature) => FEATURE_CHIPS.includes(feature as (typeof FEATURE_CHIPS)[number]))
}

const normalizeFilterKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/\//g, "")
    .replace(/은은한과일향/g, "과일향")
    .replace(/sober/g, "")
    .trim()

const toCanonicalFeature = (token: string) => {
  const normalized = normalizeFilterKey(token)
  return FEATURE_CHIPS.find((feature) => normalized.includes(normalizeFilterKey(feature))) ?? null
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
  const categoryTabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const sectionHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const handledResetCategorySearchRef = useRef(false)
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false)
  const isProgrammaticScrollRef = useRef(false)
  const programmaticScrollTimeoutRef = useRef<number | null>(null)
  const scrollRafRef = useRef<number | null>(null)
  const activeSyncTimeoutRef = useRef<number | null>(null)
  const [categoryGlider, setCategoryGlider] = useState({ y: 0, height: 0 })

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
  const [isGroupMotionReady, setIsGroupMotionReady] = useState(false)
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
          tags: ["와인", ...(product.abv ? [`${product.abv}%`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...beerProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "맥주",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["맥주", ...(product.abv ? [`${product.abv}%`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...whiskeyProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "위스키",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["위스키", ...(product.abv ? [`${product.abv}%`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...spiritsProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "증류주",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["증류주", ...(product.abv ? [`${product.abv}%`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...traditionalProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "전통주",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["전통주", ...(product.abv ? [`${product.abv}%`] : []), ...product.tags],
          keywords: product.keywords,
        })),
        ...etcProductsMock.map((product) => ({
          id: product.id,
          name: product.name,
          drinkTypeLabel: "기타",
          subcategory: product.subcategory,
          features: inferSearchableFeatures([...product.tags, ...product.keywords]),
          price: product.priceWon,
          tags: ["기타", ...(product.abv !== undefined ? [`${product.abv}%`] : []), ...product.tags],
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
  })

  const dynamicFeatureChips = useMemo(() => {
    const drinkType = (selectedDrinkTypeLabel ?? defaultSakeLabel).trim()
    if (!drinkType) return [] as string[]

    let pool = searchableItems.filter((item) => (item.drinkTypeLabel ?? "").trim() === drinkType)
    if (selectedCategoryChip) {
      pool = pool.filter((item) => normalizeFilterKey(item.subcategory ?? "") === normalizeFilterKey(selectedCategoryChip))
    }

    const available = new Set<string>()
    pool.forEach((item) => {
      ;[...(item.features ?? []), ...(item.tags ?? [])].forEach((token) => {
        const canonical = toCanonicalFeature(token)
        if (canonical) available.add(canonical)
      })
    })

    return FEATURE_CHIPS.filter((chip) => available.has(chip))
  }, [defaultSakeLabel, searchableItems, selectedDrinkTypeLabel, selectedCategoryChip])

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
      if (activeSyncTimeoutRef.current) window.clearTimeout(activeSyncTimeoutRef.current)
    }
  }, [])

  const visibleOverlayGroups = useMemo(
    () =>
      overlayFilterGroups.map((group) =>
        group.title === "특징" ? { ...group, chips: dynamicFeatureChips } : group,
      ),
    [overlayFilterGroups, dynamicFeatureChips],
  )

  const isFeatureChipEnabledByData = (chip: string) => {
    const drinkType = (selectedDrinkTypeLabel ?? defaultSakeLabel).trim()
    let pool = searchableItems.filter((item) => (item.drinkTypeLabel ?? "").trim() === drinkType)
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
    const drinkType = (selectedDrinkTypeLabel ?? defaultSakeLabel).trim()
    const pool = searchableItems.filter(
      (item) =>
        (item.drinkTypeLabel ?? "").trim() === drinkType &&
        normalizeFilterKey(item.subcategory ?? "") === normalizeFilterKey(chip),
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

  const isSubcategoryReady = (_category: DrinkCategory, _subcategory: string) => true

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

  const handleCategoryHeaderClick = (category: DrinkCategory) => {
    const params = new URLSearchParams()
    params.set("group", category.label)
    params.set("sub", "전체")
    navigate(`/category/list?${params.toString()}`, {
      state: { returnCategoryId: category.id, returnScrollTop: scrollPanelRef.current?.scrollTop ?? 0 },
    })
  }

  useEffect(() => {
    const root = scrollPanelRef.current
    const returnedScrollTop = returnedState?.scrollTop
    if (returnedState?.resetCategorySearch && returnedGroupLabel) return
    if (!root || returnedScrollTop === undefined) return

    isProgrammaticScrollRef.current = true
    root.scrollTo({ top: returnedScrollTop })
    if (programmaticScrollTimeoutRef.current) window.clearTimeout(programmaticScrollTimeoutRef.current)
    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 120)
  }, [returnedState?.scrollTop, returnedState?.resetCategorySearch, returnedGroupLabel])

  useEffect(() => {
    if (!returnedState?.resetCategorySearch || !returnedGroupLabel) return

    const targetCategory = drinkCategories.find((category) => category.label === returnedGroupLabel)
    if (!targetCategory) return

    const root = scrollPanelRef.current
    const target = sectionHeaderRefs.current[targetCategory.id]
    if (!root || !target) return

    const paddingTop = Number.parseFloat(window.getComputedStyle(root).paddingTop || "0") || 0
    isProgrammaticScrollRef.current = true
    setActiveCategoryId(targetCategory.id)
    root.scrollTo({ top: Math.max(0, target.offsetTop - paddingTop), behavior: "auto" })

    if (programmaticScrollTimeoutRef.current) window.clearTimeout(programmaticScrollTimeoutRef.current)
    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 120)
  }, [returnedState?.resetCategorySearch, returnedGroupLabel])

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
      if (!isProgrammaticScrollRef.current && !isGroupMotionReady) {
        setIsGroupMotionReady(true)
      }
      if (scrollRafRef.current) return
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null
        updateFadeVisibility()
        if (activeSyncTimeoutRef.current) window.clearTimeout(activeSyncTimeoutRef.current)
        activeSyncTimeoutRef.current = window.setTimeout(() => {
          pickActiveCategoryId()
          activeSyncTimeoutRef.current = null
        }, 120)
      })
    }

    root.addEventListener("scroll", onScroll, { passive: true })
    updateFadeVisibility()
    pickActiveCategoryId()
    return () => root.removeEventListener("scroll", onScroll)
  }, [categoriesWithVisibleSubcategories, effectiveActiveCategoryId, isGroupMotionReady])

  const scrollToCategory = (categoryId: string) => {
    if (!isGroupMotionReady) setIsGroupMotionReady(true)
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

  useLayoutEffect(() => {
    function updateGlider() {
      const activeTab = categoryTabRefs.current[effectiveActiveCategoryId]
      const listRoot = leftListRef.current
      if (!activeTab) return
      setCategoryGlider({ y: activeTab.offsetTop, height: activeTab.offsetHeight })
      if (!listRoot) return
      const listTop = listRoot.scrollTop
      const listBottom = listTop + listRoot.clientHeight
      const tabTop = activeTab.offsetTop
      const tabBottom = tabTop + activeTab.offsetHeight
      if (tabTop < listTop || tabBottom > listBottom) {
        activeTab.scrollIntoView({ block: "nearest", behavior: "auto" })
      }
    }

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !leftListRef.current ? null : new ResizeObserver(() => updateGlider())
    if (leftListRef.current) observer?.observe(leftListRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
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
    params.set("sub", selectedCategoryChip ?? ALL_SUBCATEGORY)
    if (searchValue.trim()) params.set("q", searchValue.trim())
    navigate(`/category/list?${params.toString()}`, {
      state: {
        returnCategoryId: targetCategory.id,
        returnScrollTop: scrollPanelRef.current?.scrollTop ?? 0,
        categoryFilterPayload: payload,
      },
    })
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
        <aside
          className={isGroupMotionReady ? "category_group_list category_group_list_v2 is_motion_ready" : "category_group_list category_group_list_v2"}
          aria-label="주종 목록"
        >
          <div className="category_group_list_inner" ref={leftListRef}>
            <motion.span
              className="category_group_glider"
              animate={categoryGlider}
              initial={false}
              transition={isGroupMotionReady ? { type: "spring", stiffness: 220, damping: 28, mass: 0.95 } : { duration: 0 }}
              aria-hidden="true"
            />
            {categoriesWithVisibleSubcategories.map(({ category }) => (
              <button
                className={category.id === effectiveActiveCategoryId ? "category_group_button is_selected" : "category_group_button"}
                key={category.id}
                type="button"
                data-category-id={category.id}
                ref={(node) => {
                  categoryTabRefs.current[category.id] = node
                }}
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
                  className={category.id === effectiveActiveCategoryId ? "category_section_header is_active" : "category_section_header"}
                  data-category-id={category.id}
                  ref={(node) => {
                    sectionHeaderRefs.current[category.id] = node
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCategoryHeaderClick(category)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleCategoryHeaderClick(category)
                    }
                  }}
                >
                  <div className="category_section_header_body">
                    <span className="category_section_title">
                      <strong>{category.label}</strong>
                      <small>{category.englishLabel}</small>
                    </span>
                  </div>
                  <span className="category_section_header_arrow" aria-hidden="true">
                    <svg
                      className="category_section_arrow_icon is_default"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.25 3.25L10.75 7.75L6.25 12.25"
                        stroke="currentColor"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <img className="category_section_arrow_icon is_active" src={arrowRightPoint} alt="" aria-hidden="true" />
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
          isOverlayChipEnabled={isOverlayChipEnabledResolved}
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
          title={"아직 준비 중인 서비스입니다.\n곧 만나요."}
          confirmLabel="닫기"
          variant="preparing"
          onConfirm={() => setIsPreparingModalOpen(false)}
        />
      ) : null}
    </section>
  )
}

