import React, { useEffect, useState } from "react";
import type {
  CommunityDeckItem,
  CommunityDeckDetailResponse,
} from "@wordstreak/shared-types";
import { communityService } from "../services/communityService";
import {
  X,
  BookOpen,
  Download,
  Star,
  User,
  Volume2,
  AlertCircle,
} from "lucide-react";

interface CommunityDeckPreviewModalProps {
  deck: CommunityDeckItem | null;
  isOpen: boolean;
  onClose: () => void;
  onClone: (deck: CommunityDeckItem) => void;
  onRate?: (deck: CommunityDeckItem) => void;
  isCloning?: boolean;
}

export const CommunityDeckPreviewModal: React.FC<
  CommunityDeckPreviewModalProps
> = ({ deck, isOpen, onClose, onClone, onRate, isCloning = false }) => {
  const [detail, setDetail] = useState<CommunityDeckDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deck) {
      setDetail(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    communityService
      .getCommunityDeckDetail(deck.id)
      .then((res) => {
        if (isMounted) {
          setDetail(res);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải chi tiết bộ từ vựng",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, deck]);

  if (!isOpen || !deck) return null;

  const playAudio = (
    cardId: string,
    word: string,
    audioUrl?: string | null,
  ) => {
    setPlayingAudioId(cardId);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => {
        speakWebSpeech(word);
      };
      void audio.play().catch(() => speakWebSpeech(word));
    } else {
      speakWebSpeech(word);
    }
  };

  const speakWebSpeech = (word: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAudioId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-[#e5e5e5] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#e5e5e5]">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#faf5ff] text-[#7e22ce] border border-[#f3e8ff]">
                {deck.category || "Chung"}
              </span>
              <div className="flex items-center gap-1 text-xs font-mono text-[#737373]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{deck.totalCards} thẻ từ</span>
              </div>
            </div>

            <h2
              className="text-xl sm:text-2xl font-extrabold text-black tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deck.title}
            </h2>

            {/* Author & Rating Badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#737373]">
              <div className="flex items-center gap-1.5">
                {deck.author.avatarUrl ? (
                  <img
                    src={deck.author.avatarUrl}
                    alt={deck.author.username}
                    className="w-4 h-4 rounded-full object-cover border border-[#e5e5e5]"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#737373]" />
                )}
                <span className="font-medium text-black">
                  Tác giả: {deck.author.username}
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-mono text-xs font-bold text-black">
                  {deck.averageRating > 0
                    ? deck.averageRating.toFixed(1)
                    : "Chưa có đánh giá"}
                </span>
                <span className="text-[#a3a3a3] font-mono text-[11px]">
                  ({deck.totalRatings})
                </span>
              </div>

              <div className="flex items-center gap-1 text-[#737373]">
                <Download className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">
                  {deck.cloneCount} lượt sao chép
                </span>
              </div>
            </div>

            {deck.description && (
              <p className="mt-3 text-xs sm:text-sm text-[#525252] leading-relaxed">
                {deck.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-black rounded-full hover:bg-[#fafafa] border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors cursor-pointer shrink-0"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content: Card List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#a3a3a3]">
              Danh sách từ vựng xem trước
            </h4>
            <span className="text-xs font-mono text-[#737373]">
              {detail ? `${detail.cards.length} từ` : "Đang tải..."}
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#737373]">
              <div className="w-6 h-6 border-2 border-[#e5e5e5] border-t-black rounded-full animate-spin" />
              <span className="text-xs font-medium">
                Đang tải thẻ từ vựng...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          ) : detail?.cards && detail.cards.length > 0 ? (
            <div className="divide-y divide-[#f5f5f5] border border-[#e5e5e5] rounded-2xl overflow-hidden bg-white">
              {detail.cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="p-3.5 flex items-start justify-between gap-3 hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-[#a3a3a3]">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-sm text-black">
                        {card.word}
                      </span>
                      {card.phonetic && (
                        <span className="text-xs font-mono text-[#7e22ce]">
                          {card.phonetic}
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-[#525252] font-medium leading-relaxed">
                      {card.meaning}
                    </p>

                    {card.exampleSentence && (
                      <p className="mt-1 text-xs text-[#737373] italic leading-relaxed">
                        "{card.exampleSentence}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => playAudio(card.id, card.word, card.audioUrl)}
                    className="p-2 text-[#737373] hover:text-[#7e22ce] hover:bg-[#faf5ff] rounded-full transition-colors shrink-0 cursor-pointer"
                    title="Phát âm thanh"
                  >
                    <Volume2
                      className={`w-4 h-4 ${
                        playingAudioId === card.id
                          ? "animate-pulse text-[#7e22ce]"
                          : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#a3a3a3]">
              Bộ từ này chưa có thẻ nào.
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between gap-3">
          <div>
            {!deck.isOwner && onRate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRate(deck);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-[#fafafa] border border-[#e5e5e5] hover:border-[#d4d4d4] rounded-full transition-colors cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Đánh giá bộ từ</span>
              </button>
            )}
          </div>

          <div>
            {deck.isOwner ? (
              <span className="text-xs font-medium text-[#737373] px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-full">
                Bạn là tác giả bộ từ này
              </span>
            ) : (
              <button
                type="button"
                disabled={isCloning}
                onClick={() => onClone(deck)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-black hover:bg-[#171717] rounded-full shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCloning ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isCloning
                    ? "Đang sao chép..."
                    : "Sao chép vào Bộ từ của tôi"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
