const STORAGE_KEY = "vote_picks"

export function getStoredPicks(): Record<string, 0 | 1> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

export function storePick(voteId: number, index: 0 | 1 | null) {
  const picks = getStoredPicks()
  if (index === null) {
    delete picks[String(voteId)]
  } else {
    picks[String(voteId)] = index
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(picks))
}
