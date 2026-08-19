import {
  Book,
  Sparkles,
  Code,
  Globe,
  Briefcase,
  Heart,
  Dumbbell,
  Music,
  Plane,
  Coffee,
  Lightbulb,
  Star,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface PresetColor {
  id: string;
  name: string;
  hex: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
}

export const PRESET_COLORS: PresetColor[] = [
  {
    id: "indigo",
    name: "Cosmic Indigo",
    hex: "#6366F1",
    bgLight: "#EEF2FF",
    borderLight: "#C7D2FE",
    textLight: "#4338CA",
  },
  {
    id: "violet",
    name: "Electric Violet",
    hex: "#8B5CF6",
    bgLight: "#F5F3FF",
    borderLight: "#DDD6FE",
    textLight: "#6D28D9",
  },
  {
    id: "purple",
    name: "Royal Purple",
    hex: "#9333EA",
    bgLight: "#FAF5FF",
    borderLight: "#E9D5FF",
    textLight: "#7E22CE",
  },
  {
    id: "rose",
    name: "Nebula Rose",
    hex: "#F43F5E",
    bgLight: "#FFF1F2",
    borderLight: "#FECDD3",
    textLight: "#BE123C",
  },
  {
    id: "amber",
    name: "Solar Amber",
    hex: "#F59E0B",
    bgLight: "#FFFBEB",
    borderLight: "#FDE68A",
    textLight: "#B45309",
  },
  {
    id: "emerald",
    name: "Aurora Emerald",
    hex: "#10B981",
    bgLight: "#ECFDF5",
    borderLight: "#A7F3D0",
    textLight: "#047857",
  },
  {
    id: "cyan",
    name: "Starlight Cyan",
    hex: "#06B6D4",
    bgLight: "#ECFEFF",
    borderLight: "#A5F3FC",
    textLight: "#0E7490",
  },
  {
    id: "slate",
    name: "Obsidian Slate",
    hex: "#475569",
    bgLight: "#F8FAFC",
    borderLight: "#E2E8F0",
    textLight: "#1E293B",
  },
];

export interface PresetIconItem {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const PRESET_ICONS: PresetIconItem[] = [
  { id: "Book", name: "Sách & Ngôn ngữ", icon: Book },
  { id: "Sparkles", name: "Nâng cao / Highlight", icon: Sparkles },
  { id: "Code", name: "Công nghệ & Lập trình", icon: Code },
  { id: "Globe", name: "Giao tiếp Quốc tế", icon: Globe },
  { id: "Briefcase", name: "Kinh doanh & Công sở", icon: Briefcase },
  { id: "Heart", name: "Cảm xúc & Đời sống", icon: Heart },
  { id: "Dumbbell", name: "Thể thao & Sức khỏe", icon: Dumbbell },
  { id: "Music", name: "Nghệ thuật & Âm nhạc", icon: Music },
  { id: "Plane", name: "Du lịch & Khám phá", icon: Plane },
  { id: "Coffee", name: "Hội thoại thường ngày", icon: Coffee },
  { id: "Lightbulb", name: "Tư duy & Mẹo nhớ", icon: Lightbulb },
  { id: "Star", name: "Ưu tiên & Cốt lõi", icon: Star },
];

export const getIconComponent = (iconName?: string | null): LucideIcon => {
  if (!iconName) return Layers;
  const found = PRESET_ICONS.find(
    (item) => item.id.toLowerCase() === iconName.toLowerCase(),
  );
  return found ? found.icon : Layers;
};

export const getColorTheme = (hex?: string | null): PresetColor => {
  if (!hex) return PRESET_COLORS[0];
  const found = PRESET_COLORS.find(
    (item) => item.hex.toLowerCase() === hex.toLowerCase(),
  );
  if (found) return found;

  return {
    id: "custom",
    name: "Custom",
    hex,
    bgLight: "#FAF5FF",
    borderLight: "#E5E5E5",
    textLight: hex,
  };
};
