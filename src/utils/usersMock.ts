import { NONE_OPTION, preferenceGroups } from "../data/setupContent"

type AgeGroup = "20대" | "30대" | "40대" | "50대"
type Gender = "남" | "여"

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
  bio: string
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
  { id: 2001, name: "유나로그", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "부드러운"], bio: "파티 분위기 나는 조합을 자주 기록해요.", avatarNumber: 1 },
  { id: 2002, name: "용시이", ageGroup: "50대", gender: "남", preferredDrink: "전통주", preferredTraits: ["가벼운", "부드러운"], bio: "한식과 잘 맞는 막걸리를 찾는 중입니다.", avatarNumber: 2 },
  { id: 2003, name: "서연", ageGroup: "30대", gender: "여", preferredDrink: "위스키", preferredTraits: ["무거운", "오크향"], bio: "싱글몰트부터 버번까지 천천히 경험하는 중이에요.", avatarNumber: 3 },
  { id: 2004, name: "사토유키", ageGroup: "20대", gender: "남", preferredDrink: "사케", preferredTraits: ["가벼운", "부드러운"], bio: "사케와 일식 페어링을 기록하는 걸 좋아해요.", avatarNumber: 4 },
  { id: 2019, name: "프로워박러", ageGroup: "30대", gender: "여", preferredDrink: "맥주", preferredTraits: ["가벼운", "과일향"], bio: "가볍고 시원한 라거 페어링을 즐겨요.", avatarNumber: 5 },
  { id: 2025, name: "남집사촌", ageGroup: "20대", gender: "남", preferredDrink: "맥주", preferredTraits: ["가벼운", "기타"], bio: "캠핑 분위기와 어울리는 안주 조합을 찾습니다.", avatarNumber: 6 },
  { id: 2101, name: "형편없는 삼차원구", ageGroup: "30대", gender: "남", preferredDrink: "전통주", preferredTraits: ["무거운", "부드러운"], bio: "막걸리와 전 조합에 진심입니다.", avatarNumber: 7 },
  { id: 2102, name: "콩깐대끼", ageGroup: "30대", gender: "남", preferredDrink: "맥주", preferredTraits: ["무거운", "톡쏘는"], bio: "고기와 맥주 조합을 제일 좋아해요.", avatarNumber: 8 },
  { id: 2103, name: "만족스러운 나비나기", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["부드러운", "과일향"], bio: "크리미한 소스와 와인 궁합을 즐깁니다.", avatarNumber: 9 },
  { id: 2104, name: "감자감자감자", ageGroup: "20대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], bio: "막걸리 향과 전의 식감을 중요하게 봐요.", avatarNumber: 10 },
  { id: 2105, name: "세나맛", ageGroup: "30대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "기타"], bio: "비 오는 날 해물전과 막걸리 조합이 최고예요.", avatarNumber: 11 },
  { id: 2106, name: "민지", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "부드러운"], bio: "치즈 플래터와 와인 매칭 기록 중이에요.", avatarNumber: 1 },
  { id: 2107, name: "하이볼러", ageGroup: "30대", gender: "남", preferredDrink: "하이볼", preferredTraits: ["가벼운", "톡쏘는"], bio: "탄산감 있는 하이볼과 튀김 조합을 좋아해요.", avatarNumber: 2 },
  { id: 2108, name: "주합러", ageGroup: "20대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], bio: "담백하고 은은한 전통주를 찾고 있어요.", avatarNumber: 3 },
  { id: 2109, name: "버번초보", ageGroup: "30대", gender: "남", preferredDrink: "위스키", preferredTraits: ["부드러운", "무거운"], bio: "입문자 기준으로 부드러운 버번을 찾습니다.", avatarNumber: 4 },
  { id: 2110, name: "샴페인조아", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "가벼운"], bio: "브런치와 스파클링 조합을 공유해요.", avatarNumber: 5 },
  { id: 2111, name: "해달한잔", ageGroup: "30대", gender: "여", preferredDrink: "사케", preferredTraits: ["부드러운", "가벼운"], bio: "회와 조개류에 어울리는 사케 조합을 자주 메모해요." },
  { id: 2112, name: "라거로그", ageGroup: "20대", gender: "남", preferredDrink: "맥주", preferredTraits: ["가벼운", "톡쏘는"], bio: "캠핑에서 먹기 좋은 라거와 구이 조합을 정리합니다." },
  { id: 2113, name: "보틀노트", ageGroup: "30대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "부드러운"], bio: "집에서 따라 하기 쉬운 와인 페어링을 기록해요." },
  { id: 2114, name: "막걸리산책", ageGroup: "40대", gender: "남", preferredDrink: "전통주", preferredTraits: ["무거운", "부드러운"], bio: "지역 막걸리와 전 조합을 찾아다니는 걸 좋아합니다." },
  { id: 2115, name: "토닉웨이브", ageGroup: "20대", gender: "여", preferredDrink: "하이볼", preferredTraits: ["가벼운", "과일향"], bio: "산뜻한 하이볼과 가벼운 안주 조합을 즐겨요." },
  { id: 2116, name: "오크데이", ageGroup: "30대", gender: "남", preferredDrink: "위스키", preferredTraits: ["무거운", "부드러운"], bio: "버번과 초콜릿처럼 달콤한 조합을 자주 시도해요." },
  { id: 2117, name: "브리앤버블", ageGroup: "20대", gender: "여", preferredDrink: "와인", preferredTraits: ["과일향", "가벼운"], bio: "치즈 플래터와 스파클링 와인 조합을 꾸준히 공유합니다." },
  { id: 2118, name: "안주연구소", ageGroup: "30대", gender: "남", preferredDrink: "소주", preferredTraits: ["톡쏘는", "무거운"], bio: "늦은 밤 잘 어울리는 소주 안주 조합을 연구해요." },
  { id: 2119, name: "옹심이", ageGroup: "50대", gender: "남", preferredDrink: "전통주", preferredTraits: ["부드러운", "가벼운"], bio: "막걸리와 사케를 좋아하는 50대입니다." },
  { id: 2120, name: "사케가 좋아", ageGroup: "40대", gender: "남", preferredDrink: "사케", preferredTraits: ["가벼운", "부드러운"], bio: "사케와 일식 페어링을 즐겨 기록합니다." },
]

userSeeds.forEach(assertOnboardingTasteRule)

export const usersMock: MockUser[] = userSeeds.map((user) => ({
  ...user,
  profile: formatUserProfile(user),
}))

export const usersMockById: Record<number, MockUser> = Object.fromEntries(usersMock.map((user) => [user.id, user]))

export const defaultFollowedUserIdsMock = usersMock.slice(0, 4).map((user) => user.id)

export const currentUserMock = { id: 9999, name: "주합러", meta: "내 정보 연동" }

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
