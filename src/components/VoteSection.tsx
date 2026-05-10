import { useState } from "react"
import { useNavigate } from "react-router"
import { getStoredPicks, storePick } from "../utils/votePicks"
import PurchaseConfirmModal from "./PurchaseConfirmModal"

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
      {isSelected ? <span className="vote_my_pick">내 선택</span> : null}
      <h4>{title}</h4>
      <p>{voted ? `${percent}%` : "--"}</p>
      <button type="button" onClick={onVote} style={{ visibility: voted ? "hidden" : "visible" }}>
        투표하고 현황보기
      </button>
    </article>
  )
}

export default function VoteSection({ voteId, question, options }: VoteSectionProps) {
  const navigate = useNavigate()
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(() => getStoredPicks()[String(voteId)] ?? null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const voted = selectedIndex !== null

  function handleVote(index: 0 | 1) {
    setSelectedIndex(index)
    storePick(voteId, index)
  }

  return (
    <>
      <section className="home_block">
        <div className="ranking_header">
          <h3>{question}</h3>
          <button type="button" className="more_button" onClick={() => setIsConfirmOpen(true)}>
            더보기
          </button>
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

      {isConfirmOpen ? (
        <PurchaseConfirmModal
          ariaLabel="투표 이동 확인"
          message="투표에 들어가면 바로 참여가 진행되어 취소할 수 없어요. 이동할까요?"
          cancelLabel="취소"
          confirmLabel="이동"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false)
            navigate("/vote")
          }}
        />
      ) : null}
    </>
  )
}
