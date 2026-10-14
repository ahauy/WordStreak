import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { SrsRating } from "@wordstreak/shared-types";
import type { DueCardItem } from "@wordstreak/shared-types";
import { MicroCard, playCardAudio } from "./MicroCard";
import { WEB_APP_URL } from "../../shared/constants";

export interface MicroReviewSessionProps {
  onExit: () => void;
  streak?: number;
  initialCards?: DueCardItem[];
}

type SessionStatus = "loading" | "reviewing" | "empty" | "complete" | "error";

export const MicroReviewSession: React.FC<MicroReviewSessionProps> = ({
  onExit,
  streak = 0,
  initialCards,
}) => {
  const [cards, setCards] = useState<DueCardItem[]>(initialCards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [status, setStatus] = useState<SessionStatus>(
    initialCards ? (initialCards.length > 0 ? "reviewing" : "empty") : "loading",
  );
  const [reviewedCount, setReviewedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCards = useCallback(() => {
    setStatus("loading");
    setErrorMessage(null);

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        { type: "FETCH_DUE_CARDS", payload: { limit: 5 } },
        (res) => {
          if (res?.success) {
            const dueCards: DueCardItem[] = res.data || [];
            if (dueCards.length > 0) {
              setCards(dueCards);
              setCurrentIndex(0);
              setIsFlipped(false);
              setStatus("reviewing");
            } else {
              setStatus("empty");
            }
          } else {
            setErrorMessage(res?.error || "Không thể tải danh sách thẻ đến hạn.");
            setStatus("error");
          }
        },
      );
    } else {
      // Non-chrome fallback environment
      setStatus("empty");
    }
  }, []);

  useEffect(() => {
    if (!initialCards) {
      fetchCards();
    }
  }, [initialCards, fetchCards]);

  const handleRateCard = useCallback(
    (rating: SrsRating) => {
      const currentCard = cards[currentIndex];
      if (!currentCard) return;

      // Optimistic submission to background service worker
      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: "SUBMIT_MICRO_REVIEW",
          payload: {
            cardId: currentCard.cardId || currentCard.id,
            rating,
          },
        });
      }

      setReviewedCount((prev) => prev + 1);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setStatus("complete");
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            type: "REFRESH_BADGE",
            payload: { immediate: true },
          });
        }
      }
    },
    [cards, currentIndex],
  );

  // Global hotkeys handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space" || e.key === " ") {
        if (status === "reviewing" && !isFlipped) {
          e.preventDefault();
          setIsFlipped(true);
        }
        return;
      }

      if (e.key === "r" || e.key === "R") {
        if (status === "reviewing" && cards[currentIndex]) {
          e.preventDefault();
          void playCardAudio(
            cards[currentIndex].word,
            cards[currentIndex].audioUrl,
          );
        }
        return;
      }

      if (["1", "2", "3", "4"].includes(e.key)) {
        if (status === "reviewing" && isFlipped) {
          e.preventDefault();
          const ratingMap: Record<string, SrsRating> = {
            "1": SrsRating.AGAIN,
            "2": SrsRating.HARD,
            "3": SrsRating.GOOD,
            "4": SrsRating.EASY,
          };
          const rating = ratingMap[e.key];
          if (rating) {
            handleRateCard(rating);
          }
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isFlipped, cards, currentIndex, handleRateCard]);

  const handleOpenWebApp = () => {
    const url = `${WEB_APP_URL}/dashboard`;
    if (typeof chrome !== "undefined" && chrome.tabs?.create) {
      chrome.tabs.create({ url });
    } else if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  // 1. Loading State
  if (status === "loading") {
    return (
      <div
        data-testid="micro-review-loading"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "360px",
          gap: "12px",
        }}
      >
        <Loader2 size={28} className="animate-spin" color="#863bff" />
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          Đang tải thẻ cần ôn...
        </span>
      </div>
    );
  }

  // 2. Empty State
  if (status === "empty") {
    return (
      <div
        data-testid="micro-review-empty"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "360px",
          textAlign: "center",
          padding: "24px 16px",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 800,
            fontFamily: "Nunito, sans-serif",
            color: "#111827",
            marginBottom: "6px",
          }}
        >
          Không còn thẻ nào cần ôn hôm nay
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "20px",
            lineHeight: 1.4,
          }}
        >
          Bạn đã ôn tập toàn bộ từ vựng đến hạn. Hãy tiếp tục lưu từ mới hoặc quay lại sau!
        </div>
        <button
          type="button"
          data-testid="empty-exit-btn"
          onClick={onExit}
          style={{
            backgroundColor: "#000000",
            color: "#ffffff",
            border: "none",
            borderRadius: "9999px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Quay lại trang chính
        </button>
      </div>
    );
  }

  // 3. Error State
  if (status === "error") {
    return (
      <div
        data-testid="micro-review-error"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "360px",
          textAlign: "center",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#ef4444",
            marginBottom: "8px",
          }}
        >
          Đã có lỗi xảy ra
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "18px" }}>
          {errorMessage || "Không thể tải danh sách thẻ đến hạn."}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={fetchCards}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#f5f3ff",
              color: "#863bff",
              border: "1px solid #ede9fe",
              borderRadius: "9999px",
              padding: "7px 14px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} />
            Thử lại
          </button>
          <button
            type="button"
            onClick={onExit}
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "9999px",
              padding: "7px 14px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // 4. Completion State
  if (status === "complete") {
    return (
      <div
        data-testid="micro-review-completion"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "360px",
          textAlign: "center",
          padding: "20px 14px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#ecfdf5",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >
          <CheckCircle2 size={32} />
        </div>

        <div
          data-testid="completion-title"
          style={{
            fontSize: "17px",
            fontWeight: 800,
            fontFamily: "Nunito, sans-serif",
            color: "#111827",
            marginBottom: "6px",
          }}
        >
          🎉 Hoàn thành phiên ôn nhanh!
        </div>

        <div
          data-testid="completion-stats"
          style={{
            fontSize: "13px",
            color: "#4b5563",
            marginBottom: "16px",
            lineHeight: 1.5,
          }}
        >
          <div>
            Đã ôn tập <strong>{reviewedCount}</strong> thẻ thành công.
          </div>
          {streak > 0 && (
            <div style={{ marginTop: "4px", color: "#ea580c", fontWeight: 700 }}>
              Chuỗi học hiện tại: {streak} ngày 🔥
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          <button
            type="button"
            data-testid="open-webapp-btn"
            onClick={handleOpenWebApp}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              backgroundColor: "#863bff",
              color: "#ffffff",
              border: "none",
              borderRadius: "9999px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
            }}
          >
            <ExternalLink size={15} />
            🚀 Mở app để học tiếp
          </button>

          <button
            type="button"
            data-testid="completion-finish-btn"
            onClick={onExit}
            style={{
              width: "100%",
              backgroundColor: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: "9999px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }

  // 5. Active Review State
  const currentCard = cards[currentIndex];
  const progressPercent =
    cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  return (
    <div
      data-testid="micro-review-session"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "360px",
      }}
    >
      {/* Session Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <button
          type="button"
          data-testid="review-back-btn"
          aria-label="Quay lại trang chính"
          onClick={onExit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          <ArrowLeft size={15} />
          Quay lại
        </button>

        <span
          data-testid="review-progress-text"
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#6b7280",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Thẻ {currentIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={cards.length}
        aria-label="Tiến độ phiên ôn nhanh"
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#f3f4f6",
          borderRadius: "9999px",
          overflow: "hidden",
          marginBottom: "14px",
        }}
      >
        <div
          data-testid="review-progress-bar"
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            backgroundColor: "#863bff",
            borderRadius: "9999px",
            transition: "width 0.2s ease",
          }}
        />
      </div>

      {/* Interactive MicroCard */}
      {currentCard && (
        <MicroCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
          onRate={handleRateCard}
        />
      )}
    </div>
  );
};
