import { Link } from "react-router"

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
        if (!podium) {
          return null
        }

        const [drink, food] = podium.pair.split(" + ")
        const deltaLabel = typeof podium.score === "number" && Number.isFinite(podium.score) ? podium.score.toFixed(1) : "0.0"
        const voteCount = getVotes(podium)

        return (
          <Link
            key={podium.id}
            className={
              podium.rank === 1
                ? "podium_card podium_first"
                : podium.rank === 2
                  ? "podium_card podium_second"
                  : "podium_card podium_third"
            }
            to={`/community/pairing/${podium.id}`}
          >
            <span className="podium_rank">{podium.rank}</span>
            <div className="podium_thumbs" aria-hidden="true">
              <span className={podium.thumbVariant === "bottle" ? "podium_thumb is_bottle" : "podium_thumb is_drink"} />
              <span className="podium_thumb is_food" />
            </div>
            <strong>{drink}</strong>
            <p>{food}</p>
            <em>{deltaLabel}</em>
            <span className="podium_votes">{voteCount.toLocaleString()}명</span>
          </Link>
        )
      })}
    </article>
  )
}
