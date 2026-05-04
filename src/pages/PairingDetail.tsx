import { useLayoutEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import "../styles/pairing-detail.css"

const COMMUNITY_FOLLOWED_USERS_KEY = "community_followed_user_ids"
const getPairingCommentsStorageKey = (pairingId: string) => `pairing_detail_comments_${pairingId}`
const COMMUNITY_LIKED_POSTS_KEY = "community_liked_post_ids"
const getPairingRecommendStorageKey = (pairingId: string) => `pairing_detail_recommend_${pairingId}`

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
  locationLabel?: string
  drinkType?: string
  source?: "feed" | "ranking"
}

type SimilarPairingItem = {
  id: number
  pairingTitle: string
  authorId: number
  authorName: string
  profile: string
  locationLabel: string
  drinkType: string
}

const similarPairingsMock: SimilarPairingItem[] = [
  {
    id: 1002,
    pairingTitle: "막걸리 + 해물파전",
    authorId: 2001,
    authorName: "민지",
    profile: "20대 / 부산 / 전통주 입문",
    locationLabel: "부산",
    drinkType: "전통주",
  },
  {
    id: 1013,
    pairingTitle: "하이볼 + 치킨",
    authorId: 2002,
    authorName: "현우",
    profile: "20대 / 대전 / 맥주 러버",
    locationLabel: "대전",
    drinkType: "기타",
  },
  {
    id: 1014,
    pairingTitle: "소주토닉 하이볼 + 피자",
    authorId: 2102,
    authorName: "도윤",
    profile: "30대 / 대구 / 위스키 · 칵테일",
    locationLabel: "대구",
    drinkType: "기타",
  },
  {
    id: 1005,
    pairingTitle: "레드 와인 + 스테이크",
    authorId: 2001,
    authorName: "민지",
    profile: "30대 / 서울 / 와인 선호",
    locationLabel: "서울",
    drinkType: "와인",
  },
  {
    id: 1006,
    pairingTitle: "IPA + 햄버거",
    authorId: 2002,
    authorName: "현우",
    profile: "20대 / 대전 / 맥주 러버",
    locationLabel: "대전",
    drinkType: "맥주",
  },
  {
    id: 1007,
    pairingTitle: "소주 + 족발",
    authorId: 2101,
    authorName: "유나",
    profile: "20대 / 서울 / 소주 · 전통주",
    locationLabel: "서울",
    drinkType: "소주",
  },
  {
    id: 1008,
    pairingTitle: "사케 + 회",
    authorId: 2104,
    authorName: "수빈",
    profile: "30대 / 제주 / 와인 · 사케",
    locationLabel: "제주",
    drinkType: "사케",
  },
  {
    id: 1010,
    pairingTitle: "라거 + 감자튀김",
    authorId: 2103,
    authorName: "지민",
    profile: "20대 / 광주 / 맥주 · 페어링",
    locationLabel: "광주",
    drinkType: "맥주",
  },
]

type RecommendedProduct = {
  id: string
  name: string
  categoryLabel: string
  subLabel: string
  priceLabel: string
  route: string
}

const recommendedProductByDrinkType: Record<string, RecommendedProduct> = {
  소주: {
    id: "soju-jinro-classic-1",
    name: "참이슬 후레쉬",
    categoryLabel: "소주",
    subLabel: "17.0%",
    priceLabel: "4,500원~",
    route: "/product/soju-jinro-classic-1",
  },
  맥주: {
    id: "beer-cass-lager-1",
    name: "카스 프레시",
    categoryLabel: "맥주",
    subLabel: "라거",
    priceLabel: "3,900원~",
    route: "/product/beer-cass-lager-1",
  },
  와인: {
    id: "wine-cabernet-1",
    name: "카베르네 소비뇽",
    categoryLabel: "와인",
    subLabel: "레드",
    priceLabel: "29,000원~",
    route: "/product/wine-cabernet-1",
  },
  위스키: {
    id: "whisky-single-malt-1",
    name: "싱글몰트 위스키",
    categoryLabel: "위스키",
    subLabel: "싱글몰트",
    priceLabel: "79,000원~",
    route: "/product/whisky-single-malt-1",
  },
  전통주: {
    id: "tradition-makgeolli-1",
    name: "프리미엄 막걸리",
    categoryLabel: "전통주",
    subLabel: "막걸리",
    priceLabel: "9,900원~",
    route: "/product/tradition-makgeolli-1",
  },
  사케: {
    id: "sake-junmai-1",
    name: "준마이 사케",
    categoryLabel: "사케",
    subLabel: "준마이",
    priceLabel: "33,000원~",
    route: "/product/sake-junmai-1",
  },
  기타: {
    id: "etc-highball-can-1",
    name: "소주 토닉 하이볼(캔)",
    categoryLabel: "하이볼",
    subLabel: "소주토닉",
    priceLabel: "12,000원~",
    route: "/product/etc-highball-can-1",
  },
}

