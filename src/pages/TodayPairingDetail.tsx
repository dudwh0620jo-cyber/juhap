import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { motion } from "motion/react"
import TodayHeroCopy from "../components/TodayHeroCopy"
import { todayPairingDetailByTitle, todayPairingDetailContent } from "../data/todayPairingDetail"
import { useHomePageData } from "../hooks/useHomePageData"
import caretLeft from "../assets/svg/caretleft.svg"
import caretRightWhite from "../assets/svg/caretright_w.svg"
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
  const bannerRef = useRef<HTMLDivElement | null>(null)
  const [bannerWidth, setBannerWidth] = useState(0)

  const index = useMemo(() => {
    const found = recommendationItems.findIndex((item) => item.id === numericId)
    return found >= 0 ? found : 0
  }, [numericId, recommendationItems])

  useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    const update = () => setBannerWidth(el.getBoundingClientRect().width)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const total = recommendationItems.length

  const [positionIndex, setPositionIndex] = useState(() => (total > 1 ? index + 1 : 0))
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true)
  const [pendingJumpTo, setPendingJumpTo] = useState<number | null>(null)

  useEffect(() => {
    if (total <= 1) {
      setPositionIndex(0)
      return
    }

    // Route sync: jump without animating (prevents "last -> first" long slide).
    setIsTransitionEnabled(false)
    setPositionIndex(index + 1)
    const raf = window.requestAnimationFrame(() => setIsTransitionEnabled(true))
    return () => window.cancelAnimationFrame(raf)
  }, [index, total])

  const safeIndex = total > 0 ? (total <= 1 ? 0 : (positionIndex - 1 + total) % total) : 0
  const hero = recommendationItems[safeIndex]
  const detail = (hero ? todayPairingDetailByTitle[hero.title] : undefined) ?? todayPairingDetailContent[0]

  if (!hero) return null

  const dots = useMemo(() => Array.from({ length: total }, (_, i) => i), [total])
  const extendedItems = useMemo(() => {
    if (total <= 1) return recommendationItems
    const head = recommendationItems[0]
    const tail = recommendationItems[total - 1]
    return [tail, ...recommendationItems, head]
  }, [recommendationItems, total])

  function goToByPosition(nextPosition: number) {
    if (total <= 1) return

    // 0 is tail-clone, total + 1 is head-clone (because of [tail, ...items, head])
    if (nextPosition <= 0) {
      setPendingJumpTo(total)
      setPositionIndex(0)
      navigate(`/today-pairing/${recommendationItems[total - 1]?.id ?? hero.id}`)
      return
    }

    if (nextPosition >= total + 1) {
      setPendingJumpTo(1)
      setPositionIndex(total + 1)
      navigate(`/today-pairing/${recommendationItems[0]?.id ?? hero.id}`)
      return
    }

    setPositionIndex(nextPosition)
    const next = recommendationItems[nextPosition - 1]
    if (next) navigate(`/today-pairing/${next.id}`)
  }

  return (
    <section className="page_screen today_pairing_detail_page" aria-label="오늘의 추천 페어링 상세">
      <header className="today_pairing_detail_header">
        <button type="button" className="today_pairing_back" onClick={() => navigate("/home")} aria-label="홈으로">
          <img src={caretLeft} alt="" aria-hidden="true" />
        </button>
      </header>
      <div className="today_pairing_banner_section" aria-label="배너 슬라이드">
        <div className="today_pairing_banner_viewport" ref={bannerRef}>
          <motion.div
            className="today_pairing_banner_track"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              const swipePower = info.offset.x + info.velocity.x * 14
              if (total <= 1) return
              if (swipePower < -90) goToByPosition(positionIndex + 1)
              else if (swipePower > 90) goToByPosition(positionIndex - 1)
            }}
            animate={{ x: -(total <= 1 ? 0 : positionIndex) * bannerWidth }}
            transition={
              isTransitionEnabled
                ? { type: "spring", stiffness: 380, damping: 38, mass: 0.9 }
                : { duration: 0 }
            }
            onAnimationComplete={() => {
              if (pendingJumpTo === null) return
              setIsTransitionEnabled(false)
              setPositionIndex(pendingJumpTo)
              setPendingJumpTo(null)
              window.requestAnimationFrame(() => setIsTransitionEnabled(true))
            }}
          >
            {extendedItems.map((item, slideIndex) => (
              <div key={`${slideIndex}-${item.id}`} className="today_pairing_banner_slide">
                <div className="today_pairing_banner">
                  {item.imageSrc ? (
                    <img className="today_pairing_banner_img" src={item.imageSrc} alt="" aria-hidden="true" />
                  ) : null}
                  <div className="today_pairing_banner_overlay" aria-hidden="true" />
                  <div className="today_pairing_banner_copy">
                    <TodayHeroCopy
                      label="오늘의 추천 페어링"
                      title={item.title}
                      description={item.description}
                      showMorePill={false}
                      disabled
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {dots.length > 1 ? (
            <div className="today_pairing_banner_dots" aria-label="배너 페이지 표시">
              <button
                type="button"
                className="today_pairing_banner_nav is_prev"
                aria-label="이전 배너"
                onClick={() => goToByPosition(positionIndex - 1)}
              >
                <img src={caretRightWhite} alt="" aria-hidden="true" />
              </button>
              {dots.map((dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  className={`today_pairing_banner_dot${dotIndex === safeIndex ? " is_active" : ""}`}
                  aria-label={`${dotIndex + 1}번째 배너`}
                  onClick={() => {
                    if (total <= 1) return
                    goToByPosition(dotIndex + 1)
                  }}
                />
              ))}
              <button
                type="button"
                className="today_pairing_banner_nav is_next"
                aria-label="다음 배너"
                onClick={() => goToByPosition(positionIndex + 1)}
              >
                <img src={caretRightWhite} alt="" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="today_pairing_sections">
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

      </div>

      <div className="today_pairing_bottom_actions" aria-label="하단 버튼">
        <button
          type="button"
          className="today_pairing_bottom_button is_secondary"
          onClick={() => navigate("/product/sake-dassai-23")}
        >
          이 술 상세보기
        </button>
        <button type="button" className="today_pairing_bottom_button is_primary" disabled>
          비슷한 조합 둘러보기
        </button>
      </div>
    </section>
  )
}
