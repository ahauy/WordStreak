import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";
import { userService } from "../services/userService";
import { AVATAR_PRESETS } from "../config/avatarPresets";
import { UserAvatar } from "./UserAvatar";

export const AvatarTab: React.FC = () => {
  const { t } = useTranslation(["settings"]);
  const { user, updateUser } = useAuthStore();

  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user?.avatarUrl || "preset:stellar-voyager",
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(
    user?.avatarUrl?.startsWith("http") ? user.avatarUrl : "",
  );
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSaveAvatar = async () => {
    setAvatarFeedback(null);
    const finalAvatar = customAvatarUrl.trim() || selectedAvatar;

    if (
      customAvatarUrl.trim() &&
      !customAvatarUrl.startsWith("http://") &&
      !customAvatarUrl.startsWith("https://")
    ) {
      setAvatarFeedback({
        type: "error",
        message: "URL avatar phải bắt đầu bằng http:// hoặc https://",
      });
      return;
    }

    setIsSavingAvatar(true);
    try {
      const updated = await userService.updateProfile({
        avatarUrl: finalAvatar,
      });
      updateUser({ avatarUrl: updated.avatarUrl });
      setAvatarFeedback({
        type: "success",
        message: "Đã cập nhật Avatar thành công!",
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể lưu Avatar. Vui lòng thử lại.";
      setAvatarFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <div className="space-y-4">
      {avatarFeedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-start gap-3 border text-xs sm:text-sm ${
            avatarFeedback.type === "success"
              ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]"
              : "bg-[#fff5f5] border-[#ff5f56]/30 text-[#dc2626]"
          }`}
        >
          {avatarFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#16a34a] mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#dc2626] mt-0.5" />
          )}
          <span>{avatarFeedback.message}</span>
        </div>
      )}

      {/* Current Preview */}
      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
        <UserAvatar
          avatarUrl={customAvatarUrl.trim() || selectedAvatar}
          username={user?.username}
          size="md"
        />
        <div>
          <h4 className="font-bold text-sm text-black">
            {t("settings:avatar.title", "Avatar Preview")}
          </h4>
          <p className="text-xs text-[#737373]">
            {t(
              "settings:avatar.desc",
              "This avatar will appear on your Header, Leaderboards, and Learning Statistics.",
            )}
          </p>
        </div>
      </div>

      {/* Cosmos Presets Gallery */}
      <div className="space-y-2">
        <h4 className="font-semibold text-xs text-[#737373] uppercase tracking-wider">
          {t("settings:avatar.presetGallery", "Avatar Presets Gallery")}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected =
              !customAvatarUrl.trim() && selectedAvatar === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedAvatar(preset.id);
                  setCustomAvatarUrl("");
                }}
                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#f3e8ff] border-2 border-[#9333ea] shadow-xs scale-[1.02]"
                    : "bg-[#fafafa] border-[#e5e5e5] hover:border-[#d4d4d4]"
                }`}
              >
                <UserAvatar
                  avatarUrl={preset.id}
                  size="md"
                  showBorder={false}
                />
                <span className="text-xs font-semibold text-black text-center truncate w-full">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Image URL Input */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider block">
          {t("settings:avatar.customUrlLabel", "Or use an external image URL")}
        </label>
        <input
          type="url"
          value={customAvatarUrl}
          onChange={(e) => setCustomAvatarUrl(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-black text-xs focus:outline-none focus:border-[#9333ea] focus:bg-white"
        />
        <p className="text-[11px] text-[#737373]">
          {t(
            "settings:avatar.customUrlHint",
            "Supports direct image links in JPG, PNG, or SVG format from Unsplash, DiceBear, etc.",
          )}
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSaveAvatar}
          isLoading={isSavingAvatar}
        >
          {t("settings:avatar.save", "Save Avatar")}
        </Button>
      </div>
    </div>
  );
};
