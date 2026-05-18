import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { useNavigate, useSearchParams } from "react-router"
import iconCheck from "../assets/svg/check_g.svg"
import iconWarning from "../assets/svg/worning_r.svg"
import AiScanCamera from "../components/AiScanCamera"
import AiScanResult from "../components/AiScanResult"
import { aiScanAssets, aiScanCopy, aiScanResult, type AiScanStatus, type ScanMode } from "../data/aiScanContent"
import { addSavedAlcoholProductId } from "../utils/savedAlcohol"
import "../styles/ai-scan.css"

export default function AiScan() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<ScanMode>("drink")
  const [status, setStatus] = useState<AiScanStatus>("ready")
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [saveToast, setSaveToast] = useState<{ message: string; tone: "success" | "warning" } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scanTimerRef = useRef<number | null>(null)

  const stageSrc = previewSrc ?? aiScanAssets.scanSample01
  const isScanning = status === "scanning"
  const isResult = status === "success" || status === "failure"
  const isFromChat = searchParams.get("from") === "chat"
  const [isModeBalloonOpen, setIsModeBalloonOpen] = useState(() => {
    if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") return true
    return window.sessionStorage.getItem("juhap_ai_scan_mode_balloon_dismissed") !== "1"
  })

  const closeModeBalloon = () => {
    setIsModeBalloonOpen(false)
    try {
      window.sessionStorage.setItem("juhap_ai_scan_mode_balloon_dismissed", "1")
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ui:chat-fab-visibility", { detail: { hidden: true } }))

    return () => {
      window.dispatchEvent(new CustomEvent("ui:chat-fab-visibility", { detail: { hidden: false } }))
    }
  }, [])

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (previewSrc?.startsWith("blob:")) URL.revokeObjectURL(previewSrc)
    }
  }, [previewSrc])


  useEffect(() => {
    if (!saveToast) return
    const timerId = window.setTimeout(() => setSaveToast(null), 1800)
    return () => window.clearTimeout(timerId)
  }, [saveToast])

  function moveBack() {
    if (isFromChat) {
      window.dispatchEvent(new CustomEvent("ui:open-chat"))
      navigate("/home")
      return
    }
    navigate(-1)
  }

  function openPicker() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (previewSrc?.startsWith("blob:")) URL.revokeObjectURL(previewSrc)
    setPreviewSrc(URL.createObjectURL(file))
    setStatus("ready")
    event.target.value = ""
  }

  function handleModeChange(nextMode: ScanMode) {
    setMode(nextMode)
    setStatus("ready")
  }

  function handleScanStart() {
    if (isScanning) return

    setStatus("scanning")
    scanTimerRef.current = window.setTimeout(() => {
      setStatus(mode === "drink" ? "success" : "failure")
      scanTimerRef.current = null
    }, 2600)
  }

  function handleRetry() {
    setStatus("ready")
  }

  function returnToScanMain() {
    setStatus("ready")
  }

  function handleOpenDetail() {
    navigate(`/product/${aiScanResult.product.id}?tab=pairing`)
  }

  function handleSave() {
    const isAdded = addSavedAlcoholProductId(aiScanResult.product.id)
    if (isAdded) {
      setSaveToast({ message: "술이 저장되었어요.", tone: "success" })
      return
    }
    setSaveToast({ message: "이미 저장되어 있어요.", tone: "warning" })
  }

  return (
    <section className={`ai_scan_page is_${status}`} aria-label={aiScanCopy.title}>
      <input
        ref={fileInputRef}
        className="ai_scan_file_input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {isResult ? (
        <AiScanResult
          status={status}
          onBack={returnToScanMain}
          onUpload={openPicker}
          onRetry={handleRetry}
          onOpenDetail={handleOpenDetail}
          onSave={handleSave}
        />
      ) : (
        <AiScanCamera
          mode={mode}
          imageSrc={stageSrc}
          isScanning={isScanning}
          modeBalloonText={aiScanCopy.modeBalloon.food}
          showModeBalloon={isModeBalloonOpen}
          onCloseModeBalloon={closeModeBalloon}
          onBack={moveBack}
          onModeChange={handleModeChange}
          onUpload={openPicker}
          onScan={handleScanStart}
        />
      )}

      {saveToast ? (
        <div className="app_alert_toast" role="status" aria-live="polite">
          <span className={saveToast.tone === "success" ? "app_alert_toast_icon is_success" : "app_alert_toast_icon is_warning"}>
            <img src={saveToast.tone === "success" ? iconCheck : iconWarning} alt="" aria-hidden="true" />
          </span>
          <p>{saveToast.message}</p>
        </div>
      ) : null}
    </section>
  )
}
