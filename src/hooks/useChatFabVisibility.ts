import { useEffect, useMemo, useState } from "react"

type ChatFabVisibilityEventDetail = {
  hidden?: boolean
}

type ChatFabVisibilityOptions = {
  pathname: string
  isAuthPage: boolean
  isWritePage: boolean
  isProductDetailPage: boolean
  isCommunityPage: boolean
}

function isChatFabAllowedPath(pathname: string) {
  if (pathname === "/home") return true
  if (pathname === "/community/ranking") return true
  if (pathname === "/category" || pathname.startsWith("/category/")) return true
  return false
}

function shouldHideByRoute({ pathname, isAuthPage }: ChatFabVisibilityOptions) {
  if (isAuthPage) return true
  return !isChatFabAllowedPath(pathname)
}

export function useChatFabVisibility(options: ChatFabVisibilityOptions) {
  const routeHidden = useMemo(() => shouldHideByRoute(options), [options.isAuthPage, options.pathname])
  const [overrideHidden, setOverrideHidden] = useState<boolean | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<ChatFabVisibilityEventDetail>
      if (typeof custom.detail?.hidden !== "boolean") return
      setOverrideHidden(custom.detail.hidden)
    }

    window.addEventListener("ui:chat-fab-visibility", handler)
    return () => window.removeEventListener("ui:chat-fab-visibility", handler)
  }, [])

  useEffect(() => {
    setOverrideHidden(null)
  }, [options.pathname])

  return overrideHidden ?? routeHidden
}
