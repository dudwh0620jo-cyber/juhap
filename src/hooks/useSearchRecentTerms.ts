import { useCallback } from "react"
import { useStoredStringArray } from "../utils/storage"

export function useSearchRecentTerms(key: string, maxTerms: number) {
  const { value: recentTerms, setValue: setRecentTerms } = useStoredStringArray(key, maxTerms)

  const addTerm = useCallback(
    (term: string) => {
      const query = term.trim()
      if (!query) return

      setRecentTerms((prev) => {
        const normalized = query.toLowerCase()
        const next = [query, ...prev.filter((item) => item.toLowerCase() !== normalized)]
        return next.slice(0, maxTerms)
      })
    },
    [maxTerms, setRecentTerms],
  )

  const deleteTerm = useCallback(
    (term: string) => {
      setRecentTerms((prev) => prev.filter((item) => item !== term))
    },
    [setRecentTerms],
  )

  return { recentTerms, setRecentTerms, addTerm, deleteTerm } as const
}

