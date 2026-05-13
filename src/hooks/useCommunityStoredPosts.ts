import { useCallback, useEffect, useMemo, useState } from "react"
import {
  COMMUNITY_PAIRING_COMMENTS_UPDATED_EVENT,
  COMMUNITY_USER_POSTS_KEY,
  readStoredPairingCommentCount,
} from "../utils/communityStorage"
import type { FeedPost } from "../utils/communityPosts"
import {
  readStoredCommunityUserPosts,
  USER_POSTS_UPDATED_EVENT,
  writeStoredCommunityUserPosts,
} from "../utils/communityFeed"

export function useCommunityStoredPosts(seedPosts: FeedPost[]) {
  const readStoredUserPosts = useCallback(
    () => readStoredCommunityUserPosts(COMMUNITY_USER_POSTS_KEY),
    [],
  )

  const [userPosts, setUserPosts] = useState<FeedPost[]>(() => readStoredUserPosts())
  const [commentCountByPostId, setCommentCountByPostId] = useState<Record<number, number>>({})
  const userPostIdSet = useMemo(() => new Set(userPosts.map((post) => post.id)), [userPosts])

  const persistUserPosts = useCallback((next: FeedPost[]) => {
    setUserPosts(next)
    writeStoredCommunityUserPosts(COMMUNITY_USER_POSTS_KEY, next)
  }, [])

  useEffect(() => {
    const syncFromStorage = () => {
      setUserPosts(readStoredUserPosts())
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== COMMUNITY_USER_POSTS_KEY) return
      syncFromStorage()
    }

    window.addEventListener(USER_POSTS_UPDATED_EVENT, syncFromStorage)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(USER_POSTS_UPDATED_EVENT, syncFromStorage)
      window.removeEventListener("storage", handleStorage)
    }
  }, [readStoredUserPosts])

  useEffect(() => {
    const allPosts = [...userPosts, ...seedPosts]

    const syncCommentCount = (post: FeedPost) => {
      const nextCount = readStoredPairingCommentCount(String(post.id), post.commentCount)
      setCommentCountByPostId((prev) => (prev[post.id] === nextCount ? prev : { ...prev, [post.id]: nextCount }))
    }

    const syncAllCommentCounts = () => {
      for (const post of allPosts) syncCommentCount(post)
    }

    const handleCommentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ pairingId?: string }>).detail
      if (!detail?.pairingId) return
      const postId = Number(detail.pairingId)
      if (!Number.isFinite(postId)) return
      const targetPost = allPosts.find((post) => post.id === postId)
      if (!targetPost) return
      syncCommentCount(targetPost)
    }

    syncAllCommentCounts()
    window.addEventListener(COMMUNITY_PAIRING_COMMENTS_UPDATED_EVENT, handleCommentUpdate)
    window.addEventListener("storage", syncAllCommentCounts)
    return () => {
      window.removeEventListener(COMMUNITY_PAIRING_COMMENTS_UPDATED_EVENT, handleCommentUpdate)
      window.removeEventListener("storage", syncAllCommentCounts)
    }
  }, [seedPosts, userPosts])

  return {
    commentCountByPostId,
    persistUserPosts,
    userPostIdSet,
    userPosts,
  }
}
