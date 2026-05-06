import { useState } from "react"
import { useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot.png"
import "../styles/taste-setup.css"

type PreferenceGroup = {
  key: string
  title: string
  type: "single" | "multi"
  options: string[]
}

const MAX_MULTI_SELECTIONS = 3
const NONE_OPTION = "상관없음"

const preferenceGroups: PreferenceGroup[] = [
  {
    key: "situation",
    title: "어떤 상황에 페어링이 필요하신가요?",
    type: "single",
    options: [
      "가볍게 마시고 싶어요",
      "음식과 잘 맞는 술을 원해요",
      "분위기 있는 술을 원해요",
      "실패 없는 무난한 술이 좋아요",
      "새로운 술을 도전해보고 싶어요",
      "선물/모임용 술이 필요해요",
    ],
  },
  {
    key: "drinkType",
    title: "어떤 주종을 가장 선호하시나요?",
    type: "multi",
    options: ["맥주", "소주", "와인", "하이볼", "전통주", "위스키", "사케", "기타", NONE_OPTION],
  },
  {
    key: "trait",
    title: "좋아하는 술의 특징은 어떤 건가요?",
    type: "multi",
    options: ["달콤한", "깔끔한", "상큼한", "묵직한", "탄산감 있는", "드라이한", "기타", NONE_OPTION],
  },
  {
    key: "avoid",
    title: "피하고 싶은 술이 있다면 알려주세요",
    type: "single",
    options: ["고도수는 싫어요", "너무 단 건 싫어요", "향이 강한 건 싫어요", "너무 비싼 건 싫어요"],
  },
  {
    key: "purchase",
    title: "보통 어디서 술을 구매하시나요?",
    type: "single",
    options: ["편의점", "대형마트", "와인샵/바틀샵", "술집/이자카야", "온라인/구독"],
  },
]

const initialSelections: Record<string, string[]> = {}

export default function TasteSetup() {
  const navigate = useNavigate()
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(initialSelections)
  const [warningByGroup, setWarningByGroup] = useState<Record<string, string>>({})

  function handleSubmit() {
    const nextWarnings: Record<string, string> = {}
    preferenceGroups.forEach((group) => {
      if ((selectedByGroup[group.key] ?? []).length === 0) {
        nextWarnings[group.key] = "답변을 선택해 주세요."
      }
    })

    if (Object.keys(nextWarnings).length > 0) {
      setWarningByGroup((current) => ({ ...current, ...nextWarnings }))
      return
    }

    navigate("/home", { replace: true })
  }

  function toggleOption(group: PreferenceGroup, option: string) {
    setWarningByGroup((current) => ({ ...current, [group.key]: "" }))

    setSelectedByGroup((current) => {
      if (group.type === "single") {
        return { ...current, [group.key]: [option] }
      }

      const selectedOptions = current[group.key] ?? []

      if (option === NONE_OPTION) {
        return { ...current, [group.key]: selectedOptions.includes(NONE_OPTION) ? [] : [NONE_OPTION] }
      }

      const selectedWithoutNone = selectedOptions.filter((selectedOption) => selectedOption !== NONE_OPTION)
      if (selectedWithoutNone.includes(option)) {
        return {
          ...current,
          [group.key]: selectedWithoutNone.filter((selectedOption) => selectedOption !== option),
        }
      }

      if (selectedWithoutNone.length >= MAX_MULTI_SELECTIONS) {
        setWarningByGroup((warning) => ({
          ...warning,
          [group.key]: "최대 3개까지 선택할 수 있어요.",
        }))
        return current
      }

      return { ...current, [group.key]: [...selectedWithoutNone, option] }
    })
  }

  return (
    <section className="taste_setup_page" aria-label="취향 선택">
      <header className="taste_setup_header">
        <div>
          <h1>당신에게 맞는 한 잔을 찾기 위해<br />몇 가지만 알려주세요</h1>
          <p>취향을 입력해주세요<br />쿠폰으로 교환 가능한 포인트를 지급해요</p>
        </div>
        <img src={mascotImage} alt="" />
      </header>

      <div className="taste_setup_groups">
        {preferenceGroups.map((group) => {
          const selectedOptions = selectedByGroup[group.key] ?? []

          return (
            <section className="taste_setup_group" data-selection-type={group.type} key={group.key}>
              <h2>{group.title} <em aria-label="필수">*</em></h2>
              <div className="taste_chip_grid">
                {group.options.map((option) => (
                  <button
                    className={selectedOptions.includes(option) ? "taste_chip is_selected" : "taste_chip"}
                    type="button"
                    key={option}
                    onClick={() => toggleOption(group, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {warningByGroup[group.key] && <p className="taste_setup_warning">{warningByGroup[group.key]}</p>}
            </section>
          )
        })}
      </div>

      <button className="taste_setup_submit" type="button" onClick={handleSubmit}>
        페어링 시작하기
      </button>
    </section>
  )
}
