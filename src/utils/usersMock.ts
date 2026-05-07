export type MockUser = {
  id: number
  name: string
  profile: string
  bio: string
}

export const usersMock: MockUser[] = [
  { id: 2001, name: "민지", profile: "30대 여성 / 와인 / 부드러운, 과일향 선호", bio: "퇴근 후 와인 한 잔, 페어링 기록합니다." },
  { id: 2002, name: "현우", profile: "20대 남성 / 맥주 / 가벼운, 톡쏘는 선호", bio: "수제맥주, 안주 조합 찾는 중." },
  { id: 2003, name: "서연", profile: "30대 여성 / 위스키 / 오크향, 무거운 선호", bio: "하이볼 레시피랑 입문 위스키 정리해요." },
  { id: 2004, name: "지훈", profile: "20대 남성 / 사케 / 가벼운, 부드러운 선호", bio: "사케·일식 페어링 위주로 올립니다." },
  { id: 2019, name: "유나", profile: "20대 여성 / 전통주 / 부드러운, 가벼운 선호", bio: "깔끔하고 은은한 맛을 좋아해요." },
  { id: 2025, name: "수빈", profile: "30대 여성 / 와인 / 과일향, 부드러운 선호", bio: "집안주 페어링을 자주 올려요." },
  { id: 2101, name: "연훈", profile: "30대 남성 / 위스키 / 무거운, 오크향 선호", bio: "초보도 따라할 수 있는 조합 위주!" },
  { id: 2102, name: "수연", profile: "30대 여성 / 위스키 / 부드러운, 오크향 선호", bio: "집에서 만드는 칵테일/하이볼 공유합니다." },
  { id: 2103, name: "지민", profile: "20대 여성 / 맥주 / 가벼운, 과일향 선호", bio: "라거부터 IPA까지, 가볍게 기록해요." },
  { id: 2104, name: "도윤", profile: "30대 남성 / 사케 / 가벼운, 과일향 선호", bio: "한 잔의 밸런스가 중요하죠." },
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
