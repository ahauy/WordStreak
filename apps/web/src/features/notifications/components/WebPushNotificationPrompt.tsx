import React, { useState, useEffect } from "react";
import { Bell, Flame, X, ShieldAlert, Sparkles } from "lucide-react";

export interface WebPushNotificationPromptProps {
  onDismiss?: () => void;
  onSubscribed?: () => void;
  compact?: boolean;
}

export const PUSH_STORAGE_KEY = "wordstreak_push_preference";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export const WebPushNotificationPrompt: React.FC<WebPushNotificationPromptProps> = ({
  onDismiss,
  onSubscribed,
  compact = false,
}) => {
  const [permission, setPermission] = useState<PushPermissionState>("unsupported");
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const currentPermission = Notification.permission as PushPermissionState;
    setPermission(currentPermission);

    const storedPref = localStorage.getItem(PUSH_STORAGE_KEY);
    if (storedPref === "dismissed") {
      setIsDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);

      if (result === "granted") {
        localStorage.setItem(PUSH_STORAGE_KEY, "granted");
        // Trigger a welcoming system notification if granted
        try {
          new Notification("WordStreak đã kích hoạt thông báo!", {
            body: "Bạn sẽ nhận được nhắc nhở ôn tập hằng ngày và cảnh báo bảo vệ ngọn lửa tím.",
            icon: "/favicon.svg",
          });
        } catch {
          // Ignore notification dispatch error
        }
        onSubscribed?.();
      } else if (result === "denied") {
        localStorage.setItem(PUSH_STORAGE_KEY, "denied");
      }
    } catch {
      // Handle error gracefully
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(PUSH_STORAGE_KEY, "dismissed");
    onDismiss?.();
  };

  if (isDismissed || permission === "granted" || permission === "unsupported") {
    return null;
  }

  if (compact) {
    return (
      <div
        role="region"
        aria-label="Nhắc nhở bật thông báo đẩy"
        className="p-3.5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-black">Bật thông báo đẩy</p>
            <p className="text-[11px] text-[#737373]">
              Nhắc nhở học & cảnh báo bảo vệ Streak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Bỏ qua"
            className="p-1 rounded-full text-[#737373] hover:text-black hover:bg-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-black text-white hover:bg-[#1a1a1a] transition-all cursor-pointer whitespace-nowrap"
          >
            {isRequesting ? "Đang xử lý..." : "Bật"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Nhắc nhở bật thông báo đẩy"
      className="p-5 sm:p-6 rounded-2xl border border-[#e5e5e5] bg-[#ffffff] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative font-['Inter',sans-serif]"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
          <Flame className="w-5 h-5 fill-purple-500/20" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white">
              Web Push
            </span>
            <span className="text-xs text-[#737373] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Bảo vệ ngọn lửa tím
            </span>
          </div>
          <h3 className="font-['Nunito',sans-serif] font-bold text-sm sm:text-base text-black">
            Bật thông báo đẩy để không gián đoạn chuỗi học
          </h3>
          <p className="text-xs text-[#525252] max-w-xl leading-relaxed">
            Nhận thông báo nhắc nhở 20 phút trước khi ngày kết thúc nếu bạn chưa hoàn thành mục tiêu ôn tập, kèm cảnh báo tự động kích hoạt đóng băng chuỗi (Streak Freeze).
          </p>

          {permission === "denied" && (
            <div className="pt-1 flex items-center gap-1 text-[11px] text-amber-700 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Thông báo đang bị chặn trong trình duyệt. Vui lòng mở quyền thông báo tại cài đặt trang web.</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3.5 py-2 rounded-full text-xs font-semibold text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
        >
          Để sau
        </button>
        <button
          type="button"
          onClick={handleRequestPermission}
          disabled={isRequesting || permission === "denied"}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            permission === "denied"
              ? "bg-[#fafafa] text-[#a3a3a3] border border-[#e5e5e5] cursor-not-allowed"
              : "bg-black text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{isRequesting ? "Đang yêu cầu..." : "Bật thông báo"}</span>
        </button>
      </div>
    </div>
  );
};
