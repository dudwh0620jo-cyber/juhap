export type SeedCommentItem = {
  id: number
  userId: number
  text: string
  timeLabel?: string
  likeCount?: number
  likedByCurrentUser?: boolean
  replyTo?: { userName: string; commentId: number }
}

export const ALCOHOL_REVIEW_COMMENT_SEEDS_BY_TARGET_ID: Record<string, SeedCommentItem[]> = {
  "30002": [
    { id: 1, userId: 1006, text: "드라이한 스타일이면 회식 자리에서도 부담 없어서 좋죠 😄" },
    { id: 2, userId: 1011, text: "기름진 안주랑 잘 어울린다는 부분 공감돼요." },
  ],
  "30004": [
    { id: 1, userId: 1015, text: "튀김류랑 같이 먹으면 진짜 깔끔하게 잘 어울릴 것 같네요 😄" },
    { id: 2, userId: 1020, text: "향이 안 튄다는 부분 보니까 식사 술로 좋을 듯해요." },
  ],
  "30001": [
    { id: 1, userId: 1001, text: "배나 멜론 느낌 난다는 표현 보니까 향이 궁금해지네요 😄" },
    { id: 2, userId: 1002, text: "회랑 같이 먹으면 깔끔하게 잘 어울릴 것 같아요." },
    { id: 3, userId: 1004, text: "단맛이 과하지 않다는 부분이 되게 매력적으로 느껴지네요." },
  ],
  "30003": [
    { id: 1, userId: 1012, text: "목넘김 부드러운 스타일이면 입문용으로 괜찮죠 😄" },
    { id: 2, userId: 1013, text: "끝에 남는 쌀향이 깔끔하다는 부분이 되게 궁금하네요." },
  ],
  "30005": [
    { id: 1, userId: 3006, text: "강하게 튀기보다 균형감 있는 스타일 좋아하면 만족할 것 같네요 😄" },
  ],
  "30006": [
    { id: 1, userId: 5001, text: "온도에 따라 느낌 달라지는 술은 마시는 재미가 있는 것 같아요 😄" },
  ],
}

