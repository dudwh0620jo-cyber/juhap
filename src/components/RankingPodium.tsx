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
        const isSpiritsPodium = podium.id >= 96001 && podium.id <= 96003
        const isEtcTopDrink = podium.id === 98001 || podium.id === 98002
        const isEtcThirdDrink = podium.id === 98003
        const likeCount = getVotes(podium)
        const drinkSrc =
          getRankingDrinkSrcForItem(podium.id, podium.rank) ??
          getRankingThumbSrcById("drink", podium.id) ??
          getRankingThumbSrc("drink", drink)
        const drinkThumbClassName = [
          podium.thumbVariant === "bottle" ? "podium_thumb is_bottle" : "podium_thumb is_drink",
          podium.id === 91011 ? "is_ilpoom_jinro" : "",
          podium.id === 1025 ? "is_heineken_pasta" : "",
          isSpiritsPodium ? "is_spirits_podium" : "",
          podium.id === 96002 ? "is_don_julio" : "",
          isEtcTopDrink ? "is_etc_top_drink" : "",
          isEtcThirdDrink ? "is_etc_third_drink" : "",
        ]
          .filter(Boolean)
          .join(" ")
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
              {sideImageSrc ? (
                <img className={`podium_thumb is_food${isSpiritsPodium ? " is_spirits_podium" : ""}`} src={sideImageSrc} alt="" />
              ) : (
                <span className={`podium_thumb is_food${isSpiritsPodium ? " is_spirits_podium" : ""}`} />
              )}
              {drinkSrc ? (
                <img
                  className={drinkThumbClassName}
                  src={drinkSrc}
                  alt=""
                />
              ) : (
                <span className={drinkThumbClassName} />
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
