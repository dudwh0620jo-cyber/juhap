import { useState } from "react"
import { Link } from "react-router"

type VoteOption = {
  id: number
  title: string
  percent: number
}

type VoteSectionProps = {
  voteId: number
  question: string
  options: [VoteOption, VoteOption]
}

type VoteCardProps = {
  title: string
  percent: number
  voted: boolean
  isSelected: boolean
  onVote: () => void
}

function VoteCard({ title, percent, voted, isSelected, onVote }: VoteCardProps) {
  return (
    <article className="vote_card">
      {isSelected && <span className="vote_my_pick">✓</span>}
      <h4>{title}</h4>
      <p>{voted ? `${percent}%` : "--"}</p>
      <button type="button" onClick={onVote} style={{ visibility: voted ? "hidden" : "visible" }}>투표하고 현황보기</button>
    </article>
  )
}

const SESSION_KEY = "vote_picks"

function readSession(voteId: number): 0 | 1 | null {
  try {
    const picks = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}")
    const val = picks[String(voteId)]
    return val === 0 || val === 1 ? val : null
  } catch {
    return null
  }
}

function writeSession(voteId: number, index: 0 | 1) {
  try {
    const picks = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}")
    picks[String(voteId)] = index
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(picks))
  } catch {
    // Ignore session storage write failures.
  }
}

export default function VoteSection({ voteId, question, options }: VoteSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(() => readSession(voteId))

  const voted = selectedIndex !== null

  function handleVote(index: 0 | 1) {
    setSelectedIndex(index)
    writeSession(voteId, index)
  }

  return (
    <section className="home_block">
      <div className="ranking_header">
        <h3>{question}</h3>
        <Link to="/vote" className="more_button">더보기</Link>
      </div>
      <VoteCard
        title={options[0].title}
        percent={options[0].percent}
        voted={voted}
        isSelected={selectedIndex === 0}
        onVote={() => handleVote(0)}
      />
      <div className="versus_label">vs</div>
      <VoteCard
        title={options[1].title}
        percent={options[1].percent}
        voted={voted}
        isSelected={selectedIndex === 1}
        onVote={() => handleVote(1)}
      />
    </section>
  )
}
