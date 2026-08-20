import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import { DashboardNavbar } from "../components/DashboardNavbar";
import { StreakHeroBanner } from "../components/StreakHeroBanner";
import { DashboardStatsGrid } from "../components/DashboardStatsGrid";
import { StreakHeatmapTracker } from "../components/StreakHeatmapTracker";
import { DecksPreviewSection } from "../components/DecksPreviewSection";
import { FlameNurtureModal } from "../components/FlameNurtureModal";
import { DraggableFlameMascot } from "../components/DraggableFlameMascot";
import { Globe } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFlameNurtureOpen, setIsFlameNurtureOpen] = useState(false);
  const [feedingTrigger, setFeedingTrigger] = useState<{
    id: number;
    wordCount: number;
  } | null>(null);
  const [settingsTab, setSettingsTab] = useState<
    "profile" | "avatar" | "security"
  >("profile");

  const currentStreak = 0;
  const longestStreak = 0;
  const cardsFedToday = 0;
  const dailyGoal = user?.dailyGoal || 10;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const openSettings = (tab: "profile" | "avatar" | "security" = "profile") => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const openFlameNurture = () => {
    setIsFlameNurtureOpen(true);
  };

  const handleFeedWood = (count: number) => {
    setFeedingTrigger({
      id: Date.now(),
      wordCount: count,
    });
  };

  const handleStartReview = () => {
    navigate("/review");
  };

  const handleCreateDeck = () => {
    // In future phases: open create deck modal or route
    openSettings("profile");
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white text-black selection:bg-[#f3e8ff] selection:text-[#7e22ce] flex flex-col justify-between">
        {/* Main Content Layer */}
        <div className="flex min-h-screen flex-col">
          {/* Top Clean Navigation with compact icon buttons */}
          <DashboardNavbar
            user={user}
            currentStreak={currentStreak}
            onOpenSettings={openSettings}
            onOpenFlameNurture={openFlameNurture}
            onLogout={handleLogout}
          />

          {/* Main Dashboard Hub Container */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
            {/* Hero Greeting & 7-Day Habit Streak Tracker */}
            <StreakHeroBanner
              username={user?.username || "Learner"}
              currentStreak={currentStreak}
              onStartReview={handleStartReview}
              onCreateDeck={handleCreateDeck}
              onOpenFlameNurture={openFlameNurture}
            />

            {/* 4 Core Clean Metric Cards */}
            <DashboardStatsGrid
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              dailyGoal={dailyGoal}
              cardsDueToday={0}
              totalDecks={3}
              onOpenGoalSettings={() => openSettings("profile")}
              onOpenFlameNurture={openFlameNurture}
              onCreateDeck={handleCreateDeck}
            />

            {/* Streak & Consistency Heatmap Matrix */}
            <StreakHeatmapTracker
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />

            {/* Decks & Spaced Repetition Active Review Hub */}
            <DecksPreviewSection
              onStartPractice={handleStartReview}
              onCreateDeck={handleCreateDeck}
            />
          </main>

          {/* Minimalist Footer */}
          <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-xs text-[#a3a3a3] border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
            <p>
              © {new Date().getFullYear()} WordStreak. 100% Free & Open-Source.
            </p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => openSettings("profile")}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Cài đặt
              </button>
              <button
                type="button"
                onClick={() => openSettings("security")}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Bảo mật
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                GitHub
              </a>
              <span className="flex items-center gap-1 text-[#737373]">
                <Globe className="w-3.5 h-3.5" />
                <span>EN (US)</span>
              </span>
            </div>
          </footer>
        </div>

        {/* Draggable Floating Streak Flame Mascot (Can be dragged anywhere on screen) */}
        <DraggableFlameMascot
          currentStreak={currentStreak}
          onOpenFlameNurture={openFlameNurture}
          feedingTrigger={feedingTrigger}
        />

        {/* Flame Nurturing & Evolution Modal */}
        <FlameNurtureModal
          isOpen={isFlameNurtureOpen}
          onClose={() => setIsFlameNurtureOpen(false)}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          cardsFedToday={cardsFedToday}
          dailyGoal={dailyGoal}
          onStartReview={handleStartReview}
          onFeedWood={handleFeedWood}
        />

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
