import rawPosts from "../data/communityPosts.json"
import { FEATURE_CHIPS } from "../data/categoryFilterConfig"
import { getAllPairingDetailSimilarPosts } from "./pairingDetailMock"
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
  createdAt: string
  likeCount: number
  commentCount: number
  popularityScore: number
  rating?: number
  reviewCount?: number
  locationLabel?: string
  isQna?: boolean
  answerPreview?: string
  answerCount?: number
  searchTags?: string[]
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
    liquorTag: drinkType.trim() || fromTitle.liquorTag,
    foodTag: foodTag || fromTitle.foodTag,
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

export const getCommunityTagBundleFromPost = (post: Pick<FeedPost, "title" | "drinkType" | "foods" | "features">) =>
  deriveCommunityTagBundle({
    pairingTitle: extractPairingTitle(post.title),
    title: post.title,
    drinkType: post.drinkType ?? "",
    foods: post.foods,
    features: post.features,
  })

export const matchesCommunityTag = (post: FeedPost, tagType: CommunityTagType, tagValue: string) => {
  const normalizedTag = tagValue.replace(/\s+/g, "").toLowerCase()
  if (!normalizedTag) return false

  const tagBundle = getCommunityTagBundleFromPost(post)

  if (tagType === "hashtag") {
    return tagBundle.featureTags
      .map((tag) => tag.replace(/\s+/g, "").toLowerCase())
      .some((tag) => tag === normalizedTag || tag.includes(normalizedTag))
  }

  const candidate = (tagType === "liquor" ? tagBundle.liquorTag : tagBundle.foodTag).replace(/\s+/g, "").toLowerCase()
  return candidate === normalizedTag || candidate.includes(normalizedTag)
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

const pickSimilarFeatureTags = (index: number) => {
  if (FEATURE_CHIPS.length === 0) return []
  const startIndex = index % FEATURE_CHIPS.length
  return Array.from({ length: Math.min(2, FEATURE_CHIPS.length) }, (_, offset) => FEATURE_CHIPS[(startIndex + offset) % FEATURE_CHIPS.length])
}

const buildSimilarMockPost = (item: ReturnType<typeof getAllPairingDetailSimilarPosts>[number], index: number): FeedPost => {
  const pairingTitle = item.pairingTitle.trim()
  const { liquorTag, foodTag } = getPairingTagsFromTitle(pairingTitle)

  return {
    id: item.id,
    authorId: item.authorId,
    title: item.title?.trim() || pairingTitle,
    pairingSummary: pairingTitle,
    body: `${pairingTitle} 조합으로 가볍게 즐기기 좋아요.`,
    createdAt: toCreatedAtFromMinutesAgo((index + 1) * 37),
    likeCount: item.reviewCount ?? 0,
    commentCount: Math.max(0, Math.round((item.reviewCount ?? 0) / 40)),
    popularityScore: item.reviewCount ?? 0,
    rating: item.rating,
    reviewCount: item.reviewCount,
    locationLabel: item.locationLabel,
    drinkType: item.drinkType || liquorTag,
    foods: foodTag ? [foodTag] : [],
    features: normalizeCommunityFeatures(pickSimilarFeatureTags(index), 2),
    imageSrc: item.imageSrc,
    photoIds: [`similar_image_${item.id}`],
  }
}

const similarMockPosts: FeedPost[] = getAllPairingDetailSimilarPosts().map((item, index) => buildSimilarMockPost(item, index))

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

const ensureReviewPhotoIds = (post: FeedPost): FeedPost => {
  if (post.isQna || isFixedSeedReviewPost(post) || post.photoIds) return post

  const count = Math.abs(post.id * IMAGE_COUNT_SEED) % (MAX_REVIEW_IMAGES_PER_POST + 1)
  if (count === 0) return post

  const startIndex = Math.abs(post.id * IMAGE_START_SEED) % REVIEW_IMAGE_POOL.length
  const photoIds = Array.from({ length: count }).map((_, index) => {
    const imageNo = REVIEW_IMAGE_POOL[(startIndex + index) % REVIEW_IMAGE_POOL.length]
    return `review_image_${String(imageNo).padStart(2, "0")}`
  })

  return { ...post, photoIds }
}

export const feedPosts: FeedPost[] = [...questionMockPosts, ...similarMockPosts, ...basePosts].map((post) => {
  const withPhotos = ensureReviewPhotoIds(post)
  return applyUserDerivedFields(withPhotos)
})

