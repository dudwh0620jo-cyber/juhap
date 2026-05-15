export type CommentUserGrade = "테이스터" | "셀렉터" | "큐레이터" | "소믈리에" | "마스터"

export type SeedCommentItem = {
  id: number
  userId: number
  userName?: string
  userGrade?: CommentUserGrade
  text: string
  timeLabel?: string
  likeCount?: number
  likedByCurrentUser?: boolean
  replyTo?: { userName: string; commentId: number }
}

export const ALCOHOL_REVIEW_COMMENT_SEEDS_BY_TARGET_ID: Record<string, SeedCommentItem[]> = {
  "product-review-comments-review-photo-1": [
    { id: 1, userId: 1001, userName: "유나로그", userGrade: "테이스터", text: "향 설명 보니까 차갑게 마셔보고 싶네요." },
    { id: 2, userId: 1002, userName: "사토유키", userGrade: "셀렉터", text: "사진이랑 후기 분위기가 잘 맞아요." },
    { id: 3, userId: 1004, userName: "프로워박러", userGrade: "큐레이터", text: "입문자도 부담 없을지 궁금합니다." },
  ],
  "product-review-comments-review-text-1": [
    { id: 1, userId: 1006, userName: "삼차원구", userGrade: "테이스터", text: "회식 자리용으로 참고할게요." },
    { id: 2, userId: 1011, userName: "콩깐대끼", userGrade: "셀렉터", text: "부드럽다는 설명이 딱 와닿네요." },
  ],
  "product-review-comments-review-text-2": [
    { id: 1, userId: 1012, userName: "감자감자감자", userGrade: "큐레이터", text: "처음 마시는 사람에게 추천하기 좋겠어요." },
    { id: 2, userId: 1013, userName: "남집사촌", userGrade: "셀렉터", text: "단맛이 강하지 않다니 궁금합니다." },
  ],
  "product-review-comments-review-photo-2": [
    { id: 1, userId: 1015, userName: "나비나기", userGrade: "셀렉터", text: "생선구이랑 같이 먹어보고 싶네요." },
    { id: 2, userId: 1020, userName: "샴페인조아", userGrade: "테이스터", text: "사진 있는 후기가 확실히 참고돼요." },
  ],
  "product-review-comments-review-text-3": [],
  "product-review-comments-review-text-4": [],
}

