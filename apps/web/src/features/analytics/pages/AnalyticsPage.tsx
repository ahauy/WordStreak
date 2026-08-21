import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { useAnalytics } from "../hooks/useAnalytics";
import { useStreak } from "../../dashboard/hooks/useStreak";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import { AnalyticsHeroStats } from "../components/AnalyticsHeroStats";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { MasteryDistributionCard } from "../components/MasteryDistributionCard";
import { DeckProgressTable } from "../components/DeckProgressTable";
import { ArrowLeft, RefreshCw, BarChart2 } from "lucide-react";

export const AnalyticsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { currentStreak, flameTier, isActiveToday } = useStreak();
  const {
    overview,
    heatmap,
    decksProgress,
    deckMastery,
    isLoading,
    error,
    refetch,
  } = useAnalytics();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "profile" | "avatar" | "security" | "gamification"
  >("profile");

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
            onLogout={handleLogout}
          />

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            {/* Header & Back Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black font-['Inter'] mb-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại Tổng quan (Dashboard)</span>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-['Nunito'] text-black tracking-tight flex items-center gap-2.5">
                  <BarChart2 className="w-7 h-7 text-purple-600" />
                  Báo cáo & Thống kê học tập
                </h1>
                <p className="text-sm text-neutral-500 font-['Inter'] mt-1">
                  Trực quan hóa đường cong trí nhớ SuperMemo-2, tiến độ từ vựng
                  và tính kỷ luật học tập.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 hover:border-neutral-400 bg-white text-xs font-semibold font-['Inter'] text-neutral-700 hover:text-black shadow-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-['Inter'] flex items-center justify-between">
                <span>Lỗi tải dữ liệu: {error}</span>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="underline font-semibold"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* 1. Hero KPI Cards */}
            <AnalyticsHeroStats data={overview} isLoading={isLoading} />

            {/* 2. 365-Day Activity Heatmap */}
            <ActivityHeatmap data={heatmap} isLoading={isLoading} />

            {/* 3. Mastery Distribution */}
            <MasteryDistributionCard data={deckMastery} isLoading={isLoading} />

            {/* 4. Deck Forecast & Progress Table */}
            <DeckProgressTable decks={decksProgress} isLoading={isLoading} />
          </main>
        </div>

        {/* User Profile Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          initialTab={settingsTab}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </PageTransition>
  );
};
