import { extractSentence, isValidSelection } from "./sentence-extractor";
import { ShadowDomManager } from "./shadow-dom";
import { createFloatingFlameIcon } from "./components/FloatingFlameIcon";
import { createInPageToast } from "./components/InPageToast";
import { WEB_APP_URL } from "../shared/constants";
import type { ExtensionMessage } from "@wordstreak/shared-types";

let currentFloatingIcon: HTMLElement | null = null;
let currentSelectionText = "";
let currentContextSentence = "";
let debounceTimer: any = null;

const shadowManager = ShadowDomManager.getInstance();

function removeFloatingIcon() {
  if (currentFloatingIcon) {
    currentFloatingIcon.remove();
    currentFloatingIcon = null;
  }
}

function handleSelectionChange() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      removeFloatingIcon();
      return;
    }

    const selectedText = selection.toString().trim();
    if (!isValidSelection(selectedText)) {
      removeFloatingIcon();
      return;
    }

    currentSelectionText = selectedText;

    // Get surrounding container text for context sentence extraction
    const anchorNode = selection.anchorNode;
    const containerElement = (
      anchorNode?.nodeType === Node.ELEMENT_NODE
        ? anchorNode
        : anchorNode?.parentElement
    ) as HTMLElement;

    const containerText =
      containerElement?.innerText ||
      containerElement?.textContent ||
      selectedText;
    currentContextSentence = extractSentence(selectedText, containerText);

    // Get selection coordinates (use last client rect for multiline accuracy)
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    const targetRect =
      rects.length > 0
        ? rects[rects.length - 1]
        : range.getBoundingClientRect();

    removeFloatingIcon();

    const { mountContainer } = shadowManager.getOrCreateMount();
    currentFloatingIcon = createFloatingFlameIcon(
      targetRect.right,
      targetRect.top,
      targetRect.bottom,
      () => handleQuickCapture(currentSelectionText, currentContextSentence),
    );

    mountContainer.appendChild(currentFloatingIcon);
  }, 150);
}

async function handleQuickCapture(word: string, contextSentence: string) {
  removeFloatingIcon();
  const { mountContainer } = shadowManager.getOrCreateMount();

  try {
    const message: ExtensionMessage = {
      type: "QUICK_CAPTURE",
      payload: {
        word,
        contextSentence,
        sourceUrl: window.location.href,
      },
    };

    chrome.runtime.sendMessage(message, (response) => {
      if (!response) {
        mountContainer.appendChild(
          createInPageToast({
            message: "Không thể kết nối với Extension Service Worker",
            type: "error",
          }),
        );
        return;
      }

      if (response.success && response.data) {
        const { isDuplicate, deck, card } = response.data;
        const toast = createInPageToast({
          word: card?.word || word,
          meaning: card?.meaning,
          phonetic: card?.phonetic,
          deckTitle: deck?.title,
          message: isDuplicate ? "Từ vựng này đã có trong bộ từ" : undefined,
          type: isDuplicate ? "warning" : "success",
          actionLabel: "Xem thẻ →",
          onAction: deck
            ? () => window.open(`${WEB_APP_URL}/decks/${deck.id}`, "_blank")
            : undefined,
        });
        mountContainer.appendChild(toast);
      } else {
        const errorMsg = response.error || "Lỗi lưu từ vựng";
        const isAuthError =
          errorMsg.includes("UNAUTHORIZED") || errorMsg.includes("đăng nhập");

        const toast = createInPageToast({
          message: isAuthError
            ? "Vui lòng mở Extension để đăng nhập tài khoản WordStreak"
            : errorMsg,
          type: isAuthError ? "warning" : "error",
          actionLabel: isAuthError ? "Đăng nhập" : undefined,
          onAction: isAuthError
            ? () => window.open(`${WEB_APP_URL}/login`, "_blank")
            : undefined,
        });
        mountContainer.appendChild(toast);
      }
    });
  } catch (err: any) {
    mountContainer.appendChild(
      createInPageToast({
        message: err.message || "Lỗi kết nối",
        type: "error",
      }),
    );
  }
}

// Global Event Listeners
document.addEventListener("mouseup", handleSelectionChange);
document.addEventListener("touchend", handleSelectionChange);
document.addEventListener("selectionchange", handleSelectionChange);
document.addEventListener("keyup", (e) => {
  if (e.key === "Shift" || e.key === "ArrowRight" || e.key === "ArrowLeft") {
    handleSelectionChange();
  }
});

document.addEventListener("mousedown", (e) => {
  const target = e.target as HTMLElement;
  if (
    target &&
    target.closest &&
    target.closest("#wordstreak-extension-root")
  ) {
    return;
  }
  removeFloatingIcon();
});

window.addEventListener("scroll", () => removeFloatingIcon(), {
  passive: true,
});
window.addEventListener("resize", () => removeFloatingIcon(), {
  passive: true,
});

// Listen for background notifications (e.g. from context menu click)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_IN_PAGE_TOAST" && message.payload) {
    const { mountContainer } = shadowManager.getOrCreateMount();
    const { message: msg, isDuplicate, success } = message.payload;
    mountContainer.appendChild(
      createInPageToast({
        message: msg,
        type: success ? (isDuplicate ? "warning" : "success") : "error",
      }),
    );
  }
});

// Listen for Web SSO Auth Sync from WordStreak Web App
window.addEventListener("message", (event) => {
  if (event.data?.type === "WORDSTREAK_AUTH_SYNC") {
    const token = event.data.token;
    if (token) {
      chrome.runtime.sendMessage({
        type: "SET_AUTH_TOKEN",
        payload: { token },
      });
    } else {
      chrome.runtime.sendMessage({ type: "LOGOUT" });
    }
  }
});