export const PAIRING_REVIEW_COMMENT_SEEDS_BY_TARGET_ID: Record<string, SeedCommentItem[]> = {
  "99003":[
    { id: 1, userId: 3001, text: "회무침 양념이랑 화요25 조합 생각보다 진짜 잘 어울리죠 😄"},
    { id: 6, userId: 3002, text: "맞아요 특히 새콤한 양념이랑 같이 마시면 더 깔끔하더라고요.", replyTo: { userName: "순대렐라", commentId: 1 } },
    { id: 7, userId: 3004, text: "저도 이 조합 먹고 화요25 다시 보게 됐어요.", replyTo: { userName: "순대렐라", commentId: 1 } },
    { id: 8, userId: 5001, text: "회무침 매운맛 잡아주는 느낌 진짜 공감돼요.", replyTo: { userName: "순대렐라", commentId: 1 } },
    { id: 9, userId: 6002, text: "증류식 소주라 끝맛이 덜 텁텁해서 좋은 것 같아요.", replyTo: { userName: "순대렐라", commentId: 1 } },
    { id: 10, userId: 1021, text: "차갑게 마시면 더 잘 어울릴 것 같네요 🍶", replyTo: { userName: "순대렐라", commentId: 1 } },
    { id: 11, userId: 3005, text: "다음에 회무침 시키면 화요25 같이 먹어봐야겠어요.", replyTo: { userName: "순대렐라", commentId: 1 } },
    { id: 2, userId: 3004, text: "차갑게 마셨을 때 입안 정리되는 느낌 공감돼요."},
    { id: 3, userId: 6002, text: "맵고 새콤한 안주엔 증류식 소주가 확실히 깔끔하네요."},
    { id: 4, userId: 1021, text: "곡물향 은은하게 올라온다는 표현 보니까 바로 마셔보고 싶어졌어요."},
    { id: 5, userId: 5001, text: "회무침 한입에 화요25 한잔이면 계속 들어갈 것 같은 조합이네요 🔥"},
  ],
  "1101": [
    { id: 1, userId: 1021, text: "우니랑 닷사이23 조합 진짜 좋죠 😭" },
    { id: 2, userId: 3001, text: "끝맛 깔끔해서 계속 들어갈 것 같네요." },
    { id: 3, userId: 3002, text: "분위기 좋은 이자카야에서 먹으면 완벽할 듯해요." },
    { id: 4, userId: 3003, text: "우니 느끼함을 잘 잡아주는 조합 같아요." },
    { id: 5, userId: 3004, text: "이거 보니까 닷사이23 마시고 싶어졌네요 🍶" },
    { id: 6, userId: 3005, text: "우니 어디서 드신 건지 궁금해요!" },
  ],
  "1102": [
    { id: 1, userId: 3006, text: "방어나 도미랑 잘 어울린다는 말 보니까 바로 생각나네요 🍶" },
    { id: 2, userId: 5001, text: "회식 때 가져가면 반응 진짜 좋을 것 같은 조합이에요." },
    { id: 3, userId: 3005, text: "향이 과하지 않아서 음식 흐름 안 깨는 거 완전 공감돼요." },
    { id: 4, userId: 6001, text: "이자카야에서 사시미에 닷사이23이면 실패하기 어렵죠 😄" },
  ],
  "99001": [
    { id: 1, userId: 1021, text: "쥬욘다이는 진짜 왜 유명한지 마셔보면 바로 이해되는 것 같아요 🍶" },
  ],
  "99002": [
    { id: 1, userId: 3002, text: "매운 음식이랑 쿠보타 만쥬 조합 의외로 잘 어울리죠 😄" },
  ],
  "1025": [
    { id: 1, userId: 1001, text: "토마토 파스타랑 라거 조합은 깔끔해서 은근 잘 들어가죠 🍺" },
  ],
  "1001": [
  { id: 1, userId: 1012, text: "해물파전이랑 막걸리는 한국 오면 꼭 먹어봐야 하는 조합이죠 😄" },
  { id: 2, userId: 3001, text: "비 오는 날이면 더 생각나는 메뉴인 것 같아요." },
  ],
"1002": [
  { id: 1, userId: 6004, text: "모엣 샹동은 파티 분위기 내기 진짜 좋은 것 같아요 🥂" },
  { id: 2, userId: 6005, text: "트러플 크림 파스타랑 같이 먹으면 더 고급스러운 느낌 나겠네요." },
  { id: 3, userId: 6006, text: "사진까지 잘 나오면 생일파티용으로 완벽하죠 😄" },
],
"1003": [
  { id: 1, userId: 6007, text: "도토리묵이랑 밤막걸리 조합 은근 잘 어울리죠." },
  { id: 2, userId: 2001, text: "구수한 맛 좋아하면 딱 취향일 것 같네요 😄" },
  { id: 3, userId: 2002, text: "주말에 가볍게 한잔하기 좋은 조합 같아요." },
  { id: 4, userId: 2003, text: "밤막걸리 단맛이 묵이랑 잘 이어질 것 같네요." },
  { id: 5, userId: 2019, text: "이런 한식 안주 조합은 괜히 계속 생각나요." },
],
"1004": [
  { id: 1, userId: 2025, text: "치킨이랑 라거 조합은 역시 실패하기 어렵죠 🍺" },
  { id: 2, userId: 2101, text: "달콩이까지 관심 보이는 거 너무 귀엽네요 😄" },
  { id: 3, userId: 2102, text: "감자튀김까지 있으면 진짜 계속 들어갈 것 같아요." },
  { id: 4, userId: 2103, text: "혼술인데도 되게 분위기 좋아 보이네요." },
],
"1005": [
  { id: 1, userId: 2104, text: "캠핑장에서 먹는 소금구이는 분위기까지 맛인 것 같아요 😄" },
  { id: 2, userId: 2105, text: "불멍하면서 카스 한잔이면 진짜 낭만이네요." },
  { id: 3, userId: 2113, text: "닭목살 소금구이는 라거랑 은근 잘 어울리죠." },
  { id: 4, userId: 2115, text: "캠핑 가서 이런 조합 먹으면 괜히 더 맛있게 느껴져요." },
  { id: 5, userId: 2116, text: "청계산 캠핑장 분위기도 좋아 보이네요 👀" },
],
"91011": [
  { id: 1, userId: 6002, text: "육회랑 일품진로 조합 은근 깔끔해서 좋죠." },
  { id: 2, userId: 1001, text: "낙지까지 있었으면 진짜 완벽했겠네요 😭" },
  { id: 3, userId: 1002, text: "육회에 증류식 소주 조합은 실패하기 어려운 것 같아요." },
  { id: 4, userId: 1004, text: "일품진로는 확실히 부드럽게 넘어가서 좋더라고요." },
  { id: 5, userId: 1013, text: "강남에서 이런 조합이면 회식 때 딱이네요." },
  { id: 6, userId: 1012, text: "육회 기름진 맛을 깔끔하게 잡아주는 느낌 좋죠." },
  { id: 7, userId: 1015, text: "프리미엄 소주랑 육회 조합은 분위기도 사는 것 같아요." },
  { id: 8, userId: 1020, text: "육회에 일품진로 한 잔이면 계속 들어가죠 😄" },
  { id: 9, userId: 1021, text: "낙지 품절이라 아쉽긴 한데 육회만으로도 괜찮았을 듯해요." },
  { id: 10, userId: 3001, text: "일품진로 좋아하시는 분들 꽤 만족할 조합 같네요." },
  { id: 11, userId: 3002, text: "깔끔한 술 좋아하면 이런 조합 진짜 좋아할 것 같아요." },
  { id: 12, userId: 3005, text: "육회 어디서 드신 건지 궁금하네요 👀" },
],
  "1006": [
    { id: 1, userId: 2117, text: "비 오는 날 감자전에 막걸리는 진짜 못 참죠 😄" },
  ],
"1007": [
  { id: 1, userId: 2118, text: "기네스랑 수제버거 조합은 묵직해서 만족감 크죠 🍔" },
  { id: 2, userId: 1001, text: "패티 육즙이랑 흑맥주가 진짜 잘 어울릴 것 같네요." },
  { id: 3, userId: 1002, text: "행궁동에서 이런 조합이면 분위기도 좋았을 듯해요 😄" },
  { id: 4, userId: 1004, text: "느끼함 잡아주는 흑맥주 조합은 역시 믿고 먹죠." },
],
"91012": [
  { id: 1, userId: 1006, text: "감자전이랑 막걸리는 역시 실패하기 어렵죠." },
  { id: 2, userId: 1001, text: "비 오는 날 생각나는 조합이네요 😄" },
  { id: 3, userId: 1002, text: "장수 생막걸리랑 감자전이면 편하게 한잔하기 좋죠." },
  { id: 4, userId: 1004, text: "감자전 바삭하게 부쳐졌으면 진짜 최고였겠네요." },
  { id: 5, userId: 1011, text: "혼술로도 은근 만족감 큰 조합 같아요." },
  { id: 6, userId: 1013, text: "막걸리 특유의 톡 쏘는 맛이 감자전이랑 잘 맞죠." },
  { id: 7, userId: 1015, text: "이런 조합은 괜히 자꾸 생각나는 것 같아요." },
  { id: 8, userId: 1020, text: "인천 쪽이면 저도 한번 가보고 싶네요." },
  { id: 9, userId: 3001, text: "김치 하나 같이 나오면 더 완벽할 듯해요." },
  { id: 10, userId: 3002, text: "막걸리 좋아하는 사람들은 딱 좋아할 조합이네요." },
],
"91013": [
  { id: 1, userId: 1002, text: "닭꼬치 소금구이에 시원한 카스면 가볍게 즐기기 딱 좋죠 😄" },
],
"1008": [
  { id: 1, userId: 1006, text: "화이트 라자냐랑 샤도네이 조합은 진짜 부드럽죠 😄" },
  { id: 2, userId: 1011, text: "버터리한 향이 크림소스랑 잘 이어질 것 같네요." },
  { id: 3, userId: 1012, text: "데이트 분위기로도 딱 어울리는 조합 같아요." },
  { id: 4, userId: 1013, text: "오크향 있는 샤도네이면 더 잘 맞을 듯해요." },
  { id: 5, userId: 1015, text: "전포동 분위기랑도 잘 어울리는 메뉴네요 🍷" },
  { id: 6, userId: 1020, text: "느끼하지 않게 잡아주는 밸런스가 좋았을 것 같아요." },
],
"1009": [
  { id: 1, userId: 1021, text: "해물탕에 복순도가는 진짜 시원하게 잘 어울리죠 😄" },
  { id: 2, userId: 3001, text: "탄산감이 매운맛 잡아주는 느낌 공감돼요." },
  { id: 3, userId: 3002, text: "오랜만에 친구 만나서 먹으면 더 맛있는 조합 같네요." },
  { id: 4, userId: 3003, text: "해물탕 국물에 막걸리 한잔이면 계속 들어가죠." },
  { id: 5, userId: 3004, text: "송도 쪽 분위기 좋은 곳에서 드신 것 같아요 👀" },
  { id: 6, userId: 3005, text: "복순도가 특유의 탄산감이 해물탕이랑 잘 맞을 듯해요." },
],
  "1010": [
    { id: 1, userId: 1015, text: "브리치즈랑 샴페인은 산미가 잡아줘서 좋죠." },
  ],
}

