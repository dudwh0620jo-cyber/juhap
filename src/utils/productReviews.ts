export type DrinkReview = {
  id: string
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

type GetVisibleReviewsOptions = {
  photoOnly: boolean
  sortKey: ProductReviewSortKey
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
