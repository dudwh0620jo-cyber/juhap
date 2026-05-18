import { type FormEvent, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import AlertModal from "../components/AlertModal"
import mascotImage from "../assets/onboarding-mascot_01.png"
import eyeIcon from "../assets/svg/Eye.svg"
import eyeSlashIcon from "../assets/svg/EyeSlash.svg"
import logoSvg from "../assets/svg/logo.svg"
import logoSubSvg from "../assets/svg/logo_sub.svg"
import googleLogo from "../assets/svg/logo_google.svg"
import kakaoLogo from "../assets/svg/logo_kakako.svg"
import naverLogo from "../assets/svg/logo_naver.svg"
import iconWarning from "../assets/svg/worning_r.svg"
import { updateUserAccount } from "../data/userProfile"
import "../styles/login.css"

const VALID_EMAIL = "juhap@gmail.com"
const VALID_PASSWORD = "juhap1234"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TEXT = {
  pageLabel: "\uB85C\uADF8\uC778",
  brandLabel: "\uC8FC\uD569",
  logo: "\uC8FC\uD569",
  hanja: "\u9152\u5408",
  emailLabel: "\uC774\uBA54\uC77C \uC8FC\uC18C",
  emailPlaceholder: "\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
  emailError: "\uC774\uBA54\uC77C \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  passwordLabel: "\uBE44\uBC00\uBC88\uD638",
  passwordPlaceholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
  hidePassword: "\uBE44\uBC00\uBC88\uD638 \uC228\uAE30\uAE30",
  showPassword: "\uBE44\uBC00\uBC88\uD638 \uBCF4\uAE30",
  login: "\uB85C\uADF8\uC778",
  signupLink: "\uACC4\uC815\uC774 \uC5C6\uC73C\uC2E0\uAC00\uC694? \uD68C\uC6D0\uAC00\uC785",
  socialLabel: "\uC18C\uC15C \uB85C\uADF8\uC778",
  googleLabel: "Google\uB85C \uB85C\uADF8\uC778",
  kakaoLabel: "KakaoTalk\uC73C\uB85C \uB85C\uADF8\uC778",
  naverLabel: "Naver\uB85C \uB85C\uADF8\uC778",
  terms: "\uACC4\uC18D \uC9C4\uD589\uD558\uBA74 \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC57D\uAD00 \uBC0F \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\uC5D0\n\uB3D9\uC758\uD558\uB294 \uAC83\uC73C\uB85C \uAC04\uC8FC\uD569\uB2C8\uB2E4.",
  invalidLogin: "\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  signupModalTitle: "\uC785\uB825\uD558\uC2E0 \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694.",
  signupModalMessage: "\uD574\uB2F9 \uBA54\uC77C\uB85C \uD68C\uC6D0\uAC00\uC785\uC744 \uC9C4\uD589\uD560\uAE4C\uC694?",
  otherLogin: "\uB2E4\uB978 \uBC29\uC2DD\uC73C\uB85C \uB85C\uADF8\uC778\uD558\uAE30",
  signup: "\uD68C\uC6D0\uAC00\uC785\uD558\uAE30",
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = ((location.state as { redirectTo?: string } | null)?.redirectTo ?? "").trim()
  const [email, setEmail] = useState(VALID_EMAIL)
  const [password, setPassword] = useState(VALID_PASSWORD)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSignupRequiredModalOpen, setIsSignupRequiredModalOpen] = useState(false)
  const [socialToastMessage, setSocialToastMessage] = useState<string | null>(null)

  const trimmedEmail = email.trim()
  const isEmailFormatInvalid = trimmedEmail.length > 0 && !EMAIL_PATTERN.test(trimmedEmail)

  function handleSocialLoginClick() {
    setSocialToastMessage("준비중인 기능이에요")
  }

  useEffect(() => {
    if (!socialToastMessage) return
    const timerId = window.setTimeout(() => setSocialToastMessage(null), 1800)
    return () => window.clearTimeout(timerId)
  }, [socialToastMessage])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isEmailFormatInvalid) {
      setErrorMessage("")
      return
    }

    if (trimmedEmail === VALID_EMAIL && password === VALID_PASSWORD) {
      setErrorMessage("")
      setIsSignupRequiredModalOpen(true)
      return
    }

    setErrorMessage(TEXT.invalidLogin)
  }

  function goSignup() {
    updateUserAccount({ email: trimmedEmail, password })
    navigate("/profile-setup", { replace: true, state: redirectTo ? { redirectTo } : undefined })
  }

  function handleOtherLoginClick() {
    setSocialToastMessage("준비중인 기능이에요")
  }

  return (
    <section className="login_page" aria-label={TEXT.pageLabel}>
      <div className="login_brand_row">
        <div className="login_logo_group" aria-label={TEXT.brandLabel}>
          <img className="login_logo_svg" src={logoSvg} alt="" aria-hidden="true" />
          <img className="login_logo_sub_svg" src={logoSubSvg} alt="" aria-hidden="true" />
        </div>
        <img className="login_mascot" src={mascotImage} alt="" />
      </div>

      <form className="login_form" onSubmit={handleSubmit} noValidate>
        <label className="login_field">
          <span className="login_field_label">{TEXT.emailLabel}</span>
          <input
            type="text"
            inputMode="email"
            placeholder={TEXT.emailPlaceholder}
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

        {isEmailFormatInvalid ? (
          <p className="login_error" id="login-email-error">
            {TEXT.emailError}
          </p>
        ) : null}

        <label className="login_field">
          <span className="login_field_label">{TEXT.passwordLabel}</span>
          <span className="login_password_input">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder={TEXT.passwordPlaceholder}
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
              aria-label={isPasswordVisible ? TEXT.hidePassword : TEXT.showPassword}
              onClick={() => setIsPasswordVisible((current) => !current)}
            >
              <img src={isPasswordVisible ? eyeSlashIcon : eyeIcon} alt="" />
            </button>
          </span>
        </label>

        {errorMessage ? <p className="login_error">{errorMessage}</p> : null}

        <button className="login_submit_button" type="submit">
          {TEXT.login}
        </button>
      </form>

      <button
        className="login_signup_link"
        type="button"
        onClick={() => navigate("/profile-setup", { replace: true, state: redirectTo ? { redirectTo } : undefined })}
      >
        {TEXT.signupLink}
      </button>

      <div className="login_socials" aria-label={TEXT.socialLabel}>
        <button className="login_social_button is_google" type="button" aria-label={TEXT.googleLabel} onClick={handleSocialLoginClick}>
          <img className="login_social_logo" src={googleLogo} alt="" aria-hidden="true" />
        </button>
        <button className="login_social_button is_kakao" type="button" aria-label={TEXT.kakaoLabel} onClick={handleSocialLoginClick}>
          <img className="login_social_logo" src={kakaoLogo} alt="" aria-hidden="true" />
        </button>
        <button className="login_social_button is_naver" type="button" aria-label={TEXT.naverLabel} onClick={handleSocialLoginClick}>
          <img className="login_social_logo" src={naverLogo} alt="" aria-hidden="true" />
        </button>
      </div>

      <p className="login_terms">{TEXT.terms}</p>

      {isSignupRequiredModalOpen ? (
        <AlertModal
          title={TEXT.signupModalTitle}
          message={TEXT.signupModalMessage}
          confirmLabel={TEXT.signup}
          secondaryLabel={TEXT.otherLogin}
          secondaryDisabled
          onDismiss={() => setIsSignupRequiredModalOpen(false)}
          onSecondary={handleOtherLoginClick}
          variant="signup"
          confirmTone="primary"
          onConfirm={goSignup}
        />
      ) : null}

      {socialToastMessage ? (
        <div className="app_alert_toast" role="status" aria-live="polite">
          <span className="app_alert_toast_icon is_warning">
            <img src={iconWarning} alt="" aria-hidden="true" />
          </span>
          <p>{socialToastMessage}</p>
        </div>
      ) : null}
    </section>
  )
}
