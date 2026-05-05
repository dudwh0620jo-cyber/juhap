import { useEffect, useState } from "react"
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router"
import Category from "./pages/Category"
import CategoryList from "./pages/CategoryList"
import Chat from "./pages/Chat"
import Community from "./pages/Community"
import CommunityRanking from "./pages/Ranking"
import CommunityWrite from "./pages/CommunityWrite"
import Home from "./pages/Home"
import MyPage from "./pages/MyPage"
import ProductDetail from "./pages/ProductDetail"
import Quiz from "./pages/Quiz"
import PairingDetail from "./pages/PairingDetail"
import VoteList from "./pages/VoteList"
import "./styles/common.css"

import iconchatscircle_w from "./imgs/svg/chatscircle_w.svg"
import iconCirclesFour from "./imgs/svg/circlesfour.svg"
import iconHouse from "./imgs/svg/house.svg"
import iconList from "./imgs/svg/list.svg"
import iconRanking from "./imgs/svg/ranking.svg"
import iconUser from "./imgs/svg/user.svg"

type BottomNavItem = {
  label: string
  path: string
  icon: string
}

const leftNavItems = [
  { label: "홈", path: "/home", icon: iconHouse },
  { label: "카테고리", path: "/category", icon: iconList },
] satisfies BottomNavItem[]

const centerNavItem = { label: "랭킹", path: "/community/ranking", icon: iconRanking } satisfies BottomNavItem

const rightNavItems = [
  { label: "커뮤니티", path: "/community", icon: iconCirclesFour },
  { label: "MY", path: "/my", icon: iconUser },
] satisfies BottomNavItem[]

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const isRankingActive = pathname === "/community/ranking"
  const isCommunityActive = pathname.startsWith("/community") && !isRankingActive

  return (
    <main className="app_root">
      <div className="app_viewport">
        <div className="chat_corner_slot">
          <button
            type="button"
            className="chat_corner_fab"
            aria-label="AI 챗봇 열기"
            onClick={() => setIsChatOpen(true)}
          >
            <span className="chat_corner_icon" aria-hidden="true">
              <img className="chat_corner_icon_img" src={iconchatscircle_w} alt="" />
            </span>
            <span className="chat_corner_label">AI챗봇</span>
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/category/list" element={<CategoryList />} />
          <Route path="/chat" element={<Navigate to="/home" replace />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/ranking" element={<CommunityRanking />} />
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/community/pairing/:pairingId" element={<PairingDetail />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/vote" element={<VoteList />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

        {isChatOpen ? <Chat onClose={() => setIsChatOpen(false)} /> : null}

        <nav className="bottom_nav" aria-label="주요 메뉴">
          {leftNavItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? "bottom_nav_item is_active" : "bottom_nav_item"
              }
              key={item.path}
              to={item.path}
            >
              <img
                className="bottom_nav_icon"
                src={item.icon}
                alt={item.label}
              />
              <span className="bottom_nav_label">{item.label}</span>
            </NavLink>
          ))}

          <NavLink
            className={() =>
              isRankingActive ? "bottom_nav_item is_active" : "bottom_nav_item"
            }
            to={centerNavItem.path}
          >
            <img
              className="bottom_nav_icon"
              src={centerNavItem.icon}
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
            >
              <img
                className="bottom_nav_icon"
                src={item.icon}
                alt={item.label}
              />
              <span className="bottom_nav_label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </main>
  )
}
