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
  if (pathname.startsWith("/community") && pathname !== "/community/write") return true
  if (pathname === "/category" || pathname.startsWith("/category/")) return true
  return false
}

function shouldHideByRoute({ pathname, isAuthPage, isWritePage }: ChatFabVisibilityOptions) {
  if (isAuthPage) return true
  if (isWritePage) return true
  return !isChatFabAllowedPath(pathname)
}

export function useChatFabVisibility(options: ChatFabVisibilityOptions) {
  const routeHidden = useMemo(() => shouldHideByRoute(options), [options.isAuthPage, options.isWritePage, options.pathname])
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
