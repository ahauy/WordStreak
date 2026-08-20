import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderSymlink, X, Loader2 } from "lucide-react";
import { decksService } from "../../decks/services/decksService";
import type { DeckResponse } from "@wordstreak/shared-types";

interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDeckId: string;
  selectedCount: number;
  onConfirmMove: (targetDeckId: string) => Promise<void>;
  isLoading: boolean;
}

export const BulkMoveModal: React.FC<BulkMoveModalProps> = ({
  isOpen,
  onClose,
  currentDeckId,
  selectedCount,
  onConfirmMove,
  isLoading,
}) => {
  const [decks, setDecks] = useState<DeckResponse[]>([]);
  const [selectedTargetDeckId, setSelectedTargetDeckId] = useState<string>("");
  const [isFetchingDecks, setIsFetchingDecks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsFetchingDecks(true);
      setError(null);
      decksService
        .getDecks()
        .then((data: DeckResponse[]) => {
          const validDecks = data.filter(
            (d: DeckResponse) => d.id !== currentDeckId,
          );
          setDecks(validDecks);
          if (validDecks.length > 0) {
            setSelectedTargetDeckId(validDecks[0].id);
          }
        })
        .catch(() => {
          setError("Không thể tải danh sách bộ từ");
        })
        .finally(() => {
          setIsFetchingDecks(false);
        });
    }
  }, [isOpen, currentDeckId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetDeckId) return;
    await onConfirmMove(selectedTargetDeckId);
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-xl z-10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#f3e8ff] border border-[#e9d5ff] flex items-center justify-center text-[#7e22ce]">
                <FolderSymlink className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-base font-bold text-black"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Di chuyển {selectedCount} thẻ từ vựng
                </h3>
                <span className="text-[11px] text-[#737373]">
                  Chọn bộ từ đích để chuyển các thẻ đã chọn
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#a3a3a3] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#be123c]">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="target-deck-select"
                className="block text-xs font-bold text-black mb-1.5"
              >
                Bộ từ đích
              </label>
              {isFetchingDecks ? (
                <div className="h-10 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center gap-2 text-xs text-[#737373]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải danh sách bộ từ...</span>
                </div>
              ) : decks.length === 0 ? (
                <p className="text-xs text-[#737373] p-3 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  Bạn chưa có bộ từ nào khác để di chuyển. Vui lòng tạo bộ từ
                  mới trước.
                </p>
              ) : (
                <select
                  id="target-deck-select"
                  value={selectedTargetDeckId}
                  onChange={(e) => setSelectedTargetDeckId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-xs font-medium text-black focus:outline-none focus:border-black transition-colors"
                >
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.title} ({deck.stats?.totalCards ?? 0} thẻ)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#f0f0f0]">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isLoading || decks.length === 0 || isFetchingDecks}
                className="btn-primary h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận di chuyển</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
