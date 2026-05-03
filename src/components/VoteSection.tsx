type VoteOption = {
  id: number
  title: string
}

type VoteSectionProps = {
  question: string
  options: [VoteOption, VoteOption]
}

function VoteCard({ title }: { title: string }) {
  return (
    <article className="vote_card">
      <h4>{title}</h4>
      <p>--%</p>
      <button type="button">투표하고 현황보기</button>
    </article>
  )
}

export default function VoteSection({ question, options }: VoteSectionProps) {
  return (
    <section className="home_block">
      <h3>{question}</h3>
      <VoteCard title={options[0].title} />
      <div className="versus_label">vs</div>
      <VoteCard title={options[1].title} />
    </section>
  )
}
