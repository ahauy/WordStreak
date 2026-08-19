import React from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Search, Archive } from "lucide-react";

interface DeckEmptyStateProps {
  statusTab: "active" | "archived";
  searchQuery?: string;
  onCreateDeck?: () => void;
  onClearSearch?: () => void;
}

export const DeckEmptyState: React.FC<DeckEmptyStateProps> = ({
  statusTab,
  searchQuery,
  onCreateDeck,
  onClearSearch,
}) => {
  if (searchQuery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4 bg-[#fafafa] rounded-2xl border border-dashed border-[#e5e5e5] my-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] mx-auto flex items-center justify-center text-[#737373] shadow-sm mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3
          className="text-base font-bold text-black"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Không tìm thấy bộ từ vựng nào
        </h3>
        <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
          Không có kết quả nào khớp với từ khóa{" "}
          <span className="font-mono text-black font-semibold">
            "{searchQuery}"
          </span>
          .
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="btn-secondary h-8 px-4 text-xs font-semibold mt-4 cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        )}
      </motion.div>
    );
  }

  if (statusTab === "archived") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4 bg-[#fafafa] rounded-2xl border border-dashed border-[#e5e5e5] my-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] mx-auto flex items-center justify-center text-[#737373] shadow-sm mb-3">
          <Archive className="w-6 h-6 text-[#F59E0B]" />
        </div>
        <h3
          className="text-base font-bold text-black"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Chưa có bộ từ nào trong danh sách lưu trữ
        </h3>
        <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
          Khi bạn tạm thời không học một bộ từ, hãy chọn "Lưu trữ" để giữ danh
          sách học chính luôn gọn gàng.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] my-6 relative overflow-hidden"
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] mx-auto flex items-center justify-center text-[#9333ea] shadow-sm mb-4">
        <Layers className="w-7 h-7" />
      </div>

      <h3
        className="text-lg font-bold text-black tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Bắt đầu hành trình từ vựng của bạn
      </h3>

      <p className="text-xs sm:text-sm text-[#737373] mt-1.5 max-w-md mx-auto leading-relaxed">
        Tạo bộ từ vựng đầu tiên theo chủ đề mong muốn (IELTS, TOEIC, Giao tiếp)
        để bắt đầu chu kỳ Spaced Repetition (SM-2) khoa học.
      </p>

      {onCreateDeck && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onCreateDeck}
            className="btn-primary h-10 px-5 text-xs font-semibold gap-2 cursor-pointer inline-flex items-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ từ vựng đầu tiên</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
