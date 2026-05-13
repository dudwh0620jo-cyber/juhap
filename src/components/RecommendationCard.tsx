export type RecommendationItem = {
  id: number
  badge: string
  scoreLabel: string
  title: string
  description: string
  imageSrc?: string
}

export default function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <article className="recommendation_card">
      <div className="recommendation_thumb">
        {item.imageSrc ? <img className="recommendation_thumb_img" src={item.imageSrc} alt="" /> : null}
        <span className="thumb_badge">{item.badge}</span>
        <span className="thumb_score">{item.scoreLabel}</span>
      </div>
      <div className="recommendation_body">
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </div>
    </article>
  )
}
