import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { useStreak } from "../../dashboard/hooks/useStreak";
import { useCommunityDecks } from "../hooks/useCommunityDecks";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import { FlameNurtureModal } from "../../dashboard/components/FlameNurtureModal";
import { CategoryFilterBar } from "../components/CategoryFilterBar";
import { CommunityDeckCard } from "../components/CommunityDeckCard";
import { CommunityDeckPreviewModal } from "../components/CommunityDeckPreviewModal";
import { RateDeckModal } from "../components/RateDeckModal";
import { communityService } from "../services/communityService";
import type {
  CommunityDeckItem,
  CommunityDeckSort,
} from "@wordstreak/shared-types";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export const CommunityDecksPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { currentStreak, flameTier, isActiveToday } = useStreak();

  const {
    decks,
    loading,
    error,
    totalPages,
    totalItems,
    search,
    category,
    sort,
    page,
    setPage,
    handleSearchChange,
    handleCategoryChange,
    handleSortChange,
    refetch,
  } = useCommunityDecks();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFlameNurtureOpen, setIsFlameNurtureOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "profile" | "avatar" | "security" | "gamification"
  >("profile");

  const [previewDeck, setPreviewDeck] = useState<CommunityDeckItem | null>(
    null,
  );
  const [rateDeck, setRateDeck] = useState<CommunityDeckItem | null>(null);
  const [cloningDeckId, setCloningDeckId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const openSettings = (
    tab: "profile" | "avatar" | "security" | "gamification" = "profile",
  ) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCloneDeck = async (deck: CommunityDeckItem) => {
    setCloningDeckId(deck.id);
    try {
      const res = await communityService.cloneDeck(deck.id);
      showToast("success", res.message);
      void refetch();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể sao chép bộ từ vựng";
      showToast("error", msg);
    } finally {
      setCloningDeckId(null);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white text-black selection:bg-[#f3e8ff] selection:text-[#7e22ce] flex flex-col justify-between">
        <div className="flex min-h-screen flex-col">
          {/* Dashboard Navigation */}
          <DashboardNavbar
            user={user}
            currentStreak={currentStreak}
            flameTier={flameTier}
            isActiveToday={isActiveToday}
            onOpenSettings={openSettings}
            onOpenFlameNurture={() => setIsFlameNurtureOpen(true)}
            onLogout={handleLogout}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
              <div
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
                  toastMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-red-50 text-red-900 border-red-200"
                }`}
              >
                {toastMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
            </div>
          )}

          {/* Hero Header Section */}
          <div className="border-b border-[#e5e5e5] bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#7e22ce] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Free Spaced Repetition Community</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Khám phá Bộ từ vựng chia sẻ
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-[#737373] max-w-2xl leading-relaxed">
                Tìm kiếm, học thử và sao chép các bộ từ vựng chất lượng cao được
                tổng hợp bởi giáo viên và cộng đồng người học trên toàn thế
                giới.
              </p>

              {/* Search Bar & Sort Dropdown */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tìm kiếm theo tên bộ từ, từ khóa hoặc tác giả..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black placeholder:text-[#a3a3a3] focus:bg-white focus:outline-none focus:border-black transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <SlidersHorizontal className="w-4 h-4 text-[#737373] hidden sm:block shrink-0" />
                  <select
                    value={sort}
                    onChange={(e) =>
                      handleSortChange(e.target.value as CommunityDeckSort)
                    }
                    className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm rounded-full border border-[#e5e5e5] bg-white text-[#525252] font-semibold focus:outline-none focus:border-black shadow-sm cursor-pointer transition-all"
                  >
                    <option value="POPULAR">
                      Phổ biến nhất (Lượt sao chép)
                    </option>
                    <option value="TOP_RATED">Đánh giá cao nhất (Sao)</option>
                    <option value="NEWEST">Mới nhất</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
            {/* Category Filters */}
            <div className="mb-5">
              <CategoryFilterBar
                selectedCategory={category}
                onSelectCategory={handleCategoryChange}
              />
            </div>

            {/* Content Header Metrics */}
            <div className="flex items-center justify-between text-xs text-[#737373] mb-4 px-1">
              <span className="font-mono">
                Hiển thị <strong>{decks.length}</strong> /{" "}
                <strong>{totalItems}</strong> bộ từ
              </span>
              {category !== "ALL" && (
                <button
                  type="button"
                  onClick={() => handleCategoryChange("ALL")}
                  className="text-[#7e22ce] font-semibold hover:underline cursor-pointer"
                >
                  Xóa bộ lọc danh mục
                </button>
              )}
            </div>

            {/* Deck Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl border border-[#e5e5e5] bg-white p-5 animate-pulse flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="w-20 h-5 bg-[#fafafa] border border-[#e5e5e5] rounded-full" />
                      <div className="w-3/4 h-6 bg-[#fafafa] rounded" />
                      <div className="w-full h-10 bg-[#fafafa] rounded" />
                    </div>
                    <div className="w-full h-8 bg-[#fafafa] rounded-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-center max-w-lg mx-auto">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="font-semibold text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-4 px-5 py-2 text-xs font-semibold bg-black text-white rounded-full hover:bg-[#171717] cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            ) : decks.length === 0 ? (
              <div className="py-16 text-center rounded-3xl border border-dashed border-[#e5e5e5] bg-[#fafafa] p-8 max-w-lg mx-auto">
                <Sparkles className="w-8 h-8 text-[#7e22ce] mx-auto mb-3" />
                <h3
                  className="text-base font-bold text-black"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Không tìm thấy bộ từ vựng nào
                </h3>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                  Không có bộ từ nào khớp với từ khóa tìm kiếm hoặc danh mục đã
                  chọn. Hãy thử đổi từ khóa khác.
                </p>
                {(search || category !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSearchChange("");
                      handleCategoryChange("ALL");
                    }}
                    className="mt-4 px-5 py-2 text-xs font-semibold bg-black text-white rounded-full hover:bg-[#171717] cursor-pointer"
                  >
                    Đặt lại tìm kiếm
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {decks.map((deck) => (
                  <CommunityDeckCard
                    key={deck.id}
                    deck={deck}
                    onPreview={(d) => setPreviewDeck(d)}
                    onClone={(d) => void handleCloneDeck(d)}
                    onRate={(d) => setRateDeck(d)}
                    isCloning={cloningDeckId === deck.id}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-full border border-[#e5e5e5] bg-white text-black hover:bg-[#fafafa] hover:border-[#d4d4d4] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-4 py-1.5 text-xs font-mono font-medium rounded-full bg-white border border-[#e5e5e5] text-black shadow-sm">
                  Trang {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-full border border-[#e5e5e5] bg-white text-black hover:bg-[#fafafa] hover:border-[#d4d4d4] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Modals */}
        <CommunityDeckPreviewModal
          deck={previewDeck}
          isOpen={Boolean(previewDeck)}
          onClose={() => setPreviewDeck(null)}
          onClone={(d) => void handleCloneDeck(d)}
          onRate={(d) => setRateDeck(d)}
          isCloning={cloningDeckId === previewDeck?.id}
        />

        <RateDeckModal
          deck={rateDeck}
          isOpen={Boolean(rateDeck)}
          onClose={() => setRateDeck(null)}
          onSuccess={() => void refetch()}
        />

        {/* Global Settings & Flame Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsTab}
        />

        <FlameNurtureModal
          isOpen={isFlameNurtureOpen}
          onClose={() => setIsFlameNurtureOpen(false)}
        />
      </div>
    </PageTransition>
  );
};
