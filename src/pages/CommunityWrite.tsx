import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import CommunityWriteBasicSection from "../components/CommunityWriteBasicSection"
import CommunityWritePostForm from "../components/CommunityWritePostForm"
import iconSearch from "../assets/svg/magnifyingglass.svg"
import iconX from "../assets/svg/x.svg"
import { useCommunityPageData } from "../hooks/useCommunityPageData"
import { COMMUNITY_USER_POSTS_KEY } from "../utils/communityStorage"
import { readUserProfile } from "../data/userProfile"
import { sakeProductsMock } from "../data/sakeProductsMock"

type WriteMode = "review" | "free"
type ReviewTab = "drink" | "pairing"
type DraftPayload = {
  mode: WriteMode
  reviewTab: ReviewTab
  selectedSituation: string | null
  selectedDrinkType: string | null
  selectedFoodCategory: string | null
  drinkName: string
  drinkRating: number
  drinkTasteTags: string[]
  photoIds: string[]
  title: string
  body: string
  pairingLocationSearch: string
  pairingLocationTags: string[]
  pairingTasteTags: string[]
  pairingPrice: string
  pairingSummary: string
  pairingBody: string
  pairingPhotoIds: string[]
}

const locationSuggestions = [
  "산아래주막",
  "아늑한 내방",
  "아늑한 우리집",
  "퇴근 후 소파 앞",
  "잔잔한 밤 방구석",
  "늦은 밤 식탁",
  "비 오는 베란다",
  "친구들과 홈파티",
  "주말 홈파티",
  "자주가는 바",
  "햇살 드는 거실",
  "우리집 야식상",
  "작은 주방 테이블",
] as const

const situationChips = ["혼술", "가족", "데이트", "친구/파티", "모임/단체"] as const
const pairingFeatureFallbackChips = ["상큼", "달콤", "묵직", "깔끔", "탄산감", "드라이", "기타"] as const
const SAKE_LABEL = "사케"
const COMMUNITY_WRITE_DRAFT_KEY_BY_MODE: Record<WriteMode, string> = {
  review: "community_write_draft_v1_review",
  free: "community_write_draft_v1_free",
}

const getModeFromSearch = (value: string | null): WriteMode => {
  if (value === "free") return "free"
  return "review"
}

function readImageFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }
      reject(new Error("이미지를 불러오지 못했습니다."))
    }
    reader.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."))
    reader.readAsDataURL(file)
  })
}

function StarRating({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const updateFromPointer = (event: React.PointerEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = (event.clientX - rect.left) / rect.width
    const raw = Math.max(0, Math.min(1, pct)) * 5
    const rounded = Math.round(raw * 2) / 2
    onChange(Number.isFinite(rounded) ? rounded : 0)
  }

  useEffect(() => {
    if (!isDragging) return
    const handleUp = () => setIsDragging(false)
    window.addEventListener("pointerup", handleUp)
    window.addEventListener("pointercancel", handleUp)
    return () => {
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleUp)
    }
  }, [isDragging])

  const stars = Array.from({ length: 5 }).map((_, index) => {
    const slotStart = index
    const fill = Math.max(0, Math.min(1, normalized - slotStart))
    const fillPct = `${Math.round(fill * 100)}%`
    return (
      <span className="write_star_unit" key={index} aria-hidden="true">
        <span className="write_star_base">★</span>
        <span className="write_star_fill" style={{ width: fillPct }}>
          ★
        </span>
      </span>
    )
  })

  return (
    <div className="write_rating_row" aria-label="별점 선택">
      <div
        ref={containerRef}
        className={isDragging ? "write_star_bar is_dragging" : "write_star_bar"}
        role="slider"
        aria-label="별점"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={normalized}
        aria-valuetext={`${normalized.toFixed(normalized % 1 === 0 ? 0 : 1)}점`}
        tabIndex={0}
        onPointerDown={(e) => {
          setIsDragging(true)
          updateFromPointer(e)
        }}
        onPointerMove={(e) => {
          if (!isDragging) return
          updateFromPointer(e)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onChange(Math.max(0, Math.round((normalized - 0.5) * 2) / 2))
          if (e.key === "ArrowRight") onChange(Math.min(5, Math.round((normalized + 0.5) * 2) / 2))
        }}
      >
        {stars}
      </div>
      <span className="write_rating_value">{normalized.toFixed(normalized % 1 === 0 ? 0 : 1)}점(0.5단위)</span>
    </div>
  )
}

export default function CommunityWrite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = getModeFromSearch(searchParams.get("mode"))
  const { popupCategoryByDrinkType, popupFeaturesByDrinkType } = useCommunityPageData()
  const isQuestionWrite = mode === "free"
  const hasCheckedDraftRef = useRef(false)
  const photoUploadInputRef = useRef<HTMLInputElement | null>(null)
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null)
  const pairingDrinkNameSnapshotRef = useRef("")

  const [reviewTab, setReviewTab] = useState<ReviewTab>("pairing")

  const [selectedSituation, setSelectedSituation] = useState<string | null>(null)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(SAKE_LABEL)
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string | null>(null)
  const [isDrinkPickerOpen, setIsDrinkPickerOpen] = useState(false)
