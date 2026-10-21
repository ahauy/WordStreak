import React from "react";
import { Sparkles, Info, BookOpen, Target } from "lucide-react";

export interface ToeicCoverageProgressBarProps {
  coveragePercent: number;
  ngslCoveragePercent: number;
  tslCoveragePercent: number;
  maxEstimatedCoverage?: number;
  totalWords?: number;
  learnedWords?: number;
}

export const ToeicCoverageProgressBar: React.FC<ToeicCoverageProgressBarProps> = ({
  coveragePercent,
  ngslCoveragePercent,
  tslCoveragePercent,
  maxEstimatedCoverage = 98.5,
  totalWords = 1200,
  learnedWords = 0,
}) => {
  // Scale so 98.5% is near full width
  const visualScale = (val: number) => Math.min(100, Math.max(0, (val / maxEstimatedCoverage) * 100));

  const ngslWidth = visualScale(ngslCoveragePercent);
  const tslWidth = visualScale(tslCoveragePercent);

  return (
    <div className="w-full bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#090909] font-['Nunito',sans-serif]">
              Độ phủ từ vựng TOEIC ước tính
            </h3>
            <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
              TSL + NGSL
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Phần trăm từ vựng trong đề thi TOEIC bạn có thể hiểu trực tiếp
          </p>
        </div>

        <div className="flex items-baseline gap-1 self-start sm:self-auto font-['Nunito',sans-serif]">
          <span className="text-3xl font-extrabold text-[#090909] tracking-tight">
            {coveragePercent}%
          </span>
          <span className="text-xs text-neutral-400 font-semibold">
            / {maxEstimatedCoverage}% tối đa
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="relative w-full h-3.5 bg-neutral-100 rounded-full overflow-hidden flex border border-neutral-200/80">
          {/* NGSL Core Segment */}
          <div
            data-testid="ngsl-bar-segment"
            className="h-full bg-neutral-700 transition-all duration-500 ease-out"
            style={{ width: `${ngslWidth}%` }}
            title={`NGSL Nền tảng: ${ngslCoveragePercent}%`}
          />
          {/* TSL Specialized Segment */}
          <div
            data-testid="tsl-bar-segment"
            className="h-full bg-neutral-950 transition-all duration-500 ease-out border-l border-white/20"
            style={{ width: `${tslWidth}%` }}
            title={`TSL Chuyên sâu TOEIC: +${tslCoveragePercent}%`}
          />
        </div>

        {/* Scale labels */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-['JetBrains_Mono',monospace]">
          <span>0%</span>
          <span>Nền tảng NGSL (tối đa 94.0%)</span>
          <span className="font-semibold text-neutral-700">98.5% Mục tiêu</span>
        </div>
      </div>

      {/* Breakdown Pills Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-neutral-500">NGSL Nền tảng</p>
            <p className="text-sm font-bold text-neutral-900 font-['Nunito',sans-serif]">
              {ngslCoveragePercent}%{" "}
              <span className="text-[11px] font-normal text-neutral-400">/ 94.0%</span>
            </p>
          </div>
          <BookOpen className="w-4 h-4 text-neutral-400" />
        </div>

        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-neutral-500">TSL TOEIC</p>
            <p className="text-sm font-bold text-neutral-900 font-['Nunito',sans-serif]">
              +{tslCoveragePercent}%{" "}
              <span className="text-[11px] font-normal text-neutral-400">/ +4.5%</span>
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-neutral-400" />
        </div>

        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-neutral-500">Tiến độ từ TSL</p>
            <p className="text-sm font-bold text-neutral-900 font-['Nunito',sans-serif]">
              {learnedWords}{" "}
              <span className="text-[11px] font-normal text-neutral-400">/ {totalWords} từ</span>
            </p>
          </div>
          <Target className="w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {/* Academic Citation Note */}
      <div className="pt-2 border-t border-neutral-100 flex items-start gap-2 text-[11px] text-neutral-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
        <p>
          Dựa trên nghiên cứu corpus học thuật của Browne, Culligan & Phillips (NGSL Project). Bộ 2.809 từ NGSL
          bao phủ ~92% văn bản tiếng Anh thông dụng; bộ 1.200 từ TSL mở rộng độ phủ lên đến ~98.5% đề thi TOEIC.
        </p>
      </div>
    </div>
  );
};
