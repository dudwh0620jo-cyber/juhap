import './styles/reset.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import AppSplash from "./components/AppSplash.tsx"

declare global {
  interface WindowEventMap {
    "app:mounted": Event
  }
}

let hasWindowLoaded = false
let hasReactMounted = false

const markReadyIfPossible = () => {
  if (!hasWindowLoaded || !hasReactMounted) return
  document.documentElement.classList.add("app_ready")
  window.setTimeout(() => {
    document.getElementById("app_splash")?.remove()
  }, 220)
}

if (document.readyState === "complete") {
  hasWindowLoaded = true
} else {
  window.addEventListener(
    "load",
    () => {
      hasWindowLoaded = true
      markReadyIfPossible()
    },
    { once: true },
  )
}

window.addEventListener(
  "app:mounted",
  () => {
    hasReactMounted = true
    markReadyIfPossible()
  },
  { once: true },
)

const splashContainer = document.getElementById("app_splash_inner")
if (splashContainer) {
  createRoot(splashContainer).render(
    <StrictMode>
      <AppSplash />
    </StrictMode>,
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
       <App />
    </BrowserRouter>
  </StrictMode>
)
