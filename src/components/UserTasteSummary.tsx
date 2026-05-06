type Props = {
  drinkTypes: string[]
  traits: string[]
}

function uniq(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))
}

export default function UserTasteSummary({ drinkTypes, traits }: Props) {
  const drinkTypeLabels = uniq(drinkTypes)
  const traitLabels = uniq(traits)

  return (
    <section className="my_profile_card" aria-label="내 취향">
      <h2 className="my_profile_card_title">내 취향</h2>

      <div className="my_profile_row" aria-label="주종 선호">
        <div className="my_profile_label">주종 선호</div>
        <div className="my_profile_value">
          {drinkTypeLabels.length ? (
            <div className="my_chip_row">
              {drinkTypeLabels.map((label) => (
                <span key={label} className="my_chip">
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <span className="my_profile_empty">아직 없어요</span>
          )}
        </div>
      </div>

      <div className="my_profile_row" aria-label="좋아하는 술 특징">
        <div className="my_profile_label">좋아하는 술 특징</div>
        <div className="my_profile_value">
          {traitLabels.length ? (
            <div className="my_chip_row">
              {traitLabels.map((label) => (
                <span key={label} className="my_chip">
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <span className="my_profile_empty">아직 없어요</span>
          )}
        </div>
      </div>
    </section>
  )
}

