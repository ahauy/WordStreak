import type { CardResponse } from "./cards.js";

export interface QuickCaptureCardDto {
  word: string;
  deckId?: string;
  contextSentence?: string;
  sourceUrl?: string;
  customDefinition?: string;
}

export interface QuickCaptureResponseDto {
  message: string;
  card: CardResponse;
  isDuplicate: boolean;
  deck: {
    id: string;
    title: string;
  };
}

export interface ExtensionUserSummary {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
}

export interface ExtensionSettingsPayload {
  pinnedDeckId: string | null;
  autoShowFloatingIcon: boolean;
  shortcutKey: string;
  blacklistedDomains: string[];
}

export interface RecentCaptureItem {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  deckTitle: string;
  capturedAt: string;
  sourceUrl?: string | null;
}

export interface ExtensionStorageState {
  token: string | null;
  user: ExtensionUserSummary | null;
  settings: ExtensionSettingsPayload;
  recentCaptures: RecentCaptureItem[];
}

export type ExtensionMessage =
  | { type: "QUICK_CAPTURE"; payload: QuickCaptureCardDto }
  | { type: "GET_AUTH_STATUS" }
  | { type: "LOGIN"; payload: { identifier: string; password: string } }
  | { type: "SET_AUTH_TOKEN"; payload: { token: string } }
  | { type: "LOGOUT" }
  | { type: "FETCH_DECKS" }
  | { type: "GET_SETTINGS" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<ExtensionSettingsPayload> };
