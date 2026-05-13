import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import "../styles/ai-scan.css"
import { aiScanAssets, aiScanCopy, type ScanMode } from "../data/aiScanContent"

export default function AiScan() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<ScanMode>("drink")
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanOverlayRect, setScanOverlayRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const viewfinderRef = useRef<HTMLButtonElement | null>(null)
  const scanTimerRef = useRef<number | null>(null)

  const stageSrc = previewSrc ?? aiScanAssets.scanSample01

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ui:chat-fab-visibility", { detail: { hidden: mode === "drink" } }))
    return () => {
      window.dispatchEvent(new CustomEvent("ui:chat-fab-visibility", { detail: { hidden: false } }))
    }
  }, [mode])

  useEffect(() => {
    return () => {
      if (previewSrc?.startsWith("blob:")) URL.revokeObjectURL(previewSrc)
    }
  }, [previewSrc])

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isScanning) {
      setScanOverlayRect(null)
      return
    }

    const target = viewfinderRef.current
    if (!target) return

    const update = () => {
      const rect = target.getBoundingClientRect()
      setScanOverlayRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    }

    update()
    const raf = window.requestAnimationFrame(update)
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, { passive: true })

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update)
    }
  }, [isScanning])

  function openPicker() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) return
    if (previewSrc?.startsWith("blob:")) URL.revokeObjectURL(previewSrc)
    setPreviewSrc(URL.createObjectURL(file))
  }

  function handleScanStart() {
    if (isScanning) return
    setIsScanning(true)
    scanTimerRef.current = window.setTimeout(() => {
      setIsScanning(false)
      scanTimerRef.current = null
    }, 2200)
  }

  return (
    <section className={isScanning ? "ai_scan_page page_screen is_scanning" : "ai_scan_page page_screen"} aria-label="AI 스캔">
      <div className="ai_scan_stage" aria-hidden="true">
        <img className="ai_scan_stage_img" src={stageSrc} alt="" />
        <div className="ai_scan_stage_vignette" />
        <div className="ai_scan_stage_bottom_fade" />
      </div>

      <header className="ai_scan_topbar" aria-label="상단 메뉴">
        <button type="button" className="ai_scan_topbar_button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 5L8 12L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="ai_scan_topbar_spacer" aria-hidden="true" />
        <button type="button" className="ai_scan_topbar_button" aria-label="닫기" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="ai_scan_mode_pill" role="tablist" aria-label="스캔 모드">
        <button
          role="tab"
          type="button"
          className={`ai_scan_mode_tab${mode === "drink" ? " is_active" : ""}`}
          aria-selected={mode === "drink"}
          onClick={() => setMode("drink")}
          disabled={isScanning}
        >
          <img className="ai_scan_mode_tab_icon" src={aiScanAssets.scanDrinkModeButton} alt="" aria-hidden="true" />
          <span className="ai_scan_mode_tab_label">{aiScanCopy.tabs.drink}</span>
        </button>
        <button
          role="tab"
          type="button"
          className={`ai_scan_mode_tab${mode === "food" ? " is_active" : ""}`}
          aria-selected={mode === "food"}
          onClick={() => setMode("food")}
          disabled={isScanning}
        >
          <img className="ai_scan_mode_tab_icon" src={aiScanAssets.scanFoodModeButton} alt="" aria-hidden="true" />
          <span className="ai_scan_mode_tab_label">{aiScanCopy.tabs.food}</span>
        </button>
      </div>

      <button
        type="button"
        className="ai_scan_viewfinder"
        aria-label="카메라 뷰파인더"
        onClick={openPicker}
        disabled={isScanning}
        ref={viewfinderRef}
      >
        <img className="ai_scan_corner top_left" src={aiScanAssets.cornerRadius01} alt="" aria-hidden="true" />
        <img className="ai_scan_corner top_right" src={aiScanAssets.cornerRadius02} alt="" aria-hidden="true" />
        <img className="ai_scan_corner bottom_right" src={aiScanAssets.cornerRadius03} alt="" aria-hidden="true" />
        <img className="ai_scan_corner bottom_left" src={aiScanAssets.cornerRadius04} alt="" aria-hidden="true" />
      </button>

      <input
        ref={fileInputRef}
        className="ai_scan_file_input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="ai_scan_actions" aria-label="스캔 동작">
        <button type="button" className="ai_scan_action ai_scan_action_upload" onClick={openPicker} disabled={isScanning}>
          {aiScanCopy.upload}
        </button>
        <button type="button" className="ai_scan_action ai_scan_action_scan" onClick={handleScanStart} disabled={isScanning}>
          {aiScanCopy.scan}
        </button>
      </div>

      {isScanning ? (
        <div className="ai_scan_scanning_overlay" role="status" aria-live="polite" aria-label="스캔 중">
          <div className="ai_scan_scanning_main">
            <div
              className="ai_scan_scanning_viewfinder"
              aria-hidden="true"
              style={
                scanOverlayRect
                  ? {
                      position: "fixed",
                      left: scanOverlayRect.left,
                      top: scanOverlayRect.top,
                      width: scanOverlayRect.width,
                      height: scanOverlayRect.height,
                    }
                  : { opacity: 0 }
              }
            >
              <img className="ai_scan_corner top_left" src={aiScanAssets.cornerRadiusP01} alt="" />
              <img className="ai_scan_corner top_right" src={aiScanAssets.cornerRadiusP02} alt="" />
              <img className="ai_scan_corner bottom_right" src={aiScanAssets.cornerRadiusP03} alt="" />
              <img className="ai_scan_corner bottom_left" src={aiScanAssets.cornerRadiusP04} alt="" />
              <div className="ai_scan_scanning_area" aria-hidden="true">
                <span className="ai_scan_scanning_line" />
              </div>
            </div>

            <div className="ai_scan_scanning_center">
              <div className="ai_scan_scanning_title">{aiScanCopy.scanningTitle}</div>
              <div className="ai_scan_scanning_subtitle">{aiScanCopy.scanningSubtitle}</div>
              <div className="ai_scan_scanning_mascot" aria-hidden="true">
                <img src={aiScanAssets.scanScanningMascot} alt="" />
              </div>
            </div>
          </div>

          <div className="ai_scan_scanning_tips">
            <div className="ai_scan_scanning_tip_lead">
              <span className="ai_scan_scanning_tip_bulb" aria-hidden="true">
                💡
              </span>
              <span>{aiScanCopy.scanningTipLead}</span>
            </div>
            <div className="ai_scan_scanning_tip_row" aria-label="스캔 팁">
              {aiScanCopy.scanningTips.map((tip) => {
                const iconSrc =
                  tip.icon === "sun"
                    ? aiScanAssets.iconSun
                    : tip.icon === "barcode"
                      ? aiScanAssets.iconBarcode
                      : tip.icon === "shake"
                        ? aiScanAssets.iconShake
                        : null

                return (
                  <div key={tip.icon} className="ai_scan_scanning_tip">
                    {iconSrc ? <img src={iconSrc} alt="" aria-hidden="true" /> : null}
                    <div className="ai_scan_scanning_tip_text">{tip.title}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
