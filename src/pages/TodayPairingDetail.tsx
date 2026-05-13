import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import TodayHeroCopy from "../components/TodayHeroCopy"
import { todayPairingDetailContent } from "../data/todayPairingDetail"
import { useHomePageData } from "../hooks/useHomePageData"
import caretLeft from "../assets/svg/caretleft.svg"
import caretRight from "../assets/svg/caretright.svg"
import featherIcon from "../assets/svg/feather.svg"
import dropHalfIcon from "../assets/svg/drophalf.svg"
import scalesIcon from "../assets/svg/scales.svg"
import controllerIcon from "../assets/svg/gamecontroller.svg"
import moonStarsIcon from "../assets/svg/moonstars.svg"
import wavesIcon from "../assets/svg/waves.svg"
import cheersIcon from "../assets/svg/cheers.svg"
import forkKnifeIcon from "../assets/svg/forkknife.svg"
import treeEvergreenIcon from "../assets/svg/treeevergreen.svg"
import confettiIcon from "../assets/svg/confetti.svg"
import calendarHeartIcon from "../assets/svg/calendarheart.svg"
import fishIcon from "../assets/svg/fish.svg"
import martiniIcon from "../assets/svg/martini.svg"
import houseLineIcon from "../assets/svg/houseline.svg"
import umbrellaIcon from "../assets/svg/umbrella.svg"
import "../styles/today-pairing-detail.css"

function resolvePairingPointIconSrc(label: string) {
  if (label === "담백함") return featherIcon
  if (label === "온도의 대비") return dropHalfIcon
  if (label === "맛의균형") return scalesIcon
  if (label === "캐주얼") return controllerIcon
  if (label === "깔끔함") return moonStarsIcon
  // "맛의조화"는 "향의조화"와 동일 아이콘 적용
  if (label === "향의조화" || label === "맛의조화") return wavesIcon
  return undefined
}

function resolveMomentIconSrc(tag: string) {
  if (tag === "#특별한 날") return cheersIcon
  if (tag === "#브런치") return forkKnifeIcon
  if (tag === "#피크닉") return treeEvergreenIcon
  if (tag === "#홈파티") return confettiIcon
  if (tag === "#데이트") return calendarHeartIcon
  if (tag === "#일식") return fishIcon
  if (tag === "#식전/중주") return martiniIcon
  if (tag === "#집에서") return houseLineIcon
  if (tag === "#비오는 날") return umbrellaIcon
  return undefined
}

export default function TodayPairingDetail() {
  const navigate = useNavigate()
  const { pairingId } = useParams()
  const numericId = typeof pairingId === "string" ? Number(pairingId) : NaN
  const { recommendationItems } = useHomePageData()

  const index = useMemo(() => {
    const found = recommendationItems.findIndex((item) => item.id === numericId)
    return found >= 0 ? found : 0
  }, [numericId, recommendationItems])

  const hero = recommendationItems[index]
  const detail = todayPairingDetailContent[index % todayPairingDetailContent.length]

  if (!hero) return null

  const total = recommendationItems.length
  const prevHero = recommendationItems[(index - 1 + total) % total]
  const nextHero = recommendationItems[(index + 1) % total]

  return (
    <section className="page_screen today_pairing_detail_page" aria-label="오늘의 추천 페어링 상세">
      <header className="today_pairing_detail_header">
        <button type="button" className="today_pairing_back" onClick={() => navigate("/home")} aria-label="홈으로">
          <img src={caretLeft} alt="" aria-hidden="true" />
        </button>
      </header>
      <div className="today_pairing_banner_wrap" aria-label="배너 슬라이드">
        <button
          type="button"
          className="today_pairing_banner_nav is_left"
          onClick={() => navigate(`/today-pairing/${prevHero.id}`)}
          aria-label="이전 배너"
        >
          <img src={caretLeft} alt="" aria-hidden="true" />
        </button>

        <div className="today_pairing_banner">
          {hero.imageSrc ? (
            <img className="today_pairing_banner_img" src={hero.imageSrc} alt="" aria-hidden="true" />
          ) : null}
          <div className="today_pairing_banner_overlay" aria-hidden="true" />
          <div className="today_pairing_banner_copy">
            <TodayHeroCopy
              label="오늘의 추천 페어링"
              title={hero.title}
              description={hero.description}
              showMorePill={false}
              disabled
            />
          </div>
        </div>

        <button
          type="button"
          className="today_pairing_banner_nav is_right"
          onClick={() => navigate(`/today-pairing/${nextHero.id}`)}
          aria-label="다음 배너"
        >
          <img src={caretRight} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className="today_pairing_section">
        <div className="today_pairing_section_label">
          <span>Pairing Story</span>
        </div>
        <div className="today_pairing_story_title">{detail.storyTitle}</div>
        <div className="today_pairing_story_body">{detail.storyBody}</div>
      </div>

      <div className="today_pairing_section">
        <div className="today_pairing_section_label today_pairing_section_label_blue">
          <span>Pairing Point</span>
        </div>
        <div className="today_pairing_points" role="list" aria-label="페어링 포인트">
          {detail.points.map((point) => (
            <div key={point.label} className="today_pairing_point" role="listitem">
              {resolvePairingPointIconSrc(point.label) ? (
                <img className="today_pairing_point_icon" src={resolvePairingPointIconSrc(point.label)} alt="" aria-hidden="true" />
                ) : (
                  <span className="today_pairing_point_icon_fallback" aria-hidden="true" />
                )}
                <div className="today_pairing_point_label">{point.label}</div>
              </div>
            ))}
          </div>
      </div>

      <div className="today_pairing_section">
        <div className="today_pairing_section_label">
          <span>Recommend Moment</span>
        </div>
          <div className="today_pairing_moments" role="list" aria-label="추천 모먼트">
            {detail.moments.map((moment) => (
              <div key={moment.tag} className="today_pairing_moment" role="listitem">
                {resolveMomentIconSrc(moment.tag) ? (
                  <img className="today_pairing_moment_icon" src={resolveMomentIconSrc(moment.tag)} alt="" aria-hidden="true" />
                ) : (
                  <span className="today_pairing_moment_icon_fallback" aria-hidden="true" />
                )}
                <div className="today_pairing_moment_tag">{moment.tag}</div>
              </div>
            ))}
          </div>
        </div>
    </section>
  )
}
