import { useEffect, useState } from "react"

export function useStoredNumberSet(key: string, defaultIds: readonly number[]) {
  const [value, setValue] = useState<Set<number>>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) {
        return new Set(defaultIds)
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return new Set(defaultIds)
      }
      const ids = parsed.filter((item): item is number => typeof item === "number" && Number.isFinite(item))
      return new Set(ids)
    } catch {
      return new Set(defaultIds)
    }
  })

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) {
        window.localStorage.setItem(key, JSON.stringify(Array.from(value)))
      }
    } catch {
      // ignore storage errors
    }
  }, [key, value])

  const toggle = (id: number) => {
    setValue((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      try {
        window.localStorage.setItem(key, JSON.stringify(Array.from(next)))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  return { value, setValue, toggle }
}

export function useStoredBooleanRecordFromIds(key: string) {
  const [value, setValue] = useState<Record<number, boolean>>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) {
        return {}
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return {}
      }
      const record: Record<number, boolean> = {}
      for (const item of parsed) {
        if (typeof item === "number" && Number.isFinite(item)) {
          record[item] = true
        }
      }
      return record
    } catch {
      return {}
    }
  })

  const toggle = (id: number) => {
    setValue((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        const ids = Object.entries(next)
          .filter(([, liked]) => liked)
          .map(([entryKey]) => Number(entryKey))
          .filter((num) => Number.isFinite(num))
        window.localStorage.setItem(key, JSON.stringify(ids))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  return { value, setValue, toggle }
}

export function useStoredStringArray(key: string, maxLength: number) {
  const [value, setValue] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) {
        return []
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed.filter((term): term is string => typeof term === "string" && term.trim().length > 0)
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value.slice(0, maxLength)))
    } catch {
      // ignore storage errors
    }
  }, [key, maxLength, value])

  return { value, setValue }
}

