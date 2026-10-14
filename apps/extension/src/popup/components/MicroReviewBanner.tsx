import React from "react";
import { Zap } from "lucide-react";

export interface MicroReviewBannerProps {
  dueCount: number;
  isAuthenticated: boolean;
  onStartReview: () => void;
}

export const MicroReviewBanner: React.FC<MicroReviewBannerProps> = ({
  dueCount,
  isAuthenticated,
  onStartReview,
}) => {
  if (!isAuthenticated || dueCount <= 0) {
    return null;
  }

  const reviewCount = Math.min(dueCount, 5);

  return (
    <div
      data-testid="micro-review-banner"
      style={{
        padding: "12px 14px",
        backgroundColor: "#fff7ed",
        border: "1px solid #ffedd5",
        borderRadius: "14px",
        marginBottom: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "Nunito, sans-serif",
            color: "#9a3412",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span>🔥</span> Có {dueCount} thẻ cần ôn
        </div>
        <div style={{ fontSize: "11px", color: "#c2410c" }}>
          Ôn nhanh chỉ mất 1 phút
        </div>
      </div>

      <button
        type="button"
        data-testid="start-micro-review-btn"
        aria-label={`Ôn nhanh ${reviewCount} thẻ`}
        onClick={onStartReview}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          backgroundColor: "#000000",
          color: "#ffffff",
          border: "none",
          borderRadius: "9999px",
          padding: "7px 12px",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        }}
      >
        <Zap size={13} fill="#ffffff" />
        Ôn nhanh {reviewCount} thẻ →
      </button>
    </div>
  );
};
