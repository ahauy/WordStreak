export interface FlameTierInfo {
  tier: number;
  name: string;
  titleVi: string;
  daysRange: string;
  minDays: number;
  maxDays: number | null;
  nextTierDays: number | null;
  outerGradient: [string, string, string, string];
  innerGradient: [string, string, string, string];
  hotspotColor: string;
  glowColor: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  descriptionVi: string;
}

export const FLAME_TIERS: FlameTierInfo[] = [
  {
    tier: 0,
    name: "Ashen Ember",
    titleVi: "Tro Tàn Âm Ỉ",
    daysRange: "0 ngày",
    minDays: 0,
    maxDays: 0,
    nextTierDays: 1,
    outerGradient: ["#525252", "#737373", "#a3a3a3", "#d4d4d4"],
    innerGradient: ["#737373", "#a3a3a3", "#e5e5e5", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#737373]/30 via-[#a3a3a3]/20 to-transparent",
    pillBg: "bg-[#f5f5f5]",
    pillText: "text-[#525252]",
    pillBorder: "border-[#e5e5e5]",
    descriptionVi:
      "Ngọn lửa đang ngủ say. Hãy hoàn thành 1 bài ôn tập để nhen nhóm lại tia lửa đầu tiên!",
  },
  {
    tier: 1,
    name: "Violet Spark",
    titleVi: "Tia Lửa Tím",
    daysRange: "1 – 6 ngày",
    minDays: 1,
    maxDays: 6,
    nextTierDays: 7,
    outerGradient: ["#581c87", "#7e22ce", "#9333ea", "#c084fc"],
    innerGradient: ["#9333ea", "#c084fc", "#e9d5ff", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#7e22ce]/40 via-[#9333ea]/30 to-[#c084fc]/20",
    pillBg: "bg-[#f3e8ff]",
    pillText: "text-[#7e22ce]",
    pillBorder: "border-[#e9d5ff]",
    descriptionVi:
      "Tia lửa tím dịu êm khởi đầu cho thói quen rèn luyện trí nhớ.",
  },
  {
    tier: 2,
    name: "Azure Blaze",
    titleVi: "Lửa Lam Plasma",
    daysRange: "7 – 14 ngày",
    minDays: 7,
    maxDays: 14,
    nextTierDays: 15,
    outerGradient: ["#0369a1", "#0284c7", "#06b6d4", "#38bdf8"],
    innerGradient: ["#0284c7", "#38bdf8", "#bae6fd", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#0284c7]/40 via-[#06b6d4]/30 to-[#38bdf8]/20",
    pillBg: "bg-[#e0f2fe]",
    pillText: "text-[#0284c7]",
    pillBorder: "border-[#bae6fd]",
    descriptionVi:
      "Vượt mốc 1 tuần! Năng lượng plasma xanh lam bùng cháy bền vững.",
  },
  {
    tier: 3,
    name: "Emerald Flame",
    titleVi: "Lửa Lục Bảo",
    daysRange: "15 – 29 ngày",
    minDays: 15,
    maxDays: 29,
    nextTierDays: 30,
    outerGradient: ["#047857", "#059669", "#10b981", "#34d399"],
    innerGradient: ["#059669", "#10b981", "#a7f3d0", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#047857]/40 via-[#10b981]/30 to-[#34d399]/20",
    pillBg: "bg-[#ecfdf5]",
    pillText: "text-[#059669]",
    pillBorder: "border-[#a7f3d0]",
    descriptionVi:
      "Nửa tháng liên tục! Trí nhớ trung hạn bắt đầu được củng cố vững chắc.",
  },
  {
    tier: 4,
    name: "Royal Fusion",
    titleVi: "Lửa Tím Hoàng Gia",
    daysRange: "30 – 59 ngày",
    minDays: 30,
    maxDays: 59,
    nextTierDays: 60,
    outerGradient: ["#4c1d95", "#6b21a8", "#9333ea", "#d8b4fe"],
    innerGradient: ["#7e22ce", "#a855f7", "#f3e8ff", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#4c1d95]/40 via-[#9333ea]/35 to-[#d8b4fe]/25",
    pillBg: "bg-[#f3e8ff]",
    pillText: "text-[#6b21a8]",
    pillBorder: "border-[#d8b4fe]",
    descriptionVi:
      "Linh vật WordStreak signature! Hào quang tím hoàng gia sau 1 tháng kiên định.",
  },
  {
    tier: 5,
    name: "Solar Gold",
    titleVi: "Lửa Thái Dương",
    daysRange: "60 – 99 ngày",
    minDays: 60,
    maxDays: 99,
    nextTierDays: 100,
    outerGradient: ["#b45309", "#d97706", "#f59e0b", "#fde047"],
    innerGradient: ["#d97706", "#f59e0b", "#fef08a", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#b45309]/40 via-[#f59e0b]/35 to-[#fde047]/25",
    pillBg: "bg-[#fefce8]",
    pillText: "text-[#b45309]",
    pillBorder: "border-[#fef08a]",
    descriptionVi:
      "Hơn 2 tháng kiên trì! Ánh sáng thái dương hoàng kim rực rỡ.",
  },
  {
    tier: 6,
    name: "Crimson Nova",
    titleVi: "Lửa Hồng Ngọc",
    daysRange: "100 – 199 ngày",
    minDays: 100,
    maxDays: 199,
    nextTierDays: 200,
    outerGradient: ["#9f1239", "#be123c", "#e11d48", "#fda4af"],
    innerGradient: ["#e11d48", "#f43f5e", "#fecdd3", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#9f1239]/40 via-[#e11d48]/35 to-[#fda4af]/25",
    pillBg: "bg-[#fff1f2]",
    pillText: "text-[#be123c]",
    pillBorder: "border-[#fecdd3]",
    descriptionVi:
      "Cột mốc 100 ngày phi thường! Ngọn lửa hồng ngọc siêu tân tinh bừng cháy.",
  },
  {
    tier: 7,
    name: "Cosmic Void",
    titleVi: "Lửa Tinh Vân",
    daysRange: "200 – 364 ngày",
    minDays: 200,
    maxDays: 364,
    nextTierDays: 365,
    outerGradient: ["#312e81", "#3730a3", "#4f46e5", "#a5b4fc"],
    innerGradient: ["#4338ca", "#6366f1", "#c7d2fe", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#312e81]/40 via-[#4f46e5]/35 to-[#a5b4fc]/25",
    pillBg: "bg-[#eef2ff]",
    pillText: "text-[#3730a3]",
    pillBorder: "border-[#c7d2fe]",
    descriptionVi:
      "Hơn nửa năm không gián đoạn! Năng lượng tinh vân vũ trụ huyền ảo.",
  },
  {
    tier: 8,
    name: "Celestial Prismatic",
    titleVi: "Lửa Kim Cương Bất Tử",
    daysRange: "365+ ngày",
    minDays: 365,
    maxDays: null,
    nextTierDays: null,
    outerGradient: ["#0284c7", "#7c3aed", "#db2777", "#fbbf24"],
    innerGradient: ["#6366f1", "#ec4899", "#fef08a", "#ffffff"],
    hotspotColor: "#ffffff",
    glowColor: "from-[#38bdf8]/40 via-[#c084fc]/40 to-[#f472b6]/30",
    pillBg: "bg-gradient-to-r from-[#f0f9ff] via-[#fdf4ff] to-[#fffbeb]",
    pillText: "text-[#4338ca]",
    pillBorder: "border-[#e0e7ff]",
    descriptionVi:
      "Kỷ lục 1 năm trở lên! Ngọn lửa bất tử tỏa hào quang kim cương đa sắc.",
  },
];

export const REAL_FIRE_TIER: FlameTierInfo = {
  tier: 99,
  name: "Real Campfire Blaze",
  titleVi: "Lửa Củi Đỏ Cam Tự Nhiên",
  daysRange: "Đang nạp củi gỗ",
  minDays: 0,
  maxDays: null,
  nextTierDays: null,
  outerGradient: ["#991b1b", "#dc2626", "#ea580c", "#facc15"], // Đỏ sẫm -> Đỏ tươi -> Cam lửa rực -> Vàng tươi
  innerGradient: ["#ea580c", "#f97316", "#fef08a", "#ffffff"], // Cam tươi -> Vàng cam -> Vàng kem -> Lõi trắng nóng
  hotspotColor: "#ffffff",
  glowColor: "from-[#dc2626]/40 via-[#ea580c]/30 to-[#facc15]/20",
  pillBg: "bg-[#fff7ed]",
  pillText: "text-[#c2410c]",
  pillBorder: "border-[#ffedd5]",
  descriptionVi:
    "Ngọn lửa củi đỏ cam tự nhiên bùng cháy dữ dội khi hấp thụ củi gỗ!",
};

export const getFlameTier = (streakDays: number): FlameTierInfo => {
  if (streakDays <= 0) return FLAME_TIERS[0];
  if (streakDays >= 365) return FLAME_TIERS[8];
  const found = FLAME_TIERS.find(
    (t) =>
      streakDays >= t.minDays &&
      (t.maxDays === null || streakDays <= t.maxDays),
  );
  return found || FLAME_TIERS[1];
};
