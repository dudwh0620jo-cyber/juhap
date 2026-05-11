export type MockUser = {
  id: number
  name: string
  profile: string
  bio: string
  avatarNumber?: number
}

export const usersMock: MockUser[] = [
  { id: 2001, name: "유나로그", profile: "20대 / 여 / 스파클링 · 과일향 선호", bio: "파티 분위기 나는 조합을 자주 기록해요.", avatarNumber: 1 },
  { id: 2002, name: "용시이", profile: "50대 / 남 / 막걸리 · 담백한 맛 선호", bio: "한식과 잘 맞는 막걸리를 찾는 중입니다.", avatarNumber: 2 },
  { id: 2003, name: "서연", profile: "30대 / 여 / 위스키 · 묵직한 향 선호", bio: "싱글몰트부터 버번까지 천천히 경험하는 중이에요.", avatarNumber: 3 },
  { id: 2004, name: "사토유키", profile: "20대 / 남 / 사케 · 깔끔한 맛 선호", bio: "사케와 일식 페어링을 기록하는 걸 좋아해요.", avatarNumber: 4 },
  { id: 2019, name: "프로워박러", profile: "30대 / 여 / 맥주 · 라거 위주", bio: "가볍고 시원한 라거 페어링을 즐겨요.", avatarNumber: 5 },
  { id: 2025, name: "남집사촌", profile: "20대 / 남 / 맥주 · 캠핑 감성", bio: "캠핑 분위기와 어울리는 안주 조합을 찾습니다.", avatarNumber: 6 },
  { id: 2101, name: "형편없는 삼차원구", profile: "30대 / 남 / 막걸리 · 진한 풍미", bio: "막걸리와 전 조합에 진심입니다.", avatarNumber: 7 },
  { id: 2102, name: "콩깐대끼", profile: "30대 / 남 / 맥주 · 육류 페어링", bio: "고기와 맥주 조합을 제일 좋아해요.", avatarNumber: 8 },
  { id: 2103, name: "만족스러운 나비나기", profile: "20대 / 여 / 크림파스타 · 와인", bio: "크리미한 소스와 와인 궁합을 즐깁니다.", avatarNumber: 9 },
  { id: 2104, name: "감자감자감자", profile: "20대 / 남 / 감자전 · 막걸리", bio: "막걸리 향과 전의 식감을 중요하게 봐요.", avatarNumber: 10 },
  { id: 2105, name: "세나맛", profile: "30대 / 남 / 막걸리 · 해물전 선호", bio: "비 오는 날 해물전과 막걸리 조합이 최고예요.", avatarNumber: 11 },
  { id: 2106, name: "민지", profile: "20대 / 여 / 와인 · 치즈 페어링", bio: "치즈 플래터와 와인 매칭 기록 중이에요.", avatarNumber: 1 },
  { id: 2107, name: "하이볼러", profile: "30대 / 남 / 위스키 하이볼", bio: "탄산감 있는 하이볼과 튀김 조합을 좋아해요.", avatarNumber: 2 },
  { id: 2108, name: "주합러", profile: "20대 / 남 / 전통주 · 담백한 향", bio: "담백하고 은은한 전통주를 찾고 있어요.", avatarNumber: 3 },
  { id: 2109, name: "버번초보", profile: "30대 / 남 / 위스키 · 버번 입문", bio: "입문자 기준으로 부드러운 버번을 찾습니다.", avatarNumber: 4 },
  { id: 2110, name: "샴페인조아", profile: "20대 / 여 / 샴페인 · 브런치", bio: "브런치와 스파클링 조합을 공유해요.", avatarNumber: 5 },
  { id: 2111, name: "해달한잔", profile: "30대 / 여 / 사케 · 해산물 페어링", bio: "회와 조개류에 어울리는 사케 조합을 자주 메모해요." },
  { id: 2112, name: "라거로그", profile: "20대 / 남 / 맥주 · 바비큐 선호", bio: "캠핑에서 먹기 좋은 라거와 구이 조합을 정리합니다." },
  { id: 2113, name: "보틀노트", profile: "30대 / 여 / 와인 · 홈다이닝", bio: "집에서 따라 하기 쉬운 와인 페어링을 기록해요." },
  { id: 2114, name: "막걸리산책", profile: "40대 / 남 / 전통주 · 전 요리", bio: "지역 막걸리와 전 조합을 찾아다니는 걸 좋아합니다." },
  { id: 2115, name: "토닉웨이브", profile: "20대 / 여 / 하이볼 · 시트러스", bio: "산뜻한 하이볼과 가벼운 안주 조합을 즐겨요." },
  { id: 2116, name: "오크데이", profile: "30대 / 남 / 위스키 · 디저트 페어링", bio: "버번과 초콜릿처럼 달콤한 조합을 자주 시도해요." },
  { id: 2117, name: "브리앤버블", profile: "20대 / 여 / 샴페인 · 치즈", bio: "치즈 플래터와 스파클링 와인 조합을 꾸준히 공유합니다." },
  { id: 2118, name: "안주연구소", profile: "30대 / 남 / 소주 · 야식 페어링", bio: "늦은 밤 잘 어울리는 소주 안주 조합을 연구해요." },
]

export const usersMockById: Record<number, MockUser> = Object.fromEntries(usersMock.map((user) => [user.id, user]))

export const defaultFollowedUserIdsMock = usersMock.slice(0, 4).map((user) => user.id)

export const currentUserMock = { id: 9999, name: "주합러", meta: "20대 / 남" }

export const getUserMetaFromProfile = (profile: string) => {
  const parts = profile
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean)
  const ageGender = parts[0] ?? ""
  if (ageGender) return ageGender
  return profile
}

export type MentionUserMock = { id: number; name: string; meta: string }
export const mentionDirectoryMock: MentionUserMock[] = usersMock.map((user) => ({
  id: user.id,
  name: user.name,
  meta: getUserMetaFromProfile(user.profile),
}))
