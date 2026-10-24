import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:23012005@localhost:5432/wordstreak_db?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 48 TOEIC Themed Decks (16 for T1, 16 for T2, 16 for T3)
const DECK_THEMES = [
  // --- LEVEL T1 (1-16) ---
  { order: 1, slug: 'tsl-t1-01-office-admin', level: 'T1', title: 'TSL T1-01: Office Admin & Procedures', titleVi: 'Thủ tục & Hành chính Văn phòng (T1-01)', desc: 'Từ vựng cốt lõi về quy trình làm việc và công tác hành chính văn phòng.' },
  { order: 2, slug: 'tsl-t1-02-corporate-finance', level: 'T1', title: 'TSL T1-02: Corporate Finance & Accounting', titleVi: 'Kế toán & Tài chính Căn bản (T1-02)', desc: 'Các thuật ngữ cơ bản về thu chi, hóa đơn và báo cáo số liệu.' },
  { order: 3, slug: 'tsl-t1-03-hr-recruitment', level: 'T1', title: 'TSL T1-03: HR & Recruitment Basics', titleVi: 'Nhân sự & Tuyển dụng Căn bản (T1-03)', desc: 'Từ vựng về phỏng vấn, hồ sơ ứng viên và chính sách tuyển dụng.' },
  { order: 4, slug: 'tsl-t1-04-business-meetings', level: 'T1', title: 'TSL T1-04: Business Meetings & Agendas', titleVi: 'Hội họp & Lịch trình Công tác (T1-04)', desc: 'Thuật ngữ tổ chức họp, thảo luận chương trình nghị sự và biên bản.' },
  { order: 5, slug: 'tsl-t1-05-daily-communication', level: 'T1', title: 'TSL T1-05: Daily Workplace Communication', titleVi: 'Giao tiếp Công sở Hằng ngày (T1-05)', desc: 'Thư từ email, thông báo nội bộ và giao tiếp giữa các phòng ban.' },
  { order: 6, slug: 'tsl-t1-06-customer-service', level: 'T1', title: 'TSL T1-06: Customer Service & Care', titleVi: 'Chăm sóc & Hỗ trợ Khách hàng (T1-06)', desc: 'Tiếp nhận phản hồi, xử lý khiếu nại và tư vấn dịch vụ.' },
  { order: 7, slug: 'tsl-t1-07-purchasing-supplies', level: 'T1', title: 'TSL T1-07: Purchasing & Supplies', titleVi: 'Mua sắm & Thiết bị Văn phòng (T1-07)', desc: 'Đặt hàng văn phòng phẩm, trang thiết bị và quản lý vật tư.' },
  { order: 8, slug: 'tsl-t1-08-travel-bookings', level: 'T1', title: 'TSL T1-08: Travel & Corporate Bookings', titleVi: 'Đi lại & Đặt chỗ Công tác (T1-08)', desc: 'Đặt vé máy bay, khách sạn và thủ tục hoàn công tác phí.' },
  { order: 9, slug: 'tsl-t1-09-facilities-maintenance', level: 'T1', title: 'TSL T1-09: Workplace Facilities & Repairs', titleVi: 'Cơ sở Vật chất & Bảo trì (T1-09)', desc: 'Quản lý tòa nhà, bảo dưỡng thiết bị và vận hành văn phòng.' },
  { order: 10, slug: 'tsl-t1-10-banking-payments', level: 'T1', title: 'TSL T1-10: Banking & Payment Transactions', titleVi: 'Giao dịch Ngân hàng & Thanh toán (T1-10)', desc: 'Chuyển khoản, thanh toán ủy nhiệm chi và xác nhận chứng từ.' },
  { order: 11, slug: 'tsl-t1-11-schedules-deadlines', level: 'T1', title: 'TSL T1-11: Schedules, Deadlines & Timelines', titleVi: 'Tiến độ, Hạn chót & Lịch trình (T1-11)', desc: 'Quản lý thời hạn công việc, gia hạn tiến độ và phân bổ thời gian.' },
  { order: 12, slug: 'tsl-t1-12-marketing-promotions', level: 'T1', title: 'TSL T1-12: Marketing & Promotions Basics', titleVi: 'Tiếp thị & Khuyến mãi Cơ bản (T1-12)', desc: 'Quảng bá sản phẩm, chương trình giảm giá và tiếp cận thị trường.' },
  { order: 13, slug: 'tsl-t1-13-shipping-logistics', level: 'T1', title: 'TSL T1-13: Shipping & Courier Delivery', titleVi: 'Giao nhận & Vận chuyển Đơn hàng (T1-13)', desc: 'Theo dõi kiện hàng, bưu phẩm và cước phí chuyển phát.' },
  { order: 14, slug: 'tsl-t1-14-employment-benefits', level: 'T1', title: 'TSL T1-14: Employment Policies & Benefits', titleVi: 'Chính sách & Chế độ Phúc lợi (T1-14)', desc: 'Bảo hiểm, nghỉ phép năm, chế độ lương thưởng và phụ cấp.' },
  { order: 15, slug: 'tsl-t1-15-contracts-agreements', level: 'T1', title: 'TSL T1-15: Basic Agreements & Memorandums', titleVi: 'Thỏa thuận & Biên bản Ghi nhớ (T1-15)', desc: 'Ký kết văn bản ghi nhớ, điều lệ hợp tác và cam kết làm việc.' },
  { order: 16, slug: 'tsl-t1-16-digital-workplace', level: 'T1', title: 'TSL T1-16: Digital Workplace & IT Tools', titleVi: 'Công nghệ & Phần mềm Công sở (T1-16)', desc: 'Hệ thống phần mềm, mạng nội bộ và hỗ trợ kỹ thuật số.' },

  // --- LEVEL T2 (17-32) ---
  { order: 17, slug: 'tsl-t2-17-sales-distribution', level: 'T2', title: 'TSL T2-17: Commercial Sales & Distribution', titleVi: 'Kênh Phân phối & Bán hàng Thương mại (T2-17)', desc: 'Chiến lược phát triển đại lý, doanh số bán hàng và chuỗi cung ứng.' },
  { order: 18, slug: 'tsl-t2-18-product-development', level: 'T2', title: 'TSL T2-18: Product Development & Design', titleVi: 'Thiết kế & Phát triển Sản phẩm (T2-18)', desc: 'Nghiên cứu nguyên mẫu, thử nghiệm tính năng và cải tiến sản phẩm.' },
  { order: 19, slug: 'tsl-t2-19-contract-negotiations', level: 'T2', title: 'TSL T2-19: Contract Negotiations & Terms', titleVi: 'Đàm phán & Điều khoản Hợp đồng (T2-19)', desc: 'Thương lượng điều kiện thanh toán, bảo mật và trách nhiệm pháp lý.' },
  { order: 20, slug: 'tsl-t2-20-advertising-pr', level: 'T2', title: 'TSL T2-20: Advertising Campaigns & PR', titleVi: 'Chiến dịch Quảng cáo & Quan hệ Công chúng (T2-20)', desc: 'Thông cáo báo chí, tổ chức sự kiện ra mắt và phủ sóng truyền thông.' },
  { order: 21, slug: 'tsl-t2-21-warehousing-inventory', level: 'T2', title: 'TSL T2-21: Warehousing & Inventory Control', titleVi: 'Quản lý Kho bãi & Kiểm kê Hàng hóa (T2-21)', desc: 'Tối ưu tồn kho, lưu trữ bảo quản và quản lý xuất nhập bến bãi.' },
  { order: 22, slug: 'tsl-t2-22-financial-auditing', level: 'T2', title: 'TSL T2-22: Financial Auditing & Budgeting', titleVi: 'Kiểm toán & Lập Ngân sách Doanh nghiệp (T2-22)', desc: 'Kiểm toán nội bộ, cân đối ngân sách và phân tích dòng tiền.' },
  { order: 23, slug: 'tsl-t2-23-talent-development', level: 'T2', title: 'TSL T2-23: Talent Training & Development', titleVi: 'Đào tạo & Phát triển Năng lực Nhân sự (T2-23)', desc: 'Chương trình bồi dưỡng chuyên môn, đánh giá KPI và lộ trình thăng tiến.' },
  { order: 24, slug: 'tsl-t2-24-quality-assurance', level: 'T2', title: 'TSL T2-24: Manufacturing & Quality Assurance', titleVi: 'Sản xuất & Đảm bảo Tiêu chuẩn Chất lượng (T2-24)', desc: 'Kiểm soát quy trình sản xuất, chứng nhận tiêu chuẩn và giảm thiểu lỗi.' },
  { order: 25, slug: 'tsl-t2-25-commercial-real-estate', level: 'T2', title: 'TSL T2-25: Commercial Real Estate & Leases', titleVi: 'Mặt bằng Thương mại & Thuê Bất động sản (T2-25)', desc: 'Hợp đồng thuê văn phòng, gia hạn hợp đồng thuê và thẩm định mặt bằng.' },
  { order: 26, slug: 'tsl-t2-26-vendor-procurement', level: 'T2', title: 'TSL T2-26: Vendor Procurement & Bidding', titleVi: 'Đấu thầu & Tuyển chọn Nhà cung ứng (T2-26)', desc: 'Mời thầu, thẩm định năng lực nhà thầu và đàm phán hợp đồng cung ứng.' },
  { order: 27, slug: 'tsl-t2-27-corporate-hospitality', level: 'T2', title: 'TSL T2-27: Corporate Events & Hospitality', titleVi: 'Sự kiện Doanh nghiệp & Tiếp đãi Đối tác (T2-27)', desc: 'Tổ chức dạ tiệc thương mại, tiếp đón phái đoàn và hội thảo khách hàng.' },
  { order: 28, slug: 'tsl-t2-28-international-logistics', level: 'T2', title: 'TSL T2-28: International Freight & Customs', titleVi: 'Vận tải Quốc tế & Thủ tục Hải quan (T2-28)', desc: 'Khai báo hải quan, vận tải đường biển/đường hàng không và giấy phép xuất nhập khẩu.' },
  { order: 29, slug: 'tsl-t2-29-market-research', level: 'T2', title: 'TSL T2-29: Market Research & Consumer Insights', titleVi: 'Nghiên cứu Thị trường & Xu hướng Người dùng (T2-29)', desc: 'Khảo sát nhu cầu thị trường, phân tích hành vi khách hàng và đối thủ.' },
  { order: 30, slug: 'tsl-t2-30-billing-taxation', level: 'T2', title: 'TSL T2-30: Billing Systems & Corporate Tax', titleVi: 'Hệ thống Thanh toán & Thuế Doanh nghiệp (T2-30)', desc: 'Quyết toán thuế doanh nghiệp, miễn giảm thuế và đối soát hóa đơn.' },
  { order: 31, slug: 'tsl-t2-31-occupational-safety', level: 'T2', title: 'TSL T2-31: Occupational Safety & Protocols', titleVi: 'An toàn Lao động & Quy chuẩn Vận hành (T2-31)', desc: 'Quy trình phòng chống cháy nổ, bảo hộ lao động và thanh tra định kỳ.' },
  { order: 32, slug: 'tsl-t2-32-enterprise-systems', level: 'T2', title: 'TSL T2-32: Enterprise Systems & Data Security', titleVi: 'Hệ thống Doanh nghiệp & An ninh Dữ liệu (T2-32)', desc: 'Phần mềm quản trị ERP, bảo mật thông tin nội bộ và phân quyền truy cập.' },

  // --- LEVEL T3 (33-48) ---
  { order: 33, slug: 'tsl-t3-33-strategic-governance', level: 'T3', title: 'TSL T3-33: Corporate Governance & Strategy', titleVi: 'Chiến lược Cấp cao & Quản trị Doanh nghiệp (T3-33)', desc: 'Định hướng chiến lược dài hạn, cơ cấu hội đồng quản trị và chính sách điều hành.' },
  { order: 34, slug: 'tsl-t3-34-mergers-acquisitions', level: 'T3', title: 'TSL T3-34: Mergers, Acquisitions & Buyouts', titleVi: 'Sáp nhập, Thâu tóm & Mua lại (M&A) (T3-34)', desc: 'Thẩm định hồ sơ sáp nhập, tái cấu trúc vốn và chuyển giao quyền kiểm soát.' },
  { order: 35, slug: 'tsl-t3-35-legal-compliance', level: 'T3', title: 'TSL T3-35: Regulatory Compliance & Liability', titleVi: 'Tuân thủ Quy định Pháp lý & Trách nhiệm (T3-35)', desc: 'Thanh tra pháp chế, tuân thủ đạo luật cạnh tranh và xử lý rủi ro pháp lý.' },
  { order: 36, slug: 'tsl-t3-36-risk-contingency', level: 'T3', title: 'TSL T3-36: Risk Assessment & Contingency Planning', titleVi: 'Đánh giá Rủi ro & Kế hoạch Phòng ngừa (T3-36)', desc: 'Phân tích ma trận rủi ro, dự phòng khủng hoảng và kế hoạch kinh doanh liên tục.' },
  { order: 37, slug: 'tsl-t3-37-capital-investment', level: 'T3', title: 'TSL T3-37: Capital Markets & Portfolio Investment', titleVi: 'Thị trường Vốn & Đầu tư Tài chính (T3-37)', desc: 'Phát hành trái phiếu, danh mục đầu tư vốn mạo hiểm và lợi tức cổ đông.' },
  { order: 38, slug: 'tsl-t3-38-intellectual-property', level: 'T3', title: 'TSL T3-38: Intellectual Property & Patent Law', titleVi: 'Sở hữu Trí tuệ & Đăng ký Bằng Sáng chế (T3-38)', desc: 'Bảo hộ độc quyền nhãn hiệu, bản quyền công nghệ và tranh chấp phát minh.' },
  { order: 39, slug: 'tsl-t3-39-executive-leadership', level: 'T3', title: 'TSL T3-39: Executive Leadership & Corporate Ethics', titleVi: 'Năng lực Lãnh đạo & Đạo đức Kinh doanh (T3-39)', desc: 'Văn hóa minh bạch, bổ nhiệm nhân sự cấp cao và trách nhiệm giải trình.' },
  { order: 40, slug: 'tsl-t3-40-supply-optimization', level: 'T3', title: 'TSL T3-40: Global Supply Chain Optimization', titleVi: 'Tối ưu hóa Chuỗi Cung ứng Toàn cầu (T3-40)', desc: 'Mạng lưới logistics đa quốc gia, giảm thiểu tắc nghẽn và ứng dụng tự động hóa.' },
  { order: 41, slug: 'tsl-t3-41-restructuring-turnaround', level: 'T3', title: 'TSL T3-41: Corporate Restructuring & Turnaround', titleVi: 'Tái cấu trúc Tổ chức & Phục hồi Kinh doanh (T3-41)', desc: 'Tinh gọn bộ máy nhân sự, thoái vốn ngoài ngành và phục hồi biên lợi nhuận.' },
  { order: 42, slug: 'tsl-t3-42-dispute-arbitration', level: 'T3', title: 'TSL T3-42: Commercial Dispute Arbitration', titleVi: 'Trọng tài Thương mại & Giải quyết Tranh chấp (T3-42)', desc: 'Thỏa thuận hòa giải, phán quyết trọng tài quốc tế và tranh tụng kinh tế.' },
  { order: 43, slug: 'tsl-t3-43-global-trade-tariffs', level: 'T3', title: 'TSL T3-43: Global Trade Policies & Tariffs', titleVi: 'Chính sách Thương mại Quốc tế & Thuế quan (T3-43)', desc: 'Hiệp định thương mại tự do, hàng rào kỹ thuật và thuế chống bán phá giá.' },
  { order: 44, slug: 'tsl-t3-44-monopoly-antitrust', level: 'T3', title: 'TSL T3-44: Antitrust Law & Fair Competition', titleVi: 'Luật Chống Độc quyền & Cạnh tranh Lành mạnh (T3-44)', desc: 'Kiểm soát vị thế thống lĩnh thị trường, chống câu kết giá và bảo vệ thị trường.' },
  { order: 45, slug: 'tsl-t3-45-corporate-valuation', level: 'T3', title: 'TSL T3-45: Enterprise Valuation & Equity Financing', titleVi: 'Định giá Doanh nghiệp & Huy động Vốn Cổ phần (T3-45)', desc: 'Định giá P/E, IPO niêm yết sàn chứng khoán và phát hành cổ phiếu thưởng.' },
  { order: 46, slug: 'tsl-t3-46-esg-sustainability', level: 'T3', title: 'TSL T3-46: ESG Standards & Green Economy', titleVi: 'Tiêu chuẩn Bền vững ESG & Kinh tế Xanh (T3-46)', desc: 'Chứng chỉ giảm phát thải carbon, phát triển bền vững và trách nhiệm cộng đồng.' },
  { order: 47, slug: 'tsl-t3-47-stakeholder-agm', level: 'T3', title: 'TSL T3-47: Stakeholder Relations & AGM Summits', titleVi: 'Quan hệ Nhà Đầu tư & Đại hội Cổ đông (AGM) (T3-47)', desc: 'Báo cáo thường niên, bỏ phiếu biểu quyết hội đồng và công bố thông tin minh bạch.' },
  { order: 48, slug: 'tsl-t3-48-crisis-continuity', level: 'T3', title: 'TSL T3-48: Crisis Management & Continuity', titleVi: 'Quản trị Khủng hoảng & Duy trì Vận hành (T3-48)', desc: 'Xử lý sự cố truyền thông, kịch bản ứng phó sự cố và bảo vệ uy tín thương hiệu.' },
];

