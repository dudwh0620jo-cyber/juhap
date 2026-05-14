import rawPosts from "../data/communityPosts.json"
import { FEATURE_CHIPS } from "../data/categoryFilterConfig"
import { QUESTION_MOCK_SEEDS } from "./communityQuestionData"
import { usersMockById } from "./usersMock"

export type FeedPost = {
  id: number
  authorId: number
  authorName?: string
  title: string
  body: string
  pairingSummary?: string
  photoIds?: string[]
  imageSrc?: string
  similarPostIds?: number[]
  createdAt: string
  likeCount: number
  commentCount: number
  popularityScore: number
  rating?: number
  reviewCount?: number
  drinkEnglishName?: string
  drinkCountry?: string
  foodParentCategory?: string
  locationLabel?: string
  isQna?: boolean
  answerPreview?: string
  answerCount?: number
  searchTags?: string[]
  situation?: string
  drinkType?: string
  categories?: string[]
  detailCategories?: string[]
  features?: string[]
  foods?: string[]
  priceWon?: number
  abv?: number
  detailMockKey?: string
}

export type QuestionThumbVariant = "none" | "bottle" | "photo"
export type CommunityTagType = "liquor" | "food" | "hashtag"

export const extractPairingTitle = (title: string) => {
  const match = title.match(/([^\n+]{2,}?)\s*\+\s*([^\n+]{2,}?)(?=[,.\n]|$)/)
  if (!match) return title
  return `${match[1].trim()} + ${match[2].trim()}`
}

export const getPairingTagsFromTitle = (title: string) => {
  const pairingTitle = extractPairingTitle(title)
  if (!pairingTitle.includes("+")) return { liquorTag: "", foodTag: "" }
  const [left, right] = pairingTitle.split("+").map((value) => value.trim())
  return { liquorTag: left ?? "", foodTag: right ?? "" }
}

const FEATURE_CHIP_SET = new Set(FEATURE_CHIPS)

export const normalizeCommunityFeatures = (features: unknown, limit?: number) => {
  if (!Array.isArray(features)) return []

  const normalized = Array.from(
    new Set(
      features
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && FEATURE_CHIP_SET.has(value)),
    ),
  )

  return typeof limit === "number" && limit >= 0 ? normalized.slice(0, limit) : normalized
}

export const resolvePairingTags = ({
  pairingTitle = "",
  title = "",
  drinkType = "",
  foods,
}: {
  pairingTitle?: string
  title?: string
  drinkType?: string
  foods?: string[]
}) => {
  const titleSource = pairingTitle.trim() || title.trim()
  const fromTitle = titleSource ? getPairingTagsFromTitle(titleSource) : { liquorTag: "", foodTag: "" }
  const foodTag = Array.isArray(foods) ? (foods.find((item) => typeof item === "string" && item.trim())?.trim() ?? "") : ""

  return {
    liquorTag: fromTitle.liquorTag || drinkType.trim(),
    foodTag: fromTitle.foodTag || foodTag,
  }
}

export const deriveCommunityTagBundle = ({
  pairingTitle = "",
  title = "",
  drinkType = "",
  foods,
  features,
}: {
  pairingTitle?: string
  title?: string
  drinkType?: string
  foods?: string[]
  features?: unknown
}) => {
  const { liquorTag, foodTag } = resolvePairingTags({
    pairingTitle,
    title,
    drinkType,
    foods,
  })

  return {
    liquorTag: liquorTag.trim(),
    foodTag: foodTag.trim(),
    featureTags: normalizeCommunityFeatures(features, 2),
  }
}

export const getCommunityTagBundleFromPost = (post: Pick<FeedPost, "title" | "categories" | "foods" | "features">) =>
  deriveCommunityTagBundle({
    pairingTitle: extractPairingTitle(post.title),
    title: post.title,
    drinkType: post.categories?.[0] ?? "",
    foods: post.foods,
    features: post.features,
  })

export const matchesCommunityTag = (post: FeedPost, tagType: CommunityTagType, tagValue: string) => {
  const normalizeTag = (value: string) => value.replace(/\s+/g, "").toLowerCase()
  const expandTagVariants = (value: string) => {
    const normalized = normalizeTag(value)
    if (!normalized) return []

    const variants = new Set([normalized])
    if (normalized.endsWith("함")) variants.add(`${normalized.slice(0, -1)}한`)
    if (normalized.endsWith("한")) variants.add(`${normalized.slice(0, -1)}함`)
    if (normalized.endsWith("움")) variants.add(`${normalized.slice(0, -1)}운`)
    if (normalized.endsWith("운")) variants.add(`${normalized.slice(0, -1)}움`)

    return Array.from(variants)
  }
  const normalizedTags = expandTagVariants(tagValue)
  if (normalizedTags.length === 0) return false

  const tagBundle = getCommunityTagBundleFromPost(post)
  const matchesAnyTag = (value: string) => {
    const candidate = normalizeTag(value)
    return normalizedTags.some((tag) => candidate === tag || candidate.includes(tag) || tag.includes(candidate))
  }

  if (tagType === "hashtag") {
    const titleTags = getPairingTagsFromTitle(post.title)
    const candidates = [
      ...tagBundle.featureTags,
      ...(post.features ?? []),
      ...(post.searchTags ?? []),
      ...(post.categories ?? []),
      ...(post.detailCategories ?? []),
      ...(post.foods ?? []),
      post.categories?.[0] ?? "",
      titleTags.liquorTag,
      titleTags.foodTag,
      post.title,
      post.pairingSummary ?? "",
      post.body,
    ]

    return candidates
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .some(matchesAnyTag)
  }

  const titleTags = getPairingTagsFromTitle(post.title)
  const candidates =
    tagType === "liquor"
      ? [tagBundle.liquorTag, titleTags.liquorTag, ...(post.categories ?? []), ...(post.searchTags ?? [])]
      : [tagBundle.foodTag, titleTags.foodTag, ...(post.foods ?? []), ...(post.searchTags ?? [])]

  return candidates
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .some(matchesAnyTag)
}

