import { useEffect, useState } from "react"

export type UserTasteProfile = {
  drinkTypes: string[]
  traits: string[]
}

export const USER_TASTE_PROFILE_KEY = "user_taste_profile_v1"

export function loadUserTasteProfile(): UserTasteProfile | null {
  try {
    const raw = window.localStorage.getItem(USER_TASTE_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<UserTasteProfile> | null
    if (!parsed) return null
    const drinkTypes = Array.isArray(parsed.drinkTypes) ? parsed.drinkTypes.filter((v): v is string => typeof v === "string") : []
    const traits = Array.isArray(parsed.traits) ? parsed.traits.filter((v): v is string => typeof v === "string") : []
    return { drinkTypes, traits }
  } catch {
    return null
  }
}

export function saveUserTasteProfile(next: UserTasteProfile) {
  try {
    window.localStorage.setItem(USER_TASTE_PROFILE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage errors
  }
}

export function useUserTasteProfile() {
  const [value, setValue] = useState<UserTasteProfile | null>(() => (typeof window === "undefined" ? null : loadUserTasteProfile()))

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== USER_TASTE_PROFILE_KEY) return
      setValue(loadUserTasteProfile())
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return { value, setValue } as const
}

