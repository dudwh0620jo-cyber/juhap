import { NONE_OPTION, preferenceGroups } from "../data/setupContent"

type AgeGroup = "20대" | "30대" | "40대" | "50대"
type Gender = "남" | "여"
type UserGrade = "테이스터" | "셀렉터" | "큐레이터" | "소믈리에" | "마스터"

const drinkTypeOptions = new Set(
  (preferenceGroups.find((group) => group.key === "drinkType")?.options ?? []).filter((option) => option !== NONE_OPTION),
)

const traitOptions = new Set(
  (preferenceGroups.find((group) => group.key === "trait")?.options ?? []).filter((option) => option !== NONE_OPTION),
)

type MockUserSeed = {
  id: number
  name: string
  ageGroup: AgeGroup
  gender: Gender
  preferredDrink: string
  preferredTraits: [string] | [string, string]
  grade: UserGrade
  avatarNumber?: number
}

export type MockUser = MockUserSeed & {
  profile: string
}

const normalizeTraits = (traits: MockUserSeed["preferredTraits"]) => traits.slice(0, 2)

const assertOnboardingTasteRule = ({ id, name, preferredDrink, preferredTraits }: MockUserSeed) => {
  if (!drinkTypeOptions.has(preferredDrink)) {
    throw new Error(`usersMock(${id}:${name})의 preferredDrink는 온보딩 drinkType 옵션만 사용할 수 있습니다.`)
  }

  const invalidTrait = preferredTraits.find((trait) => !traitOptions.has(trait))
  if (invalidTrait) {
    throw new Error(`usersMock(${id}:${name})의 preferredTraits는 온보딩 trait 옵션만 사용할 수 있습니다: ${invalidTrait}`)
  }
}

export const formatUserProfile = ({ ageGroup, gender, preferredDrink, preferredTraits }: MockUserSeed) => {
  const traits = normalizeTraits(preferredTraits)
  const parts = [ageGroup, gender, preferredDrink, ...traits].filter(Boolean)
  return `${parts.join(" / ")} 선호`
}

