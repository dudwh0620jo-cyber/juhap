import { getPairingDetailSimilarPostById } from "./pairingDetailMock"

const reviewImageModules = import.meta.glob("../assets/review_image_*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>

const sortedReviewImages = Object.entries(reviewImageModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

export function resolveReviewImage(photoId: string): string | undefined {
  const trimmed = photoId.trim()
  if (!trimmed) return undefined

  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed
  }

  if (/\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(trimmed)) {
    return trimmed
  }

  if (photoId.startsWith("similar_image_")) {
    const similarId = Number.parseInt(photoId.replace("similar_image_", ""), 10)
    if (Number.isFinite(similarId)) {
      return getPairingDetailSimilarPostById(similarId)?.imageSrc
    }
  }

  const match = photoId.match(/(\d+)$/)
  if (!match) return undefined
  const index = Number.parseInt(match[1], 10) - 1
  if (!Number.isFinite(index) || index < 0 || index >= sortedReviewImages.length) return undefined
  return sortedReviewImages[index]
}
