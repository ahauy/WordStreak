import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { CardPreview } from "./CardPreview";
import type { CreateCardDto, CardResponse } from "@wordstreak/shared-types";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateCardDto) => Promise<void | CardResponse>;
  existingCards?: CardResponse[];
  deckTitle?: string;
  deckColor?: string;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingCards = [],
  deckTitle = "Bộ từ vựng",
  deckColor = "#6366F1",
}) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [collocations, setCollocations] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ word?: string; meaning?: string }>({});

  const wordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        wordInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const isDuplicate = Boolean(
    word.trim() &&
    existingCards.some(
      (c) => c.word.trim().toLowerCase() === word.trim().toLowerCase(),
    ),
  );

  const resetForm = () => {
    setWord("");
    setMeaning("");
    setPhonetic("");
    setExampleSentence("");
    setCollocations("");
    setMnemonic("");
    setAudioUrl("");
    setImageUrl("");
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { word?: string; meaning?: string } = {};
    if (!word.trim()) {
      newErrors.word = "Vui lòng nhập từ vựng";
    }
    if (!meaning.trim()) {
      newErrors.meaning = "Vui lòng nhập nghĩa của từ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (stayOpen: boolean = false) => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setSubmitSuccess(null);

      const dto: CreateCardDto = {
        word: word.trim(),
        meaning: meaning.trim(),
        phonetic: phonetic.trim() || undefined,
        exampleSentence: exampleSentence.trim() || undefined,
        collocations: collocations.trim() || undefined,
        mnemonic: mnemonic.trim() || undefined,
        audioUrl: audioUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      await onSubmit(dto);

      if (stayOpen) {
        setSubmitSuccess(`Đã lưu "${dto.word}" thành công!`);
        resetForm();
        setTimeout(() => {
          wordInputRef.current?.focus();
          setSubmitSuccess(null);
        }, 2000);
      } else {
        resetForm();
        onClose();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tạo thẻ";
      setErrors((prev) => ({ ...prev, word: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-[#e5e5e5] bg-white shadow-2xl overflow-hidden z-10 text-black"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] bg-[#fafafa]">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: `${deckColor}15`,
                  color: deckColor,
                  border: `1px solid ${deckColor}30`,
                }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2
                  id="add-card-modal-title"
                  className="text-base sm:text-lg font-bold text-black tracking-tight flex items-center gap-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Thêm thẻ từ vựng mới
                </h2>
                <p className="text-xs text-[#737373]">
                  Thêm vào bộ:{" "}
                  <span className="text-black font-semibold">{deckTitle}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Đóng cửa sổ"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] hover:text-black hover:bg-[#e5e5e5]/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Toast Bar */}
          {submitSuccess && (
            <div className="bg-[#f0fdf4] border-b border-[#bbf7d0] px-6 py-2.5 flex items-center gap-2 text-[#16a34a] text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
              <span>
                {submitSuccess} Bạn có thể tiếp tục nhập từ tiếp theo.
              </span>
            </div>
          )}

          {/* Body: Split 2 Columns */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Word Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-word-input"
                    className="text-xs font-semibold text-[#525252] uppercase tracking-wider flex items-center gap-1"
                  >
                    Từ vựng <span className="text-[#ff5f56]">*</span>
                  </label>
                  {isDuplicate && (
                    <span className="text-[11px] font-medium text-[#d97706] bg-[#fffbeb] px-2 py-0.5 rounded-md border border-[#fef3c7] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Từ này đã có trong bộ từ
                    </span>
                  )}
                </div>
                <input
                  id="card-word-input"
                  ref={wordInputRef}
                  type="text"
                  value={word}
                  onChange={(e) => {
                    setWord(e.target.value);
                    if (errors.word)
                      setErrors((prev) => ({ ...prev, word: undefined }));
                  }}
                  placeholder="Ví dụ: serendipity, resilient..."
                  disabled={isSubmitting}
                  className={`w-full px-3.5 py-2 rounded-xl bg-[#fafafa] focus:bg-white border text-black placeholder:text-[#a3a3a3] text-sm font-semibold focus:outline-none transition-all duration-200 ${
                    errors.word
                      ? "border-[#ff5f56] focus:border-[#ff5f56]"
                      : "border-[#e5e5e5] focus:border-black"
                  }`}
                />
                {errors.word && (
                  <p className="mt-1 text-xs text-[#ff5f56] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.word}
                  </p>
                )}
              </div>

              {/* Phonetic & Meaning */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label
                    htmlFor="card-phonetic-input"
                    className="block text-xs font-semibold text-[#525252] uppercase tracking-wider mb-1"
                  >
                    Phiên âm IPA
                  </label>
                  <input
                    id="card-phonetic-input"
                    type="text"
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                    placeholder="/ˌser.ənˈdɪp.ə.ti/"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 rounded-xl bg-[#fafafa] focus:bg-white border border-[#e5e5e5] text-[#7e22ce] font-mono text-xs placeholder:text-[#a3a3a3] focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-7">
                  <label
                    htmlFor="card-meaning-input"
                    className="block text-xs font-semibold text-[#525252] uppercase tracking-wider mb-1"
                  >
                    Nghĩa Tiếng Việt <span className="text-[#ff5f56]">*</span>
                  </label>
                  <input
                    id="card-meaning-input"
                    type="text"
                    value={meaning}
                    onChange={(e) => {
                      setMeaning(e.target.value);
                      if (errors.meaning)
                        setErrors((prev) => ({ ...prev, meaning: undefined }));
                    }}
                    placeholder="Sự tình cờ may mắn, duyên may"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 rounded-xl bg-[#fafafa] focus:bg-white border text-black placeholder:text-[#a3a3a3] text-xs sm:text-sm focus:outline-none transition-all duration-200 ${
                      errors.meaning
                        ? "border-[#ff5f56] focus:border-[#ff5f56]"
                        : "border-[#e5e5e5] focus:border-black"
                    }`}
                  />
                  {errors.meaning && (
                    <p className="mt-1 text-xs text-[#ff5f56] font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.meaning}
                    </p>
                  )}
                </div>
              </div>

              {/* Collapsible: Advanced Context */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-between text-xs font-semibold text-[#525252] hover:text-black transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#7e22ce]" />
                    Ngữ cảnh mở rộng & Mẹo ghi nhớ (Tùy chọn)
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#737373]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] space-y-3 animate-fadeIn">
                    {/* Example Sentence */}
                    <div>
                      <label
                        htmlFor="card-example-input"
                        className="block text-xs font-medium text-[#525252] mb-1"
                      >
                        Câu ví dụ (Example Sentence)
                      </label>
                      <textarea
                        id="card-example-input"
                        rows={2}
                        value={exampleSentence}
                        onChange={(e) => setExampleSentence(e.target.value)}
                        placeholder="Finding this book was a pure serendipity."
                        disabled={isSubmitting}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black resize-none"
                      />
                    </div>

                    {/* Collocations */}
                    <div>
                      <label
                        htmlFor="card-collocations-input"
                        className="block text-xs font-medium text-[#525252] mb-1"
                      >
                        Cụm từ đi kèm (Collocations, cách nhau bởi dấu phẩy)
                      </label>
                      <input
                        id="card-collocations-input"
                        type="text"
                        value={collocations}
                        onChange={(e) => setCollocations(e.target.value)}
                        placeholder="pure serendipity, happy serendipity"
                        disabled={isSubmitting}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* Mnemonic */}
                    <div>
                      <label
                        htmlFor="card-mnemonic-input"
                        className="block text-xs font-medium text-[#92400e] mb-1 flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#d97706]" />
                        Mẹo ghi nhớ (Mnemonic Hook)
                      </label>
                      <textarea
                        id="card-mnemonic-input"
                        rows={2}
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="Serendipity -> 'Xe - ren - đi - tìm' tình cờ gặp may mắn"
                        disabled={isSubmitting}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] text-xs focus:outline-none focus:border-[#d97706] resize-none"
                      />
                    </div>

                    {/* Audio & Image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="card-audio-input"
                          className="block text-xs font-medium text-[#737373] mb-1"
                        >
                          Audio URL (.mp3)
                        </label>
                        <input
                          id="card-audio-input"
                          type="url"
                          value={audioUrl}
                          onChange={(e) => setAudioUrl(e.target.value)}
                          placeholder="Để trống để dùng giọng đọc chuẩn"
                          disabled={isSubmitting}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="card-image-input"
                          className="block text-xs font-medium text-[#737373] mb-1"
                        >
                          Image URL (Link ảnh)
                        </label>
                        <input
                          id="card-image-input"
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://..."
                          disabled={isSubmitting}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <div className="text-center mb-2">
                <span className="text-[11px] font-semibold text-[#7e22ce] tracking-wider uppercase">
                  Xem trước thực tế (Live Preview)
                </span>
              </div>

              <CardPreview
                word={word}
                meaning={meaning}
                phonetic={phonetic}
                exampleSentence={exampleSentence}
                collocations={collocations}
                mnemonic={mnemonic}
                audioUrl={audioUrl}
                imageUrl={imageUrl}
                deckColor={deckColor}
                className="w-full max-w-sm"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border border-[#e5e5e5] text-xs font-semibold text-[#525252] hover:text-black hover:bg-white transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#fafafa] text-[#7e22ce] hover:text-[#6b21a8] border border-[#e9d5ff] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Lưu & Thêm từ tiếp
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className="btn-primary h-9 px-5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer inline-flex items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                )}
                <span>Lưu thẻ</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
