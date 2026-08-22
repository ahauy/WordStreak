import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { Button } from "../../../common/components/Button";
import { userService } from "../services/userService";

export const SecurityTab: React.FC = () => {
  const { t } = useTranslation(["settings"]);

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
          {t("settings:security.currentPassword", "Current Password")}
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
          {t("settings:security.newPassword", "New Password")}
        </label>
        <div className="relative">
          <input
            type={showNewPw ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder={t(
              "settings:security.passwordReqs",
              "Minimum 8 characters, 1 uppercase, 1 number",
            )}
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
          {t("settings:security.confirmNewPassword", "Confirm New Password")}
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
          <strong>
            {t("settings:security.policyNoticeTitle", "Security Policy:")}
          </strong>{" "}
          {t(
            "settings:security.policyNotice",
            "When password is changed successfully, all other active sessions will be automatically logged out for your security.",
          )}
        </span>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSavingPassword}
        >
          {t("settings:security.updatePassword", "Update Password")}
        </Button>
      </div>
    </form>
  );
};
