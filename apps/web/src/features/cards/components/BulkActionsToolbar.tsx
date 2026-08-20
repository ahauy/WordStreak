import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  FolderSymlink,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { BulkMoveModal } from "./BulkMoveModal";

interface BulkActionsToolbarProps {
  selectedCount: number;
  currentDeckId: string;
  onClearSelection: () => void;
  onBulkDelete: () => Promise<void>;
  onBulkMove: (targetDeckId: string) => Promise<void>;
  onBulkResetProgress: () => Promise<void>;
  isLoading: boolean;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  currentDeckId,
  onClearSelection,
  onBulkDelete,
  onBulkMove,
  onBulkResetProgress,
  isLoading,
}) => {
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-black text-white rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 border border-white/10"
        >
          {/* Left: Selection Count */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-xs font-mono font-bold text-white">
              {selectedCount}
            </span>
            <span className="text-xs font-semibold text-white/90">
              thẻ đã được chọn
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={isLoading}
              className="text-[11px] text-white/60 hover:text-white underline ml-1 cursor-pointer transition-colors"
            >
              Bỏ chọn
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Reset Progress Button */}
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              disabled={isLoading}
              title="Đặt lại trạng thái học về Mới"
              className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt lại tiến độ</span>
            </button>

            {/* Move to Deck Button */}
            <button
              type="button"
              onClick={() => setIsMoveModalOpen(true)}
              disabled={isLoading}
              title="Di chuyển sang bộ từ khác"
              className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FolderSymlink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Di chuyển</span>
            </button>

            {/* Bulk Delete Button */}
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isLoading}
              title="Xóa các thẻ đã chọn"
              className="h-8 px-3 rounded-xl bg-[#ff5f56]/20 hover:bg-[#ff5f56]/30 text-[#ff5f56] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Xóa</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bulk Move Modal */}
      <BulkMoveModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        currentDeckId={currentDeckId}
        selectedCount={selectedCount}
        onConfirmMove={async (targetDeckId) => {
          await onBulkMove(targetDeckId);
          setIsMoveModalOpen(false);
        }}
        isLoading={isLoading}
      />

      {/* Bulk Delete Confirm Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center mx-auto mb-4 text-[#ff5f56]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3
                className="text-base font-bold text-black mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Xóa {selectedCount} thẻ từ vựng?
              </h3>
              <p className="text-xs text-[#737373] mb-6 leading-relaxed">
                Hành động này không thể hoàn tác. Toàn bộ tiến độ học và dữ liệu
                của {selectedCount} thẻ đã chọn sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={isLoading}
                  className="btn-secondary h-9 px-4 text-xs font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onBulkDelete();
                    setIsDeleteConfirmOpen(false);
                  }}
                  disabled={isLoading}
                  className="h-9 px-4 rounded-xl bg-[#ff5f56] hover:bg-[#e0483f] text-white text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center transition-colors"
                >
                  {isLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Xóa vĩnh viễn</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Reset Confirm Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center mx-auto mb-4 text-[#2563eb]">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3
                className="text-base font-bold text-black mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Đặt lại tiến độ {selectedCount} thẻ?
              </h3>
              <p className="text-xs text-[#737373] mb-6 leading-relaxed">
                Tiến độ Spaced Repetition của {selectedCount} thẻ sẽ được chuyển
                về trạng thái <strong>Mới (NEW)</strong> để bạn học lại từ đầu.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  disabled={isLoading}
                  className="btn-secondary h-9 px-4 text-xs font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onBulkResetProgress();
                    setIsResetConfirmOpen(false);
                  }}
                  disabled={isLoading}
                  className="btn-primary h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center"
                >
                  {isLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Xác nhận đặt lại</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
