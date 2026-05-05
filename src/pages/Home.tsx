import { Link } from "react-router"
import "../styles/home.css"
import AiCard from "../components/AiCard"
import TodayRecommendation from "../components/TodayRecommendation"
import SituationSection from "../components/SituationSection"
import VoteSection from "../components/VoteSection"
import RankingSection from "../components/RankingSection"
import WeeklyDrink from "../components/WeeklyDrink"
import { useHomePageData } from "../hooks/useHomePageData"
import { useVoteData, FEATURED_VOTE_ID } from "../hooks/useVoteData"

export default function Home() {
  const { rankingItems, recommendationItems, situationItems } = useHomePageData()
  const { voteItems } = useVoteData()
  const featuredVote = voteItems.find((v) => v.id === FEATURED_VOTE_ID) ?? voteItems[0]
  return (
    <section className="home_page page_screen" aria-label="홈">
      <header className="home_header">
        <h1>Hi 주합러!</h1>
        <button className="notice_button" type="button">
          알림
        </button>
      </header>

      <AiCard
        icon="🐰"
        label="⚡ AI 주식 분석"
        heading="지금 마시는 술, 어떤 음식이 어울릴까?"
      />

      <TodayRecommendation
        title="오늘의 추천"
        subtitle="비 오는 화요일, 와인 한 잔"
        items={recommendationItems}
      />

      <SituationSection items={situationItems} />

      <VoteSection
        voteId={featuredVote.id}
        question={featuredVote.question}
        options={[
          { id: 1, ...featuredVote.options[0] },
          { id: 2, ...featuredVote.options[1] },
        ]}
      />

      <RankingSection title="이번 주의 주합 랭킹" items={rankingItems} />

      <WeeklyDrink
        title="금주의 주류 소개"
        linkTo="/product/1"
        info={{
          name: "케이머스 나파 밸리 카버네 소비뇽 2023",
          type: "레드와인",
          origin: "미국(U.S.A), California",
          variety: "Cabernet Sauvignon",
          rating: 4.0,
          sweetness: "낮은 당도",
        }}
      />

      <Link to="/quiz" className="quiz_card">
        퀴즈 풀고 포인트 받자!
      </Link>
    </section>
  )
}
