/**
 * Contract: Extension Auth & Storage Sync
 */

export interface ExtensionUserSummary {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface ExtensionSettingsPayload {
  pinnedDeckId: string | null;
  autoShowFloatingIcon: boolean;
  shortcutKey: string;
  blacklistedDomains: string[];
}

export interface ExtensionStorageState {
  token: string | null;
  user: ExtensionUserSummary | null;
  settings: ExtensionSettingsPayload;
  recentCaptures: Array<{
    id: string;
    word: string;
    definition: string;
    deckTitle: string;
    capturedAt: string;
    sourceUrl?: string;
  }>;
}
