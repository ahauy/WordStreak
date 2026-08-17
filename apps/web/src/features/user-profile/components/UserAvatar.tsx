import React, { useState } from "react";
import {
  Sparkles,
  Flame,
  Zap,
  Shield,
  Rocket,
  Moon,
  Crown,
  Star,
  User as UserIcon,
} from "lucide-react";
import { AVATAR_PRESETS } from "../config/avatarPresets";

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
}

const sizeMap = {
  xs: {
    container: "w-7 h-7 text-xs rounded-lg",
    icon: "w-3.5 h-3.5",
    text: "text-xs",
  },
  sm: {
    container: "w-8 h-8 text-xs rounded-xl",
    icon: "w-4 h-4",
    text: "text-xs",
  },
  md: {
    container: "w-10 h-10 text-sm rounded-2xl",
    icon: "w-5 h-5",
    text: "text-sm",
  },
  lg: {
    container: "w-14 h-14 text-base rounded-2xl",
    icon: "w-7 h-7",
    text: "text-lg font-bold",
  },
  xl: {
    container: "w-20 h-20 text-xl rounded-3xl",
    icon: "w-10 h-10",
    text: "text-2xl font-black",
  },
};

const renderPresetIcon = (iconName: string, iconClass: string) => {
  switch (iconName) {
    case "sparkles":
      return <Sparkles className={iconClass} />;
    case "flame":
      return <Flame className={`${iconClass} fill-current`} />;
    case "zap":
      return <Zap className={`${iconClass} fill-current`} />;
    case "shield":
      return <Shield className={iconClass} />;
    case "rocket":
      return <Rocket className={iconClass} />;
    case "moon":
      return <Moon className={iconClass} />;
    case "crown":
      return <Crown className={`${iconClass} fill-current`} />;
    case "star":
      return <Star className={`${iconClass} fill-current`} />;
    default:
      return <UserIcon className={iconClass} />;
  }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  username = "Learner",
  size = "md",
  className = "",
  showBorder = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = sizeMap[size];
  const borderStyle = showBorder ? "border border-white/20 shadow-md" : "";

  // 1. Preset Avatar
  if (avatarUrl?.startsWith("preset:")) {
    const preset =
      AVATAR_PRESETS.find((p) => p.id === avatarUrl) || AVATAR_PRESETS[0];
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-tr ${preset.gradient} text-white ${sizeConfig.container} ${borderStyle} ${preset.glowColor} ${className}`}
        title={preset.name}
        data-testid="user-avatar-preset"
      >
        {renderPresetIcon(preset.iconName, sizeConfig.icon)}
      </div>
    );
  }

  // 2. Custom Image URL
  if (
    avatarUrl &&
    !imageError &&
    (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://"))
  ) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-slate-800 ${sizeConfig.container} ${borderStyle} ${className}`}
        data-testid="user-avatar-image"
      >
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // 3. Fallback Initial Letter
  const initial = (username?.[0] || "U").toUpperCase();
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold ${sizeConfig.text} ${sizeConfig.container} ${borderStyle} shadow-indigo-500/25 ${className}`}
      data-testid="user-avatar-initial"
    >
      {initial}
    </div>
  );
};
