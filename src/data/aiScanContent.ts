import scanPlaceholder from "../assets/banner_label_scan.png"
import foodPlaceholder from "../assets/auto_pairing_food_01.png"
import scanMascot from "../assets/scan_ai_mascot.png"
import scanScanningMascot from "../assets/scan_ai_scanning_mascot.png"
import scanSample01 from "../assets/scan_sample_01.png"
import scanDrinkModeButton from "../assets/scan_drink_mode_button.png"
import scanFoodModeButton from "../assets/scan_food_mode_button.png"
import iconSun from "../assets/svg/sun.svg"
import iconBarcode from "../assets/svg/barcode.svg"
import iconShake from "../assets/svg/shake.svg"
import cornerRadius01 from "../assets/svg/corner_radius_01.svg"
import cornerRadius02 from "../assets/svg/corner_radius_02.svg"
import cornerRadius03 from "../assets/svg/corner_radius_03.svg"
import cornerRadius04 from "../assets/svg/corner_radius_04.svg"
import cornerRadiusP01 from "../assets/svg/corner_radius_p_01.svg"
import cornerRadiusP02 from "../assets/svg/corner_radius_p_02.svg"
import cornerRadiusP03 from "../assets/svg/corner_radius_p_03.svg"
import cornerRadiusP04 from "../assets/svg/corner_radius_p_04.svg"

export type ScanMode = "drink" | "food"

export const aiScanAssets = {
  scanPlaceholder,
  foodPlaceholder,
  scanMascot,
  scanScanningMascot,
  scanSample01,
  scanDrinkModeButton,
  scanFoodModeButton,
  iconSun,
  iconBarcode,
  iconShake,
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
  scanningTipLead: "이렇게 하면 주아가 더 빠르게 찾을 수 있어요",
  scanningTips: [
    { icon: "sun", title: "밝은 곳에서\n촬영해 주세요" },
    { icon: "barcode", title: "바코드가 있으면\n함께 인식돼요" },
    { icon: "shake", title: "흔들리지 않게\n정면으로 비춰주세요" },
  ],
} as const

export const aiScanRecentScans: Array<{ emoji: string; label: string }> = [
  { emoji: "🍶", label: "막걸리" },
  { emoji: "🍺", label: "흑맥주" },
  { emoji: "🍷", label: "카스" },
]
