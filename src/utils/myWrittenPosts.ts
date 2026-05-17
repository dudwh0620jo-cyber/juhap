import type { DrinkReview } from "./productReviews"
import { extractPairingTitle, type FeedPost } from "./communityPosts"
import { COMMUNITY_USER_POSTS_KEY } from "./communityStorage"
import { readStoredCommunityUserPosts } from "./communityFeed"
import { readUserProfile } from "../data/userProfile"
import { resolveReviewImage } from "./reviewImages"
import { resolveUserAvatar } from "./userAvatars"
import { NONE_OPTION } from "../data/setupContent"
import { getPairingTierLabelByUserId } from "./pairingTier"

export const MY_WRITTEN_POST_AUTHOR_ID = 9999
const LEGACY_MY_WRITTEN_POST_AUTHOR_ID = 1014

export const isMyWrittenPost = (post: FeedPost) => {
  if (post.authorId === MY_WRITTEN_POST_AUTHOR_ID || post.authorId === LEGACY_MY_WRITTEN_POST_AUTHOR_ID) return true

  const nickname = readUserProfile().personalInfo.nickname.trim()
  return Boolean(nickname && post.authorName?.trim() === nickname)
}

export const isPairingReviewPost = (post: FeedPost) =>
  !post.isQna &&
  post.sourceType !== "drink-review" &&
  (post.sourceType === "pairing-review" ||
    (Array.isArray(post.foods) && post.foods.some((food) => typeof food === "string" && food.trim())))

export const isAlcoholReviewPost = (post: FeedPost) =>
  !post.isQna && (post.sourceType === "drink-review" || !isPairingReviewPost(post))

export const readStoredMyWrittenPosts = () => readStoredCommunityUserPosts(COMMUNITY_USER_POSTS_KEY).filter(isMyWrittenPost)

const getMyMetaLine = () => {
  const profile = readUserProfile()
  const drinkType = (profile.tastePreferences.drinkType ?? []).find((value) => value !== NONE_OPTION)?.trim()
  const traits = (profile.tastePreferences.trait ?? []).filter((value) => value !== NONE_OPTION)
  const traitA = (traits[0] ?? "").trim()
  const traitB = (traits[1] ?? "").trim()

  const parts = [drinkType, traitA, traitB].filter(Boolean)
  return parts.length > 0 ? `${parts.join(" / ")} 선호` : "취향 미설정"
}

const toStoredAuthor = (post: FeedPost) => ({
  name: post.authorName?.trim() || "익명",
  grade: getPairingTierLabelByUserId(post.authorId ?? MY_WRITTEN_POST_AUTHOR_ID),
  preference: getMyMetaLine(),
  avatar: resolveUserAvatar(post.authorId) ?? "",
})

export const toStoredDrinkReview = (post: FeedPost): DrinkReview => ({
  id: `user-review-${post.id}`,
  title: post.title,
  body: post.body,
  tags: post.searchTags ?? [],
  images: (post.photoIds ?? []).map((photoId) => resolveReviewImage(photoId)).filter((src): src is string => Boolean(src)),
  likes: post.likeCount,
  comments: post.commentCount,
  rating: typeof post.rating === "number" && Number.isFinite(post.rating) ? post.rating.toFixed(1) : "5.0",
  createdAt: post.createdAt,
  recommendScore: post.popularityScore,
  alcoholTag: post.drinkName ?? post.drinkType ?? post.categories?.[0],
  author: toStoredAuthor(post),
})

export const toStoredPairingReview = (post: FeedPost): DrinkReview => {
  const pairingTitle = extractPairingTitle(post.title)
  const [alcoholTag, foodTagFromTitle] = pairingTitle.split("+").map((value) => value.trim())
  const foodTag = foodTagFromTitle || post.foods?.find((food) => food.trim())

  return {
    id: `pairing-review-${post.id}`,
    pairingPostId: post.id,
    title: post.pairingSummary?.trim() || post.title,
    body: post.body,
    tags: post.searchTags ?? [],
    images: (post.photoIds ?? []).map((photoId) => resolveReviewImage(photoId)).filter((src): src is string => Boolean(src)),
    likes: post.likeCount,
    comments: post.commentCount,
    rating: typeof post.rating === "number" && Number.isFinite(post.rating) ? post.rating.toFixed(1) : "5.0",
    createdAt: post.createdAt,
    recommendScore: post.popularityScore,
    alcoholTag: alcoholTag || post.drinkName || post.drinkType || post.categories?.[0],
    foodTag,
    location: post.locationLabel,
    author: toStoredAuthor(post),
  }
}

export const normalizeWrittenPostMatchText = (value: string | undefined) =>
  (value ?? "").replace(/\s+/g, "").toLowerCase()

export const matchesWrittenPostProductName = (post: FeedPost, productName: string) => {
  const normalizedProductName = normalizeWrittenPostMatchText(productName)
  if (!normalizedProductName) return false

  const pairingTitle = extractPairingTitle(post.title)
  const [alcoholTag] = pairingTitle.split("+").map((value) => value.trim())
  const candidates = [post.drinkName, alcoholTag, post.title]

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeWrittenPostMatchText(candidate)
    if (!normalizedCandidate) return false
    return (
      normalizedCandidate === normalizedProductName ||
      normalizedCandidate.includes(normalizedProductName) ||
      normalizedProductName.includes(normalizedCandidate)
    )
  })
}
