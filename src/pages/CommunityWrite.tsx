import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router"
import type { CSSProperties, RefObject } from "react"
import { AnimatePresence, motion } from "motion/react"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import CommunityWriteBasicSection from "../components/CommunityWriteBasicSection"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconCaretRight from "../assets/svg/caretright.svg"
import iconSearch from "../assets/svg/magnifyingglass.svg"
import iconX from "../assets/svg/x.svg"
import iconBell from "../assets/svg/bell.svg"
import iconPlus from "../assets/svg/plus.svg"
import iconStar from "../assets/svg/star.svg"
import mockPostPic01Image from "../assets/mock_post_pic_01.png"
import situationSoloImage from "../assets/situation_solo.png"
import situationFriendsImage from "../assets/situation_friends.png"
import situationFamilyImage from "../assets/situation_family.png"
import situationGroupImage from "../assets/situation_group.png"
import situationDateImage from "../assets/situation_date.png"
import { communityPageData } from "../data/communityPageData"
import { COMMUNITY_USER_POSTS_KEY } from "../utils/communityStorage"
import { feedPosts, getPairingTagsFromTitle, normalizeCommunityFeatures } from "../utils/communityPosts"
import { readUserProfile } from "../data/userProfile"
import { sakeProductsMock } from "../data/sakeProductsMock"
import { productDetailPageData } from "../data/productDetailData"
import { currentUserMock } from "../utils/usersMock"
import communityPostsRaw from "../data/communityPosts.json"
import { pairingWriteDrinkMocks, pairingWriteFoodMocks } from "../data/pairingWriteMocks"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import ThreeOptionModal from "../components/ThreeOptionModal"
import AlertModal from "../components/AlertModal"
import { drinkCategories, subcategoryInfoByCategoryId } from "../data/categoryData"

const PAIRING_SCAN_MS = 1200

type WriteMode = "review" | "free"
type ReviewTab = "drink" | "pairing"
type WriteKind = "question" | "pairing-review" | "drink-review"
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
const SAKE_LABEL = "사케"
const MAX_BASIC_PHOTOS = 3
const MAX_PAIRING_PHOTOS = 3
const FOOD_PARENT_CATEGORIES = ["한식", "양식", "일식", "중식", "스낵", "기타"] as const
type FoodParentCategory = (typeof FOOD_PARENT_CATEGORIES)[number]

// 글쓰기 선택 규칙
// - 주류 입력: 브랜드/이름 검색 → `drinkType(예: 맥주)`와 `subCategory`가 함께 노출되며, Enter로 첫 매칭 항목을 선택합니다.
// - 음식 입력: 음식명을 입력하면 상위 카테고리(한식/양식/일식/중식/스낵/기타)를 자동 분류해 함께 저장합니다.
const SITUATION_ICON_BY_LABEL: Record<(typeof situationChips)[number], string> = {
  "혼술": situationSoloImage,
  "친구/파티": situationFriendsImage,
  "가족": situationFamilyImage,
  "모임/단체": situationGroupImage,
  "데이트": situationDateImage,
}
const COMMUNITY_WRITE_DRAFT_KEY_BY_MODE: Record<WriteMode, string> = {
  review: "community_write_draft_v1_review",
  free: "community_write_draft_v1_free",
}

