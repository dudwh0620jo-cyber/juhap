import RecommendationCard, { type RecommendationItem } from "./RecommendationCard"

type TodayRecommendationProps = {
  title: string
  subtitle: string
  items: RecommendationItem[]
}

function RecommendationHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h3>{title}</h3>
      <p className="block_sub_title">{subtitle}</p>
    </>
  )
}

function RecommendationList({ items }: { items: RecommendationItem[] }) {
  return (
    <div className="recommendation_row">
      {items.map((item) => (
        <RecommendationCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default function TodayRecommendation({ title, subtitle, items }: TodayRecommendationProps) {
  return (
    <section className="home_block">
      <RecommendationHeader title={title} subtitle={subtitle} />
      <RecommendationList items={items} />
    </section>
  )
}
