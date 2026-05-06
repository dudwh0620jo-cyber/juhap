import UserTasteSummary from "../components/UserTasteSummary"
import { NONE_OPTION } from "../data/setupContent"
import { readUserProfile } from "../data/userProfile"
import { getPairingTierByUserId, getPairingTierLabel, getUserGradeBadgeClassNameByTier } from "../utils/pairingTier"
import "../styles/my.css"

export default function MyPage() {
  const profile = readUserProfile()
  const myTier = getPairingTierByUserId(2001)
  const nickname = profile.personalInfo.nickname.trim()
  const drinkTypes = (profile.tastePreferences.drinkType ?? []).filter((value) => value !== NONE_OPTION)
  const traits = (profile.tastePreferences.trait ?? []).filter((value) => value !== NONE_OPTION)

  return (
    <section className="page_screen my_page" aria-label="마이페이지">
      <h1 className="my_page_title">{nickname ? `${nickname}님` : "MY"}</h1>
      <div className="my_grade_row" aria-label="내 등급">
        <span className="my_grade_label">내 등급</span>
        <span className={getUserGradeBadgeClassNameByTier(myTier)}>{getPairingTierLabel(myTier)}</span>
      </div>
      <UserTasteSummary drinkTypes={drinkTypes} traits={traits} />
    </section>
  )
}
