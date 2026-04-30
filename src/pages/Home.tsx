import "../styles/home.css"

const mockHomeData = {
  user: {
    nickname: "주합러",
  },
  aiPairing: {
    label: "AI 조합 분석",
    title: "지금 마시는 술, 어떤 음식이 어울릴까?",
  },
  todayRecommendation: {
    title: "오늘의 추천",
    subtitle: "비 오는 화요일, 와인 한 잔",
    items: [
      {
        badge: "완벽 매치",
        score: "97%",
        title: "진로 이즈백 + 삼겹살",
        description: "깔끔하게 기름진 맛을 잡아주며 어울리는 든든한 소주 조합",
      },
      {
        badge: "완벽 매치",
        score: "89%",
        title: "한라산 + 방어회",
        description: "차가운 회의 감칠맛을 선명하게 올려주는 산뜻한 페어링",
      },
      {
        badge: "추천",
        score: "84%",
        title: "카베네 소비뇽 + 고다치즈",
        description: "진한 과실감과 고소한 풍미가 차분하게 이어지는 조합",
      },
    ],
  },
  vote: {
    title: "불금에 어울리는 조합은?",
    options: [
      { title: "맥주에 피자다", progress: "--%" },
      { title: "와인에 스테이크다", progress: "--%" },
    ],
  },
  ranking: {
    title: "이번 주의 조합 랭킹",
    items: [
      "한라산 + 방어회",
      "카베네 소비뇽 + 고다치즈",
      "발베니 12년 + 다크초콜릿",
      "처음처럼 + 삼겹살",
      "짐빔하이볼 + 어텀크리스피청포도",
    ],
  },
  weeklyDrink: {
    title: "금주의 주류 소개",
    name: "케이머스 나파 밸리 카베네 소비뇽 2023",
    details: [
      ["종류", "레드와인"],
      ["생산지", "미국(U.S.A), California"],
      ["품종", "Cabernet Sauvignon"],
      ["평점", "4.0"],
      ["당도", "낮은 당도"],
    ],
  },
  quiz: {
    title: "퀴즈 풀고 포인트 받자!",
  },
}

export default function Home() {
  return (
    <section className="home-page page-screen" aria-label="주합 홈">
      <header className="home-header">
        <h1>Hi {mockHomeData.user.nickname}!</h1>
        <button type="button" className="notice-button" aria-label="알림">
          알림
        </button>
      </header>

      <button type="button" className="ai-card">
        <span className="mascot" aria-hidden="true">
          <span />
        </span>
        <span className="ai-copy">
          <span className="ai-eyebrow">{mockHomeData.aiPairing.label}</span>
          <strong>{mockHomeData.aiPairing.title}</strong>
        </span>
        <span className="camera-button" aria-hidden="true">
          <span className="camera-lens" />
        </span>
      </button>

      <section className="content-section">
        <div className="section-heading">
          <h2>{mockHomeData.todayRecommendation.title}</h2>
          <p>{mockHomeData.todayRecommendation.subtitle}</p>
        </div>

        <div className="recommendation-row" aria-label="오늘의 추천 조합">
          {mockHomeData.todayRecommendation.items.map((card, index) => (
            <article className="pairing-card" key={card.title}>
              <div className={`pairing-image pairing-image-${index + 1}`}>
                <span className="pairing-badge">{card.badge}</span>
                <span className="pairing-score">{card.score}</span>
              </div>
              <div className="pairing-body">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section vote-section">
        <h2>{mockHomeData.vote.title}</h2>
        <VoteCard option={mockHomeData.vote.options[0]} />
        <strong className="versus">vs</strong>
        <VoteCard option={mockHomeData.vote.options[1]} />
      </section>

      <section className="content-section ranking-section">
        <h2>{mockHomeData.ranking.title}</h2>
        <ol className="ranking-list">
          {mockHomeData.ranking.items.map((item, index) => (
            <li key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>
        <button type="button" className="more-button">
          더보기
        </button>
      </section>

      <section className="content-section drink-section">
        <h2>{mockHomeData.weeklyDrink.title}</h2>
        <article className="drink-card">
          <div>
            <h3>{mockHomeData.weeklyDrink.name}</h3>
            <dl>
              {mockHomeData.weeklyDrink.details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="wine-bottle" aria-label="와인 병 이미지">
            <span className="bottle-neck" />
            <span className="bottle-body">
              <span>40</span>
            </span>
          </div>
        </article>
      </section>

      <button type="button" className="quiz-card">
        {mockHomeData.quiz.title}
      </button>
    </section>
  )
}

function VoteCard({
  option,
}: {
  option: { title: string; progress: string }
}) {
  return (
    <article className="vote-card">
      <h3>{option.title}</h3>
      <p>{option.progress}</p>
      <button type="button">투표하고 현황보기</button>
    </article>
  )
}
