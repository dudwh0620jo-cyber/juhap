import scanPlaceholder from "../assets/banner_label_scan.png"
import foodPlaceholder from "../assets/auto_pairing_food_01.png"
import scanMascot from "../assets/scan_ai_mascot.png"
import scanScanningMascot from "../assets/scan_ai_scanning_mascot.png"
import iconSun from "../assets/svg/sun.svg"
import iconBarcode from "../assets/svg/barcode.svg"
import iconShake from "../assets/svg/shake.svg"

export type ScanMode = "drink" | "food"

export const aiScanAssets = {
  scanPlaceholder,
  foodPlaceholder,
  scanMascot,
  scanScanningMascot,
  iconSun,
  iconBarcode,
  iconShake,
} as const

export const aiScanCopy = {
  title: "라벨 스캔",
  tabs: { drink: "🍶 술 스캔", food: "🍽️ 음식 스캔" },
  hint: {
    drink: "술병 라벨을 프레임 안에 맞춰주세요",
    food: "음식을 프레임 안에 맞춰주세요",
  },
  uploadHint: "클릭해서 사진을 선택하세요",
  upload: "사진 업로드하기",
  scan: "스캔하기",
  scanningTitle: "찾는 중...",
  scanningSubtitle: "잠시만 기다려주세요",
  scanningTipLead: "이렇게 하면 주아가 더 빠르게 찾을 수 있어요",
  scanningTips: [
    { icon: "sun", title: "밝은 곳에서\n촬영해주세요" },
    { icon: "barcode", title: "바코드가 있으면\n함께 인식돼요" },
    { icon: "shake", title: "흔들리지 않게\n정면으로 비춰주세요" },
  ],
} as const

export const aiScanRecentScans: Array<{ emoji: string; label: string }> = [
  { emoji: "🍶", label: "막걸리" },
  { emoji: "🥩", label: "삼겹살" },
  { emoji: "🍺", label: "카스" },
]
