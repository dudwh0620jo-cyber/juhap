import "../styles/ranking-detail.css"

const commentItems = [1, 2, 3, 4]

export default function RankingDetail() {
  return (
    <section className="ranking_detail_page page_screen" aria-label="랭킹 상세">
      <header className="detail_header">
        <div className="avatar" aria-hidden="true" />
        <div>
          <h1>A씨</h1>
          <p>30대 / 여 / 위스키, 와인 / 탄닌감 선호</p>
          <span className="detail_location">아늑한 우리집</span>
        </div>
        <button type="button">팔로우하기</button>
      </header>

      <div className="detail_images" aria-label="랭킹 이미지">
        <div />
        <div />
      </div>

      <h2>진로이즈백 &amp; 삼겹살</h2>
      <div className="detail_tags">
        <span>2~3만원</span>
        <span>퇴근하고 편하게</span>
      </div>

      <p className="detail_text">
        삼겹살 맛있겠냐어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 삼겹구저쩌구 삼겹살 어쩌구저쩌구
        삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구 삼겹살 어쩌구저쩌구
      </p>

      <article className="detail_product_card">
        <div className="product_thumb" />
        <div className="product_text">
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

      <article className="recommend_panel">
        <div className="recommend_icon">👍</div>
        <div>
          <h3>추천해요</h3>
          <p>조합에 도전해보셨나요? 추천하시나요?</p>
          <strong>874</strong>
        </div>
      </article>

      <div className="detail_actions">
        <span>♡ 847</span>
        <span>💬 124</span>
        <span>↗</span>
        <span>🔖</span>
      </div>

      <h3 className="similar_title">유사한 입맛의 조합 둘러보기</h3>
      <div className="similar_list">
        <article>
          <div className="similar_thumb" />
          <p>막걸리 해물파전</p>
        </article>
        <article>
          <div className="similar_thumb" />
          <p>막걸리 해물파전</p>
        </article>
      </div>

      <div className="comment_list">
        {commentItems.map((item) => (
          <div className="comment_row" key={item}>
            <div className="avatar" />
            <div>
              <h4>A씨</h4>
              <p>와 이거 진짜 맛있겠다 좋아요</p>
            </div>
          </div>
        ))}
      </div>

      <div className="comment_input">
        <span>댓글을 남겨보세요</span>
        <button type="button" aria-label="댓글 쓰기">
          💬
        </button>
      </div>
    </section>
  )
}