const priceRangeTagByDrinkType: Record<string, string> = {
  소주: "1만원 이하",
  맥주: "1만원 이하",
  와인: "2~5만원",
  위스키: "3~8만원",
  전통주: "1~3만원",
  사케: "2~5만원",
  기타: "1~3만원",
}

function PairingDetailContent(props: { pairingId: string | undefined; hash: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pairingId = props.pairingId
  const [commentValue, setCommentValue] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentValue, setEditingCommentValue] = useState("")

  const navState = (location.state ?? {}) as PairingDetailNavState
  const pairingTitle = navState.pairingTitle?.trim() || `페어링 #${pairingId ?? ""}`.trim()
  const drinkTypeLabel =
    navState.drinkType?.trim() ||
    (pairingTitle.includes("+") ? pairingTitle.split("+")[0]?.trim() : "")
  const authorName = navState.authorName?.trim() || "익명"
  const profile = navState.profile?.trim() || "20대 / 서울"
  const locationLabel = navState.locationLabel?.trim() || profile.split("/")?.[1]?.trim() || "서울"
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

  const [isRecommended, setIsRecommended] = useState(() => {
    if (!pairingId) return false
    try {
      const raw = window.localStorage.getItem(getPairingRecommendStorageKey(pairingId))
      if (!raw) return false
      const parsed = JSON.parse(raw) as { recommended?: boolean }
      return typeof parsed?.recommended === "boolean" ? parsed.recommended : false
    } catch {
      return false
    }
  })
  const [recommendCount, setRecommendCount] = useState(() => {
    if (!pairingId) return 874
    try {
      const raw = window.localStorage.getItem(getPairingRecommendStorageKey(pairingId))
      if (!raw) return 874
      const parsed = JSON.parse(raw) as { count?: number }
      return typeof parsed?.count === "number" && Number.isFinite(parsed.count) ? parsed.count : 874
    } catch {
      return 874
    }
  })
  const [isLiked, setIsLiked] = useState(() => {
    if (!pairingId) return false
    try {
      const rawLikes = window.localStorage.getItem(COMMUNITY_LIKED_POSTS_KEY)
      if (!rawLikes) return false
      const parsed = JSON.parse(rawLikes)
      return Array.isArray(parsed) ? parsed.includes(Number(pairingId)) : false
    } catch {
      return false
    }
  })
  const [likeCount, setLikeCount] = useState(847)

  const commentsStorageKey = useMemo(() => {
    return pairingId ? getPairingCommentsStorageKey(pairingId) : null
  }, [pairingId])

  const similarItems = useMemo(() => {
    const currentId = typeof pairingId === "string" ? Number(pairingId) : NaN
    const drinkHint = pairingTitle.split("+")[0]?.trim() ?? ""
    const drinkTypeHint = drinkTypeLabel || drinkHint
    const candidates = similarPairingsMock
      .filter((item) => item.id !== currentId)
      .sort((a, b) => (a.drinkType === drinkTypeHint ? -1 : 0) - (b.drinkType === drinkTypeHint ? -1 : 0))

    const prioritized = candidates.filter(
      (item) => item.pairingTitle.includes(drinkHint) || item.drinkType === drinkTypeHint,
    )
    const fallback = candidates.filter((item) => !prioritized.includes(item))
    return [...prioritized, ...fallback].slice(0, 2)
  }, [drinkTypeLabel, pairingId, pairingTitle])

  const recommendedProduct = useMemo(() => {
    if (drinkTypeLabel && recommendedProductByDrinkType[drinkTypeLabel]) {
      return recommendedProductByDrinkType[drinkTypeLabel]
    }
    return recommendedProductByDrinkType.기타
  }, [drinkTypeLabel])

  const [commentItems, setCommentItems] = useState<CommentItem[]>(() => {
    if (!pairingId) {
      return initialComments
    }
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      if (!raw) {
        return initialComments
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return initialComments
      }
      return parsed.filter(
        (item): item is CommentItem =>
          item &&
          typeof item === "object" &&
          typeof item.id === "number" &&
          typeof item.userId === "number" &&
          typeof item.userName === "string" &&
          typeof item.userMeta === "string" &&
          typeof item.text === "string",
      )
    } catch {
      return initialComments
    }
  })

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
    if (props.hash !== "#comments") {
      return
    }

    const target = document.getElementById("comments")
    if (!target) {
      return
    }

    target.scrollIntoView({ behavior: "auto", block: "start" })
  }, [props.hash])

  const nextId = useMemo(
    () => commentItems.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    [commentItems],
  )

  useLayoutEffect(() => {
    if (!commentsStorageKey) {
      return
    }
    try {
      window.localStorage.setItem(commentsStorageKey, JSON.stringify(commentItems))
    } catch {
      // ignore storage errors
    }
  }, [commentItems, commentsStorageKey])

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

  const startEditComment = (item: CommentItem) => {
    setEditingCommentId(item.id)
    setEditingCommentValue(item.text)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentValue("")
  }

  const confirmEditComment = () => {
    if (editingCommentId === null) {
      return
    }
    const trimmedValue = editingCommentValue.trim()
    if (!trimmedValue) {
      return
    }
    setCommentItems((prev) =>
      prev.map((item) => (item.id === editingCommentId ? { ...item, text: trimmedValue } : item)),
    )
    cancelEditComment()
  }

  const removeComment = (commentId: number) => {
    setCommentItems((prev) => prev.filter((item) => item.id !== commentId))
    if (editingCommentId === commentId) {
      cancelEditComment()
    }
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

  const toggleRecommend = () => {
    if (!pairingId) {
      return
    }
    const nextRecommended = !isRecommended
    setIsRecommended(nextRecommended)
    setRecommendCount((countPrev) => {
      const nextCount = Math.max(0, countPrev + (nextRecommended ? 1 : -1))
      try {
        window.localStorage.setItem(
          getPairingRecommendStorageKey(pairingId),
          JSON.stringify({ count: nextCount, recommended: nextRecommended }),
        )
      } catch {
        // ignore storage errors
      }
      return nextCount
    })
  }

  const toggleLike = () => {
    if (!pairingId) {
      return
    }
    const numericId = Number(pairingId)
    if (!Number.isFinite(numericId)) {
      return
    }

    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikeCount((countPrev) => Math.max(0, countPrev + (nextLiked ? 1 : -1)))
    try {
      const raw = window.localStorage.getItem(COMMUNITY_LIKED_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const set = new Set<number>(Array.isArray(parsed) ? parsed : [])
      if (nextLiked) {
        set.add(numericId)
      } else {
        set.delete(numericId)
      }
      window.localStorage.setItem(COMMUNITY_LIKED_POSTS_KEY, JSON.stringify(Array.from(set)))
    } catch {
      // ignore storage errors
    }
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
          <span className="detail_location">{locationLabel}</span>
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

      <div className="detail_images" aria-label="페어링 이미지(좌우 스와이프)">
        <div className="detail_image_item" />
        <div className="detail_image_item" />
      </div>

      <h2>{pairingTitle}</h2>
      <div className="detail_tags">
        <span>{priceRangeTagByDrinkType[drinkTypeLabel] ?? "1~3만원"}</span>
        <span>{drinkTypeLabel ? `${drinkTypeLabel} 추천` : "추천"}</span>
      </div>

      <p className="detail_text">
        삼겹살을 맛있게 구워먹을 때는, 소주 토닉처럼 산뜻한 하이볼류랑 조합이 정말 좋아요. 기름지지만
        깔끔하게 씻어줘서 계속 들어가는 페어링이에요.
      </p>

      <article className="detail_product_card">
        <div className="product_thumb" />
        <div className="product_text">
          <h3>{recommendedProduct.name}</h3>
          <div>
            <span>{recommendedProduct.categoryLabel}</span>
            <span>{recommendedProduct.subLabel}</span>
            <span>{recommendedProduct.priceLabel}</span>
          </div>
        </div>
        <button type="button" aria-label="제품 보기" onClick={() => navigate(recommendedProduct.route)}>
          →
        </button>
      </article>

      <article className="recommend_panel">
        <button
          type="button"
          className="recommend_button"
          aria-label="조합 추천"
          aria-pressed={isRecommended}
          onClick={toggleRecommend}
        >
          <div className="recommend_icon" aria-hidden="true">
            💬
          </div>
          <div>
            <h3>추천해요</h3>
            <p>이 조합이 좋으셨다면 추천을 눌러주세요</p>
            <strong>{recommendCount.toLocaleString()}</strong>
          </div>
        </button>
      </article>

      <div className="detail_actions" aria-label="액션">
        <button
          type="button"
          className={isLiked ? "detail_action_button is_active" : "detail_action_button"}
          aria-label="좋아요"
          aria-pressed={isLiked}
          onClick={toggleLike}
        >
          {isLiked ? "♥" : "♡"} <span>{likeCount}</span>
        </button>
        <button
          type="button"
          className="detail_action_button"
          aria-label="댓글 달기"
          onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          💬 <span>{commentItems.length}</span>
        </button>
        <button type="button" className="detail_action_button" aria-label="공유">
          ↗ 공유
        </button>
        <button type="button" className="detail_action_button" aria-label="북마크">
          🔖 저장
        </button>
      </div>

      <h3 className="similar_title">유사한 분위기 조합 둘러보기</h3>
      <div className="similar_list" aria-label="유사한 페어링 추천">
        {similarItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="similar_card"
            onClick={() => {
              navigate(`/community/pairing/${item.id}`, {
                state: {
                  pairingTitle: item.pairingTitle,
                  authorId: item.authorId,
                  authorName: item.authorName,
                  profile: item.profile,
                  locationLabel: item.locationLabel,
                  drinkType: item.drinkType,
                  source: "feed",
                } satisfies PairingDetailNavState,
              })
            }}
          >
            <div className="similar_thumb" aria-hidden="true" />
            <p>{item.pairingTitle}</p>
          </button>
        ))}
      </div>

      <div className="comment_list" id="comments">
        {commentItems.map((item) => (
          <div className="comment_row" key={item.id}>
            <div className="avatar" />
            <div>
              <div className="comment_header_row">
                <h4>
                  {item.userName} <span className="comment_meta">{item.userMeta}</span>
                  <span className={getTierClassName(userPairingTiersById[item.userId])}>
                    {getTierLabel(userPairingTiersById[item.userId])}
                  </span>
                </h4>
                {item.userId === currentUser.id ? (
                  <div className="comment_actions">
                    <button type="button" onClick={() => startEditComment(item)}>
                      수정
                    </button>
                    <button type="button" onClick={() => removeComment(item.id)}>
                      삭제
                    </button>
                  </div>
                ) : null}
              </div>

              {editingCommentId === item.id ? (
                <div className="comment_edit_shell">
                  <input
                    className="comment_edit_input"
                    value={editingCommentValue}
                    onChange={(event) => setEditingCommentValue(event.target.value)}
                    aria-label="댓글 수정"
                  />
                  <div className="comment_edit_actions">
                    <button type="button" onClick={cancelEditComment}>
                      취소
                    </button>
                    <button type="button" className="is_primary" onClick={confirmEditComment}>
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <p>{item.text}</p>
              )}
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

export default function PairingDetail() {
  const location = useLocation()
  const { pairingId } = useParams()
  return <PairingDetailContent key={pairingId ?? "pairing"} pairingId={pairingId} hash={location.hash} />
}
