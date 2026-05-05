export type Tier = 1 | 2 | 3 | 4 | 5

export const getTierClassName = (tier: number | undefined, baseClassName: string) => {
  if (tier === 5) return `${baseClassName} is_tier5`
  if (tier === 4) return `${baseClassName} is_tier4`
  if (tier === 3) return `${baseClassName} is_tier3`
  if (tier === 2) return `${baseClassName} is_tier2`
  if (tier === 1) return `${baseClassName} is_tier1`
  return baseClassName
}

