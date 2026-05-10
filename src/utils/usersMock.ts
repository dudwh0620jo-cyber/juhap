export type MockUser = {
  id: number
  name: string
  profile: string
  bio: string
}

export const usersMock: MockUser[] = [
  { id: 2001, name: "민지", profile: "30대 여성 / 와인 / 부드러운 과일향 선호", bio: "기분 좋은 페어링을 기록하는 걸 좋아해요." },
  { id: 2002, name: "현우", profile: "20대 남성 / 맥주 / 가벼운 톡쏘는 맛 선호", bio: "수제맥주랑 야식 조합 찾는 중이에요." },
  { id: 2003, name: "서연", profile: "30대 여성 / 위스키 / 스모키하고 묵직한 스타일 선호", bio: "하이볼부터 싱글몰트까지 천천히 알아가는 중이에요." },
  { id: 2004, name: "지우", profile: "20대 남성 / 사케 / 가벼운 부드러운 맛 선호", bio: "사케와 일식 페어링을 자주 기록해요." },
  { id: 2019, name: "하나", profile: "20대 여성 / 전통주 / 부드럽고 가벼운 스타일 선호", bio: "깔끔하고 은은한 향의 술을 좋아해요." },
  { id: 2025, name: "도현", profile: "30대 남성 / 와인 / 과일향과 부드러운 맛 선호", bio: "집안주와 어울리는 와인을 자주 찾아봐요." },
  { id: 2101, name: "태훈", profile: "30대 남성 / 위스키 / 묵직한 스모키 스타일 선호", bio: "초보지만 하나씩 기록하면서 취향을 찾고 있어요." },
  { id: 2102, name: "수연", profile: "30대 여성 / 위스키 / 부드러운 스타일 선호", bio: "집에서 만드는 칵테일과 하이볼을 즐겨요." },
  { id: 2103, name: "지민", profile: "20대 여성 / 맥주 / 가벼운 과일향 선호", bio: "라거부터 IPA까지 가볍게 메모해요." },
  { id: 2104, name: "유진", profile: "30대 남성 / 사케 / 가벼운 과일향 선호", bio: "한식과도 잘 어울리는 사케를 찾는 중이에요." },
]

export const usersMockById: Record<number, MockUser> = Object.fromEntries(usersMock.map((user) => [user.id, user]))

export const defaultFollowedUserIdsMock = usersMock.slice(0, 4).map((user) => user.id)

export const currentUserMock = { id: 9999, name: "나", meta: "20대 · 여성" }

export const getUserMetaFromProfile = (profile: string) => {
  const parts = profile.split("/").map((value) => value.trim()).filter(Boolean)
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
