import { useState } from "react"
import { Link } from "react-router"
import { getStoredPicks, storePick } from "../utils/votePicks"

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
      <button type="button" onClick={onVote}>
        {voted ? "다시 투표하기" : "투표하고 현황보기"}
      </button>
    </article>
  )
}

export default function VoteSection({ voteId, question, options }: VoteSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(() => {
    const val = getStoredPicks()[String(voteId)]
    return val !== undefined ? val : null
  })

  const voted = selectedIndex !== null

  function handleVote(index: 0 | 1) {
    const next = voted ? null : index
    setSelectedIndex(next)
    storePick(voteId, next)
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
