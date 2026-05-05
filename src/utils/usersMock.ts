export type MockUser = {
  id: number
  name: string
  profile: string
  bio: string
}

export const usersMock: MockUser[] = [
  { id: 2001, name: "민지", profile: "30대 / 서울 / 와인 선호", bio: "퇴근 후 와인 한 잔, 페어링 기록합니다." },
  { id: 2002, name: "현우", profile: "20대 / 부산 / 맥주 러버", bio: "수제맥주, 안주 조합 찾는 중." },
  { id: 2003, name: "서연", profile: "30대 / 경기 / 위스키 관심", bio: "하이볼 레시피랑 입문 위스키 정리해요." },
  { id: 2004, name: "지훈", profile: "20대 / 인천 / 사케 입문", bio: "사케·일식 페어링 위주로 올립니다." },
  { id: 2019, name: "유나", profile: "20대 / 서울 / 소주 · 전통주", bio: "깔끔하고 은은한 맛을 좋아해요." },
  { id: 2025, name: "수빈", profile: "30대 / 제주 / 와인 · 사케", bio: "집안주 페어링을 자주 올려요." },
  { id: 2101, name: "연훈", profile: "30대 / 경기 / 위스키 관심", bio: "초보도 따라할 수 있는 조합 위주!" },
  { id: 2102, name: "수연", profile: "30대 / 경기 / 위스키 관심", bio: "집에서 만드는 칵테일/하이볼 공유합니다." },
  { id: 2103, name: "지민", profile: "20대 / 광주 / 맥주 · 페어링", bio: "라거부터 IPA까지, 가볍게 기록해요." },
  { id: 2104, name: "도윤", profile: "30대 / 대구 / 위스키 · 칵테일", bio: "한 잔의 밸런스가 중요하죠." },
]

export const usersMockById: Record<number, MockUser> = Object.fromEntries(usersMock.map((user) => [user.id, user]))

export const defaultFollowedUserIdsMock = usersMock.slice(0, 4).map((user) => user.id)

export const currentUserMock = { id: 9999, name: "나", meta: "서울 · 20대" }

export const getUserMetaFromProfile = (profile: string) => {
  const parts = profile.split("/").map((value) => value.trim()).filter(Boolean)
  const age = parts[0] ?? ""
  const city = parts[1] ?? ""
  if (city && age) return `${city} · ${age}`
  return profile
}

export type MentionUserMock = { id: number; name: string; meta: string }
export const mentionDirectoryMock: MentionUserMock[] = usersMock.map((user) => ({
  id: user.id,
  name: user.name,
  meta: getUserMetaFromProfile(user.profile),
}))
