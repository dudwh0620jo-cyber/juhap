const assetModules = import.meta.glob("../assets/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  import: "default",
}) as Record<string, string>

const assetById = Object.fromEntries(
  Object.entries(assetModules).map(([path, src]) => {
    const fileName = path.split("/").pop() ?? ""
    const baseName = fileName.replace(/\.[^.]+$/, "")
    return [baseName, src]
  }),
) as Record<string, string>

const sortedReviewImages = Object.entries(assetModules)
  .filter(([path]) => /\/review_image_\d+\.png$/i.test(path))
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

  const matchedAsset = assetById[trimmed]
  if (matchedAsset) return matchedAsset

  const match = photoId.match(/(\d+)$/)
  if (!match) return undefined
  const index = Number.parseInt(match[1], 10) - 1
  if (!Number.isFinite(index) || index < 0 || index >= sortedReviewImages.length) return undefined
  return sortedReviewImages[index]
}
