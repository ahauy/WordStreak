import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Volume2,
  BookmarkPlus,
  Share2,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  Lightbulb,
  BookOpen,
  LogIn,
  UserPlus,
  Flame,
} from "lucide-react";
import { publicWordService } from "../services/publicWordService";
import { useAuthStore } from "../../../store/useAuthStore";
import { decksService } from "../../decks/services/decksService";
import { cardsService } from "../../cards/services/cardsService";
import { getGuestPreviewState, saveGuestPreviewState, type GuestCard } from "../../landing/utils/guestStorage";
import type { AiGeneratedCardData, DeckResponse } from "@wordstreak/shared-types";

export const PublicWordPage: React.FC = () => {
  const { word: rawWord } = useParams<{ word: string }>();
  const decodedWord = rawWord ? decodeURIComponent(rawWord).trim() : "";

  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<AiGeneratedCardData | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(decodedWord));
  const [error, setError] = useState<string | null>(() => (decodedWord ? null : "Từ vựng không hợp lệ."));
  const [prevWord, setPrevWord] = useState(decodedWord);

  if (prevWord !== decodedWord) {
    setPrevWord(decodedWord);
    setIsLoading(Boolean(decodedWord));
    setError(decodedWord ? null : "Từ vựng không hợp lệ.");
    setData(null);
  }

  // Audio playing state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Action feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userDecks, setUserDecks] = useState<DeckResponse[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [showDeckSelector, setShowDeckSelector] = useState(false);

  // Dynamic document title & meta tags
  useEffect(() => {
    if (decodedWord) {
      document.title = `${decodedWord} - Định nghĩa, Phát âm & Ví dụ | WordStreak`;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute(
        "content",
        `Học từ vựng "${decodedWord}" kèm phiên âm IPA, nghĩa tiếng Việt, câu ví dụ và cụm từ cố định theo phương pháp lặp lại ngắt quãng SM-2 miễn phí trên WordStreak.`
      );
    }
  }, [decodedWord]);

  // Load word details
  useEffect(() => {
    if (!decodedWord) {
      return;
    }

    let isCancelled = false;

    publicWordService
      .getWordDetails(decodedWord)
      .then((card) => {
        if (!isCancelled) {
          setData(card);
          setIsLoading(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Không tìm thấy từ vựng.";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [decodedWord]);

  // If authenticated, pre-fetch user decks for saving
  useEffect(() => {
    if (isAuthenticated) {
      decksService
        .getDecks()
        .then((decks) => {
          setUserDecks(decks);
          if (decks.length > 0) {
            setSelectedDeckId(decks[0].id);
          }
        })
        .catch(() => {
          // Ignore decks loading failure
        });
    }
  }, [isAuthenticated]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const handlePlayAudio = () => {
    if (!data) return;
    setIsPlayingAudio(true);

    if (data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        playWebSpeech();
      };
      audio.play().catch(() => playWebSpeech());
    } else {
      playWebSpeech();
    }
  };

  const playWebSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data?.word || decodedWord);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleSaveToDeck = async (deckIdToUse?: string) => {
    if (!data) return;
    const targetDeckId = deckIdToUse || selectedDeckId;
    if (!targetDeckId) {
      setShowDeckSelector(true);
      return;
    }

    setIsSaving(true);
    try {
      await cardsService.createCard(targetDeckId, {
        word: data.word,
        meaning: data.meaningVi || data.meaningEn,
        phonetic: data.phonetic,
        exampleSentence: data.exampleSentence,
        collocations: Array.isArray(data.collocations) ? data.collocations.join(", ") : data.collocations || null,
        mnemonic: data.mnemonic,
        audioUrl: data.audioUrl,
      });
      setIsSaved(true);
      setShowDeckSelector(false);
      showToast("Đã lưu từ vựng vào bộ từ của bạn!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu từ.";
      showToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGuestPreview = () => {
    if (!data) return;
    try {
      const current = getGuestPreviewState();
      const newCard: GuestCard = {
        id: `guest-custom-${Date.now()}`,
        word: data.word,
        ipa: data.phonetic,
        pos: data.partOfSpeech,
        definitionVi: data.meaningVi,
        definitionEn: data.meaningEn,
        exampleEn: data.exampleSentence,
        exampleVi: data.exampleTranslation,
      };

      const existingCardsRaw = localStorage.getItem("wordstreak_guest_custom_cards");
      const existingCards: GuestCard[] = existingCardsRaw ? JSON.parse(existingCardsRaw) : [];
      const updatedCards = [...existingCards.filter((c) => c.word.toLowerCase() !== data.word.toLowerCase()), newCard];
      localStorage.setItem("wordstreak_guest_custom_cards", JSON.stringify(updatedCards));

      saveGuestPreviewState({
        ...current,
        isCompleted: false,
      });

      setIsSaved(true);
      showToast("Đã thêm vào phiên học thử của bạn!");
    } catch {
      showToast("Đã thêm vào phiên học thử!");
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Đã sao chép liên kết vào bộ nhớ tạm!");
      } else {
        showToast("Liên kết: " + shareUrl);
      }
    } catch {
      showToast("Không thể sao chép liên kết.");
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#000000] flex flex-col font-['Inter',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#000000] text-[#ffffff] px-4 py-2.5 rounded-full text-xs font-medium shadow-lg border border-[#333333] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Navigation */}
      <header className="border-b border-[#e5e5e5] bg-[#ffffff] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#000000] hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-full bg-[#000000] flex items-center justify-center text-white">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="font-['Nunito',sans-serif] font-bold text-base tracking-tight">WordStreak</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#000000] hover:bg-[#f0f0f0] transition-colors"
              >
                <span>Bàn học</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#525252] hover:text-[#000000] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#000000] text-[#ffffff] hover:bg-[#1a1a1a] transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng ký miễn phí</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/library"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#000000] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Thư viện từ vựng</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#525252] border border-[#e5e5e5] hover:border-[#000000] hover:text-[#000000] transition-all cursor-pointer bg-[#ffffff]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia sẻ từ vựng</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-[#737373]">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-black animate-spin mb-3" />
            <p className="text-xs font-medium">Đang tra cứu từ điển...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h2 className="font-['Nunito',sans-serif] font-bold text-base text-[#000000]">
              Không tìm thấy từ vựng
            </h2>
            <p className="text-xs text-[#737373] mt-1 mb-4 leading-relaxed">
              Chúng tôi chưa có dữ liệu cho từ &ldquo;{decodedWord}&rdquo;. Bạn có thể thử tra từ khác hoặc quay về trang chủ.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold bg-[#000000] text-[#ffffff] hover:bg-[#1a1a1a]"
            >
              Về trang chủ
            </Link>
          </div>
        )}

        {/* Word Display Article */}
        {!isLoading && !error && data && (
          <article className="space-y-8 animate-in fade-in duration-200">
            {/* Word Header Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-[#e5e5e5] bg-[#ffffff] relative">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#e5e5e5] pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-['Nunito',sans-serif] font-extrabold text-3xl sm:text-4xl text-[#000000] tracking-tight">
                      {data.word}
                    </h1>
                    {data.partOfSpeech && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                        {data.partOfSpeech}
                      </span>
                    )}
                  </div>

                  {data.phonetic && (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-[#737373]">
                        {data.phonetic}
                      </span>
                      <button
                        type="button"
                        onClick={handlePlayAudio}
                        aria-label={`Nghe phát âm từ ${data.word}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#e5e5e5] transition-all cursor-pointer ${
                          isPlayingAudio
                            ? "bg-[#000000] text-[#ffffff] border-[#000000]"
                            : "bg-[#fafafa] text-[#000000] hover:border-[#000000]"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlayingAudio ? "Đang phát..." : "Phát âm"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary Action Button Cluster */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  {isAuthenticated ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (userDecks.length <= 1) {
                            handleSaveToDeck(userDecks[0]?.id);
                          } else {
                            setShowDeckSelector(!showDeckSelector);
                          }
                        }}
                        disabled={isSaving || isSaved}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSaved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-[#000000] text-[#ffffff] hover:bg-[#1a1a1a]"
                        }`}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                        <span>{isSaved ? "Đã lưu vào bộ từ" : isSaving ? "Đang lưu..." : "Lưu vào bộ từ"}</span>
                      </button>

                      {/* Dropdown deck selector if user has multiple decks */}
                      {showDeckSelector && userDecks.length > 1 && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white border border-[#e5e5e5] shadow-xl p-2 z-40">
                          <p className="text-[11px] font-semibold text-[#737373] px-2 py-1">Chọn bộ từ để lưu:</p>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {userDecks.map((deck) => (
                              <button
                                key={deck.id}
                                type="button"
                                onClick={() => handleSaveToDeck(deck.id)}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-[#fafafa] text-[#000000] flex items-center justify-between"
                              >
                                <span className="truncate">{deck.title}</span>
                                <span className="text-[10px] text-[#737373]">{deck.stats?.totalCards || 0} từ</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddGuestPreview}
                        disabled={isSaved}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSaved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-[#ffffff] text-[#000000] border-[#e5e5e5] hover:border-[#000000]"
                        }`}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                        <span>{isSaved ? "Đã thêm" : "Thêm vào phiên học thử"}</span>
                      </button>

                      <Link
                        to="/register"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#000000] text-[#ffffff] hover:bg-[#1a1a1a] transition-colors"
                      >
                        <span>Đăng ký để ghi nhớ vĩnh viễn</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Definitions section */}
              <div className="pt-6 space-y-4">
                {data.meaningVi && (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373] mb-1">
                      Nghĩa Tiếng Việt
                    </h2>
                    <p className="text-base sm:text-lg font-semibold text-[#000000]">
                      {data.meaningVi}
                    </p>
                  </div>
                )}

                {data.meaningEn && (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373] mb-1">
                      Định nghĩa Tiếng Anh
                    </h2>
                    <p className="text-sm text-[#525252] leading-relaxed">
                      {data.meaningEn}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Example Sentences Box */}
            {(data.exampleSentence || data.exampleTranslation) && (
              <section className="p-6 rounded-2xl border border-[#e5e5e5] bg-[#ffffff] space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#000000]" />
                  <h3 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000]">
                    Ví dụ trong ngữ cảnh
                  </h3>
                </div>

                <div className="pl-4 border-l-2 border-[#000000] space-y-1 py-1">
                  {data.exampleSentence && (
                    <p className="text-sm font-medium text-[#000000] italic">
                      &ldquo;{data.exampleSentence}&rdquo;
                    </p>
                  )}
                  {data.exampleTranslation && (
                    <p className="text-xs text-[#737373]">
                      {data.exampleTranslation}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Collocations Box */}
            {data.collocations && data.collocations.length > 0 && (
              <section className="p-6 rounded-2xl border border-[#e5e5e5] bg-[#ffffff] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#000000]" />
                  <h3 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000]">
                    Cụm từ đi kèm thường gặp (Collocations)
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {data.collocations.map((colloc, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#000000]"
                    >
                      {colloc}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Mnemonic Memory Trick Box */}
            {data.mnemonic && (
              <section className="p-6 rounded-2xl border border-[#e9d5ff] bg-[#faf5ff] space-y-2">
                <div className="flex items-center gap-2 text-[#7e22ce]">
                  <Lightbulb className="w-4 h-4" />
                  <h3 className="font-['Nunito',sans-serif] font-bold text-sm">
                    Mẹo ghi nhớ nhanh (Mnemonic)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#581c87] leading-relaxed">
                  {data.mnemonic}
                </p>
              </section>
            )}

            {/* Bottom Call to Action for Guests */}
            {!isAuthenticated && (
              <div className="p-6 sm:p-8 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <h4 className="font-['Nunito',sans-serif] font-bold text-base text-[#000000]">
                    Muốn ghi nhớ &ldquo;{data.word}&rdquo; mãi mãi?
                  </h4>
                  <p className="text-xs text-[#737373] max-w-lg">
                    WordStreak sử dụng thuật toán Spaced Repetition (SM-2) tự động nhắc nhở bạn ôn tập đúng thời điểm vàng trước khi quên. Hoàn toàn miễn phí 100%.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#000000] text-[#ffffff] hover:bg-[#1a1a1a] transition-all whitespace-nowrap shrink-0"
                >
                  Tạo tài khoản ngay
                </Link>
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  );
};
