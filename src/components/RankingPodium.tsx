import { Link } from "react-router"
import iconBeerStein from "../assets/svg/beerstein_p.svg"
import {
  getRankingBestCharacterSrc,
  getRankingDrinkSrcForItem,
  getRankingPostPhotoSrc,
  getRankingRankBadgeSrc,
  getRankingThumbSrc,
  getRankingThumbSrcById,
} from "../utils/rankingThumbAssets"

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

type Props<CategoryKey extends string> = {
  podiumRankOrder: readonly PodiumRank[]
  items: readonly RankingPodiumItem<CategoryKey>[]
  getVotes: (podium: RankingPodiumItem<CategoryKey>) => number
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

export default function RankingPodium<CategoryKey extends string>({ podiumRankOrder, items, getVotes }: Props<CategoryKey>) {
  return (
    <article className="ranking_podium">
      {podiumRankOrder.map((rank) => {
        const podium = items.find((item) => item.rank === rank)
        if (!podium) return null

        const [drink, food] = podium.pair.split(" + ")
        const likeCount = getVotes(podium)
        const drinkSrc =
          getRankingDrinkSrcForItem(podium.id, podium.rank) ??
          getRankingThumbSrcById("drink", podium.id) ??
          getRankingThumbSrc("drink", drink)
        const photoSrc = getRankingPostPhotoSrc(podium.id)
        const sideImageSrc = photoSrc ?? getRankingThumbSrcById("food", podium.id) ?? getRankingThumbSrc("food", food)
        const delta = podium.delta ?? "—"

        const className = [
          podium.rank === 1 ? "podium_card podium_first" : podium.rank === 2 ? "podium_card podium_second" : "podium_card podium_third",
          podium.disabled ? "is_disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")

        const content = (
          <>
            <img className="podium_rank_badge" src={getRankingRankBadgeSrc(podium.rank)} alt="" aria-hidden="true" />
            {podium.rank === 1 ? (
              <img className="podium_best_character" src={getRankingBestCharacterSrc()} alt="" aria-hidden="true" />
            ) : null}
            <div className="podium_copy">
              <strong className="podium_drink">{drink}</strong>
              <p className="podium_food">{food}</p>
              <span className="podium_votes">
                <img src={iconBeerStein} alt="" aria-hidden="true" />
                {likeCount.toLocaleString()}짠
              </span>
              <span className={`podium_delta ${getDeltaClassName(delta)}`}>{formatDelta(delta)}</span>
            </div>
            <div className="podium_thumbs" aria-hidden="true">
              {sideImageSrc ? <img className="podium_thumb is_food" src={sideImageSrc} alt="" /> : <span className="podium_thumb is_food" />}
              {drinkSrc ? (
                <img
                  className={podium.thumbVariant === "bottle" ? "podium_thumb is_bottle" : "podium_thumb is_drink"}
                  src={drinkSrc}
                  alt=""
                />
              ) : (
                <span className={podium.thumbVariant === "bottle" ? "podium_thumb is_bottle" : "podium_thumb is_drink"} />
              )}
            </div>
          </>
        )

        if (podium.disabled) {
          return (
            <div key={podium.id} className={className} aria-disabled="true">
              {content}
            </div>
          )
        }

        return (
          <Link
            key={podium.id}
            className={className}
            to={`/community/pairing/${podium.id}`}
            state={{
              pairingTitle: podium.pair,
              drinkType: drink,
              foods: [food],
              source: "ranking",
            }}
          >
            {content}
          </Link>
        )
      })}
    </article>
  )
}
