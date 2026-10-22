export interface BusinessWordCard {
  word: string;
  pos: string;
  ipa: string;
  meaningVi: string;
  defEn: string;
  exampleEn: string;
  exampleVi: string;
  collocations: string[];
  mnemonic?: string;
  sector: "MANAGEMENT" | "FINANCE" | "MARKETING" | "HR" | "OPERATIONS";
}

export interface BusinessDeckSummary {
  id: string;
  slug: string;
  order: number;
  sector: "MANAGEMENT" | "FINANCE" | "MARKETING" | "HR" | "OPERATIONS";
  sectorLabel: string;
  title: string;
  titleVi: string;
  cardsCount: number;
  estMinutes: number;
}

export const SAMPLE_BSL_WORDS: BusinessWordCard[] = [
  {
    word: "stakeholder",
    pos: "noun",
    ipa: "/ˈsteɪkˌhoʊl.dər/",
    meaningVi: "Bên liên quan (cổ đông, nhân viên, đối tác, khách hàng)",
    defEn: "a person or group that has an investment, share, or interest in something",
    exampleEn: "Management held a briefing to reassure major stakeholders about the merger.",
    exampleVi: "Ban quản lý đã tổ chức buổi thông báo để trấn an các bên liên quan chính về thương vụ sáp nhập.",
    collocations: ["key stakeholder", "stakeholder engagement", "stakeholder meeting"],
    mnemonic: "Stake (cổ phần/lợi ích) + holder (người nắm giữ) = bên có quyền lợi liên quan",
    sector: "MANAGEMENT",
  },
  {
    word: "dividend",
    pos: "noun",
    ipa: "/ˈdɪv.ə.dend/",
    meaningVi: "Cổ tức, lợi nhuận chia cho cổ đông",
    defEn: "a sum of money paid regularly by a company to its shareholders out of its profits",
    exampleEn: "The board approved a quarterly cash dividend of thirty cents per share.",
    exampleVi: "Hội đồng quản trị đã thông qua mức cổ tức tiền mặt hàng quý ba mươi xu cho mỗi cổ phiếu.",
    collocations: ["pay a dividend", "quarterly dividend", "dividend yield"],
    mnemonic: "Divide (chia sẻ) + end = khoản tiền chia đều cho các cổ đông cuối kỳ",
    sector: "FINANCE",
  },
  {
    word: "leverage",
    pos: "verb",
    ipa: "/ˈlev.ɚ.ɪdʒ/",
    meaningVi: "Tận dụng đòn bẩy nguồn lực để tối ưu hóa kết quả",
    defEn: "to use something to maximum advantage",
    exampleEn: "The startup aims to leverage cloud computing to scale customer onboarding rapidly.",
    exampleVi: "Công ty khởi nghiệp hướng tới việc tận dụng điện toán đám mây để mở rộng tệp khách hàng nhanh chóng.",
    collocations: ["leverage assets", "leverage technology", "financial leverage"],
    mnemonic: "Lever (cái đòn bẩy) = dùng đòn bẩy để nâng bổng kết quả",
    sector: "MANAGEMENT",
  },
  {
    word: "compliance",
    pos: "noun",
    ipa: "/kəmˈplaɪ.əns/",
    meaningVi: "Sự tuân thủ các quy định pháp lý và tiêu chuẩn ngành",
    defEn: "the state of conforming to official guidelines, laws, or specifications",
    exampleEn: "The fintech firm hired external auditors to ensure strict GDPR compliance.",
    exampleVi: "Công ty fintech đã thuê kiểm toán viên độc lập để đảm bảo tuân thủ nghiêm ngặt quy định GDPR.",
    collocations: ["regulatory compliance", "ensure compliance", "compliance officer"],
    mnemonic: "Comply (tuân theo) + ance = sự tuân thủ quy chuẩn",
    sector: "MANAGEMENT",
  },
  {
    word: "acquisition",
    pos: "noun",
    ipa: "/ˌæk.wəˈzɪʃ.ən/",
    meaningVi: "Thương vụ thâu tóm, mua lại doanh nghiệp",
    defEn: "an asset or object bought or obtained, typically by a corporation",
    exampleEn: "The tech conglomerate finalized its billion-dollar acquisition of the AI lab.",
    exampleVi: "Tập đoàn công nghệ đã hoàn tất thương vụ thâu tóm trị giá hàng tỷ đô đối với phòng lab AI.",
    collocations: ["merger and acquisition", "strategic acquisition", "target acquisition"],
    mnemonic: "Acquire (mua lại/đoạt lấy) + tion = vụ thâu tóm",
    sector: "FINANCE",
  },
  {
    word: "onboarding",
    pos: "noun",
    ipa: "/ˈɑːnˌbɔːr.dɪŋ/",
    meaningVi: "Quy trình hội nhập nhân viên mới hoặc tiếp nhận người dùng",
    defEn: "the action or process of integrating a new employee or client",
    exampleEn: "A streamlined digital onboarding program boosts first-month employee retention.",
    exampleVi: "Chương trình hội nhập kỹ thuật số tinh gọn giúp nâng cao tỷ lệ giữ chân nhân viên trong tháng đầu.",
    collocations: ["employee onboarding", "client onboarding", "onboarding process"],
    mnemonic: "On + board: đón lên tàu công ty cùng làm việc",
    sector: "HR",
  },
  {
    word: "conversion",
    pos: "noun",
    ipa: "/kənˈvɜːr.ʒən/",
    meaningVi: "Tỷ lệ chuyển đổi khách hàng tiềm năng thành đơn hàng",
    defEn: "the point at which a recipient of a marketing message performs a desired action",
    exampleEn: "Optimizing the checkout workflow improved our online conversion rate by four percent.",
    exampleVi: "Tối ưu hóa quy trình thanh toán đã cải thiện tỷ lệ chuyển đổi trực tuyến của chúng tôi thêm bốn phần trăm.",
    collocations: ["conversion rate", "boost conversion", "funnel conversion"],
    mnemonic: "Convert (biến đổi) + tion = biến khách xem thành khách mua",
    sector: "MARKETING",
  },
  {
    word: "procurement",
    pos: "noun",
    ipa: "/prəˈkjʊr.mənt/",
    meaningVi: "Hoạt động thu mua và đấu thầu nguyên vật liệu doanh nghiệp",
    defEn: "the action of obtaining equipment, materials, or services",
    exampleEn: "The procurement department renegotiated bulk vendor contracts to trim expenses.",
    exampleVi: "Phòng thu mua đã đàm phán lại các hợp đồng nhà cung cấp số lượng lớn để cắt giảm chi phí.",
    collocations: ["procurement process", "public procurement", "procurement officer"],
    mnemonic: "Procure (tìm mua/thu thập) + ment = hoạt động thu mua doanh nghiệp",
    sector: "OPERATIONS",
  },
];

