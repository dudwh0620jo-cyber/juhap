import { useMemo, useState } from "react"
import type { CategoryListItem } from "../components/CategoryItemCard"
import { normalizeForMatch } from "../utils/searchMatch"

type Params = {
  searchValue: string
  searchableItems: CategoryListItem[]
  recentSearchKey?: string
}

const DEFAULT_RECENT_KEY = "category_recent_searches"

export function useCategorySearchExperience({ searchValue, searchableItems, recentSearchKey = DEFAULT_RECENT_KEY }: Params) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(recentSearchKey)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === "string")
    } catch {
      // ignore
    }
    return []
  })

  const recommendedProducts = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return []
    return searchableItems
      .filter((item) => {
        const name = item.name.trim().toLowerCase()
        return name.includes(q)
      })
      .slice(0, 6)
  }, [searchValue, searchableItems])

  const recommendedSearches = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return []
    const words = new Set<string>()
    searchableItems.forEach((item) => {
      const name = item.name.trim()
      if (name.toLowerCase().includes(q)) words.add(name)
    })
    return Array.from(words).slice(0, 12)
  }, [searchValue, searchableItems])

  const hasExactProductMatch = useMemo(() => {
    const q = normalizeForMatch(searchValue.trim())
    if (!q) return false
    return searchableItems.some((item) => normalizeForMatch(item.name) === q)
  }, [searchValue, searchableItems])

  const saveRecentSearch = (value: string) => {
    const keyword = value.trim()
    if (!keyword) return
    setRecentSearches((prev) => {
      const next = [keyword, ...prev.filter((item) => item !== keyword)].slice(0, 12)
      window.localStorage.setItem(recentSearchKey, JSON.stringify(next))
      return next
    })
  }

  const removeRecentSearch = (value: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== value)
      window.localStorage.setItem(recentSearchKey, JSON.stringify(next))
      return next
    })
  }

  return {
    recentSearches,
    recommendedProducts,
    recommendedSearches,
    hasExactProductMatch,
    saveRecentSearch,
    removeRecentSearch,
  }
}
