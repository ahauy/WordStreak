import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { OfficialDeckCard } from "../components/OfficialDeckCard";
import { SourceAttributionBadge } from "../components/SourceAttributionBadge";
import { FoundationPathView } from "../../foundation/components/FoundationPathView";
import { ToeicAdvancedSection } from "../../toeic-advanced/components/ToeicAdvancedSection";
import { AcademicPathSection } from "../../academic/components/AcademicPathSection";
import { libraryService } from "../services/libraryService";
import type { OfficialDeckDto } from "@wordstreak/shared-types";

const CURRICULUM_PATHS = [
  { code: "ALL", label: "Tất cả lộ trình" },
  { code: "TOEIC", label: "TOEIC Mastery (TSL)" },
  { code: "FOUNDATION", label: "Chặng Khởi động (NGSL Top 300)" },
  { code: "CORE", label: "Nền tảng cốt lõi (NGSL)" },
  { code: "ACADEMIC", label: "IELTS & Học thuật (NAWL)" },
  { code: "BUSINESS", label: "Tiếng Anh Thương mại (BSL)" },
  { code: "COMMUNICATION", label: "Giao tiếp hàng ngày (NGSL-S)" },
];

const LEVEL_OPTIONS = [
  { code: "ALL", label: "Tất cả cấp độ" },
  { code: "T1", label: "Cấp độ 1 (Cơ bản)" },
  { code: "T2", label: "Cấp độ 2 (Trung cấp)" },
  { code: "T3", label: "Cấp độ 3 (Nâng cao)" },
];

export const LibraryPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [searchTopic, setSearchTopic] = useState("");
  const [decks, setDecks] = useState<OfficialDeckDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingMap, setEnrollingMap] = useState<Record<string, boolean>>({});
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    libraryService
      .getOfficialDecks({
        pathCode: selectedPath,
        level: selectedLevel,
        topic: searchTopic.trim() || undefined,
        limit: 50,
      })
      .then((data) => {
        if (!ignore) {
          setDecks(data.decks || []);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message =
            err instanceof Error ? err.message : "Không thể tải danh sách bộ từ thư viện.";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedPath, selectedLevel, searchTopic, refreshIndex]);

  const handleEnroll = async (deckId: string) => {
    setEnrollingMap((prev) => ({ ...prev, [deckId]: true }));
    try {
      await libraryService.enrollOfficialDeck(deckId);
      setDecks((prev) =>
        prev.map((d) => (d.id === deckId ? { ...d, isEnrolled: true } : d)),
      );
    } catch (err) {
      console.error("Enrollment failed:", err);
    } finally {
      setEnrollingMap((prev) => ({ ...prev, [deckId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#090909]">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              Thư viện Chuẩn hóa Khoa học
            </span>
            <span className="text-xs text-[#737373]">
              Dựa trên nghiên cứu NGSL & TSL của Browne, Culligan & Phillips
            </span>
          </div>

          <h1 className="font-nunito font-extrabold text-3xl sm:text-4xl text-[#090909] tracking-tight">
            Thư viện Từ vựng Chính thức
          </h1>
          <p className="text-[#525252] text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Các bộ từ 25 từ được tinh tuyển theo tần suất thực tế và ngữ cảnh công sở/học thuật.
            Thêm vào lộ trình học chỉ với 1 chạm, ôn tập thông minh bằng thuật toán SM-2.
          </p>
        </div>

        {/* Path Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          {CURRICULUM_PATHS.map((path) => {
            const active = selectedPath === path.code;
            return (
              <button
                key={path.code}
                type="button"
                onClick={() => setSelectedPath(path.code)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-[#000000] text-white shadow-xs"
                    : "bg-[#fafafa] text-[#525252] border border-[#e5e5e5] hover:border-[#d4d4d4] hover:text-[#090909]"
                }`}
              >
                {path.label}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8">
          {/* Level Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {LEVEL_OPTIONS.map((lvl) => {
              const active = selectedLevel === lvl.code;
              return (
                <button
                  key={lvl.code}
                  type="button"
                  onClick={() => setSelectedLevel(lvl.code)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-[#090909] text-white"
                      : "bg-[#ffffff] text-[#737373] border border-[#e5e5e5] hover:text-[#090909]"
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Tìm theo chủ đề, tên bộ từ..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs bg-[#ffffff] border border-[#e5e5e5] focus:outline-none focus:border-[#000000] text-[#090909] placeholder:text-[#a3a3a3]"
            />
          </div>
        </div>

        {/* Content Area */}
        {selectedPath === "FOUNDATION" ? (
          <FoundationPathView />
        ) : selectedPath === "ACADEMIC" ? (
          <AcademicPathSection />
        ) : isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#737373]">
            <RefreshCw className="w-6 h-6 animate-spin mb-3 text-black" />
            <p className="text-sm">Đang tải các bộ từ chuẩn hóa...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#e5e5e5] p-8 text-center bg-[#fafafa]">
            <AlertCircle className="w-8 h-8 text-[#ff5f56] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#090909]">{error}</p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setRefreshIndex((i) => i + 1);
              }}
              className="mt-4 px-4 py-2 rounded-full text-xs font-semibold bg-[#000000] text-white cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : decks.length === 0 ? (
          <div className="rounded-2xl border border-[#e5e5e5] p-12 text-center bg-[#fafafa]">
            <BookOpen className="w-10 h-10 text-[#a3a3a3] mx-auto mb-3" />
            <h3 className="font-nunito font-bold text-base text-[#090909]">
              Không tìm thấy bộ từ phù hợp
            </h3>
            <p className="text-xs text-[#737373] mt-1 max-w-md mx-auto">
              Hãy thử chọn lộ trình hoặc bộ lọc cấp độ khác, hoặc xóa từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <OfficialDeckCard
                key={deck.id}
                deck={deck}
                onEnroll={handleEnroll}
                isEnrolling={enrollingMap[deck.id]}
              />
            ))}
          </div>
        )}

        {/* TOEIC Advanced Modules (Displayed when All paths or TOEIC path is active) */}
        {(selectedPath === "ALL" || selectedPath === "TOEIC") && (
          <div className="mt-14 pt-8 border-t border-[#e5e5e5]">
            <ToeicAdvancedSection />
          </div>
        )}

        {/* Licensing & Attribution Footer */}
        <div className="mt-16 pt-6 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
          <div className="flex items-center gap-2">
            <SourceAttributionBadge showLink={true} href="/sources" />
            <p>
              Danh mục từ vựng học thuật dựa trên NGSL & TSL của Browne, Culligan & Phillips (CC BY-SA 4.0).
            </p>
          </div>
          <Link
            to="/sources"
            className="hover:text-black underline font-medium"
          >
            Chính sách bản quyền & Nguồn dữ liệu
          </Link>
        </div>
      </main>
    </div>
  );
};
