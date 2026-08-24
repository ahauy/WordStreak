/**
 * Render Rich In-Page Toast notification inside Shadow DOM
 * Strictly adhering to WordStreak DESIGN.md (Paper-white canvas, hairline border, obsidian pills)
 */
export interface InPageToastOptions {
  message?: string;
  word?: string;
  meaning?: string;
  phonetic?: string | null;
  deckTitle?: string;
  type?: "success" | "warning" | "error";
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export function createInPageToast(options: InPageToastOptions): HTMLElement {
  const {
    message,
    word,
    meaning,
    phonetic,
    deckTitle,
    type = "success",
    actionLabel,
    onAction,
    duration = 4000,
  } = options;

  const toast = document.createElement("div");
  toast.className = `ws-toast ws-toast-${type} ws-pointer-events-auto`;

  // Purple Mascot Flame Icon or Status Icon
  const flameSvg = `
    <div class="ws-toast-icon-wrap">
      <svg class="ws-flame-icon" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="${type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#863bff"}"/>
      </svg>
    </div>
  `;

  if (word) {
    // Rich Card Layout
    toast.innerHTML = `
      ${flameSvg}
      <div class="ws-toast-content">
        <div class="ws-toast-header">
          <span class="ws-toast-word">${word}</span>
          ${phonetic ? `<span class="ws-toast-phonetic">${phonetic}</span>` : ""}
          ${deckTitle ? `<span class="ws-toast-deck-badge" title="Bộ từ: ${deckTitle}">📁 ${deckTitle}</span>` : ""}
        </div>
        ${meaning ? `<div class="ws-toast-meaning">${meaning}</div>` : ""}
        ${message ? `<div class="ws-toast-subtext">${message}</div>` : ""}
      </div>
      <div class="ws-toast-actions">
        ${actionLabel && onAction ? `<button class="ws-toast-btn">${actionLabel}</button>` : ""}
        <button class="ws-toast-close" title="Đóng">×</button>
      </div>
      <div class="ws-toast-progress-bar"></div>
    `;
  } else {
    // Standard compact message
    toast.innerHTML = `
      ${flameSvg}
      <div class="ws-toast-content">
        <div class="ws-toast-single-msg">${message || "Đã lưu từ vựng"}</div>
      </div>
      <div class="ws-toast-actions">
        ${actionLabel && onAction ? `<button class="ws-toast-btn">${actionLabel}</button>` : ""}
        <button class="ws-toast-close" title="Đóng">×</button>
      </div>
    `;
  }

  // Handle action click
  if (actionLabel && onAction) {
    const btn = toast.querySelector(".ws-toast-btn");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      onAction();
      toast.remove();
    });
  }

  // Handle close click
  const closeBtn = toast.querySelector(".ws-toast-close");
  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toast.remove();
  });

  // Auto remove timer with hover pause
  let dismissTimer: any = null;
  const startTimer = () => {
    dismissTimer = setTimeout(() => {
      toast.style.transition =
        "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(16px) scale(0.95)";
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  startTimer();

  toast.addEventListener("mouseenter", () => {
    clearTimeout(dismissTimer);
    const bar = toast.querySelector(".ws-toast-progress-bar") as HTMLElement;
    if (bar) bar.style.animationPlayState = "paused";
  });

  toast.addEventListener("mouseleave", () => {
    startTimer();
    const bar = toast.querySelector(".ws-toast-progress-bar") as HTMLElement;
    if (bar) bar.style.animationPlayState = "running";
  });

  return toast;
}
