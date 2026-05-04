import { useLayoutEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import CommentSection from "../components/CommentSection"
import DetailActions from "../components/DetailActions"
import PairingDetailHeader from "../components/PairingDetailHeader"
import SimilarPairingList, { type SimilarPairingItem } from "../components/SimilarPairingList"
import "../styles/pairing-detail.css"

const COMMUNITY_FOLLOWED_USERS_KEY = "community_followed_user_ids"
const COMMUNITY_LIKED_POSTS_KEY = "community_liked_post_ids"
const getPairingCommentsStorageKey = (pairingId: string) => `pairing_detail_comments_${pairingId}`

type PairingDetailNavState = {
  pairingTitle?: string
  authorId?: number
  authorName?: string
  profile?: string
  locationLabel?: string
  drinkType?: string
  source?: "feed" | "ranking"
}

const similarPairingsMock: SimilarPairingItem[] = [
  { id: 1002, pairingTitle: "막걸리 + 해물파전", authorId: 2001, authorName: "민지", profile: "20대 / 부산 / 전통주 입문", locationLabel: "비 오는 베란다", drinkType: "전통주" },
  { id: 1013, pairingTitle: "하이볼 + 치킨", authorId: 2002, authorName: "현우", profile: "20대 / 대전 / 맥주 러버", locationLabel: "자주가는 바", drinkType: "기타" },
  { id: 1014, pairingTitle: "소주토닉 하이볼 + 피자", authorId: 2102, authorName: "도윤", profile: "30대 / 대구 / 위스키 · 칵테일", locationLabel: "게임 켜둔 거실", drinkType: "기타" },
  { id: 1005, pairingTitle: "레드 와인 + 스테이크", authorId: 2001, authorName: "민지", profile: "30대 / 서울 / 와인 선호", locationLabel: "아늑한 우리집", drinkType: "와인" },
  { id: 1006, pairingTitle: "IPA + 햄버거", authorId: 2002, authorName: "현우", profile: "20대 / 대전 / 맥주 러버", locationLabel: "햇살 드는 거실", drinkType: "맥주" },
  { id: 1007, pairingTitle: "소주 + 족발", authorId: 2101, authorName: "유나", profile: "20대 / 서울 / 소주 · 전통주", locationLabel: "우리집 야식상", drinkType: "소주" },
  { id: 1008, pairingTitle: "사케 + 회", authorId: 2104, authorName: "수빈", profile: "30대 / 제주 / 와인 · 사케", locationLabel: "작은 주방 테이블", drinkType: "사케" },
  { id: 1010, pairingTitle: "라거 + 감자튀김", authorId: 2103, authorName: "지민", profile: "20대 / 광주 / 맥주 · 페어링", locationLabel: "퇴근 후 소파 앞", drinkType: "맥주" },
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
  소주: { id: "soju-jinro-classic-1", name: "참이슬 후레쉬", categoryLabel: "소주", subLabel: "17.0%", priceLabel: "4,500원~", route: "/product/soju-jinro-classic-1" },
  맥주: { id: "beer-cass-lager-1", name: "카스 프레시", categoryLabel: "맥주", subLabel: "라거", priceLabel: "3,900원~", route: "/product/beer-cass-lager-1" },
  와인: { id: "wine-cabernet-1", name: "카베르네 소비뇽", categoryLabel: "와인", subLabel: "레드", priceLabel: "29,000원~", route: "/product/wine-cabernet-1" },
  위스키: { id: "whisky-single-malt-1", name: "싱글몰트 위스키", categoryLabel: "위스키", subLabel: "싱글몰트", priceLabel: "79,000원~", route: "/product/whisky-single-malt-1" },
  전통주: { id: "tradition-makgeolli-1", name: "프리미엄 막걸리", categoryLabel: "전통주", subLabel: "막걸리", priceLabel: "9,900원~", route: "/product/tradition-makgeolli-1" },
  사케: { id: "sake-junmai-1", name: "준마이 사케", categoryLabel: "사케", subLabel: "준마이", priceLabel: "33,000원~", route: "/product/sake-junmai-1" },
  기타: { id: "etc-highball-can-1", name: "소주 토닉 하이볼(캔)", categoryLabel: "하이볼", subLabel: "소주토닉", priceLabel: "12,000원~", route: "/product/etc-highball-can-1" },
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

const userPairingTiersById: Record<number, 1 | 2 | 3 | 4 | 5> = {
  2001: 2, 2002: 3, 2003: 4, 2004: 2, 2019: 3, 2025: 2,
  2101: 1, 2102: 2, 2103: 2, 2104: 3, 9999: 1,
}

const pairingTierLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "테이스터", 2: "셀렉터", 3: "큐레이터", 4: "소믈리에", 5: "마스터",
}

const getTierClassName = (tier: number | undefined) => {
  if (tier === 5) return "user_grade_badge is_tier5"
  if (tier === 4) return "user_grade_badge is_tier4"
  if (tier === 3) return "user_grade_badge is_tier3"
  if (tier === 2) return "user_grade_badge is_tier2"
  if (tier === 1) return "user_grade_badge is_tier1"
  return "user_grade_badge"
}

const getTierLabel = (tier: number | undefined) => {
  if (tier === 1 || tier === 2 || tier === 3 || tier === 4 || tier === 5) return pairingTierLabels[tier]
  return pairingTierLabels[1]
}

const getTierClassNameByUserId = (userId: number) => getTierClassName(userPairingTiersById[userId])
const getTierLabelByUserId = (userId: number) => getTierLabel(userPairingTiersById[userId])

const currentUser = { id: 9999, name: "나", meta: "서울 · 20대" }

export default function PairingDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pairingId } = useParams()

  const navState = (location.state ?? {}) as PairingDetailNavState
  const pairingTitle = navState.pairingTitle?.trim() || `페어링 #${pairingId ?? ""}`.trim()
  const drinkTypeLabel =
    navState.drinkType?.trim() ||
    (pairingTitle.includes("+") ? pairingTitle.split("+")[0]?.trim() : "")
  const authorName = navState.authorName?.trim() || "익명"
  const profile = navState.profile?.trim() || "20대 / 서울"
  const locationLabel = navState.locationLabel?.trim() || "아늑한 내방"

  const authorId = typeof navState.authorId === "number" ? navState.authorId : null
  const authorTier = authorId !== null ? userPairingTiersById[authorId] : undefined

  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(() => {
    try {
      const raw = window.localStorage.getItem(COMMUNITY_FOLLOWED_USERS_KEY)
      if (!raw) return new Set()
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return new Set()
      return new Set(parsed.filter((value): value is number => typeof value === "number" && Number.isFinite(value)))
    } catch {
      return new Set()
    }
  })

  const isFollowing = authorId !== null && followedUserIds.has(authorId)

  const [isLiked, setIsLiked] = useState(() => {
    if (!pairingId) return false
    try {
      const raw = window.localStorage.getItem(COMMUNITY_LIKED_POSTS_KEY)
      if (!raw) return false
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.includes(Number(pairingId)) : false
    } catch { return false }
  })
  const [likeCount, setLikeCount] = useState(847)
  const [commentCount, setCommentCount] = useState(() => {
    if (!pairingId) return 4
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      if (!raw) return 4
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.length : 4
    } catch { return 4 }
  })

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

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useLayoutEffect(() => {
    if (location.hash !== "#comments") return
    const target = document.getElementById("comments")
    if (!target) return
    target.scrollIntoView({ behavior: "auto", block: "start" })
  }, [location.hash])

  const toggleFollow = () => {
    if (authorId === null) return
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

  const toggleLike = () => {
    if (!pairingId) return
    const numericId = Number(pairingId)
    if (!Number.isFinite(numericId)) return
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
      <PairingDetailHeader
        authorName={authorName}
        profile={profile}
        locationLabel={locationLabel}
        tierClassName={getTierClassName(authorTier)}
        tierLabel={getTierLabel(authorTier)}
        showTier={authorId !== null}
        isFollowing={isFollowing}
        followDisabled={authorId === null}
        onBack={() => navigate(-1)}
        onToggleFollow={toggleFollow}
      />

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

      <DetailActions
        isLiked={isLiked}
        likeCount={likeCount}
        commentCount={commentCount}
        onToggleLike={toggleLike}
        onScrollToComments={() =>
          document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />

      <SimilarPairingList
        items={similarItems}
        onSelect={(item) =>
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
        }
      />

      <CommentSection
        pairingId={pairingId}
        currentUser={currentUser}
        getTierClassName={getTierClassNameByUserId}
        getTierLabel={getTierLabelByUserId}
        onCountChange={setCommentCount}
      />
    </section>
  )
}
