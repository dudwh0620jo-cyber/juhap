import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { useNavigate } from "react-router"
import AlertModal from "../components/AlertModal"
import AiScanCamera from "../components/AiScanCamera"
import AiScanResult from "../components/AiScanResult"
import { aiScanAssets, aiScanCopy, aiScanResult, type AiScanStatus, type ScanMode } from "../data/aiScanContent"
import "../styles/ai-scan.css"

export default function AiScan() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<ScanMode>("drink")
  const [status, setStatus] = useState<AiScanStatus>("ready")
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scanTimerRef = useRef<number | null>(null)

  const stageSrc = previewSrc ?? aiScanAssets.scanSample01
  const isScanning = status === "scanning"
  const isResult = status === "success" || status === "failure"

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

  function moveBack() {
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
    setAlertMessage(`${aiScanResult.product.name} 저장 기능은 준비 중입니다.`)
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
          onClose={returnToScanMain}
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
          onBack={moveBack}
          onClose={moveBack}
          onModeChange={handleModeChange}
          onUpload={openPicker}
          onScan={handleScanStart}
        />
      )}

      {alertMessage ? <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} /> : null}
    </section>
  )
}


