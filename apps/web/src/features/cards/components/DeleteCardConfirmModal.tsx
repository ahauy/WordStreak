import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { CardResponse } from "@wordstreak/shared-types";

interface DeleteCardConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  card: CardResponse | null;
  isDeleting: boolean;
}

export const DeleteCardConfirmModal: React.FC<DeleteCardConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  card,
  isDeleting,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !card) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-card-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-2xl z-10 text-black"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#ff5f56]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3
            id="delete-card-title"
            className="text-lg font-bold text-black mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Xác nhận xóa thẻ từ vựng?
          </h3>

          <p className="text-xs sm:text-sm text-[#737373] mb-5 leading-relaxed">
            Bạn có chắc chắn muốn xóa thẻ từ{" "}
            <span className="font-bold text-black">"{card.word}"</span>? Toàn bộ
            lịch sử và tiến độ học lặp lại (SM-2) của thẻ này sẽ bị xóa vĩnh
            viễn.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-full border border-[#e5e5e5] text-xs font-semibold text-[#525252] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2 rounded-full bg-[#ff5f56] hover:bg-[#e04b43] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Xác nhận xóa</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
