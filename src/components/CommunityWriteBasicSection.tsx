import type { RefObject } from "react"

type Props = {
  sectionTitle: string
  photoTitle: string
  photoIds: string[]
  showPhotoSection?: boolean
  photoInputRef: RefObject<HTMLInputElement | null>
  onPhotoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onOpenPhotoPicker: () => void
  onLoadTestImage?: () => void
  onRemovePhoto: (photoId: string) => void
  titleLabel: string
  titleValue: string
  titlePlaceholder: string
  onTitleChange: (value: string) => void
  bodyLabel: string
  bodyValue: string
  bodyPlaceholder: string
  bodyMaxLength: number
  onBodyChange: (value: string) => void
}

export default function CommunityWriteBasicSection({
  sectionTitle,
  photoTitle,
  photoIds,
  showPhotoSection = true,
  photoInputRef,
  onPhotoFileChange,
  onOpenPhotoPicker,
  onLoadTestImage,
  onRemovePhoto,
  titleLabel,
  titleValue,
  titlePlaceholder,
  onTitleChange,
  bodyLabel,
  bodyValue,
  bodyPlaceholder,
  bodyMaxLength,
  onBodyChange,
}: Props) {
  const parsedTitleLabel = titleLabel.replace(/\s*\(필수\)\s*/g, "").trim()
  const parsedBodyLabel = bodyLabel.replace(/\s*\(필수\)\s*/g, "").trim()
  const isTitleRequired = titleLabel.includes("필수")
  const isBodyRequired = bodyLabel.includes("필수")

  return (
    <div className="write_section">
      {sectionTitle ? <h4 className="write_section_title">{sectionTitle}</h4> : null}

      {showPhotoSection ? (
        <div className="write_section">
          <h4 className="write_section_title">{photoTitle}</h4>
          <input
            ref={photoInputRef}
            className="write_photo_file_input"
            type="file"
            accept="image/*"
            onChange={onPhotoFileChange}
          />

          <div className="write_photo_row" aria-label="사진 추가">
            {photoIds.slice(0, 3).map((photoId, index) => (
              <button
                key={photoId}
                type="button"
                className="write_photo_thumb"
                aria-label={`사진 ${index + 1}`}
                style={photoId ? { backgroundImage: `url(${photoId})` } : undefined}
                onClick={() => onRemovePhoto(photoId)}
              >
                <span className="write_photo_remove" aria-hidden="true">
                  X
                </span>
              </button>
            ))}

            {photoIds.length < 3 ? (
              <button type="button" className="write_photo_add" aria-label="사진 추가" onClick={onOpenPhotoPicker}>
                +
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className="write_photo_browse"
            disabled={photoIds.length >= 3}
            onClick={onLoadTestImage ?? onOpenPhotoPicker}
          >
            테스트용 이미지 불러오기
          </button>
        </div>
      ) : null}

      <label className="write_field">
        <span className="write_field_label">
          {parsedTitleLabel}
          {isTitleRequired ? <span className="write_required_mark"> *</span> : null}
        </span>
        <input
          className="write_input"
          value={titleValue}
          placeholder={titlePlaceholder}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </label>

      <label className="write_field">
        <span className="write_field_label">
          {parsedBodyLabel}
          {isBodyRequired ? <span className="write_required_mark"> *</span> : null}
        </span>
        <textarea
          className="write_textarea"
          value={bodyValue}
          placeholder={bodyPlaceholder}
          maxLength={bodyMaxLength}
          onChange={(event) => onBodyChange(event.target.value)}
        />
        <span className="write_field_counter">
          {Math.min(bodyMaxLength, bodyValue.length)}/{bodyMaxLength}
        </span>
      </label>
    </div>
  )
}
