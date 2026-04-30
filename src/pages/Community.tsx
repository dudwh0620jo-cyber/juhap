import { useState } from "react"
import { Link } from "react-router"
import "../styles/community.css"

type TopTabKey = "ranking" | "feed"
type FilterKey = "review" | "question" | "popular" | "follow"
type PostLayout = "default" | "question"

type CommunityPost = {
  id: number
  author: string
  profile?: string
  pairing: string
  body: string
  likes: number
  comments: number
  layout: PostLayout
  imageCountBadge?: string
}

type RankingItem = {
  id: number
  rank: number
  pair: string
  category: string
  score: number
  votes: number
  delta: string
}

const postsByFilter: Record<FilterKey, CommunityPost[]> = {
  review: [
    {
      id: 1,
      author: "A씨",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
      pairing: "진로이즈백 + 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      likes: 847,
      comments: 124,
      layout: "default",
    },
    {
      id: 2,
      author: "A씨",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
      pairing: "한라산 + 방어회",
      body: "방어회 어쩌구저쩌구 방어회 어쩌구저쩌구 방어회 어쩌구저쩌구 방어회 어쩌구저쩌구",
      likes: 722,
      comments: 98,
      layout: "default",
    },
  ],
  question: [
    {
      id: 11,
      author: "A씨",
      pairing: "케이머스 나파 밸리 드셔보신 분???",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      likes: 847,
      comments: 124,
      layout: "question",
      imageCountBadge: "5+",
    },
    {
      id: 12,
      author: "A씨",
      pairing: "케이머스 나파 밸리 드셔보신 분???",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      likes: 847,
      comments: 124,
      layout: "question",
    },
    {
      id: 13,
      author: "A씨",
      pairing: "케이머스 나파 밸리 드셔보신 분???",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      likes: 847,
      comments: 124,
      layout: "question",
    },
  ],
  popular: [
    {
      id: 21,
      author: "A씨",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
      pairing: "장생 막걸리 + 해물파전",
      body: "해물파전 해물파전 해물파전 맛있겠다 김치전 바삭전 감자전 막걸리 밸런스 좋아요",
      likes: 847,
      comments: 124,
      layout: "default",
    },
    {
      id: 22,
      author: "A씨",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
      pairing: "진로이즈백 + 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      likes: 847,
      comments: 124,
      layout: "default",
    },
  ],
  follow: [
    {
      id: 31,
      author: "A씨",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
      pairing: "진로이즈백 + 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      likes: 847,
      comments: 124,
      layout: "default",
    },
    {
      id: 32,
      author: "A씨",
      profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
      pairing: "진로이즈백 + 삼겹살",
      body: "삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
      likes: 847,
      comments: 124,
      layout: "default",
    },
  ],
}

const rankingData: RankingItem[] = [
  {
    id: 1,
    rank: 4,
    pair: "카스 맥주 + 치킨",
    category: "맥주",
    score: 94.1,
    votes: 7621,
    delta: "-1",
  },
  {
    id: 2,
    rank: 5,
    pair: "화요 25 + 회무침",
    category: "전통주",
    score: 92.7,
    votes: 5432,
    delta: "+5",
  },
  {
    id: 3,
    rank: 6,
    pair: "샴페인 + 굴",
    category: "와인",
    score: 91.3,
    votes: 4218,
    delta: "+2",
  },
  {
    id: 4,
    rank: 7,
    pair: "테라 맥주 + 떡볶이",
    category: "맥주",
    score: 90,
    votes: 3891,
    delta: "-2",
  },
]