export const PAIRING_REVIEW_COMMENT_SEEDS_BY_TARGET_ID: Record<string, SeedCommentItem[]> = {
  "1101": [
    { id: 1, userId: 1021, userName: "보틀노트", userGrade: "소믈리에", text: "우니랑 닷사이23 조합 진짜 좋죠 😭" },
    { id: 2, userId: 3001, userName: "순대렐라", userGrade: "테이스터", text: "끝맛 깔끔해서 계속 들어갈 것 같네요." },
    { id: 3, userId: 3002, userName: "벼랑위의 당뇨", userGrade: "소믈리에", text: "분위기 좋은 이자카야에서 먹으면 완벽할 듯해요." },
    { id: 4, userId: 3003, userName: "이웃집 또터러", userGrade: "테이스터", text: "우니 느끼함을 잘 잡아주는 조합 같아요." },
    { id: 5, userId: 3004, userName: "엄마곗돈", userGrade: "테이스터", text: "이거 보니까 닷사이23 마시고 싶어졌네요 🍶" },
    { id: 6, userId: 3005, userName: "달려야하니", userGrade: "셀렉터", text: "우니 어디서 드신 건지 궁금해요!" },
  ],
  "1102": [
    { id: 1, userId: 3006, userName: "잔잔한리뷰어", userGrade: "테이스터", text: "치즈 플래터랑 사케 조합 의외로 잘 맞네요." },
    { id: 2, userId: 5001, userName: "옹심이", userGrade: "셀렉터", text: "브리 치즈 추천 완전 동의합니다." },
    { id: 3, userId: 5002, userName: "사케가 좋아", userGrade: "셀렉터", text: "견과류 추가하면 식감이 확실히 살아나요." },
    { id: 4, userId: 6001, userName: "용시이", userGrade: "큐레이터", text: "홈파티 메뉴로 딱이에요." },
  ],
  "1001": [
    { id: 1, userId: 6002, userName: "서연", userGrade: "소믈리에", text: "하이볼에 새우깡은 진짜 인정입니다." },
    { id: 2, userId: 6003, userName: "오크데이", userGrade: "마스터", text: "얼음 크게 넣으면 더 깔끔하게 마셔져요." },
  ],
  "1002": [
    { id: 1, userId: 6004, userName: "프로워박러", userGrade: "큐레이터", text: "막걸리 향이 해물파전 기름짐 잡아줘요." },
    { id: 2, userId: 6005, userName: "감자감자감자", userGrade: "큐레이터", text: "비 오는 날에 이 조합이면 끝이죠." },
    { id: 3, userId: 6006, userName: "삼차원구", userGrade: "테이스터", text: "김치전으로 바꿔도 잘 어울릴까요?" },
  ],
  "1003": [
    { id: 1, userId: 6007, userName: "주합러", userGrade: "테이스터", text: "버번 다음이면 블렌디드부터 가는 게 편해요." },
    { id: 2, userId: 2001, userName: "민지", userGrade: "테이스터", text: "피트향 약한 싱글몰트로 넘어가도 괜찮습니다." },
    { id: 3, userId: 2002, userName: "현우", userGrade: "셀렉터", text: "하이볼 위주면 산뜻한 스타일 먼저 드셔보세요." },
    { id: 4, userId: 2003, userName: "노아", userGrade: "테이스터", text: "입문이면 도수 40도 안팎 제품이 무난했어요." },
    { id: 5, userId: 2019, userName: "태형", userGrade: "테이스터", text: "예산대 알려주시면 더 구체적으로 추천 가능해요." },
  ],
  "1004": [
    { id: 1, userId: 2025, userName: "윤아", userGrade: "테이스터", text: "명란구이+오이는 준비도 쉽고 사케랑 잘 맞아요." },
    { id: 2, userId: 2101, userName: "지훈", userGrade: "큐레이터", text: "두부김치도 의외로 괜찮았어요. 너무 맵지만 않게요." },
    { id: 3, userId: 2102, userName: "도윤", userGrade: "셀렉터", text: "연어구이 소량으로 곁들이는 것도 추천합니다." },
    { id: 4, userId: 2103, userName: "나연", userGrade: "큐레이터", text: "전자레인지 가능한 안주면 계란찜도 좋아요." },
  ],
  "1005": [
    { id: 1, userId: 2104, userName: "수빈", userGrade: "테이스터", text: "스테이크 굽기 미디움으로 맞추면 최고예요." },
    { id: 2, userId: 2105, userName: "시카", userGrade: "테이스터", text: "탄닌 있는 레드 추천도 부탁해요." },
    { id: 3, userId: 2113, userName: "하린", userGrade: "테이스터", text: "감자퓨레랑 같이 먹으면 더 맛있더라구요." },
    { id: 4, userId: 2115, userName: "준호", userGrade: "테이스터", text: "가격대 비슷한 대체 와인도 궁금합니다." },
    { id: 5, userId: 2116, userName: "서준", userGrade: "테이스터", text: "고기 시즈닝 강하면 와인도 묵직한 게 맞아요." },
  ],
  "1006": [
    { id: 1, userId: 2117, userName: "유진", userGrade: "테이스터", text: "IPA 쓴맛이 치즈 느끼함 잡아주는 게 포인트죠." },
  ],
  "1007": [
    { id: 1, userId: 2118, userName: "태오", userGrade: "테이스터", text: "족발은 마늘이랑 같이 먹어야 진짜죠." },
    { id: 2, userId: 1001, userName: "유나로그", userGrade: "테이스터", text: "새우젓 찍고 소주 한잔하면 밸런스 좋아요." },
    { id: 3, userId: 1002, userName: "사토유키", userGrade: "셀렉터", text: "매운 무침 곁들이면 더 잘 어울립니다." },
    { id: 4, userId: 1004, userName: "프로워박러", userGrade: "큐레이터", text: "야식으로 이만한 조합이 없어요." },
  ],
  "1008": [
    { id: 1, userId: 1006, userName: "삼차원구", userGrade: "테이스터", text: "기름진 회면 사케, 담백한 흰살생선이면 화이트와인 추천해요." },
    { id: 2, userId: 1011, userName: "콩깐대끼", userGrade: "셀렉터", text: "와사비 강하면 사케 쪽이 더 부드럽게 잡아주더라구요." },
    { id: 3, userId: 1012, userName: "감자감자감자", userGrade: "큐레이터", text: "산미 원하는 날은 화이트, 감칠맛 원하면 사케로 고릅니다." },
    { id: 4, userId: 1013, userName: "남집사촌", userGrade: "셀렉터", text: "둘 다 두고 회 종류별로 번갈아 마셔도 재밌어요." },
    { id: 5, userId: 1015, userName: "나비나기", userGrade: "셀렉터", text: "가격 맞추기 쉬운 건 사케 쪽이었어요." },
    { id: 6, userId: 1020, userName: "샴페인조아", userGrade: "테이스터", text: "광어/도미는 화이트, 참치 뱃살은 사케가 좋았습니다." },
  ],
  "1009": [
    { id: 1, userId: 1021, userName: "보틀노트", userGrade: "소믈리에", text: "타코엔 라임 계열 칵테일이 제일 깔끔해요." },
    { id: 2, userId: 3001, userName: "순대렐라", userGrade: "테이스터", text: "데킬라 베이스에 소금 테두리도 추천합니다." },
    { id: 3, userId: 3002, userName: "벼랑위의 당뇨", userGrade: "소믈리에", text: "살사 매운맛이 강하면 단맛 있는 칵테일도 좋아요." },
    { id: 4, userId: 3003, userName: "이웃집 또터러", userGrade: "테이스터", text: "홈파티 메뉴로 바로 가져갈게요." },
    { id: 5, userId: 3004, userName: "엄마곗돈", userGrade: "테이스터", text: "무알콜 버전도 하나 있으면 좋겠네요." },
    { id: 6, userId: 3005, userName: "달려야하니", userGrade: "셀렉터", text: "타코 종류별 추천도 올려주세요." },
  ],
  "1010": [],
  "1011": [
    { id: 1, userId: 3006, userName: "잔잔한리뷰어", userGrade: "테이스터", text: "입문이면 40~43도 버번이 가장 무난했어요." },
    { id: 2, userId: 5001, userName: "옹심이", userGrade: "셀렉터", text: "다크초콜릿은 카카오 70% 전후가 잘 맞더라구요." },
    { id: 3, userId: 5002, userName: "사케가 좋아", userGrade: "셀렉터", text: "버번이 달면 초콜릿은 너무 달지 않은 걸 추천합니다." },
    { id: 4, userId: 6001, userName: "용시이", userGrade: "큐레이터", text: "소량씩 번갈아 먹으면 밸런스 잡기 쉬워요." },
    { id: 5, userId: 6002, userName: "서연", userGrade: "소믈리에", text: "초콜릿 먼저 한 입 먹고 버번 마시면 좋았어요." },
    { id: 6, userId: 6003, userName: "오크데이", userGrade: "마스터", text: "입문용으로는 바닐라 향 나는 버번도 괜찮습니다." },
    { id: 7, userId: 6004, userName: "프로워박러", userGrade: "큐레이터", text: "도수 부담되면 큰 얼음 한 개 넣어서 드셔보세요." },
  ],
  "1012": [
    { id: 1, userId: 6005, userName: "감자감자감자", userGrade: "큐레이터", text: "맥주는 라거/IPA 반반 준비하면 대부분 좋아해요." },
    { id: 2, userId: 6006, userName: "삼차원구", userGrade: "테이스터", text: "전통주는 막걸리+전 조합이 실패가 적었습니다." },
    { id: 3, userId: 6007, userName: "주합러", userGrade: "테이스터", text: "와인은 화이트 1, 레드 1 정도가 안전해요." },
    { id: 4, userId: 2001, userName: "민지", userGrade: "테이스터", text: "안주는 짠맛/담백한 맛 둘 다 준비하면 좋아요." },
    { id: 5, userId: 2002, userName: "현우", userGrade: "셀렉터", text: "처음엔 도수 낮은 술부터 내는 순서 추천합니다." },
    { id: 6, userId: 2003, userName: "노아", userGrade: "테이스터", text: "예산 정해두고 병 수를 먼저 계산하면 편해요." },
    { id: 7, userId: 2019, userName: "태형", userGrade: "테이스터", text: "무알콜 음료 1~2개 같이 두면 만족도 높아요." },
  ],
  "1025": [],
  "90001": [
    { id: 1, userId: 2025, userName: "윤아", userGrade: "테이스터", text: "사시미랑 준마이 다이긴죠 조합은 진짜 깔끔하네요." },
    { id: 2, userId: 2101, userName: "지훈", userGrade: "큐레이터", text: "레몬 한 방울 팁 좋습니다." },
    { id: 3, userId: 2102, userName: "도윤", userGrade: "셀렉터", text: "간장보다 소금 쪽이 더 어울린다는 말 공감해요." },
    { id: 4, userId: 2103, userName: "나연", userGrade: "큐레이터", text: "다음 모임 메뉴로 그대로 해볼게요." },
    { id: 5, userId: 2104, userName: "수빈", userGrade: "테이스터", text: "사케 온도는 어느 정도가 좋았나요?" },
    { id: 6, userId: 2105, userName: "시카", userGrade: "테이스터", text: "너무 차갑지 않게 마시면 향이 더 살아요." },
    { id: 7, userId: 2113, userName: "하린", userGrade: "테이스터", text: "플레이팅 팁도 공유해주셔서 좋네요." },
  ],
  "90002": [
    { id: 1, userId: 2115, userName: "준호", userGrade: "테이스터", text: "치즈 플래터랑 사케 조합 의외로 잘 맞네요." },
    { id: 2, userId: 2116, userName: "서준", userGrade: "테이스터", text: "브리 치즈 추천 완전 동의합니다." },
    { id: 3, userId: 2117, userName: "유진", userGrade: "테이스터", text: "견과류 추가하면 식감이 확실히 살아나요." },
    { id: 4, userId: 2118, userName: "태오", userGrade: "테이스터", text: "홈파티 메뉴로 딱이에요." },
    { id: 5, userId: 1001, userName: "유나로그", userGrade: "테이스터", text: "가격대 비슷한 대체 사케도 궁금합니다." },
    { id: 6, userId: 1002, userName: "사토유키", userGrade: "셀렉터", text: "짠 치즈보다 순한 치즈가 더 낫더라구요." },
    { id: 7, userId: 1004, userName: "프로워박러", userGrade: "큐레이터", text: "저도 다음엔 이 조합으로 준비해볼게요." },
    { id: 8, userId: 1006, userName: "삼차원구", userGrade: "테이스터", text: "크래커랑 과일도 같이 두면 더 좋아요." },
  ],
  "90003": [
    { id: 1, userId: 1011, userName: "콩깐대끼", userGrade: "셀렉터", text: "굴 초회랑 사케는 산뜻해서 좋네요." },
    { id: 2, userId: 1012, userName: "감자감자감자", userGrade: "큐레이터", text: "비린 향 잡는 팁 덕분에 따라하기 쉬워요." },
    { id: 3, userId: 1013, userName: "남집사촌", userGrade: "셀렉터", text: "차갑게 칠링해서 마셔봐야겠어요." },
  ],
  "91011": [],
  "91012": [],
  "91013": [],
  "99001": [],
  "99002": [],
}

