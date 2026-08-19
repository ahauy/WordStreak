import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { CardPreview } from "./CardPreview";
import type { UpdateCardDto, CardResponse } from "@wordstreak/shared-types";

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardResponse | null;
  onUpdate: (id: string, dto: UpdateCardDto) => Promise<void | CardResponse>;
  deckTitle?: string;
  deckColor?: string;
}

interface EditCardModalDialogProps {
  card: CardResponse;
  onClose: () => void;
  onUpdate: (id: string, dto: UpdateCardDto) => Promise<void | CardResponse>;
  deckTitle?: string;
  deckColor?: string;
}

const EditCardModalDialog: React.FC<EditCardModalDialogProps> = ({
  card,
  onClose,
  onUpdate,
  deckTitle = "Bộ từ vựng",
  deckColor = "#6366F1",
}) => {
  const [word, setWord] = useState(card.word || "");
  const [meaning, setMeaning] = useState(card.meaning || "");
  const [phonetic, setPhonetic] = useState(card.phonetic || "");
  const [exampleSentence, setExampleSentence] = useState(
    card.exampleSentence || "",
  );
  const [collocations, setCollocations] = useState(card.collocations || "");
  const [mnemonic, setMnemonic] = useState(card.mnemonic || "");
  const [audioUrl, setAudioUrl] = useState(card.audioUrl || "");
  const [imageUrl, setImageUrl] = useState(card.imageUrl || "");

  const hasExtra = Boolean(
    card.exampleSentence ||
    card.collocations ||
    card.mnemonic ||
    card.audioUrl ||
    card.imageUrl,
  );

  const [showAdvanced, setShowAdvanced] = useState(hasExtra);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ word?: string; meaning?: string }>({});

  const wordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      wordInputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

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

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const dto: UpdateCardDto = {
        word: word.trim(),
        meaning: meaning.trim(),
        phonetic: phonetic.trim() || undefined,
        exampleSentence: exampleSentence.trim() || undefined,
        collocations: collocations.trim() || undefined,
        mnemonic: mnemonic.trim() || undefined,
        audioUrl: audioUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      await onUpdate(card.id, dto);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi cập nhật thẻ";
      setErrors((prev) => ({ ...prev, word: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-card-modal-title"
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
                id="edit-card-modal-title"
                className="text-base sm:text-lg font-bold text-black tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Chỉnh sửa thẻ từ vựng
              </h2>
              <p className="text-xs text-[#737373]">
                Bộ từ:{" "}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          {/* Form Left */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label
                htmlFor="edit-card-word"
                className="block text-xs font-semibold text-[#525252] uppercase tracking-wider mb-1"
              >
                Từ vựng <span className="text-[#ff5f56]">*</span>
              </label>
              <input
                id="edit-card-word"
                ref={wordInputRef}
                type="text"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                  if (errors.word)
                    setErrors((prev) => ({ ...prev, word: undefined }));
                }}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl bg-[#fafafa] focus:bg-white border border-[#e5e5e5] text-black text-sm font-semibold focus:outline-none focus:border-black"
              />
              {errors.word && (
                <p className="mt-1 text-xs text-[#ff5f56] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.word}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label
                  htmlFor="edit-card-phonetic"
                  className="block text-xs font-semibold text-[#525252] uppercase tracking-wider mb-1"
                >
                  Phiên âm IPA
                </label>
                <input
                  id="edit-card-phonetic"
                  type="text"
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 rounded-xl bg-[#fafafa] focus:bg-white border border-[#e5e5e5] text-[#7e22ce] font-mono text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-7">
                <label
                  htmlFor="edit-card-meaning"
                  className="block text-xs font-semibold text-[#525252] uppercase tracking-wider mb-1"
                >
                  Nghĩa Tiếng Việt <span className="text-[#ff5f56]">*</span>
                </label>
                <input
                  id="edit-card-meaning"
                  type="text"
                  value={meaning}
                  onChange={(e) => {
                    setMeaning(e.target.value);
                    if (errors.meaning)
                      setErrors((prev) => ({ ...prev, meaning: undefined }));
                  }}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 rounded-xl bg-[#fafafa] focus:bg-white border border-[#e5e5e5] text-black text-xs sm:text-sm focus:outline-none focus:border-black"
                />
                {errors.meaning && (
                  <p className="mt-1 text-xs text-[#ff5f56] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.meaning}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-between text-xs font-semibold text-[#525252] hover:text-black transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#7e22ce]" />
                  Ngữ cảnh mở rộng & Mẹo ghi nhớ
                </span>
                {showAdvanced ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#737373]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] space-y-3 animate-fadeIn">
                  <div>
                    <label
                      htmlFor="edit-card-example"
                      className="block text-xs font-medium text-[#525252] mb-1"
                    >
                      Câu ví dụ (Example Sentence)
                    </label>
                    <textarea
                      id="edit-card-example"
                      rows={2}
                      value={exampleSentence}
                      onChange={(e) => setExampleSentence(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black resize-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-card-collocations"
                      className="block text-xs font-medium text-[#525252] mb-1"
                    >
                      Cụm từ đi kèm (Collocations)
                    </label>
                    <input
                      id="edit-card-collocations"
                      type="text"
                      value={collocations}
                      onChange={(e) => setCollocations(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-card-mnemonic"
                      className="block text-xs font-medium text-[#92400e] mb-1 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#d97706]" />
                      Mẹo ghi nhớ (Mnemonic)
                    </label>
                    <textarea
                      id="edit-card-mnemonic"
                      rows={2}
                      value={mnemonic}
                      onChange={(e) => setMnemonic(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] text-xs focus:outline-none focus:border-[#d97706] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="edit-card-audio"
                        className="block text-xs font-medium text-[#737373] mb-1"
                      >
                        Audio URL (.mp3)
                      </label>
                      <input
                        id="edit-card-audio"
                        type="url"
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-card-image"
                        className="block text-xs font-medium text-[#737373] mb-1"
                      >
                        Image URL (Link ảnh)
                      </label>
                      <input
                        id="edit-card-image"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e5e5e5] text-black text-xs focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
            <div className="text-center mb-2">
              <span className="text-[11px] font-semibold text-[#7e22ce] tracking-wider uppercase">
                Xem trước thực tế
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-full border border-[#e5e5e5] text-xs font-semibold text-[#525252] hover:text-black hover:bg-white transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="btn-primary h-9 px-5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer inline-flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-white" />
            )}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const EditCardModal: React.FC<EditCardModalProps> = ({
  isOpen,
  onClose,
  card,
  onUpdate,
  deckTitle,
  deckColor,
}) => {
  if (!isOpen || !card) return null;

  return (
    <AnimatePresence>
      <EditCardModalDialog
        key={card.id}
        card={card}
        onClose={onClose}
        onUpdate={onUpdate}
        deckTitle={deckTitle}
        deckColor={deckColor}
      />
    </AnimatePresence>
  );
};
