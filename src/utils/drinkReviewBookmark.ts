export const getDrinkReviewBookmarkPostId = (reviewId: string) => {
  if (/^\d+$/.test(reviewId)) return Number(`9${reviewId}`)
  const source = reviewId.trim()
  if (!source) return NaN

  let hash = 0
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 100000000
  }
  return Number(`97${String(hash).padStart(8, "0")}`)
}

