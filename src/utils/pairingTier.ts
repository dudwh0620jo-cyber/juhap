import { getTierClassName, type Tier } from "./tier"

export const pairingTiersByAuthorId: Record<number, Tier> = {
  1001: 1,
  1002: 2,
  1004: 3,
  1006: 1,
  1011: 2,
  1012: 3,
  1013: 2,
  1014: 1,
  1015: 2,
  6001: 3,
  6002: 4,
  6004: 3,
  6005: 3,
  6006: 1,
  6007: 1,
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
