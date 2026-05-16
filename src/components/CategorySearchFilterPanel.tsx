import type { RefObject } from "react"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconSearch from "../assets/svg/magnifyingglass.svg"
import type { FilterGroup } from "../data/categoryFilterConfig"
import type { CategoryListItem } from "./CategoryItemCard"
import CommunitySearchInput from "./CommunitySearchInput"

type CategorySearchFilterPanelProps = {
  searchValue: string
  searchStarted: boolean
  searchSubmitted: boolean
  hasExactProductMatch: boolean
  overlaySearchInputRef: RefObject<HTMLInputElement | null>
  visibleOverlayGroups: FilterGroup[]
  selectedDrinkTypeLabel: string | null
  selectedCategoryChip: string | null
  selectedFeatureChips: Set<string>
  isOverlayChipEnabled: (groupTitle: string, chip: string) => boolean
  toggleFilterChip: (groupTitle: string, chip: string) => void
  onClose: () => void
  onChangeSearchValue: (value: string) => void
  onEnterSearch: () => void
  onClearSearch: () => void
  onStartSearch: () => void
  onCancelSearchMode: () => void
  pricePreset: "500k" | "1000k" | null
  priceRange: [number, number]
  priceMinPct: number
  priceMaxPct: number
  abvRange: [number, number]
  abvMinPct: number
  abvMaxPct: number
  onChangePriceMin: (value: number) => void
  onChangePriceMax: (value: number) => void
  onSelectPricePreset500k: () => void
  onSelectPricePreset1000k: () => void
  onChangeAbvMin: (value: number) => void
  onChangeAbvMax: (value: number) => void
  onReset: () => void
  onApply: () => void
  shellAriaLabel: string
  inputAriaLabel: string
  placeholder: string
  showInputConfirmButton?: boolean
  showPriceSection?: boolean
  showAbvSection?: boolean
  priceMin: number
  priceMax: number
  abvMin: number
  abvMax: number
  recommendedProducts: CategoryListItem[]
  recommendedSearches: string[]
  recentSearches: string[]
  onSelectSuggestion: (value: string) => void
  onRemoveRecentSearch: (value: string) => void
}

