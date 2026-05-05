export const normalizeSearchText = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim()

// For typo-ish / adjacency matching like "블렌디드몰트" vs "블렌디드 몰트",
// or "논알콜 저도수" vs "논알콜/저도수".
export const normalizeFuzzyText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\/()［］\[\],.\-·]/g, "")
    .trim()

export const includesNormalized = (value: string, query: string) => {
  const normalizedValue = normalizeSearchText(value)
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return true
  }
  if (normalizedValue.includes(normalizedQuery)) {
    return true
  }
  return normalizeFuzzyText(value).includes(normalizeFuzzyText(query))
}

