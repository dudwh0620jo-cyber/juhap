import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router"
import StatusBar from "./components/StatusBar"
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

import chatMascotButton from "./assets/chat_mascot_btn.png"
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

type BottomNavItem = {
  label: string
  path: string
  icon: string
  activeIcon: string
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

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { pathname } = useLocation()
  const chatUserName = isChatOpen ? readUserProfile().personalInfo.nickname : ""
  const isChatHidden = pathname.startsWith("/product/")
  const isWritePage = pathname === "/community/write" || /^\/product\/[^/]+\/write$/.test(pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isAuthPage =
    pathname === "/onboarding" ||
    pathname === "/login" ||
    pathname === "/profile-setup" ||
    pathname === "/taste-setup"
  const isRankingActive = pathname === "/community/ranking"
  const isCommunityActive = pathname.startsWith("/community") && !isRankingActive

  return (
    <main className="app_root">
      <div className="app_viewport">
        <StatusBar />

        {!isAuthPage && !isWritePage ? (
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
                className={({ isActive }) => (isActive ? "bottom_nav_item is_active" : "bottom_nav_item")}
                key={item.path}
                to={item.path}
              >
                {({ isActive }) => (
                  <>
                    <img className="bottom_nav_icon" src={isActive ? item.activeIcon : item.icon} alt={item.label} />
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