export const QUESTION_COMMENT_SEEDS_BY_TARGET_ID: Record<string, SeedCommentItem[]> = {
  "92001": [
    { id: 1, userId: 1015, userName: "나비나기", userGrade: "셀렉터", text: "해산물 쪽이면 막걸리보다 가벼운 사케도 잘 맞아요." },
    { id: 2, userId: 1020, userName: "샴페인조아", userGrade: "테이스터", text: "맥주는 라거로 시작하면 부담이 적었습니다." },
    { id: 3, userId: 1021, userName: "보틀노트", userGrade: "소믈리에", text: "안주가 기름지면 산미 있는 술을 같이 보세요." },
  ],
  "92002": [
    { id: 1, userId: 3001, userName: "순대렐라", userGrade: "테이스터", text: "혼술이면 캔 하이볼이 준비하기 제일 편했어요." },
    { id: 2, userId: 3002, userName: "벼랑위의 당뇨", userGrade: "소믈리에", text: "치즈보다 과일이나 견과류 같이 두면 더 깔끔해요." },
  ],
  "92003": [
    { id: 1, userId: 3003, userName: "이웃집 또터러", userGrade: "테이스터", text: "복순도가 산미가 있어서 전이나 감자전이랑 잘 맞았어요." },
    { id: 2, userId: 3004, userName: "엄마곗돈", userGrade: "테이스터", text: "너무 차갑게보다 살짝 덜 차갑게 마시면 향이 좋아요." },
  ],
  "92004": [
    { id: 1, userId: 3005, userName: "달려야하니", userGrade: "셀렉터", text: "조니워커 블랙은 하이볼로 내도 반응 무난했습니다." },
    { id: 2, userId: 3006, userName: "잔잔한리뷰어", userGrade: "테이스터", text: "얼음 크게 넣고 레몬만 살짝 더해도 좋아요." },
    { id: 3, userId: 5001, userName: "옹심이", userGrade: "셀렉터", text: "위스키 처음인 분들 있으면 진하게 타지 않는 게 좋더라구요." },
  ],
  "92005": [
    { id: 1, userId: 5002, userName: "사케가 좋아", userGrade: "셀렉터", text: "가성비보다는 향 경험 쪽으로 기대하면 만족도가 높아요." },
    { id: 2, userId: 6001, userName: "용시이", userGrade: "큐레이터", text: "입문이면 먼저 바에서 한 잔 마셔보고 병 구매 추천합니다." },
  ],
  "91001": [
    { id: 1, userId: 6002, userName: "서연", userGrade: "소믈리에", text: "메이커스 다음이면 버팔로 트레이스도 편하게 넘어가요." },
    { id: 2, userId: 6003, userName: "오크데이", userGrade: "마스터", text: "바닐라 향 좋아하면 우드포드 리저브도 괜찮습니다." },
  ],
  "99003": [
    { id: 1, userId: 6004, userName: "프로워박러", userGrade: "큐레이터", text: "일식이면 준마이 계열 사케가 무난해요." },
    { id: 2, userId: 6005, userName: "감자감자감자", userGrade: "큐레이터", text: "튀김류면 산뜻한 하이볼도 괜찮았습니다." },
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
