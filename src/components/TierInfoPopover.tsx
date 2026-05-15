import { useEffect, useRef, useState } from "react"

import iconInfo from "../assets/svg/Info.svg"

export default function TierInfoPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (containerRef.current?.contains(target)) return
      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown, { passive: true })
    document.addEventListener("keydown", handleKeyDown)

    return () => {
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
        <div className="my_profile_tier_info_box" role="dialog" aria-label="등급 안내">
          <strong>테이스티 &gt; 셀렉티 &gt; 큐레이터 &gt; 소믈리에 &gt; 마스터</strong>
          <p>더 많은 활동으로 단계를 업그레이드해보세요</p>
        </div>
      ) : null}
    </span>
  )
}

