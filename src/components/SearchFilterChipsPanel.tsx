import type { ReactNode, RefObject } from "react"
import CommunityFeedFilterPopupBody from "./CommunityFeedFilterPopupBody"
import SearchFilterModalHeader from "./SearchFilterModalHeader"

type PopupChipGroup = {
  title: string
  chips: string[]
}

const EMPTY_SELECTED_SITUATIONS = new Set<string>()

type Props = {
  shellAriaLabel: string
  inputAriaLabel: string
  clearAriaLabel: string
  placeholder: string

  searchValue: string
  inputRef: RefObject<HTMLInputElement | null>
  onChangeSearchValue: (next: string) => void
  onConfirmSearch: (term?: string) => void
  onClearSearch: () => void
  onClose: () => void

  isNoResults: boolean
  bodyContent?: ReactNode

  chipGroups: PopupChipGroup[]
  collapsibleGroupTitles: Set<string>
  expandedGroupTitles: Set<string>
  setGroupRef: (title: string) => (element: HTMLDivElement | null) => void
  onToggleGroupExpanded: (title: string) => void
  selectedDrinkType: string | null
  selectedCategories: Set<string>
  selectedFeatures: Set<string>
  selectedFoods: Set<string>
  selectedSituations?: Set<string>
  onChipClick: (groupTitle: string, chip: string) => void

  recentSearchTerms: string[]
  onSelectRecentSearch: (term: string) => void
  onDeleteRecentSearch: (term: string) => void
}

export default function SearchFilterChipsPanel({
  shellAriaLabel,
  inputAriaLabel,
  clearAriaLabel,
  placeholder,
  searchValue,
  inputRef,
  onChangeSearchValue,
  onConfirmSearch,
  onClearSearch,
  onClose,
  isNoResults,
  bodyContent,
  chipGroups,
  collapsibleGroupTitles,
  expandedGroupTitles,
  setGroupRef,
  onToggleGroupExpanded,
  selectedDrinkType,
  selectedCategories,
  selectedFeatures,
  selectedFoods,
  selectedSituations,
  onChipClick,
  recentSearchTerms,
  onSelectRecentSearch,
  onDeleteRecentSearch,
}: Props) {
  return (
    <>
      <SearchFilterModalHeader
        shellAriaLabel={shellAriaLabel}
        inputAriaLabel={inputAriaLabel}
        clearAriaLabel={clearAriaLabel}
        placeholder={placeholder}
        value={searchValue}
        inputRef={inputRef}
        onChange={onChangeSearchValue}
        onEnter={onConfirmSearch}
        onClear={onClearSearch}
        onClose={onClose}
      />

      {isNoResults ? (
        <p className="feed_filter_no_results" role="status">
          검색 결과가 없어요.
        </p>
      ) : null}

      {bodyContent ?? (
        <CommunityFeedFilterPopupBody
          groups={chipGroups}
          collapsibleGroupTitles={collapsibleGroupTitles}
          expandedGroupTitles={expandedGroupTitles}
          setGroupRef={setGroupRef}
          onToggleGroupExpanded={onToggleGroupExpanded}
          selectedDrinkType={selectedDrinkType}
          selectedCategories={selectedCategories}
          selectedFeatures={selectedFeatures}
          selectedFoods={selectedFoods}
          selectedSituations={selectedSituations ?? EMPTY_SELECTED_SITUATIONS}
          onChipClick={onChipClick}
          recentSearchTerms={recentSearchTerms}
          onSelectRecentSearch={onSelectRecentSearch}
          onDeleteRecentSearch={onDeleteRecentSearch}
        />
      )}
    </>
  )
}
