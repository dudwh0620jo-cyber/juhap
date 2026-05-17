import { useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router"

import QuizDetailLayout from "../components/QuizDetailLayout"
import quizHostMascot from "../assets/quiz_host_mascot_01.png"
import { quizItems } from "../data/quizContent"
import "../styles/quiz.css"

export default function QuizPrevious() {
  const navigate = useNavigate()
  const location = useLocation()
  const { quizId } = useParams()

  const quiz = useMemo(() => quizItems.find((item) => item.id === quizId) ?? quizItems[1], [quizId])
  const relatedCategoryLink = useMemo(() => {
    const params = new URLSearchParams()
    params.set("group", quiz.relatedCategoryGroup ?? "사케")
    params.set("sub", "전체")
    return `/category/list?${params.toString()}`
  }, [quiz])
  const categoryNavState = useMemo(
    () => ({
      fromQuiz: true,
      quizReturnPath: location.pathname,
    }),
    [location.pathname],
  )

  return (
    <QuizDetailLayout
      pageClassName="quiz_previous_page page_screen"
      pageAriaLabel="지난 퀴즈"
      bgClassName="quiz_previous_bg_orb ui_orb_motion"
      innerClassName="quiz_previous_inner"
      onBack={() => navigate("/quiz")}
      onHome={() => navigate("/home")}
      topContent={
        <div className="quiz_previous_mascot" aria-hidden="true">
          <img src={quizHostMascot} alt="" />
        </div>
      }
      bodyContent={
        <div className="quiz_previous_body">
          <div className="quiz_previous_intro">
            <div className="quiz_previous_notice">이미 종료된 퀴즈예요.</div>
            <div className="quiz_previous_question">
              <span className="quiz_today_q_label">Q.</span>
              <span>{quiz.question}</span>
            </div>
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
      }
      onPrimaryAction={() => navigate(relatedCategoryLink, { state: categoryNavState })}
      primaryActionDisabled
      onSecondaryAction={() => navigate(relatedCategoryLink, { state: categoryNavState })}
    />
  )
}
