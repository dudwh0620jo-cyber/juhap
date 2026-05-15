import { Link } from "react-router"
import { getRankingThumbSrc, getRankingThumbSrcById } from "../utils/rankingThumbAssets"

type RankingCategoryItem = {
  key: string
  label: string
}

type RankingRow = {
  id: number
  rank: number
  pair: string
  category: string
  votes: number
  delta: string
}

type Props = {
  isNoResults: boolean
  suggestionTags: readonly string[]
  onSelectSuggestionTag: (tag: string) => void
  rows: readonly RankingRow[]
  categories: readonly RankingCategoryItem[]
}

const formatDelta = (delta: string) => {
  const trimmed = delta.trim()
  if (!trimmed || trimmed === "—") return "—"
  if (trimmed.startsWith("-")) return `▼${trimmed.slice(1)}`
  if (trimmed.startsWith("+")) return `▲${trimmed.slice(1)}`
  return trimmed
}

const getDeltaClassName = (delta: string) => {
  const trimmed = delta.trim()
  if (!trimmed || trimmed === "—") return "row_delta is_flat"
  if (trimmed.startsWith("-")) return "row_delta is_down"
  return "row_delta is_up"
}

export default function RankingRowList({ isNoResults, suggestionTags, onSelectSuggestionTag, rows, categories }: Props) {
  return (
    <div className="ranking_list">
      {isNoResults ? (
        <div className="search_no_results" role="status">
          <p className="search_no_results_title">검색 결과가 없어요.</p>
          {suggestionTags.length > 0 ? (
            <div className="search_suggestion_row" aria-label="추천 태그">
              {suggestionTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="search_suggestion_chip"
                  onClick={() => onSelectSuggestionTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {rows.map((row) => (
        <Link
          className="ranking_row"
          key={row.id}
          to={`/community/pairing/${row.id}`}
          state={{
            pairingTitle: row.pair,
            source: "ranking",
          }}
        >
          <strong className="row_rank">{row.rank}</strong>
          <div className="row_images" aria-hidden="true">
            {(() => {
              const [drink, food] = row.pair.split(" + ")
              const drinkSrc = getRankingThumbSrcById("drink", row.id) ?? getRankingThumbSrc("drink", drink ?? "")
              const foodSrc = getRankingThumbSrcById("food", row.id) ?? getRankingThumbSrc("food", food ?? "")
              return (
                <>
                  {drinkSrc ? (
                    <img className="row_thumb is_drink" src={drinkSrc} alt="" />
                  ) : (
                    <span className="row_thumb is_drink" />
                  )}
                  {foodSrc ? <img className="row_thumb is_food" src={foodSrc} alt="" /> : <span className="row_thumb is_food" />}
                </>
              )
            })()}
          </div>
          <div className="row_text">
            <h3>{row.pair}</h3>
            <p className="row_meta">
              <span className="row_votes">
                {row.votes.toLocaleString()}짠
                <span className={getDeltaClassName(row.delta)}>{formatDelta(row.delta)}</span>
              </span>
            </p>
          </div>
          <span className="row_category">
            {categories.find((category) => category.key === row.category)?.label ?? "전체"}
          </span>
        </Link>
      ))}
    </div>
  )
}
