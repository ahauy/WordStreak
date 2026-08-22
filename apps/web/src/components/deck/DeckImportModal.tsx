import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { ImportPreviewTable } from "./ImportPreviewTable";
import { parseCsvFile } from "../../utils/parsers/csvParser";
import { parseAnkiPackage } from "../../utils/parsers/ankiParser";
import {
  autoMapColumns,
  validateAllRows,
  buildCardBatch,
  type ColumnMapping,
  type ValidatedRow,
} from "../../utils/parsers/columnMapper";
import {
  generateSampleCsvTemplate,
  triggerFileDownload,
} from "../../utils/parsers/exportGenerator";
import { cardsService } from "../../features/cards/services/cardsService";
import type {
  DeckResponse,
  StandardCardField,
  ConflictStrategy,
  CardResponse,
  ImportBatchResult,
} from "@wordstreak/shared-types";

export interface DeckImportModalProps {
  isOpen: boolean;
  deckId?: string;
  deckTitle?: string;
  targetDeck?: DeckResponse;
  allDecks?: DeckResponse[];
  onClose: () => void;
  onSuccess?: () => void;
  onImportSuccess?: (result: ImportBatchResult) => void;
  onStartReview?: (deckId: string) => void;
}

type ImportStep = 1 | 2 | 3 | 4;

