import React from "react";
import { ExternalLink, Bookmark } from "lucide-react";
import { WEB_APP_URL } from "../../shared/constants";
import type { RecentCaptureItem } from "@wordstreak/shared-types";

interface RecentCapturesListProps {
  items: RecentCaptureItem[];
}

export const RecentCapturesList: React.FC<RecentCapturesListProps> = ({
  items,
}) => {
  if (items.length === 0) {
    return (
      <div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Bookmark size={13} color="#863bff" />
          Từ vựng vừa thu thập
        </div>
        <div
          style={{
            padding: "24px 12px",
            textAlign: "center",
            backgroundColor: "#fafafa",
            borderRadius: "12px",
            border: "1px dashed #e5e5e5",
            color: "#9ca3af",
            fontSize: "12.5px",
          }}
        >
          Chưa có từ vựng nào. Hãy bôi đen từ tiếng Anh trên bất kỳ trang web
          nào để lưu tức thì!
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Bookmark size={13} color="#863bff" />
        Từ vựng vừa thu thập ({items.length})
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "220px",
          overflowY: "auto",
          paddingRight: "2px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "10px 12px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "border-color 0.15s ease",
            }}
          >
            <div style={{ overflow: "hidden", marginRight: "8px" }}>
              <div
                style={{ display: "flex", alignItems: "baseline", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {item.word}
                </span>
                {item.phonetic && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#863bff",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {item.phonetic}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#4b5563",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  marginTop: "2px",
                }}
              >
                {item.meaning}
              </div>
              <div
                style={{
                  fontSize: "10.5px",
                  color: "#9ca3af",
                  marginTop: "2px",
                }}
              >
                {item.deckTitle}
              </div>
            </div>
            <button
              onClick={() => window.open(`${WEB_APP_URL}/decks`, "_blank")}
              title="Mở trên Web App"
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#863bff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
