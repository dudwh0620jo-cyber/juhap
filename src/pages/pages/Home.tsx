import { Link } from "react-router"
import "../styles/home.css"
import AiCard from "../components/AiCard"
import TodayRecommendation from "../components/TodayRecommendation"
import SituationSection, { type SituationItem } from "../components/SituationSection"
import VoteSection from "../components/VoteSection"
import RankingSection from "../components/RankingSection"
import WeeklyDrink from "../components/WeeklyDrink"
import { type RecommendationItem } from "../components/RecommendationCard"

const rankingItems = [
  "한라산 - 방어회",
  "카버네 소비뇽 - 고다치즈",
  "발베니 12년 - 다크초콜릿",
  "처음처럼 - 삼겹살",
  "짐빔하이볼 - 어텀크리스피청포도",
]

const recommendationItems: RecommendationItem[] = [
  {
    id: 1,
    badge: "완벽 매치",
    score: "97%",
    title: "진로 이즈백 · 삼겹살",
    description: "삼겹살의 기름진 맛을 깔끔하게 잡아주는 한 병의 소주",
  },
  {
    id: 2,
    badge: "완벽 매치",
    score: "97%",
    title: "진로 이즈백 · 삼겹살",
    description: "삼겹살의 기름진 맛을 깔끔하게 잡아주는 한 병의 소주",
  },
  {
    id: 3,
    badge: "추천",
    score: "89%",
    title: "카버네 소비뇽 · 방어회",
    description: "차분한 산미와 풍미가 어울리는 밸런스 좋은 조합",
  },
]

const situationItems: SituationItem[] = [
  {
    id: 1,
    emoji: "🌙",
    label: "혼술",
    recommendCount: 1284,
    drink: { emoji: "🍶", name: "지평 생막걸리 小", desc: "300ml 혼자 딱" },
    snack: { emoji: "🥜", name: "마른 안주 믹스", desc: "간편하게" },
    footer: "혼자 마시기에 딱 맞는 양과 가격이에요",
  },
  {
    id: 2,
    emoji: "🎉",
    label: "홈파티",
    recommendCount: 983,
    drink: { emoji: "🍺", name: "카스 캔맥주 6캔", desc: "파티엔 역시 맥주" },
    snack: { emoji: "🍕", name: "피자 스낵 믹스", desc: "다함께 즐기기" },
    footer: "여럿이 즐기기 딱 좋은 가성비 조합이에요",
  },
  {
    id: 3,
    emoji: "🌧️",
    label: "비 오는 날",
    recommendCount: 2107,
    drink: { emoji: "🍵", name: "막걸리 Large", desc: "비엔 막걸리지" },
    snack: { emoji: "🥞", name: "해물파전 믹스", desc: "비 오는 날 필수" },
    footer: "비 오는 날엔 이 조합이 국룰이에요",
  },
  {
    id: 4,
    emoji: "🍖",
    label: "고기 먹을 때",
    recommendCount: 3450,
    drink: { emoji: "🥃", name: "진로 이즈백", desc: "고기와 찰떡궁합" },
    snack: { emoji: "🧄", name: "구운 마늘 세트", desc: "풍미 업그레이드" },
    footer: "고기의 기름진 맛을 깔끔하게 잡아줘요",
  },
  {
    id: 5,
    emoji: "⛺",
    label: "캠핑",
    recommendCount: 761,
    drink: { emoji: "🍻", name: "클라우드 캔맥주", desc: "야외에서 시원하게" },
    snack: { emoji: "🌽", name: "바베큐 믹스 너트", desc: "간편 캠핑 안주" },
    footer: "캠핑 분위기에 딱 어울리는 가벼운 조합",
  },
  {
    id: 6,
    emoji: "💔",
    label: "위로가 필요해",
    recommendCount: 528,
    drink: { emoji: "🍷", name: "까베르네 레드와인", desc: "감성을 달래줘요" },
    snack: { emoji: "🍫", name: "다크 초콜릿", desc: "쌉싸름하게" },
    footer: "오늘 하루 고생했어요, 천천히 마셔요",
  },
]

export default function Home() {
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
        question="불금에 어울리는 조합은?"
        options={[
          { id: 1, title: "맥주에 피자다" },
          { id: 2, title: "와인에 스테이크다" },
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
