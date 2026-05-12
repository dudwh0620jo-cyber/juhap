const questionImageModules = import.meta.glob("../assets/question_post_image_*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>

const sortedQuestionImages = Object.entries(questionImageModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

export function resolveQuestionImage(photoId: string): string | undefined {
  const match = photoId.match(/(\d+)$/)
  if (!match) return undefined
  const index = Number.parseInt(match[1], 10) - 1
  if (!Number.isFinite(index) || index < 0 || index >= sortedQuestionImages.length) return undefined
  return sortedQuestionImages[index]
}
