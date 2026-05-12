import myProfileImage from "../assets/my_profile_image.png"
import defaultUserAvatar from "../assets/user_avatar_defult.png"
import { usersMockById } from "./usersMock"

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

export function resolveMyUserAvatar(): string {
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
