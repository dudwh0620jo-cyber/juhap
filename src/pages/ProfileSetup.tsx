import { type FormEvent, useRef, useState } from "react"
import { useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot_05.png"
import mapPinIcon from "../assets/svg/mappin.svg"
import AlertModal from "../components/AlertModal"
import { profileSetupCopy } from "../data/setupContent"
import { NICKNAME_MAX_LENGTH, readUserProfile, sanitizeNickname, updateUserPersonalInfo } from "../data/userProfile"
import "../styles/profile-setup.css"

const DAUM_POSTCODE_SCRIPT_URL = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"

let daumPostcodeScriptPromise: Promise<void> | null = null

const TEXT = {
  pageLabel: "\uD504\uB85C\uD544 \uC815\uBCF4 \uC785\uB825",
  nicknameLabel: "\uB2C9\uB124\uC784",
  requiredLabel: "\uD544\uC218",
  nicknamePlaceholder: "\uB2C9\uB124\uC784\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694",
  nicknameWarning: "\uB2C9\uB124\uC784\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  phoneLabel: "\uD734\uB300\uD3F0 \uBC88\uD638",
  phonePlaceholder: "\uD734\uB300\uD3F0 \uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
  verifyButton: "\uC778\uC99D\uBC88\uD638",
  phoneWarning: "\uC804\uD654\uBC88\uD638\uB97C \uB05D\uAE4C\uC9C0 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  verifyWarning: "\uC804\uD654\uBC88\uD638 \uC778\uC99D\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.",
  addressLabel: "\uC8FC\uC18C",
  addressSearchLabel: "\uC8FC\uC18C \uAC80\uC0C9",
  addressPlaceholder: "\uAC74\uBB3C, \uC9C0\uBC88 \uB610\uB294 \uB3C4\uB85C\uBA85 \uAC80\uC0C9",
  detailAddressPlaceholder: "\uC0C1\uC138\uC8FC\uC18C",
  next: "\uB2E4\uC74C",
  verifyComplete: "\uC778\uC99D\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
  confirm: "\uD655\uC778",
  postcodeError: "\uC8FC\uC18C \uAC80\uC0C9\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
}

type DaumPostcodeData = {
  address: string
  jibunAddress: string
  roadAddress: string
}

type DaumPostcode = {
  open: () => void
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => DaumPostcode
    }
  }
}

function loadDaumPostcode() {
  if (window.daum?.Postcode) return Promise.resolve()
  if (daumPostcodeScriptPromise) return daumPostcodeScriptPromise

  daumPostcodeScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = DAUM_POSTCODE_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      daumPostcodeScriptPromise = null
      reject(new Error(TEXT.postcodeError))
    }
    document.head.appendChild(script)
  })

  return daumPostcodeScriptPromise
}

