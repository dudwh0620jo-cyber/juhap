import { useEffect, useState } from "react"

export type UserProfile = {
  nickname: string
}

export const USER_PROFILE_KEY = "user_profile_v1"

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = window.localStorage.getItem(USER_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<UserProfile> | null
    if (!parsed || typeof parsed.nickname !== "string") return null
    return { nickname: parsed.nickname }
  } catch {
    return null
  }
}

export function saveUserProfile(next: UserProfile) {
  try {
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage errors
  }
}

export function useUserProfile() {
  const [value, setValue] = useState<UserProfile | null>(() =>
    typeof window === "undefined" ? null : loadUserProfile(),
  )

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== USER_PROFILE_KEY) return
      setValue(loadUserProfile())
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return { value, setValue } as const
}

