import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"

import caretLeft from "../assets/svg/caretleft.svg"
import caretdown from "../assets/svg/caretdown.svg"
import houseLine from "../assets/svg/house.svg"
import tipsIcon from "../assets/svg/tips_p.svg"
import quizHostMascot from "../assets/onboarding-mascot_06.png"
import { quizToday } from "../data/quizContent"
import { readTodayQuizProgress } from "../utils/quizProgress"
import "../styles/quiz.css"

export default function QuizToday() {
  const navigate = useNavigate()
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [isHintOpen, setIsHintOpen] = useState(false)

  const choices = useMemo(() => quizToday.choices, [])
  const shortHint = "힌트: 발효주가 아니라 증류주를 떠올려보세요."

  useEffect(() => {
    if (readTodayQuizProgress()) navigate("/quiz", { replace: true })
  }, [navigate])

  function handleConfirm() {
    if (!selectedChoiceId) return
    const isCorrect = selectedChoiceId === quizToday.correctChoiceId
    navigate(isCorrect ? "/quiz/result/success" : "/quiz/result/fail", {
      state: { selectedChoiceId },
      replace: true,
    })
  }

  return (
    <section className="quiz_today_page page_screen" aria-label="오늘의 퀴즈">
      <div className="quiz_today_bg_orb ui_orb_motion" aria-hidden="true" />
      <div className="quiz_today_inner">
        <header className="quiz_topbar">
          <button type="button" className="quiz_icon_button" onClick={() => navigate(-1)} aria-label="뒤로가기">
            <img src={caretLeft} alt="" aria-hidden="true" />
          </button>
          <div className="quiz_topbar_spacer" aria-hidden="true" />
          <button type="button" className="quiz_icon_button" onClick={() => navigate("/home")} aria-label="홈으로">
            <img src={houseLine} alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="quiz_today_mascot_wrap" aria-hidden="true">
          <img src={quizHostMascot} alt="" />
        </div>

        <div className="quiz_today_panel" aria-label="퀴즈 문제">
          <div className="quiz_today_question">
            <span className="quiz_today_q_label">Q.</span>
            <span>{quizToday.question}</span>
          </div>

          <div className="quiz_today_choices" role="list">
            {choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={isSelected ? "quiz_choice is_selected" : "quiz_choice"}
                  onClick={() => setSelectedChoiceId(choice.id)}
                  role="listitem"
                  aria-pressed={isSelected}
                >
                  <span className={isSelected ? "quiz_choice_box is_checked" : "quiz_choice_box"} aria-hidden="true" />
                  <span className="quiz_choice_label">{choice.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className={isHintOpen ? "quiz_hint_button is_open" : "quiz_hint_button"}
            onClick={() => setIsHintOpen((prev) => !prev)}
          >
            <span className="quiz_hint_left">
              <img src={tipsIcon} alt="" aria-hidden="true" />
              여기를 눌러 힌트를 확인해보세요
            </span>
            <span className="quiz_hint_right" aria-hidden="true">
              <img src={caretdown} alt="" />
            </span>
          </button>

          <div className={isHintOpen ? "quiz_hint_panel is_open" : "quiz_hint_panel"} aria-hidden={!isHintOpen}>
            <p>{shortHint}</p>
          </div>
        </div>

        <button type="button" className="quiz_confirm_button" onClick={handleConfirm} disabled={!selectedChoiceId}>
          정답 확인하기
        </button>
      </div>
    </section>
  )
}
