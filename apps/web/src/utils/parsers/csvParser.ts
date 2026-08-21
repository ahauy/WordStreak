import Papa from "papaparse";

export interface ParsedCsvResult {
  headers: string[];
  rows: string[][];
  errors: string[];
}

export interface CsvParsedData {
  data: Record<string, string>[];
  headers: string[];
  meta: Papa.ParseMeta;
  errors: string[];
}

/**
 * Strips UTF-8 BOM from string if present
 */
export function stripBom(text: string): string {
  if (!text) return "";
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

/**
 * Sanitizes CSV cell against CWE-1236 Formula Injection on ingest.
 * If leading with single quote escaping formula character, strip single quote.
 * If starting with formula operator (=, +, -, @, \t, \r), strip the prefix.
 */
export function sanitizeCsvCell(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  let value = String(raw).trim();

  // If escaped with leading single quote before formula character, e.g. '=CMD...
  if (value.startsWith("'") && /^[=+\-@\t\r]/.test(value.slice(1))) {
    value = value.slice(1).trim();
  }

  // Strip leading dangerous formula triggers on import
  while (value.length > 0 && /^[=+\-@\t\r]/.test(value)) {
    // If it is just a plain negative number like -5 or +5, keep if purely numeric
    if (/^[+-]\d+(\.\d+)?$/.test(value)) {
      break;
    }
    value = value.slice(1).trim();
  }

  return value;
}

/**
 * Parses a CSV string and returns an array of object records along with headers and metadata
 */
export function parseCsv(csvContent: string): CsvParsedData {
  const cleanText = stripBom(csvContent).trim();
  if (!cleanText) {
    return {
      data: [],
      headers: [],
      meta: {
        delimiter: ",",
        linebreak: "\n",
        aborted: false,
        truncated: false,
        cursor: 0,
      },
      errors: ["Nội dung tập tin rỗng"],
    };
  }

  const parsed = Papa.parse<Record<string, unknown>>(cleanText, {
    header: true,
    delimiter: "", // Auto-detect delimiter
    skipEmptyLines: "greedy",
    transformHeader: (header: string) => sanitizeCsvCell(header),
    transform: (value: string) => sanitizeCsvCell(value),
  });

  const headers = parsed.meta.fields
    ? parsed.meta.fields.map(sanitizeCsvCell)
    : [];
  const errors = parsed.errors.map((e) => `Dòng ${e.row ?? 0}: ${e.message}`);

  const cleanData: Record<string, string>[] = (parsed.data || [])
    .filter((row) =>
      Object.values(row).some((val) => val && String(val).trim().length > 0),
    )
    .map((row) => {
      const sanitizedRow: Record<string, string> = {};
      for (const [key, val] of Object.entries(row)) {
        if (key) {
          sanitizedRow[key] = sanitizeCsvCell(val);
        }
      }
      return sanitizedRow;
    });

  return {
    data: cleanData,
    headers,
    meta: parsed.meta,
    errors,
  };
}

/**
 * Parses raw CSV text content with auto-delimiter detection and CWE-1236 sanitization
 */
export function parseCsvText(rawText: string): ParsedCsvResult {
  const cleanText = stripBom(rawText).trim();
  if (!cleanText) {
    return { headers: [], rows: [], errors: ["Nội dung tập tin rỗng"] };
  }

  const parseOutput = Papa.parse<string[]>(cleanText, {
    delimiter: "", // Auto-detect delimiter (comma, semicolon, tab, pipe)
    skipEmptyLines: "greedy",
  });

  const parsedData = parseOutput.data.filter((row) =>
    row.some((cell) => cell && cell.trim().length > 0),
  );

  if (parsedData.length === 0) {
    return {
      headers: [],
      rows: [],
      errors: ["Không tìm thấy dữ liệu hợp lệ trong tập tin"],
    };
  }

  const rawHeaders = parsedData[0].map((h) => sanitizeCsvCell(h));
  const rawRows = parsedData
    .slice(1)
    .map((row) => row.map((cell) => sanitizeCsvCell(cell ?? "")));

  const errors = parseOutput.errors.map(
    (e) => `Dòng ${e.row ?? 0}: ${e.message}`,
  );

  return {
    headers: rawHeaders,
    rows: rawRows,
    errors,
  };
}

/**
 * Reads a File object in the browser and parses it as CSV
 */
export async function parseCsvFile(file: File): Promise<ParsedCsvResult> {
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Dung lượng tập tin vượt quá giới hạn cho phép (tối đa 15MB)",
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        resolve(parseCsvText(text));
      } catch (err: unknown) {
        reject(
          new Error(
            err instanceof Error
              ? err.message
              : "Không thể đọc nội dung tập tin",
          ),
        );
      }
    };
    reader.onerror = () => reject(new Error("Lỗi khi đọc tập tin từ thiết bị"));
    reader.readAsText(file, "UTF-8");
  });
}
