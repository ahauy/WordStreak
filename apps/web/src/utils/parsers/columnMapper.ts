import type {
  StandardCardField,
  ConflictStrategy,
  CardResponse,
  CardBatchItemDto,
} from "@wordstreak/shared-types";

export type RowValidationStatus = "VALID" | "DUPLICATE" | "INVALID";

export interface ValidatedRow {
  index: number;
  rawValues: string[];
  data: Partial<Record<StandardCardField, string>>;
  status: RowValidationStatus;
  errors: string[];
  isDuplicate: boolean;
  isIncluded: boolean;
  conflictAction?: ConflictStrategy;
}

export type ColumnMapping = Record<number, StandardCardField | "ignore">;

const ALIASES: Record<StandardCardField, string[]> = {
  word: [
    "word",
    "term",
    "front",
    "vocab",
    "vocabulary",
    "tu_vung",
    "tu vung",
    "từ",
    "từ vựng",
    "thuật ngữ",
    "mặt trước",
  ],
  meaning: [
    "meaning",
    "back",
    "definition",
    "translation",
    "nghia",
    "định nghĩa",
    "dịch",
    "nghĩa",
    "nghĩa tiếng việt",
    "giải nghĩa",
    "mặt sau",
  ],
  phonetic: [
    "phonetic",
    "ipa",
    "pronunciation",
    "phát âm",
    "phiên âm",
    "phien am",
    "phat am",
  ],
  exampleSentence: [
    "example",
    "sentence",
    "example sentence",
    "ví dụ",
    "cau_vi_du",
    "câu ví dụ",
    "cau vi du",
    "vi du",
    "câu mẫu",
  ],
  collocations: [
    "collocations",
    "collocation",
    "phrasal",
    "phrasal verbs",
    "cụm từ",
    "cum tu",
    "cụm từ đi kèm",
  ],
  mnemonic: [
    "mnemonic",
    "hint",
    "memory hint",
    "mẹo nhớ",
    "meo nho",
    "ghi chú",
    "ghi chu",
    "note",
    "notes",
  ],
  imageUrl: [
    "image",
    "imageurl",
    "image_url",
    "picture",
    "photo",
    "hình ảnh",
    "hinh anh",
    "ảnh",
    "anh",
  ],
  audioUrl: [
    "audio",
    "audiourl",
    "audio_url",
    "sound",
    "pronunciation_audio",
    "âm thanh",
    "am thanh",
  ],
};

/**
 * Normalizes header string for fuzzy comparison
 */
export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFC")
    .trim()
    .replace(/[_\-\s]+/g, " ");
}

/**
 * Matches a column header name to a standard card field using prioritized exact, word and substring lookup
 */
export function detectFieldForHeader(
  header: string,
): StandardCardField | "ignore" {
  const norm = normalizeHeader(header);
  if (!norm) return "ignore";

  const entries = Object.entries(ALIASES) as Array<
    [StandardCardField, string[]]
  >;

  // Pass 1: Exact match
  for (const [field, aliasList] of entries) {
    for (const alias of aliasList) {
      if (norm === normalizeHeader(alias)) {
        return field;
      }
    }
  }

  // Pass 2: Whole word boundary match
  for (const [field, aliasList] of entries) {
    for (const alias of aliasList) {
      const normAlias = normalizeHeader(alias);
      const words = norm.split(" ");
      if (words.includes(normAlias)) {
        return field;
      }
    }
  }

  // Pass 3: Substring match for phrases >= 4 characters
  for (const [field, aliasList] of entries) {
    for (const alias of aliasList) {
      const normAlias = normalizeHeader(alias);
      if (
        normAlias.length >= 4 &&
        (norm.includes(normAlias) || normAlias.includes(norm))
      ) {
        return field;
      }
    }
  }

  return "ignore";
}

/**
 * Auto-detects column mappings for an array of headers
 */
export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const mappedFields = new Set<StandardCardField>();

  // If only 2 or 3 columns with generic headers like Column 1, Column 2
  const isGeneric = headers.every(
    (h, idx) =>
      !h.trim() || /^col(umn)?\s*\d+$/i.test(h) || h.trim() === String(idx + 1),
  );

  if (isGeneric && headers.length >= 2) {
    mapping[0] = "word";
    mapping[1] = "meaning";
    if (headers.length >= 3) mapping[2] = "phonetic";
    if (headers.length >= 4) mapping[3] = "exampleSentence";
    for (let i = 4; i < headers.length; i++) mapping[i] = "ignore";
    return mapping;
  }

  headers.forEach((header, index) => {
    const matched = detectFieldForHeader(header);
    if (matched !== "ignore" && !mappedFields.has(matched)) {
      mapping[index] = matched;
      mappedFields.add(matched);
    } else {
      mapping[index] = "ignore";
    }
  });

  // Fallback: If word or meaning not detected, try positional assignment if available
  if (
    !mappedFields.has("word") &&
    headers.length > 0 &&
    mapping[0] === "ignore"
  ) {
    mapping[0] = "word";
  }
  if (
    !mappedFields.has("meaning") &&
    headers.length > 1 &&
    mapping[1] === "ignore"
  ) {
    mapping[1] = "meaning";
  }

  return mapping;
}

