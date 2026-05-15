import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { resolveReviewImage } from "../utils/reviewImages"

type Props = {
  numericId: number
  photoIds: string[]
  resolveImage?: (photoId: string) => string | undefined
  ariaLabel?: string
}

export default function PairingDetailMedia({
  numericId,
  photoIds,
  resolveImage = resolveReviewImage,
  ariaLabel = "페어링 리뷰 이미지",
}: Props) {
  const imageListRef = useRef<HTMLDivElement | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const imageTotal = photoIds.length

  useLayoutEffect(() => {
    imageListRef.current?.scrollTo({ left: 0, behavior: "auto" })
  }, [numericId])

  const handleScroll = useCallback(() => {
    const target = imageListRef.current
    if (!target || imageTotal === 0) return
    const nextIndex = Math.round(target.scrollLeft / Math.max(1, target.clientWidth))
    setActiveImageIndex(Math.min(imageTotal - 1, Math.max(0, nextIndex)))
  }, [imageTotal])

  if (imageTotal === 0) return null

  return (
    <div className={imageTotal > 1 ? "detail_media" : "detail_media is_single_image"}>
      <div ref={imageListRef} className="detail_images" aria-label={ariaLabel} onScroll={handleScroll}>
        {photoIds.map((photoId) => {
          const imageSrc = resolveImage(photoId)
          return (
            <figure className="detail_image_item" key={photoId}>
              {imageSrc ? <img className="detail_image" src={imageSrc} alt="" aria-hidden="true" /> : null}
            </figure>
          )
        })}
      </div>
      <span className="detail_image_count">{activeImageIndex + 1}/{imageTotal}</span>
      {imageTotal > 1 ? (
        <div className="detail_image_dots" aria-label={`이미지 ${imageTotal}장`}>
          {photoIds.map((photoId, index) => (
            <span key={photoId} className={index === activeImageIndex ? "is_active" : ""} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
