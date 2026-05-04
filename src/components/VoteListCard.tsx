export type VoteItem = {
  id: number
  question: string
  date: string
  options: [{ title: string; percent: number }, { title: string; percent: number }]
  totalVotes: number
  myPickIndex: 0 | 1 | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

export default function VoteListCard({ item }: { item: VoteItem }) {
  const winner = item.options[0].percent >= item.options[1].percent ? 0 : 1
  const active = isToday(item.date)

  return (
    <article className="vote_list_card">
      <div className="vote_list_card_header">
        <h3 className="vote_list_question">{item.question}</h3>
        <div className="vote_list_date_wrap">
          {active && <span className="vote_list_active">진행 중</span>}
          <span className="vote_list_date">{formatDate(item.date)}</span>
        </div>
      </div>
      <div className="vote_list_options">
        {item.options.map((option, index) => (
          <div key={index} className={`vote_list_option${winner === index ? " vote_list_option--winner" : ""}`}>
            <div className="vote_list_bar" style={{ width: `${option.percent}%` }} />
            <span className="vote_list_label_wrap">
              <span className="vote_list_label">{option.title}</span>
              {item.myPickIndex === index && <span className="vote_my_pick">✓</span>}
            </span>
            <span className="vote_list_percent">{option.percent}%</span>
          </div>
        ))}
      </div>
      <p className="vote_list_total">총 {item.totalVotes.toLocaleString()}명 참여</p>
    </article>
  )
}
