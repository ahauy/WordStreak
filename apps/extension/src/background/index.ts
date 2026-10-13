import { apiClient } from "./api-client";
import { extensionStorage } from "../shared/storage";
import { badgeManager } from "./badge-manager";
import { reminderManager } from "./reminder-manager";
import { ALARM_NAMES } from "../shared/constants";
import type {
  QuickCaptureCardDto,
  ExtensionMessage,
} from "@wordstreak/shared-types";

// Register Context Menu, ensure alarms, and inject content script on install/update
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "ws-quick-capture",
    title: 'Thêm "%s" vào WordStreak',
    contexts: ["selection"],
  });

  await badgeManager.ensurePeriodicAlarm();
  void badgeManager.refreshBadgeNow();
  await reminderManager.ensureDailyReminderAlarm();

  // Automatically inject content script into all active http/https tabs
  try {
    const tabs = await chrome.tabs.query({
      url: ["http://*/*", "https://*/*"],
    });
    for (const tab of tabs) {
      if (
        tab.id &&
        tab.url &&
        !tab.url.startsWith("chrome://") &&
        !tab.url.startsWith("brave://") &&
        !tab.url.startsWith("edge://")
      ) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
        } catch {
          // Ignored for restricted frames or discarded tabs
        }
      }
    }
  } catch {
    // Ignored if permissions are not granted yet
  }
});

// Refresh badge and alarms on browser startup
chrome.runtime.onStartup.addListener(async () => {
  await badgeManager.ensurePeriodicAlarm();
  void badgeManager.refreshBadgeNow();
  await reminderManager.ensureDailyReminderAlarm();
});

// Handle scheduled alarms for badge refreshing and reminders
chrome.alarms.onAlarm.addListener((alarm) => {
  if (
    alarm.name === ALARM_NAMES.BADGE_PERIODIC ||
    alarm.name === ALARM_NAMES.BADGE_NEXT_DUE
  ) {
    void badgeManager.refreshBadgeNow();
  } else if (
    alarm.name === ALARM_NAMES.DAILY_REMINDER ||
    alarm.name === ALARM_NAMES.REMINDER_SNOOZE
  ) {
    void reminderManager.handleAlarm(alarm.name, () =>
      badgeManager.refreshBadgeNow({ skipReminderEval: true }),
    );
  }
});

// Handle Study Reminder notification clicks and dismissals
if (typeof chrome !== "undefined" && chrome.notifications) {
  chrome.notifications.onClicked?.addListener((notificationId) => {
    void reminderManager.handleNotificationClicked(notificationId);
  });

  chrome.notifications.onButtonClicked?.addListener(
    (notificationId, buttonIndex) => {
      void reminderManager.handleNotificationButtonClicked(
        notificationId,
        buttonIndex,
      );
    },
  );

  chrome.notifications.onClosed?.addListener((notificationId, byUser) => {
    void reminderManager.handleNotificationClosed(notificationId, byUser);
  });
}

function sendToastToTab(
  tabId: number,
  success: boolean,
  message: string,
  isDuplicate?: boolean,
): void {
  chrome.tabs.sendMessage(tabId, {
    type: "SHOW_IN_PAGE_TOAST",
    payload: { success, message, isDuplicate },
  });
}

async function performContextMenuCapture(
  word: string,
  tabId: number,
  url?: string,
): Promise<void> {
  const token = await extensionStorage.getToken();
  if (!token) {
    sendToastToTab(
      tabId,
      false,
      "Vui lòng mở Extension để đăng nhập WordStreak trước khi lưu từ",
    );
    return;
  }

  const settings = await extensionStorage.getSettings();
  const payload: QuickCaptureCardDto = {
    word,
    deckId: settings.pinnedDeckId || undefined,
    sourceUrl: url,
  };

  const result = await apiClient.quickCapture(payload);

  await extensionStorage.addRecentCapture({
    id: result.card.id,
    word: result.card.word,
    meaning: result.card.meaning,
    phonetic: result.card.phonetic,
    deckTitle: result.deck.title,
    capturedAt: new Date().toISOString(),
    sourceUrl: url,
  });

  void badgeManager.refreshBadgeNow();
  sendToastToTab(tabId, true, result.message, result.isDuplicate);
}

