type PreloadOptions = {
  decode?: boolean
}

type PreloadResult = {
  url: string
  ok: boolean
}

const promiseByUrl = new Map<string, Promise<PreloadResult>>()

function isValidUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("data:")) return false
  if (trimmed.startsWith("blob:")) return false
  return true
}

export function preloadImage(url: string, options: PreloadOptions = {}): Promise<PreloadResult> {
  const trimmed = url.trim()
  if (!isValidUrl(trimmed)) return Promise.resolve({ url: trimmed, ok: false })

  const cached = promiseByUrl.get(trimmed)
  if (cached) return cached

  const promise = new Promise<PreloadResult>((resolve) => {
    const img = new Image()
    img.decoding = "async"

    const done = (ok: boolean) => {
      resolve({ url: trimmed, ok })
    }

    img.onload = async () => {
      if (!options.decode || typeof img.decode !== "function") {
        done(true)
        return
      }

      try {
        await img.decode()
        done(true)
      } catch {
        done(true)
      }
    }

    img.onerror = () => done(false)
    img.src = trimmed
  })

  promiseByUrl.set(trimmed, promise)
  return promise
}

export async function preloadImages(urls: string[], options: PreloadOptions = {}) {
  const unique = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean)))
  const tasks = unique.map((url) => preloadImage(url, options))
  return Promise.all(tasks)
}