export const BSL_50_DECKS_CATALOG: BusinessDeckSummary[] = [
  // Sector 1: Management & Corporate Strategy (10 Decks x 34 cards = 340 words)
  { id: "bsl-01", slug: "bsl-01-corporate-governance", order: 1, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Corporate Governance & Boards", titleVi: "Quản trị Doanh nghiệp & HĐQT", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-02", slug: "bsl-02-strategic-planning", order: 2, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Strategic Planning & OKRs", titleVi: "Hoạch định Chiến lược & OKRs", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-03", slug: "bsl-03-change-management", order: 3, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Organizational Change & Agility", titleVi: "Quản trị Biến đổi & Chuyển mình", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-04", slug: "bsl-04-executive-leadership", order: 4, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Executive Decision Making", titleVi: "Ra Quyết định Cấp Điều hành", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-05", slug: "bsl-05-mergers-acquisitions", order: 5, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Mergers, Acquisitions & Joint Ventures", titleVi: "Mua bán Sáp nhập & Liên doanh", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-06", slug: "bsl-06-risk-compliance", order: 6, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Enterprise Risk & Compliance", titleVi: "Quản trị Rủi ro & Tuân thủ", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-07", slug: "bsl-07-business-ethics", order: 7, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Corporate Social Responsibility & ESG", titleVi: "Trách nhiệm Xã hội & Tiêu chuẩn ESG", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-08", slug: "bsl-08-crisis-management", order: 8, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Crisis Management & PR Recovery", titleVi: "Xử lý Khủng hoảng & Phục hồi PR", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-09", slug: "bsl-09-consulting-advisory", order: 9, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Management Consulting Frameworks", titleVi: "Mô hình Tư vấn Quản trị", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-10", slug: "bsl-10-startup-scaling", order: 10, sector: "MANAGEMENT", sectorLabel: "Quản trị Doanh nghiệp", title: "Startup Ecosystem & Venture Scaling", titleVi: "Hệ sinh thái Khởi nghiệp & Tăng trưởng", cardsCount: 34, estMinutes: 12 },

  // Sector 2: Finance & Accounting (10 Decks x 34 cards = 340 words)
  { id: "bsl-11", slug: "bsl-11-financial-statements", order: 11, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Financial Statements & Balance Sheets", titleVi: "Báo cáo Tài chính & Bảng Cân đối", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-12", slug: "bsl-12-corporate-taxation", order: 12, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Tax Compliance & Auditing", titleVi: "Nghĩa vụ Thuế & Kiểm toán Doanh nghiệp", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-13", slug: "bsl-13-capital-markets", order: 13, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Equities, Bonds & Capital Markets", titleVi: "Chứng khoán, Trái phiếu & Thị trường Vốn", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-14", slug: "bsl-14-budgeting-forecast", order: 14, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Cash Flow & Capital Budgeting", titleVi: "Dòng tiền & Hoạch định Ngân sách", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-15", slug: "bsl-15-venture-capital", order: 15, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Venture Capital & Private Equity", titleVi: "Quỹ Đầu tư Mạo hiểm & Vốn Tư nhân", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-16", slug: "bsl-16-banking-credit", order: 16, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Commercial Banking & Credit Facilities", titleVi: "Tín dụng & Nghiệp vụ Ngân hàng Thương mại", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-17", slug: "bsl-17-hedging-derivatives", order: 17, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Derivatives, Hedging & FX Risk", titleVi: "Phái sinh, Phòng ngừa Rủi ro Tỷ giá", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-18", slug: "bsl-18-cost-accounting", order: 18, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Managerial & Cost Accounting", titleVi: "Kế toán Chi phí & Quản trị Nội bộ", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-19", slug: "bsl-19-fintech-payments", order: 19, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Fintech, Digital Payments & Blockchain", titleVi: "Fintech & Cổng Thanh toán Điện tử", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-20", slug: "bsl-20-valuation-ipo", order: 20, sector: "FINANCE", sectorLabel: "Tài chính & Kế toán", title: "Business Valuation & Initial Public Offering", titleVi: "Định giá Doanh nghiệp & Niêm yết IPO", cardsCount: 34, estMinutes: 12 },

  // Sector 3: Marketing & Sales (10 Decks x 34 cards = 340 words)
  { id: "bsl-21", slug: "bsl-21-brand-strategy", order: 21, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "Brand Identity & Market Positioning", titleVi: "Định vị Thương hiệu & Nhận diện Thị trường", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-22", slug: "bsl-22-digital-performance", order: 22, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "SEO, SEM & Growth Marketing", titleVi: "Tiếp thị Kỹ thuật số & Tăng trưởng Số", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-23", slug: "bsl-23-customer-retention", order: 23, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "Customer Lifetime Value & Churn", titleVi: "Vòng đời Khách hàng & Tỷ lệ Rời bỏ", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-24", slug: "bsl-24-b2b-sales-funnel", order: 24, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "B2B Sales Pipeline & Enterprise Accounts", titleVi: "Kênh Bán hàng B2B & Khách hàng Lớn", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-25", slug: "bsl-25-market-research", order: 25, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "Consumer Insights & Market Segmentation", titleVi: "Thấu cảm Khách hàng & Phân khúc Thị trường", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-26", slug: "bsl-26-product-marketing", order: 26, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "Go-to-Market & Launch Execution", titleVi: "Chiến lược Tung Sản phẩm Go-to-Market", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-27", slug: "bsl-27-pricing-strategy", order: 27, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "SaaS Monetization & Pricing Models", titleVi: "Định giá Sản phẩm & Mô hình Doanh thu", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-28", slug: "bsl-28-public-relations", order: 28, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "Media Relations & Corporate Communications", titleVi: "Quan hệ Báo chí & Truyền thông Doanh nghiệp", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-29", slug: "bsl-29-ecommerce-conversion", order: 29, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "Omnichannel Retailing & Conversion Rate", titleVi: "Bán lẻ Đa kênh & Tối ưu Tỷ lệ Chuyển đổi", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-30", slug: "bsl-30-partnership-alliances", order: 30, sector: "MARKETING", sectorLabel: "Marketing & Bán hàng", title: "Strategic Partnerships & Affiliates", titleVi: "Đối tác Chiến lược & Tiếp thị Liên kết", cardsCount: 34, estMinutes: 12 },

  // Sector 4: HR & People Operations (10 Decks x 34 cards = 340 words)
  { id: "bsl-31", slug: "bsl-31-talent-acquisition", order: 31, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Recruitment & Talent Sourcing", titleVi: "Săn đầu người & Thu hút Nhân tài", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-32", slug: "bsl-32-performance-appraisal", order: 32, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "KPIs, 360 Reviews & Performance Appraisal", titleVi: "Đánh giá Hiệu suất 360 & KPIs", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-33", slug: "bsl-33-compensation-benefits", order: 33, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Compensation, ESOP & Employee Benefits", titleVi: "Lương thưởng, Cổ phiếu ESOP & Phúc lợi", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-34", slug: "bsl-34-learning-development", order: 34, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Upskilling, Training & Leadership Development", titleVi: "Đào tạo Nội bộ & Phát triển Năng lực Lãnh đạo", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-35", slug: "bsl-35-employee-engagement", order: 35, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Workplace Well-being & Company Culture", titleVi: "Sự Gắn kết Nhân viên & Văn hóa Doanh nghiệp", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-36", slug: "bsl-36-labor-relations", order: 36, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Employment Law & Labor Contracts", titleVi: "Luật Lao động & Hợp đồng Nhân sự", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-37", slug: "bsl-37-diversity-inclusion", order: 37, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Diversity, Equity & Belonging (DEI)", titleVi: "Đa dạng, Công bằng & Hòa nhập (DEI)", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-38", slug: "bsl-38-remote-workforce", order: 38, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Hybrid Workplace & Global Remote Teams", titleVi: "Làm việc Lai (Hybrid) & Đội ngũ Toàn cầu", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-39", slug: "bsl-39-succession-planning", order: 39, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Succession Planning & Talent Pipelines", titleVi: "Quy hoạch Đội ngũ Kế thừa", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-40", slug: "bsl-40-organizational-design", order: 40, sector: "HR", sectorLabel: "Nhân sự & Tuyển dụng", title: "Restructuring & Workplace Downsizing", titleVi: "Tái cơ cấu Tổ chức & Tối ưu Định biên", cardsCount: 34, estMinutes: 12 },

  // Sector 5: Operations & Logistics (10 Decks x 34 cards = 340 words)
  { id: "bsl-41", slug: "bsl-41-supply-chain", order: 41, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Global Supply Chain Management", titleVi: "Quản trị Chuỗi Cung ứng Toàn cầu", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-42", slug: "bsl-42-procurement-vendor", order: 42, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Procurement & Vendor Sourcing", titleVi: "Nghiệp vụ Thu mua & Đấu thầu Nhà cung cấp", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-43", slug: "bsl-43-inventory-warehouse", order: 43, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Warehousing, Freight & Just-In-Time", titleVi: "Kho bãi, Vận tải & Tồn kho Tối ưu JIT", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-44", slug: "bsl-44-quality-assurance", order: 44, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Six Sigma & Total Quality Management", titleVi: "Quản lý Chất lượng Six Sigma & Tiêu chuẩn ISO", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-45", slug: "bsl-45-customs-trade", order: 45, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Incoterms, Customs & Cross-border Tariffs", titleVi: "Incoterms, Thủ tục Hải quan & Thuế quan", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-46", slug: "bsl-46-manufacturing-lean", order: 46, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Lean Manufacturing & Automation", titleVi: "Sản xuất Tinh gọn & Dây chuyền Tự động", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-47", slug: "bsl-47-facilities-energy", order: 47, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Facilities Management & Energy Efficiency", titleVi: "Quản lý Tòa nhà & Tiết kiệm Năng lượng", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-48", slug: "bsl-48-business-continuity", order: 48, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Business Continuity & Disaster Recovery", titleVi: "Kế hoạch Duy trì Vận hành Liên tục", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-49", slug: "bsl-49-enterprise-erp", order: 49, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "ERP Systems & Cloud Operations", titleVi: "Hệ thống ERP & Vận hành Đám mây", cardsCount: 34, estMinutes: 12 },
  { id: "bsl-50", slug: "bsl-50-sustainable-logistics", order: 50, sector: "OPERATIONS", sectorLabel: "Vận hành & Chuỗi cung ứng", title: "Green Logistics & Circular Economy", titleVi: "Logistics Xanh & Kinh tế Tuần hoàn", cardsCount: 34, estMinutes: 12 },
];

export const getBslDecksBySector = (sector: "ALL" | "MANAGEMENT" | "FINANCE" | "MARKETING" | "HR" | "OPERATIONS"): BusinessDeckSummary[] =>
  sector === "ALL" ? BSL_50_DECKS_CATALOG : BSL_50_DECKS_CATALOG.filter((d) => d.sector === sector);

export const getTotalBslWordsCount = (): number =>
  BSL_50_DECKS_CATALOG.reduce((acc, d) => acc + d.cardsCount, 0);
