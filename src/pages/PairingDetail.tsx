import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import CommentSection from "../components/CommentSection"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import FeedActions from "../components/FeedActions"
import PairingDetailHeader from "../components/PairingDetailHeader"
import PostOwnerActionModal from "../components/PostOwnerActionModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import SimilarPairingList, { type SimilarPairingItem } from "../components/SimilarPairingList"
import "../styles/category-list.css"
import "../styles/community.css"
import "../styles/pairing-detail.css"
import {
  extractPairingTitle,
  feedPosts,
  getPairingDetailBodyText,
  getPairingSummaryText,
  getPairingTagsFromTitle,
} from "../utils/communityPosts"
import {
  COMMUNITY_BOOKMARK_LIST_BY_POST_KEY,
  COMMUNITY_BOOKMARKED_POSTS_KEY,
  COMMUNITY_FOLLOWED_USERS_KEY,
  COMMUNITY_LIKED_POSTS_KEY,
  COMMUNITY_USER_POSTS_KEY,
  getPairingCommentsStorageKey,
} from "../utils/communityStorage"
import {
  getPairingTierByUserId,
  getPairingTierLabel,
  getPairingTierLabelByUserId,
  getUserGradeBadgeClassNameByTier,
  getUserGradeBadgeClassNameByUserId,
} from "../utils/pairingTier"
import { useStoredBooleanRecordFromIds, useStoredNullableStringRecord } from "../utils/storage"
import { currentUserMock, usersMockById } from "../utils/usersMock"
import { useMyOnboardingMeta } from "../hooks/useMyOnboardingMeta"
import { useCommunityPageData } from "../hooks/useCommunityPageData"

type PairingDetailNavState = {
  pairingTitle?: string
  pairingSummary?: string
  body?: string
  authorId?: number
  authorName?: string
  profile?: string
  locationLabel?: string
  drinkType?: string
  features?: string[]
  source?: "feed" | "ranking" | "free"
  feedFilter?: "review" | "follow" | "free"
}

const readStoredLikedPostIds = () => {
  try {
    const raw = window.localStorage.getItem(COMMUNITY_LIKED_POSTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set<number>(
      Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === "number") : [],
    )
  } catch {
    return new Set<number>()
  }
}

const priceRangeTagByDrinkType: Record<string, string> = {
  소주: "1~3만원",
  맥주: "1~3만원",
  와인: "2~5만원",
  위스키: "3~8만원",
  전통주: "1~3만원",
  사케: "2~5만원",
  기타: "1~3만원",
}

