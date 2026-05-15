import type { SimilarPairingItem } from "../components/SimilarPairingList"
import {
  deriveCommunityTagBundle,
  extractPairingTitle,
  feedPosts,
  resolvePairingTags,
  type FeedPost,
} from "./communityPosts"
import { getPairingCommentsStorageKey } from "./communityStorage"
import { resolveReviewImage } from "./reviewImages"
import { usersMockById } from "./usersMock"

export type PairingDetailNavState = {
  pairingTitle?: string
  pairingSummary?: string
  body?: string
  authorId?: number
  authorName?: string
  profile?: string
  locationLabel?: string
  drinkType?: string
  foods?: string[]
  features?: string[]
  source?: "feed" | "ranking" | "free"
  feedFilter?: "review" | "follow" | "free"
  hideDetailSections?: boolean
  bottomNavActive?: "category"
}

export const readStoredNumberSet = (storageKey: string) => {
  try {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set<number>(Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === "number") : [])
  } catch {
    return new Set<number>()
  }
}

export const writeStoredNumberSet = (storageKey: string, values: Set<number>, eventName?: string) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(values)))
    if (eventName) window.dispatchEvent(new Event(eventName))
  } catch {
    // ignore storage errors
  }
}

export const readStoredUserPosts = (storageKey: string): FeedPost[] => {
  try {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as FeedPost[]) : []
  } catch {
    return []
  }
}

export const findPairingDetailPost = (numericId: number, userPostsStorageKey: string) => {
  if (!Number.isFinite(numericId)) return undefined
  const fromSeed = feedPosts.find((item) => item.id === numericId)
  if (fromSeed) return fromSeed
  return readStoredUserPosts(userPostsStorageKey).find((item) => typeof item?.id === "number" && item.id === numericId)
}

export const deleteStoredUserPost = (postId: number, userPostsStorageKey: string) => {
  const storedPosts = readStoredUserPosts(userPostsStorageKey)
  window.localStorage.setItem(userPostsStorageKey, JSON.stringify(storedPosts.filter((item) => item?.id !== postId).slice(0, 50)))
  window.dispatchEvent(new Event("community:user-posts-updated"))
}

export const getInitialPairingLikeCount = (post: FeedPost | undefined) => {
  const value = (post as { likeCount?: unknown } | undefined)?.likeCount
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export const getInitialPairingCommentCount = (post: FeedPost | undefined, pairingId?: string) => {
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
}

export const resolveSimilarPairingItems = (
  post: FeedPost | undefined,
  detailMockSimilarPostIds: readonly number[] | undefined,
  numericId: number,
): SimilarPairingItem[] => {
  const similarPostIds = post?.similarPostIds ?? detailMockSimilarPostIds ?? []

  if (similarPostIds.length) {
    return similarPostIds.flatMap((similarId) => {
      const matchedPost = feedPosts.find((item) => item.id === similarId)
      if (!matchedPost) return []
      const pairingTitle = extractPairingTitle(matchedPost.title)
      const tagBundle = deriveCommunityTagBundle({
        pairingTitle,
        title: matchedPost.title,
        drinkType: matchedPost.drinkType ?? "",
        foods: matchedPost.foods,
        features: matchedPost.features,
      })

      return [{
        id: similarId,
        pairingTitle,
        authorId: matchedPost.authorId,
        authorName: matchedPost.authorName ?? usersMockById[matchedPost.authorId]?.name ?? "익명",
        profile: usersMockById[matchedPost.authorId]?.profile ?? "",
        locationLabel: matchedPost.locationLabel ?? "",
        drinkType: tagBundle.liquorTag || "기타",
        foodTag: tagBundle.foodTag,
        imageSrc: matchedPost.imageSrc ?? (matchedPost.photoIds?.[0] ? resolveReviewImage(matchedPost.photoIds[0]) : undefined),
        title: matchedPost.title,
        rating: matchedPost.rating,
        reviewCount: matchedPost.reviewCount,
      }]
    })
  }

  return feedPosts
    .filter((item) => !item.isQna && item.id !== numericId)
    .slice(0, 3)
    .map((item) => {
      const pairingTitle = extractPairingTitle(item.title)
      const { liquorTag, foodTag } = resolvePairingTags({
        pairingTitle,
        title: item.title,
        drinkType: item.drinkType,
        foods: item.foods,
      })
      return {
        id: item.id,
        pairingTitle,
        authorId: item.authorId,
        authorName: usersMockById[item.authorId]?.name ?? "익명",
        profile: usersMockById[item.authorId]?.profile ?? "",
        locationLabel: item.locationLabel ?? "",
        drinkType: liquorTag || "기타",
        foodTag,
      }
    })
}
