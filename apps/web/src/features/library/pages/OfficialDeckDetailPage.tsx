import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Volume2,
  BookOpen,
  CheckCircle,
  Plus,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { libraryService } from "../services/libraryService";
import type { OfficialDeckDetailResponse } from "@wordstreak/shared-types";

export const OfficialDeckDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<OfficialDeckDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let ignore = false;

    libraryService
      .getOfficialDeckBySlug(slug)
      .then((res) => {
        if (!ignore) {
          setData(res);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error
              ? err.message
              : "Không tìm thấy bộ từ hoặc xảy ra lỗi tải dữ liệu.";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [slug]);

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEnroll = async () => {
    if (!data?.deck.id) return;
    setIsEnrolling(true);
    try {
      await libraryService.enrollOfficialDeck(data.deck.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              isEnrolled: true,
              deck: { ...prev.deck, isEnrolled: true },
            }
          : prev,
      );
    } catch (err) {
      console.error("Enrollment failed:", err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStartStudy = async () => {
    if (!data?.deck.id) return;
    if (!data.isEnrolled) {
      await handleEnroll();
    }
    // Navigate to decks or dashboard review
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#090909]">
      <DashboardNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Back Link */}
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#090909] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Thư viện
        </Link>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-[#737373]">
            <RefreshCw className="w-6 h-6 animate-spin mb-3 text-black" />
            <p className="text-sm">Đang tải chi tiết bộ từ...</p>
          </div>
        ) : error || !data ? (
          <div className="rounded-2xl border border-[#e5e5e5] p-8 text-center bg-[#fafafa]">
            <AlertCircle className="w-8 h-8 text-[#ff5f56] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#090909]">
              {error || "Bộ từ không tồn tại."}
            </p>
            <Link
              to="/library"
              className="mt-4 inline-block px-4 py-2 rounded-full text-xs font-semibold bg-[#000000] text-white"
            >
              Về trang Thư viện
            </Link>
          </div>
        ) : (
          <div>
            {/* Deck Header Card */}
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-6 sm:p-8 mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffffff] border border-[#e5e5e5] text-[#090909]">
                  {data.deck.pathCode}
                </span>
                {data.deck.level && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ffffff] border border-[#e5e5e5] text-[#525252]">
                    {data.deck.level}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#737373] bg-[#ffffff] px-2.5 py-1 rounded-full border border-[#e5e5e5]">
                  CC BY-SA 4.0
                </span>
              </div>

              <h1 className="font-nunito font-extrabold text-2xl sm:text-3xl text-[#090909]">
                {data.deck.title}
              </h1>
              <p className="text-base text-[#525252] font-medium mt-1">
                {data.deck.titleVi}
              </p>

              {data.deck.description && (
                <p className="text-xs sm:text-sm text-[#737373] mt-3 max-w-2xl leading-relaxed">
                  {data.deck.description}
                </p>
              )}

              {/* Stats & Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-[#e5e5e5]">
                <div className="flex items-center gap-4 text-xs text-[#737373]">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#525252]" />
                    {data.totalCards} từ vựng
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#525252]" />
                    ~10 phút học
                  </span>
                  {data.isEnrolled && (
                    <span className="inline-flex items-center gap-1.5 text-black font-semibold">
                      <CheckCircle className="w-4 h-4 text-[#27c93f]" />
                      Đã thuộc: {data.masteredCount}/{data.totalCards}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!data.isEnrolled ? (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#ffffff] border border-[#e5e5e5] text-[#090909] hover:border-black transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {isEnrolling ? "Đang thêm..." : "Thêm vào thư viện"}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleStartStudy}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#000000] text-white hover:bg-[#171717] transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    Học ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Vocabulary Previews List */}
            <div className="mb-10">
              <h2 className="font-nunito font-bold text-lg text-[#090909] mb-4">
                Danh sách từ vựng ({data.totalCards} từ)
              </h2>

              <div className="space-y-3">
                {data.cards.map((c, idx) => {
                  const content = c.content || {};
                  return (
                    <div
                      key={c.cardId}
                      className="rounded-xl border border-[#e5e5e5] bg-[#ffffff] p-4 transition-all hover:border-[#d4d4d4]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Left: Word, Phonetic, POS, Meaning */}
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="text-xs font-mono font-medium text-[#a3a3a3] w-6 shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-nunito font-bold text-base text-[#090909]">
                                {c.headword}
                              </span>
                              <span className="text-[11px] font-semibold text-[#525252] bg-[#fafafa] px-2 py-0.5 rounded-full border border-[#e5e5e5]">
                                {c.pos}
                              </span>
                              {content.ipa_us && (
                                <span className="text-xs font-mono text-[#737373]">
                                  {content.ipa_us}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSpeak(c.headword)}
                                title="Nghe phát âm"
                                className="p-1 rounded-full text-[#737373] hover:text-[#090909] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm text-[#090909] font-medium mt-1">
                              {content.meaning_vi || c.headword}
                            </p>
                          </div>
                        </div>

                        {/* Right: User Status if enrolled */}
                        {c.userStatus && (
                          <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252] self-start sm:self-center">
                            {c.userStatus}
                          </span>
                        )}
                      </div>

                      {/* Example sentence */}
                      {content.example_en && (
                        <div className="mt-3 pt-2 border-t border-[#f5f5f5] text-xs text-[#525252]">
                          <p className="italic text-[#090909]">"{content.example_en}"</p>
                          {content.example_vi && (
                            <p className="text-[#737373] mt-0.5">{content.example_vi}</p>
                          )}
                        </div>
                      )}

                      {/* Collocations */}
                      {content.collocations && content.collocations.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] uppercase font-semibold text-[#a3a3a3]">
                            Collocations:
                          </span>
                          {content.collocations.map((col, cIdx) => (
                            <span
                              key={cIdx}
                              className="text-[11px] bg-[#fafafa] px-2 py-0.5 rounded-md border border-[#f0f0f0] text-[#525252]"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attribution Footer */}
            <div className="border-t border-[#e5e5e5] pt-6 text-xs text-[#737373] leading-relaxed">
              <p>
                Dữ liệu từ vựng và câu ví dụ thuộc Dự án NGSL & TSL của Browne, Culligan & Phillips theo giấy phép{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-black font-medium"
                >
                  CC BY-SA 4.0
                </a>
                . WordStreak không liên kết hay được chứng thực bởi ETS; TOEIC là nhãn hiệu đã đăng ký của ETS.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
