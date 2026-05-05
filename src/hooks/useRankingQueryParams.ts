import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { normalizeRankingCategory, normalizeRankingPeriod, type RankingCategory, type RankingPeriod } from "../utils/rankingData"

type SetKey = "period" | "cat"

export function useRankingQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const rankingPeriod = normalizeRankingPeriod(searchParams.get("period")) ?? "weekly"
  const rankingCategory = normalizeRankingCategory(searchParams.get("cat")) ?? "all"

  const setQueryParam = useCallback(
    (key: SetKey, value: string) => {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set(key, value)
      setSearchParams(nextParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return {
    rankingPeriod: rankingPeriod satisfies RankingPeriod,
    rankingCategory: rankingCategory satisfies RankingCategory,
    setQueryParam,
  }
}

