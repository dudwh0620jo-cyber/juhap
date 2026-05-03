import { Link } from "react-router"

type RankingCategoryItem = {
  key: string
  label: string
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

type Props = {
  isNoResults: boolean
  suggestionTags: readonly string[]
  onSelectSuggestionTag: (tag: string) => void
  rows: readonly RankingRow[]
  categories: readonly RankingCategoryItem[]
}

export default function RankingRowList({
  isNoResults,
  suggestionTags,
  onSelectSuggestionTag,
  rows,
  categories,
}: Props) {
  return (
    <div className="ranking_list">
      {isNoResults ? (
        <div className="search_no_results" role="status">
          <p className="search_no_results_title">검색 결과가 없어요</p>
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
          <div className="row_images">
            <span />
            <span />
          </div>
          <div className="row_text">
            <h3>{row.pair}</h3>
            <p className="row_meta">
              <span className="row_score">★ {row.score}</span>
              <span className="row_votes">
                {row.votes.toLocaleString()}표
                <span
                  className={
                    row.delta.startsWith("-")
                      ? "row_delta is_down"
                      : row.delta === "–"
                        ? "row_delta is_flat"
                        : "row_delta is_up"
                  }
                >
                  {row.delta === "–"
                    ? "–"
                    : row.delta.startsWith("-")
                      ? `▼${row.delta.slice(1)}`
                      : `▲${row.delta.replace("+", "")}`}
                </span>
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
