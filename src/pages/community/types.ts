export type TopTab = "ranking" | "feed"
export type FeedFilter = "review" | "free" | "popular" | "follow"

export type RankingPeriod = "weekly" | "daily" | "monthly" | "all"
export type RankingCategory =
  | "all"
  | "soju"
  | "wine"
  | "beer"
  | "whisky_spirit"
  | "tradition"
  | "sake"
  | "etc"

export type GradeTier = 1 | 2 | 3 | 4 | 5

export type RankingRow = {
  id: number
  rank: number
  pair: string
  category: RankingCategory
  score: number
  votes: number
  delta: string
}

export type RankingPodium = {
  id: number
  rank: 1 | 2 | 3
  pair: string
  category: RankingCategory
  score: number
  votes?: number
  thumbVariant?: "default" | "bottle"
}

export type FeedPost = {
  id: number
  authorId: number
  authorName: string
  title: string
  body: string
  createdAt: string
  likeCount: number
  commentCount: number
  popularityScore: number
  profile?: string
  isQna?: boolean
  answerPreview?: string
  answerCount?: number
  searchTags?: string[]
  drinkType?: string
  categories?: string[]
  detailCategories?: string[]
  features?: Array<"부드러운" | "무거운" | "가벼운" | "톡쏘는" | "오크향" | "과일향">
  foods?: string[]
}

export type FollowUser = {
  id: number
  name: string
  profile: string
  bio: string
}

export type PopupChipGroup = {
  title: string
  chips: string[]
}

