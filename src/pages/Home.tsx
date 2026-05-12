import "../styles/home.css"
import AiCard from "../components/AiCard"
import TodayRecommendation from "../components/TodayRecommendation"
import SituationSection from "../components/SituationSection"
import VoteSection from "../components/VoteSection"
import HomeWeeklyRanking from "../components/HomeWeeklyRanking"
import WeeklyDrink from "../components/WeeklyDrink"
import { useHomePageData } from "../hooks/useHomePageData"
import { useVoteData, FEATURED_VOTE_ID } from "../hooks/useVoteData"
import bellIcon from "../assets/svg/bell.svg"
import { Link } from "react-router"
import { homeAssets } from "../data/homeContent"

export default function Home() {
  const { recommendationItems, situationItems, weeklyDrinkItems } = useHomePageData()
  const { voteItems } = useVoteData()
  const featuredVote = voteItems.find((v) => v.id === FEATURED_VOTE_ID) ?? voteItems[0]

  return (
    <section className="home_page page_screen" aria-label="홈">
      <header className="home_header">
        <h1 className="home_logo">주합</h1>
        <button className="home_notice_button" type="button" aria-label="알림">
          <img src={bellIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <AiCard
        title="오늘은 어떤 술과 함께할까요?"
        subtitle="기분에 맞는 술과 안주 조합을 찾아보세요."
        hint=""
        buttonLabel="라벨 스캔하기"
      />

      <TodayRecommendation title="오늘의 추천 페어링" subtitle="취향에 맞는 조합을 추천해요." items={recommendationItems} />

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

      <HomeWeeklyRanking title="이번 주 주합 랭킹" subtitle="이번 주 주합러들이 가장 많이 찾은 조합이에요." linkTo="/community/ranking" />

      <WeeklyDrink title="금주의 주류 소개" linkTo="/product/weekly-dassai-23" items={weeklyDrinkItems} />

      <Link to="/quiz" className="home_quiz_card" aria-label="오늘의 퀴즈">
        <div className="home_quiz_banner" aria-hidden="true">
          <img src={homeAssets.todayQuizBanner} alt="" />
        </div>
        <div className="home_quiz_badge">오늘의 퀴즈 도전!</div>
        <div className="home_quiz_title">퀴즈 풀고 포인트 받기</div>
        <div className="home_quiz_subtitle">매일 퀴즈 참여하고 포인트를 모아보세요.</div>
      </Link>
    </section>
  )
}
