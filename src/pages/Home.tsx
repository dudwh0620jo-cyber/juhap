import "../styles/home.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { motion } from "motion/react"
import bellIcon from "../assets/svg/bell.svg"
import logoSvg from "../assets/svg/logo.svg"
import timeSvg from "../assets/svg/time.svg"
import voteSvg from "../assets/svg/vote.svg"
import peopleSvg from "../assets/svg/people.svg"
import iconCaretRight from "../assets/svg/caretright.svg"
import iconWarning from "../assets/svg/worning_r.svg"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import type { RecommendationItem } from "../components/RecommendationCard"
import SituationSection from "../components/SituationSection"
import TodayHeroCopy from "../components/TodayHeroCopy"
import WeeklyDrink from "../components/WeeklyDrink"
import { getStoredPicks, getVoteTotalVotes, storePick } from "../utils/votePicks"
import { homeAssets, homeWeeklyRankingCards, resolveVoteOptionIconSrc } from "../data/homeContent"
import { FEATURED_VOTE_ID, voteItems } from "../data/voteData"
import { useHomePageData } from "../hooks/useHomePageData"

type AiCardProps = {
  title: string
  subtitle: string
  hint: string
  buttonLabel: string
}

function AiCardScanButton({ label, onClick, guideId }: { label: string; onClick: () => void; guideId?: string }) {
  return (
    <button className="home_ai_scan_button" type="button" onClick={onClick} data-guide-id={guideId}>
      <img className="home_ai_scan_thumb" src={homeAssets.mainScanButton} alt="" aria-hidden="true" />
      <img className="home_ai_scan_icon" src={homeAssets.scanIcon} alt="" aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

function AiCard({ title, subtitle, hint, buttonLabel }: AiCardProps) {
  const navigate = useNavigate()
  return (
    <section className="home_ai_card">
      <div className="home_ai_copy">
        <h2>{title}</h2>
        <p className="home_ai_subtitle">{subtitle}</p>
        <p className="home_ai_hint">{hint}</p>
      </div>
      <AiCardScanButton label={buttonLabel} onClick={() => navigate("/ai-scan")} guideId="home-ai-scan" />
    </section>
  )
}

type TodayRecommendationProps = {
  title: string
  subtitle: string
  items: RecommendationItem[]
}

function TodayRecommendation({ title, items }: TodayRecommendationProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const dotCount = items.length
  const dots = useMemo(() => Array.from({ length: dotCount }, (_, index) => index), [dotCount])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const slide = el.querySelector<HTMLElement>(".home_today_slide")
    if (!slide) return
    const slideWidth = slide.getBoundingClientRect().width
    if (!Number.isFinite(slideWidth) || slideWidth <= 0) return
    const nextIndex = Math.round(el.scrollLeft / slideWidth)
    setActiveIndex((prev) => (prev === nextIndex ? prev : Math.max(0, Math.min(dotCount - 1, nextIndex))))
  }

  return (
    <section className="home_block home_today">
      <img className="today_pairing_mascot" src={homeAssets.todayPairingMascot} alt="" aria-hidden="true" />
      {items.length ? (
        <div className="home_today_carousel" ref={scrollRef} onScroll={handleScroll} aria-label="?ㅻ뒛??異붿쿇 諛곕꼫">
          <div className="home_today_track">
            {items.map((hero) => (
              <div key={hero.id} className="home_today_slide home_today_hero">
                <div className="home_today_hero_media" aria-hidden="true">
                  {hero.imageSrc ? <img src={hero.imageSrc} alt="" /> : null}
                </div>
                <TodayHeroCopy label={title} title={hero.title} description={hero.description} to={`/today-pairing/${hero.id}`} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {dots.length > 1 ? (
        <div className="home_today_dots" aria-label="諛곕꼫 ?섏씠吏 ?쒖떆">
          {dots.map((index) => (
            <span key={index} className={`home_today_dot${index === activeIndex ? " is_active" : ""}`} aria-hidden="true" />
          ))}
        </div>
      ) : null}
    </section>
  )
}

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

function VoteCard({
  title,
  percent,
  voted,
  isSelected,
  onVote,
}: {
  title: string
  percent: number
  voted: boolean
  isSelected: boolean
  onVote: () => void
}) {
  const iconSrc = resolveVoteOptionIconSrc(title)
  return (
    <button
      type="button"
      className={`home_vote_option${isSelected ? " is_selected" : ""}`}
      onClick={onVote}
      disabled={voted}
    >
      <span className="home_vote_option_left">
        <span className="home_vote_option_icon" aria-hidden="true">
          {iconSrc ? <img src={iconSrc} alt="" /> : null}
        </span>
        <span className="home_vote_option_title">{title}</span>
      </span>
      <span className="home_vote_option_meta" aria-hidden={!voted}>
        {voted ? `${percent}%` : null}
      </span>
      <span className="home_vote_option_radio" aria-hidden="true" />
    </button>
  )
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

function VoteSection({ voteId, question, options, totalVotes }: VoteSectionProps) {
  const navigate = useNavigate()
  const [votedIndex, setVotedIndex] = useState<0 | 1 | null>(() => getStoredPicks()[String(voteId)] ?? null)
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(() => getStoredPicks()[String(voteId)] ?? null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(() => formatVoteRemaining())
  const [voteAlertMessage, setVoteAlertMessage] = useState<string | null>(null)
  const voted = votedIndex !== null
  const displayedTotalVotes = getVoteTotalVotes(voteId, totalVotes ?? 0)

  useEffect(() => {
    const id = window.setInterval(() => setTimeRemaining(formatVoteRemaining()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!voteAlertMessage) return
    const timerId = window.setTimeout(() => setVoteAlertMessage(null), 1800)
    return () => window.clearTimeout(timerId)
  }, [voteAlertMessage])

  function handleSelect(index: 0 | 1) {
    if (voted) return
    setSelectedIndex(index)
  }

  return (
    <>
      <section className="home_block home_vote" aria-label="오늘의 투표">
        <div className="home_vote_panel">
          <div className="home_vote_header">
            <div className="home_vote_title">
              <img className="home_vote_title_icon" src={voteSvg} alt="" aria-hidden="true" />
              <h3>오늘의 투표</h3>
            </div>
            <button type="button" className="home_vote_more" onClick={() => navigate("/vote")}>
              더보기
              <img src={iconCaretRight} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="home_vote_question_block">
            <div className="home_vote_question">{question}</div>
            <div className="home_vote_deadline">
              <img className="home_vote_deadline_clock" src={timeSvg} alt="" aria-hidden="true" />
              <span className="home_vote_deadline_label">투표 마감까지</span>
              <span className="home_vote_deadline_time">{timeRemaining}</span>
            </div>
          </div>

          <div className="home_vote_mascot" aria-hidden="true">
            <img src={homeAssets.todayVoteMascot} alt="" aria-hidden="true" />
          </div>

          <div className="home_vote_options" role="group" aria-label="투표 선택지">
            <VoteCard
              title={options[0].title}
              percent={options[0].percent}
              voted={voted}
              isSelected={voted ? votedIndex === 0 : selectedIndex === 0}
              onVote={() => handleSelect(0)}
            />
            <VoteCard
              title={options[1].title}
              percent={options[1].percent}
              voted={voted}
              isSelected={voted ? votedIndex === 1 : selectedIndex === 1}
              onVote={() => handleSelect(1)}
            />
            <div className="home_vote_vs" aria-hidden="true">
              VS
            </div>
          </div>

          <div className="home_vote_footer">
            <div className="home_vote_total">
              {typeof totalVotes === "number" ? (
                <>
                  <img className="home_vote_total_icon" src={peopleSvg} alt="" aria-hidden="true" />
                  <span>{`현재 ${displayedTotalVotes.toLocaleString()}명이 투표에 참여했어요!`}</span>
                </>
              ) : null}
            </div>
            <button
              type="button"
              className="home_vote_cta"
              disabled={voted}
              onClick={() => {
                if (voted) return
                if (selectedIndex === null) {
                  setVoteAlertMessage("선택지를 선택해주세요.")
                  return
                }
                setIsConfirmOpen(true)
              }}
            >
              {voted ? "오늘은 이미 투표에 참여했어요" : "투표하고 결과보기"}
            </button>
          </div>
        </div>
      </section>

      {isConfirmOpen ? (
        <PurchaseConfirmModal
          ariaLabel="투표 참여 확인"
          message={
            <>
              한 번 투표하면 다시는 바꿀 수 없어요. <br />
              해당 조합에 투표하시겠어요?
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false)
            if (selectedIndex !== null) {
              storePick(voteId, selectedIndex)
              setVotedIndex(selectedIndex)
            }
          }}
        />
      ) : null}

      {voteAlertMessage ? (
        <div className="app_alert_toast" role="status" aria-live="polite">
          <span className="app_alert_toast_icon is_warning">
            <img src={iconWarning} alt="" aria-hidden="true" />
          </span>
          <p>{voteAlertMessage}</p>
        </div>
      ) : null}

    </>
  )
}

function WeeklyRankingCard({
  badgeSrc,
  drinkSrc,
  foodSrc,
  title,
  subtitle,
  scoreLabel,
  isCenter,
  badgeSize,
}: {
  badgeSrc: string
  drinkSrc: string
  foodSrc: string
  title: string
  subtitle: string
  scoreLabel: string
  isCenter?: boolean
  badgeSize?: "sm"
}) {
  return (
    <article className={`home_weekly_rank_card${isCenter ? " is_center" : ""}`}>
      <div className={`home_weekly_rank_badge${badgeSize === "sm" ? " is_small" : ""}`} aria-hidden="true">
        <img src={badgeSrc} alt="" />
      </div>
      <div className="home_weekly_rank_images" aria-hidden="true">
        <img className="home_weekly_rank_food" src={foodSrc} alt="" />
        <img className="home_weekly_rank_drink" src={drinkSrc} alt="" />
      </div>
      <div className="home_weekly_rank_meta">
        <div className="home_weekly_rank_title">{title}</div>
        <div className="home_weekly_rank_subtitle">{subtitle}</div>
        <div className="home_weekly_rank_score">{scoreLabel}</div>
      </div>
    </article>
  )
}

function HomeWeeklyRanking({ title, subtitle, linkTo }: { title: string; subtitle: string; linkTo: string }) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, homeWeeklyRankingCards.findIndex((card) => card.isCenter)),
  )
  const [dragOffsetX, setDragOffsetX] = useState(0)
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false)
  const total = homeWeeklyRankingCards.length
  const dots = useMemo(() => Array.from({ length: total }, (_, i) => i), [total])
  const virtualIndex = activeIndex - dragOffsetX / 170

  function wrapIndex(nextIndex: number) {
    if (total <= 0) return 0
    return (nextIndex + total) % total
  }

  function circularDelta(index: number, center: number) {
    if (total <= 0) return index - center
    let delta = index - center
    const half = total / 2
    while (delta > half) delta -= total
    while (delta < -half) delta += total
    return delta
  }

  const virtualActiveIndex = wrapIndex(Math.round(virtualIndex))
  const topCard =
    homeWeeklyRankingCards.find((card) => card.id === "weekly-rank-1") ??
    homeWeeklyRankingCards.find((card) => card.isCenter) ??
    homeWeeklyRankingCards[0]

  useEffect(() => {
    if (total <= 1) return
    if (isAutoPlayPaused) return

    if (typeof window !== "undefined" && "matchMedia" in window) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (prefersReducedMotion) return
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return
      setActiveIndex((prev) => wrapIndex(prev + 1))
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [isAutoPlayPaused, total])

  return (
    <section className="home_block home_weekly_rank" aria-label="이번 주 주합 랭킹">
      <div className="home_weekly_rank_stage" aria-hidden="true">
        <div className="home_weekly_rank_stage_bg" aria-hidden="true" />
        <div className="home_weekly_rank_header">
          <div className="home_weekly_rank_header_copy">
            <div className="home_weekly_rank_header_text">
              <h3>{title}</h3>
              <p className="home_weekly_rank_subcopy">{subtitle}</p>
            </div>
          <Link to={linkTo} className="more_button">
            랭킹보러가기
            <img src={iconCaretRight} alt="" aria-hidden="true" />
          </Link>
          </div>
        </div>
        <motion.div
          className="home_weekly_rank_cards"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => setIsAutoPlayPaused(true)}
          onDrag={(_, info) => setDragOffsetX(info.offset.x)}
          onDragEnd={(_, info) => {
            setDragOffsetX(0)
            const swipePower = info.offset.x + info.velocity.x * 14
            if (swipePower < -90) setActiveIndex((prev) => wrapIndex(prev + 1))
            else if (swipePower > 90) setActiveIndex((prev) => wrapIndex(prev - 1))
            window.setTimeout(() => setIsAutoPlayPaused(false), 3500)
          }}
        >
          {homeWeeklyRankingCards.map((card, index) => {
            const delta = circularDelta(index, virtualIndex)
            const abs = Math.abs(delta)
            const isActive = virtualActiveIndex === index && abs < 0.35
            const x = delta * 168
            const y = isActive ? -8 : 20 + abs * 12
            const scale = isActive ? 1 : abs < 1.2 ? 0.88 : 0.8
            const rotateZ = isActive ? 0 : delta * -10
            const rotateY = isActive ? 0 : delta * -38
            const z = isActive ? 0 : -abs * 30
            const opacity = abs > 1.75 ? 0 : isActive ? 1 : 0.92

            return (
              <motion.div
                key={card.id}
                className={`home_weekly_rank_card_slot${isActive ? " is_active" : ""}`}
                style={{ zIndex: 10 - abs, pointerEvents: opacity === 0 ? "none" : "auto" }}
                animate={{ x, y, z, scale, rotateZ, rotateY, opacity, transformPerspective: 900 }}
                transition={{ type: "spring", stiffness: 380, damping: 70, mass: 0.9 }}
                aria-hidden={opacity === 0}
                onClick={() => {
                  navigate(`/community/pairing/${card.communityPairingId}`)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    navigate(`/community/pairing/${card.communityPairingId}`)
                  }
                }}
              >
                <WeeklyRankingCard
                  badgeSrc={card.badgeSrc}
                  drinkSrc={card.drinkSrc}
                  foodSrc={card.foodSrc}
                  title={card.title}
                  subtitle={card.subtitle}
                  scoreLabel={card.scoreLabel}
                  isCenter={isActive}
                  badgeSize={card.id === "weekly-rank-4" || card.id === "weekly-rank-5" ? "sm" : undefined}
                />
              </motion.div>
            )
          })}
        </motion.div>
        <div className="home_weekly_rank_dots" aria-hidden="true">
          {dots.map((idx) => (
            <span key={idx} className={`home_weekly_rank_dot${idx === activeIndex ? " is_active" : ""}`} />
          ))}
        </div>

        <div className="home_weekly_rank_bubble" aria-hidden="true">
          <img className="home_weekly_rank_mascot" src={homeAssets.weeklyBestMascot} alt="" />
          <div className="home_weekly_rank_bubble_text">
            <div className="home_weekly_rank_bubble_title">
              이번 주 1위는 {topCard?.title} {topCard?.subtitle}!
            </div>
            <div className="home_weekly_rank_bubble_sub">깔끔한 한 잔이 고기의 풍미를 더 살려줘요.</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { recommendationItems, situationItems, weeklyDrinkItems } = useHomePageData()
  const featuredVote = voteItems.find((v) => v.id === FEATURED_VOTE_ID) ?? voteItems[0]
  const navigate = useNavigate()
  const location = useLocation()
  const voteSectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const shouldScroll = Boolean((location.state as { scrollToHomeVote?: boolean } | null)?.scrollToHomeVote)
    if (!shouldScroll) return
    const target = voteSectionRef.current
    if (!target) return
    const raf = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [location.state])

  return (
    <section className="home_page page_screen" aria-label="홈">
      <header className="home_header">
        <img className="home_logo" src={logoSvg} alt="주합" />
        <button className="home_notice_button is_disabled" type="button" aria-label="알림" disabled>
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="home_top_group">
        <AiCard
          title="오늘은 어떤 술과 페어링할까?"
          subtitle="기분에 맞는 술과 안주 조합을 찾아보세요."
          hint=""
          buttonLabel="AI 추천 받기"
        />

        <TodayRecommendation title="오늘의 추천 페어링" subtitle="취향에 맞는 조합을 추천해요." items={recommendationItems} />
      </div>

      <SituationSection items={situationItems} />

      <div ref={voteSectionRef}>
        <VoteSection
          voteId={featuredVote.id}
          question={featuredVote.question}
          totalVotes={featuredVote.totalVotes}
          options={[
            { id: 1, ...featuredVote.options[0] },
            { id: 2, ...featuredVote.options[1] },
          ]}
        />
      </div>

      <HomeWeeklyRanking
        title="이번 주 주합 랭킹"
        subtitle="이번 주 주합러들이 가장 많이 찾은 조합이에요."
        linkTo="/community/ranking"
      />

      <WeeklyDrink title="금주의 주류 소개" items={weeklyDrinkItems} />

      <button
        type="button"
        className="home_quiz_card"
        aria-label="오늘의 퀴즈"
        onClick={() =>
          navigate("/quiz", {
            state: { fromPath: `${location.pathname}${location.search}${location.hash}` },
          })
        }
        style={{ backgroundImage: `url(${homeAssets.todayQuizBanner})` }}
      >
        <div className="home_quiz_left">
          <div className="home_quiz_badge">오늘의 퀴즈 도전!</div>
          <div className="home_quiz_text_group">
            <div className="home_quiz_title">퀴즈 풀고 포인트 받기</div>
            <div className="home_quiz_subtitle">매일 퀴즈 참여하고 포인트를 모아보세요.</div>
          </div>
        </div>
        <div className="home_quiz_right" aria-hidden="true">
          <img className="home_quiz_arrow" src={iconCaretRight} alt="" />
        </div>
      </button>
    </section>
  )
}
