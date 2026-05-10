import { useCallback, useEffect, useMemo, useState } from "react"

export function useStoredNumberSet(key: string, defaultIds: readonly number[]) {
  const defaultSet = useMemo(() => new Set(defaultIds), [defaultIds])
  const [value, setValue] = useState<Set<number>>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return new Set(defaultSet)
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return new Set(defaultSet)
      const next = parsed.filter((item): item is number => typeof item === "number" && Number.isFinite(item))
      return new Set(next.length > 0 ? next : Array.from(defaultSet))
    } catch {
      return new Set(defaultSet)
    }
  })

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : []
        setValue(
          new Set(
            Array.isArray(parsed)
              ? parsed.filter((item): item is number => typeof item === "number" && Number.isFinite(item))
              : [],
          ),
        )
      } catch {
        setValue(new Set())
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [key])

  const toggle = useCallback(
    (id: number) => {
      setValue((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        try {
          window.localStorage.setItem(key, JSON.stringify(Array.from(next)))
        } catch {
          // ignore storage errors
        }
        return next
      })
    },
    [key],
  )

  return { value, setValue, toggle } as const
}

export function useStoredBooleanRecordFromIds(key: string) {
  const [value, setValue] = useState<Record<number, boolean>>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return {}
      const record: Record<number, boolean> = {}
      for (const id of parsed) {
        if (typeof id === "number" && Number.isFinite(id)) record[id] = true
      }
      return record
    } catch {
      return {}
    }
  })

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : []
        const record: Record<number, boolean> = {}
        if (Array.isArray(parsed)) {
          for (const id of parsed) {
            if (typeof id === "number" && Number.isFinite(id)) record[id] = true
          }
        }
        setValue(record)
      } catch {
        setValue({})
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [key])

  const toggle = useCallback(
    (id: number) => {
      setValue((prev) => {
        const next = { ...prev, [id]: !prev[id] }
        const selected = Object.keys(next)
          .map((k) => Number(k))
          .filter((k) => next[k])
        try {
          window.localStorage.setItem(key, JSON.stringify(selected))
        } catch {
          // ignore storage errors
        }
        return next
      })
    },
    [key],
  )

  return { value, setValue, toggle } as const
}

export function useStoredStringArray(key: string, maxLength: number) {
  const [value, setValue] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((item): item is string => typeof item === "string").slice(0, maxLength)
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage errors
    }
  }, [key, value])

  return { value, setValue } as const
}

export function useStoredNullableStringRecord(key: string) {
  const [value, setValue] = useState<Record<number, string | null>>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
      const next: Record<number, string | null> = {}
      for (const [recordKey, recordValue] of Object.entries(parsed)) {
        const numericKey = Number(recordKey)
        if (!Number.isFinite(numericKey)) continue
        next[numericKey] = typeof recordValue === "string" ? recordValue : null
      }
      return next
    } catch {
      return {}
    }
  })

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : {}
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setValue({})
          return
        }
        const next: Record<number, string | null> = {}
        for (const [recordKey, recordValue] of Object.entries(parsed)) {
          const numericKey = Number(recordKey)
          if (!Number.isFinite(numericKey)) continue
          next[numericKey] = typeof recordValue === "string" ? recordValue : null
        }
        setValue(next)
      } catch {
        setValue({})
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [key])

  return { value, setValue } as const
}
