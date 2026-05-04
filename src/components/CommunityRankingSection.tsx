import RankingCategoryTabs from "./RankingCategoryTabs"
import RankingPeriodTabs from "./RankingPeriodTabs"
import RankingPodium from "./RankingPodium"
import RankingRowList from "./RankingRowList"

type RankingPeriodItem<T extends string> = { key: T; label: string }
type RankingCategoryItem<T extends string> = { key: T; label: string }

type PodiumRank = 1 | 2 | 3

type RankingPodiumItem<CategoryKey extends string> = {
  id: number
  rank: PodiumRank
  pair: string
  category: CategoryKey
  score: number
  votes?: number
  thumbVariant?: "default" | "bottle"
}

type RankingRow = {
  id: number
  rank: number
  pair: string
  category: string
  score: number
  votes: number
  delta: string
}

type Props<PeriodKey extends string, CategoryKey extends string> = {
  periodItems: readonly RankingPeriodItem<PeriodKey>[]
  activePeriod: PeriodKey
  onChangePeriod: (period: PeriodKey) => void

  categoryItems: readonly RankingCategoryItem<CategoryKey>[]
  activeCategory: CategoryKey
  onChangeCategory: (category: CategoryKey) => void

  podiumRankOrder: readonly PodiumRank[]
  podiumItems: readonly RankingPodiumItem<CategoryKey>[]
  getPodiumVotes: (podium: RankingPodiumItem<CategoryKey>) => number

  isNoResults: boolean
  suggestionTags: readonly string[]
  onSelectSuggestionTag: (tag: string) => void
  rows: readonly RankingRow[]
}

export default function CommunityRankingSection<PeriodKey extends string, CategoryKey extends string>({
  periodItems,
  activePeriod,
  onChangePeriod,
  categoryItems,
  activeCategory,
  onChangeCategory,
  podiumRankOrder,
  podiumItems,
  getPodiumVotes,
  isNoResults,
  suggestionTags,
  onSelectSuggestionTag,
  rows,
}: Props<PeriodKey, CategoryKey>) {
  return (
    <section className="ranking_page" aria-label="랭킹 목록">
      <RankingPeriodTabs items={periodItems} activeKey={activePeriod} onChange={onChangePeriod} />
      <RankingCategoryTabs items={categoryItems} activeKey={activeCategory} onChange={onChangeCategory} />
      <RankingPodium podiumRankOrder={podiumRankOrder} items={podiumItems} getVotes={getPodiumVotes} />
      <RankingRowList
        isNoResults={isNoResults}
        suggestionTags={suggestionTags}
        onSelectSuggestionTag={onSelectSuggestionTag}
        rows={rows}
        categories={categoryItems}
      />
    </section>
  )
}
