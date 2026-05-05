export function validatePostIdsExist(availableIds: readonly number[], requiredIds: readonly number[]) {
  const available = new Set(availableIds)
  const missing = requiredIds.filter((id) => !available.has(id))
  return { ok: missing.length === 0, missing }
}

