import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Flag, CheckCircle2, AlertCircle } from "lucide-react";
import type { OfficialCardFeedbackReason } from "@wordstreak/shared-types";
import { libraryService } from "../services/libraryService";

interface ReportCardFeedbackModalProps {
  cardId: string | null;
  cardHeadword?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FEEDBACK_REASONS: Array<{
  value: OfficialCardFeedbackReason;
  label: string;
  desc: string;
}> = [
  {
    value: "WRONG_MEANING",
    label: "Nghĩa chưa chuẩn",
    desc: "Bản dịch nghĩa tiếng Việt chưa chính xác theo ngữ cảnh",
  },
  {
    value: "TYPO",
    label: "Lỗi chính tả / phiên âm",
    desc: "Sai mặt chữ, lỗi trọng âm hoặc ký hiệu IPA",
  },
  {
    value: "AUDIO_ERROR",
    label: "Âm thanh lỗi",
    desc: "Không phát âm được hoặc giọng đọc bị ngắt quãng",
  },
  {
    value: "EXAMPLE_UNNATURAL",
    label: "Ví dụ thiếu tự nhiên",
    desc: "Câu ví dụ quá khó, ngữ pháp gượng gạo hoặc chưa thực tế",
  },
  {
    value: "OTHER",
    label: "Lỗi khác",
    desc: "Vấn đề khác về thẻ từ vựng này",
  },
];

export const ReportCardFeedbackModal: React.FC<ReportCardFeedbackModalProps> = ({
  cardId,
  cardHeadword,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState<OfficialCardFeedbackReason>("WRONG_MEANING");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !cardId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await libraryService.submitCardFeedback(
        cardId,
        reason,
        comment.trim() || undefined,
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComment("");
        setReason("WRONG_MEANING");
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể gửi báo lỗi lúc này. Vui lòng thử lại sau.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#737373] hover:text-[#000000] hover:bg-[#f5f5f5] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#000000]">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <h3
              id="report-modal-title"
              className="text-base font-semibold font-nunito text-[#090909]"
            >
              Báo lỗi nội dung thẻ
            </h3>
            {cardHeadword && (
              <p className="text-xs text-[#737373]">
                Thẻ từ vựng: <span className="font-semibold text-[#000000]">{cardHeadword}</span>
              </p>
            )}
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-medium text-[#090909]">
              Cảm ơn bạn đã đóng góp!
            </p>
            <p className="text-xs text-[#737373] mt-1">
              Đội ngũ kiểm duyệt sẽ rà soát và cập nhật thẻ sớm nhất.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reasons List */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#525252]">
                Vui lòng chọn loại lỗi:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {FEEDBACK_REASONS.map((r) => {
                  const isSelected = reason === r.value;
                  return (
                    <label
                      key={r.value}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#000000] bg-[#fafafa]"
                          : "border-[#e5e5e5] bg-[#ffffff] hover:border-[#d4d4d4]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedbackReason"
                        value={r.value}
                        checked={isSelected}
                        onChange={() => setReason(r.value)}
                        className="mt-0.5 text-black focus:ring-0 accent-black"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#090909]">
                          {r.label}
                        </p>
                        <p className="text-[11px] text-[#737373] leading-tight">
                          {r.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label
                htmlFor="feedback-comment"
                className="block text-xs font-medium text-[#525252] mb-1"
              >
                Mô tả chi tiết (không bắt buộc):
              </label>
              <textarea
                id="feedback-comment"
                rows={3}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ví dụ: Nghĩa chuẩn trong ngữ cảnh công sở nên là..."
                className="w-full text-xs rounded-xl border border-[#e5e5e5] p-2.5 outline-none focus:border-[#000000] transition-colors resize-none placeholder:text-[#a3a3a3]"
              />
              <span className="block text-[10px] text-right text-[#a3a3a3]">
                {comment.length}/500
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f5f5f5]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-full border border-[#e5e5e5] text-xs font-medium text-[#525252] hover:bg-[#fafafa] transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-[#000000] text-xs font-medium text-[#ffffff] hover:bg-[#262626] transition-colors disabled:opacity-50"
              >
                {submitting ? "Đang gửi..." : "Gửi báo lỗi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
};
