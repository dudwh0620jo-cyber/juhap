import type { RefObject } from "react"

import iconCaretLeft from "../assets/svg/caretleft.svg"
import CommunityHeader from "./CommunityHeader"
import CommunityWriteBasicSection from "./CommunityWriteBasicSection"

type Props = {
  title: string
  body: string
  photoIds: string[]
  canSubmit: boolean
  photoUploadInputRef: RefObject<HTMLInputElement | null>
  onTitleChange: (value: string) => void
  onBodyChange: (value: string) => void
  onPhotoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onOpenPhotoPicker: () => void
  onRemovePhoto: (photoId: string) => void
  onSubmit: () => void
  onTempSave: () => void
  onClose: () => void
  titleText: string
  photoTitle: string
  titleLabel: string
  titlePlaceholder: string
  bodyLabel: string
  bodyPlaceholder: string
  bodyMaxLength: number
}

export default function CommunityWritePostForm({
  title,
  body,
  photoIds,
  canSubmit,
  photoUploadInputRef,
  onTitleChange,
  onBodyChange,
  onPhotoFileChange,
  onOpenPhotoPicker,
  onRemovePhoto,
  onSubmit,
  onTempSave,
  onClose,
  titleText,
  photoTitle,
  titleLabel,
  titlePlaceholder,
  bodyLabel,
  bodyPlaceholder,
  bodyMaxLength,
}: Props) {
  return (
    <section className="community_page page_screen" aria-label="글쓰기">
      <CommunityHeader
        title={titleText}
        topTab="feed"
        openFilterAriaLabel="검색 열기"
        openNotificationsAriaLabel="알림 열기"
        onOpenFilter={() => {}}
        onOpenNotifications={() => {}}
      />

      <div className="write_sheet" aria-label="글쓰기 시트">
        <div className="write_sheet_inner">
          <div className="write_section">
            <div className="write_section_header">
              <div className="write_section_header_main">
                <button type="button" className="write_back_button" aria-label="뒤로가기" onClick={onClose}>
                  <img src={iconCaretLeft} alt="" aria-hidden="true" />
                </button>
                <h4 className="write_section_title">{titleText}</h4>
              </div>
            </div>

            <CommunityWriteBasicSection
              sectionTitle=""
              photoTitle={photoTitle}
              photoIds={photoIds}
              photoInputRef={photoUploadInputRef}
              onPhotoFileChange={onPhotoFileChange}
              onOpenPhotoPicker={onOpenPhotoPicker}
              onRemovePhoto={onRemovePhoto}
              titleLabel={titleLabel}
              titleValue={title}
              titlePlaceholder={titlePlaceholder}
              onTitleChange={onTitleChange}
              bodyLabel={bodyLabel}
              bodyValue={body}
              bodyPlaceholder={bodyPlaceholder}
              bodyMaxLength={bodyMaxLength}
              onBodyChange={onBodyChange}
            />
          </div>

          <div className="write_bottom_actions" aria-label="작성 옵션">
            <button
              type="button"
              className={canSubmit ? "write_primary_button" : "write_primary_button is_disabled"}
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              공유하기
            </button>
            <button type="button" className="write_secondary_button" onClick={onTempSave}>
              임시 저장
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
