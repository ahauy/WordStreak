/**
 * Hybrid audio player: Plays custom audioUrl if available,
 * otherwise falls back to browser Web Speech API (window.speechSynthesis).
 */
export function playWordPronunciation(
  word: string,
  audioUrl?: string | null,
): Promise<void> {
  return new Promise((resolve) => {
    if (!word && !audioUrl) {
      resolve();
      return;
    }

    if (audioUrl && audioUrl.trim().length > 0) {
      const audio = new Audio(audioUrl.trim());
      audio.onended = () => resolve();
      audio.onerror = () => {
        // Fallback to speech synthesis on audio error
        speakText(word).then(resolve);
      };
      audio.play().catch(() => {
        // Fallback to speech synthesis on play failure (e.g. CORS/autoplay)
        speakText(word).then(resolve);
      });
      return;
    }

    speakText(word).then(resolve);
  });
}

function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Slightly slower for clarity in learning
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha")),
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
