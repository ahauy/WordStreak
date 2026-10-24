import 'dotenv/config';
import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { FOUNDATION_DECKS } from '../../apps/web/src/features/foundation/data/foundationDecks';
import { TOEIC_COLLOCATIONS_DECKS } from '../../apps/web/src/features/toeic-advanced/data/collocationsDecks';
import { TOEIC_PHOTO_DECKS_PART1 } from '../../apps/web/src/features/toeic-advanced/data/photoDecksPart1';
import { NAWL_ACADEMIC_DECKS } from '../../apps/web/src/features/academic/data/nawlDecks';
import { SAMPLE_BSL_WORDS } from '../../apps/web/src/features/business/data/bslDecks';
import { SAMPLE_SPOKEN_WORDS } from '../../apps/web/src/features/spoken/data/spokenDecks';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:23012005@localhost:5432/wordstreak_db?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 48 TOEIC Themed Decks (16 for T1, 16 for T2, 16 for T3)
const TOEIC_DECK_THEMES = [
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

function cleanMeaning(m: string): string {
  if (!m) return '';
  return m
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\/\/.*/g, '')
    .trim()
    .replace(/^[,;.\s]+|[,;.\s]+$/g, '');
}

async function loadDictionary(): Promise<Map<string, { ipa: string; meaning: string }>> {
  const dict = new Map<string, { ipa: string; meaning: string }>();
  if (!fs.existsSync('/tmp/ev_dict.txt')) {
    console.warn('⚠️ /tmp/ev_dict.txt not found. Using fallback meanings.');
    return dict;
  }

  console.log('📖 Loading Anh-Việt dictionary from /tmp/ev_dict.txt...');
  const fileStream = fs.createReadStream('/tmp/ev_dict.txt', { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentWord: string | null = null;
  let currentIpa = '';
  let currentMeanings: string[] = [];

  for await (const line of rl) {
    if (line.startsWith('@')) {
      if (currentWord && currentMeanings.length > 0) {
        const cleaned = currentMeanings.map(cleanMeaning).filter(Boolean).slice(0, 2).join('; ');
        if (cleaned) {
          dict.set(currentWord.toLowerCase(), { ipa: currentIpa, meaning: cleaned });
        }
      }
      const parts = line.substring(1).trim().split('/');
      currentWord = parts[0].trim();
      currentIpa = parts[1] ? '/' + parts[1].trim() + '/' : '';
      currentMeanings = [];
    } else if (line.startsWith('-')) {
      const m = line.substring(1).trim();
      if (m && !m.startsWith('=')) {
        currentMeanings.push(m);
      }
    }
  }

  if (currentWord && currentMeanings.length > 0) {
    const cleaned = currentMeanings.map(cleanMeaning).filter(Boolean).slice(0, 2).join('; ');
    if (cleaned) {
      dict.set(currentWord.toLowerCase(), { ipa: currentIpa, meaning: cleaned });
    }
  }

  console.log(`✅ Loaded ${dict.size} words from Anh-Việt dictionary.`);
  return dict;
}

async function main() {
  console.log('🚀 Starting Comprehensive Vocabulary Database Seed on Neon...');

  const dict = await loadDictionary();

  // 1. Ensure WordLists exist
  const wordLists = [
    { code: 'TSL', name: 'TOEIC Service List', version: '1.2', sourceUrl: 'https://www.newgeneralservicelist.com/tsl-toeic-service-list', attribution: 'Browne, Culligan, & Phillips (2016)', entryCount: 1200 },
    { code: 'NGSL', name: 'New General Service List', version: '1.2', sourceUrl: 'https://www.newgeneralservicelist.com', attribution: 'Browne, Culligan, & Phillips (2014)', entryCount: 2800 },
    { code: 'NAWL', name: 'New Academic Word List', version: '1.2', sourceUrl: 'https://www.newgeneralservicelist.com/nawl-new-academic-word-list', attribution: 'Browne, Culligan, & Phillips (2014)', entryCount: 960 },
    { code: 'BSL', name: 'Business Service List', version: '1.0', sourceUrl: 'https://www.newgeneralservicelist.com/bsl-business-service-list', attribution: 'Browne & Culligan (2016)', entryCount: 1700 },
  ];

  for (const wl of wordLists) {
    await prisma.wordList.upsert({
      where: { code: wl.code },
      update: {},
      create: {
        code: wl.code,
        name: wl.name,
        version: wl.version,
        sourceUrl: wl.sourceUrl,
        attribution: wl.attribution,
        entryCount: wl.entryCount,
        license: 'CC BY-SA 4.0',
      },
    });
  }
  console.log('✅ WordLists verified.');

  const allWordsForCache: Array<{
    word: string;
    pos?: string;
    phonetic?: string;
    meaningVi: string;
    exampleSentence?: string;
    exampleTranslation?: string;
    collocations?: string;
    mnemonic?: string;
  }> = [];

  // 2. SEED 48 TOEIC DECKS (1,200 Words)
  console.log('\n--- [1/6] Seeding 48 TOEIC Themed Decks (TSL 1,200 Words) ---');
  let tslWords: string[] = [];
  if (fs.existsSync('/tmp/tsl_words_list.json')) {
    tslWords = JSON.parse(fs.readFileSync('/tmp/tsl_words_list.json', 'utf-8'));
  } else {
    const rawCsv = fs.readFileSync(path.resolve(__dirname, 'data/raw/tsl-1.2.csv'), 'utf-8');
    tslWords = rawCsv.split('\n').slice(1).map(l => l.split(',')[0].trim()).filter(Boolean);
  }

  let wordOffset = 0;
  for (const theme of TOEIC_DECK_THEMES) {
    const deckWords = tslWords.slice(wordOffset, wordOffset + 25);
    wordOffset += 25;

    const deck = await prisma.officialDeck.upsert({
      where: { slug: theme.slug },
      update: {
        title: theme.title,
        titleVi: theme.titleVi,
        description: theme.desc,
        level: theme.level,
        order: theme.order,
        cardCount: deckWords.length,
      },
      create: {
        slug: theme.slug,
        title: theme.title,
        titleVi: theme.titleVi,
        description: theme.desc,
        pathCode: 'TOEIC',
        level: theme.level,
        order: theme.order,
        listCode: 'TSL',
        cardCount: deckWords.length,
      },
    });

    // Delete existing links for clean idempotent run
    await prisma.officialDeckCard.deleteMany({ where: { deckId: deck.id } });

    const cardsToCreate = [];
    const deckCardsToCreate = [];

    for (let i = 0; i < deckWords.length; i++) {
      const w = deckWords[i];
      const entry = dict.get(w.toLowerCase());
      const ipa = entry?.ipa || `/${w}/`;
      const meaning = entry?.meaning || `Thuật ngữ chuyên ngành TOEIC: ${w}`;

      const cardId = crypto.randomUUID();
      const content = {
        word: w,
        pos: 'business term',
        ipa_us: ipa,
        meaning_vi: meaning,
        definition_en: `High-frequency TOEIC business vocabulary term in ${theme.titleVi}.`,
        example_en: `The manager reviewed the ${w} protocol during the quarterly review.`,
        example_vi: `Người quản lý đã rà soát quy trình về ${meaning.toLowerCase()} trong buổi đánh giá quý.`,
        collocations: [`${w} policy`, `review ${w}`, `standard ${w}`],
        topic: theme.titleVi,
        level: theme.level,
        freqRank: (theme.order - 1) * 25 + i + 1,
      };

      cardsToCreate.push({
        id: cardId,
        headword: w,
        pos: 'business',
        content,
        status: 'PUBLISHED',
        contentVersion: 1,
      });

      deckCardsToCreate.push({
        deckId: deck.id,
        cardId: cardId,
        order: i + 1,
      });

      allWordsForCache.push({
        word: w,
        pos: 'business',
        phonetic: ipa,
        meaningVi: meaning,
        exampleSentence: content.example_en,
        exampleTranslation: content.example_vi,
        collocations: JSON.stringify(content.collocations),
      });
    }

    await prisma.officialCard.createMany({ data: cardsToCreate });
    await prisma.officialDeckCard.createMany({ data: deckCardsToCreate });
  }
  console.log(`✅ Seeded 48 TOEIC Decks (${tslWords.slice(0, 1200).length} cards)`);

  // 3. SEED 15 FOUNDATION DECKS (NGSL Top 300 Words)
  console.log('\n--- [2/6] Seeding 15 Foundation Decks (NGSL Top 300) ---');
  for (const fDeck of FOUNDATION_DECKS) {
    const deck = await prisma.officialDeck.upsert({
      where: { slug: fDeck.slug },
      update: {
        title: fDeck.titleEn,
        titleVi: fDeck.titleVi,
        description: `20 từ vựng sinh tồn chủ đề ${fDeck.category} dành cho người bắt đầu từ con số 0.`,
        level: 'T1',
        order: fDeck.order,
        cardCount: fDeck.sampleWords.length,
      },
      create: {
        slug: fDeck.slug,
        title: fDeck.titleEn,
        titleVi: fDeck.titleVi,
        description: `20 từ vựng sinh tồn chủ đề ${fDeck.category} dành cho người bắt đầu từ con số 0.`,
        pathCode: 'FOUNDATION',
        level: 'T1',
        order: fDeck.order,
        listCode: 'NGSL',
        cardCount: fDeck.sampleWords.length,
      },
    });

    await prisma.officialDeckCard.deleteMany({ where: { deckId: deck.id } });

    const cardsToCreate = [];
    const deckCardsToCreate = [];

    for (let i = 0; i < fDeck.sampleWords.length; i++) {
      const w = fDeck.sampleWords[i];
      const entry = dict.get(w.toLowerCase());
      const ipa = entry?.ipa || `/${w}/`;
      const meaning = entry?.meaning || `Từ vựng cơ bản: ${w}`;

      const cardId = crypto.randomUUID();
      const content = {
        word: w,
        pos: fDeck.category,
        ipa_us: ipa,
        meaning_vi: meaning,
        definition_en: `Essential survival vocabulary word for beginners in category: ${fDeck.category}.`,
        example_en: `Please remember to use ${w} correctly in daily conversation.`,
        example_vi: `Hãy nhớ sử dụng từ "${w}" (${meaning}) chính xác trong giao tiếp hằng ngày.`,
        collocations: [`basic ${w}`, `use ${w}`],
        topic: fDeck.category,
        level: 'T1',
      };

      cardsToCreate.push({
        id: cardId,
        headword: w,
        pos: fDeck.category,
        content,
        status: 'PUBLISHED',
        contentVersion: 1,
      });

      deckCardsToCreate.push({
        deckId: deck.id,
        cardId: cardId,
        order: i + 1,
      });

      allWordsForCache.push({
        word: w,
        pos: fDeck.category,
        phonetic: ipa,
        meaningVi: meaning,
        exampleSentence: content.example_en,
        exampleTranslation: content.example_vi,
      });
    }

    await prisma.officialCard.createMany({ data: cardsToCreate });
    await prisma.officialDeckCard.createMany({ data: deckCardsToCreate });
  }
  console.log(`✅ Seeded 15 Foundation Decks (300 cards)`);

  // 4. SEED 4 TOEIC COLLOCATIONS DECKS (100 Items)
  console.log('\n--- [3/6] Seeding 4 TOEIC Collocations Decks (100 Items) ---');
  let collocOrder = 50;
  for (const cDeck of TOEIC_COLLOCATIONS_DECKS) {
    collocOrder++;
    const slug = `toeic-colloc-${cDeck.id}`;
    const deck = await prisma.officialDeck.upsert({
      where: { slug },
      update: {
        title: cDeck.title,
        titleVi: cDeck.titleVi,
        description: cDeck.description,
        level: 'T2',
        order: collocOrder,
        cardCount: cDeck.items.length,
      },
      create: {
        slug,
        title: cDeck.title,
        titleVi: cDeck.titleVi,
        description: cDeck.description,
        pathCode: 'TOEIC',
        level: 'T2',
        order: collocOrder,
        listCode: 'TSL',
        cardCount: cDeck.items.length,
      },
    });

    await prisma.officialDeckCard.deleteMany({ where: { deckId: deck.id } });

    const cardsToCreate = [];
    const deckCardsToCreate = [];

    for (let i = 0; i < cDeck.items.length; i++) {
      const item = cDeck.items[i];
      const cardId = crypto.randomUUID();
      const content = {
        word: item.phrase,
        pos: 'collocation',
        ipa_us: `/${item.phrase}/`,
        meaning_vi: item.meaningVi,
        definition_en: item.meaningEn,
        example_en: item.exampleEn,
        example_vi: item.exampleVi,
        collocations: [item.pattern],
        mnemonic: `Mẫu cấu trúc ngữ pháp: ${item.pattern}`,
        topic: cDeck.titleVi,
        level: 'T2',
      };

      cardsToCreate.push({
        id: cardId,
        headword: item.phrase,
        pos: 'collocation',
        content,
        status: 'PUBLISHED',
        contentVersion: 1,
      });

      deckCardsToCreate.push({
        deckId: deck.id,
        cardId: cardId,
        order: i + 1,
      });

      allWordsForCache.push({
        word: item.phrase,
        pos: 'collocation',
        meaningVi: item.meaningVi,
        exampleSentence: item.exampleEn,
        exampleTranslation: item.exampleVi,
        collocations: JSON.stringify([item.pattern]),
      });
    }

    await prisma.officialCard.createMany({ data: cardsToCreate });
    await prisma.officialDeckCard.createMany({ data: deckCardsToCreate });
  }
  console.log(`✅ Seeded 4 Collocations Decks (100 cards)`);

  // 5. SEED 2 TOEIC PHOTO PART 1 DECKS (50 Items)
  console.log('\n--- [4/6] Seeding 2 TOEIC Part 1 Photo Decks (50 Items) ---');
  let photoOrder = 60;
  for (const pDeck of TOEIC_PHOTO_DECKS_PART1) {
    photoOrder++;
    const slug = `toeic-photo-${pDeck.id}`;
    const deck = await prisma.officialDeck.upsert({
      where: { slug },
      update: {
        title: pDeck.title,
        titleVi: pDeck.titleVi,
        description: pDeck.description,
        level: 'T1',
        order: photoOrder,
        cardCount: pDeck.items.length,
      },
      create: {
        slug,
        title: pDeck.title,
        titleVi: pDeck.titleVi,
        description: pDeck.description,
        pathCode: 'TOEIC',
        level: 'T1',
        order: photoOrder,
        listCode: 'TSL',
        cardCount: pDeck.items.length,
      },
    });

    await prisma.officialDeckCard.deleteMany({ where: { deckId: deck.id } });

    const cardsToCreate = [];
    const deckCardsToCreate = [];

    for (let i = 0; i < pDeck.items.length; i++) {
      const item = pDeck.items[i];
      const cardId = crypto.randomUUID();
      const content = {
        word: item.phrase,
        pos: item.contextType,
        ipa_us: `/${item.phrase}/`,
        meaning_vi: item.meaningVi,
        definition_en: item.meaningEn,
        example_en: item.exampleEn,
        example_vi: item.exampleVi,
        topic: pDeck.titleVi,
        level: 'T1',
      };

      cardsToCreate.push({
        id: cardId,
        headword: item.phrase,
        pos: 'phrase',
        content,
        status: 'PUBLISHED',
        contentVersion: 1,
      });

      deckCardsToCreate.push({
        deckId: deck.id,
        cardId: cardId,
        order: i + 1,
      });

      allWordsForCache.push({
        word: item.phrase,
        pos: 'phrase',
        meaningVi: item.meaningVi,
        exampleSentence: item.exampleEn,
        exampleTranslation: item.exampleVi,
      });
    }

    await prisma.officialCard.createMany({ data: cardsToCreate });
    await prisma.officialDeckCard.createMany({ data: deckCardsToCreate });
  }
  console.log(`✅ Seeded 2 Photo Part 1 Decks (50 cards)`);

  // 6. SEED 4 NAWL ACADEMIC IELTS DECKS (40 Items)
  console.log('\n--- [5/6] Seeding 4 NAWL Academic IELTS Decks (40 Items) ---');
  let academicOrder = 1;
  for (const aDeck of NAWL_ACADEMIC_DECKS) {
    const deck = await prisma.officialDeck.upsert({
      where: { slug: aDeck.slug },
      update: {
        title: aDeck.title,
        titleVi: aDeck.titleVi,
        description: aDeck.description,
        level: 'T2',
        order: academicOrder++,
        cardCount: aDeck.cards.length,
      },
      create: {
        slug: aDeck.slug,
        title: aDeck.title,
        titleVi: aDeck.titleVi,
        description: aDeck.description,
        pathCode: 'ACADEMIC',
        level: 'T2',
        order: academicOrder++,
        listCode: 'NAWL',
        cardCount: aDeck.cards.length,
      },
    });

    await prisma.officialDeckCard.deleteMany({ where: { deckId: deck.id } });

    const cardsToCreate = [];
    const deckCardsToCreate = [];

    for (let i = 0; i < aDeck.cards.length; i++) {
      const cardData = aDeck.cards[i];
      const cardId = crypto.randomUUID();
      const content = {
        word: cardData.word,
        pos: cardData.pos,
        ipa_us: cardData.ipa,
        meaning_vi: cardData.meaningVi,
        definition_en: cardData.defEn,
        example_en: cardData.exampleEn,
        example_vi: cardData.exampleVi,
        collocations: cardData.collocations,
        mnemonic: cardData.mnemonic,
        topic: aDeck.titleVi,
        level: 'T2',
        bandTarget: cardData.bandTarget,
      };

      cardsToCreate.push({
        id: cardId,
        headword: cardData.word,
        pos: cardData.pos,
        content,
        status: 'PUBLISHED',
        contentVersion: 1,
      });

      deckCardsToCreate.push({
        deckId: deck.id,
        cardId: cardId,
        order: i + 1,
      });

      allWordsForCache.push({
        word: cardData.word,
        pos: cardData.pos,
        phonetic: cardData.ipa,
        meaningVi: cardData.meaningVi,
        exampleSentence: cardData.exampleEn,
        exampleTranslation: cardData.exampleVi,
        collocations: JSON.stringify(cardData.collocations),
        mnemonic: cardData.mnemonic,
      });
    }

    await prisma.officialCard.createMany({ data: cardsToCreate });
    await prisma.officialDeckCard.createMany({ data: deckCardsToCreate });
  }
  console.log(`✅ Seeded 4 Academic Decks (40 cards)`);

  // 7. SEED BUSINESS (BSL) & SPOKEN DECKS
  console.log('\n--- [6/6] Seeding Business & Spoken Decks ---');
  if (SAMPLE_BSL_WORDS.length > 0) {
    const bslDeck = await prisma.officialDeck.upsert({
      where: { slug: 'bsl-corporate-management-01' },
      update: { cardCount: SAMPLE_BSL_WORDS.length },
      create: {
        slug: 'bsl-corporate-management-01',
        title: 'BSL: Corporate Management & Strategy',
        titleVi: 'Quản trị Doanh nghiệp & Chiến lược Cấp cao (BSL)',
        description: 'Thuật ngữ cốt lõi trong hội đồng quản trị và điều hành doanh nghiệp quốc tế.',
        pathCode: 'BUSINESS',
        level: 'T2',
        order: 1,
        listCode: 'BSL',
        cardCount: SAMPLE_BSL_WORDS.length,
      },
    });

    await prisma.officialDeckCard.deleteMany({ where: { deckId: bslDeck.id } });
    const bslCards = [];
    const bslDeckCards = [];
    for (let i = 0; i < SAMPLE_BSL_WORDS.length; i++) {
      const w = SAMPLE_BSL_WORDS[i];
      const cardId = crypto.randomUUID();
      bslCards.push({
        id: cardId,
        headword: w.word,
        pos: w.pos,
        content: {
          word: w.word,
          pos: w.pos,
          ipa_us: w.ipa,
          meaning_vi: w.meaningVi,
          definition_en: w.defEn,
          example_en: w.exampleEn,
          example_vi: w.exampleVi,
          collocations: w.collocations,
          mnemonic: w.mnemonic,
        },
        status: 'PUBLISHED',
        contentVersion: 1,
      });
      bslDeckCards.push({ deckId: bslDeck.id, cardId, order: i + 1 });
      allWordsForCache.push({ word: w.word, meaningVi: w.meaningVi, exampleSentence: w.exampleEn, exampleTranslation: w.exampleVi });
    }
    await prisma.officialCard.createMany({ data: bslCards });
    await prisma.officialDeckCard.createMany({ data: bslDeckCards });
  }

  if (SAMPLE_SPOKEN_WORDS.length > 0) {
    const spokenDeck = await prisma.officialDeck.upsert({
      where: { slug: 'spoken-real-life-idioms-01' },
      update: { cardCount: SAMPLE_SPOKEN_WORDS.length },
      create: {
        slug: 'spoken-real-life-idioms-01',
        title: 'Spoken English: Daily Idioms & Colloquialisms',
        titleVi: 'Thành ngữ Giao tiếp Hằng ngày Đời thực',
        description: 'Cụm từ và thành ngữ tự nhiên người bản xứ hay dùng trong đời sống và công sở.',
        pathCode: 'COMMUNICATION',
        level: 'T1',
        order: 1,
        listCode: 'NGSL-S',
        cardCount: SAMPLE_SPOKEN_WORDS.length,
      },
    });

    await prisma.officialDeckCard.deleteMany({ where: { deckId: spokenDeck.id } });
    const spokenCards = [];
    const spokenDeckCards = [];
    for (let i = 0; i < SAMPLE_SPOKEN_WORDS.length; i++) {
      const w = SAMPLE_SPOKEN_WORDS[i];
      const cardId = crypto.randomUUID();
      spokenCards.push({
        id: cardId,
        headword: w.word,
        pos: w.pos,
        content: {
          word: w.word,
          pos: w.pos,
          ipa_us: w.ipa,
          meaning_vi: w.meaningVi,
          example_en: w.dialogue?.speakerA || '',
          example_vi: w.dialogue?.speakerAVi || '',
          collocations: w.collocations,
        },
        status: 'PUBLISHED',
        contentVersion: 1,
      });
      spokenDeckCards.push({ deckId: spokenDeck.id, cardId, order: i + 1 });
      allWordsForCache.push({ word: w.word, meaningVi: w.meaningVi, exampleSentence: w.dialogue?.speakerA, exampleTranslation: w.dialogue?.speakerAVi });
    }
    await prisma.officialCard.createMany({ data: spokenCards });
    await prisma.officialDeckCard.createMany({ data: spokenDeckCards });
  }

  // 8. BATCH SYNC TO GLOBAL DICTIONARY CACHE
  console.log('\n--- Syncing unique words to GlobalDictionaryCache ---');
  const uniqueWordsMap = new Map<string, any>();
  for (const item of allWordsForCache) {
    const lower = item.word.toLowerCase();
    if (!uniqueWordsMap.has(lower)) {
      uniqueWordsMap.set(lower, item);
    }
  }

  let cacheUpserted = 0;
  for (const [lowerWord, item] of uniqueWordsMap.entries()) {
    await prisma.globalDictionaryCache.upsert({
      where: { word: lowerWord },
      update: {
        meaningVi: item.meaningVi,
        phonetic: item.phonetic,
        partOfSpeech: item.pos,
        exampleSentence: item.exampleSentence,
        exampleTranslation: item.exampleTranslation,
        collocations: item.collocations,
        mnemonic: item.mnemonic,
      },
      create: {
        word: lowerWord,
        meaningVi: item.meaningVi,
        phonetic: item.phonetic,
        partOfSpeech: item.pos,
        exampleSentence: item.exampleSentence,
        exampleTranslation: item.exampleTranslation,
        collocations: item.collocations,
        mnemonic: item.mnemonic,
        source: 'OFFICIAL_DATA',
        hitCount: 1,
      },
    });
    cacheUpserted++;
  }
  console.log(`✅ Synced ${cacheUpserted} unique words to GlobalDictionaryCache`);

  const finalDeckCount = await prisma.officialDeck.count();
  const finalCardCount = await prisma.officialCard.count();
  console.log('\n======================================================');
  console.log(`🎉 ALL VOCABULARY DECKS SUCCESSFULLY SEEDED!`);
  console.log(`📚 Total Official Decks in DB: ${finalDeckCount}`);
  console.log(`🗂️ Total Official Cards in DB: ${finalCardCount}`);
  console.log(`📖 Total Cached Words in DB:   ${await prisma.globalDictionaryCache.count()}`);
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
