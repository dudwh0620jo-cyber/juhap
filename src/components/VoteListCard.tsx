import { useEffect, useState } from "react"
import type { VoteItem } from "../data/voteData"
import timeSvg from "../assets/svg/time.svg"

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

function formatVoteRemaining() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(24, 0, 0, 0)
  const diff = Math.max(0, end.getTime() - now.getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
  const ss = String(totalSeconds % 60).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

export default function VoteListCard({ item }: { item: VoteItem }) {
  const winner = item.options[0].percent >= item.options[1].percent ? 0 : 1
  const active = isToday(item.date)
  const [timeRemaining, setTimeRemaining] = useState(() => (active ? formatVoteRemaining() : ""))

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setTimeRemaining(formatVoteRemaining()), 1000)
    return () => window.clearInterval(id)
  }, [active])

  return (
    <article className="vote_list_card">
      <div className="vote_list_question_block">
        <h3 className="vote_list_question">{item.question}</h3>
        <div className="vote_list_date_wrap">
          {active ? <span className="vote_list_active">진행 중</span> : null}
          {!active ? <span className="vote_list_closed">투표 마감</span> : null}
          <span className="vote_list_date">{formatDate(item.date)}</span>
        </div>
        {active ? (
          <div className="vote_list_deadline">
            <img className="vote_list_deadline_clock" src={timeSvg} alt="" aria-hidden="true" />
            <span className="vote_list_deadline_label">투표 마감까지</span>
            <span className="vote_list_deadline_time">{timeRemaining}</span>
          </div>
        ) : null}
      </div>
      <div className="vote_list_options">
        {item.options.length === 2 ? (
          <div className="vote_list_vs" aria-hidden="true">
            VS
          </div>
        ) : null}
        {item.options.map((option, index) => (
          <div
            key={index}
            className={`vote_list_option${winner === index ? " vote_list_option--winner" : ""}${
              item.myPickIndex === index ? " vote_list_option--selected" : ""
            }`}
          >
            <div className="vote_list_bar" style={{ width: `${option.percent}%` }} />
            <span className="vote_list_label_wrap">
              <span className="vote_list_label">{option.title}</span>
              {item.myPickIndex === index ? <span className="vote_my_pick">내 선택</span> : null}
            </span>
            <div className="vote_list_option_right" aria-hidden="true">
              <span className="vote_list_percent">{option.percent}%</span>
              <span className="vote_list_option_radio" />
            </div>
          </div>
        ))}
      </div>
      <p className="vote_list_total">총 {item.totalVotes.toLocaleString()}명 참여</p>
    </article>
  )
}