export default function PairingDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pairingId } = useParams()
  const { bookmarkLists } = useCommunityPageData()

  const navState = (location.state ?? {}) as PairingDetailNavState
  const numericId = typeof pairingId === "string" ? Number(pairingId) : NaN
  const post = useMemo(
    () => {
      if (!Number.isFinite(numericId)) return undefined
      const fromSeed = feedPosts.find((item) => item.id === numericId)
      if (fromSeed) return fromSeed

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        if (!Array.isArray(parsed)) return undefined
        return parsed.find((item) => typeof item?.id === "number" && item.id === numericId)
      } catch {
        return undefined
      }
    },
    [numericId],
  )

  const pairingTitle = useMemo(() => {
    if (navState.pairingTitle?.trim()) return navState.pairingTitle.trim()
    if (post?.title) return extractPairingTitle(post.title)
    return `??뤿선筌?#${pairingId ?? ""}`.trim()
  }, [navState.pairingTitle, pairingId, post])

  const pairingSummary = useMemo(() => {
    const fromNav = navState.pairingSummary?.trim()
    if (fromNav) return fromNav
    return getPairingSummaryText(post ?? { title: pairingTitle, body: navState.body ?? "", pairingSummary: "" })
  }, [navState.body, navState.pairingSummary, pairingTitle, post])

  const pairingFeatures = useMemo(() => {
    const fromNav: string[] = Array.isArray(navState.features) ? navState.features : []
    const fromPostRaw: unknown = (post as { features?: unknown } | undefined)?.features
    const fromPost: string[] = Array.isArray(fromPostRaw) ? (fromPostRaw.filter((v): v is string => typeof v === "string") as string[]) : []

    const source = fromNav.length > 0 ? fromNav : fromPost
    const cleaned = source.map((v) => v.trim()).filter(Boolean)
    const unique = Array.from(new Set(cleaned))
    return unique.slice(0, 2)
  }, [navState.features, post])

  const drinkTypeLabel =
    navState.drinkType?.trim() ||
    post?.drinkType?.trim() ||
    (pairingTitle.includes("+") ? pairingTitle.split("+")[0]?.trim() : "")

  const authorId =
    typeof navState.authorId === "number" ? navState.authorId : typeof post?.authorId === "number" ? post.authorId : null
  const authorMock = authorId !== null ? usersMockById[authorId] : undefined
  const authorName = navState.authorName?.trim() || post?.authorName?.trim() || authorMock?.name || "??ъ구"
  const profile = navState.profile?.trim() || authorMock?.profile || "20?? / ??뽰뒻"
  const locationLabel = navState.locationLabel?.trim() || post?.locationLabel?.trim() || ""
  const detailBodyText = getPairingDetailBodyText(
    post ?? { title: pairingTitle, body: navState.body ?? "", pairingSummary: pairingSummary },
    pairingSummary || pairingTitle,
  )
  const authorTier = authorId !== null ? getPairingTierByUserId(authorId) : undefined

  const { metaLine: myMetaLine, nickname: myNickname } = useMyOnboardingMeta()
  const isMyPost = authorId === 2001 && authorName === myNickname
  const mySubProfile = isMyPost ? myMetaLine : profile
  const currentUser = useMemo(
    () => ({ ...currentUserMock, id: 2001, name: myNickname, meta: "작성자" }),
    [myNickname],
  )

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

  const numericPostId = typeof pairingId === "string" ? Number(pairingId) : NaN
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isUnfollowConfirmOpen, setIsUnfollowConfirmOpen] = useState(false)
  const [isOwnerActionOpen, setIsOwnerActionOpen] = useState(false)
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(null)
  const [likedByPostId, setLikedByPostId] = useState<Record<number, boolean>>(() => {
    if (!Number.isFinite(numericPostId)) return {}
    return { [numericPostId]: readStoredLikedPostIds().has(numericPostId) }
  })
  const isLiked = Number.isFinite(numericPostId)
    ? likedByPostId[numericPostId] ?? readStoredLikedPostIds().has(numericPostId)
    : false
  const { value: bookmarkedById, toggle: toggleBookmark } = useStoredBooleanRecordFromIds(
    COMMUNITY_BOOKMARKED_POSTS_KEY,
  )
  const { value: bookmarkListById, setValue: setBookmarkListById } = useStoredNullableStringRecord(
    COMMUNITY_BOOKMARK_LIST_BY_POST_KEY,
  )
  const isBookmarked =
    Number.isFinite(numericPostId) ? Boolean(bookmarkListById[numericPostId] ?? bookmarkedById[numericPostId]) : false

  const initialLikeCount = useMemo(() => {
    const value = (post as { likeCount?: unknown } | undefined)?.likeCount
    return typeof value === "number" && Number.isFinite(value) ? value : 0
  }, [post])

  const [likeCountByPostId, setLikeCountByPostId] = useState<Record<number, number>>({})
  const likeCount = Number.isFinite(numericPostId) ? likeCountByPostId[numericPostId] ?? initialLikeCount : initialLikeCount

  const initialCommentCount = useMemo(() => {
    const fromPost = (post as { commentCount?: unknown } | undefined)?.commentCount
    if (typeof fromPost === "number" && Number.isFinite(fromPost)) return fromPost
    if (!pairingId) return 0
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      if (!raw) return 0
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  }, [pairingId, post])

  const [commentCountByPairingId, setCommentCountByPairingId] = useState<Record<string, number>>({})
  const commentCount = pairingId ? commentCountByPairingId[pairingId] ?? initialCommentCount : initialCommentCount
  const handleDeleteCurrentPost = useCallback(() => {
    if (!Number.isFinite(numericPostId)) return
    try {
      const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return
      const next = parsed.filter((item) => item?.id !== numericPostId)
      window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
      window.dispatchEvent(new Event("community:user-posts-updated"))
    } catch {
      // ignore storage errors
    }
    navigate("/community?filter=review")
  }, [navigate, numericPostId])

  function openBookmarkPicker() {
    if (!Number.isFinite(numericPostId)) return
    const currentListId = bookmarkListById[numericPostId]
    setBookmarkPicker({ postId: numericPostId, selectedListId: currentListId ?? bookmarkLists[0].id })
  }

  function confirmBookmark() {
    if (!bookmarkPicker) return
    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    if (!bookmarkedById[bookmarkPicker.postId]) {
      toggleBookmark(bookmarkPicker.postId)
    }
    setBookmarkPicker(null)
  }

  function removeBookmark() {
    if (!bookmarkPicker) return
    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    if (bookmarkedById[bookmarkPicker.postId]) {
      toggleBookmark(bookmarkPicker.postId)
    }
    setBookmarkPicker(null)
  }

  function cancelBookmark() {
    setBookmarkPicker(null)
  }

  function openEditPost() {
    if (!post || !Number.isFinite(numericPostId)) return
    const mode = isQnaDetail ? "free" : "review"
    navigate(`/community/write?mode=${mode}&editId=${numericPostId}`, {
      state: { editPost: post },
    })
  }

  const handleCommentCountChange = useCallback(
    (nextCount: number) => {
      if (!pairingId) return
      setCommentCountByPairingId((prev) => {
        if (prev[pairingId] === nextCount) return prev
        return { ...prev, [pairingId]: nextCount }
      })
    },
    [pairingId],
  )

  const similarItems = useMemo(() => {
    const drinkHint = pairingTitle.split("+")[0]?.trim() ?? ""
    const drinkTypeHint = drinkTypeLabel || drinkHint
    const isSakeDetail = drinkTypeHint === "???"

    const sakeFallbackItems: SimilarPairingItem[] = isSakeDetail
      ? [
          {
            id: 90001,
            pairingTitle: "준마이 다이긴죠 + 사시미 플레이트",
            label:
              "부드럽고 깔끔한 준마이 다이긴죠와 사시미 플레이트 조합이에요. 와사비와 생강을 곁들이면 향이 더 또렷해져요.",
            authorId: 2104,
            authorName: usersMockById[2104]?.name ?? "익명",
            profile: usersMockById[2104]?.profile ?? "",
            locationLabel: "작은 주방 테이블",
            drinkType: "사케",
          },
          {
            id: 90002,
            pairingTitle: "다이긴죠 + 치즈 플래터",
            label:
              "다이긴죠의 은은한 향과 치즈 플래터 조합으로 진하게 한 잔. 크래커나 견과류를 함께 두면 질감이 더 좋아져요.",
            authorId: 2102,
            authorName: usersMockById[2102]?.name ?? "익명",
            profile: usersMockById[2102]?.profile ?? "",
            locationLabel: "아늑한 우리집",
            drinkType: "사케",
          },
          {
            id: 90003,
            pairingTitle: "준마이 다이긴죠 + 굴 초회",
            label:
              "초회로 산뜻하게 시작하고 준마이 다이긴죠로 이어가면 궁합이 좋아요. 레몬 한 방울로 비린 향을 잡아주면 더 깔끔합니다.",
            authorId: 2004,
            authorName: usersMockById[2004]?.name ?? "익명",
            profile: usersMockById[2004]?.profile ?? "",
            locationLabel: "늦은 밤 식탁",
            drinkType: "사케",
          },
        ]
      : []

    const candidates: SimilarPairingItem[] = feedPosts
      .map(
        (item) =>
          ({
            id: item.id,
            pairingTitle: extractPairingTitle(item.title),
            label: getPairingDetailBodyText(item, getPairingSummaryText(item)),
            authorId: item.authorId,
            authorName: usersMockById[item.authorId]?.name ?? "익명",
            profile: usersMockById[item.authorId]?.profile ?? "",
            locationLabel: item.locationLabel ?? "",
            drinkType: item.drinkType ?? "기타",
          }) satisfies SimilarPairingItem,
      )
    const merged: SimilarPairingItem[] = [...candidates]
    for (const fallback of sakeFallbackItems) {
      if (merged.length >= 2) break
      if (merged.some((item) => item.id === fallback.id)) continue
      merged.push(fallback)
    }

    return merged.slice(0, 2)
  }, [drinkTypeLabel, pairingTitle])

  const { liquorTag, foodTag } = useMemo(() => {
    const fromPostTitle = post?.title ? getPairingTagsFromTitle(post.title) : { liquorTag: "", foodTag: "" }
    if (fromPostTitle.liquorTag && fromPostTitle.foodTag) return fromPostTitle

    const fromTitle = getPairingTagsFromTitle(pairingTitle)
    if (fromTitle.liquorTag && fromTitle.foodTag) return fromTitle

    const liquorFallback = drinkTypeLabel?.trim() ?? ""
    const foodFallback = Array.isArray(post?.foods) ? (post?.foods[0] ?? "") : ""

    return { liquorTag: liquorFallback, foodTag: foodFallback }
  }, [drinkTypeLabel, pairingTitle, post])

  const hasPairingTags = Boolean(liquorTag) && Boolean(foodTag)
  const isQnaDetail = Boolean(post?.isQna) || navState.source === "free"

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
    if (isFollowing) {
      setIsUnfollowConfirmOpen(true)
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

  const toggleLike = () => {
    if (!pairingId) return
    const numericId = Number(pairingId)
    if (!Number.isFinite(numericId)) return
    const nextLiked = !isLiked
    setLikedByPostId((prev) => ({ ...prev, [numericId]: nextLiked }))
    setLikeCountByPostId((prev) => ({
      ...prev,
      [numericId]: Math.max(0, (prev[numericId] ?? initialLikeCount) + (nextLiked ? 1 : -1)),
    }))
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
    <section className="pairing_detail_page page_screen" aria-label="??뤿선筌??怨멸쉭">
      <PairingDetailHeader
        authorName={authorName}
        profile={mySubProfile}
        locationLabel={isQnaDetail ? "" : locationLabel}
        tierClassName={getUserGradeBadgeClassNameByTier(authorTier)}
        tierLabel={getPairingTierLabel(authorTier)}
        showTier={authorId !== null}
        isFollowing={isFollowing}
        followDisabled={authorId === null || isMyPost}
        menuAriaLabel={isMyPost ? "??쇱젟" : undefined}
        onOpenMenu={
          isMyPost && Number.isFinite(numericPostId) ? () => setIsOwnerActionOpen(true) : undefined
        }
        onBack={() => {
          if (navState.source === "ranking") {
            navigate("/community/ranking")
            return
          }

          if (navState.source === "feed") {
            const filter = navState.feedFilter ?? (isQnaDetail ? "free" : "review")
            navigate(`/community?filter=${filter}`)
            return
          }

          if (isQnaDetail) {
            navigate("/community?filter=free")
            return
          }

          navigate(-1)
        }}
        onToggleFollow={toggleFollow}
      />

      {isQnaDetail ? (
        <>
          <h2>{pairingTitle}</h2>
          {detailBodyText ? <p className="detail_text">{detailBodyText}</p> : null}
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
            bookmarkAriaLabel={isBookmarked ? "북마크 변경" : "북마크"}
            onBookmark={openBookmarkPicker}
          />
          <CommentSection
            pairingId={pairingId}
            currentUser={currentUser}
            getTierClassName={getUserGradeBadgeClassNameByUserId}
            getTierLabel={getPairingTierLabelByUserId}
            onCountChange={handleCommentCountChange}
            emptyByDefault={isMyPost}
          />
        </>
      ) : (
        <>
          {Array.isArray(post?.photoIds) && post.photoIds.length > 0 ? (
            <div className="detail_images" aria-label="??뤿선筌????筌왖(?ル슣???????꾨늄)">
              {post.photoIds.slice(0, 3).map((photoId: string) => (
                <div className="detail_image_item" key={photoId} />
              ))}
            </div>
          ) : null}

          <h2>{pairingSummary || pairingTitle}</h2>
          {hasPairingTags ? (
            <div className="detail_pairing_tag_row" aria-label="雅뚯눖履????뻼 ??볥젃">
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
            {pairingFeatures.length > 0
              ? pairingFeatures.map((chip) => (
                  <span className="detail_feature_chip" key={chip}>
                    {chip}
                  </span>
                ))
              : null}
          </div>

          <p className="detail_text">
            {detailBodyText ||
              "조합을 더 맛있게 즐기기 위한 팁을 공유하는 공간이에요. 좋아하는 조합을 저장하고, 댓글로 의견을 나눠보세요."}
          </p>

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
            bookmarkAriaLabel={isBookmarked ? "북마크 변경" : "북마크"}
            onBookmark={openBookmarkPicker}
          />

          <SimilarPairingList
            items={similarItems}
            title={drinkTypeLabel === "사케" ? "사케와 어울리는 조합 둘러보기" : undefined}
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
                  feedFilter: navState.feedFilter,
                } satisfies PairingDetailNavState,
              })
            }
            />

          <CommentSection
            pairingId={pairingId}
            currentUser={currentUser}
            getTierClassName={getUserGradeBadgeClassNameByUserId}
            getTierLabel={getPairingTierLabelByUserId}
            onCountChange={handleCommentCountChange}
            emptyByDefault={isMyPost}
          />
        </>
      )}
      {isOwnerActionOpen ? (
        <PostOwnerActionModal
          title="게시글 설정"
          onCancel={() => setIsOwnerActionOpen(false)}
          onEdit={() => {
            setIsOwnerActionOpen(false)
            openEditPost()
          }}
          onDelete={() => {
            setIsOwnerActionOpen(false)
            setIsDeleteConfirmOpen(true)
          }}
        />
      ) : null}
      {isDeleteConfirmOpen ? (
        <PurchaseConfirmModal
          ariaLabel="게시글 삭제 확인"
          message="이 글을 삭제할까요?"
          cancelLabel="취소"
          confirmLabel="삭제"
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => {
            setIsDeleteConfirmOpen(false)
            handleDeleteCurrentPost()
          }}
        />
      ) : null}
      {isUnfollowConfirmOpen ? (
        <PurchaseConfirmModal
          ariaLabel="언팔로우 확인"
          message={`${authorName}님을 언팔로우하시겠어요?`}
          cancelLabel="취소"
          confirmLabel="언팔로우"
          onCancel={() => setIsUnfollowConfirmOpen(false)}
          onConfirm={() => {
            if (authorId !== null) {
              setFollowedUserIds((prev) => {
                const next = new Set(prev)
                next.delete(authorId)
                try {
                  window.localStorage.setItem(COMMUNITY_FOLLOWED_USERS_KEY, JSON.stringify(Array.from(next)))
                } catch {
                  // ignore storage errors
                }
                return next
              })
            }
            setIsUnfollowConfirmOpen(false)
          }}
        />
      ) : null}
      {bookmarkPicker ? (
        <CommunityBookmarkPickerModal
          picker={bookmarkPicker}
          lists={bookmarkLists}
          ariaLabel="북마크 리스트 선택"
          titleText={bookmarkListById[bookmarkPicker.postId] ? "북마크를 어디로 옮길까요?" : "어느 리스트에 담을까요?"}
          listPickerAriaLabel="북마크 리스트"
          secondaryLabel={bookmarkListById[bookmarkPicker.postId] ? "해제" : "취소"}
          primaryLabel="확인"
          onDismiss={cancelBookmark}
          onSelectList={(listId) => setBookmarkPicker({ ...bookmarkPicker, selectedListId: listId })}
          onSecondary={bookmarkListById[bookmarkPicker.postId] ? removeBookmark : cancelBookmark}
          onPrimary={confirmBookmark}
        />
      ) : null}
    </section>
  )
}
