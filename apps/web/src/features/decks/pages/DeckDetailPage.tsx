import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Globe,
  Lock,
  Edit2,
  Layers,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { decksService } from "../services/decksService";
import { useCards } from "../../cards/hooks/useCards";
import { CardItemCard } from "../../cards/components/CardItemCard";
import { CardDataTable } from "../../cards/components/CardDataTable";
import { BulkActionsToolbar } from "../../cards/components/BulkActionsToolbar";
import { AddCardModal } from "../../cards/components/AddCardModal";
import { EditCardModal } from "../../cards/components/EditCardModal";
import { DeleteCardConfirmModal } from "../../cards/components/DeleteCardConfirmModal";
import { EditDeckModal } from "../components/EditDeckModal";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { DeckIcon, getColorTheme } from "../constants/deckThemes";
import type {
  DeckResponse,
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
  CardStatusFilter,
} from "@wordstreak/shared-types";

const VIEW_MODE_STORAGE_KEY = "wordstreak_deck_view_mode";

export const DeckDetailPage: React.FC = () => {
  const { id: deckId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<DeckResponse | null>(null);
  const [isDeckLoading, setIsDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);

  // View Mode: 'grid' | 'table' (with localStorage persistence)
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return saved === "table" ? "table" : "grid";
  });

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  // Cards Hook with Server-side Pagination & Filter & Bulk state
  const {
    cards,
    paginationMeta,
    isLoading: isCardsLoading,
    page,
    setPage,
    limit,
    setLimit,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedCardIds,
    toggleSelectCard,
    selectAllCards,
    clearSelection,
    isAllSelected,
    isBulkLoading,
    executeBulkAction,
    createCard,
    updateCard,
    deleteCard,
  } = useCards(deckId || "");

  // Modals state
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardResponse | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardResponse | null>(null);
  const [isDeletingCardLoading, setIsDeletingCardLoading] = useState(false);
  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false);

  // Fetch Deck metadata
  const fetchDeckDetails = useCallback(async () => {
    if (!deckId) return;
    try {
      setIsDeckLoading(true);
      setDeckError(null);
      const data = await decksService.getDeck(deckId);
      setDeck(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể tải thông tin bộ từ";
      setDeckError(message);
    } finally {
      setIsDeckLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchDeckDetails();
  }, [fetchDeckDetails]);

  const handleCreateCard = async (dto: CreateCardDto) => {
    const created = await createCard(dto);
    fetchDeckDetails();
    return created;
  };

  const handleUpdateCard = async (cardId: string, dto: UpdateCardDto) => {
    const updated = await updateCard(cardId, dto);
    fetchDeckDetails();
    return updated;
  };

  const handleDeleteCardConfirm = async () => {
    if (!deletingCard) return;
    try {
      setIsDeletingCardLoading(true);
      await deleteCard(deletingCard.id);
      setDeletingCard(null);
      fetchDeckDetails();
    } finally {
      setIsDeletingCardLoading(false);
    }
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    await executeBulkAction({
      action: "DELETE",
      cardIds: selectedCardIds,
    });
    fetchDeckDetails();
  };

  const handleBulkMove = async (targetDeckId: string) => {
    await executeBulkAction({
      action: "MOVE",
      cardIds: selectedCardIds,
      targetDeckId,
    });
    fetchDeckDetails();
  };

  const handleBulkResetProgress = async () => {
    await executeBulkAction({
      action: "RESET_PROGRESS",
      cardIds: selectedCardIds,
    });
    fetchDeckDetails();
  };

  if (isDeckLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col selection:bg-[#f3e8ff] selection:text-[#7e22ce]">
        <DashboardNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="h-44 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (deckError || !deck) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col selection:bg-[#f3e8ff] selection:text-[#7e22ce]">
        <DashboardNavbar />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-20 text-center">
          <div className="p-8 rounded-2xl bg-white border border-[#fecdd3] shadow-xs">
            <h2
              className="text-xl font-bold text-black mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Không thể tìm thấy bộ từ vựng
            </h2>
            <p className="text-xs sm:text-sm text-[#737373] mb-6">
              {deckError ||
                "Bộ từ này không tồn tại hoặc bạn không có quyền truy cập."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/decks")}
              className="btn-primary h-10 px-5 text-xs font-semibold gap-2 cursor-pointer inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách bộ từ</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  const theme = getColorTheme(deck.color);
  const stats = deck.stats || {
    totalCards: paginationMeta.total,
    newCards: 0,
    learningCards: 0,
    masteredCards: 0,
    dueCards: 0,
  };

  const statusChips: Array<{
    id: CardStatusFilter;
    label: string;
    count?: number;
  }> = [
    { id: "ALL", label: "Tất cả" },
    { id: "NEW", label: "Thẻ mới", count: stats.newCards },
    { id: "LEARNING", label: "Đang học", count: stats.learningCards },
    { id: "MASTERED", label: "Thành thạo", count: stats.masteredCards },
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-[#f3e8ff] selection:text-[#7e22ce]">
      <DashboardNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24">
        {/* Navigation Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            to="/decks"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#737373] hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách bộ từ</span>
          </Link>
        </div>

        {/* Deck Header Card */}
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: theme.bgLight,
                  border: `1px solid ${theme.borderLight}`,
                  color: theme.hex,
                }}
              >
                <DeckIcon
                  iconName={deck.icon}
                  className="w-7 h-7 sm:w-8 sm:h-8"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-2.5 py-0.5 text-[#7e22ce]">
                    <Layers className="w-3 h-3" />
                    <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                      Bộ từ vựng
                    </span>
                  </div>

                  {deck.isPublic ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] text-[#737373] border border-[#e5e5e5]">
                      <Globe className="w-3 h-3" />
                      <span>Công khai</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] text-[#737373] border border-[#e5e5e5]">
                      <Lock className="w-3 h-3" />
                      <span>Riêng tư</span>
                    </span>
                  )}
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-bold text-black tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {deck.title}
                </h1>

                {deck.description && (
                  <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-2xl leading-relaxed">
                    {deck.description}
                  </p>
                )}

                {/* Tags */}
                {deck.tags && deck.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {deck.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono text-[#525252] bg-[#fafafa] border border-[#e5e5e5]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start">
              <button
                type="button"
                onClick={() => setIsEditDeckOpen(true)}
                className="btn-secondary h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#525252]" />
                <span>Sửa bộ từ</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddCardOpen(true)}
                className="btn-primary h-10 px-4 text-xs font-semibold gap-2 shadow-xs cursor-pointer inline-flex items-center"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm thẻ mới</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#e5e5e5]">
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-1">
                Tổng số thẻ
              </span>
              <span className="text-xl sm:text-2xl font-bold text-black font-mono">
                {stats.totalCards}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e22ce] block mb-1">
                Thẻ mới (New)
              </span>
              <span className="text-xl sm:text-2xl font-bold text-black font-mono">
                {stats.newCards}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb] block mb-1">
                Đang học (Learning)
              </span>
              <span className="text-xl sm:text-2xl font-bold text-black font-mono">
                {stats.learningCards}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#16a34a] block mb-1">
                Thành thạo (Mastered)
              </span>
              <span className="text-xl sm:text-2xl font-bold text-black font-mono">
                {stats.masteredCards}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Toolbar Row */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-black" />
              <h2
                className="text-lg sm:text-xl font-bold text-black tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Danh sách thẻ từ vựng ({paginationMeta.total})
              </h2>
            </div>

            {/* Right Toolbar: View Toggle & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle Switcher */}
              <div className="flex items-center rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-0.5">
                <button
                  type="button"
                  onClick={() => handleViewModeChange("grid")}
                  title="Chế độ lưới thẻ 3D"
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-black shadow-xs"
                      : "text-[#737373] hover:text-black"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Lưới</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange("table")}
                  title="Chế độ bảng danh sách"
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-black shadow-xs"
                      : "text-[#737373] hover:text-black"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Bảng</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm từ, nghĩa, ví dụ..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] focus:bg-white text-xs text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black transition-all"
                />
              </div>
            </div>
          </div>

          {/* Status Filter Chips & Select All */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#737373] flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" />
                <span>Lọc:</span>
              </span>
              {statusChips.map((chip) => {
                const isActive = statusFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setStatusFilter(chip.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-[#fafafa] hover:bg-[#f0f0f0] text-[#525252] border border-[#e5e5e5]"
                    }`}
                  >
                    {chip.label}
                    {chip.count !== undefined && (
                      <span
                        className={`ml-1.5 font-mono text-[10px] ${
                          isActive ? "text-white/80" : "text-[#737373]"
                        }`}
                      >
                        ({chip.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Select All on Page Button */}
            {cards.length > 0 && (
              <button
                type="button"
                onClick={selectAllCards}
                className="text-xs font-semibold text-[#737373] hover:text-black cursor-pointer transition-colors"
              >
                {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả trên trang"}
              </button>
            )}
          </div>
        </div>

        {/* Cards Content */}
        {isCardsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] animate-pulse"
              />
            ))}
          </div>
        ) : cards.length === 0 &&
          !searchQuery.trim() &&
          statusFilter === "ALL" ? (
          /* Empty State: 0 cards in entire deck */
          <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                backgroundColor: theme.bgLight,
                border: `1px solid ${theme.borderLight}`,
                color: theme.hex,
              }}
            >
              <Sparkles className="w-7 h-7" />
            </div>

            <h3
              className="text-base sm:text-lg font-bold text-black mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Bộ từ này chưa có thẻ từ vựng nào
            </h3>
            <p className="text-xs sm:text-sm text-[#737373] mb-6 max-w-sm leading-relaxed">
              Hãy bắt đầu thêm những từ vựng đầu tiên với đầy đủ phiên âm, ví dụ
              và mẹo nhớ để bắt đầu hành trình ôn tập.
            </p>

            <button
              type="button"
              onClick={() => setIsAddCardOpen(true)}
              className="btn-primary h-10 px-5 text-xs font-semibold gap-2 shadow-xs cursor-pointer inline-flex items-center"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm thẻ từ vựng đầu tiên</span>
            </button>
          </div>
        ) : cards.length === 0 ? (
          /* Empty Filter/Search Results */
          <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-10 text-center max-w-md mx-auto">
            <p className="text-xs sm:text-sm text-[#737373] mb-4">
              Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="btn-secondary h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Xóa bộ lọc & tìm kiếm
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <CardDataTable
            cards={cards}
            selectedCardIds={selectedCardIds}
            onToggleSelect={toggleSelectCard}
            onSelectAll={selectAllCards}
            isAllSelected={isAllSelected}
            onEdit={(c) => setEditingCard(c)}
            onDelete={(c) => setDeletingCard(c)}
          />
        ) : (
          /* Grid View */
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardItemCard
                    card={card}
                    deckColor={deck.color}
                    isSelected={selectedCardIds.includes(card.id)}
                    onToggleSelect={toggleSelectCard}
                    onEdit={(c) => setEditingCard(c)}
                    onDelete={(c) => setDeletingCard(c)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination Bar */}
        {paginationMeta.totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#737373]">
              <span>
                Hiển thị trang <strong>{paginationMeta.page}</strong> /{" "}
                {paginationMeta.totalPages} ({paginationMeta.total} thẻ)
              </span>
              <span className="mx-1">•</span>
              <label htmlFor="limit-select" className="text-xs">
                Số lượng:
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 px-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] text-xs text-black font-medium focus:outline-none focus:border-black"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={!paginationMeta.hasPrevPage}
                aria-label="Trang trước"
                className="h-8 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] hover:bg-white text-xs font-semibold text-black flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from(
                  { length: Math.min(5, paginationMeta.totalPages) },
                  (_, i) => {
                    let pageNum = i + 1;
                    if (paginationMeta.totalPages > 5 && page > 3) {
                      pageNum = page - 2 + i;
                      if (pageNum > paginationMeta.totalPages) {
                        pageNum = paginationMeta.totalPages - 4 + i;
                      }
                    }
                    if (pageNum <= 0) pageNum = i + 1;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                          page === pageNum
                            ? "bg-black text-white"
                            : "bg-[#fafafa] hover:bg-[#f0f0f0] text-[#525252] border border-[#e5e5e5]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={!paginationMeta.hasNextPage}
                aria-label="Trang sau"
                className="h-8 px-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] hover:bg-white text-xs font-semibold text-black flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedCardIds.length}
        currentDeckId={deckId || ""}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkMove={handleBulkMove}
        onBulkResetProgress={handleBulkResetProgress}
        isLoading={isBulkLoading}
      />

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onSubmit={handleCreateCard}
        existingCards={cards}
        deckTitle={deck.title}
        deckColor={deck.color}
      />

      {/* Edit Card Modal */}
      <EditCardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        card={editingCard}
        onUpdate={handleUpdateCard}
        deckTitle={deck.title}
        deckColor={deck.color}
      />

      {/* Delete Card Confirm Modal */}
      <DeleteCardConfirmModal
        isOpen={!!deletingCard}
        onClose={() => setDeletingCard(null)}
        card={deletingCard}
        onConfirm={handleDeleteCardConfirm}
        isDeleting={isDeletingCardLoading}
      />

      {/* Edit Deck Modal */}
      <EditDeckModal
        isOpen={isEditDeckOpen}
        deck={deck}
        onClose={() => setIsEditDeckOpen(false)}
        onSubmit={async (id, dto) => {
          const updated = await decksService.updateDeck(id, dto);
          setDeck(updated);
          return updated;
        }}
      />
    </div>
  );
};
