import type {
  CardResponse,
  DeckExportFilter,
  DeckExportFormat,
} from "@wordstreak/shared-types";

/**
 * Escapes cell value against CWE-1236 Formula Injection.
 * Prefixes with a single quote if the cell begins with formula characters (=, +, -, @, \t, \r).
 */
export function escapeCsvCellForExport(raw: string | null | undefined): string {
  if (!raw) return "";
  let value = String(raw).trim();

  // If starts with dangerous formula trigger character, escape with single quote
  if (/^[=+\-@\t\r]/.test(value)) {
    // Preserve normal numeric values like -5 or +12
    if (!/^[+-]\d+(\.\d+)?$/.test(value)) {
      value = `'${value}`;
    }
  }

  // RFC 4180 Quoting rules:
  // If the value contains comma, newline, carriage return, or double quote, wrap in double quotes
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Filters deck cards according to user selected mastery filter
 */
export function filterCardsForExport(
  cards: CardResponse[],
  filter: DeckExportFilter = "ALL",
): CardResponse[] {
  if (filter === "ALL") return cards;

  return cards.filter((card) => {
    const status = card.progress?.status?.toUpperCase();
    if (filter === "MASTERED") {
      return status === "MASTERED";
    }
    if (filter === "LEARNING") {
      return status === "LEARNING" || status === "NEW" || status === "REVIEW";
    }
    return true;
  });
}

/**
 * Generates RFC 4180 compliant CSV string with UTF-8 BOM
 */
export function generateCardsCsv(cards: CardResponse[]): string {
  const UTF8_BOM = "\uFEFF";
  const headers = [
    "Word",
    "Meaning",
    "Phonetic",
    "Example Sentence",
    "Collocations",
    "Mnemonic",
    "Image URL",
    "Audio URL",
  ];

  const headerLine = headers.join(",");
  const rows = cards.map((c) =>
    [
      escapeCsvCellForExport(c.word),
      escapeCsvCellForExport(c.meaning),
      escapeCsvCellForExport(c.phonetic),
      escapeCsvCellForExport(c.exampleSentence),
      escapeCsvCellForExport(c.collocations),
      escapeCsvCellForExport(c.mnemonic),
      escapeCsvCellForExport(c.imageUrl),
      escapeCsvCellForExport(c.audioUrl),
    ].join(","),
  );

  return `${UTF8_BOM}${headerLine}\n${rows.join("\n")}\n`;
}

/**
 * Generates sample CSV template for users to download
 */
export function generateSampleCsvTemplate(): string {
  const sampleCards: CardResponse[] = [
    {
      id: "sample-1",
      deckId: "sample",
      word: "Resilient",
      meaning: "Kiên cường, có khả năng phục hồi nhanh",
      phonetic: "/rɪˈzɪliənt/",
      exampleSentence: "He showed a resilient attitude after the setback.",
      collocations: "resilient spirit, resilient economy",
      mnemonic:
        "Re (lại) + silent (im lặng) -> dù có chuyện gì vẫn im lặng kiên cường vượt qua",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sample-2",
      deckId: "sample",
      word: "Ephemeral",
      meaning: "Phù du, ngắn ngủi, chóng tàn",
      phonetic: "/ɪˈfemərəl/",
      exampleSentence: "Fame in the internet age can be ephemeral.",
      collocations: "ephemeral pleasure, ephemeral nature",
      mnemonic:
        "E-phe-me-ral giống 'ê phê mê rồi' -> cảm giác phê thường ngắn ngủi phù du",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return generateCardsCsv(sampleCards);
}

/**
 * Triggers a browser file download using Blob and Object URL
 */
export function triggerFileDownload(
  content: string | Blob,
  filename: string,
  mimeType = "text/csv;charset=utf-8;",
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Exports deck cards to selected format and triggers download
 */
export function exportDeckToFile(
  deckTitle: string,
  cards: CardResponse[],
  format: DeckExportFormat = "csv",
  filter: DeckExportFilter = "ALL",
): { totalExported: number; filename: string } {
  const filteredCards = filterCardsForExport(cards, filter);
  const sanitizedTitle =
    deckTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "deck";

  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const csvContent = generateCardsCsv(filteredCards);
    const filename = `${sanitizedTitle}-${timestamp}.csv`;
    triggerFileDownload(csvContent, filename, "text/csv;charset=utf-8;");
    return { totalExported: filteredCards.length, filename };
  }

  // Anki tab-separated text export (compatible with Anki import)
  const ankiContent = filteredCards
    .map((c) =>
      [
        escapeCsvCellForExport(c.word),
        escapeCsvCellForExport(c.meaning),
        escapeCsvCellForExport(c.phonetic),
        escapeCsvCellForExport(c.exampleSentence),
        escapeCsvCellForExport(c.collocations),
        escapeCsvCellForExport(c.mnemonic),
      ].join("\t"),
    )
    .join("\n");

  const filename = `${sanitizedTitle}-${timestamp}.txt`;
  triggerFileDownload(ankiContent, filename, "text/plain;charset=utf-8;");
  return { totalExported: filteredCards.length, filename };
}

/**
 * Generate CSV export with options
 */
export function generateCsvExport(
  cards: CardResponse[],
  options?: { filter?: DeckExportFilter },
): string {
  const filtered = filterCardsForExport(cards, options?.filter || "ALL");
  return generateCardsCsv(filtered);
}

/**
 * Triggers a browser file download from Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  triggerFileDownload(blob, filename);
}

/**
 * Generates and triggers download for wordstreak-sample-template.csv
 */
export function downloadSampleCsv(): void {
  const content = generateSampleCsvTemplate();
  triggerFileDownload(
    content,
    "wordstreak-sample-template.csv",
    "text/csv;charset=utf-8;",
  );
}
