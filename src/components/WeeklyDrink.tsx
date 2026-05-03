import { Link } from "react-router"

type WeeklyDrinkProps = {
  title: string
  linkTo: string
  info: {
    name: string
    type: string
    origin: string
    variety: string
    rating: number
    sweetness: string
  }
}

function DrinkInfo({ info }: { info: WeeklyDrinkProps["info"] }) {
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

export default function WeeklyDrink({ title, linkTo, info }: WeeklyDrinkProps) {
  return (
    <section className="home_block">
      <h3>{title}</h3>
      <Link to={linkTo} className="drink_card_link">
        <article className="drink_card">
          <DrinkInfo info={info} />
          <div className="drink_bottle" aria-hidden="true" />
        </article>
      </Link>
    </section>
  )
}
