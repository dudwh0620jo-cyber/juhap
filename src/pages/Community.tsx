import { useState } from "react"
import { Link } from "react-router"
import "../styles/community.css"

type TopTab = "ranking" | "feed"

const rankingRows = [
  { id: 1, rank: 4, pair: "카스 맥주 + 치킨", category: "맥주", score: 94.1 },
  { id: 2, rank: 5, pair: "화요 25 + 회무침", category: "전통주", score: 92.7 },
  { id: 3, rank: 6, pair: "샴페인 + 굴", category: "와인", score: 91.3 },
]

export default function Community() {
  const [topTab, setTopTab] = useState<TopTab>("feed")

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <header className="community_header">
        <div className="community_tabs">
          <button
            className={topTab === "ranking" ? "is_active" : ""}
            onClick={() => setTopTab("ranking")}
            type="button"
          >
            랭킹
          </button>
          <button
            className={topTab === "feed" ? "is_active" : ""}
            onClick={() => setTopTab("feed")}
            type="button"
          >
            피드
          </button>
        </div>
      </header>

      {topTab === "ranking" ? (
        <div className="ranking_page">
          <div className="ranking_list">
            {rankingRows.map((row) => (
              <Link className="ranking_row" key={row.id} to={`/community/ranking/${row.id}`}>
                <strong className="row_rank">{row.rank}</strong>
                <div className="row_text">
                  <h3>{row.pair}</h3>
                  <p>★ {row.score}</p>
                </div>
                <span className="row_category">{row.category}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="feed_placeholder">피드 화면</div>
      )}
    </section>
  )
}
