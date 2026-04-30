import { useState } from "react"
import { Navigate, NavLink, Route, Routes } from "react-router"
import Category from "./pages/Category"
import Chat from "./pages/Chat"
import Community from "./pages/Community"
import Home from "./pages/Home"
import MyPage from "./pages/MyPage"
import ProductDetail from "./pages/ProductDetail"
import Quiz from "./pages/Quiz"
import RankingDetail from "./pages/RankingDetail"
import "./styles/common.css"

const leftNavItems = [
  { label: "홈", path: "/home" },
  { label: "카테고리", path: "/category" },
]

const rightNavItems = [
  { label: "커뮤니티", path: "/community" },
  { label: "마이", path: "/my" },
]

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <main className="app_root">
      <div className="app_viewport">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/chat" element={<Navigate to="/home" replace />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/ranking/:rankId" element={<RankingDetail />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/quiz" element={<Quiz />} />
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
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className={isChatOpen ? "bottom_nav_item is_active" : "bottom_nav_item"}
            onClick={() => setIsChatOpen(true)}
          >
            채팅
          </button>

          {rightNavItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? "bottom_nav_item is_active" : "bottom_nav_item"
              }
              key={item.path}
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </main>
  )
}
