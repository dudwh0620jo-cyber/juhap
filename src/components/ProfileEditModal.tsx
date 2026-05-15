import { useEffect, useRef, useState } from "react"

import { NICKNAME_MAX_LENGTH, readUserProfile, sanitizeNickname, writeUserProfile } from "../data/userProfile"
import { readMyProfilePhotoDataUrl, writeMyProfilePhotoDataUrl } from "../utils/userAvatars"
import xIcon from "../assets/svg/x.svg"

type Props = {
  isOpen: boolean
  initialNickname: string
  onClose: () => void
  onSaved?: () => void
}

function readImageFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("failed to read image file"))
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.readAsDataURL(file)
  })
}

export default function ProfileEditModal({ isOpen, initialNickname, onClose, onSaved }: Props) {
  const [nickname, setNickname] = useState(initialNickname)
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState<string | null>(null)
  const photoUploadInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setNickname(initialNickname)
    setProfilePhotoDataUrl(readMyProfilePhotoDataUrl())
  }, [initialNickname, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const normalizedNickname = sanitizeNickname(nickname)
  const nicknameLength = Math.min(NICKNAME_MAX_LENGTH, normalizedNickname.length)
  const isSaveDisabled = normalizedNickname.length === 0

  function handleSave() {
    const current = readUserProfile()
    writeUserProfile({
      ...current,
      personalInfo: {
        ...current.personalInfo,
        nickname: normalizedNickname,
      },
    })
    writeMyProfilePhotoDataUrl(profilePhotoDataUrl)
    onSaved?.()
    onClose()
  }

  async function handleUploadPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = Array.from(event.target.files ?? []).find((value) => value.type.startsWith("image/"))
    event.target.value = ""
    if (!file) return

    try {
      const nextDataUrl = await readImageFileAsDataUrl(file)
      if (!nextDataUrl) return
      setProfilePhotoDataUrl(nextDataUrl)
    } catch {
      // ignore
    }
  }

  function handleOpenPhotoPicker() {
    window.setTimeout(() => photoUploadInputRef.current?.click(), 0)
  }

  return (
    <div className="alert_modal_overlay" role="presentation" onClick={onClose}>
      <div
        className="alert_modal my_profile_edit_modal"
        role="dialog"
        aria-modal="true"
        aria-label="내 정보 수정"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="my_profile_edit_header">
          <p className="my_profile_edit_title">프로필 편집하기</p>
          <button type="button" className="my_profile_edit_close" aria-label="닫기" onClick={onClose} />
        </div>

        <section className="my_profile_edit_section" aria-label="프로필 사진 수정">
          <div className="my_profile_edit_section_title">프로필 사진</div>
          <input
            ref={photoUploadInputRef}
            className="write_photo_file_input"
            type="file"
            accept="image/*"
            onChange={handleUploadPhotoChange}
          />
          <div className="my_profile_edit_photo_row" aria-label="프로필 사진 선택">
            {profilePhotoDataUrl ? (
              <div className="my_profile_edit_photo_shell">
                <button
                  type="button"
                  className="write_photo_thumb my_profile_edit_photo_thumb"
                  style={{ backgroundImage: `url(${profilePhotoDataUrl})` }}
                  aria-label="프로필 사진 변경"
                  onClick={handleOpenPhotoPicker}
                />
                <button
                  type="button"
                  className="write_photo_remove my_profile_edit_photo_remove"
                  aria-label="프로필 사진 제거"
                  onClick={() => setProfilePhotoDataUrl(null)}
                >
                  <img src={xIcon} alt="" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button type="button" className="write_photo_add" aria-label="프로필 사진 추가" onClick={handleOpenPhotoPicker}>
                +
              </button>
            )}
          </div>
        </section>

        <section className="my_profile_edit_section" aria-label="닉네임 수정">
          <div className="my_profile_edit_section_title">닉네임</div>
          <div className="my_profile_edit_input_shell">
            <input
              className="my_profile_edit_input"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={NICKNAME_MAX_LENGTH}
              placeholder="닉네임을 입력해주세요"
            />
            <span className="my_profile_edit_input_counter">
              <span className={nicknameLength >= NICKNAME_MAX_LENGTH ? "is_max" : undefined}>
                {nicknameLength}/{NICKNAME_MAX_LENGTH}
              </span>
            </span>
          </div>
        </section>

        <div className="my_profile_edit_actions">
          <button type="button" className="my_profile_edit_button is_cancel" onClick={onClose}>
            취소
          </button>
          <button type="button" className="my_profile_edit_button is_save" disabled={isSaveDisabled} onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