/**
 * Transforms raw row strings into card data based on column mapping
 */
export function rowToCardData(
  rowValues: string[],
  mapping: ColumnMapping,
): Partial<Record<StandardCardField, string>> {
  const data: Partial<Record<StandardCardField, string>> = {};

  rowValues.forEach((cell, index) => {
    const field = mapping[index];
    if (field && field !== "ignore") {
      const val = (cell || "").trim();
      if (val) {
        data[field] = val;
      }
    }
  });

  return data;
}

/**
 * Validates all parsed rows against field requirements and existing deck cards
 */
export function validateAllRows(
  rows: string[][],
  mapping: ColumnMapping,
  existingCards: CardResponse[] = [],
  globalConflictStrategy: ConflictStrategy = "SKIP",
): ValidatedRow[] {
  const existingWordSet = new Set(
    existingCards.map((c) => c.word.toLowerCase().normalize("NFC").trim()),
  );

  const seenInFileWordSet = new Set<string>();

  return rows.map((rowValues, index) => {
    const data = rowToCardData(rowValues, mapping);
    const errors: string[] = [];

    const word = (data.word || "").trim();
    const meaning = (data.meaning || "").trim();

    if (!word) {
      errors.push("Thiếu từ vựng (Word)");
    }
    if (!meaning) {
      errors.push("Thiếu nghĩa (Meaning)");
    }

    const normWord = word.toLowerCase().normalize("NFC");
    const isExistingDuplicate = normWord
      ? existingWordSet.has(normWord)
      : false;
    const isFileDuplicate = normWord ? seenInFileWordSet.has(normWord) : false;
    const isDuplicate = isExistingDuplicate || isFileDuplicate;

    if (normWord) {
      seenInFileWordSet.add(normWord);
    }

    let status: RowValidationStatus = "VALID";
    if (errors.length > 0) {
      status = "INVALID";
    } else if (isDuplicate) {
      status = "DUPLICATE";
    }

    return {
      index,
      rawValues: rowValues,
      data,
      status,
      errors,
      isDuplicate,
      isIncluded: status !== "INVALID",
      conflictAction: globalConflictStrategy,
    };
  });
}

/**
 * Converts validated rows into CardBatchItemDto array ready for bulk submission
 */
export function buildCardBatch(
  validatedRows: ValidatedRow[],
  defaultStrategy: ConflictStrategy = "SKIP",
): CardBatchItemDto[] {
  return validatedRows
    .filter((row) => row.isIncluded && row.status !== "INVALID")
    .map((row) => ({
      word: row.data.word || "",
      meaning: row.data.meaning || "",
      phonetic: row.data.phonetic,
      exampleSentence: row.data.exampleSentence,
      collocations: row.data.collocations,
      mnemonic: row.data.mnemonic,
      imageUrl: row.data.imageUrl,
      audioUrl: row.data.audioUrl,
      conflictAction: row.conflictAction || defaultStrategy,
    }));
}

/**
 * Transforms raw rows and column mapping directly into CardBatchItemDto array
 */
export function mapRowsToCards(
  rows: string[][],
  mapping: ColumnMapping,
  defaultStrategy: ConflictStrategy = "SKIP",
): CardBatchItemDto[] {
  return rows.map((row) => {
    const data = rowToCardData(row, mapping);
    return {
      word: data.word || "",
      meaning: data.meaning || "",
      phonetic: data.phonetic,
      exampleSentence: data.exampleSentence,
      collocations: data.collocations,
      mnemonic: data.mnemonic,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      conflictAction: defaultStrategy,
    };
  });
}

export interface CardBatchValidationResult {
  validCards: CardBatchItemDto[];
  invalidRows: Array<{ index: number; card: CardBatchItemDto; reason: string }>;
  duplicatesInBatch: string[];
}

/**
 * Validates a batch of CardBatchItemDto items
 */
export function validateCardBatch(
  cards: CardBatchItemDto[],
): CardBatchValidationResult {
  const validCards: CardBatchItemDto[] = [];
  const invalidRows: Array<{
    index: number;
    card: CardBatchItemDto;
    reason: string;
  }> = [];
  const duplicatesInBatch: string[] = [];
  const seenWords = new Set<string>();

  cards.forEach((card, index) => {
    const word = (card.word || "").trim();
    const meaning = (card.meaning || "").trim();

    if (!word) {
      invalidRows.push({ index, card, reason: "Thiếu từ vựng (Word)" });
      return;
    }
    if (!meaning) {
      invalidRows.push({ index, card, reason: "Thiếu nghĩa (Meaning)" });
      return;
    }

    const normWord = word.toLowerCase().normalize("NFC");
    if (seenWords.has(normWord)) {
      duplicatesInBatch.push(word);
    } else {
      seenWords.add(normWord);
    }

    validCards.push(card);
  });

  return {
    validCards,
    invalidRows,
    duplicatesInBatch,
  };
}
