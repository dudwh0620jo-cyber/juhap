export type DrinkReview = {
  id: string
  pairingPostId?: number
  title: string
  body: string
  tags: string[]
  images: string[]
  likes: number
  comments: number
  rating: string
  createdAt: string
  recommendScore: number
  alcoholTag?: string
  foodTag?: string
  location?: string
  author: { name: string; grade: string; preference: string; avatar: string }
}

export type ProductReviewSortKey = "latest" | "recommend" | "popular"

const DRINK_REVIEW_TAGS = ["부드러운", "무거운", "가벼운", "톡쏘는", "과일향", "상큼한", "은은한"] as const
const COMMON_DRINK_REVIEW_TAGS = ["과일향", "은은한"] as const

type GetVisibleReviewsOptions = {
  photoOnly: boolean
  sortKey: ProductReviewSortKey
}

const normalizeDrinkReviewTag = (tag: string) => {
  const normalized = tag.replace(/^#/, "").trim()
  const aliases: Record<string, (typeof DRINK_REVIEW_TAGS)[number]> = {
    부드러움: "부드러운",
    깔끔함: "상큼한",
    깔끔한: "상큼한",
    프리미엄: "은은한",
    드라이: "가벼운",
    은은함: "은은한",
  }

  return aliases[normalized] ?? normalized
}

const getStableTagIndex = (seed: string, offset = 0) => {
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return Math.abs(hash + offset) % DRINK_REVIEW_TAGS.length
}

export function getDrinkReviewDisplayTags(review: Pick<DrinkReview, "id" | "title" | "tags">) {
  const allowedTags = new Set<string>(DRINK_REVIEW_TAGS)
  const tags = review.tags
    .map(normalizeDrinkReviewTag)
    .filter((tag) => allowedTags.has(tag))

  const uniqueTags = Array.from(new Set(tags)).slice(0, 2)
  if (uniqueTags.length >= 2) return uniqueTags

  const fallbackTags =
    getStableTagIndex(`${review.id}-${review.title}`) % 5 === 0
      ? [
          DRINK_REVIEW_TAGS[getStableTagIndex(review.id, 1)],
          DRINK_REVIEW_TAGS[getStableTagIndex(review.title, 3)],
        ]
      : [...COMMON_DRINK_REVIEW_TAGS]

  fallbackTags.forEach((tag) => {
    if (uniqueTags.length < 2 && !uniqueTags.includes(tag)) uniqueTags.push(tag)
  })

  DRINK_REVIEW_TAGS.forEach((tag) => {
    if (uniqueTags.length < 2 && !uniqueTags.includes(tag)) uniqueTags.push(tag)
  })

  return uniqueTags
}

export function getVisibleProductReviews(
  reviews: DrinkReview[],
  { photoOnly, sortKey }: GetVisibleReviewsOptions,
) {
  const filteredReviews = photoOnly ? reviews.filter((review) => review.images.length > 0) : reviews
  const sortedReviews = [...filteredReviews]

  if (sortKey === "popular") {
    return sortedReviews.sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
  }

  if (sortKey === "recommend") {
    return sortedReviews.sort((a, b) => b.recommendScore - a.recommendScore)
  }

  return sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