export default function ProfileSetup() {
  const navigate = useNavigate()
  const detailAddressInputRef = useRef<HTMLInputElement>(null)
  const savedProfile = readUserProfile()
  const [nickname, setNickname] = useState(savedProfile.personalInfo.nickname.slice(0, NICKNAME_MAX_LENGTH))
  const [phone, setPhone] = useState(savedProfile.personalInfo.phone)
  const [address, setAddress] = useState(savedProfile.personalInfo.address)
  const [detailAddress, setDetailAddress] = useState(savedProfile.personalInfo.detailAddress)
  const [isVerifyCompleteOpen, setIsVerifyCompleteOpen] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(savedProfile.personalInfo.isPhoneVerified)
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false)
  const [isPostcodeErrorOpen, setIsPostcodeErrorOpen] = useState(false)

  const phoneDigits = phone.replace(/\D/g, "")
  const nicknameLength = nickname.length
  const isNicknameAtLimit = nicknameLength === NICKNAME_MAX_LENGTH
  const isPhoneIncomplete = phoneDigits.length > 0 && phoneDigits.length < 11
  const showNicknameWarning = hasTriedSubmit && nickname.trim().length === 0
  const showPhoneWarning = isPhoneIncomplete || (hasTriedSubmit && phoneDigits.length !== 11)
  const showVerifyWarning = hasTriedSubmit && phoneDigits.length === 11 && !isPhoneVerified

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTriedSubmit(true)

    if (nickname.trim().length === 0 || phoneDigits.length !== 11 || !isPhoneVerified) return

    updateUserPersonalInfo({
      nickname: sanitizeNickname(nickname),
      phone,
      address,
      detailAddress,
      isPhoneVerified,
    })
    navigate("/taste-setup")
  }

  function handleVerifyPhone() {
    if (phoneDigits.length !== 11) {
      setHasTriedSubmit(true)
      return
    }

    setIsVerifyCompleteOpen(true)
  }

  function openAddressSearch() {
    if (isAddressSearchLoading) return

    setIsAddressSearchLoading(true)
    loadDaumPostcode()
      .then(() => {
        const Postcode = window.daum?.Postcode
        if (!Postcode) throw new Error(TEXT.postcodeError)

        new Postcode({
          oncomplete: (data) => {
            setAddress(data.roadAddress || data.jibunAddress || data.address)
            window.setTimeout(() => detailAddressInputRef.current?.focus(), 0)
          },
        }).open()
      })
      .catch(() => {
        setIsPostcodeErrorOpen(true)
      })
      .finally(() => {
        setIsAddressSearchLoading(false)
      })
  }

  return (
    <section className="profile_setup_page" aria-label={TEXT.pageLabel}>
      <header className="profile_setup_header">
        <div>
          <h1>{profileSetupCopy.title}</h1>
          <p>{profileSetupCopy.subtitle}</p>
        </div>
        <img src={mascotImage} alt="" />
      </header>

      <form className="profile_setup_form" onSubmit={handleSubmit} noValidate>
        <label className="profile_setup_field">
          <span>
            {TEXT.nicknameLabel}<em aria-label={TEXT.requiredLabel}>*</em>
          </span>
          <span className="profile_setup_input_wrap">
            <input
              type="text"
              placeholder={TEXT.nicknamePlaceholder}
              autoComplete="nickname"
              maxLength={NICKNAME_MAX_LENGTH}
              value={nickname}
              onChange={(event) => setNickname(event.target.value.slice(0, NICKNAME_MAX_LENGTH))}
            />
            <span
              className={isNicknameAtLimit ? "profile_setup_counter is_limit" : "profile_setup_counter"}
              aria-live="polite"
            >
              {`${nicknameLength}/${NICKNAME_MAX_LENGTH}`}
            </span>
          </span>
          {showNicknameWarning ? <p className="profile_setup_hint">{TEXT.nicknameWarning}</p> : null}
        </label>

        <label className="profile_setup_field">
          <span>
            {TEXT.phoneLabel}<em aria-label={TEXT.requiredLabel}>*</em>
          </span>
          <span className="profile_phone_input">
            <input
              type="tel"
              placeholder={TEXT.phonePlaceholder}
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value)
                setIsPhoneVerified(false)
              }}
            />
            <button type="button" onClick={handleVerifyPhone}>
              {TEXT.verifyButton}
            </button>
          </span>
          {showPhoneWarning ? <p className="profile_setup_hint">{TEXT.phoneWarning}</p> : null}
          {showVerifyWarning ? <p className="profile_setup_hint">{TEXT.verifyWarning}</p> : null}
        </label>

        <fieldset className="profile_setup_address">
          <legend>{TEXT.addressLabel}</legend>
          <span className="profile_address_search">
            <button type="button" aria-label={TEXT.addressSearchLabel} onClick={openAddressSearch}>
              <img src={mapPinIcon} alt="" aria-hidden="true" />
            </button>
            <input
              type="text"
              placeholder={TEXT.addressPlaceholder}
              value={address}
              readOnly
              onClick={openAddressSearch}
            />
          </span>
          <input
            ref={detailAddressInputRef}
            type="text"
            placeholder={TEXT.detailAddressPlaceholder}
            value={detailAddress}
            onChange={(event) => setDetailAddress(event.target.value)}
          />
        </fieldset>

        <button className="profile_setup_next" type="submit">
          {TEXT.next}
        </button>
      </form>

      {isVerifyCompleteOpen ? (
        <AlertModal
          title={TEXT.verifyComplete}
          confirmLabel={TEXT.confirm}
          confirmTone="primary"
          onConfirm={() => {
            setIsPhoneVerified(true)
            setIsVerifyCompleteOpen(false)
          }}
        />
      ) : null}

      {isPostcodeErrorOpen ? (
        <AlertModal
          message={TEXT.postcodeError}
          confirmLabel={TEXT.confirm}
          onConfirm={() => setIsPostcodeErrorOpen(false)}
        />
      ) : null}
    </section>
  )
}
