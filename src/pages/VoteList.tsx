import { useLayoutEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { motion } from "motion/react"
import "../styles/vote-list.css"
import VoteListCard from "../components/VoteListCard"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import { getStoredPicks } from "../utils/votePicks"
import { voteItems, VOTE_INITIAL_COUNT } from "../data/voteData"

export default function VoteList() {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState<"all" | "my">("all")
  const pillRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<"all" | "my", HTMLButtonElement | null>>({ all: null, my: null })
  const [glider, setGlider] = useState({ x: 6, width: 0 })

  const picks = getStoredPicks()
  const items = voteItems.map((item) => ({
    ...item,
    myPickIndex: picks[String(item.id)] ?? item.myPickIndex,
  }))

  const filteredItems = filter === "my" ? items.filter((item) => item.myPickIndex !== null) : items
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, VOTE_INITIAL_COUNT)

  useLayoutEffect(() => {
    function updateGlider() {
      const activeTab = tabRefs.current[filter]
      if (!activeTab) return

      setGlider({
        x: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !pillRef.current
        ? null
        : new ResizeObserver(() => updateGlider())

    if (pillRef.current) observer?.observe(pillRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
  }, [filter])

  return (
    <section className="vote_list_page page_screen">
      <header className="vote_list_header">
        <button type="button" className="back_button" onClick={() => navigate(-1)}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
        <h2>투표 목록</h2>
      </header>
      <div ref={pillRef} className="vote_list_filter" role="tablist" aria-label="투표 목록 필터">
        <motion.span
          className="vote_list_filter_glider"
          animate={glider}
          initial={false}
          transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
          aria-hidden="true"
        />
        <button
          type="button"
          className={`vote_list_filter_tab${filter === "all" ? " is_active" : ""}`}
          onClick={() => {
            setFilter("all")
            setShowAll(false)
          }}
          role="tab"
          aria-selected={filter === "all"}
          ref={(node) => {
            tabRefs.current.all = node
          }}
        >
          전체
        </button>
        <div className="vote_list_filter_divider" aria-hidden="true" />
        <button
          type="button"
          className={`vote_list_filter_tab${filter === "my" ? " is_active" : ""}`}
          onClick={() => {
            setFilter("my")
            setShowAll(false)
          }}
          role="tab"
          aria-selected={filter === "my"}
          ref={(node) => {
            tabRefs.current.my = node
          }}
        >
          내 참여 내역
        </button>
      </div>
      <div className="vote_list_content">
        {visibleItems.map((item) => (
          <VoteListCard key={item.id} item={item} />
        ))}
      </div>
      {!showAll && filteredItems.length > VOTE_INITIAL_COUNT ? (
        <button type="button" className="vote_list_more" onClick={() => setShowAll(true)}>
          더보기
        </button>
      ) : null}
    </section>
  )
}
