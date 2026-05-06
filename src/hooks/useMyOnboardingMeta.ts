import { useMemo } from "react"
import { NONE_OPTION } from "../data/setupContent"
import { readUserProfile } from "../data/userProfile"

export function useMyOnboardingMeta() {
  const profile = readUserProfile()
  const nickname = profile.personalInfo.nickname.trim() || "익명"

  const metaLine = useMemo(() => {
    const drinkType = (profile.tastePreferences.drinkType ?? []).find((value) => value !== NONE_OPTION)?.trim()
    const traits = (profile.tastePreferences.trait ?? []).filter((value) => value !== NONE_OPTION)
    const traitA = (traits[0] ?? "").trim()
    const traitB = (traits[1] ?? "").trim()

    const parts = ["20대/ 여자", drinkType, traitA, traitB].filter(Boolean)
    const base = parts.join("/ ")
    return `${base} 선호`
  }, [profile.tastePreferences.drinkType, profile.tastePreferences.trait])

  return { nickname, metaLine } as const
}
