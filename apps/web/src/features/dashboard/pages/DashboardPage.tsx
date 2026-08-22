import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/useAuthStore";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import { DashboardNavbar } from "../components/DashboardNavbar";
import { StreakHeroBanner } from "../components/StreakHeroBanner";
import { DashboardStatsGrid } from "../components/DashboardStatsGrid";
import { StreakHeatmapTracker } from "../components/StreakHeatmapTracker";
import { DecksPreviewSection } from "../components/DecksPreviewSection";
import { DashboardAnalyticsWidget } from "../../analytics/components/DashboardAnalyticsWidget";
import { CreateDeckModal } from "../../decks/components/CreateDeckModal";
import { useStreak } from "../hooks/useStreak";
import { useAnalytics } from "../../analytics/hooks/useAnalytics";
import { useDecks } from "../../decks/hooks/useDecks";
import { useMascotStore } from "../../../store/useMascotStore";
import { Globe } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { openFlameNurture } = useMascotStore();
  const {
    currentStreak,
    bestStreak,
    flameTier,
    isActiveToday,
    isPendingToday,
    streakFreezes,
    maxStreakFreezes,
  } = useStreak();
  const {
    overview: analyticsOverview,
    heatmap: analyticsHeatmap,
    isLoading: isAnalyticsLoading,
  } = useAnalytics();
  const { decks, isLoading: isDecksLoading, createDeck } = useDecks("active");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "profile" | "avatar" | "security" | "gamification"
  >("profile");

  const longestStreak = bestStreak;
  const dailyGoal = user?.dailyGoal || 10;
  const totalDecks = decks.length;
  const cardsDueToday = decks.reduce(
    (sum, d) => sum + (d.stats?.dueCards || 0),
    0,
  );

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

  const handleStartReview = (deckId?: string) => {
    if (deckId) {
      navigate(`/decks/${deckId}/review`);
    } else {
      navigate("/review");
    }
  };

  const handleCreateDeck = () => {
    setIsCreateDeckOpen(true);
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
            flameTier={flameTier}
            isActiveToday={isActiveToday}
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
              flameTier={flameTier}
              isActiveToday={isActiveToday}
              isPendingToday={isPendingToday}
              onStartReview={() => handleStartReview()}
              onCreateDeck={handleCreateDeck}
              onOpenFlameNurture={openFlameNurture}
            />

            {/* 4 Core Clean Metric Cards */}
            <DashboardStatsGrid
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              dailyGoal={dailyGoal}
              cardsDueToday={cardsDueToday}
              totalDecks={totalDecks}
              streakFreezes={streakFreezes}
              maxStreakFreezes={maxStreakFreezes}
              onOpenGoalSettings={() => openSettings("profile")}
              onOpenFlameNurture={openFlameNurture}
              onCreateDeck={handleCreateDeck}
            />

            {/* Streak & Consistency Heatmap Matrix */}
            <StreakHeatmapTracker
              heatmapData={analyticsHeatmap}
              isLoading={isAnalyticsLoading}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />

            {/* Learning Analytics & Memory Curve Overview */}
            <DashboardAnalyticsWidget
              overview={analyticsOverview}
              isLoading={isAnalyticsLoading}
            />

            {/* Decks & Spaced Repetition Active Review Hub */}
            <DecksPreviewSection
              decks={decks}
              isLoading={isDecksLoading}
              onStartPractice={handleStartReview}
              onCreateDeck={handleCreateDeck}
            />
          </main>

          {/* Minimalist Footer */}
          <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-xs text-[#737373] border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
            <p>
              {t("footer.copyright", {
                year: new Date().getFullYear(),
                defaultValue: `© ${new Date().getFullYear()} WordStreak. 100% Free & Open-Source.`,
              })}
            </p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => openSettings("profile")}
                className="hover:text-black transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-xs"
              >
                {t("footer.settings", "Settings")}
              </button>
              <button
                type="button"
                onClick={() => openSettings("security")}
                className="hover:text-black transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-xs"
              >
                {t("footer.security", "Security")}
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-xs"
              >
                GitHub
              </a>
              <span className="flex items-center gap-1 text-[#737373]">
                <Globe className="w-3.5 h-3.5" />
                <span>{i18n.language === "vi" ? "VI (VN)" : "EN (US)"}</span>
              </span>
            </div>
          </footer>
        </div>

        {/* Create Deck Modal */}
        <CreateDeckModal
          isOpen={isCreateDeckOpen}
          onClose={() => setIsCreateDeckOpen(false)}
          onSubmit={createDeck}
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
