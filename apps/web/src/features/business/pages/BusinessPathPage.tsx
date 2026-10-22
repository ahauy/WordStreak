import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, ChevronRight } from "lucide-react";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { SourceAttributionBadge } from "../../library/components/SourceAttributionBadge";
import { getBslDecksBySector } from "../data/bslDecks";
import type { BusinessDeckSummary } from "../data/bslDecks";

export const BusinessPathPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState<"ALL" | "MANAGEMENT" | "FINANCE" | "MARKETING" | "HR" | "OPERATIONS">("ALL");

  const filteredDecks = useMemo(() => {
    return getBslDecksBySector(selectedSector);
  }, [selectedSector]);

  const totalWords = useMemo(() => {
    return filteredDecks.reduce((sum, d) => sum + d.cardsCount, 0);
  }, [filteredDecks]);

  const handleStartDeck = (deck: BusinessDeckSummary) => {
    navigate(`/library/decks/${deck.slug}`);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#090909]">
      <DashboardNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/library"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#525252] hover:text-[#000000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thư viện</span>
          </Link>

          <SourceAttributionBadge license="CC BY-SA 4.0" authors="Browne, Culligan & Phillips (BSL)" showAuthors />
        </div>

        {/* Page Title Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#000000] text-white rounded-full flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Lộ trình Tiếng Anh Thương mại (BSL 1.700 từ)
            </span>
            <span className="text-xs font-mono text-[#737373] bg-[#fafafa] px-2 py-0.5 rounded border border-[#e5e5e5]">
              BSL 1.2 Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#090909] font-nunito">
            Bản đồ Tiến trình Tiếng Anh Đi làm & Thương mại
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] max-w-3xl leading-relaxed">
            50 chặng từ vựng chuyên ngành kinh doanh bao quát 5 lĩnh vực then chốt trong doanh nghiệp:
            Quản trị Chiến lược, Tài chính Doanh nghiệp, Tiếp thị Tăng trưởng, Nhân sự & Chuỗi Cung ứng.
          </p>
        </div>

        {/* BSL Coverage Bar */}
        <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                Độ phủ Thương mại BSL
              </span>
              <div className="text-xl font-extrabold font-nunito text-[#090909]">
                50 Chặng · 1.700 Từ vựng Kinh doanh
              </div>
            </div>
            <div className="text-xs sm:text-right text-[#525252]">
              <span className="font-semibold text-[#090909]">Đạt 97% độ phủ</span> trong văn bản thương mại và báo cáo tài chính quốc tế
            </div>
          </div>

          <div className="w-full bg-[#e5e5e5] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#000000] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((totalWords / 1700) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] mt-2">
            <span>Hiển thị: {filteredDecks.length}/50 chặng</span>
            <span>{totalWords}/1.700 từ kinh doanh</span>
          </div>
        </div>

        {/* Sector Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          {(
            [
              { id: "ALL", label: "Tất cả 50 Chặng" },
              { id: "MANAGEMENT", label: "Quản trị Doanh nghiệp (10 Chặng)" },
              { id: "FINANCE", label: "Tài chính & Kế toán (10 Chặng)" },
              { id: "MARKETING", label: "Marketing & Bán hàng (10 Chặng)" },
              { id: "HR", label: "Nhân sự & Tuyển dụng (10 Chặng)" },
              { id: "OPERATIONS", label: "Vận hành & Chuỗi cung ứng (10 Chặng)" },
            ] as const
          ).map((sec) => (
            <button
              key={sec.id}
              role="tab"
              aria-selected={selectedSector === sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSector === sec.id
                  ? "bg-[#000000] text-white"
                  : "bg-white text-[#525252] border border-[#e5e5e5] hover:border-[#000000]"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className="group bg-white border border-[#e5e5e5] rounded-xl p-5 hover:border-[#000000] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#737373]">
                    CHẶNG {String(deck.order).padStart(2, "0")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#090909]">
                    {deck.sectorLabel}
                  </span>
                </div>

                <h3 className="font-nunito font-bold text-base text-[#090909] group-hover:text-black mb-1 line-clamp-1">
                  {deck.titleVi}
                </h3>
                <p className="text-xs font-mono text-[#737373] mb-3 line-clamp-1">
                  {deck.title}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f5f5f5] text-xs">
                <span className="font-mono text-[#737373]">
                  {deck.cardsCount} từ · ~{deck.estMinutes}p
                </span>

                <button
                  onClick={() => handleStartDeck(deck)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold bg-[#000000] text-white hover:bg-[#262626] transition-colors"
                >
                  Học chặng <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
