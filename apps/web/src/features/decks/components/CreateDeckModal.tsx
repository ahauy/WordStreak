import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Check, Globe, Lock } from "lucide-react";
import {
  PRESET_COLORS,
  PRESET_ICONS,
  getColorTheme,
} from "../constants/deckThemes";
import type { CreateDeckDto, DeckResponse } from "@wordstreak/shared-types";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateDeckDto) => Promise<DeckResponse>;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex);
  const [customHex, setCustomHex] = useState("");
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("Book");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const [activeTab, setActiveTab] = useState<"info" | "style">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSelectedColor(PRESET_COLORS[0].hex);
      setCustomHex("");
      setIsCustomColor(false);
      setSelectedIcon("Book");
      setCoverImageUrl("");
      setTagInput("");
      setTags([]);
      setIsPublic(false);
      setActiveTab("info");
      setValidationError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, "");
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
      setTags([...tags, cleanTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Tiêu đề bộ từ không được để trống (1-100 ký tự)");
      setActiveTab("info");
      return;
    }

    if (title.trim().length > 100) {
      setValidationError("Tiêu đề không được vượt quá 100 ký tự");
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError(null);

      const colorToSave =
        isCustomColor && customHex ? customHex : selectedColor;

      const dto: CreateDeckDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        color: colorToSave,
        icon: selectedIcon,
        coverImageUrl: coverImageUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isPublic,
      };

      await onSubmit(dto);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo bộ từ";
      setValidationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentColorTheme = getColorTheme(
    isCustomColor && customHex ? customHex : selectedColor,
  );

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
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-[#e5e5e5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: currentColorTheme.bgLight,
                  border: `1px solid ${currentColorTheme.borderLight}`,
                }}
              >
                <Layers
                  className="w-4 h-4"
                  style={{ color: currentColorTheme.hex }}
                />
              </div>
              <div>
                <h2
                  className="text-lg font-bold text-black tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tạo Bộ Từ Vựng Mới
                </h2>
                <p className="text-xs text-[#737373]">
                  Phân loại từ vựng theo chủ đề để tối ưu lịch ôn Spaced
                  Repetition.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#e5e5e5] px-6 bg-[#fafafa]">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors cursor-pointer ${
                activeTab === "info"
                  ? "border-black text-black"
                  : "border-transparent text-[#737373] hover:text-black"
              }`}
            >
              1. Thông tin bộ từ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "style"
                  ? "border-black text-black"
                  : "border-transparent text-[#737373] hover:text-black"
              }`}
            >
              2. Nhận diện & Màu sắc
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {validationError && (
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#be123c] flex items-center gap-2">
                <span>⚠️ {validationError}</span>
              </div>
            )}

            {activeTab === "info" ? (
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Tiêu đề bộ từ <span className="text-[#ff5f56]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: IELTS Speaking Band 7.5+, Oxford 3000..."
                    maxLength={100}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#e5e5e5] bg-white text-sm text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    autoFocus
                  />
                  <div className="flex justify-between text-[11px] text-[#a3a3a3] font-mono">
                    <span>Ví dụ: Chủ đề công sở, bài luận, chuyên ngành</span>
                    <span>{title.length}/100</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Mô tả ngắn (tùy chọn)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả mục tiêu, nguồn tài liệu hoặc ghi chú cho bộ từ này..."
                    maxLength={500}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-[#e5e5e5] bg-white text-sm text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                  />
                  <div className="text-right text-[11px] text-[#a3a3a3] font-mono">
                    {description.length}/500
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Thẻ phân loại (Tags)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Nhập tag và bấm Thêm (VD: IELTS, Speaking)..."
                      className="flex-1 h-9 px-3 rounded-xl border border-[#e5e5e5] bg-white text-xs text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3.5 h-9 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-xs font-semibold text-black hover:bg-[#e5e5e5] transition-colors cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-[#f5f5f7] border border-[#e5e5e5] text-[#171717]"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-[#737373] hover:text-[#ff5f56]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Privacy Visibility */}
                <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                      {isPublic ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Bộ từ công khai (Public)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#737373]" />
                          <span>Bộ từ riêng tư (Private)</span>
                        </>
                      )}
                    </span>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      {isPublic
                        ? "Những người dùng khác có thể xem danh sách từ trong bộ này."
                        : "Chỉ riêng bạn có thể xem và học bộ từ này."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isPublic ? "bg-black" : "bg-[#e5e5e5]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        isPublic ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Preset Colors */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Bảng màu chủ đề (Cosmos Presets)
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {PRESET_COLORS.map((col) => {
                      const isSelected =
                        !isCustomColor && selectedColor === col.hex;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            setSelectedColor(col.hex);
                            setIsCustomColor(false);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-black ring-1 ring-black bg-[#fafafa]"
                              : "border-[#e5e5e5] hover:border-[#d4d4d4] bg-white"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: col.hex }}
                          >
                            {isSelected && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </span>
                          <span className="text-[11px] font-medium text-black truncate">
                            {col.name.split(" ")[1] || col.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Hoặc nhập mã màu HEX tùy chỉnh
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => {
                        setCustomHex(e.target.value);
                        setIsCustomColor(true);
                      }}
                      placeholder="#6366F1"
                      maxLength={7}
                      className="w-32 h-9 px-3 rounded-xl border border-[#e5e5e5] bg-white text-xs font-mono text-black focus:outline-none focus:border-black"
                    />
                    {customHex &&
                      /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(customHex) && (
                        <span
                          className="w-6 h-6 rounded-lg border border-[#e5e5e5]"
                          style={{ backgroundColor: customHex }}
                        />
                      )}
                  </div>
                </div>

                {/* Icon Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#171717]">
                    Biểu tượng nhận diện (Icon)
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_ICONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedIcon === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedIcon(item.id)}
                          title={item.name}
                          className={`h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "border border-black bg-black text-white"
                              : "border border-[#e5e5e5] bg-white text-[#525252] hover:border-black hover:text-black"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cover Image URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717]">
                    URL ảnh bìa tùy chỉnh (Cover Image URL)
                  </label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-9 px-3 rounded-xl border border-[#e5e5e5] bg-white text-xs text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-[#737373]">
                    Nếu ảnh không khả dụng, hệ thống sẽ tự động fallback về
                    Gradient màu chủ đề.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#e5e5e5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary h-9 px-5 text-xs font-semibold cursor-pointer"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo bộ từ ngay"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
