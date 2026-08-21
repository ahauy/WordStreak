import React from "react";
import type { CommunityCategory } from "@wordstreak/shared-types";

interface CategoryFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES: { label: string; value: CommunityCategory }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "IELTS", value: "IELTS" },
  { label: "TOEIC", value: "TOEIC" },
  { label: "TOEFL", value: "TOEFL" },
  { label: "Giao tiếp hàng ngày", value: "Daily Conversation" },
  { label: "Tiếng Anh công sở", value: "Business English" },
  { label: "Học thuật", value: "Academic" },
  { label: "Tiếng Anh tổng quát", value: "General English" },
  { label: "Ngữ pháp & Từ vựng", value: "Grammar & Vocab" },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto py-1 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {CATEGORIES.map((cat) => {
          const isActive =
            selectedCategory === cat.value ||
            (cat.value === "ALL" && !selectedCategory);

          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelectCategory(cat.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer select-none border ${
                isActive
                  ? "bg-black text-white border-black shadow-sm"
                  : "bg-white text-[#737373] border-[#e5e5e5] hover:text-black hover:border-[#d4d4d4] hover:bg-[#fafafa]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
