export function calculateRangePercent(value: number, min: number, max: number): number {
  const denom = max - min
  if (denom <= 0) {
    return value <= min ? 0 : 100
  }
  return Math.round(((value - min) / denom) * 1000) / 10
}

export function isWithinRange(value: number, min: number, max: number, includeOpenMax = false): boolean {
  if (value < min) {
    return false
  }
  if (includeOpenMax) {
    return true
  }
  return value <= max
}
