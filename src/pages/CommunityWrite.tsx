import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router"
import type { CSSProperties } from "react"
import "../styles/community.css"
import CommunityWriteBasicSection from "../components/CommunityWriteBasicSection"
import CommunityWritePostForm from "../components/CommunityWritePostForm"
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
import { useCommunityPageData } from "../hooks/useCommunityPageData"
import { COMMUNITY_USER_POSTS_KEY } from "../utils/communityStorage"
import { getPairingTagsFromTitle, normalizeCommunityFeatures } from "../utils/communityPosts"
import { readUserProfile } from "../data/userProfile"
import { sakeProductsMock } from "../data/sakeProductsMock"
import { useProductDetailPageData } from "../hooks/useProductDetailPageData"
import { currentUserMock } from "../utils/usersMock"
import communityPostsRaw from "../data/communityPosts.json"
import { pairingWriteDrinkMocks, pairingWriteFoodMocks } from "../data/pairingWriteMocks"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"

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
const FOOD_PARENT_CATEGORIES = ["한식", "양식", "일식", "중식", "육류", "해산물", "스낵", "그외"] as const
type FoodParentCategory = (typeof FOOD_PARENT_CATEGORIES)[number]

// 글쓰기 선택 규칙
// - 주류 입력: 브랜드/이름 검색 → `drinkType(예: 맥주)`와 `subCategory`가 함께 노출되며, Enter로 첫 매칭 항목을 선택합니다.
// - 음식 입력: 음식명을 입력하면 상위 카테고리(한식/양식/일식/중식/육류/해산물/스낵/그외)를 자동 분류해 함께 저장합니다.
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
  const { mockProductById, defaultProduct } = useProductDetailPageData()
  const mode = getModeFromSearch(searchParams.get("mode"))
  const { popupCategoryByDrinkType, popupFeaturesByDrinkType } = useCommunityPageData()
  const isQuestionWrite = mode === "free"
  const isProductReviewWrite = location.pathname.startsWith("/product/") && location.pathname.endsWith("/write")
  const writeKind: WriteKind = isQuestionWrite ? "question" : isProductReviewWrite ? "drink-review" : "pairing-review"
  const productDetail = productId ? mockProductById[productId] ?? defaultProduct : null
  const hasCheckedDraftRef = useRef(false)
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
    if (!normalized) return "그외"

    if (/(파스타|스테이크|피자|버거|샐러드|리조또|토마토|치즈)/.test(foodName)) return "양식"
    if (/(초밥|사시미|라멘|우동|돈카츠|가라아게|오코노미야키|야끼|이자카야)/.test(foodName)) return "일식"
    if (/(짜장|짬뽕|마라|탕수육|마파|딤섬|훠궈)/.test(foodName)) return "중식"
    if (/(회|초밥|굴|새우|조개|문어|오징어|연어|해산물)/.test(foodName)) return "해산물"
    if (/(치킨|삼겹살|소고기|돼지고기|육회|갈비|스테이크|고기)/.test(foodName)) return "육류"
    if (/(감자튀김|튀김|나초|스낵|과자|칩|프라이)/.test(foodName)) return "스낵"
    if (/(김치|된장|찌개|전|국밥|비빔|불고기|떡볶이|한식|막걸리)/.test(foodName)) return "한식"

    return "그외"
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
      window.alert("이미지를 불러오지 못했습니다. 다시 시도해 주세요.")
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
          window.setTimeout(() => setIsPairingDrinkRevealed(true), 1200)

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
          window.setTimeout(() => setIsPairingFoodRevealed(true), 1200)
        }, 1200)
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

  const pairingFoodRatingMeta = useMemo(() => {
    const found = pairingWriteFoodMocks.find((mock) => mock.name === selectedFoodCategory)
    const rating = typeof found?.rating === "number" && Number.isFinite(found.rating) ? found.rating : null
    const reviewCount = typeof found?.reviewCount === "number" && Number.isFinite(found.reviewCount) ? found.reviewCount : null
    return { rating, reviewCount }
  }, [selectedFoodCategory])

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
      setPairingDrinkSuggestionsOpen(false)
      setIsPairingDrinkEditing(false)
      return true
    },
    [pairingDrinkSuggestions],
  )

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
      window.alert("임시 저장되었습니다.")
      navigate(exitPath)
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
      }

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
        window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
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

      navigate(writeKind === "drink-review" && productId ? `/product/${productId}?tab=review` : "/community?filter=review")
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
        authorId: currentUserMock.id,
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
      features: normalizeCommunityFeatures(Array.from(pairingTasteTags), 2),
      foods: selectedFoodCategory ? [selectedFoodCategory] : undefined,
      searchTags: [
        selectedDrinkType,
        selectedFoodCategory,
        selectedFoodParentCategory,
        selectedSituation,
        ...Array.from(pairingTasteTags),
        "후기",
      ].filter((v): v is string => Boolean(v)),
      pairingPriceWon: pairingPrice.trim() || undefined,
      pairingSummary: pairingSummary.trim(),
      photoIds: pairingPhotoIds.length > 0 ? pairingPhotoIds.slice(0, MAX_PAIRING_PHOTOS) : undefined,
    }

    try {
      const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
      window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
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
                    setIsPairingDrinkEditing(true)
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
                        isPairingDrinkScanning
                          ? "write_pairing_pick_card_meta is_faded is_pending_reveal"
                          : isPairingDrinkScanDone && !isPairingDrinkRevealed
                            ? "write_pairing_pick_card_meta is_pending_reveal"
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
                      <div className="write_pairing_pick_card_title">{pairingDrinkName || "상품명"}</div>
                      <div className="write_pairing_pick_card_subtitle">
                        {pairingDrinkName ? [pairingDrinkTypeLabel, pairingDrinkSubCategory].filter(Boolean).join(" · ") : "주종 · 하위 카테고리"}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className="write_pairing_pick_card"
                  aria-label="음식 선택"
                  onClick={() => setIsPairingFoodEditing(true)}
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
                        isPairingFoodScanning
                          ? "write_pairing_pick_card_meta is_faded is_pending_reveal"
                          : isPairingFoodScanDone && !isPairingFoodRevealed
                            ? "write_pairing_pick_card_meta is_pending_reveal"
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
                      <div className="write_pairing_pick_card_title">{selectedFoodCategory || "음식명"}</div>
                      <div className="write_pairing_pick_card_subtitle">{selectedFoodParentCategory ?? "카테고리"}</div>
                    </div>
                  </div>
                </button>
              </div>

              {isPairingDrinkEditing ? (
                <div className="write_section">
                  <label className="write_field">
                    <span className="write_field_label">주류 검색</span>
                    <div className="write_drink_input_wrap">
                      <input
                        className="write_input"
                        value={pairingDrinkName}
                        placeholder="술 이름을 검색하세요"
                        autoFocus
                        onChange={(e) => setPairingDrinkName(e.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return
                          event.preventDefault()
                          selectPairingDrinkByQuery(pairingDrinkName)
                        }}
                        onFocus={() => setPairingDrinkSuggestionsOpen(true)}
                        onBlur={() =>
                          window.setTimeout(() => {
                            setPairingDrinkSuggestionsOpen(false)
                            setIsPairingDrinkEditing(false)
                            const q = pairingDrinkName.trim().toLowerCase()
                            const matchesLabel = pairingDrinkSuggestions.some(({ label }) => label.toLowerCase().includes(q))
                            const matchesCategoryOnly =
                              !matchesLabel && pairingDrinkSuggestions.some(({ subCategory }) => subCategory.toLowerCase().includes(q))
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
                                <span className="write_drink_suggestion_type">{[type, subCategory].filter(Boolean).join(" · ")}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </label>
                </div>
              ) : null}

              {isPairingFoodEditing ? (
                <div className="write_section">
                  <label className="write_field">
                    <span className="write_field_label">음식 검색</span>
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
                            if (pairingFoodSearch.trim()) {
                              const foodName = pairingFoodSearch.trim()
                              setSelectedFoodCategory(foodName)
                              const parentCategory = deriveFoodParentCategory(foodName)
                              setSelectedFoodParentCategory(parentCategory)
                              setSelectedFoodCategoryTags(new Set([parentCategory]))
                            }
                            setPairingFoodSearch("")
                          }, 150)
                        }
                      />
                    </div>
                  </label>
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
                    음식카테고리 <span className="write_pairing_taste_hint">(1개 선택)</span>
                  </div>
                  <div className="write_chip_row is_pairing_preview" aria-label="음식 카테고리 선택">
                    {FOOD_PARENT_CATEGORIES.map((chip) => {
                      const active = selectedFoodCategoryTags.has(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={active ? "write_chip is_active" : "write_chip"}
                          onClick={() =>
                            setSelectedFoodCategoryTags((prev) => {
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
                    <span className="write_field_hint">{Math.min(30, pairingSummary.length)}/30</span>
                  </span>
                  <input
                    className="write_input"
                    value={pairingSummary}
                    placeholder="해당 조합을 한 줄로 추천한다면?"
                    maxLength={30}
                    onChange={(e) => setPairingSummary(e.target.value)}
                  />
                </label>
              </div>

              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_label">상세 후기</span>
                  <textarea
                    className="write_textarea"
                    value={pairingBody}
                    placeholder="내용을 30자 이상 입력해주세요."
                    maxLength={1000}
                    onChange={(e) => setPairingBody(e.target.value)}
                  />
                  {pairingBody.trim().length > 0 && pairingBody.trim().length < 30 ? (
                    <span className="write_field_error">상세 후기는 30자 이상 입력해 주세요.</span>
                  ) : null}
                  <span className="write_field_counter">{Math.min(1000, pairingBody.length)}/1000</span>
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
              window.setTimeout(() => setIsPairingDrinkRevealed(true), 1200)

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
              window.setTimeout(() => setIsPairingFoodRevealed(true), 1200)
            }, 1200)
          }}
        />
      ) : null}
    </section>
  )
}



