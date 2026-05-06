import { useMemo } from "react"
import { useUserProfile } from "../utils/userProfile"
import { useUserTasteProfile } from "../utils/userTasteProfile"

export function useMyOnboardingMeta() {
  const { value: profile } = useUserProfile()
  const { value: taste } = useUserTasteProfile()

  const nickname = profile?.nickname?.trim() ? profile.nickname.trim() : "익명"

  const metaLine = useMemo(() => {
    const drinkType = (taste?.drinkTypes?.[0] ?? "").trim()
    const traits = taste?.traits ?? []
    const traitA = (traits[0] ?? "").trim()
    const traitB = (traits[1] ?? "").trim()

    const parts = ["20대/ 여자", drinkType, traitA, traitB].filter(Boolean)
    const base = parts.join("/ ")
    return `${base} 선호`
  }, [taste?.drinkTypes, taste?.traits])

  return { nickname, metaLine } as const
}
