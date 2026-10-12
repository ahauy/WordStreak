import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { handleWindowMessage } from "./message-relay";

describe("Content Script Message Relay (TC-EDB-INT-002)", () => {
  beforeEach(() => {
    (globalThis as any).chrome = {
      runtime: {
        sendMessage: vi.fn(),
      },
    };
    (globalThis as any).window = {};
  });

  afterEach(() => {
    delete (globalThis as any).chrome;
    delete (globalThis as any).window;
  });

  it("ignores messages when event.source !== window (e.g. untrusted third-party iframe)", () => {
    const untrustedSource = {};
    const event = {
      source: untrustedSource,
      data: { type: "WORDSTREAK_REVIEW_SYNC" },
    };

    handleWindowMessage(event);

    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  it("relays WORDSTREAK_REVIEW_SYNC as REFRESH_BADGE when event.source === window", () => {
    const event = {
      source: (globalThis as any).window,
      data: { type: "WORDSTREAK_REVIEW_SYNC" },
    };

    handleWindowMessage(event);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "REFRESH_BADGE",
    });
  });

  it("relays WORDSTREAK_AUTH_SYNC with token as SET_AUTH_TOKEN when event.source === window", () => {
    const event = {
      source: (globalThis as any).window,
      data: { type: "WORDSTREAK_AUTH_SYNC", token: "jwt-sso-token" },
    };

    handleWindowMessage(event);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "SET_AUTH_TOKEN",
      payload: { token: "jwt-sso-token" },
    });
  });

  it("relays WORDSTREAK_AUTH_SYNC without token as LOGOUT when event.source === window", () => {
    const event = {
      source: (globalThis as any).window,
      data: { type: "WORDSTREAK_AUTH_SYNC", token: null },
    };

    handleWindowMessage(event);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "LOGOUT",
    });
  });
});
