import React, { useState } from "react";
import type { CommunityDeckItem } from "@wordstreak/shared-types";
import { communityService } from "../services/communityService";
import { X, Star, AlertCircle, CheckCircle2 } from "lucide-react";

interface RateDeckModalProps {
  deck: CommunityDeckItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Chưa tốt / Cần bổ sung ví dụ",
  2: "Tạm được / Thiếu phiên âm",
  3: "Khá ổn / Hữu ích",
  4: "Rất tốt / Đầy đủ ngữ cảnh",
  5: "Tuyệt vời / Xuất sắc 100%",
};

export const RateDeckModal: React.FC<RateDeckModalProps> = ({
  deck,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !deck) return null;

  const activeRating = hoverRating ?? rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn số sao từ 1 đến 5");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await communityService.rateDeck(deck.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể gửi đánh giá cho bộ từ này";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#e5e5e5] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
          <h3
            className="font-bold text-lg text-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Đánh giá bộ từ vựng
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-black rounded-full hover:bg-[#fafafa] border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-[#737373]">Bạn đang đánh giá bộ từ:</p>
            <p
              className="text-base font-bold text-black truncate mt-0.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deck.title}
            </p>
          </div>

          {/* Star Rating Interactive Selector */}
          <div className="py-4 px-6 flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-[#d4d4d4]"
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold text-[#7e22ce] min-h-[1rem]">
              {RATING_LABELS[activeRating]}
            </span>
          </div>

          {/* Comment Textarea */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label
                htmlFor="rating-comment"
                className="font-medium text-black"
              >
                Nhận xét chi tiết (tùy chọn)
              </label>
              <span className="text-[#a3a3a3] font-mono text-[11px]">
                {comment.length}/500
              </span>
            </div>
            <textarea
              id="rating-comment"
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận về chất lượng thẻ từ, ví dụ, phiên âm..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#e5e5e5] bg-white text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Đánh giá thành công! Cảm ơn đóng góp của bạn.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-black bg-white hover:bg-[#fafafa] border border-[#e5e5e5] hover:border-[#d4d4d4] rounded-full transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-semibold text-white bg-black hover:bg-[#171717] rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Star className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{submitting ? "Đang gửi..." : "Gửi đánh giá"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
