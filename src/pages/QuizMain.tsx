import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"

import caretLeft from "../assets/svg/caretleft.svg"
import houseLine from "../assets/svg/house.svg"
import caretRight from "../assets/svg/caretright.svg"
import quizHostMascot from "../assets/onboarding-mascot_06.png"
import { quizPreviousItems, quizToday } from "../data/quizContent"
import { clearTodayQuizProgress, readTodayQuizProgress } from "../utils/quizProgress"
import "../styles/quiz.css"

export default function QuizMain() {
  const navigate = useNavigate()
  const [todayProgress, setTodayProgress] = useState(() => readTodayQuizProgress())
  const mascotTapCountRef = useRef(0)
  const mascotTapResetTimerRef = useRef<number | null>(null)
  const todayStatus = todayProgress ? "참여완료" : "미참여"

  const previous = useMemo(() => quizPreviousItems, [])

  function handleMascotTap(event: React.MouseEvent<HTMLImageElement>) {
    event.stopPropagation()
    mascotTapCountRef.current += 1

    if (mascotTapResetTimerRef.current) {
      window.clearTimeout(mascotTapResetTimerRef.current)
    }
    mascotTapResetTimerRef.current = window.setTimeout(() => {
      mascotTapCountRef.current = 0
      mascotTapResetTimerRef.current = null
    }, 1800)

    if (mascotTapCountRef.current >= 4) {
      clearTodayQuizProgress()
      setTodayProgress(null)
      mascotTapCountRef.current = 0
      if (mascotTapResetTimerRef.current) {
        window.clearTimeout(mascotTapResetTimerRef.current)
        mascotTapResetTimerRef.current = null
      }
    }
  }

  return (
    <section className="quiz_page page_screen" aria-label="주합 퀴즈">
      <div className="quiz_main_bg_orb ui_orb_motion" aria-hidden="true" />
      <header className="quiz_topbar">
        <button type="button" className="quiz_icon_button" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src={caretLeft} alt="" aria-hidden="true" />
        </button>
        <div className="quiz_topbar_spacer" aria-hidden="true" />
        <button type="button" className="quiz_icon_button" onClick={() => navigate("/home")} aria-label="홈으로">
          <img src={houseLine} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="quiz_main_content">
        <div className="quiz_header_block">
          <h1 className="quiz_title">주합 퀴즈</h1>
          <button
            type="button"
            className="quiz_point_history"
            onClick={() => navigate("/my?view=exchange&tab=history")}
            aria-label="포인트 내역"
          >
            <span>포인트 내역</span>
            <img src={caretRight} alt="" aria-hidden="true" />
          </button>
        </div>

        <section className="quiz_section" aria-label="진행중인 퀴즈">
          <h2 className="quiz_section_title">진행중인 퀴즈</h2>
          <p className="quiz_section_subtitle">정답 맞히고 +{quizToday.rewardPoints ?? 0}P 받기</p>

          <button
            type="button"
            className={todayProgress ? "quiz_today_card is_disabled" : "quiz_today_card"}
            onClick={() => {
              if (todayProgress) return
              navigate("/quiz/today")
            }}
            aria-disabled={Boolean(todayProgress)}
            aria-label="오늘의 주합 퀴즈"
          >
            <div className="quiz_today_card_mascot_area">
              <img className="quiz_today_card_mascot" src={quizHostMascot} alt="" aria-hidden="true" onClick={handleMascotTap} />
            </div>
            <div className="quiz_today_card_text">
              <span className={todayProgress ? "quiz_today_badge is_done" : "quiz_today_badge"}>{todayStatus}</span>
              <strong>오늘의 주합 퀴즈</strong>
            </div>
            <img className="quiz_today_card_arrow" src={caretRight} alt="" aria-hidden="true" />
          </button>
          {todayProgress ? <span className="quiz_today_card_reset_hint">캐릭터 4번 클릭하면 리셋</span> : null}
        </section>

        <section className="quiz_section" aria-label="종료된 퀴즈">
          <h2 className="quiz_section_title">종료된 퀴즈</h2>
          <p className="quiz_section_subtitle">
            포인트는 받을 수 없지만
            <br />
            풀면서 정답을 확인하고 주류 지식을 늘려보세요
          </p>

          <div className="quiz_prev_list" role="list">
            {previous.map((item) => (
              <button
                key={item.id}
                type="button"
                className="quiz_prev_row"
                onClick={() => navigate(`/quiz/previous/${item.id}`)}
                aria-label={item.question}
                role="listitem"
              >
                <span>{item.question}</span>
                <img src={caretRight} alt="" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
