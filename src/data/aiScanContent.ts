import scanPlaceholder from "../assets/banner_label_scan.png"
import foodPlaceholder from "../assets/auto_pairing_food_01.png"
import scanMascot from "../assets/scan_ai_mascot.png"
import scanMascotGotit from "../assets/scan_ai_mascot_gotit.png"
import scanMascotSad from "../assets/scan_ai_mascot_sad.png"
import scanScanningMascot from "../assets/scan_ai_scanning_mascot.png"
import scanSample01 from "../assets/scan_sample_01.png"
import scanDrinkModeButton from "../assets/scan_drink_mode_button.png"
import scanFoodModeButton from "../assets/scan_food_mode_button.png"
import productDassai23 from "../assets/product_dassai_23.png"
import tasteIcon from "../assets/svg/scan_fd_product_taste_rows_taste.svg"
import aromaIcon from "../assets/svg/scan__fd_product_taste_rows_aroma.svg"
import finishIcon from "../assets/svg/scan_fd_product_taste_rows_finish.svg"
import pairingSashimi from "../assets/scan_ai_result_sushi.png"
import pairingUni from "../assets/scan_ai_result_uni.png"
import pairingNabe from "../assets/scan_ai_result_nabe.png"
import iconTips from "../assets/svg/icon-park-outline_tips.svg"
import iconSun from "../assets/svg/sun.svg"
import iconBarcode from "../assets/svg/barcode.svg"
import iconShake from "../assets/svg/shake.svg"
import iconMara from "../assets/icon_mara.png"
import iconSpicy from "../assets/icon_spicy.png"
import cornerRadius01 from "../assets/svg/corner_radius_01.svg"
import cornerRadius02 from "../assets/svg/corner_radius_02.svg"
import cornerRadius03 from "../assets/svg/corner_radius_03.svg"
import cornerRadius04 from "../assets/svg/corner_radius_04.svg"
import cornerRadiusP01 from "../assets/svg/corner_radius_p_01.svg"
import cornerRadiusP02 from "../assets/svg/corner_radius_p_02.svg"
import cornerRadiusP03 from "../assets/svg/corner_radius_p_03.svg"
import cornerRadiusP04 from "../assets/svg/corner_radius_p_04.svg"

export type ScanMode = "drink" | "food"
export type AiScanStatus = "ready" | "scanning" | "success" | "failure"

export const aiScanAssets = {
  scanPlaceholder,
  foodPlaceholder,
  scanMascot,
  scanMascotGotit,
  scanMascotSad,
  scanScanningMascot,
  scanSample01,
  scanDrinkModeButton,
  scanFoodModeButton,
  productDassai23,
  pairingSashimi,
  pairingUni,
  pairingNabe,
  tasteIcon,
  aromaIcon,
  finishIcon,
  iconTips,
  iconSun,
  iconBarcode,
  iconShake,
  iconMara,
  iconSpicy,
  cornerRadius01,
  cornerRadius02,
  cornerRadius03,
  cornerRadius04,
  cornerRadiusP01,
  cornerRadiusP02,
  cornerRadiusP03,
  cornerRadiusP04,
} as const

export const aiScanCopy = {
  title: "AI 라벨 스캔",
  tabs: { drink: "술", food: "음식" },
  hint: {
    drink: "술 라벨을 프레임 안에 맞춰주세요",
    food: "음식 라벨을 프레임 안에 맞춰주세요",
  },
  uploadHint: "터치해서 사진을 선택해주세요",
  upload: "사진 업로드하기",
  scan: "스캔하기",
  scanningTitle: "찾는 중...",
  scanningSubtitle: "잠시만 기다려주세요",
  scanningTipLead: "이렇게 하면 주아가 더 정확하게 찾을 수 있어요",
  scanningTips: [
    { icon: "sun", title: "밝은 곳에서\n촬영해 주세요" },
    { icon: "barcode", title: "바코드가 있으면\n함께 인식돼요" },
    { icon: "shake", title: "흔들리지 않도록\n정면을 비춰주세요" },
  ],
  successMessage: ["스캔하신 술의 정보를 찾았어요!", "페어링 팁과 함께 결과를 확인하세요."],
  failureMessage: ["스캔하신 정보를 찾을 수 없어요...", "아래 팁을 참고해 다시 촬영해주세요."],
  detail: "술 상세보기",
  save: "술 저장하기",
  retry: "다시 스캔하러 가기",
} as const

export const aiScanRecentScans: Array<{ emoji: string; label: string }> = [
  { emoji: "🍶", label: "막걸리" },
  { emoji: "🍺", label: "흑맥주" },
  { emoji: "🍷", label: "카스" },
]

export const aiScanResult = {
  product: {
    id: "sake-dassai-23",
    quote: "무겁게 남지 않는 투명한 깔끔함",
    name: "닷사이23",
    category: "사케 > 준마이 다이긴죠",
    origin: "일본",
    rating: "5.0",
    reviewCount: "13,422",
    specs: [
      { icon: "taste", label: "14~16도" },
      { icon: "aroma", label: "꽃, 꿀, 은은한" },
      { icon: "finish", label: "감칠맛, 섬세한" },
    ],
  },
  pairings: [
    {
      image: "sashimi",
      title: "숙성회에 깔끔한 사케 조합",
      drinkTag: "닷사이 23",
      foodTag: "숙성회",
    },
    {
      image: "uni",
      title: "바다 향 그대로 살리는 화사함",
      drinkTag: "닷사이 23",
      foodTag: "우니",
    },
    {
      image: "nabe",
      title: "뜨끈한 국물 시원한 한 모금",
      drinkTag: "닷사이 23",
      foodTag: "나베",
    },
  ],
  badPairings: [
    { icon: "mara", label: "마라" },
    { icon: "spicy", label: "향신료 강한 음식" },
  ],
} as const
