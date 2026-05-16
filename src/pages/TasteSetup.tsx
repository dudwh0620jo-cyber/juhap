import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot_06.png"
import PreferenceGroupSection from "../components/PreferenceGroupSection"
import {
  MAX_MULTI_SELECTIONS,
  NONE_OPTION,
  preferenceGroups,
  type PreferenceGroup,
} from "../data/setupContent"
import { readUserProfile, updateUserTastePreferences, type UserTastePreferences } from "../data/userProfile"
import "../styles/taste-setup.css"

function normalizeTastePreferences(tastePreferences: UserTastePreferences) {
  return preferenceGroups.reduce<UserTastePreferences>((nextPreferences, group) => {
    const selectedOptions = tastePreferences[group.key] ?? []

    if (group.type === "single") {
      nextPreferences[group.key] = selectedOptions.slice(0, 1)
      return nextPreferences
    }

    if (selectedOptions.includes(NONE_OPTION)) {
      nextPreferences[group.key] = [NONE_OPTION]
      return nextPreferences
    }

    nextPreferences[group.key] = selectedOptions.slice(0, group.maxSelections ?? MAX_MULTI_SELECTIONS)
    return nextPreferences
  }, {})
}

export default function TasteSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = ((location.state as { redirectTo?: string } | null)?.redirectTo ?? "").trim()
  const nextPath = redirectTo && redirectTo !== "/" && redirectTo.startsWith("/") ? redirectTo : "/home"
  const savedProfile = readUserProfile()
  const [selectedByGroup, setSelectedByGroup] = useState<UserTastePreferences>(() =>
    normalizeTastePreferences(savedProfile.tastePreferences),
  )
  const [warningByGroup, setWarningByGroup] = useState<Record<string, string>>({})

  function handleSubmit() {
    const nextWarnings: Record<string, string> = {}
    preferenceGroups.forEach((group) => {
      if ((selectedByGroup[group.key] ?? []).length === 0) {
        nextWarnings[group.key] = "답변을 선택해 주세요"
      }
    })

    if (Object.keys(nextWarnings).length > 0) {
      setWarningByGroup((current) => ({ ...current, ...nextWarnings }))
      return
    }

    updateUserTastePreferences(selectedByGroup)
    navigate(nextPath, { replace: true })
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

      const maxSelections = group.maxSelections ?? MAX_MULTI_SELECTIONS
      if (selectedWithoutNone.length >= maxSelections) {
        return current
      }

      return { ...current, [group.key]: [...selectedWithoutNone, option] }
    })
  }

  return (
    <section className="taste_setup_page" aria-label="취향 선택">
      <header className="taste_setup_header">
        <div>
          <h1>
            <span className="taste_setup_title_line taste_setup_title_line--first">당신에게 맞는 한 잔을 찾기 위해</span>
            <span className="taste_setup_title_line taste_setup_title_line--second">
              몇 가지만 <span className="taste_setup_accent">알려주세요</span>
            </span>
          </h1>
          <p>
            <span className="taste_setup_subtitle_line">취향을 입력해주세요</span>
            <span className="taste_setup_subtitle_line">쿠폰으로 교환 가능한 포인트를 지급해요</span>
          </p>
        </div>
        <img src={mascotImage} alt="" />
      </header>

      <div className="taste_setup_groups">
        {preferenceGroups.map((group) => (
          <PreferenceGroupSection
            key={group.key}
            group={group}
            selectedOptions={selectedByGroup[group.key] ?? []}
            warning={warningByGroup[group.key]}
            onToggleOption={toggleOption}
          />
        ))}
      </div>

      <button className="taste_setup_submit" type="button" onClick={handleSubmit}>
        페어링 시작하기
      </button>
    </section>
  )
}
