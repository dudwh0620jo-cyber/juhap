import setupContent from "./setupContent.json"

export type OnboardingInfoSlide = {
  title: string
  description: string
}

export type PreferenceGroup = {
  key: string
  title: string
  type: "single" | "multi"
  maxSelections?: number
  options: string[]
}

type SetupContentShape = {
  onboardingStartSlide: {
    title: string
    hanja: string
    subtitle: string
  }
  onboardingInfoSlides: OnboardingInfoSlide[]
  profileSetupCopy: {
    title: string
    subtitle: string
  }
  maxMultiSelections: number
  noneOption: string
  preferenceGroups: PreferenceGroup[]
}

const content = setupContent as SetupContentShape

export const onboardingStartSlide = content.onboardingStartSlide
export const onboardingInfoSlides = content.onboardingInfoSlides
export const profileSetupCopy = content.profileSetupCopy
export const MAX_MULTI_SELECTIONS = content.maxMultiSelections
export const NONE_OPTION = content.noneOption
export const preferenceGroups = content.preferenceGroups