const [drinkSuggestionsOpen, setDrinkSuggestionsOpen] = useState(false)
  const [isPairingDrinkEditing, setIsPairingDrinkEditing] = useState(false)
  const [pairingDrinkSuggestionsOpen, setPairingDrinkSuggestionsOpen] = useState(false)
  const [isPairingFoodEditing, setIsPairingFoodEditing] = useState(false)
  const [pairingFoodSearch, setPairingFoodSearch] = useState("")
  const [isPhotoActionSheetOpen, setIsPhotoActionSheetOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  // 술만 후기 쓰기(또는 질문 글쓰기 공용)
  const [drinkName, setDrinkName] = useState("")
  const [drinkRating, setDrinkRating] = useState(0)
  const [drinkTasteTags, setDrinkTasteTags] = useState<Set<string>>(() => new Set())
  const [photoIds, setPhotoIds] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  // 페어링 후기 쓰기
  const [pairingDrinkName, setPairingDrinkName] = useState("")
  const [pairingLocationSearch, setPairingLocationSearch] = useState("")
  const [pairingLocationTags, setPairingLocationTags] = useState<string[]>([])
  const [pairingTasteTags, setPairingTasteTags] = useState<Set<string>>(() => new Set())
  const [pairingPrice, setPairingPrice] = useState("")
  const [pairingSummary, setPairingSummary] = useState("")
  const [pairingBody, setPairingBody] = useState("")
  const [pairingPhotoIds, setPairingPhotoIds] = useState<string[]>([])

  const headerTitle = "글쓰기"

  const canSubmit = useMemo(() => {
    if (mode === "free") return Boolean(title.trim()) && Boolean(body.trim())
    if (reviewTab === "pairing")
      return (
        Boolean(pairingDrinkName.trim()) &&
        Boolean(selectedFoodCategory?.trim()) &&
        pairingTasteTags.size > 0 &&
        Boolean(selectedSituation?.trim()) &&
        Boolean(pairingSummary.trim()) &&
        pairingBody.trim().length >= 30
      )
    return Boolean(title.trim()) && Boolean(body.trim())
  }, [body, mode, pairingBody, pairingDrinkName, pairingSummary, pairingTasteTags, reviewTab, selectedFoodCategory, selectedSituation, title])

  const drinkTypeItems = useMemo(() => Object.keys(popupCategoryByDrinkType), [popupCategoryByDrinkType])
  const sakeItems = useMemo(() => popupCategoryByDrinkType[SAKE_LABEL] ?? [], [popupCategoryByDrinkType])

  const availableFeatureChips = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupFeaturesByDrinkType[selectedDrinkType] ?? []
  }, [popupFeaturesByDrinkType, selectedDrinkType])
  const pairingFeatureChips = [...pairingFeatureFallbackChips]
  const isBasicWrite = isQuestionWrite || reviewTab === "drink"
  const activePhotoIds = isBasicWrite ? photoIds : pairingPhotoIds

  // 술만 후기: 술 선택은 세부 카테고리(사케)만 허용 → 주종 자동 선택
  function handleDrinkNameChange(nextDrinkName: string) {
    setDrinkName(nextDrinkName)
    if (mode !== "review" || reviewTab !== "drink") return
    if (!sakeItems.includes(nextDrinkName.trim())) return
    if (selectedDrinkType !== SAKE_LABEL) setSelectedDrinkType(SAKE_LABEL)
  }

  async function handleUploadPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"))
    if (files.length === 0) return

    try {
      const remainingSlots = Math.max(0, 3 - activePhotoIds.length)
      const nextImages = await Promise.all(files.slice(0, remainingSlots).map(readImageFileAsDataUrl))
      if (isBasicWrite) {
        setPhotoIds((prev) => [...prev, ...nextImages].slice(0, 3))
      } else {
        setPairingPhotoIds((prev) => [...prev, ...nextImages].slice(0, 3))
      }
    } catch {
      window.alert("이미지를 불러오지 못했습니다. 다시 시도해 주세요.")
    }

    setIsPhotoActionSheetOpen(false)
    event.target.value = ""
  }

  const stopCameraStream = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop())
  }, [])

  const closeCameraPreview = useCallback(() => {
    stopCameraStream(cameraStream)
    setCameraStream(null)
  }, [cameraStream, stopCameraStream])

  async function openCameraCapture() {
    if (activePhotoIds.length >= 3) return
    setIsPhotoActionSheetOpen(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      window.alert("카메라를 사용할 수 없어요. 기기 또는 권한 설정을 확인해 주세요.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setCameraStream(stream)
    } catch {
      window.alert("카메라를 사용할 수 없어요. 기기 또는 권한 설정을 확인해 주세요.")
    }
  }

  function handleTakeCameraPhoto() {
    if (isBasicWrite) {
      setPhotoIds((prev) => (prev.length >= 3 ? prev : [...prev, `photo-${Date.now()}`]))
    } else {
      setPairingPhotoIds((prev) => (prev.length >= 3 ? prev : [...prev, `photo-${Date.now()}`]))
    }
    closeCameraPreview()
  }

  function handleLoadMockPhoto() {
    if (isBasicWrite) {
      setPhotoIds((prev) => (prev.length >= 3 ? prev : [...prev, `photo-${Date.now()}`]))
    } else {
      setPairingPhotoIds((prev) => (prev.length >= 3 ? prev : [...prev, `photo-${Date.now()}`]))
    }
    setIsPhotoActionSheetOpen(false)
  }

  useEffect(() => {
    if (!cameraStream || !cameraVideoRef.current) return
    cameraVideoRef.current.srcObject = cameraStream
    void cameraVideoRef.current.play().catch(() => {
      window.alert("카메라를 사용할 수 없어요. 기기 또는 권한 설정을 확인해 주세요.")
      closeCameraPreview()
    })
  }, [cameraStream, closeCameraPreview])

  useEffect(() => {
    return () => {
      stopCameraStream(cameraStream)
    }
  }, [cameraStream, stopCameraStream])

  const allDrinkSuggestions = useMemo(
    () =>
      sakeProductsMock.map((product) => ({
        label: product.name,
        type: SAKE_LABEL,
        subCategory: product.subcategory,
      })),
    []
  )

  const filteredDrinkSuggestions = useMemo(() => {
    const query = drinkName.trim().toLowerCase()
    if (!query) return []
    return allDrinkSuggestions.filter(({ label, subCategory }) =>
      label.toLowerCase().includes(query) || subCategory.toLowerCase().includes(query)
    )
  }, [drinkName, allDrinkSuggestions])

  function handleDrinkSuggestionSelect(label: string, type: string) {
    setDrinkName(label)
    if (type !== selectedDrinkType) {
      setSelectedDrinkType(type)
      setDrinkTasteTags((prev) => {
        if (prev.size === 0) return prev
        const valid = new Set(popupFeaturesByDrinkType[type] ?? [])
        return new Set(Array.from(prev).filter((item) => valid.has(item)))
      })
    }
    setDrinkSuggestionsOpen(false)
  }

  const filteredPairingDrinkSuggestions = useMemo(() => {
    const query = pairingDrinkName.trim().toLowerCase()
    if (!query) return []
    return allDrinkSuggestions.filter(({ label, subCategory }) =>
      label.toLowerCase().includes(query) || subCategory.toLowerCase().includes(query)
    )
  }, [pairingDrinkName, allDrinkSuggestions])

  const pairingDrinkSubCategory = useMemo(() => {
    const found = allDrinkSuggestions.find(({ label }) => label === pairingDrinkName)
    return found?.subCategory ?? null
  }, [allDrinkSuggestions, pairingDrinkName])

  function handlePairingDrinkSuggestionSelect(label: string, type: string) {
    setPairingDrinkName(label)
    if (type !== selectedDrinkType) setSelectedDrinkType(type)
    setPairingDrinkSuggestionsOpen(false)
    setIsPairingDrinkEditing(false)
  }


  const filteredPairingLocationSuggestions = useMemo(() => {
    const query = pairingLocationSearch.trim().toLowerCase()
    if (!query) return locationSuggestions as unknown as string[]
    return (locationSuggestions as unknown as string[]).filter((item) => item.toLowerCase().includes(query))
  }, [pairingLocationSearch])

  const draftStorageKey = COMMUNITY_WRITE_DRAFT_KEY_BY_MODE[mode]

  function buildDraftPayload(): DraftPayload {
    return {
      mode,
      reviewTab,
      selectedSituation,
      selectedDrinkType,
      selectedFoodCategory,
      drinkName,
      drinkRating,
      drinkTasteTags: Array.from(drinkTasteTags),
      photoIds,
      title,
      body,
      pairingLocationSearch,
      pairingLocationTags,
      pairingTasteTags: Array.from(pairingTasteTags),
      pairingPrice,
      pairingSummary,
      pairingBody,
      pairingPhotoIds,
    }
  }

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(draftStorageKey)
    } catch {
      // ignore storage errors
    }
  }, [draftStorageKey])

  function handleTempSave() {
    try {
      const payload = buildDraftPayload()
      window.localStorage.setItem(draftStorageKey, JSON.stringify(payload))
      window.alert("임시 저장되었습니다.")
      navigate(mode === "free" ? "/community?filter=free" : "/community?filter=review")
    } catch {
      window.alert("임시 저장에 실패했습니다. 다시 시도해 주세요.")
    }
  }

  useEffect(() => {
    if (hasCheckedDraftRef.current) return
    hasCheckedDraftRef.current = true

    try {
      const raw = window.localStorage.getItem(draftStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<DraftPayload>
      if (parsed.mode !== mode) return
      while (true) {
        const shouldRestore = window.confirm("임시저장된 글이 있습니다. 나머지 내용을 작성할까요?")
        if (shouldRestore) {
          window.setTimeout(() => {
            setReviewTab(parsed.reviewTab === "pairing" ? "pairing" : "drink")
            setSelectedSituation(parsed.selectedSituation ?? null)
            setSelectedDrinkType(parsed.selectedDrinkType ?? null)
            setSelectedFoodCategory(parsed.selectedFoodCategory ?? null)
            setDrinkName(parsed.drinkName ?? "")
            setDrinkRating(typeof parsed.drinkRating === "number" ? parsed.drinkRating : 0)
            setDrinkTasteTags(new Set(Array.isArray(parsed.drinkTasteTags) ? parsed.drinkTasteTags : []))
            setPhotoIds(Array.isArray(parsed.photoIds) ? parsed.photoIds : [])
            setTitle(parsed.title ?? "")
            setBody(parsed.body ?? "")
            setPairingLocationSearch(parsed.pairingLocationSearch ?? "")
            setPairingLocationTags(Array.isArray(parsed.pairingLocationTags) ? parsed.pairingLocationTags : [])
            setPairingTasteTags(new Set(Array.isArray(parsed.pairingTasteTags) ? parsed.pairingTasteTags : []))
            setPairingPrice((parsed.pairingPrice ?? "").replace(/[^\d]/g, ""))
            setPairingSummary(parsed.pairingSummary ?? "")
            setPairingBody(parsed.pairingBody ?? "")
            setPairingPhotoIds(Array.isArray(parsed.pairingPhotoIds) ? parsed.pairingPhotoIds : [])
          }, 0)
          return
        }

        const shouldDelete = window.confirm("정말 취소하시겠어요?")
        if (!shouldDelete) continue
        clearDraft()
        window.alert("임시저장글을 삭제했습니다.")
        return
      }
    } catch {
      // ignore parse/storage errors
    }
  }, [clearDraft, draftStorageKey, mode, navigate])

  function handleShare() {
    const now = new Date()
    const nickname = readUserProfile().personalInfo.nickname.trim() || "익명"

    if (mode === "free") {
      if (!canSubmit) return

      const nextPost = {
        id: Date.now(),
        authorId: 2001,
        authorName: nickname,
        title: title.trim(),
        body: body.trim(),
        createdAt: now.toISOString(),
        likeCount: 0,
        commentCount: 0,
        popularityScore: 0,
        locationLabel: undefined,
        photoIds: photoIds.length > 0 ? photoIds.slice(0, 3) : undefined,
        isQna: true,
      }

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
        window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
      } catch {
        // ignore storage errors
      }

      navigate("/community?filter=free")
      clearDraft()
      return
    }

    if (reviewTab === "drink") {
      const normalizedDrinkName = drinkName.trim()
      const normalizedTitle = title.trim()
      const normalizedBody = body.trim()

      if (!normalizedDrinkName) {
        window.alert("술을 선택해 주세요.")
        return
      }
      if (!selectedDrinkType?.trim()) {
        window.alert("주종을 선택해 주세요.")
        return
      }
      if (drinkRating <= 0) {
        window.alert("별점을 선택해 주세요.")
        return
      }
      if (!normalizedTitle) {
        window.alert("타이틀을 입력해 주세요.")
        return
      }
      if (normalizedBody.length < 30) {
        window.alert("상세 후기는 30자 이상 입력해 주세요.")
        return
      }
      if (!canSubmit) return

      const nextPost = {
        id: Date.now(),
        authorId: 2001,
        authorName: nickname,
        title: normalizedTitle,
        body: normalizedBody,
        createdAt: now.toISOString(),
        likeCount: 0,
        commentCount: 0,
        popularityScore: 0,
        drinkType: selectedDrinkType ?? undefined,
        categories: selectedDrinkType ? [selectedDrinkType] : undefined,
        features: drinkTasteTags.size > 0 ? Array.from(drinkTasteTags) : undefined,
        searchTags: [selectedDrinkType, ...Array.from(drinkTasteTags), "후기"].filter((v): v is string => Boolean(v)),
        rating: drinkRating,
        drinkName: normalizedDrinkName,
        photoIds: photoIds.length > 0 ? photoIds.slice(0, 3) : undefined,
      }

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
        window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
      } catch {
        // ignore storage errors
      }

      navigate("/community?filter=review")
      clearDraft()
      return
    }

    const normalizedPairingBody = pairingBody.trim()
    if (!selectedSituation?.trim()) {
      window.alert("상황 키워드를 선택해 주세요.")
      return
    }
    if (!selectedDrinkType?.trim() || !selectedFoodCategory?.trim()) {
      window.alert("술 & 음식(필수)을 선택해 주세요.")
      return
    }
    if (!pairingSummary.trim()) {
      window.alert("제목을 입력해 주세요.")
      return
    }
    if (normalizedPairingBody.length < 30) {
      return
    }
    if (!canSubmit) return

    const nextPost = {
      id: Date.now(),
      authorId: 2001,
      authorName: nickname,
      title: pairingSummary.trim(),
      body: normalizedPairingBody,
      createdAt: now.toISOString(),
      likeCount: 0,
      commentCount: 0,
      popularityScore: 0,
      locationLabel: pairingLocationTags.length > 0 ? pairingLocationTags.join(" · ") : undefined,
      drinkType: selectedDrinkType ?? undefined,
      categories: selectedDrinkType ? [selectedDrinkType] : undefined,
      features: pairingTasteTags.size > 0 ? Array.from(pairingTasteTags) : undefined,
      foods: selectedFoodCategory ? [selectedFoodCategory] : undefined,
      searchTags: [
        selectedDrinkType,
        selectedFoodCategory,
        selectedSituation,
        ...Array.from(pairingTasteTags),
        "후기",
      ].filter((v): v is string => Boolean(v)),
      pairingPriceWon: pairingPrice.trim() || undefined,
      pairingSummary: pairingSummary.trim(),
      photoIds: pairingPhotoIds.length > 0 ? pairingPhotoIds.slice(0, 3) : undefined,
    }

    try {
      const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
      window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
    } catch {
      // ignore storage errors
    }

    navigate("/community?filter=review")
    clearDraft()
  }

  if (isQuestionWrite) {
    return (
      <>
        <CommunityWritePostForm
          title={title}
          body={body}
          photoIds={photoIds}
          canSubmit={canSubmit}
          photoUploadInputRef={photoUploadInputRef}
          iconX={iconX}
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onPhotoFileChange={handleUploadPhotoChange}
          onOpenPhotoPicker={handleLoadMockPhoto}
          onRemovePhoto={(photoId) => setPhotoIds((prev) => prev.filter((id) => id !== photoId))}
          onSubmit={handleShare}
          onTempSave={handleTempSave}
          onClose={() => navigate("/community?filter=free")}
          titleText="질문 작성"
          photoTitle="사진 첨부(최대 3장)"
          titleLabel="제목"
          titlePlaceholder="질문 제목을 입력해 주세요"
          bodyLabel="본문"
          bodyPlaceholder="질문 내용을 입력해 주세요"
          bodyMaxLength={300}
        />

        {isPhotoActionSheetOpen ? (
          <div
            className="write_photo_action_backdrop"
            role="presentation"
            onMouseDown={(event) => {
              event.stopPropagation()
              setIsPhotoActionSheetOpen(false)
            }}
          >
            <div
              className="write_photo_action_sheet"
              role="dialog"
              aria-modal="true"
              aria-label="사진 추가 방법"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <span className="write_photo_action_handle" aria-hidden="true" />
              <button type="button" onClick={openCameraCapture}>
                사진 촬영
              </button>
              <button type="button" onClick={handleLoadMockPhoto}>
                업로드
              </button>
              <button type="button" onClick={() => setIsPhotoActionSheetOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        ) : null}

        {cameraStream ? (
          <div
            className="write_camera_backdrop"
            role="presentation"
            onMouseDown={(event) => {
              event.stopPropagation()
              closeCameraPreview()
            }}
          >
            <div
              className="write_camera_panel"
              role="dialog"
              aria-modal="true"
              aria-label="사진 촬영"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <video ref={cameraVideoRef} className="write_camera_video" playsInline muted />
              <div className="write_camera_actions">
                <button type="button" onClick={handleTakeCameraPhoto}>
                  촬영하기
                </button>
                <button type="button" onClick={closeCameraPreview}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <section
      className={reviewTab === "pairing" ? "community_page page_screen is_pairing_review" : "community_page page_screen"}
      aria-label="글쓰기"
      onMouseDown={(event) => {
        if ((event.target as HTMLElement | null)?.closest(".write_sheet")) return
        navigate("/community?filter=review")
      }}
    >
      <CommunityHeader
        title={headerTitle}
        topTab="feed"
        openFilterAriaLabel="검색 열기"
        openNotificationsAriaLabel="알림 열기"
        onOpenFilter={() => {}}
        onOpenNotifications={() => {}}
      />

      <div className="write_review_tabs" aria-label="후기 탭">
        <button
          type="button"
          className={reviewTab === "pairing" ? "write_review_tab is_active" : "write_review_tab"}
          onClick={() => setReviewTab("pairing")}
        >
          페어링 후기 쓰기
        </button>
        <button
          type="button"
          className={reviewTab === "drink" ? "write_review_tab is_active" : "write_review_tab"}
          onClick={() => setReviewTab("drink")}
        >
          술 후기 쓰기
        </button>
      </div>

      <div className={reviewTab === "pairing" ? "write_sheet is_pairing_review" : "write_sheet"} aria-label="글쓰기 폼">
        <div className="write_sheet_inner">
          <div className="write_section">
            <div className="write_section_header">
              <h4 className="write_section_title">후기 작성</h4>
              <button
                type="button"
                className="write_section_close"
                aria-label="글쓰기 닫기"
                onClick={() => navigate("/community?filter=review")}
              >
                <img src={iconX} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          {reviewTab === "drink" ? (
            <>
              <div className="write_section">
                <div className="write_field">
                  <span className="write_field_label">술 선택 (필수)</span>
                  <div className="write_drink_input_wrap">
                    <input
                      className="write_input"
                      value={drinkName}
                      placeholder="술 이름을 검색하거나 태그를 선택하세요"
                      onChange={(e) => handleDrinkNameChange(e.target.value)}
                      onFocus={() => setDrinkSuggestionsOpen(true)}
                      onBlur={() =>
                        window.setTimeout(() => {
                          setDrinkSuggestionsOpen(false)
                          const q = drinkName.trim().toLowerCase()
                          const matchesLabel = allDrinkSuggestions.some(({ label }) => label.toLowerCase().includes(q))
                          const matchesCategoryOnly = !matchesLabel && allDrinkSuggestions.some(({ subCategory }) => subCategory.toLowerCase().includes(q))
                          if (matchesCategoryOnly) setDrinkName("")
                        }, 150)
                      }
                    />
                    {drinkSuggestionsOpen && filteredDrinkSuggestions.length > 0 && (
                      <ul className="write_drink_autocomplete" role="listbox" aria-label="술 이름 추천">
                        {filteredDrinkSuggestions.slice(0, 8).map(({ label, type, subCategory }) => (
                          <li key={`${type}-${label}`} role="option" aria-selected={drinkName === label}>
                            <button
                              type="button"
                              className="write_drink_suggestion_item"
                              onMouseDown={() => handleDrinkSuggestionSelect(label, type)}
                            >
                              <span className="write_drink_suggestion_label">{label}</span>
                              <span className="write_drink_suggestion_type">{subCategory}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="write_chip_row" aria-label="술 태그 선택">
                  {sakeItems.slice(0, 12).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className={drinkName === chip ? "write_chip is_active" : "write_chip"}
                        onClick={() => handleDrinkNameChange(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                </div>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">주종 선택 (필수, 단일선택)</h4>
                <div className="write_chip_row" aria-label="주종 선택">
                  {drinkTypeItems.map((drinkType) => (
                    <button
                      key={drinkType}
                      type="button"
                      disabled={drinkType !== SAKE_LABEL}
                      className={
                        drinkType !== SAKE_LABEL
                          ? "write_chip is_disabled"
                          : selectedDrinkType === drinkType
                            ? "write_chip is_active"
                            : "write_chip"
                      }
                      onClick={() => {
                          setSelectedDrinkType(drinkType)
                          setDrinkTasteTags((prev) => {
                          if (prev.size === 0) return prev
                          const valid = new Set(popupFeaturesByDrinkType[drinkType] ?? [])
                          const next = new Set(Array.from(prev).filter((item) => valid.has(item)))
                          return next
                        })
                      }}
                    >
                      {drinkType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">별점 (필수)</h4>
                <StarRating value={drinkRating} onChange={setDrinkRating} />
              </div>

              <div className="write_section">
                <h4 className="write_section_title">맛 태그 (중복선택가능)</h4>
                {selectedDrinkType ? (
                  <div className="write_chip_row" aria-label="맛 태그 선택">
                    {availableFeatureChips.map((chip) => {
                      const active = drinkTasteTags.has(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={active ? "write_chip is_active" : "write_chip"}
                          onClick={() =>
                              setDrinkTasteTags((prev) => {
                              const next = new Set(prev)
                              if (next.has(chip)) {
                                next.delete(chip)
                                return next
                              }
                              if (next.size >= 2) {
                                window.alert("맛 태그는 최대 2개까지 선택할 수 있어요.")
                                return prev
                              }
                              next.add(chip)
                              return next
                            })
                          }
                        >
                          {chip}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="write_empty_slot" aria-label="주종 선택 후 태그 표시" />
                )}
              </div>

              <CommunityWriteBasicSection
                sectionTitle="후기 작성"
                photoTitle="사진 후기(선택, 최대 3장)"
                photoIds={photoIds}
                photoInputRef={photoUploadInputRef}
                onPhotoFileChange={handleUploadPhotoChange}
                onOpenPhotoPicker={() => setIsPhotoActionSheetOpen(true)}
                onRemovePhoto={(photoId) => setPhotoIds((prev) => prev.filter((id) => id !== photoId))}
                titleLabel="제목 (필수)"
                titleValue={title}
                titlePlaceholder="제목을 입력해 주세요"
                onTitleChange={setTitle}
                bodyLabel="상세 후기 (필수)"
                bodyValue={body}
                bodyPlaceholder="30자 이상 입력해 주세요"
                bodyMaxLength={1000}
                onBodyChange={setBody}
              />
            </>
          ) : (
            <>
              <div className="write_section">
                <h4 className="write_section_title">포토후기(최대 3장)</h4>
                <input
                  ref={photoUploadInputRef}
                  className="write_photo_file_input"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhotoChange}
                />
                <button
                  type="button"
                  className="write_photo_browse"
                  disabled={pairingPhotoIds.length >= 3}
                  onClick={() => {
                    setPairingPhotoIds((prev) =>
                      prev.length >= 3 ? prev : [...prev, `photo-${Date.now()}`],
                    )
                    setPairingDrinkName("닷사이 23")
                    setSelectedDrinkType(SAKE_LABEL)
                    setSelectedFoodCategory("야끼니꾸")
                  }}
                >
                  테스트용 이미지 불러오기
                </button>
                <div className="write_photo_row" aria-label="사진 추가">
                  {pairingPhotoIds.slice(0, 3).map((photoId, index) => (
                    <button
                      key={photoId}
                      type="button"
                      className="write_photo_thumb"
                      aria-label={`사진 ${index + 1}`}
                      style={photoId.startsWith("data:image/") ? { backgroundImage: `url(${photoId})` } : undefined}
                      onClick={() => setPairingPhotoIds((prev) => prev.filter((id) => id !== photoId))}
                    >
                      <span className="write_photo_remove" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  ))}
                  {pairingPhotoIds.length < 3 ? (
                    <button
                      type="button"
                      className="write_photo_add"
                      aria-label="사진 추가"
                      onClick={() => setIsPhotoActionSheetOpen(true)}
                    >
                      +
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="write_pairing_choice_list">
                <div className="write_pairing_choice_row">
                  <strong>술 선택 *</strong>
                  {isPairingDrinkEditing ? (
                    <div className="write_drink_input_wrap">
                      <input
                        className="write_input"
                        value={pairingDrinkName}
                        placeholder="술 이름을 검색하세요"
                        autoFocus
                        onChange={(e) => setPairingDrinkName(e.target.value)}
                        onFocus={() => setPairingDrinkSuggestionsOpen(true)}
                        onBlur={() =>
                          window.setTimeout(() => {
                            setPairingDrinkSuggestionsOpen(false)
                            setIsPairingDrinkEditing(false)
                            const q = pairingDrinkName.trim().toLowerCase()
                            const matchesLabel = allDrinkSuggestions.some(({ label }) => label.toLowerCase().includes(q))
                            const matchesCategoryOnly = !matchesLabel && allDrinkSuggestions.some(({ subCategory }) => subCategory.toLowerCase().includes(q))
                            if (matchesCategoryOnly) setPairingDrinkName(pairingDrinkNameSnapshotRef.current)
                          }, 150)
                        }
                      />
                      {pairingDrinkSuggestionsOpen && filteredPairingDrinkSuggestions.length > 0 && (
                        <ul className="write_drink_autocomplete" role="listbox" aria-label="술 이름 추천">
                          {filteredPairingDrinkSuggestions.slice(0, 8).map(({ label, type, subCategory }) => (
                            <li key={`${type}-${label}`} role="option" aria-selected={pairingDrinkName === label}>
                              <button
                                type="button"
                                className="write_drink_suggestion_item"
                                onMouseDown={() => handlePairingDrinkSuggestionSelect(label, type)}
                              >
                                <span className="write_drink_suggestion_label">{label}</span>
                                <span className="write_drink_suggestion_type">{subCategory}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p>{pairingDrinkName || "술을 입력해 주세요"}</p>
                      {pairingDrinkName && <span>{[selectedDrinkType, pairingDrinkSubCategory, pairingDrinkName].filter(Boolean).join(" > ")}</span>}
                    </div>
                  )}
                  <button type="button" onClick={() => { if (!isPairingDrinkEditing) pairingDrinkNameSnapshotRef.current = pairingDrinkName; setIsPairingDrinkEditing((prev) => !prev) }}>
                    {isPairingDrinkEditing ? "완료" : "수정"}
                  </button>
                </div>

                <div className="write_pairing_choice_row">
                  <strong>음식 선택 *</strong>
                  {isPairingFoodEditing ? (
                    <div className="write_drink_input_wrap">
                      <input
                        className="write_input"
                        value={pairingFoodSearch}
                        placeholder="음식 이름을 검색하세요"
                        autoFocus
                        onChange={(e) => setPairingFoodSearch(e.target.value)}
                        onBlur={() =>
                          window.setTimeout(() => {
                            setIsPairingFoodEditing(false)
                            if (pairingFoodSearch.trim()) setSelectedFoodCategory(pairingFoodSearch.trim())
                            setPairingFoodSearch("")
                          }, 150)
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <p>{selectedFoodCategory || "음식을 입력해 주세요"}</p>
                    </div>
                  )}
                  <button type="button" onClick={() => setIsPairingFoodEditing((prev) => !prev)}>
                    {isPairingFoodEditing ? "완료" : "수정"}
                  </button>
                </div>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">맛 키워드 (2개 선택) *</h4>
                <div className="write_chip_row is_pairing_preview" aria-label="취향 키워드 선택">
                  {pairingFeatureChips.map((chip) => {
                    const active = pairingTasteTags.has(chip)
                    return (
                      <button
                        key={chip}
                        type="button"
                        className={active ? "write_chip is_active" : "write_chip"}
                        onClick={() =>
                            setPairingTasteTags((prev) => {
                            const next = new Set(prev)
                            if (next.has(chip)) {
                              next.delete(chip)
                              return next
                            }
                            if (next.size >= 2) {
                              window.alert("취향 키워드는 최대 2개까지 선택할 수 있어요.")
                              return prev
                            }
                            next.add(chip)
                            return next
                          })
                        }
                      >
                        {chip}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">상황 키워드 *</h4>
                <div className="write_pill_grid is_pairing_preview" aria-label="상황 선택">
                  {situationChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className={selectedSituation === chip ? "write_pill is_active" : "write_pill"}
                      onClick={() => setSelectedSituation((prev) => (prev === chip ? null : chip))}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_label">페어링 한 줄 요약 (제목) *</span>
                  <input
                    className="write_input"
                    value={pairingSummary}
                    placeholder="제목을 입력하세요"
                    onChange={(e) => setPairingSummary(e.target.value)}
                  />
                </label>
              </div>

              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_label">상세 후기 *</span>
                  <textarea
                    className="write_textarea"
                    value={pairingBody}
                    placeholder="30자 이상 입력해주세요."
                    maxLength={1000}
                    onChange={(e) => setPairingBody(e.target.value)}
                  />
                  {pairingBody.trim().length > 0 && pairingBody.trim().length < 30 && <span className="write_field_error">상세 후기는 30자 이상 입력해 주세요.</span>}
                  <span className="write_field_counter">{Math.min(1000, pairingBody.length)}/1000</span>
                </label>
              </div>

              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_label">위치</span>
                  <span className="write_location_input">
                    <input
                      className="write_input"
                      value={pairingLocationSearch}
                      placeholder="위치를 검색하세요"
                      onChange={(e) => setPairingLocationSearch(e.target.value)}
                    />
                    <img src={iconSearch} alt="" aria-hidden="true" />
                  </span>
                </label>

                {pairingLocationSearch.trim() || pairingLocationTags.length > 0 ? (
                  <div className="write_chip_row" aria-label="위치 태그 선택">
                    {filteredPairingLocationSuggestions.slice(0, 12).map((chip) => {
                      const active = pairingLocationTags.includes(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={active ? "write_chip is_active" : "write_chip"}
                          onClick={() =>
                            setPairingLocationTags((prev) => {
                              if (prev.includes(chip)) return prev.filter((item) => item !== chip)
                              return [...prev, chip]
                            })
                          }
                        >
                          {chip}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </>
          )}

          <div className="write_bottom_actions" aria-label="작성 액션">
            <button
              type="button"
              className={canSubmit ? "write_primary_button" : "write_primary_button is_disabled"}
              disabled={!canSubmit}
              onClick={handleShare}
            >
              공유하기
            </button>
            <button type="button" className="write_secondary_button" onClick={handleTempSave}>
              임시 저장
            </button>
          </div>
        </div>
      </div>

      {isDrinkPickerOpen ? (
        <div
          className="write_modal_backdrop"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation()
            setIsDrinkPickerOpen(false)
          }}
        >
          <div
            className="write_modal_panel"
            role="dialog"
            aria-modal="true"
            aria-label="술 선택"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="write_modal_header">
              <h4 className="write_modal_title">술 선택</h4>
              <button type="button" className="write_modal_close" aria-label="닫기" onClick={() => setIsDrinkPickerOpen(false)}>
                <img src={iconX} alt="" aria-hidden="true" />
              </button>
            </div>
            <div className="write_modal_body" aria-label="술 목록">
              <div className="write_chip_row">
                {drinkTypeItems.map((drinkType) => (
                  <button
                    key={drinkType}
                    type="button"
                    disabled={drinkType !== SAKE_LABEL}
                    className={
                      drinkType !== SAKE_LABEL
                        ? "write_chip is_disabled"
                        : selectedDrinkType === drinkType
                          ? "write_chip is_active"
                          : "write_chip"
                    }
                    onClick={() => {
                        setSelectedDrinkType(drinkType)
                        setDrinkTasteTags((prev) => {
                        if (prev.size === 0) return prev
                        const valid = new Set(popupFeaturesByDrinkType[drinkType] ?? [])
                        return new Set(Array.from(prev).filter((item) => valid.has(item)))
                      })
                      setIsDrinkPickerOpen(false)
                    }}
                  >
                    {drinkType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}


      {isPhotoActionSheetOpen ? (
        <div
          className="write_photo_action_backdrop"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation()
            setIsPhotoActionSheetOpen(false)
          }}
        >
          <div
            className="write_photo_action_sheet"
            role="dialog"
            aria-modal="true"
            aria-label="사진 추가 방법"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="write_photo_action_handle" aria-hidden="true" />
            <button type="button" onClick={openCameraCapture}>
              사진 촬영
            </button>
            <button type="button" onClick={handleLoadMockPhoto}>
              업로드
            </button>
            <button type="button" onClick={() => setIsPhotoActionSheetOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      ) : null}

      {cameraStream ? (
        <div
          className="write_camera_backdrop"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation()
            closeCameraPreview()
          }}
        >
          <div
            className="write_camera_panel"
            role="dialog"
            aria-modal="true"
            aria-label="사진 촬영"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <video ref={cameraVideoRef} className="write_camera_video" playsInline muted />
            <div className="write_camera_actions">
              <button type="button" onClick={handleTakeCameraPhoto}>
                촬영하기
              </button>
              <button type="button" onClick={closeCameraPreview}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
