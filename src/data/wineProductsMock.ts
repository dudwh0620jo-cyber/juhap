export type WineProductMock = {
  id: string
  categoryId: "wine"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const wineProductsMock: WineProductMock[] = [
  // 레드 와인
  { id: "wine-red-cabernet-sauvignon", categoryId: "wine", subcategory: "레드 와인", name: "까베르네 소비뇽", priceWon: 35000, tags: ["묵직한", "드라이한"], keywords: ["까베르네", "소비뇽", "레드", "탄닌", "드라이"] },
  { id: "wine-red-merlot", categoryId: "wine", subcategory: "레드 와인", name: "메를로", priceWon: 30000, tags: ["부드러운", "풍부한"], keywords: ["메를로", "레드", "바디", "부드러운"] },
  { id: "wine-red-pinot-noir", categoryId: "wine", subcategory: "레드 와인", name: "피노누아", priceWon: 45000, tags: ["상큼한", "은은한"], keywords: ["피노누아", "레드", "산미", "향"] },
  { id: "wine-red-malbec", categoryId: "wine", subcategory: "레드 와인", name: "말벡", priceWon: 40000, tags: ["묵직한", "강렬한"], keywords: ["말벡", "레드", "진한", "풍미"] },
  { id: "wine-red-shiraz", categoryId: "wine", subcategory: "레드 와인", name: "쉬라즈", priceWon: 38000, tags: ["드라이한", "풍부한"], keywords: ["쉬라즈", "레드", "스파이시", "향"] },
  { id: "wine-red-sangiovese", categoryId: "wine", subcategory: "레드 와인", name: "산지오베제", priceWon: 32000, tags: ["상큼한", "드라이한"], keywords: ["산지오베제", "레드", "산미", "드라이"] },
  { id: "wine-red-tempranillo", categoryId: "wine", subcategory: "레드 와인", name: "템프라니요", priceWon: 35000, tags: ["고소한", "부드러운"], keywords: ["템프라니요", "레드", "오크", "풍미"] },
  { id: "wine-red-nebbiolo", categoryId: "wine", subcategory: "레드 와인", name: "네비올로", priceWon: 55000, tags: ["묵직한", "풍부한"], keywords: ["네비올로", "레드", "깊은", "향미"] },
  { id: "wine-red-zinfandel", categoryId: "wine", subcategory: "레드 와인", name: "진판델", priceWon: 40000, tags: ["달콤한", "풍부한"], keywords: ["진판델", "레드", "과실향", "달콤"] },
  { id: "wine-red-grenache", categoryId: "wine", subcategory: "레드 와인", name: "그르나슈", priceWon: 33000, tags: ["부드러운", "가벼운"], keywords: ["그르나슈", "레드", "가벼운", "탄닌"] },

  // 화이트 와인
  { id: "wine-white-sauvignon-blanc", categoryId: "wine", subcategory: "화이트 와인", name: "소비뇽 블랑", priceWon: 32000, tags: ["상큼한", "깔끔한"], keywords: ["소비뇽", "블랑", "화이트", "산미", "깔끔"] },
  { id: "wine-white-chardonnay", categoryId: "wine", subcategory: "화이트 와인", name: "샤르도네", priceWon: 38000, tags: ["부드러운", "고소한"], keywords: ["샤르도네", "화이트", "바디", "고소"] },
  { id: "wine-white-riesling", categoryId: "wine", subcategory: "화이트 와인", name: "리슬링", priceWon: 35000, tags: ["달콤한", "상큼한"], keywords: ["리슬링", "화이트", "달콤", "향"] },
  { id: "wine-white-pinot-grigio", categoryId: "wine", subcategory: "화이트 와인", name: "피노그리지오", priceWon: 30000, tags: ["깔끔한", "가벼운"], keywords: ["피노그리지오", "화이트", "가벼운", "깔끔"] },
  { id: "wine-white-moscato", categoryId: "wine", subcategory: "화이트 와인", name: "모스카토", priceWon: 25000, tags: ["달콤한", "향긋한"], keywords: ["모스카토", "화이트", "과일향", "달콤"] },
  { id: "wine-white-chenin-blanc", categoryId: "wine", subcategory: "화이트 와인", name: "슈냉블랑", priceWon: 40000, tags: ["풍부한", "상큼한"], keywords: ["슈냉블랑", "화이트", "복합", "향"] },
  { id: "wine-white-gewurztraminer", categoryId: "wine", subcategory: "화이트 와인", name: "게뷔르츠트라미너", priceWon: 45000, tags: ["향긋한", "달콤한"], keywords: ["게뷔르츠트라미너", "화이트", "향신료향", "달콤"] },
  { id: "wine-white-vermentino", categoryId: "wine", subcategory: "화이트 와인", name: "베르멘티노", priceWon: 35000, tags: ["상큼한", "깔끔한"], keywords: ["베르멘티노", "화이트", "시트러스", "깔끔"] },
  { id: "wine-white-albarino", categoryId: "wine", subcategory: "화이트 와인", name: "알바리뇨", priceWon: 42000, tags: ["깔끔한", "은은한"], keywords: ["알바리뇨", "화이트", "미네랄", "은은"] },
  { id: "wine-white-viognier", categoryId: "wine", subcategory: "화이트 와인", name: "비오니에", priceWon: 38000, tags: ["향긋한", "부드러운"], keywords: ["비오니에", "화이트", "꽃향", "부드러운"] },

  // 로제 와인
  { id: "wine-rose-provence-rose", categoryId: "wine", subcategory: "로제 와인", name: "프로방스 로제", priceWon: 38000, tags: ["상큼한", "부드러운"], keywords: ["프로방스", "로제", "과실향", "상큼"] },
  { id: "wine-rose-white-zinfandel-rose", categoryId: "wine", subcategory: "로제 와인", name: "화이트 진판델 로제", priceWon: 28000, tags: ["달콤한", "가벼운"], keywords: ["화이트진판델", "로제", "달콤", "가벼운"] },
  { id: "wine-rose-rose-sparkling", categoryId: "wine", subcategory: "로제 와인", name: "로제 스파클링", priceWon: 45000, tags: ["탄산감", "상큼한"], keywords: ["로제", "스파클링", "청량", "탄산"] },
  { id: "wine-rose-garnacha-rose", categoryId: "wine", subcategory: "로제 와인", name: "가르나차 로제", priceWon: 32000, tags: ["가벼운", "상큼한"], keywords: ["가르나차", "로제", "가벼운", "상큼"] },
  { id: "wine-rose-pinot-noir-rose", categoryId: "wine", subcategory: "로제 와인", name: "피노누아 로제", priceWon: 40000, tags: ["부드러운", "은은한"], keywords: ["피노누아", "로제", "우아한", "향"] },
  { id: "wine-rose-tempranillo-rose", categoryId: "wine", subcategory: "로제 와인", name: "템프라니요 로제", priceWon: 35000, tags: ["상큼한", "드라이한"], keywords: ["템프라니요", "로제", "산미", "드라이"] },
  { id: "wine-rose-rose-moscato", categoryId: "wine", subcategory: "로제 와인", name: "로제 모스카토", priceWon: 30000, tags: ["달콤한", "향긋한"], keywords: ["로제", "모스카토", "과일향", "달콤"] },
  { id: "wine-rose-syrah-rose", categoryId: "wine", subcategory: "로제 와인", name: "시라 로제", priceWon: 38000, tags: ["풍부한", "부드러운"], keywords: ["시라", "로제", "묵직", "향"] },
  { id: "wine-rose-premium-rose", categoryId: "wine", subcategory: "로제 와인", name: "프리미엄 로제", priceWon: 50000, tags: ["깔끔한", "풍부한"], keywords: ["프리미엄", "로제", "미네랄", "깔끔"] },
  { id: "wine-rose-pet-nat-rose", categoryId: "wine", subcategory: "로제 와인", name: "펫낫 로제", priceWon: 45000, tags: ["탄산감", "트렌디한"], keywords: ["펫낫", "로제", "자연발효", "트렌디"] },

  // 스파클링 와인
  { id: "wine-sparkling-champagne", categoryId: "wine", subcategory: "스파클링 와인", name: "샴페인", priceWon: 120000, tags: ["탄산감", "깔끔한"], keywords: ["샴페인", "스파클링", "탄산", "깔끔"] },
  { id: "wine-sparkling-prosecco", categoryId: "wine", subcategory: "스파클링 와인", name: "프로세코", priceWon: 35000, tags: ["상큼한", "가벼운"], keywords: ["프로세코", "스파클링", "청량", "가벼운"] },
  { id: "wine-sparkling-cava", categoryId: "wine", subcategory: "스파클링 와인", name: "까바", priceWon: 30000, tags: ["드라이한", "깔끔한"], keywords: ["까바", "스파클링", "드라이", "깔끔"] },
  { id: "wine-sparkling-sparkling-moscato", categoryId: "wine", subcategory: "스파클링 와인", name: "스파클링 모스카토", priceWon: 28000, tags: ["달콤한", "탄산감"], keywords: ["스파클링", "모스카토", "달콤", "탄산"] },
  { id: "wine-sparkling-cremant", categoryId: "wine", subcategory: "스파클링 와인", name: "크레망", priceWon: 50000, tags: ["부드러운", "상큼한"], keywords: ["크레망", "스파클링", "부드러운", "탄산"] },
  { id: "wine-sparkling-franciacorta", categoryId: "wine", subcategory: "스파클링 와인", name: "프란치아코르타", priceWon: 80000, tags: ["풍부한", "고급스러운"], keywords: ["프란치아코르타", "스파클링", "깊은", "풍미"] },
  { id: "wine-sparkling-asti", categoryId: "wine", subcategory: "스파클링 와인", name: "아스티", priceWon: 25000, tags: ["달콤한", "향긋한"], keywords: ["아스티", "스파클링", "향긋", "단맛"] },
  { id: "wine-sparkling-blanc-de-blancs", categoryId: "wine", subcategory: "스파클링 와인", name: "블랑드블랑", priceWon: 65000, tags: ["상큼한", "깔끔한"], keywords: ["블랑드블랑", "스파클링", "산미", "깔끔"] },
  { id: "wine-sparkling-rose-champagne", categoryId: "wine", subcategory: "스파클링 와인", name: "로제 샴페인", priceWon: 90000, tags: ["부드러운", "상큼한"], keywords: ["로제", "샴페인", "스파클링", "과일향"] },
  { id: "wine-sparkling-pet-nat", categoryId: "wine", subcategory: "스파클링 와인", name: "펫낫", priceWon: 40000, tags: ["탄산감", "은은한"], keywords: ["펫낫", "스파클링", "자연", "탄산"] },

  // 내추럴 와인
  { id: "wine-natural-orange-wine", categoryId: "wine", subcategory: "내추럴 와인", name: "오렌지 와인", priceWon: 45000, tags: ["드라이한", "개성있는"], keywords: ["오렌지", "와인", "내추럴", "탄닌", "개성"] },
  { id: "wine-natural-pet-nat", categoryId: "wine", subcategory: "내추럴 와인", name: "펫낫(내추럴)", priceWon: 40000, tags: ["탄산감", "상큼한"], keywords: ["펫낫", "내추럴", "자연", "탄산"] },
  { id: "wine-natural-biodynamic", categoryId: "wine", subcategory: "내추럴 와인", name: "비오디나미 와인", priceWon: 55000, tags: ["은은한", "풍부한"], keywords: ["비오디나미", "내추럴", "자연주의", "풍부한"] },
  { id: "wine-natural-pinot-noir", categoryId: "wine", subcategory: "내추럴 와인", name: "내추럴 피노누아", priceWon: 48000, tags: ["부드러운", "상큼한"], keywords: ["내추럴", "피노누아", "가벼운", "향미"] },
  { id: "wine-natural-skin-contact", categoryId: "wine", subcategory: "내추럴 와인", name: "스킨컨택 와인", priceWon: 50000, tags: ["강렬한", "드라이한"], keywords: ["스킨컨택", "내추럴", "독특한", "풍미"] },
  { id: "wine-natural-low-intervention", categoryId: "wine", subcategory: "내추럴 와인", name: "로우인터벤션 와인", priceWon: 60000, tags: ["개성있는", "은은한"], keywords: ["로우인터벤션", "내추럴", "최소개입", "은은한"] },
  { id: "wine-natural-chardonnay", categoryId: "wine", subcategory: "내추럴 와인", name: "내추럴 샤르도네", priceWon: 42000, tags: ["상큼한", "깔끔한"], keywords: ["내추럴", "샤르도네", "산미", "깔끔"] },
  { id: "wine-natural-funky-wine", categoryId: "wine", subcategory: "내추럴 와인", name: "펑키 와인", priceWon: 58000, tags: ["강렬한", "향긋한"], keywords: ["펑키", "내추럴", "강한향", "향긋"] },
  { id: "wine-natural-organic-rose", categoryId: "wine", subcategory: "내추럴 와인", name: "오가닉 로제", priceWon: 38000, tags: ["상큼한", "부드러운"], keywords: ["오가닉", "로제", "내추럴", "과실향"] },
  { id: "wine-natural-small-batch", categoryId: "wine", subcategory: "내추럴 와인", name: "소량 생산 와인", priceWon: 70000, tags: ["풍부한", "고급스러운"], keywords: ["소량생산", "내추럴", "희소성", "풍미"] },

  // 포트 와인
  { id: "wine-port-ruby-port", categoryId: "wine", subcategory: "포트 와인", name: "루비 포트", priceWon: 45000, tags: ["달콤한", "풍부한"], keywords: ["루비", "포트", "과실향", "달콤"] },
  { id: "wine-port-tawny-port", categoryId: "wine", subcategory: "포트 와인", name: "토니 포트", priceWon: 50000, tags: ["고소한", "부드러운"], keywords: ["토니", "포트", "견과류향", "부드러운"] },
  { id: "wine-port-vintage-port", categoryId: "wine", subcategory: "포트 와인", name: "빈티지 포트", priceWon: 120000, tags: ["묵직한", "풍부한"], keywords: ["빈티지", "포트", "숙성향", "묵직"] },
  { id: "wine-port-white-port", categoryId: "wine", subcategory: "포트 와인", name: "화이트 포트", priceWon: 40000, tags: ["상큼한", "은은한"], keywords: ["화이트", "포트", "산뜻", "은은"] },
  { id: "wine-port-lbv-port", categoryId: "wine", subcategory: "포트 와인", name: "LBV 포트", priceWon: 55000, tags: ["부드러운", "달콤한"], keywords: ["LBV", "포트", "부드러운", "탄닌"] },
  { id: "wine-port-colheita-port", categoryId: "wine", subcategory: "포트 와인", name: "콜헤이타 포트", priceWon: 70000, tags: ["풍부한", "고소한"], keywords: ["콜헤이타", "포트", "오래숙성", "고소"] },
  { id: "wine-port-reserve-port", categoryId: "wine", subcategory: "포트 와인", name: "리저브 포트", priceWon: 48000, tags: ["부드러운", "풍부한"], keywords: ["리저브", "포트", "밸런스", "풍부"] },
  { id: "wine-port-port-blend", categoryId: "wine", subcategory: "포트 와인", name: "포트 블렌드", priceWon: 60000, tags: ["묵직한", "강렬한"], keywords: ["포트", "블렌드", "바디감", "강렬"] },
  { id: "wine-port-late-bottled-vintage", categoryId: "wine", subcategory: "포트 와인", name: "레이트 바틀드 빈티지", priceWon: 65000, tags: ["달콤한", "묵직한"], keywords: ["레이트바틀드", "빈티지", "포트", "과실감"] },
  { id: "wine-port-premium-port", categoryId: "wine", subcategory: "포트 와인", name: "프리미엄 포트", priceWon: 150000, tags: ["풍부한", "고급스러운"], keywords: ["프리미엄", "포트", "고급", "숙성"] },

  // 디저트 와인
  { id: "wine-dessert-icewine", categoryId: "wine", subcategory: "디저트 와인", name: "아이스와인", priceWon: 80000, tags: ["달콤한", "부드러운"], keywords: ["아이스와인", "디저트", "단맛", "부드러운"] },
  { id: "wine-dessert-sauternes", categoryId: "wine", subcategory: "디저트 와인", name: "소테른", priceWon: 120000, tags: ["달콤한", "풍부한"], keywords: ["소테른", "디저트", "꿀향", "풍부"] },
  { id: "wine-dessert-moscato-dasti", categoryId: "wine", subcategory: "디저트 와인", name: "모스카토 다스티", priceWon: 28000, tags: ["달콤한", "향긋한"], keywords: ["모스카토", "다스티", "디저트", "과일향"] },
  { id: "wine-dessert-tokaji", categoryId: "wine", subcategory: "디저트 와인", name: "토카이", priceWon: 90000, tags: ["상큼한", "달콤한"], keywords: ["토카이", "디저트", "산미", "단맛"] },
  { id: "wine-dessert-late-harvest", categoryId: "wine", subcategory: "디저트 와인", name: "레이트하베스트", priceWon: 55000, tags: ["풍부한", "달콤한"], keywords: ["레이트하베스트", "디저트", "농축", "향"] },
  { id: "wine-dessert-vin-santo", categoryId: "wine", subcategory: "디저트 와인", name: "비노산토", priceWon: 70000, tags: ["고소한", "부드러운"], keywords: ["비노산토", "디저트", "견과류향", "부드"] },
  { id: "wine-dessert-riesling-dessert", categoryId: "wine", subcategory: "디저트 와인", name: "리슬링 디저트", priceWon: 50000, tags: ["상큼한", "은은한"], keywords: ["리슬링", "디저트", "산뜻", "단맛"] },
  { id: "wine-dessert-passito", categoryId: "wine", subcategory: "디저트 와인", name: "패시토", priceWon: 65000, tags: ["묵직한", "달콤한"], keywords: ["패시토", "디저트", "건포도", "풍미"] },
  { id: "wine-dessert-sweet-sherry", categoryId: "wine", subcategory: "디저트 와인", name: "스위트 셰리", priceWon: 48000, tags: ["고소한", "강렬한"], keywords: ["스위트", "셰리", "디저트", "강렬"] },
  { id: "wine-dessert-noble-rot", categoryId: "wine", subcategory: "디저트 와인", name: "귀부 와인", priceWon: 150000, tags: ["풍부한", "고급스러운"], keywords: ["귀부", "디저트", "복합", "향미"] },
] as const
