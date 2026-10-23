import React, { useState } from "react";
import { Flame, Clock, Check, ShieldAlert, Send } from "lucide-react";
import { PUSH_STORAGE_KEY, type PushPermissionState } from "../../notifications/components/WebPushNotificationPrompt";

export const NotificationSettingsTab: React.FC = () => {
  const [permission, setPermission] = useState<PushPermissionState>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission as PushPermissionState;
    }
    return "unsupported";
  });
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const currentPerm = Notification.permission as PushPermissionState;
      const storedPref = localStorage.getItem(PUSH_STORAGE_KEY);
      return currentPerm === "granted" && storedPref !== "denied";
    }
    return false;
  });
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedDaily = localStorage.getItem("wordstreak_daily_reminder");
      return savedDaily !== null ? savedDaily === "true" : true;
    }
    return true;
  });
  const [streakAlertEnabled, setStreakAlertEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedStreak = localStorage.getItem("wordstreak_streak_alert");
      return savedStreak !== null ? savedStreak === "true" : true;
    }
    return true;
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wordstreak_reminder_time") || "20:00";
    }
    return "20:00";
  });
  const [testSent, setTestSent] = useState(false);

  const handleTogglePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (permission === "granted") {
      const nextState = !isPushEnabled;
      setIsPushEnabled(nextState);
      localStorage.setItem(PUSH_STORAGE_KEY, nextState ? "granted" : "dismissed");
    } else if (permission === "default") {
      const res = await Notification.requestPermission();
      setPermission(res as PushPermissionState);
      if (res === "granted") {
        setIsPushEnabled(true);
        localStorage.setItem(PUSH_STORAGE_KEY, "granted");
      } else {
        setIsPushEnabled(false);
        localStorage.setItem(PUSH_STORAGE_KEY, "denied");
      }
    }
  };

  const handleToggleDaily = () => {
    const next = !dailyReminderEnabled;
    setDailyReminderEnabled(next);
    localStorage.setItem("wordstreak_daily_reminder", String(next));
  };

  const handleToggleStreak = () => {
    const next = !streakAlertEnabled;
    setStreakAlertEnabled(next);
    localStorage.setItem("wordstreak_streak_alert", String(next));
  };

  const handleChangeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReminderTime(val);
    localStorage.setItem("wordstreak_reminder_time", val);
  };

  const handleSendTestNotification = () => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("WordStreak: Giờ học từ vựng!", {
        body: "Hãy dành 5 phút ôn tập hôm nay để duy trì ngọn lửa tím của bạn.",
        icon: "/favicon.svg",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Tab Header Description */}
      <div>
        <h3 className="text-base font-bold text-black font-['Nunito',sans-serif]">
          Cài đặt Thông báo & Lời nhắc
        </h3>
        <p className="text-xs text-[#737373] mt-0.5">
          Tùy chỉnh thông báo đẩy trình duyệt để không bỏ lỡ buổi học và bảo vệ chuỗi Streak ngọn lửa tím.
        </p>
      </div>

      {/* Main Push Toggle Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-black">
              Thông báo đẩy trình duyệt (Web Push)
            </span>
            {isPushEnabled ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> Đã bật
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-200 text-neutral-700">
                Chưa bật
              </span>
            )}
          </div>
          <p className="text-xs text-[#737373] max-w-md">
            Nhận thông báo trực tiếp trên trình duyệt máy tính hoặc điện thoại ngay cả khi bạn đóng tab WordStreak.
          </p>
          {permission === "denied" && (
            <p className="text-[11px] text-amber-700 flex items-center gap-1 mt-1 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Quyền thông báo đang bị chặn trong trình duyệt. Vui lòng cho phép tại biểu tượng khóa URL.</span>
            </p>
          )}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPushEnabled}
          aria-label="Bật tắt thông báo đẩy trình duyệt"
          onClick={handleTogglePush}
          disabled={permission === "denied" || permission === "unsupported"}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isPushEnabled ? "bg-black" : "bg-neutral-300"
          } ${permission === "denied" ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isPushEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Sub-Preferences */}
      <div className="space-y-3">
        {/* Daily Study Reminder */}
        <div className="p-4 rounded-xl border border-[#e5e5e5] bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-black">
                Nhắc nhở ôn tập hàng ngày
              </p>
              <p className="text-[11px] text-[#737373]">
                Thông báo khi bạn còn từ vựng đến hạn ôn tập SM-2 trong ngày.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={dailyReminderEnabled}
            aria-label="Nhắc nhở ôn tập hàng ngày"
            onClick={handleToggleDaily}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              dailyReminderEnabled ? "bg-black" : "bg-neutral-300"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                dailyReminderEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Streak Freeze Alert */}
        <div className="p-4 rounded-xl border border-[#e5e5e5] bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-black">
                Cảnh báo nguy cơ mất chuỗi ngọn lửa tím
              </p>
              <p className="text-[11px] text-[#737373]">
                Cảnh báo khẩn cấp trước 23:00 nếu chuỗi Streak của bạn sắp bị đứt gãy.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={streakAlertEnabled}
            aria-label="Cảnh báo đóng băng chuỗi ngọn lửa tím"
            onClick={handleToggleStreak}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              streakAlertEnabled ? "bg-black" : "bg-neutral-300"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                streakAlertEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Preferred Reminder Time */}
        <div className="p-4 rounded-xl border border-[#e5e5e5] bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-black">
                Thời gian nhắc nhở ưu tiên
              </p>
              <p className="text-[11px] text-[#737373]">
                Chọn mốc thời gian phù hợp với thói quen học tập buổi tối của bạn.
              </p>
            </div>
          </div>

          <input
            type="time"
            value={reminderTime}
            onChange={handleChangeTime}
            aria-label="Thời gian nhắc nhở"
            className="px-3 py-1.5 rounded-full text-xs font-mono font-medium border border-[#e5e5e5] bg-[#fafafa] text-black focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Test Notification Action */}
      {permission === "granted" && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSendTestNotification}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#e5e5e5] hover:border-black text-black bg-white transition-all cursor-pointer"
          >
            {testSent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5" />}
            <span>{testSent ? "Đã gửi thông báo thử!" : "Gửi thông báo thử nghiệm"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