const userSeeds: MockUserSeed[] = [
  /* 커뮤니티 후기 1001~3000 */
  { id: 1001, name: "유나로그", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "부드러운"], grade: "테이스터", avatarNumber: 1 },
  { id: 1002, name: "사토유키", ageGroup: "20대", gender: "남", preferredDrink: "사케", preferredTraits: ["가벼운", "부드러운"], grade: "셀렉터", avatarNumber: 4 },
  { id: 1003, name: "나니카", ageGroup: "40대", gender: "남", preferredDrink: "전통주", preferredTraits: ["무거운", "부드러운"], grade: "테이스터" },
  { id: 1004, name: "이르미", ageGroup: "30대", gender: "여", preferredDrink: "맥주", preferredTraits: ["가벼운", "과일향"], grade: "큐레이터", avatarNumber: 5 },
  { id: 1005, name: "라거로그", ageGroup: "20대", gender: "남", preferredDrink: "맥주", preferredTraits: ["가벼운", "톡쏘는"], grade: "테이스터" },
  { id: 1006, name: "곤", ageGroup: "30대", gender: "남", preferredDrink: "전통주", preferredTraits: ["무거운", "부드러운"], grade: "테이스터", avatarNumber: 7 },
  { id: 1007, name: "안주연구소", ageGroup: "30대", gender: "남", preferredDrink: "소주", preferredTraits: ["톡쏘는", "무거운"], grade: "테이스터" },
  { id: 1008, name: "산데비스탄", ageGroup: "30대", gender: "여", preferredDrink: "사케", preferredTraits: ["부드러운", "가벼운"], grade: "테이스터" },
  { id: 1009, name: "데이비드", ageGroup: "20대", gender: "여", preferredDrink: "하이볼", preferredTraits: ["가벼운", "과일향"], grade: "테이스터" },
  { id: 1010, name: "파르코", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "가벼운"], grade: "테이스터" },
  { id: 1011, name: "루시", ageGroup: "30대", gender: "남", preferredDrink: "맥주", preferredTraits: ["무거운", "톡쏘는"], grade: "셀렉터", avatarNumber: 8 },
  { id: 1012, name: "감자감자감자", ageGroup: "20대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], grade: "큐레이터", avatarNumber: 10 },
  { id: 1013, name: "남집사촌", ageGroup: "20대", gender: "남", preferredDrink: "맥주", preferredTraits: ["가벼운", "기타"], grade: "셀렉터", avatarNumber: 6 },
  { id: 1014, name: "레베카", ageGroup: "20대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], grade: "테이스터" },
  { id: 1015, name: "나비나기", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["부드러운", "과일향"], grade: "셀렉터", avatarNumber: 9 },
  { id: 1016, name: "세나맛", ageGroup: "30대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "기타"], grade: "테이스터", avatarNumber: 11 },
  { id: 1017, name: "민지", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "부드러운"], grade: "테이스터" },
  { id: 1018, name: "틴틴", ageGroup: "30대", gender: "남", preferredDrink: "하이볼", preferredTraits: ["가벼운", "톡쏘는"], grade: "테이스터" },
  { id: 1019, name: "오 와 오", ageGroup: "30대", gender: "남", preferredDrink: "위스키", preferredTraits: ["부드러운", "무거운"], grade: "테이스터" },
  { id: 1020, name: "윙쿠츕츕", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "가벼운"], grade: "테이스터" },
  { id: 1021, name: "텐텐", ageGroup: "30대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "부드러운"], grade: "소믈리에" },
  /* 댓글 seed 전용 사용자 2001~2999 */
  { id: 2001, name: "구웨엑", ageGroup: "20대", gender: "여", preferredDrink: "위스키", preferredTraits: ["부드러운", "오크향"], grade: "테이스터" },
  { id: 2002, name: "곽필팔", ageGroup: "30대", gender: "남", preferredDrink: "하이볼", preferredTraits: ["가벼운", "톡쏘는"], grade: "셀렉터" },
  { id: 2003, name: "스틴", ageGroup: "30대", gender: "남", preferredDrink: "위스키", preferredTraits: ["부드러운", "무거운"], grade: "테이스터" },
  { id: 2019, name: "칸예", ageGroup: "30대", gender: "남", preferredDrink: "맥주", preferredTraits: ["가벼운", "부드러운"], grade: "테이스터" },
  { id: 2025, name: "시비르", ageGroup: "20대", gender: "여", preferredDrink: "사케", preferredTraits: ["가벼운", "부드러운"], grade: "테이스터" },
  { id: 2101, name: "키르아", ageGroup: "30대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], grade: "큐레이터" },
  { id: 2102, name: "야왜", ageGroup: "20대", gender: "남", preferredDrink: "사케", preferredTraits: ["가벼운", "과일향"], grade: "셀렉터" },
  { id: 2103, name: "서연고", ageGroup: "20대", gender: "여", preferredDrink: "맥주", preferredTraits: ["가벼운", "톡쏘는"], grade: "큐레이터" },
  { id: 2104, name: "솔리티어", ageGroup: "30대", gender: "여", preferredDrink: "와인", preferredTraits: ["무거운", "부드러운"], grade: "테이스터" },
  { id: 2105, name: "시카", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "무거운"], grade: "테이스터" },
  { id: 2113, name: "현실도pizza", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["부드러운", "과일향"], grade: "테이스터" },
  { id: 2115, name: "명란젓코난", ageGroup: "30대", gender: "남", preferredDrink: "사케", preferredTraits: ["가벼운", "부드러운"], grade: "테이스터" },
  { id: 2116, name: "추적60인분", ageGroup: "30대", gender: "남", preferredDrink: "와인", preferredTraits: ["무거운", "오크향"], grade: "테이스터" },
  { id: 2117, name: "화월", ageGroup: "20대", gender: "여", preferredDrink: "맥주", preferredTraits: ["톡쏘는", "무거운"], grade: "테이스터" },
  { id: 2118, name: "시즈크", ageGroup: "30대", gender: "남", preferredDrink: "소주", preferredTraits: ["톡쏘는", "가벼운"], grade: "테이스터" },
  /* 카테고리 상세페이지(닷사이 23) 술 후기 3001~5000 */
  { id: 3001, name: "순대렐라", ageGroup: "20대", gender: "여", preferredDrink: "사케", preferredTraits: ["가벼운", "과일향"], grade: "테이스터", avatarNumber: 13 },
  { id: 3002, name: "벼랑위의 당뇨", ageGroup: "30대", gender: "남", preferredDrink: "사케", preferredTraits: ["부드러운", "가벼운"], grade: "소믈리에", avatarNumber: 15 },
  { id: 3003, name: "이웃집 또터러", ageGroup: "20대", gender: "남", preferredDrink: "사케", preferredTraits: ["부드러운", "과일향"], grade: "테이스터", avatarNumber: 17 },
  { id: 3004, name: "엄마곗돈", ageGroup: "30대", gender: "여", preferredDrink: "맥주", preferredTraits: ["톡쏘는"], grade: "테이스터", avatarNumber: 19 },
  { id: 3005, name: "달려야하니", ageGroup: "40대", gender: "남", preferredDrink: "위스키", preferredTraits: ["무거운", "오크향"], grade: "셀렉터", avatarNumber: 21 },
  { id: 3006, name: "잔잔한리뷰어", ageGroup: "30대", gender: "여", preferredDrink: "사케", preferredTraits: ["부드러운", "가벼운"], grade: "테이스터" },
  /* 카테고리 상세페이지(닷사이 23) 페어링 추천 5001~6000 */
  { id: 5001, name: "옹심이", ageGroup: "50대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], grade: "셀렉터" },
  { id: 5002, name: "사케가 좋아", ageGroup: "40대", gender: "남", preferredDrink: "사케", preferredTraits: ["가벼운", "부드러운"], grade: "셀렉터" },
  /* 커뮤니티 질문 6001~8000 */
  { id: 6001, name: "용시이", ageGroup: "50대", gender: "남", preferredDrink: "전통주", preferredTraits: ["가벼운", "부드러운"], grade: "큐레이터", avatarNumber: 2 },
  { id: 6002, name: "서연", ageGroup: "30대", gender: "여", preferredDrink: "위스키", preferredTraits: ["무거운", "오크향"], grade: "소믈리에", avatarNumber: 3 },
  { id: 6003, name: "오크데이", ageGroup: "30대", gender: "남", preferredDrink: "위스키", preferredTraits: ["무거운", "부드러운"], grade: "마스터" },
  { id: 6004, name: "죽쒀서남준다", ageGroup: "30대", gender: "여", preferredDrink: "맥주", preferredTraits: ["가벼운", "과일향"], grade: "큐레이터", avatarNumber: 5 },
  { id: 6005, name: "memteo", ageGroup: "20대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], grade: "큐레이터", avatarNumber: 10 },
  { id: 6006, name: "다이스키", ageGroup: "30대", gender: "남", preferredDrink: "전통주", preferredTraits: ["무거운", "부드러운"], grade: "테이스터", avatarNumber: 7 },
  { id: 6007, name: "할만두", ageGroup: "20대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], grade: "테이스터" },
]

userSeeds.forEach(assertOnboardingTasteRule)

export const usersMock: MockUser[] = userSeeds.map((user) => ({
  ...user,
  profile: formatUserProfile(user),
}))

export const usersMockById: Record<number, MockUser> = Object.fromEntries(usersMock.map((user) => [user.id, user]))

export const defaultFollowedUserIdsMock = usersMock.slice(0, 5).map((user) => user.id)

export const currentUserMock = { id: 9999, name: "주합러", meta: "내 정보 연동" }

export const getFollowingCount = (followedUserIds: ReadonlySet<number>) => {
  return Array.from(followedUserIds).filter((userId) => userId !== currentUserMock.id && Boolean(usersMockById[userId]))
    .length
}

export const getUserMetaFromProfile = (profile: string) => {
  const parts = profile
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean)
  const ageGender = parts.slice(0, 2).join(" / ")
  return ageGender || profile
}

export type MentionUserMock = { id: number; name: string; meta: string }
export const mentionDirectoryMock: MentionUserMock[] = usersMock.map((user) => ({
  id: user.id,
  name: user.name,
  meta: getUserMetaFromProfile(user.profile),
}))
