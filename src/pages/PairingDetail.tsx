import { useLayoutEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useLocation, useNavigate } from "react-router"
import "../styles/ranking-detail.css"

type CommentItem = {
  id: number
  name: string
  text: string
}

const initialComments: CommentItem[] = [
  { id: 1, name: "A씨", text: "이 조합 진짜 맛있겠는데 좋아요" },
  { id: 2, name: "A씨", text: "다음 와인 메뉴로 그대로 따라가볼게요" },
  { id: 3, name: "A씨", text: "스테이크랑 조합이 맞는 것 같아요" },
  { id: 4, name: "A씨", text: "주말에 꼭 도전해보겠습니다." },
]

export default function PairingDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [commentValue, setCommentValue] = useState("")
  const [commentItems, setCommentItems] = useState<CommentItem[]>(initialComments)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useLayoutEffect(() => {
    if (location.hash !== "#comments") {
      return
    }

    const target = document.getElementById("comments")
    if (!target) {
      return
    }

    target.scrollIntoView({ behavior: "auto", block: "start" })
  }, [location.hash])

  const nextId = useMemo(
    () => commentItems.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    [commentItems],
  )

  const handleSubmitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedValue = commentValue.trim()
    if (!trimmedValue) {
      return
    }

    setCommentItems((prevItems) => [...prevItems, { id: nextId, name: "나", text: trimmedValue }])
    setCommentValue("")
  }

  return (
    <section className="ranking_detail_page page_screen" aria-label="페어링 상세">
      <header className="detail_header">
        <button
          type="button"
          className="detail_back_button"
          aria-label="이전 페이지로 이동"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <div className="avatar" aria-hidden="true" />
        <div>
          <h1>A씨</h1>
          <p>30대 / 여 / 위스키, 와인 / 탄닌감 선호</p>
          <span className="detail_location">압구정 로데오</span>
        </div>
        <button type="button" className="follow_button">
          팔로우하기
        </button>
      </header>

      <div className="detail_images" aria-label="페어링 이미지">
        <div />
        <div />
      </div>

      <h2>진로토닉밤&amp; 삼겹살</h2>
      <div className="detail_tags">
        <span>2~3만원</span>
        <span>가볍고 상큼하게</span>
      </div>

      <p className="detail_text">
        삼겹살을 맛있게 구워먹을 때는, 소주 토닉처럼 산뜻한 하이볼류랑 조합이 정말 좋아요. 기름지지만
        깔끔하게 씻어줘서 계속 들어가는 페어링이에요.
      </p>

      <article className="detail_product_card">
        <div className="product_thumb" />
        <div className="product_text">
          <h3>케이머스 나파 밸리 카버네 소비뇽 2023</h3>
          <div>
            <span>레드와인</span>
            <span>산미</span>
            <span>8만원대</span>
          </div>
        </div>
        <button type="button" aria-label="제품 보기" onClick={() => navigate("/product/caymus-2023-1")}>
          →
        </button>
      </article>

      <article className="recommend_panel">
        <div className="recommend_icon">💬</div>
        <div>
          <h3>추천해요</h3>
          <p>이 조합이 좋았다면 추천을 눌러주세요</p>
          <strong>874</strong>
        </div>
      </article>

      <div className="detail_actions">
        <span>♡ 847</span>
        <span>💬 124</span>
        <span>↗</span>
        <span>🔖</span>
      </div>

      <h3 className="similar_title">유사한 분위기 조합 둘러보기</h3>
      <div className="similar_list">
        <article>
          <div className="similar_thumb" />
          <p>막걸리 + 전</p>
        </article>
        <article>
          <div className="similar_thumb" />
          <p>와인 + 치즈</p>
        </article>
      </div>

      <div className="comment_list" id="comments">
        {commentItems.map((item) => (
          <div className="comment_row" key={item.id}>
            <div className="avatar" />
            <div>
              <h4>{item.name}</h4>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form className="comment_input" onSubmit={handleSubmitComment}>
        <input
          className="comment_input_field"
          value={commentValue}
          onChange={(event) => setCommentValue(event.target.value)}
          placeholder="댓글을 입력해보세요"
          aria-label="댓글 입력"
        />
        <button type="submit" aria-label="댓글 등록">
          등록
        </button>
      </form>
    </section>
  )
}
