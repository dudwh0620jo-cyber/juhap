import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Navigate, NavLink, Route, Routes, useLocation, useNavigationType } from "react-router"
import AiScan from "./pages/AiScan"
import Category from "./pages/Category"
import CategoryList from "./pages/CategoryList"
import Chat from "./pages/Chat"
import Community from "./pages/Community"
import CommunityWrite from "./pages/CommunityWrite"
import { readUserProfile } from "./data/userProfile"
import Home from "./pages/Home"
import Login from "./pages/Login"
import MyPage from "./pages/MyPage"
import MyRecord from "./pages/MyRecord"
import Onboarding from "./pages/Onboarding"
import PairingDetail from "./pages/PairingDetail"
import PairingTagList from "./pages/PairingTagList"
import ProductDetail from "./pages/ProductDetail"
import ProfileSetup from "./pages/ProfileSetup"
import Quiz from "./pages/Quiz"
import CommunityRanking from "./pages/Ranking"
import TasteSetup from "./pages/TasteSetup"
import VoteList from "./pages/VoteList"
import "./styles/common.css"
import { useChatFabVisibility } from "./hooks/useChatFabVisibility"

import chatMascotButton from "./assets/chat_mascot_btn.png"
import iconCellular from "./assets/svg/Cellular Connection.svg"
import iconCirclesFour from "./assets/svg/circlesfour.svg"
import iconCirclesFourActive from "./assets/svg/circlesfour_active.svg"
import iconHouse from "./assets/svg/house.svg"
import iconHouseActive from "./assets/svg/house_active.svg"
import iconList from "./assets/svg/list.svg"
import iconListActive from "./assets/svg/list_active.svg"
import iconRanking from "./assets/svg/ranking.svg"
import iconRankingActive from "./assets/svg/ranking_active.svg"
import iconUser from "./assets/svg/user.svg"
import iconUserActive from "./assets/svg/user_active.svg"
import iconWifi from "./assets/svg/Wifi.svg"

type BottomNavItem = {
  label: string
  path: string
  icon: string
  activeIcon: string
}

interface BatteryManager extends EventTarget {
  readonly level: number
  readonly charging: boolean
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>
  }
}

const leftNavItems = [
  { label: "홈", path: "/home", icon: iconHouse, activeIcon: iconHouseActive },
  { label: "카테고리", path: "/category", icon: iconList, activeIcon: iconListActive },
] satisfies BottomNavItem[]

const centerNavItem = {
  label: "랭킹",
  path: "/community/ranking",
  icon: iconRanking,
  activeIcon: iconRankingActive,
} satisfies BottomNavItem

const rightNavItems = [
  { label: "커뮤니티", path: "/community", icon: iconCirclesFour, activeIcon: iconCirclesFourActive },
  { label: "MY", path: "/my", icon: iconUser, activeIcon: iconUserActive },
] satisfies BottomNavItem[]

function getTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
}

