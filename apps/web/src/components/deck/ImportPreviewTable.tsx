import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
} from "lucide-react";
import type {
  StandardCardField,
  ConflictStrategy,
} from "@wordstreak/shared-types";
import type {
  ColumnMapping,
  ValidatedRow,
} from "../../utils/parsers/columnMapper";

interface ImportPreviewTableProps {
  headers: string[];
  mapping: ColumnMapping;
  onMappingChange: (
    columnIndex: number,
    field: StandardCardField | "ignore",
  ) => void;
  validatedRows: ValidatedRow[];
  onCellEdit: (rowIndex: number, colIndex: number, newValue: string) => void;
  onToggleRowIncluded: (rowIndex: number) => void;
  onRowConflictActionChange?: (
    rowIndex: number,
    action: ConflictStrategy,
  ) => void;
}

const FIELD_OPTIONS: Array<{
  value: StandardCardField | "ignore";
  label: string;
}> = [
  { value: "word", label: "Từ vựng (Word) *" },
  { value: "meaning", label: "Nghĩa (Meaning) *" },
  { value: "phonetic", label: "Phiên âm (IPA)" },
  { value: "exampleSentence", label: "Câu ví dụ (Example)" },
  { value: "collocations", label: "Cụm từ (Collocations)" },
  { value: "mnemonic", label: "Mẹo nhớ (Mnemonic)" },
  { value: "imageUrl", label: "Hình ảnh (Image URL)" },
  { value: "audioUrl", label: "Âm thanh (Audio URL)" },
  { value: "ignore", label: "— (Bỏ qua cột này) —" },
];

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  headers,
  mapping,
  onMappingChange,
  validatedRows,
  onCellEdit,
  onToggleRowIncluded,
  onRowConflictActionChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(validatedRows.length / pageSize));

  // In-line editing state: { rowIndex, colIndex, value }
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colIndex: number;
    value: string;
  } | null>(null);

  const startIdx = (currentPage - 1) * pageSize;
  const currentRows = validatedRows.slice(startIdx, startIdx + pageSize);

  const handleSaveCell = () => {
    if (editingCell) {
      onCellEdit(editingCell.rowIndex, editingCell.colIndex, editingCell.value);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveCell();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Table Container with Hairline Border */}
      <div className="overflow-x-auto rounded-xl border border-[#e5e5e5] bg-white">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header Row with Column Selectors */}
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="py-3 px-3 w-12 text-center text-[#737373] font-mono font-medium">
                #
              </th>
              <th className="py-3 px-3 w-28 text-[#737373] font-medium">
                Trạng thái
              </th>
              {headers.map((header, colIndex) => {
                const currentField = mapping[colIndex] || "ignore";
                const isRequired =
                  currentField === "word" || currentField === "meaning";

                return (
                  <th
                    key={colIndex}
                    className="py-2.5 px-3 min-w-[160px] max-w-[240px] text-black font-semibold"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[11px] text-[#737373] truncate">
                        {header || `Cột ${colIndex + 1}`}
                      </span>
                      <select
                        aria-label={`Khớp cột ${header || colIndex + 1}`}
                        value={currentField}
                        onChange={(e) =>
                          onMappingChange(
                            colIndex,
                            e.target.value as StandardCardField | "ignore",
                          )
                        }
                        className={`h-8 px-2 rounded-lg border text-xs font-medium focus:outline-none transition-all cursor-pointer ${
                          isRequired
                            ? "border-[#000000] bg-white text-black font-bold"
                            : currentField !== "ignore"
                              ? "border-[#a3a3a3] bg-white text-black"
                              : "border-[#e5e5e5] bg-[#fafafa] text-[#737373]"
                        }`}
                      >
                        {FIELD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#e5e5e5]">
            {currentRows.map((row) => {
              const actualRowIndex = row.index;

              return (
                <tr
                  key={actualRowIndex}
                  className={`hover:bg-[#fafafa] transition-colors ${
                    !row.isIncluded ? "opacity-50 bg-[#fafafa]" : ""
                  }`}
                >
                  {/* Row Checkbox & Index */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={row.isIncluded}
                        onChange={() => onToggleRowIncluded(actualRowIndex)}
                        aria-label={`Chọn dòng ${actualRowIndex + 1}`}
                        className="w-3.5 h-3.5 rounded border-[#d4d4d4] text-black focus:ring-black cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-[#a3a3a3]">
                        {actualRowIndex + 1}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {row.status === "VALID" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Hợp lệ</span>
                      </span>
                    ) : row.status === "DUPLICATE" ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Trùng lặp</span>
                        </span>
                        {onRowConflictActionChange && (
                          <select
                            aria-label={`Hành động trùng lặp dòng ${actualRowIndex + 1}`}
                            value={row.conflictAction || "SKIP"}
                            onChange={(e) =>
                              onRowConflictActionChange(
                                actualRowIndex,
                                e.target.value as ConflictStrategy,
                              )
                            }
                            className="h-5 text-[10px] px-1 rounded border border-[#e5e5e5] bg-white text-black font-medium"
                          >
                            <option value="SKIP">Bỏ qua</option>
                            <option value="OVERWRITE">Ghi đè</option>
                            <option value="KEEP_BOTH">Thêm mới</option>
                          </select>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                          <XCircle className="w-3 h-3" />
                          <span>Lỗi</span>
                        </span>
                        <span className="text-[10px] text-[#dc2626] leading-tight">
                          {row.errors.join(", ")}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Cell Data Columns with In-line Edit */}
                  {headers.map((_, colIndex) => {
                    const cellVal = row.rawValues[colIndex] || "";
                    const isEditing =
                      editingCell?.rowIndex === actualRowIndex &&
                      editingCell?.colIndex === colIndex;

                    return (
                      <td
                        key={colIndex}
                        className="py-2.5 px-3 max-w-[240px] truncate group relative"
                        title={cellVal}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingCell.value}
                              autoFocus
                              onChange={(e) =>
                                setEditingCell({
                                  ...editingCell,
                                  value: e.target.value,
                                })
                              }
                              onBlur={handleSaveCell}
                              onKeyDown={handleKeyDown}
                              className="w-full h-7 px-2 text-xs border border-black rounded bg-white text-black focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSaveCell}
                              className="p-1 rounded bg-black text-white hover:bg-[#333333]"
                              aria-label="Lưu thay đổi"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              setEditingCell({
                                rowIndex: actualRowIndex,
                                colIndex,
                                value: cellVal,
                              })
                            }
                            className="flex items-center justify-between gap-1 cursor-pointer hover:bg-[#f5f5f5] p-1 rounded transition-colors"
                          >
                            <span
                              className={`truncate ${
                                !cellVal
                                  ? "text-[#a3a3a3] italic"
                                  : "text-black"
                              }`}
                            >
                              {cellVal || "(trống)"}
                            </span>
                            <Edit2 className="w-2.5 h-2.5 text-[#a3a3a3] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-1 text-xs text-[#737373]">
        <span>
          Xem dòng <strong>{startIdx + 1}</strong>–
          <strong>{Math.min(startIdx + pageSize, validatedRows.length)}</strong>{" "}
          trong tổng số <strong>{validatedRows.length}</strong> dòng
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            aria-label="Trang trước"
            className="p-1.5 rounded-lg border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono px-2 font-medium text-black">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Trang sau"
            className="p-1.5 rounded-lg border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
