import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Award,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { SourceAttributionBadge } from "../components/SourceAttributionBadge";

export const DataSourcesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#090909]">
      <DashboardNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/library"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525252] hover:text-[#000000] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Thư viện</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
              <Scale className="w-3.5 h-3.5 text-black" />
              Chính sách bản quyền & Pháp lý
            </span>
            <SourceAttributionBadge showAuthors={false} showLink={false} />
          </div>

          <h1 className="font-nunito font-extrabold text-3xl sm:text-4xl text-[#090909] tracking-tight">
            Nguồn dữ liệu & Bản quyền
          </h1>
          <p className="text-[#525252] text-sm sm:text-base mt-3 leading-relaxed">
            WordStreak cam kết tính minh bạch học thuật tuyệt đối và tuân thủ đầy đủ các tiêu chuẩn
            bản quyền mở quốc tế. Toàn bộ danh mục từ vựng chính thức được xây dựng dựa trên các nghiên
            cứu ngôn ngữ học corpus uy tín toàn cầu.
          </p>
        </div>

        {/* Section 1: Corpus Research & Authors */}
        <section className="mb-12">
          <h2 className="font-nunito font-bold text-xl sm:text-2xl text-[#090909] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-black" />
            Nghiên cứu Corpus chuẩn hóa (NGSL & TSL)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: NGSL */}
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#ffffff] p-6 flex flex-col justify-between hover:border-[#d4d4d4] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#fafafa] border border-[#e5e5e5] text-[#090909]">
                    NGSL 1.2
                  </span>
                  <span className="text-xs font-mono text-[#737373]">2.809 từ cốt lõi</span>
                </div>
                <h3 className="font-nunito font-bold text-lg text-[#090909]">
                  New General Service List
                </h3>
                <p className="text-xs text-[#525252] mt-2 leading-relaxed">
                  Danh mục 2.809 từ vựng tần suất cao nhất của tiếng Anh hiện đại, được trích xuất từ
                  tập hợp ngôn liệu Cambridge English Corpus 273 triệu từ. Đảm bảo độ bao phủ ~92%
                  mọi văn bản tiếng Anh thông dụng.
                </p>
                <div className="mt-4 pt-3 border-t border-[#f5f5f5] text-xs text-[#737373]">
                  <p className="font-medium text-[#090909]">Tác giả nghiên cứu:</p>
                  <p>Dr. Charles Browne, Dr. Brent Culligan & Joseph Phillips (2013-nay)</p>
                </div>
              </div>

              <div className="mt-6 pt-3">
                <a
                  href="https://www.newgeneralservicelist.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:underline"
                >
                  <span>Truy cập newgeneralservicelist.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: TSL */}
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#ffffff] p-6 flex flex-col justify-between hover:border-[#d4d4d4] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#fafafa] border border-[#e5e5e5] text-[#090909]">
                    TSL 1.2
                  </span>
                  <span className="text-xs font-mono text-[#737373]">~1.200 từ TOEIC</span>
                </div>
                <h3 className="font-nunito font-bold text-lg text-[#090909]">
                  TOEIC Service List
                </h3>
                <p className="text-xs text-[#525252] mt-2 leading-relaxed">
                  Danh mục 1.200 từ vựng chuyên biệt cho môi trường công sở quốc tế và bài thi TOEIC.
                  Khi học kết hợp cùng NGSL, danh mục đem lại độ bao phủ ấn tượng xấp xỉ ~98.5% từ vựng
                  trong các đề thi TOEIC chuẩn hóa.
                </p>
                <div className="mt-4 pt-3 border-t border-[#f5f5f5] text-xs text-[#737373]">
                  <p className="font-medium text-[#090909]">Tác giả nghiên cứu:</p>
                  <p>Dr. Charles Browne, Dr. Brent Culligan & Joseph Phillips</p>
                </div>
              </div>

              <div className="mt-6 pt-3">
                <a
                  href="https://www.newgeneralservicelist.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:underline"
                >
                  <span>Tìm hiểu thêm về TSL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Creative Commons License */}
        <section className="mb-12 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white rounded-xl border border-[#e5e5e5] text-black shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-nunito font-bold text-lg sm:text-xl text-[#090909]">
                Giấy phép Creative Commons (CC BY-SA 4.0)
              </h2>
              <p className="text-xs sm:text-sm text-[#525252] mt-2 leading-relaxed">
                Dữ liệu danh mục gốc từ NGSL Project được phát hành theo giấy phép quốc tế{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-black underline"
                >
                  Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
                </a>
                .
              </p>

              <div className="mt-4 space-y-2 text-xs text-[#525252]">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#090909] min-w-[120px]">Attribution (BY):</span>
                  <span>
                    Ghi công xứng đáng cho nhóm tác giả Dr. Charles Browne, Dr. Brent Culligan, và
                    Joseph Phillips.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#090909] min-w-[120px]">ShareAlike (SA):</span>
                  <span>
                    Mọi tác phẩm phái sinh hoặc mở rộng dữ liệu đều phải tiếp tục chia sẻ dưới giấy
                    phép tương tự.
                  </span>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-white border border-[#e5e5e5] text-xs text-[#525252]">
                <p className="font-semibold text-[#090909] mb-1">Cam kết của WordStreak:</p>
                <p>
                  WordStreak giữ nguyên tinh thần 100% miễn phí, phi lợi nhuận cho người học. Bạn luôn
                  có toàn quyền xuất dữ liệu thẻ sang định dạng mở Anki (.apkg), CSV hoặc JSON mà
                  không bị khóa dữ liệu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Legal Trademark Disclaimers */}
        <section className="mb-12">
          <h2 className="font-nunito font-bold text-xl sm:text-2xl text-[#090909] mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-black" />
            Tuyên bố miễn trừ trách nhiệm pháp lý (Trademarks)
          </h2>

          <div className="rounded-2xl border border-[#e5e5e5] bg-[#ffffff] p-6 space-y-4 text-xs sm:text-sm text-[#525252] leading-relaxed">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#090909]">TOEIC®:</strong> TOEIC® là nhãn hiệu đã đăng ký
                của Viện Khảo thí Giáo dục Hoa Kỳ (Educational Testing Service - ETS) tại Hoa Kỳ và
                nhiều quốc gia trên thế giới. WordStreak là một ứng dụng và nền tảng học tập nghiên cứu
                độc lập; hoàn toàn không có bất kỳ mối liên hệ, tài trợ, hợp tác chính thức hay được
                chứng thực bởi ETS.
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-[#f5f5f5]">
              <Info className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#090909]">IELTS®:</strong> IELTS® là nhãn hiệu đã đăng ký
                của University of Cambridge ESOL, the British Council (Hội đồng Anh) và IDP Education
                Australia. WordStreak không liên kết, không được tài trợ hay chứng thực bởi các tổ chức
                này.
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-[#f5f5f5]">
              <Sparkles className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#090909]">Mục đích sử dụng:</strong> Mọi lộ trình học tập,
                ước tính độ phủ phần trăm từ vựng (% Coverage) và câu ví dụ công sở trên WordStreak đều
                phục vụ mục đích giáo dục cá nhân phi thương mại.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
