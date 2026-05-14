import type { ReactNode } from "react"
import { aiScanAssets } from "../data/aiScanContent"

type AiScanFrameProps = {
  isScanning?: boolean
  onSelectPhoto?: () => void
  children?: ReactNode
}

export default function AiScanFrame({ isScanning = false, onSelectPhoto, children }: AiScanFrameProps) {
  const corners = isScanning
    ? [
        { className: "top_left", src: aiScanAssets.cornerRadiusP01 },
        { className: "top_right", src: aiScanAssets.cornerRadiusP02 },
        { className: "bottom_right", src: aiScanAssets.cornerRadiusP03 },
        { className: "bottom_left", src: aiScanAssets.cornerRadiusP04 },
      ]
    : [
        { className: "top_left", src: aiScanAssets.cornerRadius01 },
        { className: "top_right", src: aiScanAssets.cornerRadius02 },
        { className: "bottom_right", src: aiScanAssets.cornerRadius03 },
        { className: "bottom_left", src: aiScanAssets.cornerRadius04 },
      ]

  const content = (
    <>
      {children}
      <div className="ai_scan_corner_layer" aria-hidden="true">
        {corners.map((corner) => (
          <img key={corner.className} className={`ai_scan_corner ${corner.className}`} src={corner.src} alt="" />
        ))}
      </div>
      {isScanning ? (
        <div className="ai_scan_beam_area" aria-hidden="true">
          <span className="ai_scan_sweep" />
        </div>
      ) : null}
    </>
  )

  if (onSelectPhoto) {
    return (
      <button
        type="button"
        className={`ai_scan_viewfinder${isScanning ? " is_scanning" : ""}`}
        aria-label="카메라 뷰파인더"
        onClick={onSelectPhoto}
        disabled={isScanning}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`ai_scan_viewfinder${isScanning ? " is_scanning" : ""}`} aria-label="카메라 뷰파인더">
      {content}
    </div>
  )
}




