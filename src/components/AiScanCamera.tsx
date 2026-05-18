import { aiScanAssets, aiScanCopy, type ScanMode } from "../data/aiScanContent"
import AiScanActions from "./AiScanActions"
import AiScanFrame from "./AiScanFrame"
import AiScanModeTabs from "./AiScanModeTabs"
import AiScanTips from "./AiScanTips"
import AiScanTopBar from "./AiScanTopBar"

type AiScanCameraProps = {
  mode: ScanMode
  imageSrc: string
  isScanning: boolean
  modeBalloonText?: string
  showModeBalloon?: boolean
  onCloseModeBalloon?: () => void
  onBack: () => void
  onModeChange: (mode: ScanMode) => void
  onUpload: () => void
  onScan: () => void
}

export default function AiScanCamera({
  mode,
  imageSrc,
  isScanning,
  modeBalloonText,
  showModeBalloon = true,
  onCloseModeBalloon,
  onBack,
  onModeChange,
  onUpload,
  onScan,
}: AiScanCameraProps) {
  const resolvedModeBalloonText = modeBalloonText ?? aiScanCopy.modeBalloon[mode]

  return (
    <div className={`ai_scan_camera_shell${isScanning ? " is_scanning" : ""}`}>
      <div className="ai_scan_stage" aria-hidden="true">
        <img className="ai_scan_stage_img" src={imageSrc} alt="" />
        <div className="ai_scan_stage_vignette" />
        <div className="ai_scan_stage_bottom_fade" />
      </div>

      <AiScanTopBar tone="light" onBack={onBack} />
      <div className="ai_scan_mode_wrap">
        <AiScanModeTabs mode={mode} disabled={isScanning} onModeChange={onModeChange} />
        {!isScanning && showModeBalloon ? (
          <div className="ai_scan_mode_balloon" role="note">
            <span className="ai_scan_mode_balloon_text">{resolvedModeBalloonText}</span>
            {onCloseModeBalloon ? (
              <button
                type="button"
                className="ai_scan_mode_balloon_close"
                aria-label="말풍선 닫기"
                onClick={onCloseModeBalloon}
              >
                ×
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="ai_scan_frame_wrap">
        <AiScanFrame isScanning={isScanning}>
          {isScanning ? (
            <div className="ai_scan_scanning_content" role="status" aria-live="polite">
              <strong>{aiScanCopy.scanningTitle}</strong>
              <span>{aiScanCopy.scanningSubtitle}</span>
              <img src={aiScanAssets.scanScanningMascot} alt="" aria-hidden="true" />
            </div>
          ) : null}
        </AiScanFrame>
      </div>

      {isScanning ? (
        <div className="ai_scan_failure_tips_panel">
          <AiScanTips compact />
        </div>
      ) : (
        <AiScanActions
          secondaryLabel={aiScanCopy.upload}
          primaryLabel={aiScanCopy.scan}
          onSecondary={onUpload}
          onPrimary={onScan}
        />
      )}
    </div>
  )
}
