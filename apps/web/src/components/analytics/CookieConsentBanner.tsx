import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { analyticsService } from "../../services/analytics/analyticsService";

export const CookieConsentBanner: React.FC = () => {
  const { t } = useTranslation("common");
  const [isVisible, setIsVisible] = useState(
    () => analyticsService.getConsentStatus() === "pending"
  );

  if (!isVisible) {
    return null;
  }

  const handleAccept = () => {
    analyticsService.setConsent("accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    analyticsService.setConsent("declined");
    setIsVisible(false);
  };

  return (
    <aside
      role="region"
      aria-label={t("analytics.bannerAriaLabel", "Cookie consent banner")}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:bottom-6 sm:left-6 sm:right-auto"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fafafa] border border-[#e5e5e5] text-black">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4
              className="text-sm font-semibold text-black"
              style={{ fontFamily: "var(--font-display, Nunito, sans-serif)" }}
            >
              {t("analytics.bannerTitle", "Chúng tôi tôn trọng quyền riêng tư của bạn")}
            </h4>
            <p className="text-xs text-[#737373] leading-relaxed">
              {t(
                "analytics.bannerDescription",
                "WordStreak sử dụng dữ liệu ẩn danh để đo lường hiệu quả học tập và cải thiện thuật toán lặp lại ngắt quãng. Không theo dõi quảng cáo hay chia sẻ dữ liệu cho bên thứ ba."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#f5f5f5]">
          <button
            type="button"
            onClick={handleDecline}
            className="cursor-pointer rounded-full border border-[#e5e5e5] bg-transparent px-4 py-1.5 text-xs font-medium text-[#737373] transition-colors hover:border-[#d4d4d4] hover:text-black focus:outline-none"
          >
            {t("analytics.decline", "Từ chối")}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="cursor-pointer rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#262626] focus:outline-none shadow-xs"
          >
            {t("analytics.accept", "Chấp nhận")}
          </button>
        </div>
      </div>
    </aside>
  );
};
