export type RecommendationItem = {
  id: number
  badge: string
  score: string
  title: string
  description: string
}

export default function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <article className="recommendation_card">
      <div className="recommendation_thumb">
        <span className="thumb_badge">{item.badge}</span>
        <span className="thumb_score">{item.score}</span>
      </div>
      <div className="recommendation_body">
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </div>
    </article>
  )
}
