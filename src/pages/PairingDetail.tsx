import { useLayoutEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import CategoryItemCard, { type CategoryListItem } from "../components/CategoryItemCard"
import CommentSection from "../components/CommentSection"
import FeedActions from "../components/FeedActions"
import PairingDetailHeader from "../components/PairingDetailHeader"
import SimilarPairingList, { type SimilarPairingItem } from "../components/SimilarPairingList"
import "../styles/category-list.css"
import "../styles/community.css"
import "../styles/pairing-detail.css"
import { extractPairingTitle, feedPosts, getPairingTagsFromTitle } from "../utils/communityPosts"
import {
  COMMUNITY_BOOKMARKED_POSTS_KEY,
  COMMUNITY_FOLLOWED_USERS_KEY,
  COMMUNITY_LIKED_POSTS_KEY,
  getPairingCommentsStorageKey,
} from "../utils/communityStorage"
import {
  getPairingTierByUserId,
  getPairingTierLabel,
  getPairingTierLabelByUserId,
  getUserGradeBadgeClassNameByTier,
  getUserGradeBadgeClassNameByUserId,
} from "../utils/pairingTier"
import { useStoredBooleanRecordFromIds } from "../utils/storage"
import { currentUserMock, usersMockById } from "../utils/usersMock"

type PairingDetailNavState = {
  pairingTitle?: string
  body?: string
  authorId?: number
  authorName?: string
  profile?: string
  locationLabel?: string
  drinkType?: string
  source?: "feed" | "ranking" | "free"
}

type RecommendedProduct = {
  id: string
  name: string
  categoryLabel: string
  subLabel: string
  priceLabel: string
}

const recommendedProductByDrinkType: Record<string, RecommendedProduct> = {
  소주: { id: "soju-jinro-classic-1", name: "참이슬 오리지널", categoryLabel: "소주", subLabel: "17.0%", priceLabel: "4,500원" },
  맥주: { id: "beer-cass-lager-1", name: "카스 라거", categoryLabel: "맥주", subLabel: "라거", priceLabel: "3,900원" },
  와인: { id: "wine-cabernet-1", name: "카베르네 소비뇽", categoryLabel: "와인", subLabel: "레드", priceLabel: "29,000원" },
  위스키: { id: "whisky-single-malt-1", name: "싱글몰트 위스키", categoryLabel: "위스키", subLabel: "싱글몰트", priceLabel: "79,000원" },
  전통주: { id: "tradition-makgeolli-1", name: "프리미엄 막걸리", categoryLabel: "전통주", subLabel: "막걸리", priceLabel: "9,900원" },
  사케: { id: "sake-junmai-1", name: "준마이 사케", categoryLabel: "사케", subLabel: "준마이", priceLabel: "33,000원" },
  기타: { id: "etc-highball-can-1", name: "하이볼 캔", categoryLabel: "기타", subLabel: "하이볼", priceLabel: "12,000원" },
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

const currentUser = currentUserMock

export default function PairingDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pairingId } = useParams()

  const navState = (location.state ?? {}) as PairingDetailNavState
  const numericId = typeof pairingId === "string" ? Number(pairingId) : NaN
  const post = useMemo(
    () => (Number.isFinite(numericId) ? feedPosts.find((item) => item.id === numericId) : undefined),
    [numericId],
  )

  const pairingTitle = useMemo(() => {
    if (navState.pairingTitle?.trim()) return navState.pairingTitle.trim()
    if (post?.title) return extractPairingTitle(post.title)
    return `페어링 #${pairingId ?? ""}`.trim()
  }, [navState.pairingTitle, pairingId, post?.title])

  const drinkTypeLabel =
    navState.drinkType?.trim() ||
    post?.drinkType?.trim() ||
    (pairingTitle.includes("+") ? pairingTitle.split("+")[0]?.trim() : "")

  const authorId =
    typeof navState.authorId === "number" ? navState.authorId : typeof post?.authorId === "number" ? post.authorId : null
  const authorMock = authorId !== null ? usersMockById[authorId] : undefined
  const authorName = authorMock?.name || navState.authorName?.trim() || "익명"
  const profile = authorMock?.profile || navState.profile?.trim() || "20대 / 서울"
  const locationLabel = navState.locationLabel?.trim() || post?.locationLabel?.trim() || "어딘가"
  const detailBodyText = navState.body?.trim() || post?.body?.trim() || ""
  const authorTier = authorId !== null ? getPairingTierByUserId(authorId) : undefined

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
    } catch {
      return false
    }
  })

  const numericPostId = typeof pairingId === "string" ? Number(pairingId) : NaN
  const { value: bookmarkedById, toggle: toggleBookmark } = useStoredBooleanRecordFromIds(
    COMMUNITY_BOOKMARKED_POSTS_KEY,
  )
  const isBookmarked = Number.isFinite(numericPostId) ? Boolean(bookmarkedById[numericPostId]) : false

  const [likeCount, setLikeCount] = useState(847)
  const [commentCount, setCommentCount] = useState(() => {
    if (!pairingId) return 4
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      if (!raw) return 4
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.length : 4
    } catch {
      return 4
    }
  })

  const similarItems = useMemo(() => {
    const currentId = typeof pairingId === "string" ? Number(pairingId) : NaN
    const drinkHint = pairingTitle.split("+")[0]?.trim() ?? ""
    const drinkTypeHint = drinkTypeLabel || drinkHint

    const candidates = feedPosts
      .filter((item) => item.id !== currentId && !item.isQna)
      .map(
        (item) =>
          ({
            id: item.id,
            pairingTitle: extractPairingTitle(item.title),
            authorId: item.authorId,
            authorName: usersMockById[item.authorId]?.name ?? "익명",
            profile: usersMockById[item.authorId]?.profile ?? "",
            locationLabel: item.locationLabel ?? "",
            drinkType: item.drinkType ?? "기타",
          }) satisfies SimilarPairingItem,
      )
      .sort((a, b) => (a.drinkType === drinkTypeHint ? -1 : 0) - (b.drinkType === drinkTypeHint ? -1 : 0))

    return candidates.slice(0, 2)
  }, [drinkTypeLabel, pairingId, pairingTitle])

  const recommendedProduct = useMemo(() => {
    if (drinkTypeLabel && recommendedProductByDrinkType[drinkTypeLabel]) {
      return recommendedProductByDrinkType[drinkTypeLabel]
    }
    return recommendedProductByDrinkType.기타
  }, [drinkTypeLabel])

  const { liquorTag, foodTag } = useMemo(() => {
    if (post?.title) return getPairingTagsFromTitle(post.title)
    return getPairingTagsFromTitle(pairingTitle)
  }, [pairingTitle, post?.title])

  const hasPairingTags = Boolean(liquorTag) && Boolean(foodTag)
  const isQnaDetail = Boolean(post?.isQna) || navState.source === "free"

  const recommendedCategoryItem: CategoryListItem = useMemo(
    () => ({
      id: recommendedProduct.id,
      name: recommendedProduct.name,
      subGroup: recommendedProduct.categoryLabel,
      tags: [recommendedProduct.categoryLabel, recommendedProduct.subLabel, recommendedProduct.priceLabel],
      keywords: [],
    }),
    [recommendedProduct],
  )

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
        tierClassName={getUserGradeBadgeClassNameByTier(authorTier)}
        tierLabel={getPairingTierLabel(authorTier)}
        showTier={authorId !== null}
        isFollowing={isFollowing}
        followDisabled={authorId === null}
        onBack={() => {
          if (isQnaDetail) {
            navigate("/community", { state: { initialFilter: "free", scrollToTop: true } })
            return
          }
          navigate(-1)
        }}
        onToggleFollow={toggleFollow}
      />

      <div className="detail_images" aria-label="페어링 이미지(좌우 스와이프)">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="detail_image_item" key={index} />
        ))}
      </div>

      <h2>{pairingTitle}</h2>
      {hasPairingTags ? (
        <div className="detail_pairing_tag_row" aria-label="주류+음식 태그">
          <button
            type="button"
            className="detail_pairing_tag"
            onClick={() =>
              navigate("/community/tag", {
                state: { tagType: "liquor", tagValue: liquorTag },
              })
            }
          >
            {liquorTag}
          </button>

          <button
            type="button"
            className="detail_pairing_tag"
            onClick={() =>
              navigate("/community/tag", {
                state: { tagType: "food", tagValue: foodTag },
              })
            }
          >
            {foodTag}
          </button>
        </div>
      ) : null}
      <div className="detail_tags">
        <span>{priceRangeTagByDrinkType[drinkTypeLabel] ?? "1~3만원"}</span>
        <span>{drinkTypeLabel ? `${drinkTypeLabel} 추천` : "추천"}</span>
      </div>

      <p className="detail_text">
        {detailBodyText ||
          "조합을 더 맛있게 즐기기 위한 팁을 공유하는 공간이에요. 좋아하는 조합을 저장하고, 댓글로 의견을 나눠보세요."}
      </p>

      <div className="detail_product_shell" aria-label="추천 상품">
        <CategoryItemCard item={recommendedCategoryItem} />
      </div>

      <FeedActions
        variant="detail"
        likeActive={isLiked}
        likeAriaLabel={isLiked ? "좋아요 취소" : "좋아요"}
        likeText={String(likeCount)}
        onToggleLike={toggleLike}
        commentAriaLabel="댓글 보기"
        commentText={String(commentCount)}
        onViewComments={() =>
          document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        bookmarkActive={isBookmarked}
        bookmarkAriaLabel={isBookmarked ? "북마크 취소" : "북마크"}
        onBookmark={() => {
          if (!Number.isFinite(numericPostId)) return
          toggleBookmark(numericPostId)
        }}
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
        getTierClassName={getUserGradeBadgeClassNameByUserId}
        getTierLabel={getPairingTierLabelByUserId}
        onCountChange={setCommentCount}
      />
    </section>
  )
}
