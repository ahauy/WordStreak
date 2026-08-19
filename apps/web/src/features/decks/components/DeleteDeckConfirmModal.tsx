import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import type { DeckResponse } from "@wordstreak/shared-types";

interface DeleteDeckConfirmModalProps {
  isOpen: boolean;
  deck: DeckResponse | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteDeckConfirmModal: React.FC<DeleteDeckConfirmModalProps> = ({
  isOpen,
  deck,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = React.useCallback(() => {
    setIsDeleting(false);
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !deck) return null;

  const cardCount = deck.stats?.totalCards ?? 0;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(deck.id);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa bộ từ vựng";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden z-10 p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#ff5f56]">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <h3
              className="text-base sm:text-lg font-bold text-black tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Xác nhận xóa vĩnh viễn bộ từ?
            </h3>
            <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
              Bạn đang chuẩn bị xóa bộ từ{" "}
              <strong className="text-black font-semibold">
                "{deck.title}"
              </strong>
              .
            </p>
          </div>

          {/* Warning Callout */}
          <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5] space-y-1">
            <div className="text-xs font-semibold text-[#be123c] flex items-center gap-1.5">
              <span>⚠️ Cảnh báo mất dữ liệu không thể hoàn tác:</span>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Hành động này sẽ xóa vĩnh viễn{" "}
              <span className="font-mono font-bold text-black">
                {cardCount} thẻ từ
              </span>{" "}
              và toàn bộ lịch sử ôn tập Spaced Repetition liên quan. Nếu muốn
              giữ lại dữ liệu, hãy chọn tính năng{" "}
              <strong>Lưu trữ (Archive)</strong>.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#be123c]">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="btn-secondary h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="h-9 px-4 rounded-full bg-[#ff5f56] hover:bg-[#e04b43] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn bộ từ"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
