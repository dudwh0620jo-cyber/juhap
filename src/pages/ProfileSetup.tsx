import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot.png"
import "../styles/profile-setup.css"

export default function ProfileSetup() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)

  const phoneDigits = phone.replace(/\D/g, "")
  const isPhoneIncomplete = phoneDigits.length > 0 && phoneDigits.length < 11
  const showNicknameWarning = hasTriedSubmit && nickname.trim().length === 0
  const showPhoneWarning = isPhoneIncomplete || (hasTriedSubmit && phoneDigits.length !== 11)
  const showVerifyWarning = hasTriedSubmit && phoneDigits.length === 11 && !isPhoneVerified

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTriedSubmit(true)

    if (nickname.trim().length === 0 || phoneDigits.length !== 11 || !isPhoneVerified) {
      return
    }

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

  return (
    <section className="profile_setup_page" aria-label="개인정보 입력">
      <header className="profile_setup_header">
        <div>
          <h1>개인정보를 입력해주세요</h1>
          <p>당신의 취향을 찾기 위한<br />첫 걸음이에요</p>
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
          <input type="text" placeholder="건물, 지번 또는 도로명 검색" />
          <input type="text" placeholder="상세주소" />
        </fieldset>

        <button className="profile_setup_next" type="submit">
          다음
        </button>
      </form>
    </section>
  )
}
