import React from "react";
import { Layers } from "lucide-react";
import type { DeckResponse } from "@wordstreak/shared-types";

interface DeckSelectorProps {
  decks: DeckResponse[];
  pinnedDeckId: string | null;
  onSelectDeck: (deckId: string | null) => void;
  isLoading?: boolean;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  decks,
  pinnedDeckId,
  onSelectDeck,
  isLoading,
}) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <Layers size={13} color="#863bff" />
        Bộ từ đích mặc định (1-Click Save)
      </label>
      <select
        value={pinnedDeckId || ""}
        disabled={isLoading || decks.length === 0}
        onChange={(e) => onSelectDeck(e.target.value || null)}
        style={{
          width: "100%",
          padding: "8px 12px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "10px",
          fontSize: "13px",
          color: "#111827",
          outline: "none",
          cursor: "pointer",
          appearance: "auto",
        }}
      >
        <option value="">Tự động chọn (Inbox / Thu thập Web)</option>
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.title} ({deck.stats?.totalCards ?? 0} thẻ)
          </option>
        ))}
      </select>
    </div>
  );
};
