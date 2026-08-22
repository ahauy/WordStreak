import type { AppLanguage } from "@wordstreak/shared-types";
import { useAuthStore } from "../store/useAuthStore";
import { userService } from "../features/user-profile/services/userService";

const SYNC_DEBOUNCE_MS = 300;

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let pendingLocale: AppLanguage | null = null;

/**
 * Synchronizes user language preference to the backend with 300ms debounce.
 * Optimistic: UI updates instantly, while database sync happens in background.
 * Resilient: Fails silently without crashing UI or showing disruptive error dialogs.
 */
export function syncLanguagePreference(newLocale: AppLanguage): void {
  const getStoreState =
    typeof useAuthStore?.getState === "function" ? useAuthStore.getState : null;

  if (!getStoreState) {
    return;
  }

  const { isAuthenticated, user } = getStoreState();

  // If user is guest/unauthenticated, do not dispatch profile update
  if (!isAuthenticated || !user) {
    return;
  }

  // Record newest target locale
  pendingLocale = newLocale;

  // Clear previous debounce timer
  if (syncTimer !== null) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(async () => {
    const localeToSync = pendingLocale;
    syncTimer = null;
    pendingLocale = null;

    if (!localeToSync) {
      return;
    }

    try {
      const updatedUser = await userService.updateProfile({
        preferredLanguage: localeToSync,
      });

      // Keep auth store user state in sync with returned response
      if (updatedUser?.preferredLanguage) {
        useAuthStore.getState().updateUser({
          preferredLanguage: updatedUser.preferredLanguage,
        });
      }
    } catch (error) {
      // Graceful degradation: Log warning silently without throwing or reverting UI
      console.warn(
        "[i18n-sync] Background language sync failed (network/offline):",
        error,
      );
    }
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Cancels any pending debounced language sync timer.
 */
export function cancelPendingLanguageSync(): void {
  if (syncTimer !== null) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
  pendingLocale = null;
}
