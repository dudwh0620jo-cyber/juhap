import { Navigate, NavLink, Route, Routes } from "react-router"
import Category from "./pages/Category"
import Chat from "./pages/Chat"
import Community from "./pages/Community"
import Home from "./pages/Home"
import MyPage from "./pages/MyPage"
import ProductDetail from "./pages/ProductDetail"
import RankingDetail from "./pages/RankingDetail"
import "./styles/common.css"

const bottomNavItems = [
  { label: "홈", path: "/home" },
  { label: "카테고리", path: "/category" },
  { label: "채팅", path: "/chat" },
  { label: "커뮤니티", path: "/community" },
  { label: "마이", path: "/my" },
]

function App() {
  return (
    <main className="app-root">
      <div className="app-viewport">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/ranking/:rankId" element={<RankingDetail />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

        <nav className="bottom-nav" aria-label="주요 메뉴">
          {bottomNavItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? "bottom-nav__item is-active" : "bottom-nav__item"
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

export default App
