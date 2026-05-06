import "../styles/my.css"
import UserTasteSummary from "../components/UserTasteSummary"
import { useUserProfile } from "../utils/userProfile"
import { useUserTasteProfile } from "../utils/userTasteProfile"
import { getPairingTierByUserId, getPairingTierLabel, getUserGradeBadgeClassNameByTier } from "../utils/pairingTier"

export default function MyPage() {
  const { value: profile } = useUserProfile()
  const { value: taste } = useUserTasteProfile()
  const myTier = getPairingTierByUserId(2001)

  return (
    <section className="page_screen my_page" aria-label="내 정보">
      <h1 className="my_page_title">{profile?.nickname?.trim() ? `${profile.nickname}님` : "MY"}</h1>
      <div className="my_grade_row" aria-label="내 등급">
        <span className="my_grade_label">내 등급</span>
        <span className={getUserGradeBadgeClassNameByTier(myTier)}>{getPairingTierLabel(myTier)}</span>
      </div>
      <UserTasteSummary drinkTypes={taste?.drinkTypes ?? []} traits={taste?.traits ?? []} />
    </section>
  )
}
