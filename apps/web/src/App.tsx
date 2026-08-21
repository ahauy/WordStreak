import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { DecksListPage } from "./features/decks/pages/DecksListPage";
import { DeckDetailPage } from "./features/decks/pages/DeckDetailPage";
import { ReviewSessionPage } from "./features/reviews/pages/ReviewSessionPage";
import { MultipleChoiceQuizPage } from "./features/practice/pages/MultipleChoiceQuizPage";
import { FillInTheBlankQuizPage } from "./features/practice/pages/FillInTheBlankQuizPage";
import { ListeningQuizPage } from "./features/practice/pages/ListeningQuizPage";
import { WordMatchingPage } from "./features/practice/pages/WordMatchingPage";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { AnalyticsPage } from "./features/analytics/pages/AnalyticsPage";
import { CommunityDecksPage } from "./features/community/pages/CommunityDecksPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { GlobalFlameMascot } from "./features/dashboard/components/GlobalFlameMascot";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Landing Page (public) */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Community Decks (Publicly accessible browse/preview) */}
        <Route path="/community" element={<CommunityDecksPage />} />

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
    </AnimatePresence>
  );
}

function App() {
  const { initializeAuth } = useAuthStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, [initializeAuth, initializeTheme]);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <GlobalFlameMascot />
    </BrowserRouter>
  );
}

export default App;
