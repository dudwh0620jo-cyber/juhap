import { Link } from "react-router"
import iconCaretRightWhite from "../assets/svg/caretright_w.svg"

function splitPairingTitle(title: string) {
  if (!title.includes("+")) return null
  const [left, right] = title.split("+").map((value) => value.trim())
  if (!left || !right) return null
  return { drink: left, food: right }
}

export default function TodayHeroCopy({
  label,
  title,
  description,
  to,
  showMorePill = true,
  disabled = false,
}: {
  label: string
  title: string
  description: string
  to?: string
  showMorePill?: boolean
  disabled?: boolean
}) {
  const pairing = splitPairingTitle(title)
  const content = (
    <>
      <div className="home_today_hero_label">{label}</div>
      <strong className="home_today_hero_title">
        {pairing ? (
          <>
            <span className="home_today_hero_food">{pairing.food}</span>
            <span className="home_today_hero_x"> × </span>
            <span className="home_today_hero_drink">{pairing.drink}</span>
          </>
        ) : (
          title
        )}
      </strong>
      <div className="home_today_hero_desc">{description}</div>
      {showMorePill ? (
        <div className="home_today_hero_link" aria-hidden="true">
          <span>자세히 보기</span>
          <img src={iconCaretRightWhite} alt="" />
        </div>
      ) : null}
    </>
  )

  const className = `home_today_hero_copy${disabled ? " is_disabled" : ""}`

  if (to && !disabled) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
