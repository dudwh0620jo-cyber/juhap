import { useEffect, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { motion } from "motion/react"

import QuizDetailLayout from "../components/QuizDetailLayout"
import quizHostMascot from "../assets/quiz_host_mascot_01.png"
import quizWrongAnswerMascot from "../assets/quiz_wrong_answer_01.png"
import { quizToday } from "../data/quizContent"
import { readTodayQuizProgress, writeTodayQuizProgress } from "../utils/quizProgress"
import "../styles/quiz.css"

type ResultKind = "success" | "fail"
const confettiSeed = Array.from({ length: 24 }, (_, i) => i)

export default function QuizResult() {
  const navigate = useNavigate()
  const { kind } = useParams()
  const location = useLocation()
  const resultKind = (kind === "success" || kind === "fail" ? kind : "fail") satisfies ResultKind

  const selectedChoiceId = (location.state as { selectedChoiceId?: string } | null)?.selectedChoiceId ?? null
  const isCorrect = resultKind === "success"
  const earnedPoints = isCorrect ? quizToday.rewardPoints ?? 0 : 0
  const relatedCategoryLink = useMemo(() => {
    const params = new URLSearchParams()
    params.set("group", quizToday.relatedCategoryGroup ?? "사케")
    params.set("sub", "전체")
    return `/category/list?${params.toString()}`
  }, [])
  const categoryNavState = useMemo(
    () => ({
      fromQuiz: true,
      quizReturnPath: "/quiz",
    }),
    [],
  )

  const explanationTitle = useMemo(() => quizToday.explanationTitle, [])
  const explanationBody = useMemo(
    () => (isCorrect ? quizToday.explanationBodySuccess ?? quizToday.explanationBody : quizToday.explanationBodyFail ?? quizToday.explanationBody),
    [isCorrect],
  )
  const explanationParagraphs = useMemo(
    () =>
      explanationBody
        .split("\n\n")
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0),
    [explanationBody],
  )

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
    <QuizDetailLayout
      pageClassName={isCorrect ? "quiz_result_page is_success page_screen" : "quiz_result_page is_fail page_screen"}
      pageAriaLabel="퀴즈 결과"
      bgClassName={isCorrect ? "quiz_result_bg_orb is_success ui_orb_motion" : "quiz_result_bg_orb is_fail ui_orb_motion"}
      innerClassName="quiz_result_inner"
      onBack={() => navigate("/quiz")}
      onHome={() => navigate("/home")}
      topContent={
        <>
          <div className="quiz_result_header">
            <h1>{isCorrect ? "정답이에요!" : "오답이에요"}</h1>
            <p className={isCorrect ? "is_point" : undefined}>
              {isCorrect ? (
                <>
                  <span className="quiz_result_point_value">{earnedPoints}포인트</span>를 획득했어요
                </>
              ) : (
                "포인트를 획득하지 못했어요..."
              )}
            </p>
          </div>
          <div className="quiz_result_mascot" aria-hidden="true">
            {isCorrect ? (
              <div className="quiz_result_confetti" aria-hidden="true">
                {confettiSeed.map((idx) => {
                  const angleDeg = -180 + idx * (360 / (confettiSeed.length - 1))
                  const angle = (angleDeg * Math.PI) / 180
                  const distance = 130 + (idx % 6) * 16 + (idx % 2) * 10
                  const driftX = Math.cos(angle) * distance
                  const liftY = Math.sin(angle) * distance
                  const peakX = driftX * 0.9
                  const peakY = liftY * 0.96
                  const holdX = peakX + (idx % 2 === 0 ? 3 : -3)
                  const holdY = peakY + 4
                  const sway = (idx % 2 === 0 ? 1 : -1) * (10 + (idx % 4) * 3)
                  const fallX = holdX + sway
                  const fallY = holdY + 74 + (idx % 4) * 10
                  const delay = (idx % 3) * 0.006
                  const rotate = (idx % 2 === 0 ? 1 : -1) * (18 + (idx % 6) * 12)
                  const isRound = idx % 5 === 0
                  return (
                    <motion.span
                      key={idx}
                      className={`quiz_result_confetti_piece is_${idx % 4}${isRound ? " is_round" : ""}`}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.35, rotate: 0 }}
                      animate={{
                        opacity: [0, 1, 0.92, 0.25, 0],
                        x: [0, peakX, holdX, fallX, fallX],
                        y: [0, peakY, holdY, fallY, fallY + 64],
                        scale: [0.26, 1.04, 0.98, 0.93, 0.88],
                        rotate: [0, rotate * 0.52, rotate * 0.68, rotate * 1.02, rotate * 1.28],
                      }}
                      transition={{ duration: 1.72, ease: [0.18, 0.86, 0.3, 1], times: [0, 0.18, 0.5, 0.72, 1], delay }}
                    />
                  )
                })}
              </div>
            ) : null}
            <img src={isCorrect ? quizHostMascot : quizWrongAnswerMascot} alt="" />
          </div>
        </>
      }
      bodyContent={
        <div className="quiz_result_panel" aria-label="정답 해설">
          <div className="quiz_result_answer_title">{explanationTitle}</div>
          <div className="quiz_result_answer_body">
            {explanationParagraphs.map((paragraph, idx) => (
              <p key={`${idx}-${paragraph}`}>{paragraph}</p>
            ))}
          </div>
          {selectedChoiceId ? <span className="quiz_result_selected" aria-hidden="true" data-choice={selectedChoiceId} /> : null}
        </div>
      }
      onPrimaryAction={() => navigate(relatedCategoryLink, { state: categoryNavState })}
      primaryActionDisabled
      onSecondaryAction={() => navigate(relatedCategoryLink, { state: categoryNavState })}
    />
  )
}
