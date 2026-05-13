import { Link } from "react-router"
import { homeAssets, homeWeeklyRankingCards } from "../data/homeContent"

type HomeWeeklyRankingProps = {
  title: string
  subtitle: string
  linkTo: string
}

function WeeklyRankingCard({
  badgeSrc,
  drinkSrc,
  foodSrc,
  title,
  subtitle,
  scoreLabel,
  isCenter,
}: {
  badgeSrc: string
  drinkSrc: string
  foodSrc: string
  title: string
  subtitle: string
  scoreLabel: string
  isCenter?: boolean
}) {
  return (
    <article className={`home_weekly_rank_card${isCenter ? " is_center" : ""}`}>
      <div className="home_weekly_rank_badge" aria-hidden="true">
        <img src={badgeSrc} alt="" />
      </div>
      <div className="home_weekly_rank_images" aria-hidden="true">
        <img className="home_weekly_rank_drink" src={drinkSrc} alt="" />
        <img className="home_weekly_rank_food" src={foodSrc} alt="" />
      </div>
      <div className="home_weekly_rank_title">{title}</div>
      <div className="home_weekly_rank_subtitle">{subtitle}</div>
      <div className="home_weekly_rank_score">{scoreLabel}</div>
    </article>
  )
}

export default function HomeWeeklyRanking({ title, subtitle, linkTo }: HomeWeeklyRankingProps) {
  return (
    <section className="home_block home_weekly_rank" aria-label="이번 주 주합 랭킹">
      <div className="ranking_header">
        <div className="home_weekly_rank_header_copy">
          <h3>{title}</h3>
          <p className="home_weekly_rank_subcopy">{subtitle}</p>
        </div>
        <Link to={linkTo} className="more_button">
          더보기 &gt;
        </Link>
      </div>

      <div className="home_weekly_rank_stage" aria-hidden="true">
        <div className="home_weekly_rank_cards">
          {homeWeeklyRankingCards.map((card) => (
            <WeeklyRankingCard
              key={card.id}
              badgeSrc={card.badgeSrc}
              drinkSrc={card.drinkSrc}
              foodSrc={card.foodSrc}
              title={card.title}
              subtitle={card.subtitle}
              scoreLabel={card.scoreLabel}
              isCenter={card.isCenter}
            />
          ))}
        </div>
        <div className="home_weekly_rank_dots" aria-hidden="true">
          <span className="home_weekly_rank_dot" />
          <span className="home_weekly_rank_dot is_active" />
          <span className="home_weekly_rank_dot" />
        </div>

        <div className="home_weekly_rank_bubble" aria-hidden="true">
          <img className="home_weekly_rank_mascot" src={homeAssets.weeklyBestMascot} alt="" />
          <div className="home_weekly_rank_bubble_text">이번 주 1위는 진로 이즈백 삼겹살!</div>
        </div>
      </div>
    </section>
  )
}