export default function CategorySearchFilterPanel({
  searchValue,
  searchStarted,
  searchSubmitted,
  hasExactProductMatch,
  overlaySearchInputRef,
  visibleOverlayGroups,
  selectedDrinkTypeLabel,
  selectedCategoryChip,
  selectedFeatureChips,
  isOverlayChipEnabled,
  toggleFilterChip,
  onClose,
  onChangeSearchValue,
  onEnterSearch,
  onClearSearch,
  onStartSearch,
  onCancelSearchMode,
  pricePreset,
  priceRange,
  priceMinPct,
  priceMaxPct,
  abvRange,
  abvMinPct,
  abvMaxPct,
  onChangePriceMin,
  onChangePriceMax,
  onSelectPricePreset500k,
  onSelectPricePreset1000k,
  onChangeAbvMin,
  onChangeAbvMax,
  onReset,
  onApply,
  shellAriaLabel,
  inputAriaLabel,
  placeholder,
  showInputConfirmButton = true,
  showPriceSection = true,
  showAbvSection = true,
  priceMin,
  priceMax,
  abvMin,
  abvMax,
  recommendedProducts,
  recommendedSearches,
  recentSearches,
  onSelectSuggestion,
  onRemoveRecentSearch,
}: CategorySearchFilterPanelProps) {
  const query = searchValue.trim()
  const hasQuery = query.length > 0

  const showSearchMode = searchStarted
  const suggestedKeywords =
    recommendedSearches.length > 0
      ? recommendedSearches
      : recommendedProducts.map((item) => item.name).filter((name) => name.trim().length > 0)
  const showRecentSection = showSearchMode && recentSearches.length > 0
  const showSuggestionSection = showSearchMode && hasQuery && !hasExactProductMatch && suggestedKeywords.length > 0
  const showProductSection = showSearchMode && hasQuery && recommendedProducts.length > 0
  const showEmptySection = showSearchMode && searchSubmitted && hasQuery && recommendedProducts.length === 0
  const showLivePanel = showRecentSection || showSuggestionSection || showProductSection || showEmptySection

  const handleBack = () => {
    if (searchStarted) {
      onCancelSearchMode()
      return
    }
    onClose()
  }

  const productPathText = (item: CategoryListItem) => {
    const drink = item.drinkTypeLabel ?? "주류"
    const category = item.subcategory ?? "카테고리"
    const feature = item.features?.[0] ?? item.tags?.[0] ?? "특징"
    return `${drink} > ${category} > ${feature}`
  }

  return (
    <div className="category_search_overlay" aria-label="카테고리 검색">
      <section className="category_search_filter_panel" aria-label="카테고리 검색 패널">
        <div className="category_search_filter_top">
          <button type="button" className="category_search_back" aria-label="뒤로가기" onClick={handleBack}>
            <img src={iconCaretLeft} alt="" aria-hidden="true" />
          </button>
          <CommunitySearchInput
            shellAriaLabel={shellAriaLabel}
            inputAriaLabel={inputAriaLabel}
            clearAriaLabel="검색어 지우기"
            placeholder={placeholder}
            value={searchValue}
            inputRef={overlaySearchInputRef}
            onChange={(value) => {
              onChangeSearchValue(value)
              if (value.trim().length > 0) onStartSearch()
            }}
            onEnter={onEnterSearch}
            onClear={onClearSearch}
            onFocusInput={() => {
              if (searchValue.trim().length > 0) onStartSearch()
            }}
            confirmLabel="적용"
            showConfirmButton={showInputConfirmButton}
          />
        </div>

        <div className={showLivePanel ? "category_search_filter_body is_searching" : "category_search_filter_body"}>
          {showLivePanel ? (
            <div className="category_search_live_panel" onClick={onCancelSearchMode} role="presentation">
              {showRecentSection ? (
                <div className="category_search_result_mode" onClick={(event) => event.stopPropagation()} role="presentation">
                  <p className="category_search_mode_title">최근검색어</p>
                  <div className="category_search_recent_inline">
                    {recentSearches.map((keyword) => (
                      <span key={keyword} className="category_search_recent_chip">
                        <img className="category_search_recent_icon" src={iconSearch} alt="" aria-hidden="true" />
                        <button type="button" className="category_search_recent_keyword" onClick={() => onSelectSuggestion(keyword)}>
                          {keyword}
                        </button>
                        <button type="button" className="category_search_recent_remove" onClick={() => onRemoveRecentSearch(keyword)}>
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {showSuggestionSection ? (
                <div className="category_search_result_mode" onClick={(event) => event.stopPropagation()} role="presentation">
                  <p className="category_search_mode_title">추천 검색어</p>
                  <div className="category_search_suggest_list">
                    {suggestedKeywords.map((keyword) => (
                      <button key={keyword} type="button" className="category_search_suggest_item" onClick={() => onSelectSuggestion(keyword)}>
                        <img className="category_search_suggest_icon" src={iconSearch} alt="" aria-hidden="true" />
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {showProductSection ? (
                <div className="category_search_result_suggest" onClick={(event) => event.stopPropagation()} role="presentation">
                  <h3 className="category_filter_group_title">추천 상품</h3>
                  <div className="category_search_result_products">
                    {recommendedProducts.map((item) => (
                      <button key={item.id} type="button" className="category_search_result_item" onClick={() => onSelectSuggestion(item.name)}>
                        <strong>{item.name}</strong>
                        <small>{productPathText(item)}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {showEmptySection ? (
                <>
                  <p className="category_search_empty_hint">찾으시는 상품이 없어요. 비슷한 상품으로 이건 어떠세요?</p>
                  <div className="category_search_result_suggest" onClick={(event) => event.stopPropagation()} role="presentation">
                    <h3 className="category_filter_group_title">추천 상품</h3>
                    <div className="category_search_result_products">
                      {recommendedProducts.map((item) => (
                        <button key={item.id} type="button" className="category_search_result_item" onClick={() => onSelectSuggestion(item.name)}>
                          <strong>{item.name}</strong>
                          <small>{productPathText(item)}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="category_search_filter_content">
            {visibleOverlayGroups.map((groupItem) => {
              const isDrinkTypeGroup = groupItem.title === "주종"
              const isCategoryGroup = groupItem.title === "카테고리"
              const isFeatureGroup = groupItem.title === "특징"
              const shouldShowGroup =
                isDrinkTypeGroup || (isCategoryGroup && Boolean(selectedDrinkTypeLabel)) || (isFeatureGroup && Boolean(selectedCategoryChip))

              if (!shouldShowGroup) return null

              return (
                <div className="category_filter_group category_filter_group_chips" key={groupItem.title}>
                  <h3 className="category_filter_group_title">{groupItem.title}</h3>
                  <div className="category_filter_chip_row">
                    {groupItem.chips.map((chip) => {
                      const isEnabled = isOverlayChipEnabled(groupItem.title, chip)
                      const isActive = isDrinkTypeGroup
                        ? selectedDrinkTypeLabel === chip
                        : isCategoryGroup
                          ? selectedCategoryChip === chip
                          : selectedFeatureChips.has(chip)

                      return (
                        <button
                          key={chip}
                          type="button"
                          className={
                            isEnabled
                              ? isActive
                                ? "category_filter_chip is_active"
                                : "category_filter_chip"
                              : "category_filter_chip is_disabled"
                          }
                          onClick={() => {
                            if (!isEnabled) return
                            toggleFilterChip(groupItem.title, chip)
                          }}
                          disabled={!isEnabled}
                        >
                          {chip}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {showPriceSection ? (
              <div className="category_filter_group">
                <h3 className="category_filter_group_title">가격</h3>
                <div className="category_filter_range_block">
                  <p className="category_filter_range_label">
                    {pricePreset === "500k"
                      ? "50만원 이상"
                      : pricePreset === "1000k"
                        ? "100만원 이상"
                        : `${priceRange[0].toLocaleString()}원 ~ ${priceRange[1].toLocaleString()}원`}
                  </p>
                  <div
                    className={pricePreset ? "category_filter_dual_range is_disabled" : "category_filter_dual_range"}
                    style={{ ["--min-pct" as string]: `${priceMinPct}%`, ["--max-pct" as string]: `${priceMaxPct}%` }}
                  >
                    <input
                      className="category_filter_dual_range_input"
                      type="range"
                      min={priceMin}
                      max={priceMax}
                      step={1000}
                      value={priceRange[0]}
                      onChange={(event) => onChangePriceMin(Number(event.target.value))}
                      disabled={Boolean(pricePreset)}
                      aria-label="최소 가격"
                    />
                    <input
                      className="category_filter_dual_range_input"
                      type="range"
                      min={priceMin}
                      max={priceMax}
                      step={1000}
                      value={priceRange[1]}
                      onChange={(event) => onChangePriceMax(Number(event.target.value))}
                      disabled={Boolean(pricePreset)}
                      aria-label="최대 가격"
                    />
                  </div>
                </div>
                <div className="category_filter_quick_row">
                  <button type="button" className={pricePreset === "500k" ? "is_active" : undefined} onClick={onSelectPricePreset500k}>
                    50만원 이상
                  </button>
                  <button type="button" className={pricePreset === "1000k" ? "is_active" : undefined} onClick={onSelectPricePreset1000k}>
                    100만원 이상
                  </button>
                </div>
              </div>
            ) : null}

            {showAbvSection ? (
              <div className="category_filter_group">
                <h3 className="category_filter_group_title">도수</h3>
                <div className="category_filter_range_block">
                  <p className="category_filter_range_label">
                    {abvRange[0]}% ~ {abvRange[1]}% 이상
                  </p>
                  <div
                    className="category_filter_dual_range"
                    style={{ ["--min-pct" as string]: `${abvMinPct}%`, ["--max-pct" as string]: `${abvMaxPct}%` }}
                  >
                    <input
                      className="category_filter_dual_range_input"
                      type="range"
                      min={abvMin}
                      max={abvMax}
                      step={1}
                      value={abvRange[0]}
                      onChange={(event) => onChangeAbvMin(Number(event.target.value))}
                      aria-label="최소 도수"
                    />
                    <input
                      className="category_filter_dual_range_input"
                      type="range"
                      min={abvMin}
                      max={abvMax}
                      step={1}
                      value={abvRange[1]}
                      onChange={(event) => onChangeAbvMax(Number(event.target.value))}
                      aria-label="최대 도수"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="category_filter_footer">
          <button type="button" className="category_filter_reset" onClick={onReset}>
            선택 초기화
          </button>
          <button type="button" className="category_filter_apply" onClick={onApply}>
            검색하기
          </button>
        </div>
      </section>
    </div>
  )
}
