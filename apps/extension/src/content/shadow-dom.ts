/**
 * Quản lý Shadow DOM Root cho In-page Overlays của WordStreak
 * Tuân thủ nghiêm ngặt Design System WordStreak (apps/web/DESIGN.md & MEMORY.md)
 */

export class ShadowDomManager {
  private static instance: ShadowDomManager;
  private shadowRoot: ShadowRoot | null = null;
  private mountContainer: HTMLElement | null = null;

  private constructor() {}

  static getInstance(): ShadowDomManager {
    if (!ShadowDomManager.instance) {
      ShadowDomManager.instance = new ShadowDomManager();
    }
    return ShadowDomManager.instance;
  }

  getOrCreateMount(): { shadowRoot: ShadowRoot; mountContainer: HTMLElement } {
    if (this.shadowRoot && this.mountContainer) {
      return {
        shadowRoot: this.shadowRoot,
        mountContainer: this.mountContainer,
      };
    }

    // 1. Tạo Host Element
    let host = document.getElementById("wordstreak-extension-root");
    if (!host) {
      host = document.createElement("div");
      host.id = "wordstreak-extension-root";
      host.style.position = "absolute";
      host.style.top = "0";
      host.style.left = "0";
      host.style.width = "100%";
      host.style.height = "0";
      host.style.overflow = "visible";
      host.style.zIndex = "2147483647"; // Max z-index
      host.style.pointerEvents = "none"; // Click-through by default
      document.documentElement.appendChild(host);
    }

    // 2. Tạo Shadow Root
    this.shadowRoot = host.shadowRoot || host.attachShadow({ mode: "open" });

    // 3. Tiêm CSS Reset & Design System Tokens vào Shadow Root
    const style = document.createElement("style");
    style.textContent = `
      :host {
        all: initial;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #111827;
        font-size: 14px;
        line-height: 1.5;
        box-sizing: border-box;
      }
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      .ws-pointer-events-auto {
        pointer-events: auto;
      }
      .ws-floating-btn {
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: #ffffff;
        border: 1.5px solid #863bff;
        border-radius: 9999px;
        box-shadow: 0 4px 16px rgba(134, 59, 255, 0.35), 0 2px 6px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
        z-index: 2147483647;
      }
      .ws-floating-btn:hover {
        transform: scale(1.12);
        box-shadow: 0 8px 24px rgba(134, 59, 255, 0.45);
      }
      .ws-floating-btn:active {
        transform: scale(0.94);
      }
      .ws-flame-icon {
        width: 20px;
        height: 20px;
      }

      /* Rich Toast Card (DESIGN.md specification) */
      .ws-toast {
        position: fixed;
        bottom: 28px;
        right: 28px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px 20px;
        background: #ffffff;
        border: 1px solid #e5e5e5;
        border-radius: 20px;
        box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.14), 0 6px 16px -4px rgba(0, 0, 0, 0.08);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #111827;
        z-index: 2147483647;
        max-width: 440px;
        min-width: 320px;
        overflow: hidden;
        animation: wsSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .ws-toast-icon-wrap {
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: #ede6ff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .ws-toast-content {
        flex: 1;
        min-width: 0;
      }
      .ws-toast-header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 3px;
      }
      .ws-toast-word {
        font-family: 'Nunito', -apple-system, sans-serif;
        font-size: 15.5px;
        font-weight: 800;
        color: #111827;
      }
      .ws-toast-phonetic {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 600;
        color: #863bff;
        background: #f5f3ff;
        padding: 1px 6px;
        border-radius: 6px;
      }
      .ws-toast-deck-badge {
        font-size: 11px;
        font-weight: 600;
        color: #4b5563;
        background: #f3f4f6;
        padding: 2px 8px;
        border-radius: 9999px;
        max-width: 140px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ws-toast-meaning {
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        line-height: 1.4;
        margin-top: 2px;
      }
      .ws-toast-subtext {
        font-size: 11.5px;
        color: #10b981;
        font-weight: 600;
        margin-top: 4px;
      }
      .ws-toast-single-msg {
        font-size: 13.5px;
        font-weight: 600;
        color: #111827;
        padding-top: 6px;
      }
      .ws-toast-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin-left: 4px;
      }
      .ws-toast-btn {
        background: #000000;
        color: #ffffff;
        border: none;
        border-radius: 9999px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        transition: opacity 0.15s ease, transform 0.15s ease;
        white-space: nowrap;
      }
      .ws-toast-btn:hover {
        opacity: 0.85;
        transform: scale(1.03);
      }
      .ws-toast-close {
        background: none;
        border: none;
        font-size: 18px;
        line-height: 1;
        color: #9ca3af;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 6px;
      }
      .ws-toast-close:hover {
        color: #111827;
      }
      .ws-toast-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: #863bff;
        width: 100%;
        border-radius: 0 0 20px 20px;
        animation: wsProgress 4s linear forwards;
      }
      @keyframes wsProgress {
        from { width: 100%; }
        to { width: 0%; }
      }
      @keyframes wsSlideUp {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    this.shadowRoot.appendChild(style);

    // 4. Container cho các element
    this.mountContainer = document.createElement("div");
    this.mountContainer.className = "ws-mount-container";
    this.shadowRoot.appendChild(this.mountContainer);

    return { shadowRoot: this.shadowRoot, mountContainer: this.mountContainer };
  }
}
