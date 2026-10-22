import React, { useState, useEffect } from "react";
import { Sparkles, Check } from "lucide-react";
import {
  getGuestPreviewState,
  clearGuestPreviewState,
} from "../../landing/utils/guestStorage";

export const GuestTransferBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const state = getGuestPreviewState();
    if (state.isCompleted && state.reviewedCards.length > 0) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    clearGuestPreviewState();
    setIsVisible(false);
  };

  return (
    <div
      role="status"
      className="mb-6 rounded-2xl border border-purple-200 bg-[#faf5ff] p-4 sm:p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-purple-100 text-[#7e22ce] shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4
              className="text-sm font-bold text-black"
              style={{ fontFamily: "var(--font-display, Nunito, sans-serif)" }}
            >
              🎉 Bạn đã hoàn thành 5 từ học thử trước khi đăng ký!
            </h4>
            <p className="mt-0.5 text-xs text-[#737373] leading-relaxed">
              Tiến độ của 5 từ vựng mẫu đã được bảo lưu thành công vào tài khoản của bạn. Chúc mừng bạn đã khởi động hành trình học tập!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleDismiss}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#262626] shadow-xs"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Đã hiểu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
