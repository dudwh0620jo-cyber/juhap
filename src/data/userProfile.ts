import { preferenceGroups } from "./setupContent"

export type UserAccount = {
  email: string
  password: string
}

export type UserPersonalInfo = {
  nickname: string
  phone: string
  gender: string
  ageRange: string
  address: string
  detailAddress: string
  isPhoneVerified: boolean
}

export type UserTastePreferences = Record<string, string[]>

export type UserProfile = {
  account: UserAccount
  personalInfo: UserPersonalInfo
  tastePreferences: UserTastePreferences
}

const USER_PROFILE_STORAGE_KEY = "juhap_user_profile"
export const NICKNAME_MAX_LENGTH = 9

export function sanitizeNickname(nickname: string) {
  return nickname.trim().slice(0, NICKNAME_MAX_LENGTH)
}

function createDefaultTastePreferences(): UserTastePreferences {
  return preferenceGroups.reduce<UserTastePreferences>((acc, group) => {
    acc[group.key] = []
    return acc
  }, {})
}

export const defaultUserProfile: UserProfile = {
  account: {
    email: "",
    password: "",
  },
  personalInfo: {
    nickname: "",
    phone: "",
    gender: "",
    ageRange: "",
    address: "",
    detailAddress: "",
    isPhoneVerified: false,
  },
  tastePreferences: createDefaultTastePreferences(),
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export function readUserProfile(): UserProfile {
  if (!canUseStorage()) return defaultUserProfile

  try {
    const rawProfile = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY)
    if (!rawProfile) return defaultUserProfile

    const parsedProfile = JSON.parse(rawProfile) as Partial<UserProfile>

    return {
      account: {
        ...defaultUserProfile.account,
        ...parsedProfile.account,
      },
      personalInfo: {
        ...defaultUserProfile.personalInfo,
        ...parsedProfile.personalInfo,
      },
      tastePreferences: {
        ...createDefaultTastePreferences(),
        ...defaultUserProfile.tastePreferences,
        ...parsedProfile.tastePreferences,
      },
    }
  } catch {
    return defaultUserProfile
  }
}

export function isUserOnboardingComplete(profile = readUserProfile()) {
  const hasProfile =
    profile.personalInfo.nickname.trim().length > 0 &&
    profile.personalInfo.phone.trim().length > 0 &&
    profile.personalInfo.isPhoneVerified

  const hasTastePreferences = preferenceGroups.every((group) => (profile.tastePreferences[group.key] ?? []).length > 0)

  return hasProfile && hasTastePreferences
}

export function writeUserProfile(nextProfile: UserProfile) {
  if (!canUseStorage()) return
  window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))
}

export function updateUserAccount(account: UserAccount) {
  const currentProfile = readUserProfile()
  writeUserProfile({
    ...currentProfile,
    account,
  })
}

export function updateUserPersonalInfo(personalInfo: UserPersonalInfo) {
  const currentProfile = readUserProfile()
  writeUserProfile({
    ...currentProfile,
    personalInfo: {
      ...personalInfo,
      nickname: sanitizeNickname(personalInfo.nickname),
    },
  })
}

export function updateUserTastePreferences(tastePreferences: UserTastePreferences) {
  const currentProfile = readUserProfile()
  writeUserProfile({
    ...currentProfile,
    tastePreferences,
  })
}
