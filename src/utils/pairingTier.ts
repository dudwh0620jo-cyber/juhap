import { getTierClassName, type Tier } from "./tier"

export const pairingTiersByAuthorId: Record<number, Tier> = {
  2001: 1,
  2002: 3,
  2003: 4,
  2004: 2,
  2019: 3,
  2025: 2,
  2101: 1,
  2102: 2,
  2103: 2,
  2104: 3,
  9999: 1,
}

export const pairingTierLabels: Record<Tier, string> = {
  1: "테이스터",
  2: "셀렉터",
  3: "큐레이터",
  4: "소믈리에",
  5: "마스터",
}

export const getPairingTierByUserId = (userId: number): Tier => pairingTiersByAuthorId[userId] ?? 1

export const getPairingTierLabel = (tier: number | undefined) => {
  if (tier === 1 || tier === 2 || tier === 3 || tier === 4 || tier === 5) return pairingTierLabels[tier]
  return pairingTierLabels[1]
}

export const getPairingTierLabelByUserId = (userId: number) => getPairingTierLabel(getPairingTierByUserId(userId))

export const getUserGradeBadgeClassNameByTier = (tier: number | undefined) => getTierClassName(tier, "user_grade_badge")

export const getUserGradeBadgeClassNameByUserId = (userId: number) =>
  getUserGradeBadgeClassNameByTier(getPairingTierByUserId(userId))

