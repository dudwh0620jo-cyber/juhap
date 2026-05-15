import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"

import caretLeft from "../assets/svg/caretleft.svg"
import houseLine from "../assets/svg/houseline.svg"
import quizHostMascot from "../assets/quiz_host_mascot_01.png"
import { quizItems } from "../data/quizContent"
import "../styles/quiz.css"

export default function QuizPrevious() {
  const navigate = useNavigate()
  const { quizId } = useParams()

  const quiz = useMemo(() => quizItems.find((item) => item.id === quizId) ?? quizItems[1], [quizId])

  return (
    <section className="quiz_previous_page page_screen" aria-label="지난 퀴즈">
      <header className="quiz_topbar">
        <button type="button" className="quiz_icon_button" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src={caretLeft} alt="" aria-hidden="true" />
        </button>
        <div className="quiz_topbar_spacer" aria-hidden="true" />
        <button type="button" className="quiz_icon_button" onClick={() => navigate("/home")} aria-label="홈으로">
          <img src={houseLine} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="quiz_previous_mascot" aria-hidden="true">
        <img src={quizHostMascot} alt="" />
      </div>

      <div className="quiz_previous_body">
        <div className="quiz_previous_notice">이미 종료된 퀴즈예요.</div>
        <div className="quiz_previous_question">
          <span className="quiz_today_q_label">Q.</span>
          <span>{quiz.question}</span>
        </div>

        <div className="quiz_previous_answer_card">
          <div className="quiz_previous_answer_title">{quiz.explanationTitle}</div>
          <div className="quiz_previous_answer_body">
            {quiz.explanationBody.split("\n").map((line, idx) => (
              <p key={`${idx}-${line}`}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz_result_actions" aria-label="추천 이동">
        <button type="button" className="quiz_result_action is_primary" onClick={() => navigate("/category")}>
          주아에게 해당 술 추천받기
        </button>
        <button type="button" className="quiz_result_action is_secondary" onClick={() => navigate("/category")}>
          해당 술 리스트 보러가기
        </button>
      </div>
    </section>
  )
}

