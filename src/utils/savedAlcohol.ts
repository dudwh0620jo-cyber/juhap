const SAVED_ALCOHOL_PRODUCT_IDS_KEY = "juhap_saved_alcohol_product_ids"

const isBrowser = typeof window !== "undefined"

export function readSavedAlcoholProductIds() {
  if (!isBrowser) return [] as string[]
  try {
    const raw = window.localStorage.getItem(SAVED_ALCOHOL_PRODUCT_IDS_KEY)
    if (!raw) return [] as string[]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [] as string[]
    return parsed.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  } catch {
    return [] as string[]
  }
}

export function writeSavedAlcoholProductIds(productIds: string[]) {
  if (!isBrowser) return
  const next = Array.from(new Set(productIds.filter((value) => value.trim().length > 0)))
  window.localStorage.setItem(SAVED_ALCOHOL_PRODUCT_IDS_KEY, JSON.stringify(next))
}

export function addSavedAlcoholProductId(productId: string) {
  const current = readSavedAlcoholProductIds()
  if (current.includes(productId)) return false
  const next = Array.from(new Set([...current, productId]))
  writeSavedAlcoholProductIds(next)
  return true
}

export function removeSavedAlcoholProductId(productId: string) {
  const current = readSavedAlcoholProductIds()
  if (!current.includes(productId)) return false
  const next = current.filter((id) => id !== productId)
  writeSavedAlcoholProductIds(next)
  return true
}

export function hasSavedAlcoholProductId(productId: string) {
  return readSavedAlcoholProductIds().includes(productId)
}
