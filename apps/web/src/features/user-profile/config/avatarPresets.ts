export interface AvatarPreset {
  id: string;
  name: string;
  gradient: string;
  iconName:
    | "sparkles"
    | "flame"
    | "zap"
    | "shield"
    | "rocket"
    | "moon"
    | "crown"
    | "star";
  borderColor: string;
  glowColor: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "preset:stellar-voyager",
    name: "Stellar Voyager",
    gradient: "from-indigo-600 via-indigo-500 to-purple-600",
    iconName: "sparkles",
    borderColor: "border-indigo-400",
    glowColor: "shadow-indigo-500/30",
  },
  {
    id: "preset:solar-flare",
    name: "Solar Flare",
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    iconName: "flame",
    borderColor: "border-amber-400",
    glowColor: "shadow-amber-500/30",
  },
  {
    id: "preset:quantum-bolt",
    name: "Quantum Bolt",
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    iconName: "zap",
    borderColor: "border-cyan-400",
    glowColor: "shadow-cyan-500/30",
  },
  {
    id: "preset:nebula-guardian",
    name: "Nebula Guardian",
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    iconName: "shield",
    borderColor: "border-emerald-400",
    glowColor: "shadow-emerald-500/30",
  },
  {
    id: "preset:cosmic-pioneer",
    name: "Cosmic Pioneer",
    gradient: "from-fuchsia-600 via-purple-600 to-indigo-700",
    iconName: "rocket",
    borderColor: "border-fuchsia-400",
    glowColor: "shadow-fuchsia-500/30",
  },
  {
    id: "preset:lunar-eclipse",
    name: "Lunar Eclipse",
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    iconName: "moon",
    borderColor: "border-slate-400",
    glowColor: "shadow-slate-500/30",
  },
  {
    id: "preset:astral-monarch",
    name: "Astral Monarch",
    gradient: "from-yellow-500 via-amber-500 to-red-600",
    iconName: "crown",
    borderColor: "border-yellow-400",
    glowColor: "shadow-yellow-500/30",
  },
  {
    id: "preset:supernova-star",
    name: "Supernova",
    gradient: "from-rose-500 via-pink-600 to-purple-700",
    iconName: "star",
    borderColor: "border-pink-400",
    glowColor: "shadow-pink-500/30",
  },
];