export const DeckImportModal: React.FC<DeckImportModalProps> = ({
  isOpen,
  deckId: propDeckId,
  deckTitle: propDeckTitle,
  targetDeck,
  onClose,
  onSuccess,
  onImportSuccess,
  onStartReview,
}) => {
  const activeDeckId = propDeckId || targetDeck?.id || "";
  const activeDeckTitle = propDeckTitle || targetDeck?.title || "Bộ từ vựng";

  const [step, setStep] = useState<ImportStep>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // File data
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [existingCards, setExistingCards] = useState<CardResponse[]>([]);

  // Conflict Resolution strategy
  const [conflictStrategy, setConflictStrategy] =
    useState<ConflictStrategy>("SKIP");

  // Submission / Results state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<ImportBatchResult | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setStep(1);
    setIsDragging(false);
    setIsParsing(false);
    setParseError(null);
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setConflictStrategy("SKIP");
    setIsSubmitting(false);
    setImportResult(null);
    onClose();
  }, [isSubmitting, onClose]);

  // Fetch existing cards for duplicate detection on modal open
  useEffect(() => {
    if (!isOpen || !activeDeckId) return;
    let ignore = false;
    cardsService
      .getAllDeckCards(activeDeckId)
      .then((cards) => {
        if (!ignore) setExistingCards(cards);
      })
      .catch(() => {
        if (!ignore) setExistingCards([]);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, activeDeckId]);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, handleClose]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
      setFileName(file.name);
      const isAnki =
        file.name.endsWith(".apkg") || file.name.endsWith(".colpkg");
      let parsedHeaders: string[] = [];
      let parsedRows: string[][] = [];

      if (isAnki) {
        const ankiResult = await parseAnkiPackage(file);
        if (ankiResult.errors.length > 0 && ankiResult.rows.length === 0) {
          throw new Error(ankiResult.errors.join(", "));
        }
        parsedHeaders = ankiResult.headers;
        parsedRows = ankiResult.rows;
      } else {
        const csvResult = await parseCsvFile(file);
        if (csvResult.rows.length === 0) {
          throw new Error(
            csvResult.errors.length > 0
              ? csvResult.errors.join(", ")
              : "Tập tin không chứa dữ liệu từ vựng hợp lệ",
          );
        }
        parsedHeaders = csvResult.headers;
        parsedRows = csvResult.rows;
      }

      setHeaders(parsedHeaders);
      setRows(parsedRows);
      const detectedMapping = autoMapColumns(parsedHeaders);
      setMapping(detectedMapping);
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi xử lý tập tin";
      setParseError(msg);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCsvTemplate();
    triggerFileDownload(sample, "wordstreak-sample-template.csv");
  };

  const validatedRows: ValidatedRow[] = validateAllRows(
    rows,
    mapping,
    existingCards,
    conflictStrategy,
  );

  const totalRowsCount = validatedRows.length;
  const validRowsCount = validatedRows.filter(
    (r) => r.status === "VALID",
  ).length;
  const duplicateRowsCount = validatedRows.filter(
    (r) => r.status === "DUPLICATE",
  ).length;
  const invalidRowsCount = validatedRows.filter(
    (r) => r.status === "INVALID",
  ).length;

  const hasMappedWord = Object.values(mapping).includes("word");
  const hasMappedMeaning = Object.values(mapping).includes("meaning");
  const canProceedToStep3 = hasMappedWord && hasMappedMeaning;

  const handleCellEdit = (
    rowIndex: number,
    colIndex: number,
    newValue: string,
  ) => {
    setRows((prev) => {
      const updated = [...prev];
      if (updated[rowIndex]) {
        const newRow = [...updated[rowIndex]];
        newRow[colIndex] = newValue;
        updated[rowIndex] = newRow;
      }
      return updated;
    });
  };

  const handleMappingChange = (
    colIndex: number,
    field: StandardCardField | "ignore",
  ) => {
    setMapping((prev) => ({
      ...prev,
      [colIndex]: field,
    }));
  };

  const handleSubmitImport = async () => {
    try {
      setIsSubmitting(true);
      setStep(4);

      const batchCards = buildCardBatch(validatedRows, conflictStrategy);
      const res = await cardsService.bulkImport(activeDeckId, {
        cards: batchCards,
        defaultStrategy: conflictStrategy,
      });

      setImportResult(res);
      if (onImportSuccess) {
        onImportSuccess(res);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi nhập dữ liệu";
      setImportResult({
        totalSubmitted: validatedRows.length,
        imported: 0,
        overwritten: 0,
        skipped: 0,
        errors: [msg],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#e5e5e5] w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              <h2
                id="modal-title"
                className="text-base sm:text-lg font-bold text-black"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Nhập từ vựng vào bộ từ
              </h2>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Bộ từ: <strong className="text-black">{activeDeckTitle}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-full hover:bg-[#f5f5f5] text-[#737373] hover:text-black transition-colors cursor-pointer disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Wizard Progress Bar */}
        <div className="px-6 py-3 bg-[#fafafa] border-b border-[#e5e5e5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: "Tải tập tin" },
              { num: 2, label: "Khớp cột & Xem trước" },
              { num: 3, label: "Xử lý trùng lặp" },
              { num: 4, label: "Kết quả" },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                      step === s.num
                        ? "bg-black text-white"
                        : step > s.num
                          ? "bg-[#059669] text-white"
                          : "bg-[#e5e5e5] text-[#737373]"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </span>
                  <span
                    className={`hidden sm:inline font-medium ${
                      step === s.num
                        ? "text-black font-semibold"
                        : "text-[#737373]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <span className="text-[#d4d4d4] font-mono mx-1">›</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {fileName && step > 1 && (
            <div className="flex items-center gap-1.5 text-[#525252] bg-white px-2.5 py-1 rounded-full border border-[#e5e5e5]">
              <FileSpreadsheet className="w-3.5 h-3.5 text-black" />
              <span className="font-mono text-[11px] truncate max-w-[150px]">
                {fileName}
              </span>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? "border-black bg-[#f5f5f5]"
                    : "border-[#d4d4d4] hover:border-black bg-[#fafafa] hover:bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt,.apkg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessFile(file);
                  }}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center shadow-xs mb-4">
                  {isParsing ? (
                    <RotateCw className="w-6 h-6 text-black animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-black" />
                  )}
                </div>

                <h3
                  className="text-base font-bold text-black mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {isParsing
                    ? "Đang phân tích tập tin..."
                    : "Kéo thả tập tin vào đây hoặc bấm để chọn"}
                </h3>
                <p className="text-xs text-[#737373] max-w-sm mb-4">
                  Hỗ trợ các định dạng bảng tính CSV, TSV, XLSX hoặc bộ thẻ Anki
                  (.apkg). Tự động nhận diện dấu phân cách và mã hóa UTF-8.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-white border border-[#e5e5e5] text-[#525252]">
                    .CSV
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-white border border-[#e5e5e5] text-[#525252]">
                    .XLSX
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-white border border-[#e5e5e5] text-[#525252]">
                    Anki .apkg
                  </span>
                </div>
              </div>

              {parseError && (
                <div className="p-3.5 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Không thể đọc tập tin</p>
                    <p className="text-[11px] mt-0.5">{parseError}</p>
                  </div>
                </div>
              )}

              {/* Sample Template Download Card */}
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#737373]" />
                  <div>
                    <h4 className="text-xs font-bold text-black">
                      Bạn chưa có mẫu file chuẩn?
                    </h4>
                    <p className="text-[11px] text-[#737373]">
                      Tải mẫu CSV chuẩn của WordStreak với đầy đủ các cột ví dụ,
                      phiên âm và mẹo nhớ.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="h-8 px-3 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-xs font-semibold text-black inline-flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu CSV chuẩn</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MAPPING & PREVIEW */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Validation Chips Summary */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#fafafa] rounded-xl border border-[#e5e5e5]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-black">
                    Tổng: {totalRowsCount} dòng
                  </span>
                  <span className="text-[#d4d4d4]">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                    {validRowsCount} hợp lệ
                  </span>
                  {duplicateRowsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">
                      {duplicateRowsCount} trùng lặp
                    </span>
                  )}
                  {invalidRowsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                      {invalidRowsCount} thiếu trường
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-[#737373]">
                  Nhấp vào ô để sửa dữ liệu trực tiếp
                </span>
              </div>

              {!canProceedToStep3 && (
                <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-[#b45309] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Vui lòng chọn ít nhất 2 cột bắt buộc:{" "}
                    <strong>Từ vựng (Word)</strong> và{" "}
                    <strong>Nghĩa (Meaning)</strong> ở phần đầu bảng.
                  </span>
                </div>
              )}

              {/* Preview Table */}
              <ImportPreviewTable
                headers={headers}
                mapping={mapping}
                onMappingChange={handleMappingChange}
                validatedRows={validatedRows}
                onCellEdit={handleCellEdit}
                onToggleRowIncluded={() => {}}
              />
            </div>
          )}

          {/* STEP 3: CONFLICT RESOLUTION */}
          {step === 3 && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center">
                <h3
                  className="text-base font-bold text-black mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Xử lý từ vựng trùng lặp
                </h3>
                <p className="text-xs text-[#737373]">
                  Phát hiện{" "}
                  <strong className="text-black">{duplicateRowsCount}</strong>{" "}
                  từ đã tồn tại trong bộ từ này hoặc lặp lại trong file. Hãy
                  chọn hành vi bạn mong muốn:
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "SKIP" as ConflictStrategy,
                    title: "Bỏ qua từ trùng (Khuyên dùng)",
                    desc: "Giữ nguyên thẻ từ đã có trong bộ từ, không thay đổi tiến độ và nội dung hiện tại.",
                  },
                  {
                    id: "OVERWRITE" as ConflictStrategy,
                    title: "Ghi đè nội dung",
                    desc: "Cập nhật nghĩa, ví dụ, phiên âm mới vào thẻ cũ nhưng vẫn giữ nguyên tiến độ ôn tập.",
                  },
                  {
                    id: "KEEP_BOTH" as ConflictStrategy,
                    title: "Thêm mới và giữ cả hai",
                    desc: "Tạo thêm một thẻ từ vựng mới độc lập cùng tên.",
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                      conflictStrategy === opt.id
                        ? "border-black bg-white shadow-xs"
                        : "border-[#e5e5e5] bg-[#fafafa] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="conflict-strategy"
                        value={opt.id}
                        checked={conflictStrategy === opt.id}
                        onChange={() => setConflictStrategy(opt.id)}
                        className="mt-1 w-4 h-4 text-black border-[#d4d4d4] focus:ring-black"
                      />
                      <div>
                        <p className="text-xs font-bold text-black">
                          {opt.title}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: PROGRESS & RESULTS */}
          {step === 4 && (
            <div className="py-6 text-center max-w-md mx-auto space-y-6">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="w-12 h-12 rounded-full border-3 border-black border-t-transparent animate-spin" />
                  <h3
                    className="text-base font-bold text-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Đang lưu từ vựng vào bộ từ...
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Vui lòng không đóng trình duyệt trong quá trình này.
                  </p>
                </div>
              ) : importResult ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h3
                      className="text-lg font-bold text-black mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Nhập từ vựng hoàn tất!
                    </h3>
                    <p className="text-xs text-[#737373]">
                      Dữ liệu đã được đồng bộ hóa thành công vào bộ từ của bạn.
                    </p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] block mb-0.5">
                        Thêm mới
                      </span>
                      <span className="text-xl font-bold font-mono text-black">
                        {importResult.imported}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb] block mb-0.5">
                        Ghi đè
                      </span>
                      <span className="text-xl font-bold font-mono text-black">
                        {importResult.overwritten}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-0.5">
                        Bỏ qua
                      </span>
                      <span className="text-xl font-bold font-mono text-black">
                        {importResult.skipped}
                      </span>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs text-left">
                      <p className="font-semibold mb-1">
                        Một số cảnh báo trong quá trình nhập:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {importResult.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#fafafa] border-t border-[#e5e5e5] flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as ImportStep)}
              className="h-9 px-4 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-xs font-semibold text-black inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                disabled={!canProceedToStep3}
                onClick={() => setStep(3)}
                className="h-9 px-5 rounded-full bg-black text-white hover:bg-[#171717] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleSubmitImport}
                className="h-9 px-5 rounded-full bg-black text-white hover:bg-[#171717] text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ffbd2e]" />
                <span>Bắt đầu nhập từ</span>
              </button>
            )}

            {step === 4 && !isSubmitting && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onSuccess) onSuccess();
                    handleClose();
                  }}
                  className="h-9 px-5 rounded-full bg-black text-white hover:bg-[#171717] text-xs font-semibold transition-all cursor-pointer"
                >
                  Xem danh sách từ
                </button>
                {onStartReview && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onStartReview(activeDeckId);
                    }}
                    className="h-9 px-5 rounded-full bg-[#f3e8ff] text-[#7e22ce] hover:bg-[#e9d5ff] border border-[#d8b4fe] text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#9333ea]" />
                    <span>Ôn tập ngay</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
