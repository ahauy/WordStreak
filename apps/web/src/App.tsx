import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { GlobalFlameMascot } from "./features/dashboard/components/GlobalFlameMascot";
import { CookieConsentBanner } from "./components/analytics/CookieConsentBanner";
import { analyticsService } from "./services/analytics/analyticsService";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

// Lazy-loaded page routes for optimal bundle code-splitting
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const DecksListPage = lazy(() => import("./features/decks/pages/DecksListPage").then((m) => ({ default: m.DecksListPage })));
const DeckDetailPage = lazy(() => import("./features/decks/pages/DeckDetailPage").then((m) => ({ default: m.DeckDetailPage })));
const ReviewSessionPage = lazy(() => import("./features/reviews/pages/ReviewSessionPage").then((m) => ({ default: m.ReviewSessionPage })));
const MultipleChoiceQuizPage = lazy(() => import("./features/practice/pages/MultipleChoiceQuizPage").then((m) => ({ default: m.MultipleChoiceQuizPage })));
const FillInTheBlankQuizPage = lazy(() => import("./features/practice/pages/FillInTheBlankQuizPage").then((m) => ({ default: m.FillInTheBlankQuizPage })));
const ListeningQuizPage = lazy(() => import("./features/practice/pages/ListeningQuizPage").then((m) => ({ default: m.ListeningQuizPage })));
const WordMatchingPage = lazy(() => import("./features/practice/pages/WordMatchingPage").then((m) => ({ default: m.WordMatchingPage })));
const LandingPage = lazy(() => import("./features/landing/pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const AnalyticsPage = lazy(() => import("./features/analytics/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const CommunityDecksPage = lazy(() => import("./features/community/pages/CommunityDecksPage").then((m) => ({ default: m.CommunityDecksPage })));
const LibraryPage = lazy(() => import("./features/library/pages/LibraryPage").then((m) => ({ default: m.LibraryPage })));
const OfficialDeckDetailPage = lazy(() => import("./features/library/pages/OfficialDeckDetailPage").then((m) => ({ default: m.OfficialDeckDetailPage })));
const DataSourcesPage = lazy(() => import("./features/library/pages/DataSourcesPage").then((m) => ({ default: m.DataSourcesPage })));
const ToeicPathPage = lazy(() => import("./features/library/pages/ToeicPathPage").then((m) => ({ default: m.ToeicPathPage })));
const IeltsAcademicPathPage = lazy(() => import("./features/academic/pages/IeltsAcademicPathPage").then((m) => ({ default: m.IeltsAcademicPathPage })));
const BusinessPathPage = lazy(() => import("./features/business/pages/BusinessPathPage").then((m) => ({ default: m.BusinessPathPage })));
const SpokenPathPage = lazy(() => import("./features/spoken/pages/SpokenPathPage").then((m) => ({ default: m.SpokenPathPage })));
const PublicWordPage = lazy(() => import("./features/dictionary/pages/PublicWordPage").then((m) => ({ default: m.PublicWordPage })));

const PageLoader = () => (
  <div className="min-h-screen bg-white dark:bg-[#0c0d0e] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
        {/* Landing Page (public) */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Community Decks (Publicly accessible browse/preview) */}
        <Route path="/community" element={<CommunityDecksPage />} />

        {/* Data Sources & Licensing (Publicly accessible) */}
        <Route path="/sources" element={<DataSourcesPage />} />

        {/* Public SEO Word Page (Publicly accessible) */}
        <Route path="/word/:word" element={<PublicWordPage />} />

        {/* Protected Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <DecksListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/library/decks/:slug"
          element={
            <ProtectedRoute>
              <OfficialDeckDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paths/toeic"
          element={
            <ProtectedRoute>
              <ToeicPathPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paths/academic"
          element={
            <ProtectedRoute>
              <IeltsAcademicPathPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paths/ielts"
          element={<Navigate to="/paths/academic" replace />}
        />

        <Route
          path="/paths/business"
          element={
            <ProtectedRoute>
              <BusinessPathPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paths/spoken"
          element={
            <ProtectedRoute>
              <SpokenPathPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paths/communication"
          element={<Navigate to="/paths/spoken" replace />}
        />

        <Route
          path="/decks/:id"
          element={
            <ProtectedRoute>
              <DeckDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/decks/:id/review"
          element={
            <ProtectedRoute>
              <ReviewSessionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/decks/:id/quiz"
          element={
            <ProtectedRoute>
              <MultipleChoiceQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/decks/:id/practice/fill-blank"
          element={
            <ProtectedRoute>
              <FillInTheBlankQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/decks/:id/practice/listening"
          element={
            <ProtectedRoute>
              <ListeningQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/decks/:id/practice/matching"
          element={
            <ProtectedRoute>
              <WordMatchingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice/quiz"
          element={
            <ProtectedRoute>
              <MultipleChoiceQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice/fill-blank"
          element={
            <ProtectedRoute>
              <FillInTheBlankQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice/listening"
          element={
            <ProtectedRoute>
              <ListeningQuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice/matching"
          element={
            <ProtectedRoute>
              <WordMatchingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewSessionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  const { initializeAuth } = useAuthStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeAuth();
    initializeTheme();
    analyticsService.init();
  }, [initializeAuth, initializeTheme]);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <GlobalFlameMascot />
      <CookieConsentBanner />
    </BrowserRouter>
  );
}

export default App;
