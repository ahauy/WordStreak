import React, { useEffect, useState } from "react";
import { Settings, Plus, Loader2, Sparkles } from "lucide-react";
import { AuthStatusCard } from "./components/AuthStatusCard";
import { DeckSelector } from "./components/DeckSelector";
import { RecentCapturesList } from "./components/RecentCapturesList";
import { extensionStorage } from "../shared/storage";
import { WEB_APP_URL } from "../shared/constants";
import type {
  ExtensionUserSummary,
  ExtensionSettingsPayload,
  RecentCaptureItem,
  DeckResponse,
} from "@wordstreak/shared-types";

export const PopupApp: React.FC = () => {
  const [user, setUser] = useState<ExtensionUserSummary | null>(null);
  const [settings, setSettings] = useState<ExtensionSettingsPayload | null>(
    null,
  );
  const [recentCaptures, setRecentCaptures] = useState<RecentCaptureItem[]>([]);
  const [decks, setDecks] = useState<DeckResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual Quick Add state
  const [quickWord, setQuickWord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const state = await extensionStorage.getAll();
      setSettings(state.settings);
      setRecentCaptures(state.recentCaptures);

      if (state.user) {
        setUser(state.user);
      }

      // Query Background for live Auth Status & User Profile
      chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" }, (authRes) => {
        if (authRes?.success && authRes.data?.user) {
          setUser(authRes.data.user);
          chrome.runtime.sendMessage({ type: "FETCH_DECKS" }, (deckRes) => {
            if (deckRes?.success && deckRes.data) {
              setDecks(deckRes.data);
            }
          });
        } else if (!state.token && !authRes?.data?.token) {
          setUser(null);
          setDecks([]);
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
      setUser(null);
      setDecks([]);
    });
  };

  const handleSelectDeck = async (deckId: string | null) => {
    const updated = await extensionStorage.updateSettings({
      pinnedDeckId: deckId,
    });
    setSettings(updated);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWord.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    chrome.runtime.sendMessage(
      {
        type: "QUICK_CAPTURE",
        payload: {
          word: quickWord.trim(),
          deckId: settings?.pinnedDeckId || undefined,
        },
      },
      (res) => {
        setIsSubmitting(false);
        if (res?.success) {
          setStatusMessage({
            text: `Đã thêm "${quickWord.trim()}" thành công!`,
            type: "success",
          });
          setQuickWord("");
          loadData();
        } else {
          setStatusMessage({
            text: res?.error || "Lỗi lưu từ vựng",
            type: "error",
          });
        }
      },
    );
  };

  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        minHeight: "480px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "12px",
          borderBottom: "1px solid #f3f4f6",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 48 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
              fill="#863bff"
            />
          </svg>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              color: "#111827",
            }}
          >
            WordStreak
          </span>
        </div>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Cài đặt"
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "8px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
        >
          <Settings size={17} />
        </button>
      </div>

      {/* Auth Card */}
      <AuthStatusCard
        user={user}
        onLoginSuccess={loadData}
        onLogout={handleLogout}
      />

      {/* Deck Selector */}
      {user && (
        <DeckSelector
          decks={decks}
          pinnedDeckId={settings?.pinnedDeckId || null}
          onSelectDeck={handleSelectDeck}
          isLoading={isLoading}
        />
      )}

      {/* Manual Quick Add */}
      {user && (
        <form onSubmit={handleManualAdd} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="text"
              placeholder="Nhập từ vựng cần lưu nhanh..."
              value={quickWord}
              onChange={(e) => setQuickWord(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "13px",
                border: "1px solid #e5e5e5",
                borderRadius: "10px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!quickWord.trim() || isSubmitting}
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: quickWord.trim() ? "pointer" : "not-allowed",
                opacity: quickWord.trim() ? 1 : 0.5,
              }}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
            </button>
          </div>
          {statusMessage && (
            <div
              style={{
                fontSize: "11.5px",
                marginTop: "6px",
                color: statusMessage.type === "success" ? "#10b981" : "#ef4444",
              }}
            >
              {statusMessage.text}
            </div>
          )}
        </form>
      )}

      {/* Recent Captures */}
      <div style={{ flex: 1 }}>
        <RecentCapturesList items={recentCaptures} />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "16px",
          paddingTop: "10px",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "11.5px",
          color: "#9ca3af",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Sparkles size={12} color="#863bff" />
          AI Vocabulary Sync
        </span>
        <a
          href={`${WEB_APP_URL}/dashboard`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#863bff", textDecoration: "none", fontWeight: 600 }}
        >
          Mở Dashboard →
        </a>
      </div>
    </div>
  );
};
