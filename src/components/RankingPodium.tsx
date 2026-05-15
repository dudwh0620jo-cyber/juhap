import { Link } from "react-router"
import { getRankingRankBadgeSrc, getRankingThumbSrc, getRankingThumbSrcById } from "../utils/rankingThumbAssets"

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

type Props<CategoryKey extends string> = {
  podiumRankOrder: readonly PodiumRank[]
  items: readonly RankingPodiumItem<CategoryKey>[]
  getVotes: (podium: RankingPodiumItem<CategoryKey>) => number
}

export default function RankingPodium<CategoryKey extends string>({ podiumRankOrder, items, getVotes }: Props<CategoryKey>) {
  return (
    <article className="ranking_podium">
      {podiumRankOrder.map((rank) => {
        const podium = items.find((item) => item.rank === rank)
        if (!podium) return null

        const [drink, food] = podium.pair.split(" + ")
        const likeCount = getVotes(podium)
        const drinkSrc = getRankingThumbSrcById("drink", podium.id) ?? getRankingThumbSrc("drink", drink)
        const foodSrc = getRankingThumbSrcById("food", podium.id) ?? getRankingThumbSrc("food", food)

        return (
          <Link
            key={podium.id}
            className={
              podium.rank === 1 ? "podium_card podium_first" : podium.rank === 2 ? "podium_card podium_second" : "podium_card podium_third"
            }
            to={`/community/pairing/${podium.id}`}
            state={{
              pairingTitle: podium.pair,
              source: "ranking",
            }}
          >
            <img className="podium_rank_badge" src={getRankingRankBadgeSrc(podium.rank)} alt="" aria-hidden="true" />
            <div className="podium_thumbs" aria-hidden="true">
              {drinkSrc ? (
                <img
                  className={podium.thumbVariant === "bottle" ? "podium_thumb is_bottle" : "podium_thumb is_drink"}
                  src={drinkSrc}
                  alt=""
                />
              ) : (
                <span className={podium.thumbVariant === "bottle" ? "podium_thumb is_bottle" : "podium_thumb is_drink"} />
              )}
              {foodSrc ? <img className="podium_thumb is_food" src={foodSrc} alt="" /> : <span className="podium_thumb is_food" />}
            </div>
            <strong>{drink}</strong>
            <p>{food}</p>
            <span className="podium_votes">{likeCount.toLocaleString()}짠</span>
          </Link>
        )
      })}
    </article>
  )
}
