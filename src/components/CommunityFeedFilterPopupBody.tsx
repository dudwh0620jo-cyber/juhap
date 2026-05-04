import FeedFilterChip from "./FeedFilterChip"
import FeedFilterGroup from "./FeedFilterGroup"
import RecentSearchChips from "./RecentSearchChips"

export type PopupChipGroup = {
  title: string
  chips: string[]
}

type Props = {
  groups: readonly PopupChipGroup[]
  collapsibleGroupTitles: ReadonlySet<string>
  expandedGroupTitles: ReadonlySet<string>
  setGroupRef: (title: string) => (element: HTMLDivElement | null) => void
  onToggleGroupExpanded: (title: string) => void

  selectedDrinkType: string | null
  selectedCategories: ReadonlySet<string>
  selectedFeatures: ReadonlySet<string>
  selectedFoods: ReadonlySet<string>
  onChipClick: (groupTitle: string, chip: string) => void

  recentSearchTerms: readonly string[]
  onSelectRecentSearch: (term: string) => void
  onDeleteRecentSearch: (term: string) => void
}

const getChipActiveState = (
  groupTitle: string,
  chip: string,
  selected: {
    drinkType: string | null
    categories: ReadonlySet<string>
    features: ReadonlySet<string>
    foods: ReadonlySet<string>
  },
) => {
  if (groupTitle === "주종") {
    return selected.drinkType === chip
  }
  if (groupTitle === "카테고리") {
    return selected.categories.has(chip)
  }
  if (groupTitle === "특징") {
    return selected.features.has(chip)
  }
  if (groupTitle === "음식") {
    return selected.foods.has(chip)
  }
  return false
}

export default function CommunityFeedFilterPopupBody({
  groups,
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
}: Props) {
  return (
    <div className="feed_filter_popup_body">
      {groups.map((group) => {
        const showToggle = collapsibleGroupTitles.has(group.title) || expandedGroupTitles.has(group.title)
        const isExpanded = expandedGroupTitles.has(group.title)

        return (
          <FeedFilterGroup
            key={group.title}
            title={group.title}
            chips={group.chips}
            showToggle={showToggle}
            isExpanded={isExpanded}
            onToggleExpanded={() => onToggleGroupExpanded(group.title)}
            setGroupRef={setGroupRef(group.title)}
            renderChip={(chip) => (
              <FeedFilterChip
                key={chip}
                label={chip}
                isActive={getChipActiveState(group.title, chip, {
                  drinkType: selectedDrinkType,
                  categories: selectedCategories,
                  features: selectedFeatures,
                  foods: selectedFoods,
                })}
                onClick={() => onChipClick(group.title, chip)}
              />
            )}
          />
        )
      })}

      <RecentSearchChips terms={recentSearchTerms} onSelect={onSelectRecentSearch} onDelete={onDeleteRecentSearch} />
    </div>
  )
}