export const resolveQuestionThumbVariant = (post: Pick<FeedPost, "photoIds" | "drinkType" | "categories" | "detailCategories">): QuestionThumbVariant => {
  if (Array.isArray(post.photoIds) && post.photoIds.some((photoId) => typeof photoId === "string" && photoId.trim().length > 0)) {
    return "photo"
  }

  const hasDrinkHint =
    (typeof post.drinkType === "string" && post.drinkType.trim().length > 0) ||
    (Array.isArray(post.categories) && post.categories.some((category) => typeof category === "string" && category.trim().length > 0)) ||
    (Array.isArray(post.detailCategories) && post.detailCategories.some((category) => typeof category === "string" && category.trim().length > 0))

  return hasDrinkHint ? "bottle" : "none"
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const getPairingSummaryText = (post: Pick<FeedPost, "pairingSummary" | "body" | "title">) => {
  const summary = post.pairingSummary?.trim()
  if (summary) return summary
  const body = post.body?.trim()
  if (!body) return ""
  return body.split(/[.!?]\s+|\n/)[0]?.trim() ?? ""
}

export const getPairingDetailBodyText = (post: Pick<FeedPost, "pairingSummary" | "body" | "title">, summaryText = "") => {
  const body = post.body?.trim() ?? ""
  if (!body) return ""
  const summary = summaryText.trim() || post.pairingSummary?.trim() || ""
  const title = post.title?.trim() ?? ""
  for (const prefix of [summary, title]) {
    if (!prefix) continue
    const stripped = body.replace(new RegExp(`^${escapeRegExp(prefix)}[\\s.?!]*`, "u"), "").trim()
    if (stripped && stripped !== body) return stripped
  }
  return body
}

const basePosts = rawPosts as FeedPost[]

const toCreatedAtFromMinutesAgo = (minutesAgo: number) => {
  const now = Date.now()
  return new Date(now - minutesAgo * 60_000).toISOString()
}

type QuestionMockSeed = Omit<FeedPost, "createdAt"> & { minutesAgo: number }

const questionMockSeeds: QuestionMockSeed[] = QUESTION_MOCK_SEEDS as unknown as QuestionMockSeed[]

const questionMockPosts: FeedPost[] = questionMockSeeds.map(({ minutesAgo, ...rest }) => ({
  ...rest,
  createdAt: toCreatedAtFromMinutesAgo(minutesAgo),
}))

const applyUserDerivedFields = (post: FeedPost): FeedPost => {
  const user = usersMockById[post.authorId]
  if (!user?.name) return post
  return { ...post, authorName: user.name }
}

const REVIEW_IMAGE_POOL = [3, 4, 5, 6, 7, 8, 9] as const
const IMAGE_COUNT_SEED = 7
const IMAGE_START_SEED = 11
const MAX_REVIEW_IMAGES_PER_POST = 3

const isFixedSeedReviewPost = (post: FeedPost) => post.id === 1001 || post.id === 1002

const normalizePhotoIds = (photoIds: unknown): string[] | undefined => {
  if (!Array.isArray(photoIds)) return undefined
  const normalized = Array.from(
    new Set(
      photoIds
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
  return normalized
}

const ensureReviewPhotoIds = (post: FeedPost): FeedPost => {
  const normalizedPhotoIds = normalizePhotoIds(post.photoIds)
  if (post.isQna || isFixedSeedReviewPost(post) || normalizedPhotoIds) {
    return normalizedPhotoIds ? { ...post, photoIds: normalizedPhotoIds } : post
  }

  const count = Math.abs(post.id * IMAGE_COUNT_SEED) % (MAX_REVIEW_IMAGES_PER_POST + 1)
  if (count === 0) return post

  const startIndex = Math.abs(post.id * IMAGE_START_SEED) % REVIEW_IMAGE_POOL.length
  const photoIds = Array.from({ length: count }).map((_, index) => {
    const imageNo = REVIEW_IMAGE_POOL[(startIndex + index) % REVIEW_IMAGE_POOL.length]
    return `review_image_${String(imageNo).padStart(2, "0")}`
  })

  return { ...post, photoIds }
}

const highCommentCountByPostId: Record<number, number> = {
  92001: 12,
  92004: 14,
  1101: 12,
  1002: 11,
  1005: 13,
}

const getNormalizedCommentCount = (postId: number) => highCommentCountByPostId[postId] ?? Math.abs(postId) % 6

const normalizePostCommentCount = (post: FeedPost): FeedPost => {
  const commentCount = getNormalizedCommentCount(post.id)
  return {
    ...post,
    commentCount,
    answerCount: post.isQna ? commentCount : post.answerCount,
  }
}

export const feedPosts: FeedPost[] = [...questionMockPosts, ...basePosts].map((post) => {
  const withPhotos = ensureReviewPhotoIds(post)
  return applyUserDerivedFields(normalizePostCommentCount(withPhotos))
})
