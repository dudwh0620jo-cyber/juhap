import { Link } from "react-router"
import "../styles/home.css"

const recommendationItems = [
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

const rankingItems = [
  "한라산 - 방어회",
  "카버네 소비뇽 - 고다치즈",
  "발베니 12년 - 다크초콜릿",
  "처음처럼 - 삼겹살",
  "짐빔하이볼 - 어텀크리스피청포도",
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

      <section className="ai_card">
        <div className="ai_icon" aria-hidden="true">
          <span>🐰</span>
        </div>
        <div className="ai_copy">
          <p>⚡ AI 주식 분석</p>
          <h2>지금 마시는 술, 어떤 음식이 어울릴까?</h2>
        </div>
        <button className="camera_button" type="button" aria-label="카메라">
          📷
        </button>
      </section>

      <section className="home_block">
        <h3>오늘의 추천</h3>
        <p className="block_sub_title">비 오는 화요일, 와인 한 잔</p>
        <div className="recommendation_row">
          {recommendationItems.map((item) => (
            <article className="recommendation_card" key={item.id}>
              <div className="recommendation_thumb">
                <span className="thumb_badge">{item.badge}</span>
                <span className="thumb_score">{item.score}</span>
              </div>
              <div className="recommendation_body">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home_block">
        <h3>불금에 어울리는 조합은?</h3>

        <article className="vote_card">
          <h4>맥주에 피자다</h4>
          <p>--%</p>
          <button type="button">투표하고 현황보기</button>
        </article>

        <div className="versus_label">vs</div>

        <article className="vote_card">
          <h4>와인에 스테이크다</h4>
          <p>--%</p>
          <button type="button">투표하고 현황보기</button>
        </article>
      </section>

      <section className="home_block">
        <div className="ranking_header">
          <h3>이번 주의 주합 랭킹</h3>
          <button className="more_button" type="button">
            더보기
          </button>
        </div>
        <ol className="home_ranking_list">
          {rankingItems.map((item, index) => (
            <li key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="home_block">
        <h3>금주의 주류 소개</h3>
        <Link to="/product/1" className="drink_card_link">
          <article className="drink_card">
            <div className="drink_info">
              <h4>케이머스 나파 밸리 카버네 소비뇽 2023</h4>
              <p>종류 : 레드와인</p>
              <p>생산지 : 미국(U.S.A), California</p>
              <p>품종 : Cabernet Sauvignon</p>
              <p>평점 : 4.0</p>
              <p>당도 : 낮은 당도</p>
            </div>
            <div className="drink_bottle" aria-hidden="true" />
          </article>
        </Link>
      </section>

      <Link to="/quiz" className="quiz_card">
        퀴즈 풀고 포인트 받자!
      </Link>
    </section>
  )
}
