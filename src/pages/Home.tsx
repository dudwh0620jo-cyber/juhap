import { useState } from "react"
import { Link } from "react-router"
import "../styles/home.css"

const situationItems = [
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
  const [selectedSituation, setSelectedSituation] = useState(1)

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
        <div className="situation_top">
          <h3>지금 이 순간</h3>
          <span className="situation_hint">상황을 선택하면 추천이 달라져요</span>
        </div>
        <div className="situation_scroll">
          {situationItems.map((item) => (
            <div key={item.id} className="situation_item_wrap">
              <button
                type="button"
                className={`situation_item${selectedSituation === item.id ? " situation_item_active" : ""}`}
                onClick={() => setSelectedSituation(item.id)}
              >
                <span className="situation_emoji">{item.emoji}</span>
              </button>
              <span className="situation_label">{item.label}</span>
            </div>
          ))}
        </div>
        {(() => {
          const rec = situationItems.find((s) => s.id === selectedSituation)!
          return (
            <div className="situation_rec_card">
              <div className="situation_rec_head">
                <span className="situation_rec_title">
                  {rec.emoji} {rec.label} 추천 1위
                </span>
                <span className="situation_rec_badge">🏆 {rec.recommendCount.toLocaleString()}명 추천</span>
              </div>
              <div className="situation_rec_products">
                <div className="situation_product">
                  <span className="situation_product_emoji">{rec.drink.emoji}</span>
                  <strong>{rec.drink.name}</strong>
                  <span>{rec.drink.desc}</span>
                </div>
                <span className="situation_rec_plus">+</span>
                <div className="situation_product">
                  <span className="situation_product_emoji">{rec.snack.emoji}</span>
                  <strong>{rec.snack.name}</strong>
                  <span>{rec.snack.desc}</span>
                </div>
              </div>
              <div className="situation_rec_footer">
                <p>{rec.footer}</p>
                <button type="button" className="situation_detail_btn">
                  → 자세히 보기
                </button>
              </div>
            </div>
          )
        })()}
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
