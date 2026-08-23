import { apiClient } from "./api-client";
import { extensionStorage } from "../shared/storage";
import type {
  QuickCaptureCardDto,
  ExtensionMessage,
} from "@wordstreak/shared-types";

// Register Context Menu and inject content script on install/update
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "ws-quick-capture",
    title: 'Thêm "%s" vào WordStreak',
    contexts: ["selection"],
  });

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

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "ws-quick-capture" && info.selectionText && tab?.id) {
    try {
      const token = await extensionStorage.getToken();
      if (!token) {
        chrome.tabs.sendMessage(tab.id, {
          type: "SHOW_IN_PAGE_TOAST",
          payload: {
            success: false,
            message:
              "Vui lòng mở Extension để đăng nhập WordStreak trước khi lưu từ",
          },
        });
        return;
      }

      const settings = await extensionStorage.getSettings();
      const word = info.selectionText.trim();
      const payload: QuickCaptureCardDto = {
        word,
        deckId: settings.pinnedDeckId || undefined,
        sourceUrl: tab.url,
      };

      const result = await apiClient.quickCapture(payload);

      // Save to recent captures
      await extensionStorage.addRecentCapture({
        id: result.card.id,
        word: result.card.word,
        meaning: result.card.meaning,
        phonetic: result.card.phonetic,
        deckTitle: result.deck.title,
        capturedAt: new Date().toISOString(),
        sourceUrl: tab.url,
      });

      // Send toast notification message to content script
      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_IN_PAGE_TOAST",
        payload: {
          success: true,
          message: result.message,
          isDuplicate: result.isDuplicate,
        },
      });
    } catch (error: any) {
      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_IN_PAGE_TOAST",
        payload: {
          success: false,
          message: error.message || "Lỗi lưu từ vựng",
        },
      });
    }
  }
});

// Handle Messages from Content Script & Popup
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    const handleAsyncMessage = async () => {
      switch (message.type) {
        case "LOGIN": {
          const result = await apiClient.login(message.payload);
          await extensionStorage.setToken(result.accessToken);
          await extensionStorage.setUser(result.user);
          return { success: true, data: result };
        }

        case "QUICK_CAPTURE": {
          const token = await extensionStorage.getToken();
          if (!token) {
            throw new Error(
              "UNAUTHORIZED: Vui lòng đăng nhập WordStreak trên Extension",
            );
          }

          const settings = await extensionStorage.getSettings();
          const payload: QuickCaptureCardDto = {
            ...message.payload,
            deckId:
              message.payload.deckId || settings.pinnedDeckId || undefined,
          };

          const result = await apiClient.quickCapture(payload);

          await extensionStorage.addRecentCapture({
            id: result.card.id,
            word: result.card.word,
            meaning: result.card.meaning,
            phonetic: result.card.phonetic,
            deckTitle: result.deck.title,
            capturedAt: new Date().toISOString(),
            sourceUrl: message.payload.sourceUrl,
          });

          return { success: true, data: result };
        }

        case "GET_AUTH_STATUS": {
          const token = await extensionStorage.getToken();
          let user = await extensionStorage.getUser();

          if (token) {
            try {
              user = await apiClient.getMe();
              await extensionStorage.setUser(user);
            } catch (e: any) {
              if (
                e.message?.includes("UNAUTHORIZED") ||
                e.message?.includes("401")
              ) {
                await extensionStorage.setToken(null);
                await extensionStorage.setUser(null);
                user = null;
              }
            }
          } else {
            user = null;
          }

          return { success: true, data: { token, user } };
        }

        case "SET_AUTH_TOKEN": {
          await extensionStorage.setToken(message.payload.token);
          try {
            const user = await apiClient.getMe();
            await extensionStorage.setUser(user);
            return { success: true, data: { user } };
          } catch {
            return { success: true, data: { user: null } };
          }
        }

        case "LOGOUT": {
          await extensionStorage.setToken(null);
          await extensionStorage.setUser(null);
          return { success: true };
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
          const updated = await extensionStorage.updateSettings(
            message.payload,
          );
          return { success: true, data: updated };
        }

        default:
          throw new Error(`Unknown message type: ${(message as any).type}`);
      }
    };

    handleAsyncMessage()
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    return true; // Keep message channel open for async response
  },
);
