import React from "react";
import { Volume2 } from "lucide-react";
import { SrsRating } from "@wordstreak/shared-types";
import type { DueCardItem } from "@wordstreak/shared-types";

export interface MicroCardProps {
  card: DueCardItem;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (rating: SrsRating) => void;
}

export function playCardAudio(
  word: string,
  audioUrl?: string | null,
): Promise<void> {
  return new Promise<void>((resolve) => {
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.onended = () => resolve();
        audio.onerror = () => {
          fallbackSpeech(word);
          resolve();
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            fallbackSpeech(word);
            resolve();
          });
        }
        return;
      } catch {
        fallbackSpeech(word);
        resolve();
        return;
      }
    }
    fallbackSpeech(word);
    resolve();
  });
}

export function fallbackSpeech(text: string): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignored if speech synthesis is unavailable
    }
  }
}

export const MicroCard: React.FC<MicroCardProps> = ({
  card,
  isFlipped,
  onFlip,
  onRate,
}) => {
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void playCardAudio(card.word, card.audioUrl);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid flipping when clicking buttons or interactive child elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    onFlip();
  };

  return (
    <div
      data-testid="micro-card"
      role="region"
      aria-label={isFlipped ? `Thẻ mặt sau: ${card.word}` : `Thẻ mặt trước: ${card.word}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
      onClick={handleCardClick}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        padding: "20px 16px",
        minHeight: "260px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        position: "relative",
        userSelect: "none",
        transition: "box-shadow 0.15s ease",
      }}
    >
      {/* Top Header: Deck badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          data-testid="card-deck-badge"
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#6b7280",
            backgroundColor: card.deckColor ? `${card.deckColor}20` : "#f3f4f6",
            border: `1px solid ${card.deckColor ? `${card.deckColor}40` : "#e5e7eb"}`,
            padding: "3px 8px",
            borderRadius: "6px",
          }}
        >
          {card.deckTitle || "Chung"}
        </span>

        <button
          type="button"
          data-testid="card-audio-btn"
          aria-label="Phát âm từ vựng"
          onClick={handleAudioClick}
          title="Phát âm"
          style={{
            background: "#f5f3ff",
            border: "1px solid #ede9fe",
            color: "#863bff",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Volume2 size={15} />
        </button>
      </div>

      {/* Main Content Area */}
      {!isFlipped ? (
        /* Front Face */
        <div
          data-testid="card-front-face"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "24px 0",
            textAlign: "center",
          }}
        >
          <div
            data-testid="card-word"
            style={{
              fontSize: "24px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              color: "#111827",
              marginBottom: "4px",
              letterSpacing: "-0.01em",
            }}
          >
            {card.word}
          </div>
          {card.phonetic && (
            <div
              data-testid="card-phonetic"
              style={{
                fontSize: "13px",
                color: "#6b7280",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {card.phonetic}
            </div>
          )}
        </div>
      ) : (
        /* Back Face */
        <div
          data-testid="card-back-face"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "14px 0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              color: "#111827",
              marginBottom: "2px",
            }}
          >
            {card.word}
          </div>
          <div
            data-testid="card-meaning"
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#863bff",
              fontFamily: "Inter, sans-serif",
              marginBottom: card.exampleSentence ? "8px" : "0",
            }}
          >
            {card.meaning}
          </div>
          {card.exampleSentence && (
            <div
              data-testid="card-example"
              style={{
                fontSize: "12px",
                color: "#4b5563",
                fontStyle: "italic",
                lineHeight: 1.4,
                backgroundColor: "#f9fafb",
                padding: "6px 10px",
                borderRadius: "8px",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              &ldquo;{card.exampleSentence}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Bottom Controls / Hints */}
      {!isFlipped ? (
        <div
          data-testid="flip-hint"
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#9ca3af",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          [Nhấn Space hoặc click để lật]
        </div>
      ) : (
        <div
          data-testid="rating-buttons-group"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "6px",
            marginTop: "10px",
          }}
        >
          <button
            type="button"
            data-testid="rating-btn-1"
            onClick={(e) => {
              e.stopPropagation();
              onRate(SrsRating.AGAIN);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              borderRadius: "8px",
              padding: "6px 4px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
              }}
            >
              1
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700 }}>Chưa thuộc</span>
          </button>

          <button
            type="button"
            data-testid="rating-btn-2"
            onClick={(e) => {
              e.stopPropagation();
              onRate(SrsRating.HARD);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              backgroundColor: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#c2410c",
              borderRadius: "8px",
              padding: "6px 4px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
              }}
            >
              2
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700 }}>Khó</span>
          </button>

          <button
            type="button"
            data-testid="rating-btn-3"
            onClick={(e) => {
              e.stopPropagation();
              onRate(SrsRating.GOOD);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              borderRadius: "8px",
              padding: "6px 4px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
              }}
            >
              3
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700 }}>Nhớ tốt</span>
          </button>

          <button
            type="button"
            data-testid="rating-btn-4"
            onClick={(e) => {
              e.stopPropagation();
              onRate(SrsRating.EASY);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              backgroundColor: "#f5f3ff",
              border: "1px solid #ddd6fe",
              color: "#863bff",
              borderRadius: "8px",
              padding: "6px 4px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
              }}
            >
              4
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700 }}>Rất dễ</span>
          </button>
        </div>
      )}
    </div>
  );
};
