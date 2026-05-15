import { useEffect, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router"

import caretLeft from "../assets/svg/caretleft.svg"
import houseLine from "../assets/svg/houseline.svg"
import quizHostMascot from "../assets/quiz_host_mascot_01.png"
import quizWrongAnswerMascot from "../assets/quiz_wrong_answer_01.png"
import { quizToday } from "../data/quizContent"
import { readTodayQuizProgress, writeTodayQuizProgress } from "../utils/quizProgress"
import "../styles/quiz.css"

type ResultKind = "success" | "fail"

export default function QuizResult() {
  const navigate = useNavigate()
  const { kind } = useParams()
  const location = useLocation()
  const resultKind = (kind === "success" || kind === "fail" ? kind : "fail") satisfies ResultKind

  const selectedChoiceId = (location.state as { selectedChoiceId?: string } | null)?.selectedChoiceId ?? null
  const isCorrect = resultKind === "success"
  const earnedPoints = isCorrect ? quizToday.rewardPoints ?? 0 : 0

  const explanationTitle = useMemo(() => quizToday.explanationTitle, [])
  const explanationBody = useMemo(() => quizToday.explanationBody, [])

  useEffect(() => {
    const existing = readTodayQuizProgress()
    if (existing) return

    writeTodayQuizProgress({
      quizId: quizToday.id,
      answeredAtIso: new Date().toISOString(),
      isCorrect,
      earnedPoints,
    })
  }, [earnedPoints, isCorrect])

  return (
    <section className={isCorrect ? "quiz_result_page is_success page_screen" : "quiz_result_page is_fail page_screen"} aria-label="퀴즈 결과">
      <header className="quiz_topbar">
        <button type="button" className="quiz_icon_button" onClick={() => navigate("/quiz")} aria-label="뒤로가기">
          <img src={caretLeft} alt="" aria-hidden="true" />
        </button>
        <div className="quiz_topbar_spacer" aria-hidden="true" />
        <button type="button" className="quiz_icon_button" onClick={() => navigate("/home")} aria-label="홈으로">
          <img src={houseLine} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="quiz_result_header">
        <h1>{isCorrect ? "정답이에요!" : "오답이에요."}</h1>
        <p>{isCorrect ? `${earnedPoints}포인트를 획득했어요.` : "포인트를 획득하지 못했어요."}</p>
      </div>

      <div className="quiz_result_mascot" aria-hidden="true">
        <img src={isCorrect ? quizHostMascot : quizWrongAnswerMascot} alt="" />
      </div>

      <div className="quiz_result_panel" aria-label="정답/해설">
        <div className="quiz_result_answer_title">{explanationTitle}</div>
        <div className="quiz_result_answer_body">
          {explanationBody.split("\n").map((line, idx) => (
            <p key={`${idx}-${line}`}>{line}</p>
          ))}
        </div>
        {selectedChoiceId ? <span className="quiz_result_selected" aria-hidden="true" data-choice={selectedChoiceId} /> : null}
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

