import React, { useEffect, useState } from "react";
import {
  Users,
  Award,
  Filter,
  Flag,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { LibraryAnalyticsSummaryResponse } from "@wordstreak/shared-types";
import { libraryService } from "../services/libraryService";

export const AdminLibraryAnalyticsWidget: React.FC = () => {
  const [data, setData] = useState<LibraryAnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await libraryService.getLibraryAnalytics();
      setData(res);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể tải số liệu phân tích thư viện";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e5e5e5] bg-[#ffffff] p-6 text-center animate-pulse">
        <div className="w-8 h-8 rounded-full bg-[#f5f5f5] mx-auto mb-2" />
        <p className="text-xs text-[#737373]">Đang tổng hợp số liệu thư viện...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center justify-between text-xs text-red-600">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          className="px-3 py-1 rounded-full bg-white border border-red-200 font-medium hover:bg-red-100 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f5f5f5] pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#000000]" />
            <h3 className="font-nunito font-bold text-lg text-[#090909]">
              Hiệu quả & Đo lường Thư viện
            </h3>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Tổng hợp mức độ kích hoạt, tỷ lệ giữ chân (Retention) và chất lượng nội dung các bộ từ Official
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          title="Làm mới số liệu"
          className="self-start sm:self-center p-2 rounded-full border border-[#e5e5e5] hover:bg-[#fafafa] text-[#737373] hover:text-[#000000] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {/* Enrolled Users */}
        <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5">
          <div className="flex items-center gap-1.5 text-[#737373] text-[11px] font-medium mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Người học</span>
          </div>
          <p className="font-mono text-xl font-bold text-[#090909]">
            {data.totalEnrolledUsers}
          </p>
          <span className="text-[10px] text-[#a3a3a3]">Đã thêm deck</span>
        </div>

        {/* Activation Rate */}
        <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5">
          <div className="flex items-center gap-1.5 text-[#737373] text-[11px] font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kích hoạt (Day 0)</span>
          </div>
          <p className="font-mono text-xl font-bold text-[#090909]">
            {data.activationRate}%
          </p>
          <span className="text-[10px] text-[#a3a3a3]">Phiên đầu tiên</span>
        </div>

        {/* First Value Rate */}
        <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5">
          <div className="flex items-center gap-1.5 text-[#737373] text-[11px] font-medium mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Thuộc 10 thẻ</span>
          </div>
          <p className="font-mono text-xl font-bold text-[#090909]">
            {data.firstValueRate}%
          </p>
          <span className="text-[10px] text-[#a3a3a3]">First Value</span>
        </div>

        {/* Triage Known Rate */}
        <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5">
          <div className="flex items-center gap-1.5 text-[#737373] text-[11px] font-medium mb-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Từ đã biết</span>
          </div>
          <p className="font-mono text-xl font-bold text-[#090909]">
            {data.avgTriageKnownRate}%
          </p>
          <span className="text-[10px] text-[#a3a3a3]">Qua sàng lọc</span>
        </div>

        {/* Total Feedbacks */}
        <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5 col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 text-[#737373] text-[11px] font-medium mb-1">
            <Flag className="w-3.5 h-3.5" />
            <span>Báo lỗi thẻ</span>
          </div>
          <p className="font-mono text-xl font-bold text-[#090909]">
            {data.totalFeedbacks}
          </p>
          <span className="text-[10px] text-[#a3a3a3]">Cần kiểm duyệt</span>
        </div>
      </div>

      {/* Breakdown Table */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737373] mb-3">
          Chi tiết theo từng bộ từ ({data.deckStats.length})
        </h4>
        <div className="overflow-x-auto border border-[#e5e5e5] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafa] text-[#737373] font-medium border-b border-[#e5e5e5]">
              <tr>
                <th className="py-2.5 px-3">Bộ từ</th>
                <th className="py-2.5 px-3">Lộ trình</th>
                <th className="py-2.5 px-3 text-right">Người học</th>
                <th className="py-2.5 px-3 text-right">Đạt 10 thẻ</th>
                <th className="py-2.5 px-3 text-right">Từ đã biết</th>
                <th className="py-2.5 px-3 text-right">D1 Ret.</th>
                <th className="py-2.5 px-3 text-right">D7 Ret.</th>
                <th className="py-2.5 px-3 text-right">Báo lỗi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {data.deckStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-[#a3a3a3]">
                    Chưa có dữ liệu học tập nào
                  </td>
                </tr>
              ) : (
                data.deckStats.map((ds) => (
                  <tr key={ds.deckId} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#090909]">
                      {ds.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[10px] font-mono text-[#525252]">
                        {ds.pathCode} {ds.level || ""}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {ds.totalEnrolledUsers}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {ds.firstValueCompletionRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {ds.avgTriageKnownRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#525252]">
                      {ds.day1RetentionRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#525252]">
                      {ds.day7RetentionRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {ds.feedbackCount > 0 ? (
                        <span className="font-mono text-red-600 font-semibold">
                          {ds.feedbackCount}
                        </span>
                      ) : (
                        <span className="font-mono text-[#a3a3a3]">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
