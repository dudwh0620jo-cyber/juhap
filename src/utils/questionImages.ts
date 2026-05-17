const questionImageModules = import.meta.glob("../assets/question_post_image_*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>
const reviewImageModules = import.meta.glob("../assets/review_*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  import: "default",
}) as Record<string, string>

const sortedQuestionImages = Object.entries(questionImageModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)
const reviewImageByBaseName = Object.entries(reviewImageModules).reduce<Record<string, string>>((acc, [path, src]) => {
  const fileName = path.split("/").pop() ?? ""
  const baseName = fileName.replace(/\.[^.]+$/, "")
  if (baseName) acc[baseName] = src
  return acc
}, {})

export function resolveQuestionImage(photoId: string): string | undefined {
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

  const explicitAssetMatch = trimmed.match(/^question_post_image_(\d+)$/i)
  if (explicitAssetMatch) {
    const index = Number.parseInt(explicitAssetMatch[1], 10) - 1
    if (!Number.isFinite(index) || index < 0 || index >= sortedQuestionImages.length) return undefined
    return sortedQuestionImages[index]
  }

  const reviewAsset = reviewImageByBaseName[trimmed]
  if (reviewAsset) return reviewAsset

  const seededMatch = trimmed.match(/^question-image-(\d+)$/i)
  if (!seededMatch) return undefined
  const match = seededMatch
  if (!match) return undefined
  const index = Number.parseInt(match[1], 10) - 1
  if (!Number.isFinite(index) || index < 0 || index >= sortedQuestionImages.length) return undefined
  return sortedQuestionImages[index]
}
