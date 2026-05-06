import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router"
import mascotImage from "../assets/onboarding-mascot.png"
import eyeIcon from "../assets/svg/Eye.svg"
import eyeSlashIcon from "../assets/svg/EyeSlash.svg"
import { updateUserAccount } from "../data/userProfile"
import "../styles/login.css"

const VALID_EMAIL = "juhap@gmail.com"
const VALID_PASSWORD = "juhap1234"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(VALID_EMAIL)
  const [password, setPassword] = useState(VALID_PASSWORD)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const trimmedEmail = email.trim()
  const isEmailFormatInvalid = trimmedEmail.length > 0 && !EMAIL_PATTERN.test(trimmedEmail)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isEmailFormatInvalid) {
      setErrorMessage("")
      return
    }

    if (trimmedEmail === VALID_EMAIL && password === VALID_PASSWORD) {
      setErrorMessage("")
      updateUserAccount({ email: trimmedEmail, password })
      navigate("/profile-setup", { replace: true })
      return
    }

    setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.")
  }

  return (
    <section className="login_page" aria-label="로그인">
      <div className="login_brand_row">
        <div className="login_logo_group" aria-label="주합">
          <h1 className="login_logo">주합</h1>
          <p className="login_hanja">酒合</p>
        </div>
        <img className="login_mascot" src={mascotImage} alt="" />
      </div>

      <form className="login_form" onSubmit={handleSubmit} noValidate>
        <label className="login_field">
          <span className="login_field_label">이메일 주소</span>
          <input
            type="text"
            inputMode="email"
            placeholder="이메일 주소를 입력해주세요"
            autoComplete="email"
            value={email}
            aria-invalid={isEmailFormatInvalid}
            aria-describedby={isEmailFormatInvalid ? "login-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              setErrorMessage("")
            }}
          />
        </label>

        {isEmailFormatInvalid && (
          <p className="login_error" id="login-email-error">
            이메일 형식이 올바르지 않습니다.
          </p>
        )}

        <label className="login_field">
          <span className="login_field_label">비밀번호</span>
          <span className="login_password_input">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setErrorMessage("")
              }}
            />
            <button
              className="login_password_toggle"
              type="button"
              aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
              onClick={() => setIsPasswordVisible((current) => !current)}
            >
              <img src={isPasswordVisible ? eyeSlashIcon : eyeIcon} alt="" />
            </button>
          </span>
        </label>

        {errorMessage && <p className="login_error">{errorMessage}</p>}

        <button className="login_submit_button" type="submit">
          로그인
        </button>
      </form>

      <button className="login_signup_link" type="button">
        계정이 없으신가요? 회원가입
      </button>

      <div className="login_socials" aria-label="소셜 로그인">
        <button className="login_social_button is_google" type="button" aria-label="Google로 로그인">
          G
        </button>
        <button className="login_social_button is_kakao" type="button" aria-label="KakaoTalk으로 로그인">
          TALK
        </button>
        <button className="login_social_button is_naver" type="button" aria-label="Naver로 로그인">
          N
        </button>
      </div>

      <p className="login_terms">
        계속 진행하면 서비스 이용약관 및 개인정보 처리방침에
        <br />
        동의하는 것으로 간주됩니다.
      </p>
    </section>
  )
}
