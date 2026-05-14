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

function shouldHideByRoute({ isAuthPage, isWritePage, isProductDetailPage, isCommunityPage }: ChatFabVisibilityOptions) {
  return isAuthPage || isWritePage || isProductDetailPage || isCommunityPage
}

export function useChatFabVisibility(options: ChatFabVisibilityOptions) {
  const routeHidden = useMemo(() => shouldHideByRoute(options), [options.isAuthPage, options.isProductDetailPage, options.isWritePage, options.isCommunityPage])
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

