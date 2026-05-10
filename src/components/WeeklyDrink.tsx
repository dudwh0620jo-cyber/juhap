import { Link } from "react-router"

export type WeeklyDrinkItem = {
  id: string
  name: string
  type: string
  origin: string
  variety: string
  rating: number
  sweetness: string
}

type WeeklyDrinkProps = {
  title: string
  linkTo: string
  items: WeeklyDrinkItem[]
}

function DrinkInfo({ info }: { info: WeeklyDrinkItem }) {
  return (
    <div className="drink_info">
      <h4>{info.name}</h4>
      <p>종류 : {info.type}</p>
      <p>생산지 : {info.origin}</p>
      <p>품종 : {info.variety}</p>
      <p>평점 : {info.rating}</p>
      <p>당도 : {info.sweetness}</p>
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
      <div className="drink_card_row" aria-label="금주의 주류 소개 목록">
        {items.map((item) => (
          <article className="drink_card" key={item.id}>
            <DrinkInfo info={item} />
            <div className="drink_bottle" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  )
}