export default function Community() {
  const [topTab, setTopTab] = useState<TopTabKey>("feed")
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("question")
  const posts = postsByFilter[selectedFilter]

  return (
    <section className="community-page page-screen" aria-label="커뮤니티">
      <header className="community-header">
        <div className="community-tabs" aria-label="커뮤니티 보기 방식">
          <button
            type="button"
            className={topTab === "ranking" ? "is-active" : ""}
            onClick={() => setTopTab("ranking")}
          >
            랭킹
          </button>
          <button
            type="button"
            className={topTab === "feed" ? "is-active" : ""}
            onClick={() => setTopTab("feed")}
          >
            피드
          </button>
        </div>

        <button type="button" className="search-button" aria-label="검색">
          <span />
        </button>
      </header>

      {topTab === "feed" ? (
        <>
          <div className="filter-row" aria-label="피드 필터">
            {[
              { key: "review" as const, label: "후기" },
              { key: "question" as const, label: "질문" },
              { key: "popular" as const, label: "인기" },
              { key: "follow" as const, label: "팔로우" },
            ].map((filter) => (
              <button
                type="button"
                className={selectedFilter === filter.key ? "is-selected" : ""}
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
            <button type="button" className="filter-more" aria-label="필터 더보기">
              <span />
            </button>
          </div>

          <div className="post-list">
            {posts.map((post) => (
              <article
                className={
                  post.layout === "question"
                    ? "community-post community-post--question"
                    : "community-post"
                }
                key={post.id}
              >
                <div className="post-author">
                  <div className="avatar" aria-hidden="true" />
                  <div>
                    <h2>{post.author}</h2>
                    {post.profile ? <p>{post.profile}</p> : null}
                  </div>
                  <button type="button">팔로우하기</button>
                </div>

                {post.layout === "default" ? (
                  <div className="post-images" aria-label="게시글 이미지">
                    <div />
                    <div />
                  </div>
                ) : (
                  <div className="post-question-layout">
                    <h3>{post.pairing}</h3>
                    <div className="question-thumbnail" aria-label="게시글 이미지">
                      {post.imageCountBadge ? (
                        <span className="question-badge">{post.imageCountBadge}</span>
                      ) : null}
                    </div>
                  </div>
                )}

                {post.layout === "default" ? <h3>{post.pairing}</h3> : null}
                <p className="post-body">{post.body}</p>

                <div className="post-actions">
                  <span className="action-like" aria-label={`좋아요 ${post.likes}`}>
                    {post.likes}
                  </span>
                  <span className="action-comment" aria-label={`댓글 ${post.comments}`}>
                    {post.comments}
                  </span>
                  <button type="button" className="action-share" aria-label="공유" />
                  <button
                    type="button"
                    className="action-bookmark"
                    aria-label="북마크"
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <section className="ranking-page" aria-label="랭킹">
          <div className="ranking-periods">
            {["주간", "일간", "월간", "전체"].map((period, index) => (
              <button className={index === 0 ? "is-period-active" : ""} key={period}>
                {period}
              </button>
            ))}
          </div>

          <div className="ranking-tags">
            {["전체", "와인", "증류주", "맥주", "위스키", "전통주"].map((tag, index) => (
              <button className={index === 0 ? "is-tag-active" : ""} key={tag}>
                {tag}
              </button>
            ))}
          </div>

          <article className="ranking-podium">
            <Link className="podium-item podium-item--second" to="/community/ranking/2">
              <span className="podium-rank">2</span>
              <div className="podium-thumb" />
              <strong>진로 이즈백</strong>
              <p>삼겹살</p>
              <em>97.2</em>
            </Link>
            <Link className="podium-item podium-item--first" to="/community/ranking/1">
              <span className="podium-rank">1</span>
              <div className="podium-thumb" />
              <strong>막걸리</strong>
              <p>해물파전</p>
              <em>98.4</em>
            </Link>
            <Link className="podium-item podium-item--third" to="/community/ranking/3">
              <span className="podium-rank">3</span>
              <div className="podium-thumb is-bottle" />
              <strong>레드 와인</strong>
              <p>스테이크</p>
              <em>95.8</em>
            </Link>
          </article>

          <div className="ranking-list">
            {rankingData.map((item) => (
              <Link className="ranking-row" key={item.id} to={`/community/ranking/${item.id}`}>
                <strong className="row-rank">{item.rank}</strong>
                <div className="row-images">
                  <span />
                  <span />
                </div>
                <div className="row-text">
                  <h3>{item.pair}</h3>
                  <p>
                    ★ {item.score} · {item.votes.toLocaleString()}표
                  </p>
                </div>
                <span className={`row-delta ${item.delta.startsWith("-") ? "is-down" : ""}`}>
                  {item.delta}
                </span>
                <span className="row-category">{item.category}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
