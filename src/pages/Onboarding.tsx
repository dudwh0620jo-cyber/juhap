import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot.png"
import "../styles/onboarding.css"

const startSlide = {
  title: "주합",
  hanja: "酒合",
  subtitle: "한 번의 선택으로,\n오늘을 완성해요",
}

const infoSlides = [
  {
    title: "고민 없이, 실패없이\n완벽한 페어링을 경험해보세요",
    description: "사용자님의 취향과 상황에 맞춰서\nai가 술과 음식 페어링 조합을 추천해요.",
  },
  {
    title: "다양한 사람들과\n경험을 나눠요",
    description: "커뮤니티에서 추천, 후기, 페어링 팁을\n나누고 더 넓은 주류 라이프를 즐겨보세요.",
  },
  {
    title: "내 취향을 알아야\n제대로 추천해드릴 수 있어요",
    description: "좋아하는 맛, 타입, 분위기 등을\n선택하면 더 정확한 추천이 가능해요.",
  },
] as const

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
      if (current >= infoSlides.length) {
        return current
      }

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
          <div
            className="onboarding_track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            <div className="onboarding_slide is_start">
              <div className="onboarding_copy">
                <h1 className="onboarding_logo">{startSlide.title}</h1>
                <p className="onboarding_hanja">{startSlide.hanja}</p>
                <p className="onboarding_start_subtitle">{startSlide.subtitle}</p>
              </div>

              <img className="onboarding_mascot" src={mascotImage} alt="" />

              <button className="onboarding_primary_button" type="button" onClick={goNextSlide}>
                완벽한 페어링을 위한 탐색 시작하기
              </button>
            </div>

              {infoSlides.map((slide) => (
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
              {infoSlides.map((_, index) => (
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

            {activeIndex === infoSlides.length && (
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
