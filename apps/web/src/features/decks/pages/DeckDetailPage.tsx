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
} from "lucide-react";
import { decksService } from "../services/decksService";
import { useCards } from "../../cards/hooks/useCards";
import { CardItemCard } from "../../cards/components/CardItemCard";
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
} from "@wordstreak/shared-types";

export const DeckDetailPage: React.FC = () => {
  const { id: deckId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<DeckResponse | null>(null);
  const [isDeckLoading, setIsDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);

  // Cards hook
  const {
    cards,
    filteredCards,
    isLoading: isCardsLoading,
    searchQuery,
    setSearchQuery,
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
    let ignore = false;
    if (deckId) {
      decksService
        .getDeck(deckId)
        .then((data) => {
          if (!ignore) setDeck(data);
        })
        .catch((err: unknown) => {
          if (!ignore) {
            const message =
              err instanceof Error
                ? err.message
                : "Không thể tải thông tin bộ từ";
            setDeckError(message);
          }
        })
        .finally(() => {
          if (!ignore) setIsDeckLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [deckId]);

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
    totalCards: cards.length,
    newCards: cards.filter((c) => !c.progress || c.progress.status === "NEW")
      .length,
    learningCards: cards.filter(
      (c) =>
        c.progress?.status === "LEARNING" || c.progress?.status === "REVIEW",
    ).length,
    masteredCards: cards.filter((c) => c.progress?.status === "MASTERED")
      .length,
    dueCards: 0,
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-[#f3e8ff] selection:text-[#7e22ce]">
      <DashboardNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
                {cards.length}
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

        {/* Card List Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-black" />
            <h2
              className="text-lg sm:text-xl font-bold text-black tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Danh sách thẻ từ vựng ({filteredCards.length})
            </h2>
          </div>

          {/* Search Cards */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo từ, nghĩa, ví dụ..."
              className="w-full h-9 pl-9 pr-3 rounded-full border border-[#e5e5e5] bg-[#fafafa] focus:bg-white text-xs text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black transition-all"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {isCardsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] animate-pulse"
              />
            ))}
          </div>
        ) : cards.length === 0 ? (
          /* Empty State: 0 cards */
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
        ) : filteredCards.length === 0 ? (
          /* Empty Search Results */
          <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-8 text-center max-w-md mx-auto">
            <p className="text-xs sm:text-sm text-[#737373] mb-3">
              Không tìm thấy từ vựng nào khớp với "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-black hover:underline cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filteredCards.map((card) => (
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
                    onEdit={(c) => setEditingCard(c)}
                    onDelete={(c) => setDeletingCard(c)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

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
