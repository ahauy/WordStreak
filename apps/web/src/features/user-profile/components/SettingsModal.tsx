import React, { useState, useEffect } from "react";
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
  const [isGoalCustom, setIsGoalCustom] = useState<boolean>(false);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
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
                className="text-lg font-bold text-white tracking-tight"
              >
                Cài đặt tài khoản & Mục tiêu
              </h2>
              <p className="text-xs text-slate-400">
                {user?.username} • {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Đóng cài đặt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/20 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "profile"
                ? "border-[#F5A623] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Hồ sơ & Mục tiêu</span>
          </button>

          <button
            onClick={() => setActiveTab("avatar")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "avatar"
                ? "border-[#F5A623] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chọn Avatar</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "security"
                ? "border-[#F5A623] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Bảo mật</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* TAB 1: PROFILE & GOAL */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveGoal} className="space-y-6">
              {goalFeedback && (
                <div
                  className={`p-4 rounded-2xl flex items-start gap-3 border text-xs sm:text-sm ${
                    goalFeedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {goalFeedback.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  )}
                  <span>{goalFeedback.message}</span>
                </div>
              )}

              {/* Account Overview (Read only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <UserIcon className="w-3.5 h-3.5" /> Tên người dùng
                  </div>
                  <p className="font-semibold text-white">{user?.username}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Mail className="w-3.5 h-3.5" /> Email đăng ký
                  </div>
                  <p className="font-semibold text-white truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Daily Goal Settings */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4 text-[#F5A623]" />
                      Mục tiêu ôn tập hàng ngày (Daily Goal)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Số lượng thẻ từ vựng mới và đến hạn ôn tập mỗi ngày để giữ
                      ngọn lửa Streak.
                    </p>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
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
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-[#F5A623]/20 border-[#F5A623] text-white shadow-lg shadow-[#F5A623]/10 font-bold scale-[1.02]"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-base font-extrabold">
                          {preset.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Goal Option */}
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="customGoalCheck"
                      checked={isGoalCustom}
                      onChange={(e) => setIsGoalCustom(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-white/20 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="customGoalCheck"
                      className="text-xs text-slate-300 cursor-pointer select-none font-medium"
                    >
                      Tùy chỉnh số thẻ khác (1 - 100 thẻ/ngày)
                    </label>
                  </div>

                  {isGoalCustom && (
                    <div className="mt-2.5 flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customGoalInput}
                        onChange={(e) => setCustomGoalInput(e.target.value)}
                        className="w-32 px-4 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold focus:outline-none focus:border-[#F5A623]"
                        placeholder="10"
                      />
                      <span className="text-xs text-slate-400">
                        thẻ mỗi ngày
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingGoal}
                >
                  Lưu thay đổi mục tiêu
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: AVATAR SELECTION */}
          {activeTab === "avatar" && (
            <div className="space-y-6">
              {avatarFeedback && (
                <div
                  className={`p-4 rounded-2xl flex items-start gap-3 border text-xs sm:text-sm ${
                    avatarFeedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {avatarFeedback.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  )}
                  <span>{avatarFeedback.message}</span>
                </div>
              )}

              {/* Current Preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <UserAvatar
                  avatarUrl={customAvatarUrl.trim() || selectedAvatar}
                  username={user?.username}
                  size="lg"
                />
                <div>
                  <h4 className="font-bold text-white">Xem trước Avatar</h4>
                  <p className="text-xs text-slate-400">
                    Avatar này sẽ hiển thị trên Header, Bảng xếp hạng và Thống
                    kê học tập.
                  </p>
                </div>
              </div>

              {/* Cosmos Presets Gallery */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                  Bộ sưu tập Cosmos Presets
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-500/20 border-[#F5A623] shadow-lg shadow-indigo-500/20 scale-[1.03]"
                            : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                        }`}
                      >
                        <UserAvatar
                          avatarUrl={preset.id}
                          size="md"
                          showBorder={false}
                        />
                        <span className="text-xs font-semibold text-white text-center">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL Input */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Hoặc sử dụng URL ảnh ngoài
                </label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#F5A623]"
                />
                <p className="text-[11px] text-slate-400">
                  Hỗ trợ link ảnh trực tiếp dạng JPG, PNG hoặc SVG từ Unsplash,
                  DiceBear, v.v.
                </p>
              </div>

              {/* Save Avatar Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveAvatar}
                  isLoading={isSavingAvatar}
                >
                  Lưu Avatar
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              {passwordFeedback && (
                <div
                  className={`p-4 rounded-2xl flex items-start gap-3 border text-xs sm:text-sm ${
                    passwordFeedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {passwordFeedback.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#F5A623] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#F5A623] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              {/* Security Policy Notice */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
                <Lock className="w-4 h-4 flex-shrink-0 text-indigo-400 mt-0.5" />
                <span>
                  <strong>Chính sách bảo mật:</strong> Khi đổi mật khẩu thành
                  công, toàn bộ các phiên đăng nhập khác của bạn trên các thiết
                  bị khác sẽ được tự động đăng xuất để bảo vệ an toàn tài khoản.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingPassword}
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
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
