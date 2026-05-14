import { useLayoutEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { aiScanAssets, aiScanCopy, type ScanMode } from "../data/aiScanContent"

type AiScanModeTabsProps = {
  mode: ScanMode
  disabled?: boolean
  onModeChange: (mode: ScanMode) => void
}

const modeItems: Array<{ mode: ScanMode; icon: string; label: string }> = [
  { mode: "drink", icon: aiScanAssets.scanDrinkModeButton, label: aiScanCopy.tabs.drink },
  { mode: "food", icon: aiScanAssets.scanFoodModeButton, label: aiScanCopy.tabs.food },
]

export default function AiScanModeTabs({ mode, disabled = false, onModeChange }: AiScanModeTabsProps) {
  const pillRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<ScanMode, HTMLButtonElement | null>>({ drink: null, food: null })
  const [glider, setGlider] = useState({ x: 4, width: 0 })

  useLayoutEffect(() => {
    function updateGlider() {
      const activeTab = tabRefs.current[mode]
      if (!activeTab) return

      setGlider({
        x: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !pillRef.current
        ? null
        : new ResizeObserver(() => updateGlider())

    if (pillRef.current) observer?.observe(pillRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
  }, [mode])

  return (
    <div ref={pillRef} className="ai_scan_mode_pill" role="tablist" aria-label="?ㅼ틪 紐⑤뱶">
      <motion.span
        className="ai_scan_mode_tab_glider"
        animate={glider}
        initial={false}
        transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
        aria-hidden="true"
      />
      {modeItems.map((item) => {
        const isActive = mode === item.mode

        return (
          <button
            key={item.mode}
            ref={(node) => {
              tabRefs.current[item.mode] = node
            }}
            role="tab"
            type="button"
            className={`ai_scan_mode_tab${isActive ? " is_active" : ""}`}
            aria-selected={isActive}
            onClick={() => onModeChange(item.mode)}
            disabled={disabled}
          >
            <img className="ai_scan_mode_tab_icon" src={item.icon} alt="" aria-hidden="true" />
            <span className="ai_scan_mode_tab_label">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}




