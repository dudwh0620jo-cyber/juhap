import { useLayoutEffect, useRef, useState } from "react"
import { motion } from "motion/react"

type RankingTabItem<T extends string> = {
  key: T
  label: string
}

type Props<T extends string> = {
  items: readonly RankingTabItem<T>[]
  activeKey: T
  onChange: (key: T) => void
}

export default function RankingPeriodTabs<T extends string>({ items, activeKey, onChange }: Props<T>) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [glider, setGlider] = useState({ x: 0, width: 0 })

  useLayoutEffect(() => {
    function updateGlider() {
      const activeTab = tabRefs.current[activeKey]
      if (!activeTab) return
      setGlider({ x: activeTab.offsetLeft, width: activeTab.offsetWidth })
    }

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !rowRef.current ? null : new ResizeObserver(() => updateGlider())
    if (rowRef.current) observer?.observe(rowRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
  }, [activeKey])

  return (
    <div ref={rowRef} className="ranking_periods">
      <motion.span
        className="ranking_periods_glider"
        animate={glider}
        initial={false}
        transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
        aria-hidden="true"
      />
      {items.map((item) => (
        <button
          className={activeKey === item.key ? "is_active" : ""}
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          ref={(node) => {
            tabRefs.current[item.key] = node
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

