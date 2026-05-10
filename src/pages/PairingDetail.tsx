import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import CommentSection from "../components/CommentSection"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import FeedActions from "../components/FeedActions"
import PairingDetailHeader from "../components/PairingDetailHeader"
import PostOwnerActionModal from "../components/PostOwnerActionModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import SimilarPairingList, { type SimilarPairingItem } from "../components/SimilarPairingList"
import iconChat from "../assets/svg/chatcircledots_p.svg"
import iconLocation from "../assets/svg/mappin.svg"
import "../styles/category-list.css"
import "../styles/community.css"
import "../styles/pairing-detail.css"
import { extractPairingTitle, feedPosts, getPairingSummaryText, getPairingTagsFromTitle } from "../utils/communityPosts"
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
import { resolveReviewImage } from "../utils/reviewImages"
import { getPairingDetailMock } from "../utils/pairingDetailMock"

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
    return new Set<number>(Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number") : [])
  } catch {
    return new Set<number>()
  }
}

export default function PairingDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pairingId } = useParams()
  const { bookmarkLists } = useCommunityPageData()
  const navState = (location.state ?? {}) as PairingDetailNavState

  const numericId = typeof pairingId === "string" ? Number(pairingId) : NaN
  const post = useMemo(() => {
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
  }, [numericId])

  const pairingTitle = useMemo(() => {
    if (navState.pairingTitle?.trim()) return navState.pairingTitle.trim()
    if (post?.title) return extractPairingTitle(post.title)
    return `페어링 #${pairingId ?? ""}`.trim()
  }, [navState.pairingTitle, pairingId, post])

  const pairingSummary = useMemo(() => {
    const fromPost = post?.pairingSummary?.trim()
    if (fromPost) return fromPost
    const fromNav = navState.pairingSummary?.trim()
    if (fromNav) return fromNav
    return getPairingSummaryText(post ?? { title: pairingTitle, body: navState.body ?? "", pairingSummary: "" })
  }, [navState.body, navState.pairingSummary, pairingTitle, post])

  const pairingFeatures = useMemo((): string[] => {
    const fromNavRaw: unknown[] = Array.isArray(navState.features) ? navState.features : []
    const fromPostRaw: unknown[] = Array.isArray(post?.features) ? post.features : []
    const fromNav = fromNavRaw.filter((v: unknown): v is string => typeof v === "string")
    const fromPost = fromPostRaw.filter((v: unknown): v is string => typeof v === "string")
    const source = fromNav.length > 0 ? fromNav : fromPost
    return Array.from(new Set(source.map((v: string) => v.trim()).filter(Boolean))).slice(0, 2)
  }, [navState.features, post])

  const drinkTypeLabel = navState.drinkType?.trim() || post?.drinkType?.trim() || (pairingTitle.includes("+") ? pairingTitle.split("+")[0]?.trim() : "") || "기타"

  const authorId = typeof navState.authorId === "number" ? navState.authorId : typeof post?.authorId === "number" ? post.authorId : null
  const authorMock = authorId !== null ? usersMockById[authorId] : undefined
  const authorName = authorMock?.name || post?.authorName?.trim() || navState.authorName?.trim() || "익명"
  const profile = authorMock?.profile || navState.profile?.trim() || "20대 / 미설정"
  const locationLabel = navState.locationLabel?.trim() || post?.locationLabel?.trim() || ""
  const detailBodyText = (post?.body?.trim() || navState.body?.trim() || "").trim()
  const authorTier = authorId !== null ? getPairingTierByUserId(authorId) : undefined

  const { metaLine: myMetaLine, nickname: myNickname } = useMyOnboardingMeta()
  const isMyPost = authorId === currentUserMock.id && authorName === myNickname
  const mySubProfile = isMyPost ? myMetaLine : profile
  const currentUser = useMemo(() => ({ ...currentUserMock, id: currentUserMock.id, name: myNickname, meta: "작성자" }), [myNickname])

  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(() => {
    try {
      const raw = window.localStorage.getItem(COMMUNITY_FOLLOWED_USERS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return new Set(Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number") : [])
    } catch {
      return new Set<number>()
    }
  })

  const isFollowing = authorId !== null && followedUserIds.has(authorId)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isUnfollowConfirmOpen, setIsUnfollowConfirmOpen] = useState(false)
  const [isOwnerActionOpen, setIsOwnerActionOpen] = useState(false)
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(null)

  const [likedByPostId, setLikedByPostId] = useState<Record<number, boolean>>(() => {
    if (!Number.isFinite(numericId)) return {}
    return { [numericId]: readStoredLikedPostIds().has(numericId) }
  })

  const isLiked = Number.isFinite(numericId) ? likedByPostId[numericId] ?? readStoredLikedPostIds().has(numericId) : false

  const { value: bookmarkedById, toggle: toggleBookmark } = useStoredBooleanRecordFromIds(COMMUNITY_BOOKMARKED_POSTS_KEY)
  const { value: bookmarkListById, setValue: setBookmarkListById } = useStoredNullableStringRecord(COMMUNITY_BOOKMARK_LIST_BY_POST_KEY)
  const isBookmarked = Number.isFinite(numericId) ? Boolean(bookmarkListById[numericId] ?? bookmarkedById[numericId]) : false

  const initialLikeCount = useMemo(() => {
    const value = (post as { likeCount?: unknown } | undefined)?.likeCount
    return typeof value === "number" && Number.isFinite(value) ? value : 0
  }, [post])

  const [likeCountByPostId, setLikeCountByPostId] = useState<Record<number, number>>({})
  const likeCount = Number.isFinite(numericId) ? likeCountByPostId[numericId] ?? initialLikeCount : initialLikeCount

  const initialCommentCount = useMemo(() => {
    const fromPost = (post as { commentCount?: unknown } | undefined)?.commentCount
    if (typeof fromPost === "number" && Number.isFinite(fromPost)) return fromPost
    if (!pairingId) return 0
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  }, [pairingId, post])

  const [commentCountByPairingId, setCommentCountByPairingId] = useState<Record<string, number>>({})
  const commentCount = pairingId ? commentCountByPairingId[pairingId] ?? initialCommentCount : initialCommentCount

  const detailMock = useMemo(() => getPairingDetailMock(post?.detailMockKey ?? null), [post?.detailMockKey])

  const similarItems = useMemo<SimilarPairingItem[]>(() => {
    if (detailMock?.similars?.length) return detailMock.similars
    return feedPosts
      .filter((item) => !item.isQna && item.id !== numericId)
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        pairingTitle: extractPairingTitle(item.title),
        authorId: item.authorId,
        authorName: usersMockById[item.authorId]?.name ?? "익명",
        profile: usersMockById[item.authorId]?.profile ?? "",
        locationLabel: item.locationLabel ?? "",
        drinkType: item.drinkType ?? "기타",
      }))
  }, [detailMock?.similars, numericId])

  const { liquorTag, foodTag } = useMemo(() => {
    const fromPostTitle = post?.title ? getPairingTagsFromTitle(post.title) : { liquorTag: "", foodTag: "" }
    if (fromPostTitle.liquorTag && fromPostTitle.foodTag) return fromPostTitle
    const fromTitle = getPairingTagsFromTitle(pairingTitle)
    if (fromTitle.liquorTag && fromTitle.foodTag) return fromTitle
    return { liquorTag: drinkTypeLabel, foodTag: Array.isArray(post?.foods) ? (post.foods[0] ?? "") : "" }
  }, [drinkTypeLabel, pairingTitle, post])

  const hasPairingTags = Boolean(liquorTag) && Boolean(foodTag)
  const isQnaDetail = Boolean(post?.isQna) || navState.source === "free"

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useLayoutEffect(() => {
    if (location.hash !== "#comments") return
    document.getElementById("comments")?.scrollIntoView({ behavior: "auto", block: "start" })
  }, [location.hash])

  const handleCommentCountChange = useCallback((nextCount: number) => {
    if (!pairingId) return
    setCommentCountByPairingId((prev) => (prev[pairingId] === nextCount ? prev : { ...prev, [pairingId]: nextCount }))
  }, [pairingId])

  const toggleFollow = () => {
    if (authorId === null) return
    if (isFollowing) {
      setIsUnfollowConfirmOpen(true)
      return
    }
    setFollowedUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(authorId)) next.delete(authorId)
      else next.add(authorId)
      try {
        window.localStorage.setItem(COMMUNITY_FOLLOWED_USERS_KEY, JSON.stringify(Array.from(next)))
        window.dispatchEvent(new Event(`${COMMUNITY_FOLLOWED_USERS_KEY}:updated`))
      } catch {
        // ignore
      }
      return next
    })
  }

  const toggleLike = () => {
    if (!Number.isFinite(numericId)) return
    const nextLiked = !isLiked
    setLikedByPostId((prev) => ({ ...prev, [numericId]: nextLiked }))
    setLikeCountByPostId((prev) => ({ ...prev, [numericId]: Math.max(0, (prev[numericId] ?? initialLikeCount) + (nextLiked ? 1 : -1)) }))
    try {
      const raw = window.localStorage.getItem(COMMUNITY_LIKED_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const set = new Set<number>(Array.isArray(parsed) ? parsed : [])
      if (nextLiked) set.add(numericId)
      else set.delete(numericId)
      window.localStorage.setItem(COMMUNITY_LIKED_POSTS_KEY, JSON.stringify(Array.from(set)))
    } catch {
      // ignore
    }
  }

  const openBookmarkPicker = () => {
    if (!Number.isFinite(numericId)) return
    const currentListId = bookmarkListById[numericId]
    setBookmarkPicker({ postId: numericId, selectedListId: currentListId ?? bookmarkLists[0].id })
  }

  const confirmBookmark = () => {
    if (!bookmarkPicker) return
    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    if (!bookmarkedById[bookmarkPicker.postId]) toggleBookmark(bookmarkPicker.postId)
    setBookmarkPicker(null)
  }

  const removeBookmark = () => {
    if (!bookmarkPicker) return
    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    if (bookmarkedById[bookmarkPicker.postId]) toggleBookmark(bookmarkPicker.postId)
    setBookmarkPicker(null)
  }

  const openEditPost = () => {
    if (!post || !Number.isFinite(numericId)) return
    navigate(`/community/write?mode=${isQnaDetail ? "free" : "review"}&editId=${numericId}`, { state: { editPost: post } })
  }

  const handleDeleteCurrentPost = useCallback(() => {
    if (!Number.isFinite(numericId)) return
    try {
      const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return
      window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(parsed.filter((item) => item?.id !== numericId).slice(0, 50)))
      window.dispatchEvent(new Event("community:user-posts-updated"))
    } catch {
      // ignore
    }
    navigate("/community?filter=review")
  }, [navigate, numericId])

  return (
    <section className="pairing_detail_page page_screen" aria-label="페어링 상세">
      <PairingDetailHeader
        authorId={authorId}
        authorName={authorName}
        profile={mySubProfile}
        tierClassName={getUserGradeBadgeClassNameByTier(authorTier)}
        tierLabel={getPairingTierLabel(authorTier)}
        showTier={authorId !== null}
        isFollowing={isFollowing}
        followDisabled={authorId === null || isMyPost}
        menuAriaLabel={isMyPost ? "게시글 설정" : undefined}
        onOpenMenu={isMyPost && Number.isFinite(numericId) ? () => setIsOwnerActionOpen(true) : undefined}
        onBack={() => {
          if (navState.source === "ranking") return navigate("/community/ranking")
          if (navState.source === "feed") return navigate(`/community?filter=${navState.feedFilter ?? (isQnaDetail ? "free" : "review")}`)
          if (isQnaDetail) return navigate("/community?filter=free")
          navigate(-1)
        }}
        onToggleFollow={toggleFollow}
      />

      {isQnaDetail ? (
        <>
          <h2>{pairingTitle}</h2>
          {detailBodyText ? <p className="detail_text">{detailBodyText}</p> : null}
          <div className="detail_qna_actions" aria-label="댓글 액션">
            <button
              type="button"
              className="detail_qna_comment_button"
              aria-label="댓글 보기"
              onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <img className="feed_action_icon" src={iconChat} alt="" aria-hidden="true" />
              <span>{String(commentCount)}</span>
            </button>
          </div>
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
            <div className="detail_media">
              <div className="detail_images" aria-label="페어링 리뷰 이미지">
                {post.photoIds.slice(0, 3).map((photoId: string) => {
                  const imageSrc = resolveReviewImage(photoId)
                  return (
                    <figure className="detail_image_item" key={photoId}>
                      {imageSrc ? <img className="detail_image" src={imageSrc} alt="" aria-hidden="true" /> : null}
                    </figure>
                  )
                })}
              </div>
              <span className="detail_image_count">1/{Math.min(3, post.photoIds.length)}</span>
              {post.photoIds.length > 1 ? (
                <div className="detail_image_dots" aria-label={`이미지 ${post.photoIds.length}장`}>
                  {post.photoIds.slice(0, 3).map((photoId: string, index: number) => (
                    <span key={photoId} className={index === 0 ? "is_active" : ""} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <h2>{pairingSummary || pairingTitle}</h2>
          {hasPairingTags ? (
            <div className="community_review_pair_tags" aria-label="페어링 태그">
              <button
                type="button"
                className="community_review_pair_chip is_drink"
                onClick={() => navigate("/community/tag", { state: { tagType: "liquor", tagValue: liquorTag } })}
              >
                {liquorTag}
              </button>
              <button
                type="button"
                className="community_review_pair_chip is_food"
                onClick={() => navigate("/community/tag", { state: { tagType: "food", tagValue: foodTag } })}
              >
                {foodTag}
              </button>
            </div>
          ) : null}

          <p className="detail_text">{detailBodyText}</p>
          {pairingFeatures.length > 0 ? (
            <div className="community_review_hashtags" aria-label="해시태그">
              {pairingFeatures.map((chip: string) => (
                <span key={chip}>#{chip}</span>
              ))}
            </div>
          ) : null}
          {locationLabel ? (
            <p className="detail_content_location">
              <img src={iconLocation} alt="" aria-hidden="true" />
              <span>{locationLabel}</span>
            </p>
          ) : null}

          <FeedActions
            variant="detail"
            likeActive={isLiked}
            likeAriaLabel={isLiked ? "좋아요 취소" : "좋아요"}
            likeText={String(likeCount)}
            onToggleLike={toggleLike}
            commentAriaLabel="댓글 보기"
            commentText={String(commentCount)}
            onViewComments={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            bookmarkActive={isBookmarked}
            bookmarkAriaLabel={isBookmarked ? "북마크 변경" : "북마크"}
            onBookmark={openBookmarkPicker}
          />

          {detailMock?.product ? (
            <section className="detail_product_shell" aria-label="연결 상품">
              <div className="detail_product_card">
                <div className="product_thumb" aria-hidden="true">
                  <img className="product_thumb_image" src={detailMock.product.imageSrc} alt="" aria-hidden="true" />
                </div>
                <div className="product_text">
                  <h3>{detailMock.product.name}</h3>
                  <p>{detailMock.product.priceText}</p>
                  <div>
                    {detailMock.product.chips.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                </div>
                <button type="button" aria-label="상품 상세로 이동">›</button>
              </div>
            </section>
          ) : null}

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
                  window.dispatchEvent(new Event(`${COMMUNITY_FOLLOWED_USERS_KEY}:updated`))
                } catch {
                  // ignore
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
          onDismiss={() => setBookmarkPicker(null)}
          onSelectList={(listId) => setBookmarkPicker({ ...bookmarkPicker, selectedListId: listId })}
          onSecondary={bookmarkListById[bookmarkPicker.postId] ? removeBookmark : () => setBookmarkPicker(null)}
          onPrimary={confirmBookmark}
        />
      ) : null}
    </section>
  )
}
