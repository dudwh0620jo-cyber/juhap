import { Link } from "react-router"
import iconRating from "../assets/icon_rating.png"
import iconSweetness from "../assets/icon_sweetness.png"
import iconAbv from "../assets/icon_abv.png"
import iconVariety from "../assets/icon_variety.png"
import weeklyDrinkBg01 from "../assets/weekly_drink_bg_01.png"
import weeklyDrinkBg02 from "../assets/weekly_drink_bg_02.png"
import weeklyDrinkBg03 from "../assets/weekly_drink_bg_03.png"
import { resolveReviewImage } from "../utils/reviewImages"

export type WeeklyDrinkItem = {
  id: string
  name: string
  type: string
  origin: string
  variety: string
  rating: number
  sweetness: string
  abv: string
  priceLabel: string
  tags: string[]
  theme?: "sake" | "white" | "red"
  thumbId?: string
  disabled?: boolean
}

type WeeklyDrinkProps = {
  title: string
  items: WeeklyDrinkItem[]
}

function renderWithLineBreaks(value: string) {
  const parts = value.split("\n")
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? <br /> : null}
    </span>
  ))
}

function DrinkStat({ iconSrc, label, value }: { iconSrc: string; label: string; value: string }) {
  return (
    <div className="weekly_drink_stat">
      <span className="weekly_drink_stat_icon" aria-hidden="true">
        <img src={iconSrc} alt="" />
      </span>
      <span className="weekly_drink_stat_text">
        <span className="weekly_drink_stat_label">{label}:</span>
        <span className="weekly_drink_stat_value">{renderWithLineBreaks(value)}</span>
      </span>
    </div>
  )
}

export default function WeeklyDrink({ title, items }: WeeklyDrinkProps) {
  const backgrounds = [weeklyDrinkBg01, weeklyDrinkBg02, weeklyDrinkBg03] as const
  const formatPriceLabel = (value: string) => value

  return (
    <section className="home_block home_weekly_drink" aria-label="금주의 주류 소개">
      <div className="home_block_header">
        <div className="home_block_header_copy">
          <h3>{title}</h3>
          <p className="home_block_subtitle">이번 주 주목할 만한 술을 소개해요.</p>
        </div>
      </div>

      <div className="drink_card_row weekly_drink_row" aria-label="금주의 주류 소개 목록">
        {items.map((item, index) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className={`weekly_drink_card${item.theme ? ` is_${item.theme}` : ""}${item.disabled ? " is_disabled" : ""}`}
            aria-label={`${item.name} 상세 보기`}
            aria-disabled={item.disabled ? "true" : undefined}
            tabIndex={item.disabled ? -1 : undefined}
            onClick={(event) => {
              if (!item.disabled) return
              event.preventDefault()
            }}
          >
            <div className="weekly_drink_clip" aria-hidden="true">
              <div className="weekly_drink_bg">
                <img src={backgrounds[index % backgrounds.length]} alt="" />
              </div>

              <div className="weekly_drink_card_inner">
                <div className="weekly_drink_left">
                  <div className="weekly_drink_info_panel">
                    <h4 className="weekly_drink_name">{renderWithLineBreaks(item.name)}</h4>
                    <div className="weekly_drink_kv">
                      <span className="weekly_drink_kv_type">{item.type}</span>
                      <span className="weekly_drink_kv_divider" aria-hidden="true">
                        |
                      </span>
                      <span className="weekly_drink_kv_origin">{item.origin}</span>
                    </div>
                    <div className="weekly_drink_price">{formatPriceLabel(item.priceLabel)}</div>
                  </div>
                </div>

                <div className="weekly_drink_right">
                  <DrinkStat iconSrc={iconRating} label="평점" value={item.rating.toFixed(1)} />
                  <DrinkStat iconSrc={iconSweetness} label="당도" value={item.sweetness} />
                  <DrinkStat iconSrc={iconAbv} label="도수" value={item.abv} />
                  <DrinkStat iconSrc={iconVariety} label="품종" value={item.variety} />
                </div>

                <div className="weekly_drink_tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="weekly_drink_tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {item.thumbId ? (
              <div
                className={item.thumbId === "drink_dassai_23_detail" ? "weekly_drink_bottle_slot is_dassai23_detail" : "weekly_drink_bottle_slot"}
                aria-hidden="true"
              >
                <img
                  className={item.thumbId === "drink_dassai_23_detail" ? "weekly_drink_bottle is_dassai23_detail" : "weekly_drink_bottle"}
                  src={resolveReviewImage(item.thumbId)}
                  alt=""
                />
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  )
}
