import { SELECTION_LIMITS } from "../shared/constants";

/**
 * Trích xuất câu ngữ cảnh bao quanh từ được chọn
 */
export function extractSentence(
  selectedWord: string,
  containerText: string,
  maxLength: number = SELECTION_LIMITS.MAX_CONTEXT_LENGTH,
): string {
  if (!selectedWord || !containerText) {
    return selectedWord || "";
  }

  const cleanWord = selectedWord.trim();
  const cleanContainer = containerText.replace(/\s+/g, " ").trim();

  const wordIndex = cleanContainer
    .toLowerCase()
    .indexOf(cleanWord.toLowerCase());
  if (wordIndex === -1) {
    return cleanWord;
  }

  // 1. Tìm điểm bắt đầu câu (dấu ., !, ?, hoặc đầu chuỗi)
  let startIndex = 0;
  for (let i = wordIndex - 1; i >= 0; i--) {
    const char = cleanContainer[i];
    if (char === "." || char === "!" || char === "?" || char === "\n") {
      startIndex = i + 1;
      break;
    }
  }

  // 2. Tìm điểm kết thúc câu (dấu ., !, ?, hoặc cuối chuỗi)
  let endIndex = cleanContainer.length;
  for (let i = wordIndex + cleanWord.length; i < cleanContainer.length; i++) {
    const char = cleanContainer[i];
    if (char === "." || char === "!" || char === "?" || char === "\n") {
      endIndex = i + 1;
      break;
    }
  }

  let sentence = cleanContainer.substring(startIndex, endIndex).trim();

  // 3. Giới hạn độ dài tối đa nếu câu quá dài
  if (sentence.length > maxLength) {
    sentence = sentence.substring(0, maxLength).trim() + "...";
  }

  return sentence || cleanWord;
}

/**
 * Kiểm tra xem chuỗi bôi đen có phải là từ/cụm từ tiếng Anh hợp lệ
 */
export function isValidSelection(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (
    trimmed.length < SELECTION_LIMITS.MIN_LENGTH ||
    trimmed.length > SELECTION_LIMITS.MAX_LENGTH
  ) {
    return false;
  }

  const words = trimmed.split(/\s+/);
  if (words.length > SELECTION_LIMITS.MAX_WORDS) {
    return false;
  }

  // Bỏ qua nếu toàn số hoặc ký tự đặc biệt
  const hasLetters = /[a-zA-Z]/.test(trimmed);
  const isUrlOrEmail =
    /^(https?:\/\/|www\.|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(
      trimmed,
    );

  return hasLetters && !isUrlOrEmail;
}
