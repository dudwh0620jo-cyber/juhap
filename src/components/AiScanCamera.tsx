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
  onBack: () => void
  onModeChange: (mode: ScanMode) => void
  onUpload: () => void
  onScan: () => void
}

export default function AiScanCamera({
  mode,
  imageSrc,
  isScanning,
  onBack,
  onModeChange,
  onUpload,
  onScan,
}: AiScanCameraProps) {
  const modeBalloonText =
    mode === "food"
      ? "음식을 스캔하시면 또 다른 결과 화면을 볼 수 있어요."
      : "주류를 스캔하시면 페어링 추천 결과를 확인할 수 있어요."

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
        {!isScanning ? (
          <p className="ai_scan_mode_balloon">{modeBalloonText}</p>
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
