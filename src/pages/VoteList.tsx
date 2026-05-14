import { useState } from "react"
import { useNavigate } from "react-router"
import "../styles/vote-list.css"
import VoteListCard from "../components/VoteListCard"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import { getStoredPicks } from "../utils/votePicks"
import { voteItems, VOTE_INITIAL_COUNT } from "../data/voteData"

export default function VoteList() {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)

  const picks = getStoredPicks()
  const items = voteItems.map((item) => ({
    ...item,
    myPickIndex: picks[String(item.id)] ?? item.myPickIndex,
  }))

  const visibleItems = showAll ? items : items.slice(0, VOTE_INITIAL_COUNT)

  return (
    <section className="vote_list_page page_screen">
      <header className="vote_list_header">
        <button type="button" className="back_button" onClick={() => navigate(-1)}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
        <h2>투표 목록</h2>
      </header>
      <div className="vote_list_content">
        {visibleItems.map((item) => (
          <VoteListCard key={item.id} item={item} />
        ))}
      </div>
      <button type="button" className="vote_list_more" onClick={() => setShowAll(true)}>
        더보기
      </button>
    </section>
  )
}
