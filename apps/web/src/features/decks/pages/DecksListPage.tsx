import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Search,
  ArrowUpDown,
  Archive,
  BookOpen,
} from "lucide-react";
import { useDecks } from "../hooks/useDecks";
import { DeckCard } from "../components/DeckCard";
import { CreateDeckModal } from "../components/CreateDeckModal";
import { EditDeckModal } from "../components/EditDeckModal";
import { DeleteDeckConfirmModal } from "../components/DeleteDeckConfirmModal";
import { DeckEmptyState } from "../components/DeckEmptyState";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import type { DeckResponse } from "@wordstreak/shared-types";

export const DecksListPage: React.FC = () => {
  const {
    decks,
    isLoading,
    error,
    statusTab,
    setStatusTab,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    createDeck,
    updateDeck,
    archiveDeck,
    restoreDeck,
    deleteDeck,
  } = useDecks("active");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckResponse | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<DeckResponse | null>(null);

  const handleSelectDeck = (deck: DeckResponse) => {
    // Navigate or trigger practice
    console.log("Selected deck:", deck);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-[#f3e8ff] selection:text-[#7e22ce]">
      {/* Top Navigation */}
      <DashboardNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e5e5e5]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-3 py-1 mb-2 text-[#7e22ce]">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                Quản lý bộ từ vựng
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-black tracking-tight flex items-center gap-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span>Bộ từ vựng của bạn</span>
              <span className="text-xs sm:text-sm font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                {decks.length} bộ từ
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-2xl leading-relaxed">
              Tạo, phân loại và theo dõi tiến độ thẻ từ vựng với thuật toán
              Spaced Repetition (SM-2) khoa học.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary h-10 px-4 text-xs font-semibold gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo bộ từ mới</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#fafafa] border border-[#e5e5e5] self-start">
            <button
              type="button"
              onClick={() => setStatusTab("active")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusTab === "active"
                  ? "bg-white text-black shadow-xs border border-[#e5e5e5]"
                  : "text-[#737373] hover:text-black"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đang học</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab("archived")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusTab === "archived"
                  ? "bg-white text-black shadow-xs border border-[#e5e5e5]"
                  : "text-[#737373] hover:text-black"
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Đã lưu trữ</span>
            </button>
          </div>

          {/* Search & Sort Options */}
          <div className="flex flex-1 sm:flex-initial items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bộ từ..."
                className="w-full h-9 pl-9 pr-3 rounded-full border border-[#e5e5e5] bg-[#fafafa] focus:bg-white text-xs text-black placeholder:text-[#a3a3a3] focus:outline-none focus:border-black transition-all"
              />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "createdAt" | "title" | "cardCount",
                  )
                }
                className="h-9 pl-3 pr-8 rounded-full border border-[#e5e5e5] bg-[#fafafa] text-xs font-medium text-black focus:outline-none focus:border-black appearance-none cursor-pointer"
              >
                <option value="createdAt">Mới nhất</option>
                <option value="title">Tên A-Z</option>
                <option value="cardCount">Số lượng từ</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-[#737373] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Deck Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e5e5e5]" />
                  <div className="w-3/4 h-5 rounded-md bg-[#e5e5e5]" />
                  <div className="w-full h-3 rounded-md bg-[#e5e5e5]" />
                </div>
                <div className="w-full h-8 rounded-full bg-[#e5e5e5]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] text-center my-6">
            <p className="text-xs text-[#be123c] font-medium">{error}</p>
          </div>
        ) : decks.length === 0 ? (
          <DeckEmptyState
            statusTab={statusTab}
            searchQuery={searchQuery}
            onCreateDeck={() => setIsCreateOpen(true)}
            onClearSearch={() => setSearchQuery("")}
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {decks.map((deck) => (
                <motion.div
                  key={deck.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <DeckCard
                    deck={deck}
                    onEdit={(d) => setEditingDeck(d)}
                    onArchive={async (d) => {
                      await archiveDeck(d.id);
                    }}
                    onRestore={async (d) => {
                      await restoreDeck(d.id);
                    }}
                    onDelete={(d) => setDeletingDeck(d)}
                    onSelect={handleSelectDeck}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <CreateDeckModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createDeck}
      />

      <EditDeckModal
        isOpen={!!editingDeck}
        deck={editingDeck}
        onClose={() => setEditingDeck(null)}
        onSubmit={updateDeck}
      />

      <DeleteDeckConfirmModal
        isOpen={!!deletingDeck}
        deck={deletingDeck}
        onClose={() => setDeletingDeck(null)}
        onConfirm={deleteDeck}
      />
    </div>
  );
};