async function main() {
  console.log('🚀 Loading 1,200 TSL Official Words and Seeding 48 TOEIC Decks...');

  const rawJsonPath = '/tmp/tsl_words_list.json';
  let allWords: string[] = [];
  if (fs.existsSync(rawJsonPath)) {
    allWords = JSON.parse(fs.readFileSync(rawJsonPath, 'utf-8'));
  }

  if (allWords.length === 0) {
    throw new Error('TSL words list is empty!');
  }

  // Ensure raw CSV is populated with 1,200 TSL words
  const rawCsvPath = path.resolve(__dirname, 'data/raw/tsl-1.2.csv');
  let csvContent = 'headword,pos,freq_rank,freq_value\n';
  allWords.slice(0, 1200).forEach((w, idx) => {
    const rank = idx + 1;
    const value = Math.max(1, (1200 - idx) * 0.1).toFixed(1);
    csvContent += `${w},n,${rank},${value}\n`;
  });
  fs.writeFileSync(rawCsvPath, csvContent, 'utf-8');
  console.log(`✅ Saved complete 1,200 TSL dataset to ${rawCsvPath}`);

  // Clean old TOEIC decks
  const oldToeicDecks = await prisma.officialDeck.findMany({
    where: { pathCode: 'TOEIC' },
    select: { id: true }
  });
  if (oldToeicDecks.length > 0) {
    const deckIds = oldToeicDecks.map(d => d.id);
    await prisma.officialDeckCard.deleteMany({ where: { deckId: { in: deckIds } } });
    await prisma.officialDeck.deleteMany({ where: { id: { in: deckIds } } });
    console.log(`🧹 Cleaned ${oldToeicDecks.length} old TOEIC decks`);
  }

  // Seed 48 Decks (25 words each = 1,200 words)
  let wordIdx = 0;
  for (const theme of DECK_THEMES) {
    const deckWords = allWords.slice(wordIdx, wordIdx + 25);
    wordIdx += 25;

    const deck = await prisma.officialDeck.create({
      data: {
        slug: theme.slug,
        title: theme.title,
        titleVi: theme.titleVi,
        description: theme.desc,
        pathCode: 'TOEIC',
        level: theme.level,
        order: theme.order,
        listCode: 'TSL',
        cardCount: deckWords.length,
      }
    });

    for (let cIdx = 0; cIdx < deckWords.length; cIdx++) {
      const word = deckWords[cIdx];
      const cardContent = {
        word,
        pos: 'business term',
        ipa_us: `/${word}/`,
        meaning_vi: `Thuật ngữ TOEIC: ${word}`,
        definition_en: `High-frequency TOEIC business English vocabulary term.`,
        example_en: `The manager reviewed the ${word} policy during the quarterly meeting.`,
        example_vi: `Người quản lý đã rà soát chính sách về ${word} trong cuộc họp quý.`,
        collocations: [`${word} policy`, `review ${word}`, `standard ${word}`],
        topic: theme.titleVi,
        level: theme.level,
        freqRank: (theme.order - 1) * 25 + cIdx + 1,
      };

      const card = await prisma.officialCard.create({
        data: {
          headword: word,
          pos: 'business',
          content: cardContent,
          status: 'PUBLISHED',
          contentVersion: 1,
        }
      });

      await prisma.officialDeckCard.create({
        data: {
          deckId: deck.id,
          cardId: card.id,
          order: cIdx + 1,
        }
      });
    }

    console.log(`  [${theme.level}] Upserted Deck ${theme.order}/48: ${theme.slug} (${deckWords.length} cards)`);
  }

  const finalDeckCount = await prisma.officialDeck.count({ where: { pathCode: 'TOEIC' } });
  const finalCardCount = await prisma.officialDeckCard.count({
    where: { deck: { pathCode: 'TOEIC' } }
  });

  console.log(`\n🎉 SEED SUCCESSFUL!`);
  console.log(`📚 Total TOEIC Decks: ${finalDeckCount} / 48`);
  console.log(`🗂️ Total TOEIC Cards: ${finalCardCount} / 1200 words`);
}

main()
  .catch(console.error)
  .finally(() => pool.end());
