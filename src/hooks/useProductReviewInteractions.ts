import { useState } from "react"

export function useProductReviewInteractions() {
  const [likedReviewIds, setLikedReviewIds] = useState<Record<string, boolean>>({})
  const [animatingReviewId, setAnimatingReviewId] = useState<string | null>(null)
  const [followedAuthorNames, setFollowedAuthorNames] = useState<Set<string>>(new Set())
  const [pendingUnfollowName, setPendingUnfollowName] = useState<string | null>(null)

  const requestToggleFollow = (authorName: string) => {
    if (followedAuthorNames.has(authorName)) {
      setPendingUnfollowName(authorName)
      return
    }

    setFollowedAuthorNames((prev) => new Set(prev).add(authorName))
  }

  const confirmUnfollow = () => {
    if (!pendingUnfollowName) return

    setFollowedAuthorNames((prev) => {
      const next = new Set(prev)
      next.delete(pendingUnfollowName)
      return next
    })
    setPendingUnfollowName(null)
  }

  const toggleReviewLike = (reviewId: string) => {
    const isLiked = Boolean(likedReviewIds[reviewId])
    if (!isLiked) {
      setAnimatingReviewId(null)
      requestAnimationFrame(() => setAnimatingReviewId(reviewId))
      window.setTimeout(() => setAnimatingReviewId((currentId) => (currentId === reviewId ? null : currentId)), 900)
    }

    setLikedReviewIds((prev) => ({ ...prev, [reviewId]: !isLiked }))
  }

  return {
    animatingReviewId,
    confirmUnfollow,
    followedAuthorNames,
    likedReviewIds,
    pendingUnfollowName,
    requestToggleFollow,
    setPendingUnfollowName,
    toggleReviewLike,
  }
}
