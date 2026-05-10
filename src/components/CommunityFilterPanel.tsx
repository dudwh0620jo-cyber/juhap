import type { RefObject } from "react"
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

  priceRange?: [number, number]
  priceMin?: number
  priceMax?: number
  priceMinPct?: number
  priceMaxPct?: number
  onChangePriceMin?: (nextMin: number) => void
  onChangePriceMax?: (nextMax: number) => void
  onSetPriceRange?: (next: [number, number]) => void

  abvRange?: [number, number]
  abvMin?: number
  abvMax?: number
  abvMinPct?: number
  abvMaxPct?: number
  onChangeAbvMin?: (nextMin: number) => void
  onChangeAbvMax?: (nextMax: number) => void

  onReset: () => void
  onApply: () => void
}

export default function CommunityFilterPanel({
  shellAriaLabel = "커뮤니티 검색",
  inputAriaLabel = "커뮤니티 검색어 입력",
  clearAriaLabel = "검색어 지우기",
  placeholder = "페어링, 음식, 주류 검색",
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
