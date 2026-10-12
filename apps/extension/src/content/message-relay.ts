export function handleWindowMessage(event: { source: any; data: any }): void {
  if (typeof window !== "undefined" && event.source !== window) {
    return;
  }

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
  } else if (event.data?.type === "WORDSTREAK_REVIEW_SYNC") {
    chrome.runtime.sendMessage({ type: "REFRESH_BADGE" });
  }
}
