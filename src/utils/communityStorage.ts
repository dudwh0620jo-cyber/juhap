import { getSeedCommentCount, getTopLevelCommentItemIdCount, type SeedCommentItem } from "./commentSeeds"

export const COMMUNITY_SEARCH_RECENT_KEY = "community_search_recent_terms"
export const COMMUNITY_FOLLOWED_USERS_KEY = "community_followed_user_ids"
export const COMMUNITY_LIKED_POSTS_KEY = "community_liked_post_ids"
export const COMMUNITY_BOOKMARKED_POSTS_KEY = "community_bookmarked_post_ids"
export const COMMUNITY_BOOKMARK_LIST_BY_POST_KEY = "community_bookmark_list_by_post"
export const COMMUNITY_USER_POSTS_KEY = "community_user_posts"
export const COMMUNITY_PAIRING_COMMENTS_UPDATED_EVENT = "community:pairing-comments-updated"

export const getPairingCommentsStorageKey = (pairingId: string) => `pairing_detail_comments_v2_${pairingId}`

export const readStoredPairingCommentCount = (pairingId: string, _fallbackCount = 0) => {
  try {
    const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
    if (!raw) return getSeedCommentCount(pairingId)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return getSeedCommentCount(pairingId)
    if (parsed.length === 0) return getSeedCommentCount(pairingId)
    return Math.max(getTopLevelCommentItemIdCount(parsed as SeedCommentItem[]), getSeedCommentCount(pairingId))
  } catch {
    return getSeedCommentCount(pairingId)
  }
}
