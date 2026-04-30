import { useParams } from "react-router"
import "../styles/ranking-detail.css"

const mockDetail = {
  author: "A씨",
  profile: "30대 / 여 / 위스키, 와인 / 탄닌감 선호",
  location: "아늑한 우리집",
  title: "진로이즈백 & 삼겹살",
  tags: ["2~3만원", "퇴근하고 편하게"],
  body:
    "삼겹살 맛있겠냐어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 삼겹구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구",
  likes: 847,
  comments: 124,
}

export default function RankingDetail() {
  const { rankId } = useParams()

  return (
    <section className="ranking-detail-page page-screen" aria-label="랭킹 글 상세">
      <header className="detail-author">
        <div className="avatar" aria-hidden="true" />
        <div>
          <h1>{mockDetail.author}</h1>
          <p>{mockDetail.profile}</p>
          <span className="detail-location">{mockDetail.location}</span>
        </div>
        <button type="button">팔로우하기</button>
      </header>

      <div className="detail-images" aria-label="랭킹 이미지">
        <div />
        <div />
      </div>

      <h2>{mockDetail.title}</h2>
      <div className="detail-tags">
        {mockDetail.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <p className="detail-body">{mockDetail.body}</p>

      <article className="detail-product">
        <div className="product-thumb" />
        <div className="product-text">
          <h3>케이머스 나파 밸리 카베네 소비뇽 2023</h3>
          <div>
            <span>레드와인</span>
            <span>산미</span>
            <span>8만원대</span>
          </div>
        </div>
        <button type="button" aria-label="상품 보기">
          →
        </button>
      </article>

      <article className="detail-recommend">
        <div className="recommend-icon">👍</div>
        <div>
          <h3>추천해요</h3>
          <p>조합에 도전해보셨나요? 추천하시나요?</p>
          <strong>874</strong>
        </div>
      </article>

      <div className="detail-actions">
        <span className="action-like">{mockDetail.likes}</span>
        <span className="action-comment">{mockDetail.comments}</span>
        <button type="button" className="action-share" aria-label="공유" />
        <button type="button" className="action-bookmark" aria-label="북마크" />
      </div>

      <h3 className="similar-title">유사한 입맛의 조합 둘러보기</h3>
      <div className="similar-list">
        <article>
          <div className="similar-thumb" />
          <p>막걸리 + 해물파전</p>
        </article>
        <article>
          <div className="similar-thumb" />
          <p>막걸리 + 해물파전</p>
        </article>
      </div>

      <div className="comment-list">
        {[1, 2, 3, 4].map((item) => (
          <div className="comment-row" key={item}>
            <div className="avatar" aria-hidden="true" />
            <div>
              <h4>A씨</h4>
              <p>와 이거 진짜 맛있겠다 좋아요</p>
            </div>
          </div>
        ))}
      </div>

      <div className="comment-input" aria-label={`댓글 입력 ${rankId ?? ""}`}>
        <span>댓글을 남겨보세요</span>
        <button type="button" aria-label="댓글 작성">
          ○
        </button>
      </div>
    </section>
  )
}
