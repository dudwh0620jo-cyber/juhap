type RankingSectionProps = {
  title: string
  items: string[]
}

function RankingItem({ rank, name }: { rank: number; name: string }) {
  return (
    <li>
      <span>{rank}</span>
      <strong>{name}</strong>
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
          <RankingItem key={item} rank={index + 1} name={item} />
        ))}
      </ol>
    </section>
  )
}