async function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab,
): Promise<void> {
  if (info.menuItemId === "ws-quick-capture" && info.selectionText && tab?.id) {
    try {
      await performContextMenuCapture(info.selectionText.trim(), tab.id, tab.url);
    } catch (error: any) {
      sendToastToTab(tab.id, false, error.message || "Lỗi lưu từ vựng");
    }
  }
}

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  void handleContextMenuClick(info, tab);
});

async function resolveAuthStatusUser() {
  const token = await extensionStorage.getToken();
  let user = await extensionStorage.getUser();
  if (token) {
    try {
      user = await apiClient.getMe();
      await extensionStorage.setUser(user);
      void badgeManager.refreshBadgeNow();
    } catch (e: any) {
      if (e.message?.includes("UNAUTHORIZED") || e.message?.includes("401")) {
        await badgeManager.clearAuthAndBadge();
        user = null;
      }
    }
  } else {
    await badgeManager.clearAuthAndBadge();
    user = null;
  }
  return { token, user };
}

async function handleSetAuthToken(token: string) {
  await extensionStorage.setToken(token);
  void badgeManager.refreshBadgeNow();
  await reminderManager.ensureDailyReminderAlarm();
  try {
    const user = await apiClient.getMe();
    await extensionStorage.setUser(user);
    return user;
  } catch {
    return null;
  }
}

async function handleAuthMessage(
  message: ExtensionMessage,
): Promise<{ handled: true; result: any } | { handled: false }> {
  switch (message.type) {
    case "LOGIN": {
      const result = await apiClient.login(message.payload);
      await extensionStorage.setToken(result.accessToken);
      await extensionStorage.setUser(result.user);
      void badgeManager.refreshBadgeNow();
      await reminderManager.ensureDailyReminderAlarm();
      return { handled: true, result: { success: true, data: result } };
    }
    case "GET_AUTH_STATUS": {
      const data = await resolveAuthStatusUser();
      return { handled: true, result: { success: true, data } };
    }
    case "SET_AUTH_TOKEN": {
      const user = await handleSetAuthToken(message.payload.token);
      return { handled: true, result: { success: true, data: { user } } };
    }
    case "LOGOUT": {
      await badgeManager.clearAuthAndBadge();
      return { handled: true, result: { success: true } };
    }
    default:
      return { handled: false };
  }
}

async function handleQuickCaptureMessage(payload: QuickCaptureCardDto) {
  const token = await extensionStorage.getToken();
  if (!token) {
    throw new Error("UNAUTHORIZED: Vui lòng đăng nhập WordStreak trên Extension");
  }
  const settings = await extensionStorage.getSettings();
  const requestPayload: QuickCaptureCardDto = {
    ...payload,
    deckId: payload.deckId || settings.pinnedDeckId || undefined,
  };
  const result = await apiClient.quickCapture(requestPayload);
  await extensionStorage.addRecentCapture({
    id: result.card.id,
    word: result.card.word,
    meaning: result.card.meaning,
    phonetic: result.card.phonetic,
    deckTitle: result.deck.title,
    capturedAt: new Date().toISOString(),
    sourceUrl: payload.sourceUrl,
  });
  void badgeManager.refreshBadgeNow();
  return { success: true, data: result };
}

async function handleGeneralMessage(message: ExtensionMessage): Promise<any> {
  switch (message.type) {
    case "QUICK_CAPTURE":
      return await handleQuickCaptureMessage(message.payload);
    case "REFRESH_BADGE": {
      if (message.payload?.immediate) {
        const summary = await badgeManager.refreshBadgeNow();
        return { success: true, data: { summary, debounced: false } };
      }
      badgeManager.scheduleDebouncedRefresh();
      return { success: true, data: { debounced: true } };
    }
    case "FETCH_DECKS": {
      const decks = await apiClient.getDecks();
      return { success: true, data: decks };
    }
    case "GET_SETTINGS": {
      const settings = await extensionStorage.getSettings();
      return { success: true, data: settings };
    }
    case "UPDATE_SETTINGS": {
      const updated = await extensionStorage.updateSettings(message.payload);
      await reminderManager.ensureDailyReminderAlarm();
      return { success: true, data: updated };
    }
    default:
      throw new Error(`Unknown message type: ${(message as any).type}`);
  }
}

// Handle Messages from Content Script & Popup
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    const handleAsyncMessage = async () => {
      const authHandled = await handleAuthMessage(message);
      if (authHandled.handled) {
        return authHandled.result;
      }
      return await handleGeneralMessage(message);
    };

    handleAsyncMessage()
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    return true; // Keep message channel open for async response
  },
);
