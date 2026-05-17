import { Link } from "react-router"
import iconBeerStein from "../assets/svg/beerstein_p.svg"
import {
  getRankingDrinkSrcForItem,
  getRankingPostPhotoSrc,
  getRankingThumbSrc,
  getRankingThumbSrcById,
} from "../utils/rankingThumbAssets"

type RankingRow = {
  id: number
  rank: number
  pair: string
  category: string
  votes: number
  delta: string
  disabled?: boolean
}

type Props = {
  isNoResults: boolean
  suggestionTags: readonly string[]
  onSelectSuggestionTag: (tag: string) => void
  rows: readonly RankingRow[]
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

export default function RankingRowList({ isNoResults, suggestionTags, onSelectSuggestionTag, rows }: Props) {
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

      {rows.map((row) => {
        const className = row.disabled ? "ranking_row is_disabled" : "ranking_row"
        const content = (
          <>
          <strong className="row_rank">{row.rank}</strong>
          <div className="row_images" aria-hidden="true">
            {(() => {
              const [drink, food] = row.pair.split(" + ")
              const drinkSrc =
                getRankingDrinkSrcForItem(row.id, row.rank) ??
                getRankingThumbSrcById("drink", row.id) ??
                getRankingThumbSrc("drink", drink ?? "")
              const photoSrc = getRankingPostPhotoSrc(row.id)
              const sideImageSrc = photoSrc ?? getRankingThumbSrcById("food", row.id) ?? getRankingThumbSrc("food", food ?? "")
              return (
                <>
                  {sideImageSrc ? <img className="row_thumb is_food" src={sideImageSrc} alt="" /> : <span className="row_thumb is_food" />}
                  {drinkSrc ? (
                    <img className="row_thumb is_drink" src={drinkSrc} alt="" />
                  ) : (
                    <span className="row_thumb is_drink" />
                  )}
                </>
              )
            })()}
          </div>
          <div className="row_text">
            <h3>{row.pair}</h3>
            <p className="row_meta">
              <span className="row_votes">
                <img src={iconBeerStein} alt="" aria-hidden="true" />
                {row.votes.toLocaleString()}짠
              </span>
            </p>
          </div>
          <span className={getDeltaClassName(row.delta)}>{formatDelta(row.delta)}</span>
          </>
        )

        if (row.disabled) {
          return (
            <div className={className} key={row.id} aria-disabled="true">
              {content}
            </div>
          )
        }

        return (
          <Link
            className={className}
            key={row.id}
            to={`/community/pairing/${row.id}`}
            state={{
              pairingTitle: row.pair,
              drinkType: row.pair.split(" + ")[0]?.trim(),
              foods: [row.pair.split(" + ")[1]?.trim()].filter(Boolean),
              source: "ranking",
              rankingVotes: row.votes,
            }}
          >
            {content}
          </Link>
        )
      })}
    </div>
  )
}