function CommunityWritePostForm({
  title,
  body,
  photoIds,
  canSubmit,
  photoUploadInputRef,
  onTitleChange,
  onBodyChange,
  onPhotoFileChange,
  onOpenPhotoPicker,
  onRemovePhoto,
  onSubmit,
  onTempSave,
  onClose,
  titleText,
  photoTitle,
  titleLabel,
  titlePlaceholder,
  bodyLabel,
  bodyPlaceholder,
  bodyMaxLength,
}: {
  title: string
  body: string
  photoIds: string[]
  canSubmit: boolean
  photoUploadInputRef: RefObject<HTMLInputElement | null>
  onTitleChange: (value: string) => void
  onBodyChange: (value: string) => void
  onPhotoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onOpenPhotoPicker: () => void
  onRemovePhoto: (photoId: string) => void
  onSubmit: () => void
  onTempSave: () => void
  onClose: () => void
  titleText: string
  photoTitle: string
  titleLabel: string
  titlePlaceholder: string
  bodyLabel: string
  bodyPlaceholder: string
  bodyMaxLength: number
}) {
  return (
    <section className="community_page page_screen" aria-label="글쓰기">
      <CommunityHeader
        title={titleText}
        topTab="feed"
        openFilterAriaLabel="검색 열기"
        openNotificationsAriaLabel="알림 열기"
        onOpenFilter={() => {}}
        onOpenNotifications={() => {}}
      />

      <div className="write_sheet" aria-label="글쓰기 시트">
        <div className="write_sheet_inner">
          <div className="write_section">
            <div className="write_section_header">
              <div className="write_section_header_main">
                <button type="button" className="write_back_button" aria-label="뒤로가기" onClick={onClose}>
                  <img src={iconCaretLeft} alt="" aria-hidden="true" />
                </button>
                <h4 className="write_section_title">{titleText}</h4>
              </div>
            </div>

            <CommunityWriteBasicSection
              sectionTitle=""
              photoTitle={photoTitle}
              photoIds={photoIds}
              photoInputRef={photoUploadInputRef}
              onPhotoFileChange={onPhotoFileChange}
              onOpenPhotoPicker={onOpenPhotoPicker}
              onRemovePhoto={onRemovePhoto}
              titleLabel={titleLabel}
              titleValue={title}
              titlePlaceholder={titlePlaceholder}
              onTitleChange={onTitleChange}
              bodyLabel={bodyLabel}
              bodyValue={body}
              bodyPlaceholder={bodyPlaceholder}
              bodyMaxLength={bodyMaxLength}
              onBodyChange={onBodyChange}
            />
          </div>

          <div className="write_bottom_actions" aria-label="작성 액션">
            <button
              type="button"
              className={canSubmit ? "write_primary_button" : "write_primary_button is_disabled"}
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              공유하기
            </button>
            <button type="button" className="write_secondary_button" onClick={onTempSave}>
              임시 저장
            </button>
          </div>
        </div>
      </div>
    </section>
  )
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
  const location = useLocation()
  const { id: productId } = useParams()
  const [searchParams] = useSearchParams()
  const { mockProductById, defaultProduct } = productDetailPageData
  const mode = getModeFromSearch(searchParams.get("mode"))
  const { popupCategoryByDrinkType, popupFeaturesByDrinkType, popupFoodCategories } = communityPageData
  const isQuestionWrite = mode === "free"
  const isProductReviewWrite = location.pathname.startsWith("/product/") && location.pathname.endsWith("/write")
  const writeKind: WriteKind = isQuestionWrite ? "question" : isProductReviewWrite ? "drink-review" : "pairing-review"
  const productDetail = productId ? mockProductById[productId] ?? defaultProduct : null
  const hasCheckedDraftRef = useRef(false)
  const [draftPrompt, setDraftPrompt] = useState<Partial<DraftPayload> | null>(null)
  const photoUploadInputRef = useRef<HTMLInputElement | null>(null)
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null)
  const pairingDrinkNameSnapshotRef = useRef("")

  const [reviewTab, setReviewTab] = useState<ReviewTab>(writeKind === "drink-review" ? "drink" : "pairing")

  const [selectedSituation, setSelectedSituation] = useState<string | null>(null)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(SAKE_LABEL)
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string | null>(null)
  const [selectedFoodParentCategory, setSelectedFoodParentCategory] = useState<FoodParentCategory | null>(null)
  const [selectedFoodCategoryTags, setSelectedFoodCategoryTags] = useState<Set<FoodParentCategory>>(() => new Set())
  const [isDrinkPickerOpen, setIsDrinkPickerOpen] = useState(false)
  const [drinkSuggestionsOpen, setDrinkSuggestionsOpen] = useState(false)
  const [isPairingDrinkModalOpen, setIsPairingDrinkModalOpen] = useState(false)
  const [activeDrinkCategoryId, setActiveDrinkCategoryId] = useState(() => drinkCategories[0]?.id ?? "sake")
  const [isDrinkCategoryMenuOpen, setIsDrinkCategoryMenuOpen] = useState(false)
  const [activeDrinkSubcategory, setActiveDrinkSubcategory] = useState<string | null>(null)
  const [pairingDrinkTagSelection, setPairingDrinkTagSelection] = useState<Set<string>>(() => new Set())
  const [pendingPairingDrinkTagSelection, setPendingPairingDrinkTagSelection] = useState<Set<string>>(() => new Set())
  const [isPairingFoodModalOpen, setIsPairingFoodModalOpen] = useState(false)
  const [isPairingFoodSuggestionsOpen, setIsPairingFoodSuggestionsOpen] = useState(false)
  const [pairingFoodSearch, setPairingFoodSearch] = useState("")
  const [pendingFoodCategoryTags, setPendingFoodCategoryTags] = useState<Set<FoodParentCategory>>(() => new Set())
  const [isPhotoActionSheetOpen, setIsPhotoActionSheetOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  useEffect(() => {
    const isAnyModalOpen = isPairingDrinkModalOpen || isPairingFoodModalOpen || isDrinkPickerOpen
    if (!isAnyModalOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isDrinkPickerOpen, isPairingDrinkModalOpen, isPairingFoodModalOpen])

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
  const [isPairingLocationExpanded, setIsPairingLocationExpanded] = useState(false)
  const [pairingDrinkThumbSrc, setPairingDrinkThumbSrc] = useState<string | null>(null)
  const [isPairingDrinkScanning, setIsPairingDrinkScanning] = useState(false)
  const [isPairingDrinkScanDone, setIsPairingDrinkScanDone] = useState(false)
  const [isPairingDrinkRevealed, setIsPairingDrinkRevealed] = useState(false)
  const [pairingFoodThumbSrc, setPairingFoodThumbSrc] = useState<string | null>(null)
  const [isPairingFoodScanning, setIsPairingFoodScanning] = useState(false)
  const [isPairingFoodScanDone, setIsPairingFoodScanDone] = useState(false)
  const [isPairingFoodRevealed, setIsPairingFoodRevealed] = useState(false)
  const [isMockRescanModalOpen, setIsMockRescanModalOpen] = useState(false)
  const [shouldAskMockRescan, setShouldAskMockRescan] = useState(false)
  const [pairingPrice, setPairingPrice] = useState("")
  const [pairingSummary, setPairingSummary] = useState("")
  const [pairingBody, setPairingBody] = useState("")
  const [pairingPhotoIds, setPairingPhotoIds] = useState<string[]>([])
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const exitPath =
    writeKind === "question"
      ? "/community?filter=free"
      : writeKind === "drink-review" && productId
        ? `/product/${productId}?tab=review`
        : "/community?filter=review"

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
  const pairingFeatureChips = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupFeaturesByDrinkType[selectedDrinkType] ?? []
  }, [popupFeaturesByDrinkType, selectedDrinkType])
  const isBasicWrite = isQuestionWrite || reviewTab === "drink"
  const activePhotoIds = isBasicWrite ? photoIds : pairingPhotoIds
  const activePhotoLimit = isBasicWrite ? MAX_BASIC_PHOTOS : MAX_PAIRING_PHOTOS

  const deriveFoodParentCategory = useCallback((foodName: string): FoodParentCategory => {
    const normalized = foodName.trim().toLowerCase()
    if (!normalized) return "기타"

    if (/(파스타|스테이크|피자|버거|샐러드|리조또|토마토|치즈)/.test(foodName)) return "양식"
    if (/(회|초밥|사시미|라멘|우동|돈카츠|가라아게|오코노미야키|야끼|이자카야|굴|새우|조개|문어|오징어|연어|해산물)/.test(foodName)) return "일식"
    if (/(짜장|짬뽕|마라|탕수육|마파|딤섬|훠궈)/.test(foodName)) return "중식"
    if (/(치킨|삼겹살|소고기|돼지고기|육회|갈비|고기)/.test(foodName)) return "한식"
    if (/(감자튀김|튀김|나초|스낵|과자|칩|프라이)/.test(foodName)) return "스낵"
    if (/(김치|된장|찌개|전|국밥|비빔|불고기|떡볶이|한식|막걸리)/.test(foodName)) return "한식"

    return "기타"
  }, [])

  useEffect(() => {
    if (writeKind === "drink-review") {
      setReviewTab("drink")
      setSelectedDrinkType(SAKE_LABEL)
      if (productDetail?.name && !drinkName.trim()) {
        setDrinkName(productDetail.name)
      }
      return
    }

    if (writeKind === "pairing-review") {
      setReviewTab("pairing")
    }
  }, [drinkName, productDetail?.name, writeKind])

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
      const remainingSlots = Math.max(0, activePhotoLimit - activePhotoIds.length)
      const nextImages = await Promise.all(files.slice(0, remainingSlots).map(readImageFileAsDataUrl))
      if (isBasicWrite) {
        setPhotoIds((prev) => [...prev, ...nextImages].slice(0, MAX_BASIC_PHOTOS))
      } else {
        setPairingPhotoIds((prev) => [...prev, ...nextImages].slice(0, MAX_PAIRING_PHOTOS))
      }
    } catch {
      setAlertMessage("이미지를 불러오지 못했습니다. 다시 시도해 주세요.")
    }

    setIsPhotoActionSheetOpen(false)
    event.target.value = ""
  }

  const openFilePicker = useCallback(() => {
    setIsPhotoActionSheetOpen(false)
    window.setTimeout(() => photoUploadInputRef.current?.click(), 0)
  }, [])

  const stopCameraStream = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop())
  }, [])

  const closeCameraPreview = useCallback(() => {
    stopCameraStream(cameraStream)
    setCameraStream(null)
  }, [cameraStream, stopCameraStream])

  async function openCameraCapture() {
    if (activePhotoIds.length >= activePhotoLimit) return
    setIsPhotoActionSheetOpen(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setAlertMessage("카메라를 사용할 수 없어요. 기기 또는 권한 설정을 확인해 주세요.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setCameraStream(stream)
    } catch {
      setAlertMessage("카메라를 사용할 수 없어요. 기기 또는 권한 설정을 확인해 주세요.")
    }
  }

  function handleTakeCameraPhoto() {
    if (isBasicWrite) {
      setPhotoIds((prev) => (prev.length >= MAX_BASIC_PHOTOS ? prev : [...prev, `photo-${Date.now()}`]))
    } else {
      setPairingPhotoIds((prev) => (prev.length >= MAX_PAIRING_PHOTOS ? prev : [...prev, `photo-${Date.now()}`]))
    }
    closeCameraPreview()
  }

  function handleLoadMockPhoto() {
    if (isBasicWrite) {
      setPhotoIds((prev) => (prev.length >= MAX_BASIC_PHOTOS ? prev : [...prev, mockPostPic01Image]))
    } else {
      if (pairingPhotoIds.length >= MAX_PAIRING_PHOTOS) {
        setIsPhotoActionSheetOpen(false)
        return
      }

      if (pairingPhotoIds.includes(mockPostPic01Image)) {
        setIsPhotoActionSheetOpen(false)
        return
      }

      const addMockPhoto = () => {
        setPairingPhotoIds((prev) => {
          if (prev.includes(mockPostPic01Image)) return prev
          if (prev.length >= MAX_PAIRING_PHOTOS) return prev
          return [mockPostPic01Image, ...prev].slice(0, MAX_PAIRING_PHOTOS)
        })
      }

      const startMockScan = () => {
        // mock_post_pic_01 → 자동 추천(연출)
        setIsPairingDrinkScanning(true)
        setIsPairingFoodScanning(true)
        setIsPairingDrinkScanDone(false)
        setIsPairingFoodScanDone(false)
        setIsPairingDrinkRevealed(false)
        setIsPairingFoodRevealed(false)
        setPairingDrinkThumbSrc(null)
        setPairingFoodThumbSrc(null)
        setPairingDrinkName("")
        setSelectedFoodCategory(null)
        setSelectedFoodParentCategory(null)
        setSelectedFoodCategoryTags(new Set())
        setPairingTasteTags(new Set())
        setSelectedSituation(null)

        const drinkMock = pairingWriteDrinkMocks[0] ?? null
        const foodMock = pairingWriteFoodMocks[0] ?? null

        window.setTimeout(() => {
          if (drinkMock) {
            setPairingDrinkName(drinkMock.name)
            setSelectedDrinkType(drinkMock.parentCategory)
          } else {
            setPairingDrinkName("추천 주류")
            if (!selectedDrinkType) setSelectedDrinkType(SAKE_LABEL)
          }
          if (drinkMock) setPairingDrinkThumbSrc(drinkMock.imageSrc)
          setIsPairingDrinkScanning(false)
          setIsPairingDrinkScanDone(true)
          window.setTimeout(() => setIsPairingDrinkRevealed(true), PAIRING_SCAN_MS)

          if (foodMock) {
            setSelectedFoodCategory(foodMock.name)
            setSelectedFoodParentCategory(foodMock.parentCategory as FoodParentCategory)
            setSelectedFoodCategoryTags(new Set([foodMock.parentCategory as FoodParentCategory]))
          } else {
            setSelectedFoodCategory("추천 음식")
            setSelectedFoodParentCategory("양식")
            setSelectedFoodCategoryTags(new Set(["양식"]))
          }
          if (foodMock) setPairingFoodThumbSrc(foodMock.imageSrc)
          setIsPairingFoodScanning(false)
          setIsPairingFoodScanDone(true)
          window.setTimeout(() => setIsPairingFoodRevealed(true), PAIRING_SCAN_MS)
        }, PAIRING_SCAN_MS)
      }

      if (shouldAskMockRescan) {
        setIsMockRescanModalOpen(true)
        setIsPhotoActionSheetOpen(false)
        return
      }

      addMockPhoto()
      startMockScan()
    }
    setIsPhotoActionSheetOpen(false)
  }

  useEffect(() => {
    if (!cameraStream || !cameraVideoRef.current) return
    cameraVideoRef.current.srcObject = cameraStream
    void cameraVideoRef.current.play().catch(() => {
      setAlertMessage("카메라를 사용할 수 없어요. 기기 또는 권한 설정을 확인해 주세요.")
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
    [],
  )

  const pairingDrinkSuggestions = useMemo(() => {
    const posts = Array.isArray(communityPostsRaw) ? (communityPostsRaw as any[]) : []
    const base = posts
      .map((post) => {
        const title = typeof post?.title === "string" ? post.title : ""
        const drinkType = typeof post?.drinkType === "string" ? post.drinkType : ""
        const category = Array.isArray(post?.categories) ? (post.categories[0] as string | undefined) : undefined
        const drinkEnglishName = typeof post?.drinkEnglishName === "string" ? post.drinkEnglishName : ""
        const drinkCountry = typeof post?.drinkCountry === "string" ? post.drinkCountry : ""
        const rating = typeof post?.rating === "number" && Number.isFinite(post.rating) ? post.rating : null
        const reviewCount = typeof post?.reviewCount === "number" && Number.isFinite(post.reviewCount) ? post.reviewCount : null
        const liquorTag = getPairingTagsFromTitle(title).liquorTag?.trim() ?? ""
        if (!liquorTag || !drinkType) return null
        const normalizedEnglishName = drinkEnglishName.trim()
        const normalizedCountry = drinkCountry.trim()
        return {
          label: liquorTag,
          type: drinkType,
          subCategory: category?.trim() || drinkType,
          ...(normalizedEnglishName ? { drinkEnglishName: normalizedEnglishName } : {}),
          ...(normalizedCountry ? { drinkCountry: normalizedCountry } : {}),
          ...(rating !== null ? { rating } : {}),
          ...(reviewCount !== null ? { reviewCount } : {}),
        }
      })
      .filter((v): v is NonNullable<typeof v> => Boolean(v))

    const unique = new Map<
      string,
      {
        label: string
        type: string
        subCategory: string
        drinkEnglishName?: string
        drinkCountry?: string
        rating?: number
        reviewCount?: number
        imageSrc?: string
      }
    >()
    base.forEach((item) => {
      const key = `${item.label}__${item.type}`
      if (!unique.has(key)) unique.set(key, item)
    })

    pairingWriteDrinkMocks.forEach((mock) => {
      const key = `${mock.name}__${mock.parentCategory}`
      unique.set(key, {
        label: mock.name,
        type: mock.parentCategory,
        subCategory: mock.subCategory,
        drinkEnglishName: mock.englishName,
        drinkCountry: mock.country,
        rating: mock.rating,
        reviewCount: mock.reviewCount,
        imageSrc: mock.imageSrc,
      })
    })

    return Array.from(unique.values())
  }, [])

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
    const normalizedQuery = query === "heineken" ? "하이네켄" : query
    return pairingDrinkSuggestions.filter(({ label, subCategory, type }) =>
      label.toLowerCase().includes(normalizedQuery) ||
      subCategory.toLowerCase().includes(normalizedQuery) ||
      type.toLowerCase().includes(normalizedQuery)
    )
  }, [pairingDrinkName, pairingDrinkSuggestions])

  const inferredPairingDrinkType = useMemo(() => {
    const query = pairingDrinkName.trim().toLowerCase()
    if (!query) return null
    const normalizedQuery = query === "heineken" ? "하이네켄" : query
    const match = pairingDrinkSuggestions.find(
      ({ label, subCategory }) =>
        label.toLowerCase().includes(normalizedQuery) || subCategory.toLowerCase().includes(normalizedQuery),
    )
    return match?.type ?? null
  }, [pairingDrinkName, pairingDrinkSuggestions])

  useEffect(() => {
    if (!inferredPairingDrinkType) return
    const resolved = drinkCategories.find((category) => category.label === inferredPairingDrinkType)
    if (resolved && resolved.id !== activeDrinkCategoryId) setActiveDrinkCategoryId(resolved.id)
    if (selectedDrinkType !== inferredPairingDrinkType) setSelectedDrinkType(inferredPairingDrinkType)
  }, [activeDrinkCategoryId, inferredPairingDrinkType, selectedDrinkType])

  const pairingDrinkSubCategory = useMemo(() => {
    const found = pairingDrinkSuggestions.find(({ label }) => label === pairingDrinkName)
    return found?.subCategory ?? null
  }, [pairingDrinkSuggestions, pairingDrinkName])

  const pairingDrinkTypeLabel = useMemo(() => {
    const found = pairingDrinkSuggestions.find(({ label }) => label === pairingDrinkName)
    return found?.type ?? (selectedDrinkType ?? null)
  }, [pairingDrinkSuggestions, pairingDrinkName, selectedDrinkType])

  const pairingDrinkRatingMeta = useMemo(() => {
    const found = pairingDrinkSuggestions.find(({ label }) => label === pairingDrinkName)
    const rating = typeof found?.rating === "number" && Number.isFinite(found.rating) ? found.rating : null
    const reviewCount = typeof found?.reviewCount === "number" && Number.isFinite(found.reviewCount) ? found.reviewCount : null
    return { rating, reviewCount }
  }, [pairingDrinkSuggestions, pairingDrinkName])

  const activeDrinkCategory = useMemo(
    () => drinkCategories.find((category) => category.id === activeDrinkCategoryId) ?? drinkCategories[0] ?? null,
    [activeDrinkCategoryId],
  )

  const activeDrinkSubcategories = useMemo(() => {
    if (!activeDrinkCategory) return []
    return popupCategoryByDrinkType[activeDrinkCategory.label] ?? []
  }, [activeDrinkCategory, popupCategoryByDrinkType])

  const activeDrinkSubcategoryInfo = useMemo(() => {
    if (!activeDrinkCategory) return {}
    return subcategoryInfoByCategoryId[activeDrinkCategory.id] ?? {}
  }, [activeDrinkCategory])

  const pairingFoodRatingMeta = useMemo(() => {
    const found = pairingWriteFoodMocks.find((mock) => mock.name === selectedFoodCategory)
    const rating = typeof found?.rating === "number" && Number.isFinite(found.rating) ? found.rating : null
    const reviewCount = typeof found?.reviewCount === "number" && Number.isFinite(found.reviewCount) ? found.reviewCount : null
    return { rating, reviewCount }
  }, [selectedFoodCategory])

  const allFoodNameSuggestions = useMemo(() => {
    const unique = new Set<string>()

    pairingWriteFoodMocks.forEach((mock) => {
      if (typeof mock?.name === "string" && mock.name.trim()) unique.add(mock.name.trim())
    })

    feedPosts.forEach((post) => {
      if (!Array.isArray(post.foods)) return
      post.foods.forEach((food) => {
        if (typeof food === "string" && food.trim()) unique.add(food.trim())
      })
    })

    popupFoodCategories.forEach((food) => {
      if (typeof food === "string" && food.trim()) unique.add(food.trim())
    })

    return Array.from(unique.values())
  }, [popupFoodCategories])

  const filteredFoodNameSuggestions = useMemo(() => {
    const query = pairingFoodSearch.trim().toLowerCase()
    if (!query) return []

    return allFoodNameSuggestions
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 3)
  }, [allFoodNameSuggestions, pairingFoodSearch])

  const selectPairingDrinkByQuery = useCallback(
    (query: string) => {
      const raw = query.trim()
      if (!raw) return false
      const normalized = raw.toLowerCase()
      const exact =
        pairingDrinkSuggestions.find(({ label, drinkEnglishName }) => {
          if (label.toLowerCase() === normalized) return true
          if (typeof drinkEnglishName === "string" && drinkEnglishName.toLowerCase() === normalized) return true
          return false
        }) ??
        pairingDrinkSuggestions.find(({ label, drinkEnglishName }) => {
          if (label.toLowerCase().includes(normalized)) return true
          if (typeof drinkEnglishName === "string" && drinkEnglishName.toLowerCase().includes(normalized)) return true
          return false
        })

      if (!exact) return false
      setPairingDrinkName(exact.label)
      setSelectedDrinkType(exact.type)
      return true
    },
    [pairingDrinkSuggestions],
  )

  function handlePairingDrinkSuggestionSelect(label: string, type: string) {
    setPairingDrinkName(label)
    if (type !== selectedDrinkType) setSelectedDrinkType(type)
    const found = pairingDrinkSuggestions.find((item) => item.label === label)
    setActiveDrinkSubcategory(found?.subCategory ?? null)
    setPendingPairingDrinkTagSelection(
      new Set([type, found?.subCategory].filter((value): value is string => Boolean(value && value.trim()))),
    )
  }


  const filteredPairingLocationSuggestions = useMemo(() => {
    const query = pairingLocationSearch.trim().toLowerCase()
    if (!query) return locationSuggestions as unknown as string[]
    return (locationSuggestions as unknown as string[]).filter((item) => item.toLowerCase().includes(query))
  }, [pairingLocationSearch])

  const handleRemovePairingPhoto = useCallback(
    (photoId: string) => {
      setPairingPhotoIds((prev) => prev.filter((id) => id !== photoId))

      if (photoId === mockPostPic01Image) {
        setShouldAskMockRescan(true)
        setIsPairingDrinkScanning(false)
        setIsPairingFoodScanning(false)
        setIsPairingDrinkScanDone(false)
        setIsPairingFoodScanDone(false)
        setIsPairingDrinkRevealed(false)
        setIsPairingFoodRevealed(false)
        setPairingDrinkThumbSrc(null)
        setPairingFoodThumbSrc(null)
        if (pairingDrinkName.trim() === "추천 주류") setPairingDrinkName("")
        if ((selectedFoodCategory ?? "").trim() === "추천 음식") {
          setSelectedFoodCategory(null)
          setSelectedFoodParentCategory(null)
          setSelectedFoodCategoryTags(new Set())
        }
      }
    },
    [pairingDrinkName, selectedFoodCategory],
  )

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
      setAlertMessage("임시 저장되었습니다.")
      navigate(exitPath)
    } catch {
      setAlertMessage("임시 저장에 실패했습니다. 다시 시도해 주세요.")
    }
  }

  function restoreDraft(parsed: Partial<DraftPayload>) {
    window.setTimeout(() => {
      setReviewTab(parsed.reviewTab === "pairing" ? "pairing" : "drink")
      setSelectedSituation(parsed.selectedSituation ?? null)
      setSelectedDrinkType(parsed.selectedDrinkType ?? null)
      setSelectedFoodCategory(parsed.selectedFoodCategory ?? null)
      setSelectedFoodParentCategory(
        typeof parsed.selectedFoodCategory === "string" && parsed.selectedFoodCategory.trim()
          ? deriveFoodParentCategory(parsed.selectedFoodCategory)
          : null,
      )
      setSelectedFoodCategoryTags(() => {
        if (typeof parsed.selectedFoodCategory !== "string" || !parsed.selectedFoodCategory.trim()) return new Set()
        return new Set([deriveFoodParentCategory(parsed.selectedFoodCategory)])
      })
      setDrinkName(parsed.drinkName ?? "")
      setDrinkRating(typeof parsed.drinkRating === "number" ? parsed.drinkRating : 0)
      setDrinkTasteTags(new Set(Array.isArray(parsed.drinkTasteTags) ? parsed.drinkTasteTags : []))
      setPhotoIds(Array.isArray(parsed.photoIds) ? parsed.photoIds : [])
      setTitle(parsed.title ?? "")
      setBody(parsed.body ?? "")
      setPairingLocationSearch(parsed.pairingLocationSearch ?? "")
      setPairingLocationTags(Array.isArray(parsed.pairingLocationTags) ? parsed.pairingLocationTags : [])
      setPairingTasteTags(new Set(Array.isArray(parsed.pairingTasteTags) ? parsed.pairingTasteTags : []))
      setPairingDrinkThumbSrc(null)
      setIsPairingDrinkScanning(false)
      setIsPairingDrinkScanDone(false)
      setIsPairingDrinkRevealed(false)
      setPairingFoodThumbSrc(null)
      setIsPairingFoodScanning(false)
      setIsPairingFoodScanDone(false)
      setIsPairingFoodRevealed(false)
      setPairingPrice((parsed.pairingPrice ?? "").replace(/[^\d]/g, ""))
      setPairingSummary(parsed.pairingSummary ?? "")
      setPairingBody(parsed.pairingBody ?? "")
      setPairingPhotoIds(Array.isArray(parsed.pairingPhotoIds) ? parsed.pairingPhotoIds.slice(0, MAX_PAIRING_PHOTOS) : [])
    }, 0)
  }

  useEffect(() => {
    if (hasCheckedDraftRef.current) return
    hasCheckedDraftRef.current = true

    try {
      const raw = window.localStorage.getItem(draftStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<DraftPayload>
      if (parsed.mode !== mode) return
      setDraftPrompt(parsed)
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
        authorId: currentUserMock.id,
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
        sourceType: "question",
      }

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
        window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
        window.dispatchEvent(new Event("community:user-posts-updated"))
      } catch {
        // ignore storage errors
      }

      navigate(exitPath)
      clearDraft()
      return
    }

    if (reviewTab === "drink") {
      const normalizedDrinkName = drinkName.trim()
      const normalizedTitle = title.trim()
      const normalizedBody = body.trim()

      if (!normalizedDrinkName) {
        setAlertMessage("술을 선택해 주세요.")
        return
      }
      if (!selectedDrinkType?.trim()) {
        setAlertMessage("주종을 선택해 주세요.")
        return
      }
      if (drinkRating <= 0) {
        setAlertMessage("별점을 선택해 주세요.")
        return
      }
      if (!normalizedTitle) {
        setAlertMessage("타이틀을 입력해 주세요.")
        return
      }
      if (normalizedBody.length < 30) {
        setAlertMessage("상세 후기는 30자 이상 입력해 주세요.")
        return
      }
      if (!canSubmit) return

      const nextPost = {
        id: Date.now(),
        authorId: currentUserMock.id,
        authorName: nickname,
        title: normalizedTitle,
        body: normalizedBody,
        createdAt: now.toISOString(),
        likeCount: 0,
        commentCount: 0,
        popularityScore: 0,
        drinkType: selectedDrinkType ?? undefined,
        categories: selectedDrinkType ? [selectedDrinkType] : undefined,
        features: normalizeCommunityFeatures(Array.from(drinkTasteTags), 2),
        searchTags: [selectedDrinkType, ...Array.from(drinkTasteTags), "후기"].filter((v): v is string => Boolean(v)),
        rating: drinkRating,
        drinkName: normalizedDrinkName,
        productId: writeKind === "drink-review" ? productId : undefined,
        sourceType: "drink-review",
        photoIds: photoIds.length > 0 ? photoIds.slice(0, 3) : undefined,
      }

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
        window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
        window.dispatchEvent(new Event("community:user-posts-updated"))
      } catch {
        // ignore storage errors
      }

      navigate(writeKind === "drink-review" && productId ? `/product/${productId}?tab=review` : "/community?filter=review")
      clearDraft()
      return
    }

    const normalizedPairingBody = pairingBody.trim()
    if (!selectedSituation?.trim()) {
      setAlertMessage("상황 키워드를 선택해 주세요.")
      return
    }
    if (!selectedDrinkType?.trim() || !selectedFoodCategory?.trim()) {
      setAlertMessage("술 & 음식(필수)을 선택해 주세요.")
      return
    }
    if (!pairingSummary.trim()) {
      setAlertMessage("제목을 입력해 주세요.")
      return
    }
    if (normalizedPairingBody.length < 30) {
      return
    }
    if (!canSubmit) return

      const nextPost = {
        id: Date.now(),
        authorId: currentUserMock.id,
        authorName: nickname,
        title: `${pairingDrinkName.trim()} + ${selectedFoodCategory ?? ""}`,
        body: normalizedPairingBody,
      createdAt: now.toISOString(),
      likeCount: 0,
      commentCount: 0,
      popularityScore: 0,
      locationLabel: pairingLocationTags.length > 0 ? pairingLocationTags.join(" · ") : undefined,
      drinkType: selectedDrinkType ?? undefined,
      categories: selectedDrinkType ? [selectedDrinkType] : undefined,
      detailCategories: pairingDrinkSubCategory ? [pairingDrinkSubCategory] : undefined,
      features: normalizeCommunityFeatures(Array.from(pairingTasteTags), 2),
      foods: selectedFoodCategory ? [selectedFoodCategory] : undefined,
      foodParentCategory: selectedFoodParentCategory ?? undefined,
      situation: selectedSituation ?? undefined,
      searchTags: [
        selectedDrinkType,
        pairingDrinkSubCategory,
        ...Array.from(pairingTasteTags),
        selectedFoodCategory,
        selectedFoodParentCategory,
        selectedSituation,
      ].filter((v): v is string => Boolean(v)),
      pairingPriceWon: pairingPrice.trim() || undefined,
      pairingSummary: pairingSummary.trim(),
      sourceType: "pairing-review",
      photoIds: pairingPhotoIds.length > 0 ? pairingPhotoIds.slice(0, MAX_PAIRING_PHOTOS) : undefined,
    }

    try {
      const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
      window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
      window.dispatchEvent(new Event("community:user-posts-updated"))
    } catch {
      // ignore storage errors
    }

    navigate(exitPath)
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
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onPhotoFileChange={handleUploadPhotoChange}
          onOpenPhotoPicker={handleLoadMockPhoto}
          onRemovePhoto={(photoId) => setPhotoIds((prev) => prev.filter((id) => id !== photoId))}
          onSubmit={handleShare}
          onTempSave={handleTempSave}
          onClose={() => navigate(exitPath)}
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
              <button type="button" onClick={openFilePicker}>
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

        {alertMessage ? <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} /> : null}
      </>
    )
  }

  return (
    <section
      className={reviewTab === "pairing" ? "community_page page_screen is_pairing_review" : "community_page page_screen"}
      aria-label="글쓰기"
      onMouseDown={(event) => {
        if ((event.target as HTMLElement | null)?.closest(".write_sheet")) return
        navigate(exitPath)
      }}
    >
      <header className="community_header write_compose_header" aria-label="글쓰기 헤더">
        <button type="button" className="write_compose_back" aria-label="뒤로가기" onClick={() => navigate(exitPath)}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
        <div className="community_header_actions" aria-label="커뮤니티 헤더 액션">
          <button className="community_header_action_button" type="button" aria-label="검색 열기" onClick={() => {}}>
            <img className="community_header_action_icon" src={iconSearch} alt="" aria-hidden="true" />
          </button>
          <button className="community_header_action_button" type="button" aria-label="알림 열기" onClick={() => {}}>
            <img className="community_header_action_icon" src={iconBell} alt="" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={reviewTab === "pairing" ? "write_sheet is_pairing_review" : "write_sheet"} aria-label="글쓰기 폼">
        <div className="write_sheet_inner">
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
                <h4 className="write_section_title">사진</h4>
                <input
                  ref={photoUploadInputRef}
                  className="write_photo_file_input"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhotoChange}
                />

                <div className="write_pairing_photo_slots" aria-label="사진 추가">
                  {pairingPhotoIds.slice(0, MAX_PAIRING_PHOTOS).map((photoId, index) => {
                    const isScanTargetPhoto = index === 0 && photoId === mockPostPic01Image

                    return (
                      <div className="write_pairing_photo_slot" key={`${photoId}-${index}`}>
                        <button
                          type="button"
                          className={
                            isScanTargetPhoto
                              ? isPairingDrinkScanning || isPairingFoodScanning
                                ? "write_pairing_photo_image is_scanning"
                                : isPairingDrinkRevealed || isPairingFoodRevealed
                                  ? "write_pairing_photo_image is_scan_done"
                                  : "write_pairing_photo_image"
                              : "write_pairing_photo_image"
                          }
                          aria-label={`사진 ${index + 1}`}
                          style={{ backgroundImage: `url(${photoId})` }}
                          onClick={() => setIsPhotoActionSheetOpen(true)}
                        >
                          {isScanTargetPhoto && (isPairingDrinkScanning || isPairingFoodScanning) ? (
                            <>
                              <span className="write_scan_overlay" aria-hidden="true" />
                              <span className="write_scan_blur is_active" aria-hidden="true" />
                            </>
                          ) : null}

                          {isScanTargetPhoto &&
                          !(isPairingDrinkScanning || isPairingFoodScanning) &&
                          (isPairingDrinkScanDone || isPairingFoodScanDone) ? (
                            <span className="write_scan_blur is_fading" aria-hidden="true" />
                          ) : null}
                        </button>
                        <button
                          type="button"
                          className="write_pairing_photo_remove"
                          aria-label="사진 삭제"
                          onClick={() => handleRemovePairingPhoto(photoId)}
                        >
                          <img src={iconX} alt="" aria-hidden="true" />
                        </button>
                      </div>
                    )
                  })}

                  {pairingPhotoIds.length < MAX_PAIRING_PHOTOS ? (
                    <button
                      type="button"
                      className="write_pairing_photo_add"
                      aria-label="사진 추가"
                      onClick={() => setIsPhotoActionSheetOpen(true)}
                    >
                      <img src={iconPlus} alt="" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="write_photo_browse"
                  disabled={pairingPhotoIds.length >= MAX_PAIRING_PHOTOS}
                  onClick={handleLoadMockPhoto}
                >
                  테스트용 이미지 불러오기
                </button>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">기본 정보</h4>

                <span className="write_location_input" aria-label="위치 입력">
                  <input
                    className="write_input write_pairing_location_input"
                    value={pairingLocationSearch}
                    placeholder={pairingLocationTags.length > 0 ? pairingLocationTags.join(" · ") : "위치를 선택해주세요"}
                    onChange={(e) => {
                      setPairingLocationSearch(e.target.value)
                      if (!isPairingLocationExpanded) setIsPairingLocationExpanded(true)
                    }}
                    onFocus={() => setIsPairingLocationExpanded(true)}
                    onBlur={() => window.setTimeout(() => setIsPairingLocationExpanded(false), 150)}
                  />
                  <img src={iconCaretRight} alt="" aria-hidden="true" />
                </span>

                {isPairingLocationExpanded ? (
                  <div className="write_chip_row" aria-label="위치 키워드">
                    {filteredPairingLocationSuggestions.slice(0, 12).map((chip) => {
                      const active = pairingLocationTags.includes(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={active ? "write_chip is_active" : "write_chip"}
                          onMouseDown={(event) => event.preventDefault()}
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

              <div className="write_pairing_pick_box" aria-label="주류 및 음식 선택">
                <button
                  type="button"
                  className="write_pairing_pick_card"
                  aria-label="주류 선택"
                  onClick={() => {
                    pairingDrinkNameSnapshotRef.current = pairingDrinkName
                    const resolvedLabel = pairingDrinkTypeLabel ?? selectedDrinkType ?? SAKE_LABEL
                    const resolvedCategory = drinkCategories.find((category) => category.label === resolvedLabel)
                    setActiveDrinkCategoryId(resolvedCategory?.id ?? (drinkCategories[0]?.id ?? "sake"))
                    setActiveDrinkSubcategory(pairingDrinkSubCategory ?? null)
                    setPendingPairingDrinkTagSelection(new Set(pairingDrinkTagSelection))
                    setIsDrinkCategoryMenuOpen(false)
                    setIsPairingDrinkModalOpen(true)
                  }}
                >
                  <div className="write_pairing_pick_card_head">
                    <strong>주류 선택</strong>
                    <span className="write_pairing_pick_card_arrow" aria-hidden="true">
                      <img src={iconCaretRight} alt="" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="write_pairing_pick_card_body">
                    <div
                      className={
                        isPairingDrinkScanning
                          ? "write_pairing_pick_card_thumb is_scanning"
                          : isPairingDrinkScanDone
                            ? "write_pairing_pick_card_thumb is_scan_done"
                            : "write_pairing_pick_card_thumb"
                      }
                      aria-hidden="true"
                      style={
                        pairingDrinkThumbSrc
                          ? ({ ["--thumb-bg" as const]: `url(${pairingDrinkThumbSrc})` } as CSSProperties)
                          : undefined
                      }
                    >
                      {pairingDrinkThumbSrc ? null : <img src={iconPlus} alt="" aria-hidden="true" />}
                    </div>
                    <div
                      className={
                        isPairingDrinkScanning || (isPairingDrinkScanDone && !isPairingDrinkRevealed)
                          ? "write_pairing_pick_card_meta is_faded"
                          : "write_pairing_pick_card_meta is_revealed"
                      }
                    >
                      <div className="write_pairing_pick_card_rating" aria-label="주류 평점">
                        <img className="write_pairing_pick_card_star" src={iconStar} alt="" aria-hidden="true" />
                        <span className="write_pairing_pick_card_score">
                          {pairingDrinkRatingMeta.rating !== null ? pairingDrinkRatingMeta.rating.toFixed(1) : "--"}
                        </span>
                        <span className="write_pairing_pick_card_count">
                          ({pairingDrinkRatingMeta.reviewCount !== null ? pairingDrinkRatingMeta.reviewCount.toLocaleString("ko-KR") : "--"})
                        </span>
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        {isPairingDrinkScanning ? (
                          <motion.div
                            key="drink_scanning"
                            className="write_pairing_pick_card_content"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                          >
                            <div className="write_pairing_pick_card_title">스캔 중…</div>
                            <div className="write_pairing_pick_card_subtitle">AI가 주류를 인식하고 있어요</div>
                          </motion.div>
                        ) : isPairingDrinkScanDone && !isPairingDrinkRevealed ? (
                          <motion.div
                            key="drink_loading"
                            className="write_pairing_pick_card_content"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                          >
                            <div className="write_pairing_pick_card_title">분석 완료</div>
                            <div className="write_pairing_pick_card_subtitle">결과를 불러오는 중…</div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="drink_result"
                            className="write_pairing_pick_card_content"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={{ duration: 0.26, ease: "easeOut" }}
                          >
                            <div className="write_pairing_pick_card_title">{pairingDrinkName || "상품명"}</div>
                            <div className="write_pairing_pick_card_subtitle">
                              {pairingDrinkName
                                ? Array.from(
                                    (pairingDrinkTagSelection.size > 0
                                      ? pairingDrinkTagSelection
                                      : new Set([pairingDrinkTypeLabel, pairingDrinkSubCategory].filter(Boolean))) as Set<string>,
                                  )
                                    .slice(0, 2)
                                    .filter((value) => value.trim())
                                    .join(" · ")
                                : "주종 · 하위 카테고리"}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className="write_pairing_pick_card"
                  aria-label="음식 선택"
                  onClick={() => {
                    setPairingFoodSearch(selectedFoodCategory?.trim() ?? "")
                    setIsPairingFoodSuggestionsOpen(false)
                    setPendingFoodCategoryTags(new Set(selectedFoodCategoryTags))
                    setIsPairingFoodModalOpen(true)
                  }}
                >
                  <div className="write_pairing_pick_card_head">
                    <strong>음식 선택</strong>
                    <span className="write_pairing_pick_card_arrow" aria-hidden="true">
                      <img src={iconCaretRight} alt="" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="write_pairing_pick_card_body">
                    <div
                      className={
                        isPairingFoodScanning
                          ? "write_pairing_pick_card_thumb is_scanning"
                          : isPairingFoodScanDone
                            ? "write_pairing_pick_card_thumb is_scan_done"
                            : "write_pairing_pick_card_thumb"
                      }
                      aria-hidden="true"
                      style={
                        pairingFoodThumbSrc
                          ? ({ ["--thumb-bg" as const]: `url(${pairingFoodThumbSrc})` } as CSSProperties)
                          : undefined
                      }
                    >
                      {pairingFoodThumbSrc ? null : <img src={iconPlus} alt="" aria-hidden="true" />}
                    </div>
                    <div
                      className={
                        isPairingFoodScanning || (isPairingFoodScanDone && !isPairingFoodRevealed)
                          ? "write_pairing_pick_card_meta is_faded"
                          : "write_pairing_pick_card_meta is_revealed"
                      }
                    >
                      <div className="write_pairing_pick_card_rating" aria-label="음식 평점">
                        <img className="write_pairing_pick_card_star" src={iconStar} alt="" aria-hidden="true" />
                        <span className="write_pairing_pick_card_score">
                          {pairingFoodRatingMeta.rating !== null ? pairingFoodRatingMeta.rating.toFixed(1) : "--"}
                        </span>
                        <span className="write_pairing_pick_card_count">
                          ({pairingFoodRatingMeta.reviewCount !== null ? pairingFoodRatingMeta.reviewCount.toLocaleString("ko-KR") : "--"})
                        </span>
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        {isPairingFoodScanning ? (
                          <motion.div
                            key="food_scanning"
                            className="write_pairing_pick_card_content"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                          >
                            <div className="write_pairing_pick_card_title">스캔 중…</div>
                            <div className="write_pairing_pick_card_subtitle">AI가 음식을 인식하고 있어요</div>
                          </motion.div>
                        ) : isPairingFoodScanDone && !isPairingFoodRevealed ? (
                          <motion.div
                            key="food_loading"
                            className="write_pairing_pick_card_content"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                          >
                            <div className="write_pairing_pick_card_title">분석 완료</div>
                            <div className="write_pairing_pick_card_subtitle">결과를 불러오는 중…</div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="food_result"
                            className="write_pairing_pick_card_content"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={{ duration: 0.26, ease: "easeOut" }}
                          >
                            <div className="write_pairing_pick_card_title">{selectedFoodCategory || "음식명"}</div>
                            <div className="write_pairing_pick_card_subtitle">{selectedFoodParentCategory ?? "카테고리"}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              </div>

              {isPairingDrinkModalOpen ? (
                <div
                  className="write_modal_backdrop"
                  role="presentation"
                  onMouseDown={(event) => {
                    event.stopPropagation()
                    setIsPairingDrinkModalOpen(false)
                    setIsDrinkCategoryMenuOpen(false)
                  }}
                >
                  <div
                    className="write_modal_panel write_drink_picker_modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="주류"
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <div className="write_modal_header">
                      <h4 className="write_modal_title">주류</h4>
                      <button
                        type="button"
                        className="write_modal_close"
                        aria-label="닫기"
                        onClick={() => {
                          setIsPairingDrinkModalOpen(false)
                          setIsDrinkCategoryMenuOpen(false)
                        }}
                      >
                        <img src={iconX} alt="" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="write_modal_body write_drink_picker_body" aria-label="주류 선택 내용">
                      <div className="write_drink_picker_input_block" aria-label="주류 검색">
                        <div className="write_drink_picker_search_group" aria-label="주류 검색 및 추천">
                          <div className="write_drink_picker_input_row">
                            {pairingDrinkName.trim().length > 0 ? (
                              <span className="write_drink_picker_autocomplete_hint" aria-hidden="true">
                                {(() => {
                                  const query = pairingDrinkName.trim()
                                  const lower = query.toLowerCase()
                                  const first = filteredPairingDrinkSuggestions.find(
                                    (item) => item.label.toLowerCase().startsWith(lower) && item.label.length > query.length,
                                  )
                                  return first ? first.label : ""
                                })()}
                              </span>
                            ) : null}
                            <input
                              className="write_input write_drink_picker_input"
                              value={pairingDrinkName}
                              placeholder="술 이름을 입력하세요"
                              autoFocus
                              onChange={(e) => {
                                setPairingDrinkName(e.target.value)
                              }}
                              onKeyDown={(event) => {
                                if ((event.nativeEvent as unknown as { isComposing?: boolean }).isComposing) return
                                if (event.key !== "Enter") return
                                event.preventDefault()
                                selectPairingDrinkByQuery(pairingDrinkName)
                              }}
                              onBlur={() =>
                                window.setTimeout(() => {
                                  const q = pairingDrinkName.trim().toLowerCase()
                                  const matchesLabel = pairingDrinkSuggestions.some(({ label }) => label.toLowerCase().includes(q))
                                  const matchesCategoryOnly =
                                    !matchesLabel && pairingDrinkSuggestions.some(({ subCategory }) => subCategory.toLowerCase().includes(q))
                                  if (matchesCategoryOnly) setPairingDrinkName(pairingDrinkNameSnapshotRef.current)
                                }, 150)
                              }
                            />
                            <img className="write_drink_picker_search_icon" src={iconSearch} alt="" aria-hidden="true" />
                            {pairingDrinkName.trim().length > 0 ? (
                              <button
                                type="button"
                                className="write_drink_picker_clear"
                                aria-label="입력 지우기"
                                onClick={() => setPairingDrinkName("")}
                              >
                                <img src={iconX} alt="" aria-hidden="true" />
                              </button>
                            ) : null}
                          </div>

                          {pairingDrinkName.trim().length > 0 && inferredPairingDrinkType ? (
                            <div className="write_drink_picker_category_hint" aria-label="추천 카테고리">
                              <span className="write_drink_picker_category_hint_label">{inferredPairingDrinkType}</span>
                            </div>
                          ) : null}

                          {pairingDrinkName.trim().length > 0 && filteredPairingDrinkSuggestions.length > 0 ? (
                            <ul className="write_drink_autocomplete" role="listbox" aria-label="술 이름 추천">
                              {filteredPairingDrinkSuggestions.slice(0, 8).map(({ label, type, subCategory }) => (
                                <li key={`${type}-${label}`} role="option" aria-selected={pairingDrinkName === label}>
                                  <button
                                    type="button"
                                    className="write_drink_suggestion_item"
                                    onMouseDown={() => handlePairingDrinkSuggestionSelect(label, type)}
                                    onClick={() => {
                                      const resolvedCategory = drinkCategories.find((category) => category.label === type)
                                      setActiveDrinkCategoryId(resolvedCategory?.id ?? (drinkCategories[0]?.id ?? "sake"))
                                    }}
                                  >
                                    <span className="write_drink_suggestion_label">{label}</span>
                                    <span className="write_drink_suggestion_type">
                                      {[type, subCategory].filter(Boolean).join(" · ")}
                                    </span>
                                  </button>

                                  <div className="write_drink_suggestion_tag_row" aria-label="추천 태그">
                                    {[type, subCategory]
                                      .filter((value): value is string => Boolean(value && value.trim()))
                                      .map((tag) => {
                                        const active = pendingPairingDrinkTagSelection.has(tag)
                                        const isDisabled = !active && pendingPairingDrinkTagSelection.size >= 2
                                        return (
                                          <button
                                            key={`${label}-${tag}`}
                                            type="button"
                                            disabled={isDisabled}
                                            className={
                                              isDisabled
                                                ? active
                                                  ? "write_chip is_active is_disabled"
                                                  : "write_chip is_disabled"
                                                : active
                                                  ? "write_chip is_active"
                                                  : "write_chip"
                                            }
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() =>
                                              setPendingPairingDrinkTagSelection((prev) => {
                                                const next = new Set(prev)
                                                if (next.has(tag)) {
                                                  next.delete(tag)
                                                  return next
                                                }
                                                if (next.size >= 2) return prev
                                                next.add(tag)
                                                return next
                                              })
                                            }
                                          >
                                            {tag}
                                          </button>
                                        )
                                      })}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>

                        <div className="write_drink_picker_selected_tags" aria-label="선택된 주류 태그">
                          {pairingDrinkName.trim().length > 0 ? (
                            <div className="write_drink_picker_selected_category_tags" aria-label="선택된 주류 카테고리">
                              {[activeDrinkSubcategory, pairingDrinkTypeLabel].filter(Boolean).slice(0, 2).map((tag) => (
                                <span key={tag} className="write_drink_picker_tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          <div className="write_drink_picker_tag_meta_row" aria-label="등록할 수 있는 태그 안내">
                            <span className="write_drink_picker_tag_label">선택한 태그:</span>
                          </div>
                          <div className="write_chip_row write_drink_picker_tag_row" aria-label="선택한 태그 목록">
                            {Array.from(pendingPairingDrinkTagSelection).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="write_chip is_active write_chip_with_remove"
                                aria-label={`${tag} 삭제`}
                                onClick={() =>
                                  setPendingPairingDrinkTagSelection((prev) => {
                                    const next = new Set(prev)
                                    next.delete(tag)
                                    return next
                                  })
                                }
                              >
                                <span className="write_chip_text">{tag}</span>
                                <img className="write_chip_remove_icon" src={iconX} alt="" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {!isDrinkCategoryMenuOpen ? (
                        <div className="write_drink_picker_main" aria-label="카테고리 선택">
                          <div className="write_drink_picker_category_row" aria-label="주류 카테고리">
                            {drinkCategories.slice(0, 8).map((category) => {
                              const isActive = category.id === activeDrinkCategoryId
                              const isDimmed = category.id !== "sake"
                              const isDisabled = category.id !== "sake"
                              return (
                                <button
                                  type="button"
                                  key={category.id}
                                  disabled={isDisabled}
                                  className={
                                    isActive
                                      ? "write_drink_picker_category is_active"
                                      : isDimmed
                                        ? "write_drink_picker_category is_dimmed"
                                        : "write_drink_picker_category"
                                  }
                                  onClick={() => {
                                    if (isDisabled) return
                                    setActiveDrinkCategoryId(category.id)
                                    setSelectedDrinkType(category.label)
                                    setActiveDrinkSubcategory(null)
                                    setPendingPairingDrinkTagSelection(new Set([category.label]))
                                    setIsDrinkCategoryMenuOpen(true)
                                  }}
                                >
                                  <span className="write_drink_picker_category_thumb" aria-hidden="true" />
                                  <span className="write_drink_picker_category_label">{category.label}</span>
                                </button>
                              )
                            })}
                          </div>

                          <div className="write_drink_picker_product_grid" aria-label="추천 주류">
                            {activeDrinkCategoryId === "sake"
                              ? sakeProductsMock.slice(0, 8).map((item) => (
                                  <button
                                    type="button"
                                    key={item.id}
                                    className="write_drink_picker_product"
                                    aria-label={item.name}
                                    onClick={() => {
                                      setPairingDrinkName(item.name)
                                      setSelectedDrinkType(SAKE_LABEL)
                                      setActiveDrinkSubcategory(item.subcategory)
                                      setPairingDrinkThumbSrc(null)
                                      setIsPairingDrinkModalOpen(false)
                                      setIsDrinkCategoryMenuOpen(false)
                                    }}
                                  >
                                    <span className="write_drink_picker_product_image" aria-hidden="true" />
                                  </button>
                                ))
                              : Array.from({ length: 8 }).map((_, index) => (
                                  <div className="write_drink_picker_product is_placeholder" key={index} aria-hidden="true">
                                    <span className="write_drink_picker_product_image" aria-hidden="true" />
                                  </div>
                                ))}
                          </div>
                        </div>
                      ) : (
                        <div className="write_drink_picker_menu" aria-label="카테고리 메뉴">
                          <div className="write_drink_picker_menu_head" aria-label="카테고리 헤더">
                            <button
                              type="button"
                              className="write_drink_picker_menu_back"
                              aria-label="카테고리 목록으로"
                              onClick={() => setIsDrinkCategoryMenuOpen(false)}
                            >
                              <img src={iconCaretLeft} alt="" aria-hidden="true" />
                            </button>
                            <div className="write_drink_picker_menu_title">
                              <span>{activeDrinkCategory?.label ?? ""}</span>
                              <span className="write_drink_picker_menu_title_en">{activeDrinkCategory?.englishLabel ?? ""}</span>
                            </div>
                          </div>

                          <div className="write_drink_picker_menu_list" aria-label="하위 카테고리">
                            {activeDrinkSubcategories.map((sub) => (
                              <button
                                type="button"
                                key={sub}
                                className="write_drink_picker_subcategory"
                                onClick={() => {
                                  if (activeDrinkCategory) setSelectedDrinkType(activeDrinkCategory.label)
                                  setActiveDrinkSubcategory(sub)
                                  setPendingPairingDrinkTagSelection(
                                    new Set(
                                      [activeDrinkCategory?.label, sub].filter((value): value is string => Boolean(value && value.trim())),
                                    ),
                                  )
                                  setIsDrinkCategoryMenuOpen(false)
                                }}
                              >
                                <strong>{sub}</strong>
                                {activeDrinkSubcategoryInfo[sub] ? <p>{activeDrinkSubcategoryInfo[sub]}</p> : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="write_picker_footer" aria-label="주류 태그 적용">
                        <button
                          type="button"
                          className="write_picker_reset"
                          onClick={() => setPendingPairingDrinkTagSelection(new Set())}
                        >
                          태그 리셋
                        </button>
                        <button
                          type="button"
                          className={pendingPairingDrinkTagSelection.size > 0 ? "write_picker_apply" : "write_picker_apply is_disabled"}
                          disabled={pendingPairingDrinkTagSelection.size === 0}
                          onClick={() => {
                            setPairingDrinkTagSelection(new Set(pendingPairingDrinkTagSelection))
                            setIsPairingDrinkModalOpen(false)
                            setIsDrinkCategoryMenuOpen(false)
                          }}
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {isPairingFoodModalOpen ? (
                <div
                  className="write_modal_backdrop"
                  role="presentation"
                  onMouseDown={(event) => {
                    event.stopPropagation()
                    setIsPairingFoodModalOpen(false)
                    setIsPairingFoodSuggestionsOpen(false)
                  }}
                >
                  <div
                    className="write_modal_panel write_food_picker_modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="음식"
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <div className="write_modal_header">
                      <h4 className="write_modal_title">음식</h4>
                      <button
                        type="button"
                        className="write_modal_close"
                        aria-label="닫기"
                        onClick={() => {
                          setIsPairingFoodModalOpen(false)
                          setIsPairingFoodSuggestionsOpen(false)
                        }}
                      >
                        <img src={iconX} alt="" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="write_modal_body write_food_picker_body" aria-label="음식 선택 내용">
                      <div className="write_food_picker_search_group" aria-label="음식 검색 및 추천">
                        <div className="write_food_picker_input_row" aria-label="음식 검색">
                          <input
                            className="write_input write_food_picker_input"
                            value={pairingFoodSearch}
                            placeholder="음식명을 입력하세요"
                            autoFocus
                            onChange={(e) => setPairingFoodSearch(e.target.value)}
                            onFocus={() => setIsPairingFoodSuggestionsOpen(true)}
                          />
                          <img className="write_food_picker_search_icon" src={iconSearch} alt="" aria-hidden="true" />
                          {pairingFoodSearch.trim().length > 0 ? (
                            <button
                              type="button"
                              className="write_food_picker_clear"
                              aria-label="입력 지우기"
                              onClick={() => {
                                setPairingFoodSearch("")
                                setSelectedFoodCategory(null)
                                setSelectedFoodParentCategory(null)
                                setSelectedFoodCategoryTags(new Set())
                              }}
                            >
                              <img src={iconX} alt="" aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>

                        {isPairingFoodSuggestionsOpen && filteredFoodNameSuggestions.length > 0 ? (
                          <div className="write_food_picker_suggestions" aria-label="추천 음식">
                            {filteredFoodNameSuggestions.map((name) => (
                              <button
                                type="button"
                                key={name}
                                className="write_food_picker_suggestion_item"
                                onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                setPairingFoodSearch(name)
                                setSelectedFoodCategory(name)
                                const parentCategory = deriveFoodParentCategory(name)
                                setSelectedFoodParentCategory(parentCategory)
                                setPendingFoodCategoryTags(new Set([parentCategory]))
                                setIsPairingFoodSuggestionsOpen(false)
                              }}
                            >
                              {(() => {
                                const query = pairingFoodSearch.trim()
                                if (!query) return <span className="write_food_picker_suggestion_rest">{name}</span>
                                const lowerName = name.toLowerCase()
                                const lowerQuery = query.toLowerCase()
                                  const index = lowerName.indexOf(lowerQuery)
                                  if (index < 0) return <span className="write_food_picker_suggestion_rest">{name}</span>
                                  const before = name.slice(0, index)
                                  const match = name.slice(index, index + query.length)
                                  const after = name.slice(index + query.length)
                                  return (
                                    <span className="write_food_picker_suggestion_text">
                                      {before ? <span className="write_food_picker_suggestion_rest">{before}</span> : null}
                                      <span className="write_food_picker_suggestion_match">{match}</span>
                                      {after ? <span className="write_food_picker_suggestion_rest">{after}</span> : null}
                                    </span>
                                  )
                                })()}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="write_food_picker_category_block" aria-label="음식카테고리 선택">
                        <div className="write_picker_tag_section" aria-label="음식 태그 선택 영역">
                          <div className="write_food_picker_selected_tags" aria-label="선택한 태그">
                            <div className="write_food_picker_tag_meta_row">
                              <span className="write_food_picker_tag_label">
                                <span className="write_food_picker_required_star" aria-hidden="true">*</span> 선택한 태그:
                              </span>
                              <div className="write_chip_row write_food_picker_tag_row" aria-label="선택한 태그 목록">
                                {Array.from(pendingFoodCategoryTags).map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    className="write_chip is_active write_chip_with_remove"
                                    aria-label={`${tag} 삭제`}
                                    onClick={() =>
                                      setPendingFoodCategoryTags((prev) => {
                                        const next = new Set(prev)
                                        next.delete(tag)
                                        return next
                                      })
                                    }
                                  >
                                    <span className="write_chip_text">{tag}</span>
                                    <img className="write_chip_remove_icon" src={iconX} alt="" aria-hidden="true" />
                                  </button>
                                ))}
                              </div>
                              <span className="write_food_picker_category_counter" aria-label="선택 개수">
                                {pendingFoodCategoryTags.size}/1
                              </span>
                            </div>
                          </div>
                          <div className="write_chip_row write_food_picker_category_row" aria-label="음식 카테고리">
                            {FOOD_PARENT_CATEGORIES.map((chip) => {
                              const active = pendingFoodCategoryTags.has(chip)
                              return (
                                <button
                                  key={chip}
                                  type="button"
                                  className={active ? "write_chip is_active" : "write_chip"}
                                  onClick={() =>
                                    setPendingFoodCategoryTags((prev) => {
                                      if (prev.has(chip)) return new Set()
                                      return new Set([chip])
                                    })
                                  }
                                >
                                  {chip}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="write_picker_footer" aria-label="음식 태그 적용">
                        <button
                          type="button"
                          className="write_picker_reset"
                          onClick={() => setPendingFoodCategoryTags(new Set())}
                        >
                          태그 리셋
                        </button>
                        <button
                          type="button"
                          className={pendingFoodCategoryTags.size > 0 ? "write_picker_apply" : "write_picker_apply is_disabled"}
                          disabled={pendingFoodCategoryTags.size === 0}
                          onClick={() => {
                            setSelectedFoodCategoryTags(new Set(pendingFoodCategoryTags))
                            const first = Array.from(pendingFoodCategoryTags)[0] ?? null
                            setSelectedFoodParentCategory(first)
                            setIsPairingFoodModalOpen(false)
                            setIsPairingFoodSuggestionsOpen(false)
                          }}
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="write_pairing_taste_panel" aria-label="상황 및 취향 선택">
                <h4 className="write_section_title">상황 &amp; 취향</h4>

                <div className="write_pairing_taste_group">
                  <div className="write_pill_grid is_pairing_preview" aria-label="상황 선택">
                    {situationChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className={selectedSituation === chip ? "write_pill is_active" : "write_pill"}
                        onClick={() => setSelectedSituation((prev) => (prev === chip ? null : chip))}
                      >
                        <span className="write_pill_icon" aria-hidden="true">
                          <img src={SITUATION_ICON_BY_LABEL[chip]} alt="" aria-hidden="true" />
                        </span>
                        <span className="write_pill_text">{chip}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="write_pairing_taste_group">
                  <div className="write_pairing_taste_title">
                    맛 &amp; 느낌 <span className="write_pairing_taste_hint">(2개 선택)</span>
                  </div>
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
              </div>

              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_header">
                    <span className="write_field_label">조합 한 줄 요약</span>
                  </span>
                  <span className="write_input_wrap">
                    <input
                      className="write_input"
                      value={pairingSummary}
                      placeholder="해당 조합을 한 줄로 추천한다면?"
                      maxLength={30}
                      onChange={(e) => setPairingSummary(e.target.value)}
                    />
                    <span className="write_field_hint" aria-hidden="true">
                      {Math.min(30, pairingSummary.length)}/30
                    </span>
                  </span>
                </label>
              </div>

              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_label">상세 후기</span>
                  <span className="write_textarea_wrap">
                    <textarea
                      className="write_textarea"
                      value={pairingBody}
                      placeholder="내용을 30자 이상 입력해주세요."
                      maxLength={1000}
                      onChange={(e) => setPairingBody(e.target.value)}
                    />
                    <span className="write_field_counter" aria-label="상세 후기 글자 수">
                      {Math.min(1000, pairingBody.length)}/1000
                    </span>
                  </span>
                  {pairingBody.trim().length > 0 && pairingBody.trim().length < 30 ? (
                    <span className="write_field_error">상세 후기는 30자 이상 입력해 주세요.</span>
                  ) : null}
                </label>
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
            <button type="button" onClick={openFilePicker}>
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

      {isMockRescanModalOpen ? (
        <PurchaseConfirmModal
          title="재스캔"
          message="재스캔을 다시 하시겠어요?"
          confirmLabel="확인"
          cancelLabel="아니요"
          ariaLabel="재스캔 확인"
          onCancel={() => {
            setIsMockRescanModalOpen(false)
            setShouldAskMockRescan(false)
            setPairingPhotoIds((prev) => {
              if (prev.includes(mockPostPic01Image)) return prev
              if (prev.length >= MAX_PAIRING_PHOTOS) return prev
              return [mockPostPic01Image, ...prev].slice(0, MAX_PAIRING_PHOTOS)
            })
          }}
          onConfirm={() => {
            setIsMockRescanModalOpen(false)
            setShouldAskMockRescan(false)

            setPairingPhotoIds((prev) => {
              if (prev.includes(mockPostPic01Image)) return prev
              if (prev.length >= MAX_PAIRING_PHOTOS) return prev
              return [mockPostPic01Image, ...prev].slice(0, MAX_PAIRING_PHOTOS)
            })

            // mock_post_pic_01 → 재스캔(연출)
            setIsPairingDrinkScanning(true)
            setIsPairingFoodScanning(true)
            setIsPairingDrinkScanDone(false)
            setIsPairingFoodScanDone(false)
            setIsPairingDrinkRevealed(false)
            setIsPairingFoodRevealed(false)
            setPairingDrinkThumbSrc(null)
            setPairingFoodThumbSrc(null)
            setPairingDrinkName("")
            setSelectedFoodCategory(null)
            setSelectedFoodParentCategory(null)
            setSelectedFoodCategoryTags(new Set())
            setPairingTasteTags(new Set())
            setSelectedSituation(null)

            const drinkMock = pairingWriteDrinkMocks[0] ?? null
            const foodMock = pairingWriteFoodMocks[0] ?? null

            window.setTimeout(() => {
              if (drinkMock) {
                setPairingDrinkName(drinkMock.name)
                setSelectedDrinkType(drinkMock.parentCategory)
              } else {
                setPairingDrinkName("추천 주류")
                if (!selectedDrinkType) setSelectedDrinkType(SAKE_LABEL)
              }
              if (drinkMock) setPairingDrinkThumbSrc(drinkMock.imageSrc)
              setIsPairingDrinkScanning(false)
              setIsPairingDrinkScanDone(true)
              window.setTimeout(() => setIsPairingDrinkRevealed(true), PAIRING_SCAN_MS)

              if (foodMock) {
                setSelectedFoodCategory(foodMock.name)
                setSelectedFoodParentCategory(foodMock.parentCategory as FoodParentCategory)
                setSelectedFoodCategoryTags(new Set([foodMock.parentCategory as FoodParentCategory]))
              } else {
                setSelectedFoodCategory("추천 음식")
                setSelectedFoodParentCategory("양식")
                setSelectedFoodCategoryTags(new Set(["양식"]))
              }
              if (foodMock) setPairingFoodThumbSrc(foodMock.imageSrc)
              setIsPairingFoodScanning(false)
              setIsPairingFoodScanDone(true)
              window.setTimeout(() => setIsPairingFoodRevealed(true), PAIRING_SCAN_MS)
            }, PAIRING_SCAN_MS)
          }}
        />
      ) : null}

      {draftPrompt ? (
        <ThreeOptionModal
          title="임시저장된 글이 있어요"
          message="어떻게 진행할까요?"
          secondaryLabel="새 글 작성"
          primaryLabel="임시저장글 마저쓰기"
          cancelLabel="취소"
          onSecondary={() => {
            clearDraft()
            setDraftPrompt(null)
          }}
          onPrimary={() => {
            restoreDraft(draftPrompt)
            setDraftPrompt(null)
          }}
          onCancel={() => {
            setDraftPrompt(null)
            navigate(-1)
          }}
        />
      ) : null}

      {alertMessage ? <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} /> : null}
    </section>
  )
}
