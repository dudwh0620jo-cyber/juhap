import { useEffect, useRef, useState } from "react"

import iconInfo from "../assets/svg/Info.svg"

function ChevronRightIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TierInfoPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const containerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setIsClosing(false)

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (containerRef.current?.contains(target)) return
      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    const closeDelay = window.setTimeout(() => {
      setIsClosing(true)
      window.setTimeout(() => setIsOpen(false), 240)
    }, 3000)

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown, { passive: true })
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      window.clearTimeout(closeDelay)
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <span className="my_profile_tier_info_wrap" ref={containerRef}>
      <button
        type="button"
        className="my_profile_tier_info"
        aria-label="등급 안내"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img src={iconInfo} alt="" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          className={isClosing ? "my_profile_tier_info_box is_closing" : "my_profile_tier_info_box"}
          role="dialog"
          aria-label="등급 안내"
        >
          <strong className="my_profile_tier_info_box_title">
            {["테이스터", "셀렉터", "큐레이터", "소믈리에", "마스터"].map((label, index, list) => (
              <span className="my_profile_tier_info_tier" key={label}>
                <span>{label}</span>
                {index < list.length - 1 ? (
                  <span className="my_profile_tier_info_sep" aria-hidden="true">
                    <ChevronRightIcon />
                  </span>
                ) : null}
              </span>
            ))}
          </strong>
          <p>더 많은 활동으로 단계를 업그레이드해보세요</p>
        </div>
      ) : null}
    </span>
  )
}
