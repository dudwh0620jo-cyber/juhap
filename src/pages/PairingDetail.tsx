import { useLayoutEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import "../styles/pairing-detail.css"

const COMMUNITY_FOLLOWED_USERS_KEY = "community_followed_user_ids"

type CommentItem = {
  id: number
  userId: number
  userName: string
  userMeta: string
  text: string
}

const initialComments: CommentItem[] = [
  {
    id: 1,
    userId: 2001,
    userName: "민지",
    userMeta: "서울 · 30대",
    text: "이 조합 진짜 맛있겠는데요. 저장해둘게요!",
  },
  { id: 2, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "다음 주말 메뉴로 그대로 따라가 볼게요." },
  {
    id: 3,
    userId: 2104,
    userName: "수빈",
    userMeta: "제주 · 30대",
    text: "스테이크랑은 레드/드라이가 역시 정답 같아요.",
  },
  { id: 4, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "오늘 저녁에 바로 도전합니다." },
]

type PairingDetailNavState = {
  pairingTitle?: string
  authorId?: number
  authorName?: string
  profile?: string
  source?: "feed" | "ranking"
}

export default function PairingDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pairingId } = useParams()
  const [commentValue, setCommentValue] = useState("")
  const [commentItems, setCommentItems] = useState<CommentItem[]>(initialComments)

  const navState = (location.state ?? {}) as PairingDetailNavState
  const pairingTitle = navState.pairingTitle?.trim() || `페어링 #${pairingId ?? ""}`.trim()
  const authorName = navState.authorName?.trim() || "익명"
  const profile = navState.profile?.trim() || "20대 / 서울"
  const currentUser = { id: 9999, name: "나", meta: "서울 · 20대" }
  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(() => {
    try {
      const raw = window.localStorage.getItem(COMMUNITY_FOLLOWED_USERS_KEY)
      if (!raw) {
        return new Set()
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return new Set()
      }
      return new Set(parsed.filter((value): value is number => typeof value === "number" && Number.isFinite(value)))
    } catch {
      return new Set()
    }
  })

  const authorId = typeof navState.authorId === "number" ? navState.authorId : null
  const isFollowing = authorId !== null && followedUserIds.has(authorId)

  const userPairingTiersById: Record<number, 1 | 2 | 3 | 4 | 5> = {
    2001: 2,
    2002: 3,
    2003: 4,
    2004: 2,
    2019: 3,
    2025: 2,
    2101: 1,
    2102: 2,
    2103: 2,
    2104: 3,
    9999: 1,
  }

  const getTierClassName = (tier: number | undefined) => {
    if (tier === 5) return "user_grade_badge is_tier5"
    if (tier === 4) return "user_grade_badge is_tier4"
    if (tier === 3) return "user_grade_badge is_tier3"
    if (tier === 2) return "user_grade_badge is_tier2"
    if (tier === 1) return "user_grade_badge is_tier1"
    return "user_grade_badge"
  }

  const pairingTierLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: "뉴비 맛잘알",
    2: "찐조합러",
    3: "미식 탐험가",
    4: "페어링 고수",
    5: "조합 장인",
  }

  const getTierLabel = (tier: number | undefined) => {
    if (tier === 1 || tier === 2 || tier === 3 || tier === 4 || tier === 5) {
      return pairingTierLabels[tier]
    }
    return pairingTierLabels[1]
  }

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

    setCommentItems((prevItems) => [
      ...prevItems,
      {
        id: nextId,
        userId: currentUser.id,
        userName: currentUser.name,
        userMeta: currentUser.meta,
        text: trimmedValue,
      },
    ])
    setCommentValue("")
  }

  const toggleFollow = () => {
    if (authorId === null) {
      return
    }
    setFollowedUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(authorId)) {
        next.delete(authorId)
      } else {
        next.add(authorId)
      }
      try {
        window.localStorage.setItem(COMMUNITY_FOLLOWED_USERS_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  return (
    <section className="pairing_detail_page page_screen" aria-label="페어링 상세">
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
          <h1>
            {authorName}{" "}
            {typeof navState.authorId === "number" ? (
              <span className={getTierClassName(userPairingTiersById[navState.authorId])}>
                {getTierLabel(userPairingTiersById[navState.authorId])}
              </span>
            ) : null}
          </h1>
          <p>{profile}</p>
          <span className="detail_location">커뮤니티</span>
        </div>
        <button
          type="button"
          className={isFollowing ? "follow_button is_active" : "follow_button"}
          aria-pressed={isFollowing}
          disabled={authorId === null}
          onClick={toggleFollow}
        >
          {isFollowing ? "언팔로우" : "팔로우"}
        </button>
      </header>

      <div className="detail_images" aria-label="페어링 이미지">
        <div />
        <div />
      </div>

      <h2>{pairingTitle}</h2>
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
              <h4>
                {item.userName} <span className="comment_meta">{item.userMeta}</span>
                <span className={getTierClassName(userPairingTiersById[item.userId])}>
                  {getTierLabel(userPairingTiersById[item.userId])}
                </span>
              </h4>
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
