import content from "./myPageContent.json"

export type ExchangeItem = {
  icon: string
  title: string
  description: string
  tags: string[]
  point: string
}

export type PointMission = {
  title: string
  reward: string
  action: string
}

export type MyPageProfileSummary = {
  gradeLabel: string
  followerCount: number
}

export type MyPagePointsSummary = {
  balance: number
  remainingToNextReward: number
  nextRewardLabel: string
}

type MyPageContentShape = {
  activityStats: Array<{ value: number; label: string }>
  tasteBars: Array<{ label: string; value: number; level: string; className: string }>
  exchangeTabs: string[]
  discountItems: ExchangeItem[]
  experienceItems: ExchangeItem[]
  pointMissions: PointMission[]
  profile: MyPageProfileSummary
  points: MyPagePointsSummary
  tasteSheetCloseMs: number
  exchangeVisibleLimit: number
}

const parsed = content as MyPageContentShape

export const activityStats = parsed.activityStats
export const tasteBars = parsed.tasteBars
export const exchangeTabs = parsed.exchangeTabs
export const discountItems = parsed.discountItems
export const experienceItems = parsed.experienceItems
export const pointMissions = parsed.pointMissions
export const myPageProfileSummary = parsed.profile
export const myPagePointsSummary = parsed.points
export const TASTE_SHEET_CLOSE_MS = parsed.tasteSheetCloseMs
export const EXCHANGE_VISIBLE_LIMIT = parsed.exchangeVisibleLimit
