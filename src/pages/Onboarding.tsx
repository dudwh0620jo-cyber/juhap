import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot.png"
import { onboardingInfoSlides, onboardingStartSlide } from "../data/setupContent"
import "../styles/onboarding.css"

export default function Onboarding() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const pointerStartX = useRef<number | null>(null)
  const isStart = activeIndex === 0

  function skipOnboarding() {
    navigate("/login", { replace: true })
  }

  function goNextSlide() {
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
        {!isStart && (
          <button className="onboarding_skip_button" type="button" onClick={skipOnboarding}>
            건너뛰기
          </button>
        )}

        <div className="onboarding_viewport">
          <div className="onboarding_track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            <div className="onboarding_slide is_start">
              <div className="onboarding_copy">
                <h1 className="onboarding_logo">{onboardingStartSlide.title}</h1>
                <p className="onboarding_hanja">{onboardingStartSlide.hanja}</p>
                <p className="onboarding_start_subtitle">{onboardingStartSlide.subtitle}</p>
              </div>

              <img
                className="onboarding_mascot"
                src={mascotImage}
                alt=""
                onDoubleClick={() => navigate("/home", { replace: true })}
              />

              <button className="onboarding_primary_button" type="button" onClick={goNextSlide}>
                완벽한 페어링을 위한 탐색 시작하기
              </button>
            </div>

            {onboardingInfoSlides.map((slide) => (
              <div className="onboarding_slide" key={slide.title}>
                <div className="onboarding_copy">
                  <h1 className="onboarding_title">{slide.title}</h1>
                  <p className="onboarding_description">{slide.description}</p>
                </div>

                <img className="onboarding_mascot" src={mascotImage} alt="" />
              </div>
            ))}
          </div>
        </div>

        {!isStart && (
          <div className="onboarding_footer">
            <div className="onboarding_dots" aria-label="온보딩 페이지">
              {onboardingInfoSlides.map((_, index) => (
                <button
                  key={index}
                  className={activeIndex === index + 1 ? "onboarding_dot is_active" : "onboarding_dot"}
                  type="button"
                  aria-label={`${index + 2}번째 온보딩 보기`}
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
              <button className="onboarding_start_button" type="button" onClick={skipOnboarding}>
                시작하기
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
