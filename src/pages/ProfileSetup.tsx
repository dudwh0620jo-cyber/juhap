import { type FormEvent, useRef, useState } from "react"
import { useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot.png"
import mapPinIcon from "../assets/svg/mappin.svg"
import { profileSetupCopy } from "../data/setupContent"
import { readUserProfile, updateUserPersonalInfo } from "../data/userProfile"
import "../styles/profile-setup.css"

const DAUM_POSTCODE_SCRIPT_URL = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"

let daumPostcodeScriptPromise: Promise<void> | null = null

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
      reject(new Error("주소 검색을 불러오지 못했습니다."))
    }
    document.head.appendChild(script)
  })

  return daumPostcodeScriptPromise
}

export default function ProfileSetup() {
  const navigate = useNavigate()
  const detailAddressInputRef = useRef<HTMLInputElement>(null)
  const savedProfile = readUserProfile()
  const [nickname, setNickname] = useState(savedProfile.personalInfo.nickname)
  const [phone, setPhone] = useState(savedProfile.personalInfo.phone)
  const [address, setAddress] = useState(savedProfile.personalInfo.address)
  const [detailAddress, setDetailAddress] = useState(savedProfile.personalInfo.detailAddress)
  const [isPhoneVerified, setIsPhoneVerified] = useState(savedProfile.personalInfo.isPhoneVerified)
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false)

  const phoneDigits = phone.replace(/\D/g, "")
  const isPhoneIncomplete = phoneDigits.length > 0 && phoneDigits.length < 11
  const showNicknameWarning = hasTriedSubmit && nickname.trim().length === 0
  const showPhoneWarning = isPhoneIncomplete || (hasTriedSubmit && phoneDigits.length !== 11)
  const showVerifyWarning = hasTriedSubmit && phoneDigits.length === 11 && !isPhoneVerified

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTriedSubmit(true)

    if (nickname.trim().length === 0 || phoneDigits.length !== 11 || !isPhoneVerified) return

    updateUserPersonalInfo({
      nickname: nickname.trim(),
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

    setIsPhoneVerified(true)
    alert("인증되었습니다.")
  }

  function openAddressSearch() {
    if (isAddressSearchLoading) return

    setIsAddressSearchLoading(true)
    loadDaumPostcode()
      .then(() => {
        const Postcode = window.daum?.Postcode
        if (!Postcode) throw new Error("주소 검색을 불러오지 못했습니다.")

        new Postcode({
          oncomplete: (data) => {
            setAddress(data.roadAddress || data.jibunAddress || data.address)
            window.setTimeout(() => detailAddressInputRef.current?.focus(), 0)
          },
        }).open()
      })
      .catch(() => {
        alert("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.")
      })
      .finally(() => {
        setIsAddressSearchLoading(false)
      })
  }

  return (
    <section className="profile_setup_page" aria-label="개인정보 입력">
      <header className="profile_setup_header">
        <div>
          <h1>{profileSetupCopy.title}</h1>
          <p>{profileSetupCopy.subtitle}</p>
        </div>
        <img src={mascotImage} alt="" />
      </header>

      <form className="profile_setup_form" onSubmit={handleSubmit} noValidate>
        <label className="profile_setup_field">
          <span>닉네임 <em aria-label="필수">*</em></span>
          <input
            type="text"
            placeholder="닉네임을 입력해주세요"
            autoComplete="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          {showNicknameWarning && <p className="profile_setup_hint">닉네임을 입력해 주세요</p>}
        </label>

        <label className="profile_setup_field">
          <span>전화번호 <em aria-label="필수">*</em></span>
          <span className="profile_phone_input">
            <input
              type="tel"
              placeholder="전화번호를 입력해주세요"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value)
                setIsPhoneVerified(false)
              }}
            />
            <button type="button" onClick={handleVerifyPhone}>인증하기</button>
          </span>
          {showPhoneWarning && <p className="profile_setup_hint">전화번호를 끝까지 입력해 주세요</p>}
          {showVerifyWarning && <p className="profile_setup_hint">전화번호 인증을 완료해 주세요</p>}
        </label>

        <fieldset className="profile_setup_address">
          <legend>주소</legend>
          <span className="profile_address_search">
            <button type="button" aria-label="주소 검색" onClick={openAddressSearch}>
              <img src={mapPinIcon} alt="" aria-hidden="true" />
            </button>
            <input
              type="text"
              placeholder="건물, 지번 또는 도로명 검색"
              value={address}
              readOnly
              onClick={openAddressSearch}
            />
          </span>
          <input
            ref={detailAddressInputRef}
            type="text"
            placeholder="상세주소"
            value={detailAddress}
            onChange={(event) => setDetailAddress(event.target.value)}
          />
        </fieldset>

        <button className="profile_setup_next" type="submit">
          다음
        </button>
      </form>
    </section>
  )
}
