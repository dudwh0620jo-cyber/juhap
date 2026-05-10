export const normalizeForMatch = (value: string) => value.toLowerCase().replace(/[\s/,_-]+/g, "")

export const chipMatchesQuery = (text: string, query: string) => {
  if (!query) return true
  const q = normalizeForMatch(query)
  const normalizedText = normalizeForMatch(text)
  if (normalizedText.includes(q)) return true

  const tokens = text
    .toLowerCase()
    .split(/[\s/,_-]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  return tokens.some((token) => normalizeForMatch(token).includes(q))
}
