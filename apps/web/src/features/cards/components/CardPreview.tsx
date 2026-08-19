import React, { useState } from "react";
import { Volume2, Sparkles, Lightbulb, RotateCw } from "lucide-react";
import { playWordPronunciation } from "../utils/speech";

interface CardPreviewProps {
  word: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
  exampleSentence?: string;
  collocations?: string;
  mnemonic?: string;
  imageUrl?: string;
  deckColor?: string;
  className?: string;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  word,
  meaning,
  phonetic,
  audioUrl,
  exampleSentence,
  collocations,
  mnemonic,
  imageUrl,
  deckColor = "#6366F1",
  className = "",
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAudioClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word.trim()) return;
    try {
      setIsPlayingAudio(true);
      await playWordPronunciation(word, audioUrl);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const collocationsList = collocations
    ? collocations
        .split(/[,;\n]+/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Flip Card Container */}
      <div
        className="w-full h-80 relative cursor-pointer group"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-label="Xem trước Flashcard 3D. Nhấn để lật mặt thẻ"
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }}
      >
        <div
          className="w-full h-full relative duration-500 transition-transform rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT FACE */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden border border-[#e5e5e5] bg-white text-black"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Top Color Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: deckColor }}
            />

            {/* Header / Badges */}
            <div className="flex items-center justify-between z-10 pt-1">
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#fafafa] text-[#525252] border border-[#e5e5e5] flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: deckColor }}
                />
                Mặt trước (Front)
              </span>

              <button
                type="button"
                onClick={handleAudioClick}
                disabled={!word.trim()}
                title="Phát âm từ vựng (Web Speech / Audio)"
                aria-label="Phát âm từ vựng"
                className={`p-2 rounded-full border transition-all duration-200 ${
                  isPlayingAudio
                    ? "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff] scale-110 shadow-sm"
                    : "bg-[#fafafa] hover:bg-[#f5f5f5] text-[#525252] hover:text-black border-[#e5e5e5]"
                } ${!word.trim() ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Volume2
                  className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
              </button>
            </div>

            {/* Center Content */}
            <div className="flex flex-col items-center justify-center my-auto text-center px-4 z-10">
              {imageUrl && (
                <div className="mb-3 max-h-24 w-auto rounded-lg overflow-hidden border border-[#e5e5e5] shadow-xs">
                  <img
                    src={imageUrl}
                    alt={word || "Card visual"}
                    className="max-h-24 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <h3
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-1.5 break-words max-w-full"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {word.trim() || (
                  <span className="text-[#a3a3a3] italic font-normal">
                    Nhập từ vựng...
                  </span>
                )}
              </h3>

              {phonetic && (
                <span className="text-xs font-mono font-medium text-[#7e22ce] bg-[#f3e8ff] px-2.5 py-0.5 rounded-full border border-[#e9d5ff]">
                  {phonetic}
                </span>
              )}
            </div>

            {/* Footer Prompt */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#737373] z-10">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-[#7e22ce]" />
              <span>Chạm để lật xem nghĩa</span>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-y-auto border border-[#e5e5e5] bg-[#fafafa] text-black"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Top Color Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: deckColor }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-2 pt-1">
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#9333ea]" />
                Mặt sau (Back)
              </span>

              <span className="text-xs text-[#737373] font-medium">
                {word || "Từ vựng"}
              </span>
            </div>

            {/* Back Content */}
            <div className="space-y-3 overflow-y-auto pr-1 my-auto custom-scrollbar">
              {/* Meaning */}
              <div className="text-center">
                <p className="text-base sm:text-lg font-bold text-black leading-snug">
                  {meaning.trim() || (
                    <span className="text-[#a3a3a3] italic text-xs font-normal">
                      Chưa có nghĩa...
                    </span>
                  )}
                </p>
              </div>

              {/* Example Sentence */}
              {exampleSentence && (
                <div className="p-3 rounded-xl bg-white border border-[#e5e5e5] text-left">
                  <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider block mb-1">
                    Ví dụ ngữ cảnh
                  </span>
                  <p className="text-xs text-[#525252] italic leading-relaxed">
                    "{exampleSentence}"
                  </p>
                </div>
              )}

              {/* Collocations */}
              {collocationsList.length > 0 && (
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider block mb-1.5">
                    Cụm từ hay gặp
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {collocationsList.map((col, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white text-[#525252] border border-[#e5e5e5]"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mnemonic */}
              {mnemonic && (
                <div className="p-2.5 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-left flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#92400e] leading-snug">
                    {mnemonic}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#737373] mt-2">
              <RotateCw className="w-3.5 h-3.5 text-[#7e22ce]" />
              <span>Chạm để quay lại mặt trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="text-xs font-semibold px-3 py-1 rounded-full bg-white hover:bg-[#fafafa] text-[#525252] hover:text-black border border-[#e5e5e5] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RotateCw className="w-3 h-3 text-[#7e22ce]" />
          {isFlipped ? "Xem mặt trước (Front)" : "Xem mặt sau (Back)"}
        </button>
      </div>
    </div>
  );
};
