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
  tabs: { drink: "주류", food: "음식" },
  hint: {
    drink: "주류 라벨을 프레임 안에 맞춰주세요",
    food: "음식 사진을 프레임 안에 맞춰주세요",
  },
  modeBalloon: {
    drink: "주류를 스캔하시면 페어링 추천 결과를 확인할 수 있어요.",
    food: "음식을 스캔하시면 또 다른 결과 화면을 볼 수 있어요.",
  },
  uploadHint: "갤러리에서 사진을 선택해 주세요",
  upload: "사진 업로드하기",
  scan: "스캔하기",
  scanningTitle: "찾는 중...",
  scanningSubtitle: "잠시만 기다려주세요",
  scanningTipLead: "이렇게 하면 주아가 더 정확하게 찾을 수 있어요",
  scanningTips: [
    { icon: "sun", title: "밝은 곳에서 촬영해 주세요" },
    { icon: "barcode", title: "바코드가 있으면 더욱 정확해져요" },
    { icon: "shake", title: "흔들리지 않게 정면으로 비춰주세요" },
  ],
  successMessage: ["스캔하신 주류 정보를 찾았어요!", "페어링 결과도 함께 확인해보세요"],
  failureMessage: ["스캔하신 정보를 찾을 수 없어요..", "아래 팁을 참고해 다시 촬영해 주세요."],
  detail: "상세보기",
  save: "추천 저장하기",
  retry: "다시 스캔하러 가기",
} as const

export const aiScanRecentScans: Array<{ emoji: string; label: string }> = [
  { emoji: "🍶", label: "막걸리" },
  { emoji: "🍷", label: "와인" },
  { emoji: "🍺", label: "맥주" },
]

export const aiScanResult = {
  product: {
    id: "sake-dassai-23",
    quote: "섬세한 풍미를 살려주는 투명하고 깨끗한 향",
    name: "닷사이 23",
    category: "사케 > 준마이 다이긴죠",
    origin: "일본",
    rating: "5.0",
    reviewCount: "13,422",
    specs: [
      { icon: "taste", label: "14~16도" },
      { icon: "aroma", label: "꽃, 꿀, 멜론향" },
      { icon: "finish", label: "감칠맛, 섬세함" },
    ],
  },
  pairings: [
    {
      image: "sashimi",
      title: "신선한 회의 깔끔함을 살리는 조합",
      drinkTag: "닷사이 23",
      foodTag: "흰살생선회",
    },
    {
      image: "uni",
      title: "바다 향 그대로 담은 우니 사시미",
      drinkTag: "닷사이 23",
      foodTag: "우니",
    },
    {
      image: "nabe",
      title: "은은한 국물요리와 편안한 밸런스",
      drinkTag: "닷사이 23",
      foodTag: "나베",
    },
  ],
  badPairings: [
    { icon: "mara", label: "마라" },
    { icon: "spicy", label: "매운 양념 음식" },
  ],
} as const
