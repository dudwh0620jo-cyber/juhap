import myProfileImage from "../assets/my_profile_image.png"
import defaultUserAvatar from "../assets/user_avatar_defult.png"
import { usersMockById } from "./usersMock"

const MY_AVATAR_STORAGE_KEY = "juhap_my_avatar_number"
const MY_PROFILE_PHOTO_STORAGE_KEY = "juhap_my_profile_photo_data_url"

const userAvatarModules = import.meta.glob("../assets/user_avatar_*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>

const sortedUserAvatars = Object.entries(userAvatarModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const userAvatarByNumber = Object.fromEntries(
  Object.keys(userAvatarModules).map((path) => {
    const matched = path.match(/user_avatar_(\d+)\.png$/)
    const number = matched ? Number.parseInt(matched[1], 10) : NaN
    return [number, userAvatarModules[path]]
  }),
) as Record<number, string>

export function getMyUserAvatarOptions() {
  return Object.entries(userAvatarByNumber)
    .filter(([key]) => Number.isFinite(Number(key)))
    .map(([key, src]) => ({ number: Number(key), src }))
    .sort((a, b) => a.number - b.number)
}

export function readMyUserAvatarNumber(): number | null {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null
  const raw = window.localStorage.getItem(MY_AVATAR_STORAGE_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

export function writeMyUserAvatarNumber(nextNumber: number | null) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return
  if (nextNumber === null) window.localStorage.removeItem(MY_AVATAR_STORAGE_KEY)
  else window.localStorage.setItem(MY_AVATAR_STORAGE_KEY, String(nextNumber))
}

export function readMyProfilePhotoDataUrl(): string | null {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null
  const raw = window.localStorage.getItem(MY_PROFILE_PHOTO_STORAGE_KEY)
  if (!raw) return null
  return raw
}

export function writeMyProfilePhotoDataUrl(nextDataUrl: string | null) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return
  if (!nextDataUrl) window.localStorage.removeItem(MY_PROFILE_PHOTO_STORAGE_KEY)
  else window.localStorage.setItem(MY_PROFILE_PHOTO_STORAGE_KEY, nextDataUrl)
}

export function resolveMyUserAvatar(): string {
  const profilePhoto = readMyProfilePhotoDataUrl()
  if (typeof profilePhoto === "string" && profilePhoto.length > 0) return profilePhoto
  const selectedNumber = readMyUserAvatarNumber()
  if (typeof selectedNumber === "number" && userAvatarByNumber[selectedNumber]) return userAvatarByNumber[selectedNumber]
  return myProfileImage
}

export function resolveUserAvatar(userId: number): string | undefined {
  if (!Number.isFinite(userId)) return defaultUserAvatar

  const avatarNumber = usersMockById[userId]?.avatarNumber
  if (typeof avatarNumber === "number") {
    const resolved = userAvatarByNumber[avatarNumber]
    if (resolved) return resolved
  }

  if (sortedUserAvatars.length === 0) return defaultUserAvatar
  return defaultUserAvatar
}