export const QUESTION_COMMENT_SEEDS_BY_TARGET_ID: Record<string, SeedCommentItem[]> = {
"92001": [
  { id: 1, userId: 1015, text: "삼겹살이면 의외로 하이볼이 깔끔해서 잘 어울리더라구요." },
  { id: 2, userId: 1020, text: "라거 맥주랑 같이 먹으면 기름진 맛 잡아줘서 좋았어요." },
  { id: 3, userId: 1021, text: "전통주 좋아하시면 탄산감 있는 막걸리도 한번 드셔보세요 😄" },
],
"92002": [
  { id: 1, userId: 3001, text: "올리브나 크래커 같은 안주도 편의점 와인이랑 잘 어울려요." },
  { id: 2, userId: 3002, text: "프로슈토나 육포 같이 짭짤한 안주도 은근 괜찮더라구요 😄" },
],
"92003": [
  { id: 1, userId: 3003, text: "탄산감 꽤 강한 편이라 깔끔하게 넘어가는 느낌 좋더라구요." },
  { id: 2, userId: 3004, text: "해물파전이나 감자전이랑 같이 먹으면 진짜 잘 어울려요 😄" },
],
"92004": [
  { id: 1, userId: 3005, text: "블루라벨은 선물 받으면 대부분 만족도 꽤 높은 편이죠 😄" },
  { id: 2, userId: 3006, text: "패키지나 브랜드 인지도 때문에 선물용으로 무난하게 좋은 것 같아요." },
  { id: 3, userId: 5001, text: "위스키 좋아하시는 분이면 한 번쯤은 반가워할 선택 아닐까요?" },
],
"92005": [
  { id: 1, userId: 5002, text: "오크향이나 쉐리 계열 좋아하시면 만족감 꽤 클 거예요 😄" },
  { id: 2, userId: 6001, text: "가격 부담은 있지만 한 번쯤 경험해볼 만하다는 의견 많더라구요." },
],
"91001": [
  { id: 1, userId: 6002, text: "메이커스 마크 다음이면 버팔로 트레이스 많이 추천하시더라구요." },
  { id: 2, userId: 3006, text: "부드러운 스타일 좋아하시면 와일드 터키 101도 한번 드셔보세요 😄" },
],
"92006": [
  { id: 1, userId: 6004, text: "퇴근 후엔 캔 하이볼처럼 가볍게 마실 수 있는 술이 편하더라구요 😄" },
  { id: 2, userId: 6005, text: "치킨이나 야식류엔 라거 맥주도 부담 없이 잘 어울려요." },
],
}

export const COMMENT_SEEDS_BY_TARGET_ID: Record<string, SeedCommentItem[]> = {
  ...ALCOHOL_REVIEW_COMMENT_SEEDS_BY_TARGET_ID,
  ...PAIRING_REVIEW_COMMENT_SEEDS_BY_TARGET_ID,
  ...QUESTION_COMMENT_SEEDS_BY_TARGET_ID,
}

export const getSeedCommentsByTargetId = (targetId: string | undefined): SeedCommentItem[] => {
  if (!targetId) return []
  return COMMENT_SEEDS_BY_TARGET_ID[targetId] ?? []
}

export const getCommentItemIdCount = (comments: SeedCommentItem[]) =>
  new Set(comments.map((comment) => comment.id).filter((id) => Number.isFinite(id))).size

export const getSeedCommentCount = (targetId: string | undefined) =>
  getCommentItemIdCount(getSeedCommentsByTargetId(targetId))
