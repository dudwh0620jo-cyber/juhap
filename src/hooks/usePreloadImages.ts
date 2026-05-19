import { useEffect } from "react"
import { preloadImages } from "../utils/preloadImages"

type Options = {
  decode?: boolean
}

export function usePreloadImages(urls: string[], options: Options = {}) {
  useEffect(() => {
    if (urls.length === 0) return

    const run = () => {
      void preloadImages(urls, options)
    }

    if (typeof window === "undefined") return
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 1200 })
      return () => window.cancelIdleCallback?.(id)
    }

    const timerId = window.setTimeout(run, 0)
    return () => window.clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join("|"), options.decode])
}

