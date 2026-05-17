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
  delta?: string
  disabled?: boolean
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
  disabled?: boolean
}

type Props<PeriodKey extends string, CategoryKey extends string> = {
  periodItems: readonly RankingPeriodItem<PeriodKey>[]
  activePeriod: PeriodKey
  onChangePeriod: (period: PeriodKey) => void
  disabledPeriodKeys?: readonly PeriodKey[]

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
  disabledPeriodKeys,
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
    <section className="ranking_content" aria-label="랭킹 목록">
      <RankingPeriodTabs items={periodItems} activeKey={activePeriod} onChange={onChangePeriod} disabledKeys={disabledPeriodKeys} />
      <RankingCategoryTabs items={categoryItems} activeKey={activeCategory} onChange={onChangeCategory} />
      <RankingPodium podiumRankOrder={podiumRankOrder} items={podiumItems} getVotes={getPodiumVotes} />
      <RankingRowList
        isNoResults={isNoResults}
        suggestionTags={suggestionTags}
        onSelectSuggestionTag={onSelectSuggestionTag}
        rows={rows}
      />
    </section>
  )
}
