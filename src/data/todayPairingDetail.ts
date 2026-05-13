export type TodayPairingDetailContent = {
  storyTitle: string
  storyBody: string
  points: Array<{ label: string }>
  moments: Array<{ tag: string }>
}

export const todayPairingDetailContent: TodayPairingDetailContent[] = [
  {
    storyTitle: "보쌈 × 소주",
    storyBody:
      "소주의 날카로운 정갈함은\n" +
      "자칫 무거울 수 있는 보쌈의 육향을 부드럽게 씻어내고,\n" +
      "달달한 보쌈김치 속 감칠맛을 깨워줘요.",
    points: [{ label: "담백함" }, { label: "온도의 대비" }, { label: "맛의조화" }],
    moments: [{ tag: "#비오는 날" }, { tag: "#집에서" }, { tag: "#홈파티" }, { tag: "#데이트" }],
  },
  {
    storyTitle: "소세지나초 × 산토리하이볼",
    storyBody:
      "가볍고 시원한 하이볼의 탄산감으로" +
      "스낵류의 풍미를 부담 없이 즐기게 해주는 \n" +
      "실패 없는 미식 공식이에요.",
    points: [{ label: "맛의균형" }, { label: "캐주얼" }, { label: "향의조화" }],
    moments: [{ tag: "#브런치" }, { tag: "#피크닉" }, { tag: "#특별한 날" }, { tag: "#홈파티" }],
  },
  {
    storyTitle: "복숭아브리치즈 × 소비뇽블랑",
    storyBody:
      "달콤함과 고소함 사이를 가로지르는 산뜻한 와인의 터치.\n" +
      "무거울 수 있는 치즈의 풍미를 산뜻하게 깨워주고,\n" +
      "복숭아의 향긋한 아로마를 선명하게 돋보이게 해요.",
    points: [{ label: "맛의균형" }, { label: "깔끔함" }, { label: "향의조화" }],
    moments: [{ tag: "#브런치" }, { tag: "#데이트" }, { tag: "#특별한 날" }, { tag: "#홈파티" }],
  },
  {
    storyTitle: "참치타다키 × 하쿠라쿠세이",
    storyBody:
      "겉은 고소하게, 속은 촉촉한 참치타다키와\n" +
      "산뜻하고 깔끔한 하쿠라쿠세이의 만남은\n" +
      "서로의 풍미를 더 돋보이게 해요.",
    points: [{ label: "맛의균형" }, { label: "깔끔함" }, { label: "향의조화" }],
    moments: [{ tag: "#특별한 날" }, { tag: "#일식" }, { tag: "#식전/중주" }, { tag: "#집에서" }],
  },
]
