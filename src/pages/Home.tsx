import "../styles/home.css"
import { useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import bellIcon from "../assets/svg/bell.svg"
import logoSvg from "../assets/svg/logo.svg"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import type { RecommendationItem } from "../components/RecommendationCard"
import SituationSection from "../components/SituationSection"
import WeeklyDrink from "../components/WeeklyDrink"
import { getStoredPicks, storePick } from "../utils/votePicks"
import { homeAssets, homeWeeklyRankingCards, resolveVoteOptionIconSrc } from "../data/homeContent"
import { useHomePageData } from "../hooks/useHomePageData"
import { FEATURED_VOTE_ID, useVoteData } from "../hooks/useVoteData"

type AiCardProps = {
  title: string
  subtitle: string
  hint: string
  buttonLabel: string
}

function AiCardScanButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="home_ai_scan_button" type="button" onClick={onClick}>
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
      <AiCardScanButton label={buttonLabel} onClick={() => navigate("/ai-scan")} />
    </section>
  )
}

type TodayRecommendationProps = {
  title: string
  subtitle: string
  items: RecommendationItem[]
}

function formatHeroPairTitle(title: string) {
  if (!title.includes("+")) return title
  const [left, right] = title.split("+").map((value) => value.trim())
  if (!left || !right) return title
  return `${right} 횞 ${left}`
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
      {items.length ? (
        <div className="home_today_carousel" ref={scrollRef} onScroll={handleScroll} aria-label="?ㅻ뒛??異붿쿇 諛곕꼫">
          <div className="home_today_track">
            {items.map((hero) => {
              const pairingParts =
                hero.title && hero.title.includes("+") ? hero.title.split("+").map((value) => value.trim()).filter(Boolean) : null
              const heroFood = pairingParts?.[1] ?? null
              const heroDrink = pairingParts?.[0] ?? null

              return (
                <Link key={hero.id} to={`/community/pairing/${hero.id}`} className="home_today_slide home_today_hero">
                  <div className="home_today_hero_media" aria-hidden="true">
                    {hero.imageSrc ? <img src={hero.imageSrc} alt="" /> : null}
                  </div>
                  <div className="home_today_hero_copy">
                    <div className="home_today_hero_label">{title}</div>
                    <strong className="home_today_hero_title">
                      {heroFood ? <span className="home_today_hero_food">{heroFood}</span> : formatHeroPairTitle(hero.title)}
                      {heroFood && heroDrink ? (
                        <>
                          <span className="home_today_hero_x"> 횞 </span>
                          <span className="home_today_hero_drink">{heroDrink}</span>
                        </>
                      ) : null}
                    </strong>
                    <div className="home_today_hero_desc">{hero.description}</div>
                    <div className="home_today_hero_link" aria-hidden="true">
                      ?먯꽭?덈낫湲???                    </div>
                  </div>
                </Link>
              )
            })}
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
    <button type="button" className={`home_vote_option${isSelected ? " is_selected" : ""}`} onClick={onVote}>
      <span className="home_vote_option_icon" aria-hidden="true">
        {iconSrc ? <img src={iconSrc} alt="" /> : null}
      </span>
      <span className="home_vote_option_title">{title}</span>
      <span className="home_vote_option_meta">{voted ? `${percent}%` : "?ы몴"}</span>
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

function VoteSection({ voteId, question, options, totalVotes }: VoteSectionProps) {
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
      <section className="home_block home_vote" aria-label="?ㅻ뒛???ы몴">
        <div className="home_block_header home_vote_header">
          <div>
            <h3>?ㅻ뒛???ы몴</h3>
            <div className="home_vote_question">{question}</div>
            <div className="home_vote_deadline">
              <span className="home_vote_deadline_label">?ы몴 留덇컧源뚯?</span>
              <span className="home_vote_deadline_time">{formatVoteRemaining()}</span>
            </div>
          </div>
          <button type="button" className="home_vote_more" onClick={() => setIsConfirmOpen(true)}>
            ?붾낫湲?&gt;
          </button>
        </div>

        <div className="home_vote_panel">
          <div className="home_vote_options" role="group" aria-label="?ы몴 ??ぉ">
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
            {typeof totalVotes === "number" ? `?ㅻ뒛 ?꾩옱 ${totalVotes.toLocaleString()}紐낆씠 ?ы몴??李몄뿬?덉뼱??` : null}
          </div>
          <button type="button" className="home_vote_cta" onClick={() => navigate("/vote")}>
            ?ы몴?섍퀬 寃곌낵蹂닿린
          </button>
        </div>
      </section>

      {isConfirmOpen ? (
        <PurchaseConfirmModal
          ariaLabel="?ы몴 ?대룞 ?뺤씤"
          message="?ы몴???ㅼ뼱媛硫?諛붾줈 李몄뿬媛 吏꾪뻾?섏뼱 痍⑥냼?????놁뼱?? ?대룞?좉퉴??"
          cancelLabel="痍⑥냼"
          confirmLabel="?대룞"
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

function WeeklyRankingCard({
  badgeSrc,
  drinkSrc,
  foodSrc,
  title,
  subtitle,
  scoreLabel,
  isCenter,
}: {
  badgeSrc: string
  drinkSrc: string
  foodSrc: string
  title: string
  subtitle: string
  scoreLabel: string
  isCenter?: boolean
}) {
  return (
    <article className={`home_weekly_rank_card${isCenter ? " is_center" : ""}`}>
      <div className="home_weekly_rank_badge" aria-hidden="true">
        <img src={badgeSrc} alt="" />
      </div>
      <div className="home_weekly_rank_images" aria-hidden="true">
        <img className="home_weekly_rank_drink" src={drinkSrc} alt="" />
        <img className="home_weekly_rank_food" src={foodSrc} alt="" />
      </div>
      <div className="home_weekly_rank_title">{title}</div>
      <div className="home_weekly_rank_subtitle">{subtitle}</div>
      <div className="home_weekly_rank_score">{scoreLabel}</div>
    </article>
  )
}

function HomeWeeklyRanking({ title, subtitle, linkTo }: { title: string; subtitle: string; linkTo: string }) {
  return (
    <section className="home_block home_weekly_rank" aria-label="?대쾲 二?二쇳빀 ??궧">
      <div className="ranking_header">
        <div className="home_weekly_rank_header_copy">
          <h3>{title}</h3>
          <p className="home_weekly_rank_subcopy">{subtitle}</p>
        </div>
        <Link to={linkTo} className="more_button">
          ?붾낫湲?&gt;
        </Link>
      </div>

      <div className="home_weekly_rank_stage" aria-hidden="true">
        <div className="home_weekly_rank_cards">
          {homeWeeklyRankingCards.map((card) => (
            <WeeklyRankingCard
              key={card.id}
              badgeSrc={card.badgeSrc}
              drinkSrc={card.drinkSrc}
              foodSrc={card.foodSrc}
              title={card.title}
              subtitle={card.subtitle}
              scoreLabel={card.scoreLabel}
              isCenter={card.isCenter}
            />
          ))}
        </div>
        <div className="home_weekly_rank_dots" aria-hidden="true">
          <span className="home_weekly_rank_dot" />
          <span className="home_weekly_rank_dot is_active" />
          <span className="home_weekly_rank_dot" />
        </div>

        <div className="home_weekly_rank_bubble" aria-hidden="true">
          <img className="home_weekly_rank_mascot" src={homeAssets.weeklyBestMascot} alt="" />
          <div className="home_weekly_rank_bubble_text">?대쾲 二?1?꾨뒗 吏꾨줈 ?댁쫰諛??쇨껸??</div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { recommendationItems, situationItems, weeklyDrinkItems } = useHomePageData()
  const { voteItems } = useVoteData()
  const featuredVote = voteItems.find((v) => v.id === FEATURED_VOTE_ID) ?? voteItems[0]

  return (
    <section className="home_page page_screen" aria-label="홈">
      <header className="home_header">
        <img className="home_logo" src={logoSvg} alt="주합" />
        <button className="home_notice_button" type="button" aria-label="알림">
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="home_top_group">
        <AiCard
          title="오늘은 어떤 술과 페어링할까?"
          subtitle="기분에 맞는 술과 안주 조합을 찾아보세요"
          hint=""
          buttonLabel="라벨 스캔하기"
        />

        <TodayRecommendation title="오늘의 추천 페어링" subtitle="취향에 맞는 조합을 추천해요." items={recommendationItems} />
      </div>

      <SituationSection items={situationItems} />

      <VoteSection
        voteId={featuredVote.id}
        question={featuredVote.question}
        totalVotes={featuredVote.totalVotes}
        options={[
          { id: 1, ...featuredVote.options[0] },
          { id: 2, ...featuredVote.options[1] },
        ]}
      />

      <HomeWeeklyRanking
        title="이번 주 주합 랭킹"
        subtitle="이번 주 주합러들이 가장 많이 찾은 조합이에요"
        linkTo="/community/ranking"
      />

      <WeeklyDrink title="금주의 주류 추천" linkTo="/product/weekly-dassai-23" items={weeklyDrinkItems} />

      <Link to="/quiz" className="home_quiz_card" aria-label="오늘의 퀴즈">
        <div className="home_quiz_banner" aria-hidden="true">
          <img src={homeAssets.todayQuizBanner} alt="" />
        </div>
        <div className="home_quiz_badge">오늘의 퀴즈 시작!</div>
        <div className="home_quiz_title">퀴즈 풀고 포인트 받기</div>
        <div className="home_quiz_subtitle">매일 퀴즈 참여하고 포인트를 모아보세요</div>
      </Link>
    </section>
  )
}
