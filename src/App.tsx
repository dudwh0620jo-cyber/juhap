
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
        description: "깔끔하게 기름진 맛을 잡아주며 어울리는 든든한 소주 한 조합",
      },
      {
        badge: "완벽 매치",
        score: "89%",
        title: "한라산 + 방어회",
        description: "차가운 회의 감칠맛을 선명하게 살려주는 산뜻한 페어링",
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
      {
        title: "맥주에 피자다",
        progress: "--%",
      },
      {
        title: "와인에 스테이크다",
        progress: "--%",
      },
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
  bottomNav: {
    active: "채팅",
    items: ["홈", "카테고리", "채팅", "커뮤니티", "마이"],
  },
}

function App() {
  return (
    <main className="app-shell">
      <section className="home-screen" aria-label="주합 홈">
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

        <nav className="bottom-nav" aria-label="주요 메뉴">
          {mockHomeData.bottomNav.items.map((item) => (
            <button
              type="button"
              className={item === mockHomeData.bottomNav.active ? "active" : ""}
              key={item}
            >
              {item}
            </button>
          ))}
        </nav>
      </section>

      <style>{styles}</style>
    </main>
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

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    background: #eeeeee;
    color: #222222;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  button {
    border: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .app-shell {
    min-height: 100vh;
    background: #eeeeee;
  }

  .home-screen {
    position: relative;
    width: 100%;
    max-width: 430px;
    min-height: 100vh;
    margin: 0 auto;
    padding: 64px 24px 132px;
    background: #d9d9d9;
    overflow: hidden;
  }

  .home-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 16px;
  }

  .home-header h1,
  .content-section h2 {
    margin: 0;
    line-height: 1.2;
    letter-spacing: 0;
  }

  .home-header h1 {
    font-size: 20px;
    font-weight: 750;
  }

  .notice-button {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    background: #ffffff;
    font-size: 11px;
    font-weight: 700;
  }

  .ai-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    width: 100%;
    min-height: 78px;
    padding: 12px 16px 12px 10px;
    border: 1.5px solid #8b877f;
    border-radius: 16px;
    background: #f2f1ed;
    text-align: left;
  }

  .mascot {
    position: relative;
    width: 54px;
    height: 50px;
    margin-right: 10px;
    border-radius: 48% 48% 42% 42%;
    background: #030303;
  }

  .mascot::before,
  .mascot::after {
    content: "";
    position: absolute;
    top: -14px;
    width: 15px;
    height: 30px;
    border-radius: 999px;
    background: #030303;
  }

  .mascot::before {
    left: 9px;
    transform: rotate(6deg);
  }

  .mascot::after {
    right: 10px;
    transform: rotate(-6deg);
  }

  .mascot span::before,
  .mascot span::after {
    content: "";
    position: absolute;
    top: 26px;
    width: 6px;
    height: 8px;
    border-radius: 999px;
    background: #ffffff;
  }

  .mascot span::before {
    left: 18px;
  }

  .mascot span::after {
    right: 18px;
  }

  .ai-copy {
    min-width: 0;
  }

  .ai-eyebrow {
    display: block;
    margin-bottom: 5px;
    color: #777777;
    font-size: 13px;
    font-weight: 800;
  }

  .ai-eyebrow::before {
    content: "↯";
    margin-right: 6px;
    color: #9b9b9b;
  }

  .ai-copy strong {
    display: block;
    font-size: 15px;
    font-weight: 850;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .camera-button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 40px;
    margin-left: 10px;
    border: 1.5px solid #222222;
    border-radius: 10px;
    background: #eeeeee;
  }

  .camera-button::before {
    content: "";
    width: 22px;
    height: 17px;
    border: 2px solid #555555;
    border-radius: 4px;
    background: #6b6b6b;
  }

  .camera-lens {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #202020;
    border: 1px solid #9d9d9d;
  }

  .content-section {
    margin-top: 36px;
  }

  .section-heading h2,
  .content-section h2 {
    font-size: 20px;
    font-weight: 850;
  }

  .section-heading p {
    margin: 5px 0 0;
    color: #4d4d4d;
    font-size: 14px;
    font-weight: 650;
  }

  .recommendation-row {
    display: flex;
    gap: 9px;
    margin: 7px -24px 0 0;
    padding: 0 24px 4px 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .recommendation-row::-webkit-scrollbar {
    display: none;
  }

  .pairing-card {
    flex: 0 0 170px;
    overflow: hidden;
    border-radius: 8px;
    background: #222222;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
  }

  .pairing-image {
    position: relative;
    height: 86px;
    background-color: #8f7964;
    background-image:
      radial-gradient(circle at 73% 49%, #191919 0 10px, transparent 11px),
      linear-gradient(135deg, #ad7b38 0%, #51443b 48%, #c8b08e 100%);
  }

  .pairing-image-2 {
    background-image:
      radial-gradient(circle at 72% 50%, #202020 0 10px, transparent 11px),
      linear-gradient(135deg, #5f6c7a 0%, #6b4b38 48%, #d3d3c7 100%);
  }

  .pairing-image-3 {
    background-image:
      radial-gradient(circle at 72% 50%, #2d1c1c 0 10px, transparent 11px),
      linear-gradient(135deg, #7b1f2a 0%, #51382d 48%, #e1c78d 100%);
  }

  .pairing-badge,
  .pairing-score {
    position: absolute;
    top: 8px;
    border-radius: 999px;
    background: #fff4c8;
    color: #3a2d13;
    font-size: 9px;
    font-weight: 850;
  }

  .pairing-badge {
    left: 8px;
    padding: 5px 8px;
  }

  .pairing-score {
    right: 8px;
    padding: 4px 6px;
  }

  .pairing-body {
    padding: 12px 10px 14px;
  }

  .pairing-body h3 {
    margin: 0 0 8px;
    color: #ffffff;
    font-size: 12px;
    font-weight: 850;
  }

  .pairing-body p {
    display: -webkit-box;
    min-height: 28px;
    margin: 0;
    overflow: hidden;
    color: #9a9a9a;
    font-size: 10px;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .vote-section h2 {
    margin-bottom: 14px;
  }

  .vote-card {
    display: grid;
    place-items: center;
    min-height: 112px;
    margin: 0 13px;
    padding: 22px 20px 12px;
    border-radius: 24px;
    background: #ffffff;
  }

  .vote-card h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
  }

  .vote-card p {
    margin: 2px 0 8px;
    font-size: 15px;
    font-weight: 800;
  }

  .vote-card button {
    width: min(178px, 100%);
    height: 28px;
    border-radius: 999px;
    background: #9d9d9d;
    color: #ffffff;
    font-size: 15px;
    font-weight: 750;
  }

  .versus {
    display: block;
    margin: 21px 0;
    text-align: center;
    font-size: 14px;
    font-weight: 850;
  }

  .ranking-section {
    margin-top: 28px;
  }

  .ranking-list {
    display: grid;
    gap: 6px;
    margin: 17px 0 0;
    padding: 0;
    list-style: none;
  }

  .ranking-list li {
    display: grid;
    grid-template-columns: 34px 1fr;
    align-items: center;
    min-height: 53px;
    padding: 0 26px;
    border-radius: 999px;
    background: #ffffff;
    font-size: 15px;
  }

  .ranking-list span {
    font-weight: 700;
  }

  .ranking-list strong {
    min-width: 0;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .more-button {
    display: block;
    margin: 7px 18px 0 auto;
    background: transparent;
    font-size: 16px;
    font-weight: 650;
  }

  .drink-section {
    margin-top: 10px;
  }

  .drink-card {
    display: grid;
    grid-template-columns: 1fr 78px;
    gap: 14px;
    min-height: 176px;
    margin-top: 20px;
    padding: 19px 10px 14px;
    background: #ffffff;
  }

  .drink-card h3 {
    margin: 0 0 28px;
    font-size: 15px;
    font-weight: 850;
    line-height: 1.28;
  }

  .drink-card dl {
    margin: 0;
    font-size: 13px;
    line-height: 1.08;
  }

  .drink-card dl div {
    display: flex;
    gap: 4px;
  }

  .drink-card dt {
    font-weight: 650;
  }

  .drink-card dd {
    margin: 0;
    font-weight: 550;
  }

  .wine-bottle {
    position: relative;
    align-self: end;
    justify-self: center;
    width: 38px;
    height: 126px;
  }

  .bottle-neck {
    position: absolute;
    left: 12px;
    top: 0;
    width: 14px;
    height: 39px;
    border-radius: 4px 4px 1px 1px;
    background: #242424;
    border: 2px solid #8a7757;
  }

  .bottle-body {
    position: absolute;
    left: 5px;
    bottom: 0;
    display: grid;
    place-items: center;
    width: 28px;
    height: 92px;
    border-radius: 12px 12px 7px 7px;
    background: #181818;
    border: 2px solid #78684f;
  }

  .bottle-body::before {
    content: "";
    position: absolute;
    top: 26px;
    width: 23px;
    height: 34px;
    border-radius: 4px;
    background: #efe7c8;
  }

  .bottle-body span {
    position: relative;
    z-index: 1;
    color: #7b622a;
    font-size: 10px;
    font-weight: 850;
  }

  .quiz-card {
    width: 100%;
    min-height: 88px;
    margin-top: 28px;
    border-radius: 8px;
    background: #ffffff;
    font-size: 17px;
    font-weight: 850;
  }

  .bottom-nav {
    position: fixed;
    left: 50%;
    bottom: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    width: min(100%, 430px);
    height: 88px;
    padding: 10px 20px 18px;
    background: #d9d9d9;
    transform: translateX(-50%);
  }

  .bottom-nav button {
    justify-self: center;
    min-width: 31px;
    min-height: 49px;
    padding: 0 5px;
    border-radius: 999px;
    background: transparent;
    font-size: 15px;
    font-weight: 750;
    white-space: nowrap;
  }

  .bottom-nav button.active {
    min-width: 56px;
    background: #fff4c8;
  }

  @media (max-width: 374px) {
    .home-screen {
      padding-inline: 18px;
    }

    .home-header {
      padding-inline: 10px;
    }

    .ai-card {
      grid-template-columns: auto 1fr;
    }

    .camera-button {
      display: none;
    }

    .pairing-card {
      flex-basis: 156px;
    }

    .ranking-list li {
      padding-inline: 20px;
    }

    .bottom-nav {
      padding-inline: 12px;
    }

    .bottom-nav button {
      font-size: 13px;
    }
  }
`

export default App
