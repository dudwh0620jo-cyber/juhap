import { quizTodayId } from "../data/quizContent"

const QUIZ_PROGRESS_KEY = "juhap_quiz_progress_v1"

export type TodayQuizProgress = {
  quizId: string
  answeredAtIso: string
  isCorrect: boolean
  earnedPoints: number
}

type QuizProgressState = {
  today?: TodayQuizProgress
}

function readState(): QuizProgressState {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(QUIZ_PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as QuizProgressState
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeState(next: QuizProgressState) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return
  window.localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(next))
}

export function readTodayQuizProgress(): TodayQuizProgress | null {
  const state = readState()
  const today = state.today
  if (!today || today.quizId !== quizTodayId) return null
  return today
}

export function writeTodayQuizProgress(progress: TodayQuizProgress) {
  const state = readState()
  writeState({ ...state, today: progress })
}

export function clearTodayQuizProgress() {
  const state = readState()
  const { today: _today, ...rest } = state
  writeState(rest)
}
