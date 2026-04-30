import { useState } from "react"
import { Link } from "react-router"
import "../styles/community.css"

type TopTab = "ranking" | "feed"
type FeedFilter = "review" | "question" | "popular" | "follow"

type RankingRow = {
  id: number
  rank: number
  pair: string
  category: string
  score: number
  votes: number
  delta: string
}

type FeedPost = {
  id: number
  title: string
  body: string
  profile?: string
  isQuestion?: boolean
  imageBadge?: string
}

const rankingRows: RankingRow[] = [
  { id: 4, rank: 4, pair: "카스 맥주 + 치킨", category: "맥주", score: 94.1, votes: 7621, delta: "-1" },
  { id: 5, rank: 5, pair: "화요 25 + 회무침", category: "전통주", score: 92.7, votes: 5432, delta: "+5" },
  { id: 6, rank: 6, pair: "샴페인 + 굴", category: "와인", score: 91.3, votes: 4218, delta: "+2" },
  { id: 7, rank: 7, pair: "테라 맥주 + 떡볶이", category: "맥주", score: 90, votes: 3891, delta: "-2" },
]

const feedPostsByFilter: Record<FeedFilter, FeedPost[]> = {
  review: [
    {
      id: 1,
      title: "진로이즈백 / 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
    },
    {
      id: 2,
      title: "진로이즈백 / 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
    },
  ],
  question: [
    {
      id: 11,
      title: "케이머스 나파 밸리 드셔보신 분???",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구...",
      isQuestion: true,
      imageBadge: "5+",
    },
    {
      id: 12,
      title: "케이머스 나파 밸리 드셔보신 분???",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살...",
      isQuestion: true,
    },
    {
      id: 13,
      title: "케이머스 나파 밸리 드셔보신 분???",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살...",
      isQuestion: true,
    },
  ],
  popular: [
    {
      id: 21,
      title: "장생 막걸리 & 해물파전",
      body: "해물파전 해물파전 해물파전 맛있겠다 김치전 바삭전 감자전 막걸리 밸런리 호로요이",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
    },
    {
      id: 22,
      title: "진로이즈백 / 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
    },
  ],
  follow: [
    {
      id: 31,
      title: "진로이즈백 / 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
    },
    {
      id: 32,
      title: "진로이즈백 / 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
    },
  ],
}

export default function Community() {
  const [topTab, setTopTab] = useState<TopTab>("feed")
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("review")

  const posts = feedPostsByFilter[feedFilter]

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <header className="community_header">
        <div className="community_tabs" aria-label="커뮤니티 탭">
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
        <button className="search_button" type="button" aria-label="검색">
          <span />
        </button>
      </header>

      {topTab === "ranking" ? (
        <section className="ranking_page" aria-label="랭킹 목록">
          <div className="ranking_periods">
            {["주간", "일간", "월간", "전체"].map((item, index) => (
              <button className={index === 0 ? "is_active" : ""} key={item} type="button">
                {item}
              </button>
            ))}
          </div>

          <div className="ranking_tags">
            {["전체", "와인", "증류주", "맥주", "위스키", "전통주"].map((item, index) => (
              <button className={index === 0 ? "is_active" : ""} key={item} type="button">
                {item}
              </button>
            ))}
          </div>

          <article className="ranking_podium">
            <Link className="podium_card podium_second" to="/community/ranking/2">
              <span className="podium_rank">2</span>
              <div className="podium_thumb" />
              <strong>진로 이즈백</strong>
              <p>삼겹살</p>
              <em>97.2</em>
            </Link>
            <Link className="podium_card podium_first" to="/community/ranking/1">
              <span className="podium_rank">1</span>
              <div className="podium_thumb" />
              <strong>막걸리</strong>
              <p>해물파전</p>
              <em>98.4</em>
            </Link>
            <Link className="podium_card podium_third" to="/community/ranking/3">
              <span className="podium_rank">3</span>
              <div className="podium_thumb is_bottle" />
              <strong>레드 와인</strong>
              <p>스테이크</p>
              <em>95.8</em>
            </Link>
          </article>

          <div className="ranking_list">
            {rankingRows.map((row) => (
              <Link className="ranking_row" key={row.id} to={`/community/ranking/${row.id}`}>
                <strong className="row_rank">{row.rank}</strong>
                <div className="row_images">
                  <span />
                  <span />
                </div>
                <div className="row_text">
                  <h3>{row.pair}</h3>
                  <p>
                    ★ {row.score} · {row.votes.toLocaleString()}표
                  </p>
                </div>
                <span className={row.delta.startsWith("-") ? "row_delta is_down" : "row_delta"}>
                  {row.delta}
                </span>
                <span className="row_category">{row.category}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="feed_page" aria-label="커뮤니티 피드">
          <div className="feed_filter_row">
            {[
              { key: "review" as const, label: "후기" },
              { key: "question" as const, label: "질문" },
              { key: "popular" as const, label: "인기" },
              { key: "follow" as const, label: "팔로우" },
            ].map((item) => (
              <button
                className={feedFilter === item.key ? "is_active" : ""}
                key={item.key}
                onClick={() => setFeedFilter(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
            <button className="feed_drop_button" type="button" aria-label="필터 확장">
              ▼
            </button>
          </div>

          <div className="feed_cards">
            {posts.map((post) => (
              <article className={post.isQuestion ? "feed_card is_question" : "feed_card"} key={post.id}>
                <header className="feed_card_header">
                  <div className="avatar" />
                  <div>
                    <h3>A씨</h3>
                    {post.profile ? <p>{post.profile}</p> : null}
                  </div>
                  <button type="button">팔로우하기</button>
                </header>

                {post.isQuestion ? (
                  <div className="question_layout">
                    <strong>{post.title}</strong>
                    <div className="question_thumb">
                      {post.imageBadge ? <span>{post.imageBadge}</span> : null}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="feed_images">
                      <div />
                      <div />
                    </div>
                    <strong>{post.title}</strong>
                  </>
                )}

                <p>{post.body}</p>

                <div className="feed_actions">
                  <span>♡ 847</span>
                  <span>💬 124</span>
                  <span>↗</span>
                  <span>🔖</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
