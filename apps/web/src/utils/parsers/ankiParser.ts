import JSZip from "jszip";

export interface ParsedAnkiResult {
  headers: string[];
  rows: string[][];
  errors: string[];
}

/**
 * Sanitizes HTML content from Anki cards into clean markdown / plain text
 */
export function sanitizeAnkiHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let text = html;

  // 1. Remove dangerous or non-content tags and comments
  text = text.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  text = text.replace(
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    "",
  );
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // 2. Normalize Cloze deletions {{c1::answer::hint}} -> answer (hint)
  text = text.replace(/\{\{c\d+::(.*?)::(.*?)\}\}/g, "$1 ($2)");
  text = text.replace(/\{\{c\d+::(.*?)\}\}/g, "$1");

  // 3. Convert line breaks and structural block elements to newlines
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<p[^>]*>/gi, "");
  text = text.replace(/<div[^>]*>/gi, "");

  // 4. Convert bold and italic styling
  text = text.replace(/<(?:b|strong)\b[^>]*>(.*?)<\/(?:b|strong)>/gi, "**$1**");
  text = text.replace(/<(?:i|em)\b[^>]*>(.*?)<\/(?:i|em)>/gi, "*$1*");

  // 5. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // 6. Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // 7. Collapse excessive whitespace / newlines
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extracts note fields from Anki collection buffer by scanning unit-separator delimited records
 */
export function extractNotesFromBuffer(buffer: Uint8Array): string[][] {
  const decoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });
  const rawContent = decoder.decode(buffer);

  // In Anki's SQLite collection, note fields are concatenated with 0x1F (\x1f)
  // We match chunks that contain field separators
  const rows: string[][] = [];
  const UNIT_SEPARATOR = "\x1f";

  // Regex to extract sequences of text with unit separators
  // Matches valid field strings inside the SQLite binary page structures
  // eslint-disable-next-line no-control-regex
  const fieldRegex = /([^\x00\r\n]{1,500}(?:\x1f[^\x00\r\n]{0,500}){1,10})/g;
  let match: RegExpExecArray | null;

  const seenRows = new Set<string>();

  while ((match = fieldRegex.exec(rawContent)) !== null) {
    const rawChunk = match[1];
    if (rawChunk.includes(UNIT_SEPARATOR)) {
      const rawFields = rawChunk.split(UNIT_SEPARATOR);
      const cleanFields = rawFields.map((f) => sanitizeAnkiHtml(f));

      // Ensure Front and Back are non-empty and not SQL schema garbage
      const front = cleanFields[0] || "";
      const back = cleanFields[1] || "";

      if (
        front.length >= 1 &&
        back.length >= 1 &&
        !front.includes("CREATE TABLE") &&
        !front.includes("anki2") &&
        !front.startsWith("INSERT INTO")
      ) {
        const signature = `${front}:::${back}`;
        if (!seenRows.has(signature)) {
          seenRows.add(signature);
          rows.push(cleanFields);
        }
      }
    }
  }

  return rows;
}

/**
 * Decompresses an Anki .apkg package and extracts vocabulary notes
 */
export async function parseAnkiPackage(file: File): Promise<ParsedAnkiResult> {
  const MAX_FILE_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Dung lượng tập tin vượt quá 15MB");
  }

  const zip = new JSZip();
  let zipContent: JSZip;

  try {
    const fileBuffer = await file.arrayBuffer();
    zipContent = await zip.loadAsync(fileBuffer);
  } catch {
    throw new Error(
      "Không thể giải nén tập tin .apkg. Tập tin có thể bị lỗi hoặc định dạng không đúng.",
    );
  }

  // Look for collection.anki21 or collection.anki2
  const dbFile =
    zipContent.file("collection.anki21") || zipContent.file("collection.anki2");

  if (!dbFile) {
    throw new Error(
      "Không tìm thấy cơ sở dữ liệu (collection.anki2) bên trong tập tin Anki",
    );
  }

  const dbBuffer = await dbFile.async("uint8array");
  const extractedRows = extractNotesFromBuffer(dbBuffer);

  if (extractedRows.length === 0) {
    return {
      headers: ["Front", "Back", "Extra"],
      rows: [],
      errors: ["Không tìm thấy thẻ từ vựng nào trong tập tin Anki này"],
    };
  }

  // Determine max columns found across rows
  const maxCols = Math.max(...extractedRows.map((r) => r.length));
  const headers: string[] = ["Front", "Back"];
  if (maxCols >= 3) headers.push("Phonetic");
  if (maxCols >= 4) headers.push("Example");
  for (let i = headers.length; i < maxCols; i++) {
    headers.push(`Field ${i + 1}`);
  }

  // Normalize row lengths
  const normalizedRows = extractedRows.map((r) => {
    const padded = [...r];
    while (padded.length < headers.length) {
      padded.push("");
    }
    return padded;
  });

  return {
    headers,
    rows: normalizedRows,
    errors: [],
  };
}
