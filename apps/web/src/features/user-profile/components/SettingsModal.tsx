import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Target,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";
import { userService } from "../services/userService";
import { AVATAR_PRESETS } from "../config/avatarPresets";
import { UserAvatar } from "./UserAvatar";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "profile" | "avatar" | "security";
}

const GOAL_PRESETS = [
  { value: 5, label: "5 từ", desc: "Nhẹ nhàng" },
  { value: 10, label: "10 từ", desc: "Tiêu chuẩn" },
  { value: 20, label: "20 từ", desc: "Nâng cao" },
  { value: 30, label: "30 từ", desc: "Chuyên sâu" },
  { value: 50, label: "50 từ", desc: "Đột phá" },
];

const SettingsModalContent: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "profile",
}) => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "avatar" | "security">(
    initialTab,
  );

  // Profile / Goal Tab State
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

  // Avatar Tab State
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

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Profile / Goal Update
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

  // Handle Avatar Update
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

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Vui lòng nhập mật khẩu hiện tại.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Mật khẩu mới phải có ít nhất 8 ký tự.",
      });
      return;
    }

    if (!/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordFeedback({
        type: "error",
        message: "Mật khẩu mới phải chứa ít nhất 1 chữ in hoa và 1 số.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Xác nhận mật khẩu mới không khớp.",
      });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordFeedback({
        type: "success",
        message:
          "Đổi mật khẩu thành công! Các phiên đăng nhập trên thiết bị khác đã được đăng xuất an toàn.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu.";
      setPasswordFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white border border-[#e5e5e5] shadow-2xl flex flex-col max-h-[85vh] my-auto text-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] bg-[#fafafa] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center border border-[#e9d5ff] shrink-0">
                <UserAvatar
                  avatarUrl={user?.avatarUrl}
                  username={user?.username}
                  size="sm"
                  showBorder={false}
                />
              </div>
              <div>
                <h2
                  id="settings-modal-title"
                  className="text-base font-bold text-black tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cài đặt tài khoản & Mục tiêu
                </h2>
                <p className="text-xs text-[#737373]">
                  {user?.username} • {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#737373] hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Đóng cài đặt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#f0f0f0] bg-[#fafafa]/50 px-6 gap-2 pt-1.5 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "profile"
                  ? "border-[#9333ea] text-black"
                  : "border-transparent text-[#737373] hover:text-black"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Hồ sơ & Mục tiêu</span>
            </button>

            <button
              onClick={() => setActiveTab("avatar")}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "avatar"
                  ? "border-[#9333ea] text-black"
                  : "border-transparent text-[#737373] hover:text-black"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Chọn Avatar</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "security"
                  ? "border-[#9333ea] text-black"
                  : "border-transparent text-[#737373] hover:text-black"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Bảo mật</span>
            </button>
          </div>

          {/* Scrollable Tab Body */}
          <div className="p-5 sm:p-6 overflow-y-auto min-h-0 flex-1 space-y-5 text-black text-sm">
            {/* TAB 1: PROFILE & GOAL */}
            {activeTab === "profile" && (
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
                      <UserIcon className="w-3.5 h-3.5" /> Tên người dùng
                    </div>
                    <p className="font-semibold text-black">{user?.username}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#737373] font-medium">
                      <Mail className="w-3.5 h-3.5" /> Email đăng ký
                    </div>
                    <p className="font-semibold text-black truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Daily Goal Settings */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <h3 className="font-bold text-black flex items-center gap-2 text-sm sm:text-base">
                      <TrendingUp className="w-4 h-4 text-[#9333ea]" />
                      Mục tiêu ôn tập hàng ngày (Daily Goal)
                    </h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      Số lượng thẻ từ vựng mới và đến hạn ôn tập mỗi ngày để giữ
                      ngọn lửa Streak.
                    </p>
                  </div>

                  {/* Preset Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {GOAL_PRESETS.map((preset) => {
                      const isSelected =
                        !isGoalCustom && dailyGoal === preset.value;
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
                            {preset.label}
                          </span>
                          <span className="text-[11px] text-[#737373] font-medium">
                            {preset.desc}
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
                        Tùy chỉnh số thẻ khác (1 - 100 thẻ/ngày)
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
                          thẻ mỗi ngày
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: AVATAR SELECTION */}
            {activeTab === "avatar" && (
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
                      Xem trước Avatar
                    </h4>
                    <p className="text-xs text-[#737373]">
                      Avatar này sẽ hiển thị trên Header, Bảng xếp hạng và Thống
                      kê học tập.
                    </p>
                  </div>
                </div>

                {/* Cosmos Presets Gallery */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs text-[#737373] uppercase tracking-wider">
                    Bộ sưu tập Avatar Presets
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
                    Hoặc sử dụng URL ảnh ngoài
                  </label>
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-black text-xs focus:outline-none focus:border-[#9333ea] focus:bg-white"
                  />
                  <p className="text-[11px] text-[#737373]">
                    Hỗ trợ link ảnh trực tiếp dạng JPG, PNG hoặc SVG từ
                    Unsplash, DiceBear, v.v.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD */}
            {activeTab === "security" && (
              <form
                id="security-password-form"
                onSubmit={handleChangePassword}
                className="space-y-4"
              >
                {passwordFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl flex items-start gap-3 border text-xs sm:text-sm ${
                      passwordFeedback.type === "success"
                        ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]"
                        : "bg-[#fff5f5] border-[#ff5f56]/30 text-[#dc2626]"
                    }`}
                  >
                    {passwordFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#16a34a] mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#dc2626] mt-0.5" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                {/* Current Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-black text-sm focus:outline-none focus:border-[#9333ea] focus:bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-black p-1 cursor-pointer"
                    >
                      {showCurrentPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
                      className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-black text-sm focus:outline-none focus:border-[#9333ea] focus:bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-black p-1 cursor-pointer"
                    >
                      {showNewPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-black text-sm focus:outline-none focus:border-[#9333ea] focus:bg-white"
                  />
                </div>

                {/* Security Policy Notice */}
                <div className="p-3 rounded-2xl bg-[#f3e8ff] border border-[#e9d5ff] text-xs text-[#7e22ce] flex items-start gap-2.5">
                  <Lock className="w-4 h-4 flex-shrink-0 text-[#9333ea] mt-0.5" />
                  <span>
                    <strong>Chính sách bảo mật:</strong> Khi đổi mật khẩu thành
                    công, toàn bộ các phiên đăng nhập khác của bạn sẽ được tự
                    động đăng xuất để bảo vệ an toàn tài khoản.
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* Sticky Modal Action Footer */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#f0f0f0] bg-[#fafafa] shrink-0 rounded-b-3xl">
            <div className="text-xs text-[#737373] hidden sm:block">
              {activeTab === "profile" && "Cập nhật mục tiêu học tập hàng ngày"}
              {activeTab === "avatar" && "Chọn ảnh đại diện và lưu thay đổi"}
              {activeTab === "security" &&
                "Mật khẩu bảo mật tài khoản WordStreak"}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Đóng
              </Button>

              {activeTab === "profile" && (
                <Button
                  type="submit"
                  form="profile-goal-form"
                  variant="primary"
                  size="md"
                  isLoading={isSavingGoal}
                >
                  Lưu mục tiêu
                </Button>
              )}

              {activeTab === "avatar" && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveAvatar}
                  isLoading={isSavingAvatar}
                >
                  Lưu Avatar
                </Button>
              )}

              {activeTab === "security" && (
                <Button
                  type="submit"
                  form="security-password-form"
                  variant="primary"
                  size="md"
                  isLoading={isSavingPassword}
                >
                  Cập nhật mật khẩu
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { user } = useAuthStore();
  if (!props.isOpen) return null;
  return (
    <SettingsModalContent
      key={`${user?.id || "guest"}-${props.isOpen}`}
      {...props}
    />
  );
};
