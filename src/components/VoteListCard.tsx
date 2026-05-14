import { useEffect, useState } from "react"
import type { VoteItem } from "../data/voteData"
import timeSvg from "../assets/svg/time.svg"
import { resolveVoteOptionIconSrc } from "../data/homeContent"

function shouldFlipVoteIcon(title: string) {
  const key = title.replace(/\s+/g, "")
  return key.includes("맥주") && key.includes("치킨")
}

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
  const active = isToday(item.date)
  const [timeRemaining, setTimeRemaining] = useState(() => (active ? formatVoteRemaining() : ""))
  const leftIconSrc = resolveVoteOptionIconSrc(item.options[0].title)
  const rightIconSrc = resolveVoteOptionIconSrc(item.options[1].title)
  const leftFlip = shouldFlipVoteIcon(item.options[0].title)
  const rightFlip = shouldFlipVoteIcon(item.options[1].title)

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setTimeRemaining(formatVoteRemaining()), 1000)
    return () => window.clearInterval(id)
  }, [active])

  return (
    <article className="vote_list_card">
      <div className="vote_list_card_header">
        <h3 className="vote_list_question">{item.question}</h3>
        <div className="vote_list_date_wrap">
          <span className={active ? "vote_list_active" : "vote_list_closed"}>{active ? "진행중" : "종료"}</span>
          <span className="vote_list_date">{formatDate(item.date)}</span>
        </div>
      </div>

      <div className="vote_list_vs_row" aria-hidden="true">
        <div className={`vote_list_vs_side is_left${item.myPickIndex === 0 ? " is_my_pick" : ""}`}>
          <div className="vote_list_vs_icon">
            {leftIconSrc ? (
              <img
                className={leftFlip ? "is_flipped" : undefined}
                src={leftIconSrc}
                alt=""
                aria-hidden="true"
              />
            ) : null}
            {item.myPickIndex === 0 ? <span className="vote_list_my_pick_badge">내 선택</span> : null}
          </div>
        </div>
        <div className="vote_list_vs_text">VS</div>
        <div className={`vote_list_vs_side is_right${item.myPickIndex === 1 ? " is_my_pick" : ""}`}>
          <div className="vote_list_vs_icon">
            {rightIconSrc ? (
              <img
                className={rightFlip ? "is_flipped" : undefined}
                src={rightIconSrc}
                alt=""
                aria-hidden="true"
              />
            ) : null}
            {item.myPickIndex === 1 ? <span className="vote_list_my_pick_badge">내 선택</span> : null}
          </div>
        </div>
      </div>

      <div className="vote_list_result_bar" role="img" aria-label="투표 결과">
        <div className="vote_list_result_left" style={{ width: `${item.options[0].percent}%` }} />
        <div className="vote_list_result_right" style={{ width: `${item.options[1].percent}%` }} />
        <span className="vote_list_result_percent is_left">{item.options[0].percent}%</span>
        <span className="vote_list_result_percent is_right">{item.options[1].percent}%</span>
      </div>

      <div className="vote_list_result_labels">
        <div className="vote_list_result_label is_left">{item.options[0].title}</div>
        <div className="vote_list_result_label is_right">{item.options[1].title}</div>
      </div>

      <div className="vote_list_total">총 {item.totalVotes.toLocaleString()}명 참여</div>

      {active ? (
        <div className="vote_list_deadline">
          <img className="vote_list_deadline_clock" src={timeSvg} alt="" aria-hidden="true" />
          <span className="vote_list_deadline_label">투표 마감까지</span>
          <span className="vote_list_deadline_time">{timeRemaining}</span>
        </div>
      ) : null}
    </article>
  )
}
