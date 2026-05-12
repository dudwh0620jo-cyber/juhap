import { Link } from "react-router"
import { resolveReviewImage } from "../utils/reviewImages"

export type WeeklyDrinkItem = {
  id: string
  name: string
  type: string
  origin: string
  variety: string
  rating: number
  sweetness: string
  thumbId?: string
}

type WeeklyDrinkProps = {
  title: string
  linkTo: string
  items: WeeklyDrinkItem[]
}

function DrinkInfo({ info }: { info: WeeklyDrinkItem }) {
  return (
    <div className="weekly_drink_info">
      <h4 className="weekly_drink_name">{info.name}</h4>
      <div className="weekly_drink_meta">
        <span className="weekly_drink_chip">{info.type}</span>
        <span className="weekly_drink_chip">평점: {info.rating.toFixed(1)}</span>
        <span className="weekly_drink_chip">{info.sweetness}</span>
      </div>
      <div className="weekly_drink_specs">
        <div>원산지: {info.origin}</div>
        <div>품종: {info.variety}</div>
      </div>
    </div>
  )
}

export default function WeeklyDrink({ title, linkTo, items }: WeeklyDrinkProps) {
  return (
    <section className="home_block">
      <div className="ranking_header">
        <h3>{title}</h3>
        <Link to={linkTo} className="more_button">
          자세히 보기
        </Link>
      </div>
      <div className="drink_card_row weekly_drink_row" aria-label="금주의 주류 소개 목록">
        {items.map((item) => (
          <Link key={item.id} to={`/product/${item.id}`} className="weekly_drink_card">
            <div className="weekly_drink_photo" aria-hidden="true">
              {item.thumbId ? <img src={resolveReviewImage(item.thumbId)} alt="" /> : null}
            </div>
            <DrinkInfo info={item} />
          </Link>
        ))}
      </div>
    </section>
  )
}
