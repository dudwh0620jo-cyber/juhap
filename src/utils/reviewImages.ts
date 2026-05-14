const assetModules = import.meta.glob("../assets/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  import: "default",
}) as Record<string, string>

const extensionPriority: Record<string, number> = {
  png: 6,
  jpg: 5,
  jpeg: 4,
  webp: 3,
  gif: 2,
  svg: 1,
}

const assetById = Object.entries(assetModules).reduce<Record<string, string>>((acc, [path, src]) => {
  const fileName = path.split("/").pop() ?? ""
  const baseName = fileName.replace(/\.[^.]+$/, "")
  const ext = (fileName.split(".").pop() ?? "").toLowerCase()

  const current = acc[baseName]
  if (!current) {
    acc[baseName] = src
    return acc
  }

  const currentPath = Object.entries(assetModules).find(([, value]) => value === current)?.[0] ?? ""
  const currentFileName = currentPath.split("/").pop() ?? ""
  const currentExt = (currentFileName.split(".").pop() ?? "").toLowerCase()

  if ((extensionPriority[ext] ?? 0) > (extensionPriority[currentExt] ?? 0)) {
    acc[baseName] = src
  }

  return acc
}, {})

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
