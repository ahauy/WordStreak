import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User as UserIcon,
  Mail,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";
import { userService } from "../services/userService";

const GOAL_PRESETS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 30, label: "30" },
  { value: 50, label: "50" },
];

export const ProfileGoalTab: React.FC = () => {
  const { t } = useTranslation(["settings", "dashboard"]);
  const { user, updateUser } = useAuthStore();

  const [dailyGoal, setDailyGoal] = useState<number>(user?.dailyGoal || 10);
  const [isGoalCustom, setIsGoalCustom] = useState<boolean>(
    !GOAL_PRESETS.some((preset) => preset.value === (user?.dailyGoal || 10)),
  );
  const [customGoalInput, setCustomGoalInput] = useState<string>(
    String(user?.dailyGoal || 10),
  );
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalFeedback(null);

    const goalToSave = isGoalCustom ? parseInt(customGoalInput, 10) : dailyGoal;

    if (isNaN(goalToSave) || goalToSave < 1 || goalToSave > 100) {
      setGoalFeedback({
        type: "error",
        message: "Mục tiêu học tập phải từ 1 đến 100 từ mỗi ngày.",
      });
      return;
    }

    setIsSavingGoal(true);
    try {
      const updated = await userService.updateProfile({
        dailyGoal: goalToSave,
      });
      updateUser({ dailyGoal: updated.dailyGoal });
      setDailyGoal(updated.dailyGoal);
      setGoalFeedback({
        type: "success",
        message: `Đã cập nhật mục tiêu hàng ngày: ${updated.dailyGoal} từ/ngày!`,
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật mục tiêu. Vui lòng thử lại.";
      setGoalFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsSavingGoal(false);
    }
  };

  return (
    <form
      id="profile-goal-form"
      onSubmit={handleSaveGoal}
      className="space-y-5"
    >
      {goalFeedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-start gap-3 border text-xs sm:text-sm ${
            goalFeedback.type === "success"
              ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]"
              : "bg-[#fff5f5] border-[#ff5f56]/30 text-[#dc2626]"
          }`}
        >
          {goalFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#16a34a] mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#dc2626] mt-0.5" />
          )}
          <span>{goalFeedback.message}</span>
        </div>
      )}

      {/* Account Overview (Read only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#737373] font-medium">
            <UserIcon className="w-3.5 h-3.5" />{" "}
            {t("settings:profile.usernameLabel", "Username")}
          </div>
          <p className="font-semibold text-black">{user?.username}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#737373] font-medium">
            <Mail className="w-3.5 h-3.5" />{" "}
            {t("settings:profile.emailLabel", "Email Address")}
          </div>
          <p className="font-semibold text-black truncate">{user?.email}</p>
        </div>
      </div>

      {/* Daily Goal Settings */}
      <div className="space-y-2.5 pt-1">
        <div>
          <h3 className="font-bold text-black flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 text-[#9333ea]" />
            {t("settings:profile.dailyGoalTitle", "Daily Review Goal")}
          </h3>
          <p className="text-xs text-[#737373] mt-0.5">
            {t(
              "settings:profile.dailyGoalDesc",
              "Number of new and due flashcards to review each day to keep your Streak alive.",
            )}
          </p>
        </div>

        {/* Preset Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {GOAL_PRESETS.map((preset) => {
            const isSelected = !isGoalCustom && dailyGoal === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setIsGoalCustom(false);
                  setDailyGoal(preset.value);
                  setCustomGoalInput(String(preset.value));
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? "bg-[#f3e8ff] border-2 border-[#9333ea] text-black shadow-xs font-bold scale-[1.02]"
                    : "bg-[#fafafa] border-[#e5e5e5] text-[#525252] hover:border-[#d4d4d4]"
                }`}
              >
                <span className="text-sm font-bold text-black">
                  {t("dashboard:stats.cardsCount", {
                    count: preset.value,
                    defaultValue: `${preset.value} cards`,
                  })}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Goal Option */}
        <div className="pt-1">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="customGoalCheck"
              checked={isGoalCustom}
              onChange={(e) => setIsGoalCustom(e.target.checked)}
              className="w-4 h-4 rounded text-[#9333ea] border-[#d4d4d4] accent-[#9333ea] cursor-pointer"
            />
            <label
              htmlFor="customGoalCheck"
              className="text-xs text-[#525252] cursor-pointer select-none font-medium"
            >
              {t(
                "settings:profile.customGoalCheck",
                "Customize daily target (1 - 100 cards/day)",
              )}
            </label>
          </div>

          {isGoalCustom && (
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                className="w-28 px-3.5 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-black font-bold text-sm focus:outline-none focus:border-[#9333ea] focus:bg-white"
                placeholder="10"
              />
              <span className="text-xs text-[#737373]">
                {t("settings:profile.cardsPerDay", "cards per day")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSavingGoal}
        >
          {t("settings:profile.saveGoal", "Save Goal")}
        </Button>
      </div>
    </form>
  );
};
