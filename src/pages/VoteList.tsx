import { useLayoutEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import "../styles/vote-list.css"
import VoteListCard from "../components/VoteListCard"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import { getStoredPicks } from "../utils/votePicks"
import { voteItems, VOTE_INITIAL_COUNT } from "../data/voteData"

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 220,
      damping: 24,
      mass: 0.95,
    },
  },
}

const moreItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 210,
      damping: 24,
      mass: 1,
    },
  },
}

export default function VoteList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialFilter = searchParams.get("filter") === "my" ? "my" : "all"
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState<"all" | "my">(initialFilter)
  const pillRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<"all" | "my", HTMLButtonElement | null>>({ all: null, my: null })
  const [glider, setGlider] = useState({ x: 6, width: 0 })

  const picks = getStoredPicks()
  const items = voteItems.map((item) => ({
    ...item,
    myPickIndex: picks[String(item.id)] ?? item.myPickIndex,
  }))

  const filteredItems = filter === "my" ? items.filter((item) => item.myPickIndex !== null) : items
  const baseItems = filteredItems.slice(0, VOTE_INITIAL_COUNT)
  const extraItems = showAll ? filteredItems.slice(VOTE_INITIAL_COUNT) : []

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
      <motion.div
        key={filter}
        className="vote_list_content"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {baseItems.map((item) => (
          <motion.div key={item.id} variants={cardVariants}>
            <VoteListCard item={item} />
          </motion.div>
        ))}
        <AnimatePresence initial={false}>
          {extraItems.map((item) => (
            <motion.div key={item.id} variants={moreItemVariants} initial="hidden" animate="show" exit="hidden">
              <VoteListCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!showAll && filteredItems.length > VOTE_INITIAL_COUNT ? (
        <button type="button" className="vote_list_more" onClick={() => setShowAll(true)}>
          더보기
        </button>
      ) : null}
    </section>
  )
}
