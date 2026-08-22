import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Check, Globe, Lock } from "lucide-react";
import {
  PRESET_COLORS,
  PRESET_ICONS,
  getColorTheme,
} from "../constants/deckThemes";
import type { UpdateDeckDto, DeckResponse } from "@wordstreak/shared-types";

interface EditDeckModalProps {
  isOpen: boolean;
  deck: DeckResponse | null;
  onClose: () => void;
  onSubmit: (id: string, dto: UpdateDeckDto) => Promise<DeckResponse>;
}

interface EditDeckModalDialogProps {
  deck: DeckResponse;
  onClose: () => void;
  onSubmit: (id: string, dto: UpdateDeckDto) => Promise<DeckResponse>;
}

const EditDeckModalDialog: React.FC<EditDeckModalDialogProps> = ({
  deck,
  onClose,
  onSubmit,
}) => {
  const isPresetInitial = PRESET_COLORS.some(
    (c) => c.hex.toLowerCase() === deck.color.toLowerCase(),
  );

  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description || "");
  const [selectedColor, setSelectedColor] = useState(
    isPresetInitial ? deck.color : PRESET_COLORS[0].hex,
  );
  const [customHex, setCustomHex] = useState(isPresetInitial ? "" : deck.color);
  const [isCustomColor, setIsCustomColor] = useState(!isPresetInitial);
  const [selectedIcon, setSelectedIcon] = useState(deck.icon || "Book");
  const [coverImageUrl, setCoverImageUrl] = useState(deck.coverImageUrl || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(deck.tags || []);
  const [isPublic, setIsPublic] = useState(deck.isPublic);

  const [activeTab, setActiveTab] = useState<"info" | "style">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

      const dto: UpdateDeckDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        color: colorToSave,
        icon: selectedIcon,
        coverImageUrl: coverImageUrl.trim() || undefined,
        tags,
        isPublic,
      };

      await onSubmit(deck.id, dto);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật bộ từ";
      setValidationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentColorTheme = getColorTheme(
    isCustomColor && customHex ? customHex : selectedColor,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden z-10 flex flex-col max-h-[90vh] my-auto"
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
                Chỉnh Sửa Bộ Từ Vựng
              </h2>
              <p className="text-xs text-[#737373]">
                Cập nhật tiêu đề, mô tả và nhận diện trực quan cho bộ từ.
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
            2. Màu sắc & Icon nhận diện
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {validationError && (
            <div className="mb-5 p-3.5 bg-[#fff1f2] border border-[#fecdd3] rounded-xl text-xs text-[#e11d48] font-medium flex items-center justify-between">
              <span>{validationError}</span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-[#e11d48] hover:text-black ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === "info" ? (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                  Tiêu đề bộ từ <span className="text-[#ff5f56]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Ví dụ: 3000 Từ vựng Oxford thông dụng, IELTS Speaking Part 2..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-black text-sm focus:outline-none focus:border-black transition-colors"
                  maxLength={100}
                />
                <div className="flex justify-between mt-1 text-[11px] text-[#737373]">
                  <span>Ngắn gọn, dễ nhớ (1-100 ký tự)</span>
                  <span>{title.length}/100</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                  Mô tả mục tiêu học tập (Tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Mục tiêu hoàn thành 20 từ mỗi ngày để chuẩn bị thi cuối tháng..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-black text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  maxLength={500}
                />
                <div className="flex justify-end mt-1 text-[11px] text-[#737373]">
                  <span>{description.length}/500</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                  Tags phân loại (Tối đa 5 tags)
                </label>
                <div className="flex gap-2 mb-2">
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
                    placeholder="Nhập tag (VD: ielts, toeic, daily) và nhấn Enter"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#e5e5e5] bg-white text-black text-xs focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="px-4 py-2 bg-[#fafafa] hover:bg-[#e5e5e5] text-black text-xs font-semibold rounded-xl border border-[#e5e5e5] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-[#fafafa] text-black border border-[#e5e5e5]"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-[#737373] hover:text-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Public/Private Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f5f5f5] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e5e5e5] text-black focus:ring-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                      {isPublic ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-[#2563eb]" />
                          <span>Công khai (Public)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#737373]" />
                          <span>Riêng tư (Private - Chỉ bạn nhìn thấy)</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      {isPublic
                        ? "Người học khác có thể tìm thấy và tham khảo bộ từ này."
                        : "Bộ từ chỉ hiển thị trong kho học liệu cá nhân của bạn."}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Preset Colors */}
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2.5">
                  Màu chủ đề Cosmos (8 Presets)
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_COLORS.map((color) => {
                    const isSelected =
                      !isCustomColor && selectedColor === color.hex;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color.hex);
                          setIsCustomColor(false);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-black shadow-sm bg-[#fafafa]"
                            : "border-[#e5e5e5] hover:border-[#d4d4d4] bg-white"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center relative shadow-xs"
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-[#737373] truncate max-w-full">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color */}
              <div className="p-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa]">
                <label className="flex items-center gap-2 mb-2 text-xs font-semibold text-black">
                  <input
                    type="checkbox"
                    checked={isCustomColor}
                    onChange={(e) => setIsCustomColor(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e5e5e5] text-black"
                  />
                  <span>Tùy chỉnh mã màu Hex cá nhân</span>
                </label>

                {isCustomColor && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={customHex || "#6366F1"}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5e5]"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      placeholder="#6366F1"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-mono text-black focus:outline-none focus:border-black uppercase"
                      maxLength={7}
                    />
                  </div>
                )}
              </div>

              {/* Preset Icons */}
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2.5">
                  Biểu tượng nhận diện (12 Icons)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {PRESET_ICONS.map((iconItem) => {
                    const Icon = iconItem.icon;
                    const isSelected = selectedIcon === iconItem.id;
                    return (
                      <button
                        key={iconItem.id}
                        type="button"
                        onClick={() => setSelectedIcon(iconItem.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? "border-black bg-[#fafafa] shadow-xs"
                            : "border-[#e5e5e5] hover:border-[#d4d4d4] bg-white text-[#737373] hover:text-black"
                        }`}
                        title={iconItem.name}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: isSelected
                              ? currentColorTheme.hex
                              : undefined,
                          }}
                        />
                        <span className="text-[9px] font-medium truncate max-w-full text-center">
                          {iconItem.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                  Ảnh bìa bộ từ (Cover Image URL - Tùy chọn)
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e5e5e5] bg-white text-xs text-black focus:outline-none focus:border-black"
                />
                <p className="text-[11px] text-[#737373] mt-1">
                  Dán đường dẫn ảnh phong cảnh, học tập để làm nổi bật thẻ bộ
                  từ.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-6 mt-6 border-t border-[#e5e5e5] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#737373] hover:text-black cursor-pointer"
            >
              Hủy bỏ
            </button>

            <div className="flex gap-2">
              {activeTab === "info" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("style")}
                  className="btn-primary h-9 px-5 text-xs font-semibold cursor-pointer"
                >
                  Tiếp tục: Chọn giao diện →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary h-9 px-6 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const EditDeckModal: React.FC<EditDeckModalProps> = ({
  isOpen,
  deck,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !deck) return null;

  const modalContent = (
    <AnimatePresence>
      <EditDeckModalDialog
        key={deck.id}
        deck={deck}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