function StatusBar() {
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
        <svg width="28" height="13" viewBox="0 0 28 13" fill="none" aria-label={`諛고꽣由?${battery}%`}>
          <rect opacity="0.35" x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke="#0F1012" />
          <path opacity="0.4" d="M26 4.5V8.57547C26.8047 8.2303 27.328 7.42734 27.328 6.53774C27.328 5.64813 26.8047 4.84517 26 4.5Z" fill="#0F1012" />
          <rect x="2" y="2" width={fillWidth} height="9" rx="2.5" fill="#0F1012" />
        </svg>
      </div>
    </div>
  )
}

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const location = useLocation()
  const { pathname } = location
  const navState = (location.state ?? {}) as { bottomNavActive?: "category" }
  const navigationType = useNavigationType()
  const prevPathnameRef = useRef("")
  const chatUserName = isChatOpen ? readUserProfile().personalInfo.nickname : ""
  const isChatHidden = pathname.startsWith("/product/")
  const isProductDetailPage = /^\/product\/[^/]+$/.test(pathname)
  const isWritePage = pathname === "/community/write" || /^\/product\/[^/]+\/write$/.test(pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const prevPathname = prevPathnameRef.current
    prevPathnameRef.current = pathname

    if (!isChatOpen) return

    const wasProductDetail = prevPathname.startsWith("/product/")
    const isProductDetail = pathname.startsWith("/product/")

    if (!wasProductDetail || isProductDetail) return

    if (navigationType !== "POP") {
      setIsChatOpen(false)
    }
  }, [isChatOpen, navigationType, pathname])

  const isAuthPage =
    pathname === "/onboarding" ||
    pathname === "/login" ||
    pathname === "/profile-setup" ||
    pathname === "/taste-setup"
  const isRankingActive = pathname === "/community/ranking"
  const isCategoryActive =
    pathname === "/category" ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/product/") ||
    navState.bottomNavActive === "category"
  const isCommunityActive = pathname.startsWith("/community") && !isRankingActive && !isCategoryActive
  const isChatFabHidden = useChatFabVisibility({ pathname, isAuthPage, isWritePage, isProductDetailPage })

  return (
    <main className="app_root">
      <div className="app_viewport">
        <StatusBar />

        {!isChatFabHidden ? (
          <div className="chat_corner_slot">
            <button
              type="button"
              className="chat_corner_fab"
              aria-label="AI 챗봇 열기"
              onClick={() => setIsChatOpen(true)}
            >
              <span className="chat_corner_icon" aria-hidden="true">
                <motion.img
                  className="chat_corner_icon_img"
                  src={chatMascotButton}
                  alt=""
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, -1.5, 0, 1.5, 0],
                    scale: [1, 1.015, 1],
                  }}
                  transition={{
                    duration: 3.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </span>
            </button>
          </div>
        ) : null}

        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/taste-setup" element={<TasteSetup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/category/list" element={<CategoryList />} />
          <Route path="/chat" element={<Navigate to="/home" replace />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/ranking" element={<CommunityRanking />} />
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/product/:id/write" element={<CommunityWrite />} />
          <Route path="/community/pairing/:pairingId" element={<PairingDetail />} />
          <Route path="/community/tag" element={<PairingTagList />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/my/record" element={<MyRecord />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/vote" element={<VoteList />} />
          <Route path="/ai-scan" element={<AiScan />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

        {!isAuthPage && isChatOpen ? (
          <Chat onClose={() => setIsChatOpen(false)} userName={chatUserName} isHidden={isChatHidden} />
        ) : null}

        {!isAuthPage ? (
          <nav className="bottom_nav" aria-label="주요 메뉴">
            {leftNavItems.map((item) => (
              <NavLink
                className={({ isActive }) => {
                  const active = item.path === "/category" ? isCategoryActive : isActive
                  return active ? "bottom_nav_item is_active" : "bottom_nav_item"
                }}
                key={item.path}
                to={item.path}
              >
                {({ isActive }) => (
                  <>
                    <img
                      className="bottom_nav_icon"
                      src={(item.path === "/category" ? isCategoryActive : isActive) ? item.activeIcon : item.icon}
                      alt={item.label}
                    />
                    <span className="bottom_nav_label">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            <NavLink
              className={() => (isRankingActive ? "bottom_nav_item is_active" : "bottom_nav_item")}
              to={centerNavItem.path}
            >
              <img
                className="bottom_nav_icon"
                src={isRankingActive ? centerNavItem.activeIcon : centerNavItem.icon}
                alt={centerNavItem.label}
              />
              <span className="bottom_nav_label">{centerNavItem.label}</span>
            </NavLink>

            {rightNavItems.map((item) => (
              <NavLink
                className={() => {
                  if (item.path === "/community") {
                    return isCommunityActive ? "bottom_nav_item is_active" : "bottom_nav_item"
                  }
                  return pathname.startsWith(item.path) ? "bottom_nav_item is_active" : "bottom_nav_item"
                }}
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (item.path === "/my") {
                    window.dispatchEvent(new Event("my:go-home"))
                  }
                }}
              >
                <img
                  className="bottom_nav_icon"
                  src={
                    (item.path === "/community" ? isCommunityActive : pathname.startsWith(item.path))
                      ? item.activeIcon
                      : item.icon
                  }
                  alt={item.label}
                />
                <span className="bottom_nav_label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        ) : null}
      </div>
    </main>
  )
}
