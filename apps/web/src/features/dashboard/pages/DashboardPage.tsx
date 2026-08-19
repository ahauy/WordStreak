import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import { StarrySky } from "../../landing/components/StarrySky";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import { DashboardNavbar } from "../components/DashboardNavbar";
import { StreakHeroBanner } from "../components/StreakHeroBanner";
import { DashboardStatsGrid } from "../components/DashboardStatsGrid";
import { StreakHeatmapTracker } from "../components/StreakHeatmapTracker";
import { DecksPreviewSection } from "../components/DecksPreviewSection";

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "profile" | "avatar" | "security"
  >("profile");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const openSettings = (tab: "profile" | "avatar" | "security" = "profile") => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const handleStartReview = () => {
    // In future phases: navigate to active practice/review session
    openSettings("profile");
  };

  const handleCreateDeck = () => {
    // In future phases: open create deck modal or route
    openSettings("profile");
  };

  return (
    <PageTransition>
      <div
        className="relative min-h-screen text-white selection:bg-[#f5a623] selection:text-[#060e1a] flex flex-col justify-between"
        style={{ backgroundColor: "#060e1a" }}
      >
        {/* Living Starry Night Cosmos Background */}
        <StarrySky />

        {/* Main Content Layer */}
        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Top Cosmic Navigation */}
          <DashboardNavbar
            user={user}
            onOpenSettings={openSettings}
            onLogout={handleLogout}
          />

          {/* Main Dashboard Hub Container */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
            {/* Hero Greeting & 7-Day Habit Streak Tracker */}
            <StreakHeroBanner
              username={user?.username || "Learner"}
              currentStreak={0}
              onStartReview={handleStartReview}
              onCreateDeck={handleCreateDeck}
            />

            {/* 4 Core Liquid Glass Metric Cards */}
            <DashboardStatsGrid
              currentStreak={0}
              longestStreak={0}
              dailyGoal={user?.dailyGoal || 10}
              cardsDueToday={0}
              totalDecks={3}
              onOpenGoalSettings={() => openSettings("profile")}
              onCreateDeck={handleCreateDeck}
            />

            {/* Streak & Consistency Heatmap Matrix */}
            <StreakHeatmapTracker currentStreak={0} longestStreak={0} />

            {/* Decks & Spaced Repetition Active Review Hub */}
            <DecksPreviewSection
              onStartPractice={handleStartReview}
              onCreateDeck={handleCreateDeck}
            />
          </main>

          {/* Minimalist Cosmos Footer */}
          <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-[#94a3b8] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
            <p>
              Copyright © {new Date().getFullYear()} WordStreak. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => openSettings("profile")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Cài đặt
              </button>
              <button
                type="button"
                onClick={() => openSettings("security")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Bảo mật
              </button>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-white transition-colors"
              >
                Hỗ trợ
              </a>
            </div>
          </footer>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsTab}
        />
      </div>
    </PageTransition>
  );
};
