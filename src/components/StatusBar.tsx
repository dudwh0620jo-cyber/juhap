import { useEffect, useState } from "react"
import iconCellular from "../assets/svg/Cellular Connection.svg"
import iconWifi from "../assets/svg/Wifi.svg"

interface BatteryManager extends EventTarget {
  readonly level: number
  readonly charging: boolean
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>
  }
}

function getTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
}

export default function StatusBar() {
  const [time, setTime] = useState(getTime)
  const [battery, setBattery] = useState<number>(80)

  useEffect(() => {
    const id = setInterval(() => setTime(getTime()), 10_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!navigator.getBattery) return
    navigator.getBattery().then((bat) => {
      const update = () => setBattery(Math.round(bat.level * 100))
      update()
      bat.addEventListener("levelchange", update)
    })
  }, [])

  const fillWidth = Math.round((battery / 100) * 21)

  return (
    <div className="status_bar">
      <span className="status_bar_time">{time}</span>
      <div className="status_bar_icons">
        <img src={iconCellular} width={20} height={13} alt="" aria-hidden="true" />
        <img src={iconWifi} width={18} height={13} alt="" aria-hidden="true" />
        <svg width="28" height="13" viewBox="0 0 28 13" fill="none" aria-label={`배터리 ${battery}%`}>
          <rect opacity="0.35" x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke="#0F1012" />
          <path opacity="0.4" d="M26 4.5V8.57547C26.8047 8.2303 27.328 7.42734 27.328 6.53774C27.328 5.64813 26.8047 4.84517 26 4.5Z" fill="#0F1012" />
          <rect x="2" y="2" width={fillWidth} height="9" rx="2.5" fill="#0F1012" />
        </svg>
      </div>
    </div>
  )
}
