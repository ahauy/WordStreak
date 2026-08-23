import React, { useState } from "react";
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { ExtensionUserSummary } from "@wordstreak/shared-types";

interface AuthStatusCardProps {
  user: ExtensionUserSummary | null;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const AuthStatusCard: React.FC<AuthStatusCardProps> = ({
  user,
  onLoginSuccess,
  onLogout,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    chrome.runtime.sendMessage(
      {
        type: "LOGIN",
        payload: {
          identifier: identifier.trim(),
          password: password.trim(),
        },
      },
      (response) => {
        setIsLoading(false);
        if (response?.success) {
          onLoginSuccess();
        } else {
          const msg =
            response?.error || "Email/Username hoặc mật khẩu không chính xác.";
          setErrorMessage(msg);
        }
      },
    );
  };

  const handleSyncFromWeb = () => {
    setIsSyncing(true);
    setErrorMessage(null);

    chrome.tabs.query(
      {
        url: [
          "http://localhost:5173/*",
          "http://127.0.0.1:5173/*",
          "https://*.wordstreak.app/*",
        ],
      },
      (tabs) => {
        if (tabs.length > 0 && tabs[0].id) {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              func: () => {
                try {
                  const raw = localStorage.getItem("auth-storage");
                  if (raw) {
                    const data = JSON.parse(raw);
                    return data?.state?.accessToken || null;
                  }
                } catch (e) {
                  console.error(e);
                }
                return null;
              },
            },
            (results) => {
              setIsSyncing(false);
              const token = results?.[0]?.result;
              if (token) {
                chrome.runtime.sendMessage(
                  { type: "SET_AUTH_TOKEN", payload: { token } },
                  (res) => {
                    if (res?.success) {
                      onLoginSuccess();
                    } else {
                      setErrorMessage("Lỗi lưu token từ Web App.");
                    }
                  },
                );
              } else {
                setErrorMessage(
                  "Không tìm thấy phiên đăng nhập trên Web App. Vui lòng đăng nhập bên dưới hoặc mở Web App.",
                );
              }
            },
          );
        } else {
          setIsSyncing(false);
          setErrorMessage(
            "Không tìm thấy tab Web App WordStreak (localhost:5173) đang mở.",
          );
        }
      },
    );
  };

  if (!user) {
    return (
      <div
        style={{
          padding: "14px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            fontSize: "13.5px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          Đăng nhập WordStreak
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "12px",
            lineHeight: 1.4,
          }}
        >
          Đăng nhập bằng Email hoặc Username để tự động đồng bộ từ vựng và chuỗi
          học Spaced Repetition.
        </div>

        {/* 1-Click Sync from Web App Button */}
        <button
          type="button"
          onClick={handleSyncFromWeb}
          disabled={isSyncing}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            backgroundColor: "#f5f3ff",
            color: "#863bff",
            border: "1.5px solid #ede9fe",
            borderRadius: "9999px",
            padding: "8px 14px",
            fontSize: "12.5px",
            fontWeight: 700,
            cursor: isSyncing ? "not-allowed" : "pointer",
            marginBottom: "12px",
            transition: "background-color 0.15s ease",
          }}
        >
          {isSyncing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          ⚡ Đồng bộ 1-Click từ Web App
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e5e5" }} />
          <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600 }}>
            HOẶC ĐĂNG NHẬP TRỰC TIẾP
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e5e5" }} />
        </div>

        <form
          onSubmit={handleDirectLogin}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <input
            type="text"
            placeholder="Email hoặc Username (ví dụ: hauhamhoc)"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{
              padding: "8px 12px",
              fontSize: "12.5px",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              outline: "none",
              backgroundColor: "#fafafa",
            }}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "8px 12px",
              fontSize: "12.5px",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              outline: "none",
              backgroundColor: "#fafafa",
            }}
          />

          {errorMessage && (
            <div
              style={{
                fontSize: "12px",
                color: "#ef4444",
                fontWeight: 600,
                padding: "4px 2px",
                lineHeight: 1.4,
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              backgroundColor: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: "9999px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              marginTop: "4px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
            }}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogIn size={14} />
            )}
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "9999px",
            backgroundColor: "#ede6ff",
            color: "#863bff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "15px",
            flexShrink: 0,
          }}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              style={{ width: "100%", height: "100%", borderRadius: "9999px" }}
            />
          ) : user.username ? (
            user.username[0].toUpperCase()
          ) : (
            <UserIcon size={18} />
          )}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 700,
              color: "#111827",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {user.username}
          </div>
          <div
            style={{
              fontSize: "11.5px",
              color: "#6b7280",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {user.email}
          </div>
        </div>
      </div>
      <button
        onClick={onLogout}
        title="Đăng xuất"
        style={{
          background: "none",
          border: "none",
          color: "#9ca3af",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        <LogOut size={17} />
      </button>
    </div>
  );
};
