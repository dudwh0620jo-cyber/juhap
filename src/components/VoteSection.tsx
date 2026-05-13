import { useState } from "react"
import { useNavigate } from "react-router"
import { getStoredPicks, storePick } from "../utils/votePicks"
import PurchaseConfirmModal from "./PurchaseConfirmModal"
import { homeAssets, resolveVoteOptionIconSrc } from "../data/homeContent"

type VoteOption = {
  id: number
  title: string
  percent: number
}

type VoteSectionProps = {
  voteId: number
  question: string
  options: [VoteOption, VoteOption]
  totalVotes?: number
}

type VoteCardProps = {
  title: string
  percent: number
  voted: boolean
  isSelected: boolean
  onVote: () => void
}

function VoteCard({ title, percent, voted, isSelected, onVote }: VoteCardProps) {
  const iconSrc = resolveVoteOptionIconSrc(title)
  return (
    <button type="button" className={`home_vote_option${isSelected ? " is_selected" : ""}`} onClick={onVote}>
      <span className="home_vote_option_icon" aria-hidden="true">
        {iconSrc ? <img src={iconSrc} alt="" /> : null}
      </span>
      <span className="home_vote_option_title">{title}</span>
      <span className="home_vote_option_meta">{voted ? `${percent}%` : "투표"}</span>
      <span className="home_vote_option_radio" aria-hidden="true" />
    </button>
  )
}

function formatVoteRemaining() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 0)
  const diff = Math.max(0, end.getTime() - now.getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
  const ss = String(totalSeconds % 60).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

export default function VoteSection({ voteId, question, options, totalVotes }: VoteSectionProps) {
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
      <section className="home_block home_vote" aria-label="오늘의 투표">
        <div className="home_block_header home_vote_header">
          <div>
            <h3>오늘의 투표</h3>
            <div className="home_vote_question">{question}</div>
            <div className="home_vote_deadline">
              <span className="home_vote_deadline_label">투표 마감까지</span>
              <span className="home_vote_deadline_time">{formatVoteRemaining()}</span>
            </div>
          </div>
          <button type="button" className="home_vote_more" onClick={() => setIsConfirmOpen(true)}>
            더보기 &gt;
          </button>
        </div>

        <div className="home_vote_panel">
          <div className="home_vote_options" role="group" aria-label="투표 항목">
            <VoteCard
              title={options[0].title}
              percent={options[0].percent}
              voted={voted}
              isSelected={selectedIndex === 0}
              onVote={() => handleVote(0)}
            />
            <div className="home_vote_vs" aria-hidden="true">
              VS
            </div>
            <VoteCard
              title={options[1].title}
              percent={options[1].percent}
              voted={voted}
              isSelected={selectedIndex === 1}
              onVote={() => handleVote(1)}
            />
          </div>

          <div className="home_vote_mascot" aria-hidden="true">
            <img src={homeAssets.todayVoteMascot} alt="" />
          </div>
        </div>

        <div className="home_vote_footer">
          <div className="home_vote_total">
            {typeof totalVotes === "number" ? `오늘 현재 ${totalVotes.toLocaleString()}명이 투표에 참여했어요!` : null}
          </div>
          <button type="button" className="home_vote_cta" onClick={() => navigate("/vote")}>
            투표하고 결과보기
          </button>
        </div>
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
