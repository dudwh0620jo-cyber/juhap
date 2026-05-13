import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import CommentSection from "../components/CommentSection"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import FeedActions from "../components/FeedActions"
import PairingDetailHeader from "../components/PairingDetailHeader"
import PairingDetailMedia from "../components/PairingDetailMedia"
import PairingDetailProductCard from "../components/PairingDetailProductCard"
import PostOwnerActionModal from "../components/PostOwnerActionModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import ReviewContentBlock from "../components/ReviewContentBlock"
import SimilarPairingList from "../components/SimilarPairingList"
import iconChat from "../assets/svg/chatcircledots_p.svg"
import iconStar from "../assets/svg/star.svg"
import "../styles/category-list.css"
import "../styles/community.css"
import "../styles/pairing-detail.css"
import { deriveCommunityTagBundle, extractPairingTitle, getPairingSummaryText, type FeedPost } from "../utils/communityPosts"
import {
  COMMUNITY_BOOKMARK_LIST_BY_POST_KEY,
  COMMUNITY_BOOKMARKED_POSTS_KEY,
  COMMUNITY_FOLLOWED_USERS_KEY,
  COMMUNITY_LIKED_POSTS_KEY,
  COMMUNITY_USER_POSTS_KEY,
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
import { communityPageData } from "../data/communityPageData"
import { getPairingDetailMock } from "../utils/pairingDetailMock"
import {
  deleteStoredUserPost,
  findPairingDetailPost,
  getInitialPairingCommentCount,
  getInitialPairingLikeCount,
  type PairingDetailNavState,
  readStoredNumberSet,
  resolveSimilarPairingItems,
  writeStoredNumberSet,
} from "../utils/pairingDetail"

export default function PairingDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pairingId } = useParams()
  const { bookmarkLists } = communityPageData
  const navState = (location.state ?? {}) as PairingDetailNavState

  const numericId = typeof pairingId === "string" ? Number(pairingId) : NaN
  const post = useMemo<FeedPost | undefined>(() => {
    return findPairingDetailPost(numericId, COMMUNITY_USER_POSTS_KEY)
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

  const pairingTagBundle = useMemo(() => {
    const fromNavFeatures: unknown[] = Array.isArray(navState.features) ? navState.features : []
    return deriveCommunityTagBundle({
      pairingTitle,
      title: post?.title ?? "",
      drinkType: navState.drinkType ?? post?.categories?.[0] ?? "",
      foods: Array.isArray(navState.foods) ? navState.foods : post?.foods,
      features: fromNavFeatures.length > 0 ? fromNavFeatures : post?.features,
    })
  }, [navState.drinkType, navState.features, navState.foods, pairingTitle, post])


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

  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(() => readStoredNumberSet(COMMUNITY_FOLLOWED_USERS_KEY))

  const isFollowing = authorId !== null && followedUserIds.has(authorId)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isUnfollowConfirmOpen, setIsUnfollowConfirmOpen] = useState(false)
  const [isOwnerActionOpen, setIsOwnerActionOpen] = useState(false)
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(null)

  const [likedByPostId, setLikedByPostId] = useState<Record<number, boolean>>(() => {
    if (!Number.isFinite(numericId)) return {}
    return { [numericId]: readStoredNumberSet(COMMUNITY_LIKED_POSTS_KEY).has(numericId) }
  })

  const isLiked = Number.isFinite(numericId)
    ? likedByPostId[numericId] ?? readStoredNumberSet(COMMUNITY_LIKED_POSTS_KEY).has(numericId)
    : false

  const { value: bookmarkedById, toggle: toggleBookmark } = useStoredBooleanRecordFromIds(COMMUNITY_BOOKMARKED_POSTS_KEY)
  const { value: bookmarkListById, setValue: setBookmarkListById } = useStoredNullableStringRecord(COMMUNITY_BOOKMARK_LIST_BY_POST_KEY)
  const isBookmarked = Number.isFinite(numericId) ? Boolean(bookmarkListById[numericId] ?? bookmarkedById[numericId]) : false

  const initialLikeCount = useMemo(
    () => getInitialPairingLikeCount(post, navState.source, navState.voteCount),
    [navState.source, navState.voteCount, post],
  )

  const [likeCountByPostId, setLikeCountByPostId] = useState<Record<number, number>>({})
  const likeCount = Number.isFinite(numericId) ? likeCountByPostId[numericId] ?? initialLikeCount : initialLikeCount

  const initialCommentCount = useMemo(() => getInitialPairingCommentCount(post, pairingId), [pairingId, post])

  const [commentCountByPairingId, setCommentCountByPairingId] = useState<Record<string, number>>({})
  const commentCount = pairingId ? commentCountByPairingId[pairingId] ?? initialCommentCount : initialCommentCount
  const detailPhotoIds = Array.isArray(post?.photoIds) ? post.photoIds.slice(0, 3) : []

  const detailMock = useMemo(() => getPairingDetailMock(post?.detailMockKey ?? null), [post?.detailMockKey])

  const rankingRating = useMemo(() => {
    const value = navState.source === "ranking" ? navState.rating : undefined
    return typeof value === "number" && Number.isFinite(value) ? value : null
  }, [navState.rating, navState.source])

  const rankingVoteCount = useMemo(() => {
    const value = navState.source === "ranking" ? navState.voteCount : undefined
    return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : null
  }, [navState.source, navState.voteCount])

  const similarItems = useMemo(
    () => resolveSimilarPairingItems(post, detailMock?.similarPostIds, numericId),
    [detailMock?.similarPostIds, numericId, post],
  )

  const { liquorTag, foodTag } = pairingTagBundle

  const hasPairingTags = Boolean(liquorTag) && Boolean(foodTag)
  const isQnaDetail = Boolean(post?.isQna) || navState.source === "free"
  const hideDetailSections = Boolean(navState.hideDetailSections)
  const bottomNavActive = navState.bottomNavActive

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
      writeStoredNumberSet(COMMUNITY_FOLLOWED_USERS_KEY, next, `${COMMUNITY_FOLLOWED_USERS_KEY}:updated`)
      return next
    })
  }

  const toggleLike = () => {
    if (!Number.isFinite(numericId)) return
    const nextLiked = !isLiked
    setLikedByPostId((prev) => ({ ...prev, [numericId]: nextLiked }))
    setLikeCountByPostId((prev) => ({ ...prev, [numericId]: Math.max(0, (prev[numericId] ?? initialLikeCount) + (nextLiked ? 1 : -1)) }))
    const nextLikedIds = readStoredNumberSet(COMMUNITY_LIKED_POSTS_KEY)
    if (nextLiked) nextLikedIds.add(numericId)
    else nextLikedIds.delete(numericId)
    writeStoredNumberSet(COMMUNITY_LIKED_POSTS_KEY, nextLikedIds)
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
      deleteStoredUserPost(numericId, COMMUNITY_USER_POSTS_KEY)
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
          if (navState.source === "free") return navigate("/community?filter=free")
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
          <PairingDetailMedia key={numericId} numericId={numericId} photoIds={detailPhotoIds} />

          <ReviewContentBlock
            className="detail_content_group"
            mainClassName="detail_content_main"
            title={
              <>
                <h2>{pairingSummary || pairingTitle}</h2>
                {rankingRating !== null && rankingVoteCount !== null ? (
                  <p className="detail_ranking_meta" aria-label="랭킹 점수">
                    <span className="detail_ranking_rating">
                      <img className="detail_ranking_star" src={iconStar} alt="" aria-hidden="true" />
                      <span>{rankingRating.toFixed(1)}</span>
                    </span>
                    <span className="detail_ranking_votes">{rankingVoteCount.toLocaleString("ko-KR")}짠</span>
                  </p>
                ) : null}
              </>
            }
            titleClassName="detail_content_heading"
            liquorTag={hasPairingTags ? liquorTag : ""}
            foodTag={hasPairingTags ? foodTag : ""}
            body={detailBodyText}
            hashtags={post?.searchTags}
            locationLabel={locationLabel}
            bodyClassName="detail_text"
            locationClassName="detail_content_location"
            locationIconClassName="detail_content_location_icon"
            onSelectLiquor={
              hasPairingTags
                ? () => navigate("/community/tag", { state: { tagType: "liquor", tagValue: liquorTag, bottomNavActive } })
                : undefined
            }
            onSelectFood={
              hasPairingTags
                ? () => navigate("/community/tag", { state: { tagType: "food", tagValue: foodTag, bottomNavActive } })
                : undefined
            }
          />

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

          {detailMock?.product ? <PairingDetailProductCard product={detailMock.product} /> : null}

          {!hideDetailSections ? (
            <>
              <SimilarPairingList
                items={similarItems}
                titleVariant="text"
                onSelect={(item) =>
                  navigate(`/community/pairing/${item.id}`, {
                    state: {
                      pairingTitle: item.pairingTitle,
                      authorId: item.authorId,
                      authorName: item.authorName,
                      profile: item.profile,
                      locationLabel: item.locationLabel,
                      drinkType: item.drinkType,
                      foods: item.foodTag ? [item.foodTag] : undefined,
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
          ) : null}
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
                writeStoredNumberSet(COMMUNITY_FOLLOWED_USERS_KEY, next, `${COMMUNITY_FOLLOWED_USERS_KEY}:updated`)
                return next
              })
            }
            setIsUnfollowConfirmOpen(false)
          }}
        />
      ) : null}

      {bookmarkPicker ? (
        <CommunityBookmarkPickerModal
          ariaLabel="북마크 리스트 선택"
          titleText={bookmarkListById[bookmarkPicker.postId] ? "저장한 게시글을 취소할까요?" : "게시글을 저장할까요?"}
          helperText={
            bookmarkListById[bookmarkPicker.postId]
              ? <>취소하면 내 정보 &gt; 저장한 리스트에서<br />이 게시글이 사라져요.</>
              : <>저장한 게시글은 내 정보 &gt; 저장한 리스트에서<br />확인할 수 있어요.</>
          }
          secondaryLabel="취소"
          primaryLabel={bookmarkListById[bookmarkPicker.postId] ? "저장 취소하기" : "저장하기"}
          onDismiss={() => setBookmarkPicker(null)}
          onSecondary={() => setBookmarkPicker(null)}
          onPrimary={bookmarkListById[bookmarkPicker.postId] ? removeBookmark : confirmBookmark}
        />
      ) : null}
    </section>
  )
}
