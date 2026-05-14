import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import mascot01 from "../assets/onboarding-mascot_01.png"
import mascot02 from "../assets/onboarding-mascot_02.png"
import mascot03 from "../assets/onboarding-mascot_03.png"
import mascot04 from "../assets/onboarding-mascot_04.png"
import logoSvg from "../assets/svg/logo.svg"
import logoSubSvg from "../assets/svg/logo_sub.svg"
import { onboardingInfoSlides, onboardingStartSlide } from "../data/setupContent"
import "../styles/onboarding.css"

function renderAccentText(text: string, accent: string) {
  if (!accent) return text

  const lines = text.split("\n")
  return lines.map((line, index) => {
    const parts = line.split(accent)
    const content =
      parts.length > 1 ? (
        <>
          {parts[0]}
          <span className="onboarding_accent">{accent}</span>
          {parts.slice(1).join(accent)}
        </>
      ) : (
        line
      )

    return (
      <span key={`${index}-${line}`}>
        {content}
        {index < lines.length - 1 ? <br /> : null}
      </span>
    )
  })
}

export default function Onboarding() {
  const navigate = useNavigate()
  // Skip the start cover and begin from the first info slide.
  const [activeIndex, setActiveIndex] = useState(1)
  const [shouldSlideInFooter, setShouldSlideInFooter] = useState(false)
  const pointerStartX = useRef<number | null>(null)
  const isStart = activeIndex === 0

  const infoMascots = [mascot02, mascot03, mascot04]
  const infoAccents = ["페어링", "경험", "추천"]

  function skipOnboarding() {
    setActiveIndex(onboardingInfoSlides.length)
  }

  function finishOnboarding() {
    navigate("/login", { replace: true })
  }

  function goNextSlide() {
    if (activeIndex === 0) {
      setShouldSlideInFooter(true)
      window.setTimeout(() => setShouldSlideInFooter(false), 380)
    }

    setActiveIndex((current) => {
      if (current >= onboardingInfoSlides.length) return current
      return current + 1
    })
  }

  function goPreviousSlide() {
    setActiveIndex((current) => Math.max(current - 1, 0))
  }

  function handlePointerUp(clientX: number) {
    if (isStart || pointerStartX.current === null) return

    const distance = clientX - pointerStartX.current
    pointerStartX.current = null

    if (Math.abs(distance) < 44) return
    if (distance < 0) {
      goNextSlide()
      return
    }
    goPreviousSlide()
  }

  return (
    <section
      className="onboarding_page"
      aria-label="온보딩"
      onPointerDown={(event) => {
        if (!isStart) pointerStartX.current = event.clientX
      }}
      onPointerUp={(event) => handlePointerUp(event.clientX)}
      onPointerCancel={() => {
        pointerStartX.current = null
      }}
    >
      <div className="onboarding_slider">
        <div className="onboarding_viewport">
          <div className="onboarding_track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            <div className="onboarding_slide is_start">
              {activeIndex < onboardingInfoSlides.length && (
                <button className="onboarding_skip_button" type="button" onClick={skipOnboarding}>
                  건너뛰기
                </button>
              )}
              <div className="onboarding_copy">
                <div className="onboarding_logo_group" aria-label={`${onboardingStartSlide.title} ${onboardingStartSlide.hanja}`}>
                  <img className="onboarding_logo_svg" src={logoSvg} alt="" aria-hidden="true" />
                  <img className="onboarding_logo_sub_svg" src={logoSubSvg} alt="" aria-hidden="true" />
                </div>
                <p className="onboarding_start_subtitle">{renderAccentText(onboardingStartSlide.subtitle, "오늘을 완성해요")}</p>
              </div>

              <img className="onboarding_mascot" src={mascot01} alt="" />

              <button className="onboarding_primary_button" type="button" onClick={goNextSlide}>
                완벽한 페어링을 위한 탐색 시작하기
              </button>
            </div>

            {onboardingInfoSlides.map((slide, index) => (
              <div className="onboarding_slide" key={slide.title}>
                {activeIndex < onboardingInfoSlides.length && (
                  <button className="onboarding_skip_button" type="button" onClick={skipOnboarding}>
                    건너뛰기
                  </button>
                )}
                <div className="onboarding_copy">
                  <h1 className="onboarding_title">{renderAccentText(slide.title, infoAccents[index] ?? "")}</h1>
                  <p className="onboarding_description">{slide.description}</p>
                </div>

                <img className="onboarding_mascot" src={infoMascots[index] ?? mascot01} alt="" />
              </div>
            ))}
          </div>
        </div>

        {!isStart && (
          <div className={shouldSlideInFooter ? "onboarding_footer is_first_enter" : "onboarding_footer"}>
            <div className="onboarding_dots" aria-label="온보딩 페이지">
              {onboardingInfoSlides.map((_, index) => (
                <button
                  key={index}
                  className={activeIndex === index + 1 ? "onboarding_dot is_active" : "onboarding_dot"}
                  type="button"
                  aria-label={`${index + 1}번째 온보딩 보기`}
                  aria-current={activeIndex === index + 1 ? "step" : undefined}
                  onClick={() => setActiveIndex(index + 1)}
                />
              ))}
            </div>

            {activeIndex < onboardingInfoSlides.length ? (
              <button className="onboarding_start_button" type="button" onClick={goNextSlide}>
                다음으로
              </button>
            ) : (
              <button className="onboarding_start_button" type="button" onClick={finishOnboarding}>
                시작하기
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
