import type { CSSProperties, RefObject } from "react"
import SearchFilterChipsPanel from "./SearchFilterChipsPanel"

type PopupChipGroup = {
  title: string
  chips: string[]
}

type Props = {
  shellAriaLabel?: string
  inputAriaLabel?: string
  clearAriaLabel?: string
  placeholder?: string

  searchValue: string
  inputRef: RefObject<HTMLInputElement | null>
  onChangeSearchValue: (next: string) => void
  onConfirmSearch: (term?: string) => void
  onClearSearch: () => void
  onClose: () => void

  isNoResults: boolean

  chipGroups: PopupChipGroup[]
  collapsibleGroupTitles: Set<string>
  expandedGroupTitles: Set<string>
  setGroupRef: (title: string) => (element: HTMLDivElement | null) => void
  onToggleGroupExpanded: (title: string) => void
  selectedDrinkType: string | null
  selectedCategories: Set<string>
  selectedFeatures: Set<string>
  selectedFoods: Set<string>
  onChipClick: (groupTitle: string, chip: string) => void

  recentSearchTerms: string[]
  onSelectRecentSearch: (term: string) => void
  onDeleteRecentSearch: (term: string) => void

  priceRange: [number, number]
  priceMin: number
  priceMax: number
  priceMinPct: number
  priceMaxPct: number
  onChangePriceMin: (nextMin: number) => void
  onChangePriceMax: (nextMax: number) => void
  onSetPriceRange: (next: [number, number]) => void

  abvRange: [number, number]
  abvMin: number
  abvMax: number
  abvMinPct: number
  abvMaxPct: number
  onChangeAbvMin: (nextMin: number) => void
  onChangeAbvMax: (nextMax: number) => void

  onReset: () => void
  onApply: () => void
}

export default function CommunityFilterPanel({
  shellAriaLabel = "커뮤니티 검색",
  inputAriaLabel = "커뮤니티 검색어 입력",
  clearAriaLabel = "검색어 지우기",
  placeholder = "조합, 주류, 안주 검색",
  searchValue,
  inputRef,
  onChangeSearchValue,
  onConfirmSearch,
  onClearSearch,
  onClose,
  isNoResults,
  chipGroups,
  collapsibleGroupTitles,
  expandedGroupTitles,
  setGroupRef,
  onToggleGroupExpanded,
  selectedDrinkType,
  selectedCategories,
  selectedFeatures,
  selectedFoods,
  onChipClick,
  recentSearchTerms,
  onSelectRecentSearch,
  onDeleteRecentSearch,
  priceRange,
  priceMin,
  priceMax,
  priceMinPct,
  priceMaxPct,
  onChangePriceMin,
  onChangePriceMax,
  onSetPriceRange,
  abvRange,
  abvMin,
  abvMax,
  abvMinPct,
  abvMaxPct,
  onChangeAbvMin,
  onChangeAbvMax,
  onReset,
  onApply,
}: Props) {
  return (
    <>
      <SearchFilterChipsPanel
        shellAriaLabel={shellAriaLabel}
        inputAriaLabel={inputAriaLabel}
        clearAriaLabel={clearAriaLabel}
        placeholder={placeholder}
        searchValue={searchValue}
        inputRef={inputRef}
        onChangeSearchValue={onChangeSearchValue}
        onConfirmSearch={onConfirmSearch}
        onClearSearch={onClearSearch}
        onClose={onClose}
        isNoResults={isNoResults}
        chipGroups={chipGroups}
        collapsibleGroupTitles={collapsibleGroupTitles}
        expandedGroupTitles={expandedGroupTitles}
        setGroupRef={setGroupRef}
        onToggleGroupExpanded={onToggleGroupExpanded}
        selectedDrinkType={selectedDrinkType}
        selectedCategories={selectedCategories}
        selectedFeatures={selectedFeatures}
        selectedFoods={selectedFoods}
        onChipClick={onChipClick}
        recentSearchTerms={recentSearchTerms}
        onSelectRecentSearch={onSelectRecentSearch}
        onDeleteRecentSearch={onDeleteRecentSearch}
      />

      <div className="feed_filter_range_group" aria-label="가격 필터">
        <h3 className="feed_filter_group_title">가격</h3>
        <p className="feed_filter_range_label">
          {priceRange[0].toLocaleString()}원 ~{" "}
          {priceRange[1] >= priceMax ? `${priceMax.toLocaleString()}원 이상` : `${priceRange[1].toLocaleString()}원`}
        </p>
        <div
          className="dual_range"
          style={
            {
              ["--min-pct" as string]: `${priceMinPct}%`,
              ["--max-pct" as string]: `${priceMaxPct}%`,
            } as CSSProperties
          }
        >
          <input
            className="dual_range_input"
            type="range"
            min={priceMin}
            max={priceMax}
            step={1000}
            value={priceRange[0]}
            onChange={(e) => onChangePriceMin(Number(e.target.value))}
            aria-label="최소 가격"
          />
          <input
            className="dual_range_input"
            type="range"
            min={priceMin}
            max={priceMax}
            step={1000}
            value={priceRange[1]}
            onChange={(e) => onChangePriceMax(Number(e.target.value))}
            aria-label="최대 가격"
          />
        </div>

        <div className="feed_filter_quick_row">
          <button type="button" onClick={() => onSetPriceRange([500000, priceMax])}>
            50만원 이상
          </button>
          <button type="button" onClick={() => onSetPriceRange([1000000, priceMax])}>
            100만원 이상
          </button>
        </div>
      </div>

      <div className="feed_filter_range_group" aria-label="도수 필터">
        <h3 className="feed_filter_group_title">도수</h3>
        <p className="feed_filter_range_label">
          {abvRange[0]}% ~ {abvRange[1] >= abvMax ? `${abvMax}% 이상` : `${abvRange[1]}%`}
        </p>
        <div
          className="dual_range"
          style={
            {
              ["--min-pct" as string]: `${abvMinPct}%`,
              ["--max-pct" as string]: `${abvMaxPct}%`,
            } as CSSProperties
          }
        >
          <input
            className="dual_range_input"
            type="range"
            min={abvMin}
            max={abvMax}
            step={1}
            value={abvRange[0]}
            onChange={(e) => onChangeAbvMin(Number(e.target.value))}
            aria-label="최소 도수"
          />
          <input
            className="dual_range_input"
            type="range"
            min={abvMin}
            max={abvMax}
            step={1}
            value={abvRange[1]}
            onChange={(e) => onChangeAbvMax(Number(e.target.value))}
            aria-label="최대 도수"
          />
        </div>
      </div>

      <div className="feed_filter_footer" aria-label="필터 적용">
        <button type="button" className="feed_filter_reset" onClick={onReset}>
          선택 초기화
        </button>
        <button type="button" className="feed_filter_apply" onClick={onApply}>
          선택 완료
          <br />
          검색하기
        </button>
      </div>
    </>
  )
}
