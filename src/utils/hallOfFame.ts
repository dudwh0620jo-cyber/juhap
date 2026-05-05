export const hallOfFameTitle = "명예의 전당"

export type HallOfFameSeed = {
  postId: number
  rank: number
  liquor: string
  situation: string
}

export const hallOfFameRankedSeeds: HallOfFameSeed[] = [
  { postId: 1002, rank: 2, liquor: "막걸리", situation: "비오는날" },
  { postId: 1005, rank: 1, liquor: "와인", situation: "분위기" },
  { postId: 1006, rank: 4, liquor: "맥주", situation: "캠핑" },
  { postId: 1009, rank: 3, liquor: "칵테일", situation: "홈파티" },
  { postId: 1010, rank: 5, liquor: "맥주", situation: "야식" },
]

