export type RankingItem = {
  name: string
  change: number
}

type RankingSectionProps = {
  title: string
  items: [RankingItem, RankingItem, RankingItem]
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) return <span className="ranking_change ranking_change--up">▲ {change}%</span>
  if (change < 0) return <span className="ranking_change ranking_change--down">▼ {Math.abs(change)}%</span>
  return <span className="ranking_change ranking_change--flat">— 0%</span>
}

function RankingItem({ rank, name, change }: { rank: number; name: string; change: number }) {
  return (
    <li>
      <span>{rank}</span>
      <strong>{name}</strong>
      <ChangeIndicator change={change} />
    </li>
  )
}

export default function RankingSection({ title, items }: RankingSectionProps) {
  return (
    <section className="home_block">
      <div className="ranking_header">
        <h3>{title}</h3>
        <button className="more_button" type="button">
          더보기
        </button>
      </div>
      <ol className="home_ranking_list">
        {items.map((item, index) => (
          <RankingItem key={item.name} rank={index + 1} name={item.name} change={item.change} />
        ))}
      </ol>
    </section>
  )
}
