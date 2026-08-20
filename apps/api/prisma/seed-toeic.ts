import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:23012005@localhost:5432/wordstreak_db?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ToeicWordItem {
  word: string;
  phonetic: string;
  meaning: string;
  exampleSentence: string;
  collocations: string;
  mnemonic: string;
  audioUrl?: string;
}

const toeicWords: ToeicWordItem[] = [
  {
    word: 'accommodate',
    phonetic: '/əˈkɑː.mə.deɪt/',
    meaning: 'Đáp ứng nhu cầu / cung cấp chỗ ở / chứa được',
    exampleSentence:
      'The conference hall can accommodate up to 500 delegates comfortably.',
    collocations:
      'accommodate a request, accommodate the needs, accommodate passengers',
    mnemonic: 'Ac-com-modate: Có chỗ ở (mode) tiện nghi để đáp ứng mọi nhu cầu',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=accommodate&type=2',
  },
  {
    word: 'acquire',
    phonetic: '/əˈkwaɪər/',
    meaning: 'Mua lại, thâu tóm (công ty) / đạt được, thu nạp (kỹ năng)',
    exampleSentence:
      'The tech corporation announced plans to acquire a European logistics startup.',
    collocations: 'acquire a company, acquire skills, newly acquired asset',
    mnemonic: 'Ac-quire: Yêu cầu (quire) mua lại toàn bộ cổ phần đối thủ',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=acquire&type=2',
  },
  {
    word: 'adjourn',
    phonetic: '/əˈdʒɜːrn/',
    meaning: 'Hoãn lại, tạm ngừng cuộc họp sang một thời điểm khác',
    exampleSentence:
      'The board of directors decided to adjourn the annual meeting until next Friday.',
    collocations: 'adjourn a meeting, adjourn until tomorrow, court adjourned',
    mnemonic: 'Ad-journ: Hành trình (journey) cuộc họp tạm hoãn đến tuần sau',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=adjourn&type=2',
  },
  {
    word: 'agenda',
    phonetic: '/əˈdʒen.də/',
    meaning: 'Chương trình nghị sự, danh sách các mục thảo luận trong cuộc họp',
    exampleSentence:
      'The marketing budget allocation is the first item on today’s meeting agenda.',
    collocations: 'on the agenda, set the agenda, hidden agenda',
    mnemonic: 'A-gen-da: Agent cần một danh sách kế hoạch nghị sự rõ ràng',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=agenda&type=2',
  },
  {
    word: 'allocate',
    phonetic: '/ˈæl.ə.keɪt/',
    meaning: 'Phân bổ, chỉ định ngân sách hoặc nguồn lực cho mục đích cụ thể',
    exampleSentence:
      'Management has agreed to allocate $200,000 for digital advertising campaigns.',
    collocations: 'allocate resources, allocate funds, allocate budget',
    mnemonic: 'Al-locate: Định vị (locate) xem tiền và nhân sự phân bổ về đâu',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=allocate&type=2',
  },
  {
    word: 'amend',
    phonetic: '/əˈmend/',
    meaning: 'Sửa đổi, bổ sung, điều chỉnh văn bản hoặc điều khoản hợp đồng',
    exampleSentence:
      'Both legal parties met yesterday to amend the terms of the service agreement.',
    collocations: 'amend a contract, amend legislation, amend the policy',
    mnemonic: 'A-mend: Mang đi sửa (mend) lại các điều khoản chưa hợp lý',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=amend&type=2',
  },
  {
    word: 'appraisal',
    phonetic: '/əˈpreɪ.zəl/',
    meaning: 'Sự đánh giá, thẩm định năng lực nhân viên hoặc giá trị tài sản',
    exampleSentence:
      'Employees with outstanding performance appraisals will receive a year-end bonus.',
    collocations: 'performance appraisal, annual appraisal, property appraisal',
    mnemonic: 'Ap-praise-al: Được khen ngợi (praise) sau kỳ đánh giá hiệu suất',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=appraisal&type=2',
  },
  {
    word: 'assemble',
    phonetic: '/əˈsem.bəl/',
    meaning: 'Lắp ráp chi tiết thành sản phẩm / tập hợp nhân sự lại',
    exampleSentence:
      'The manufacturing team can assemble approximately 100 smartphones per hour.',
    collocations:
      'assembly line, assemble components, assemble in the auditorium',
    mnemonic:
      'As-semble: Tập hợp lại với nhau giống biệt đội Avengers Assemble',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=assemble&type=2',
  },
  {
    word: 'audit',
    phonetic: '/ˈɔː.dɪt/',
    meaning: 'Sự kiểm toán, cuộc kiểm tra tài chính sổ sách kế toán',
    exampleSentence:
      'An external accounting firm will conduct a thorough financial audit next quarter.',
    collocations: 'financial audit, internal audit, conduct an audit',
    mnemonic:
      'Au-dit: Kiểm tra âm thanh (audio) và sổ sách xem có gì bất minh không',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=audit&type=2',
  },
  {
    word: 'authorize',
    phonetic: '/ˈɔː.θər.aɪz/',
    meaning: 'Ủy quyền, cấp quyền hoặc phê duyệt chính thức bằng văn bản',
    exampleSentence:
      'Only department managers are authorized to sign high-value expense invoices.',
    collocations: 'authorized personnel, authorize a payment, authorize access',
    mnemonic: 'Author-ize: Tác giả chính thức ký tên ủy quyền cho cấp dưới',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=authorize&type=2',
  },
  {
    word: 'bid',
    phonetic: '/bɪd/',
    meaning: 'Hồ sơ đấu thầu / giá dự thầu trong thương mại',
    exampleSentence:
      'Our construction firm submitted the lowest bid for the bridge development project.',
    collocations: 'submit a bid, win a bid, competitive bidding',
    mnemonic: 'Bid: Đưa ra giá đấu thầu để giành lấy dự án',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=bid&type=2',
  },
  {
    word: 'breach',
    phonetic: '/briːtʃ/',
    meaning: 'Sự vi phạm (hợp đồng, thỏa thuận bảo mật hoặc dữ liệu)',
    exampleSentence:
      'Failing to deliver goods on schedule will be considered a serious breach of contract.',
    collocations:
      'breach of contract, security breach, breach of confidentiality',
    mnemonic: 'Breach -> Bị rách, làm vỡ lời hứa trong hợp đồng',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=breach&type=2',
  },
  {
    word: 'candidate',
    phonetic: '/ˈkæn.dɪ.dət/',
    meaning: 'Ứng viên dự tuyển việc làm hoặc chức vụ',
    exampleSentence:
      'The human resources committee interviewed four qualified candidates for the director role.',
    collocations:
      'prospective candidate, ideal candidate, shortlisted candidate',
    mnemonic:
      'Can-did-ate: Người ứng viên có thể làm mọi việc một cách chân thành (candid)',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=candidate&type=2',
  },
  {
    word: 'collaborate',
    phonetic: '/kəˈlæb.ə.reɪt/',
    meaning: 'Hợp tác, làm việc chung với đối tác hoặc đồng nghiệp',
    exampleSentence:
      'Our design department collaborated with external consultants on the new branding.',
    collocations:
      'collaborate with colleagues, collaborate on a project, closely collaborate',
    mnemonic: 'Co-labor-ate: Cùng nhau lao động (labor) và làm việc nhóm',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=collaborate&type=2',
  },
  {
    word: 'commence',
    phonetic: '/kəˈmens/',
    meaning:
      'Bắt đầu, khởi động một sự kiện, dự án hoặc phiên họp (trang trọng)',
    exampleSentence:
      'Renovation work on the main office lobby will commence early next Monday.',
    collocations: 'commence operations, commence work, ceremony commences',
    mnemonic: 'Com-mence: Comment bắt đầu cuộc họp trang trọng',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=commence&type=2',
  },
  {
    word: 'compensate',
    phonetic: '/ˈkɑːm.pən.seɪt/',
    meaning: 'Đền bù, bồi thường thiệt hại / trả thù lao lao động xứng đáng',
    exampleSentence:
      'The airline offered to compensate passengers whose flights were delayed over 6 hours.',
    collocations:
      'compensate for damages, fully compensated, compensation package',
    mnemonic: 'Com-pen-sate: Bồi thường tiền mặt (penny) cho khách hàng',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=compensate&type=2',
  },
  {
    word: 'comply',
    phonetic: '/kəmˈplaɪ/',
    meaning: 'Tuân thủ, chấp hành theo đúng quy định pháp luật hoặc tiêu chuẩn',
    exampleSentence:
      'All chemical manufacturing facilities must strictly comply with national safety regulations.',
    collocations:
      'comply with regulations, comply with standards, fail to comply',
    mnemonic: 'Com-ply: Chấp hành nghiêm túc theo chính sách (policy)',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=comply&type=2',
  },
  {
    word: 'confidential',
    phonetic: '/ˌkɑːn.fəˈden.ʃəl/',
    meaning: 'Bảo mật, bí mật không được tiết lộ ra bên ngoài',
    exampleSentence:
      'Client financial records must remain strictly confidential at all times.',
    collocations:
      'strictly confidential, confidential document, confidential information',
    mnemonic: 'Confidence: Tự tin gửi tài liệu tuyệt mật cho người tin cậy',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=confidential&type=2',
  },
  {
    word: 'consecutive',
    phonetic: '/kənˈsek.jə.tɪv/',
    meaning: 'Liên tiếp, liền nhau không ngắt quãng',
    exampleSentence:
      'The regional retail store reported strong sales growth for five consecutive quarters.',
    collocations: 'consecutive days, consecutive years, consecutive quarters',
    mnemonic: 'Con-sequence: Chuỗi ngày diễn ra liên tiếp không ngừng nghỉ',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=consecutive&type=2',
  },
  {
    word: 'delegate',
    phonetic: '/ˈdel.ə.ɡeɪt/',
    meaning: 'Ủy quyền, giao phó trách nhiệm / đại biểu tham dự hội nghị',
    exampleSentence:
      'Effective team leaders know how to delegate routine tasks to capable subordinates.',
    collocations:
      'delegate authority, delegate responsibilities, conference delegates',
    mnemonic: 'De-legate: Giao chìa khóa cổng (gate) quyền lực cho cấp phó',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=delegate&type=2',
  },
  {
    word: 'demographic',
    phonetic: '/ˌdem.əˈɡræf.ɪk/',
    meaning:
      'Nhân khẩu học, nhóm đối tượng khách hàng mục tiêu theo độ tuổi, vị trí',
    exampleSentence:
      'Our new marketing strategy is tailored specifically toward the young adult demographic.',
    collocations: 'target demographic, demographic data, demographic trends',
    mnemonic: 'Demo-graphic: Biểu đồ thể hiện cơ cấu khách hàng',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=demographic&type=2',
  },
  {
    word: 'designate',
    phonetic: '/ˈdez.ɪɡ.neɪt/',
    meaning: 'Chỉ định, bổ nhiệm chức vụ / chọn một khu vực dành riêng',
    exampleSentence:
      'Mr. Tanaka was designated as the chief coordinator for the overseas expansion project.',
    collocations:
      'designated area, designate a successor, designated parking space',
    mnemonic: 'Design-ate: Thiết kế và chỉ định vị trí cho từng người',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=designate&type=2',
  },
  {
    word: 'discrepancy',
    phonetic: '/dɪˈskrep.ən.si/',
    meaning: 'Sự khác biệt, sai lệch số liệu giữa các chứng từ kế toán',
    exampleSentence:
      'The financial auditor found a significant discrepancy between the receipts and bank statements.',
    collocations:
      'discrepancy between, resolve a discrepancy, unexplained discrepancy',
    mnemonic: 'Dis-crepancy: Sự sai lệch làm cho báo cáo kế toán bị nghi ngờ',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=discrepancy&type=2',
  },
  {
    word: 'eligible',
    phonetic: '/ˈel.ə.dʒə.bəl/',
    meaning: 'Đủ điều kiện, có đủ tiêu chuẩn để nhận quyền lợi hoặc ứng tuyển',
    exampleSentence:
      'Full-time staff who complete six months of service are eligible for health insurance benefits.',
    collocations: 'eligible for a refund, eligible to vote, eligible candidate',
    mnemonic: 'E-ligible: Có thể chọn lựa (elect) vì đã đủ mọi tiêu chuẩn',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=eligible&type=2',
  },
  {
    word: 'endorse',
    phonetic: '/ɪnˈdɔːrs/',
    meaning: 'Tán thành, ủng hộ công khai / quảng cáo bảo chứng sản phẩm',
    exampleSentence:
      'The famous professional athlete signed a million-dollar contract to endorse the athletic brand.',
    collocations: 'endorse a product, publicly endorse, endorse a proposal',
    mnemonic: 'En-door-se: Mở cửa đón nhận và ủng hộ nhiệt tình',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=endorse&type=2',
  },
  {
    word: 'evaluate',
    phonetic: '/ɪˈvæl.ju.eɪt/',
    meaning: 'Đánh giá, ước lượng giá trị hoặc hiệu quả công việc',
    exampleSentence:
      'The procurement committee will evaluate all vendor proposals before making a final selection.',
    collocations: 'evaluate performance, evaluate options, evaluate risk',
    mnemonic: 'E-value-ate: Tìm ra giá trị (value) cốt lõi của giải pháp',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=evaluate&type=2',
  },
  {
    word: 'expedite',
    phonetic: '/ˈek.spə.daɪt/',
    meaning: 'Xúc tiến, đẩy nhanh tiến độ giao hàng hoặc xử lý hồ sơ',
    exampleSentence:
      'Customers can pay an additional fee to expedite delivery of their international orders.',
    collocations: 'expedite the process, expedite shipping, expedite delivery',
    mnemonic: 'Ex-pedite: Tăng tốc (pedal) đạp ga cho hàng đến sớm',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=expedite&type=2',
  },
  {
    word: 'feasible',
    phonetic: '/ˈfiː.zə.bəl/',
    meaning: 'Khả thi, có thể thực hiện được trong thực tế với chi phí hợp lý',
    exampleSentence:
      'The engineering feasibility study proved that building the subway extension was economically feasible.',
    collocations:
      'financially feasible, feasible solution, feasible alternative',
    mnemonic: 'Feas-ible: Mức phí (fee) hợp lý nên dự án rất khả thi',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=feasible&type=2',
  },
  {
    word: 'fluctuate',
    phonetic: '/ˈflʌk.tʃu.eɪt/',
    meaning: 'Dao động, biến động lên xuống (giá cả, thị trường, nhiệt độ)',
    exampleSentence:
      'Foreign currency exchange rates fluctuate continuously based on global economic indicators.',
    collocations: 'fluctuate wildly, fluctuate between, prices fluctuate',
    mnemonic: 'Fluctuate: Giống như làn sóng biển nhấp nhô lên xuống',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=fluctuate&type=2',
  },
  {
    word: 'implement',
    phonetic: '/ˈɪm.plə.ment/',
    meaning: 'Thực thi, áp dụng, triển khai một chính sách hoặc công nghệ mới',
    exampleSentence:
      'Our company plans to implement a cloud-based CRM system across all regional branches.',
    collocations: 'implement a policy, implement changes, implement a plan',
    mnemonic: 'Im-plement: Dùng công cụ (implement) để thi công kế hoạch',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=implement&type=2',
  },
  {
    word: 'incentive',
    phonetic: '/ɪnˈsen.tɪv/',
    meaning:
      'Sự khuyến khích, ưu đãi hoặc tiền thưởng kích thích tinh thần làm việc',
    exampleSentence:
      'The sales compensation structure includes generous quarterly financial incentives for top performers.',
    collocations: 'financial incentive, tax incentive, incentive program',
    mnemonic: 'In-cent-ive: Thêm xu (cent) vào lương để khích lệ nhân viên',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=incentive&type=2',
  },
  {
    word: 'inventory',
    phonetic: '/ˈɪn.vən.tɔːr.i/',
    meaning: 'Hàng tồn kho, bản kê khai hàng hóa lưu giữ trong kho',
    exampleSentence:
      'The retail warehouse will close this weekend to conduct its semi-annual inventory check.',
    collocations: 'inventory control, take inventory, excess inventory',
    mnemonic: 'In-vent-ory: Hàng hóa được phát minh (invent) lưu giữ trong kho',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=inventory&type=2',
  },
  {
    word: 'invoice',
    phonetic: '/ˈɪn.vɔɪs/',
    meaning: 'Hóa đơn đòi tiền, bảng kê chi tiết dịch vụ thanh toán',
    exampleSentence:
      'Please review and approve the attached invoice so our finance team can process the wire transfer.',
    collocations: 'issue an invoice, pay an invoice, tax invoice',
    mnemonic: 'In-voice: Giọng nói (voice) yêu cầu thanh toán chi phí',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=invoice&type=2',
  },
  {
    word: 'lucrative',
    phonetic: '/ˈluː.krə.tɪv/',
    meaning: 'Sinh lời lớn, đem lại lợi nhuận cao (hợp đồng, thương vụ)',
    exampleSentence:
      'Exporting premium coffee to North America turned out to be a highly lucrative business deal.',
    collocations: 'lucrative contract, lucrative market, lucrative business',
    mnemonic: 'Lu-cra-tive: May mắn (luck) làm ăn sinh lời bạc tỷ',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=lucrative&type=2',
  },
  {
    word: 'mandatory',
    phonetic: '/ˈmæn.də.tɔːr.i/',
    meaning: 'Bắt buộc, mang tính bắt buộc theo quy định hoặc luật lệ',
    exampleSentence:
      'Attendance at the annual cybersecurity compliance seminar is mandatory for all employees.',
    collocations:
      'mandatory training, mandatory requirement, mandatory attendance',
    mnemonic: 'Man-date: Ngày lệnh của cấp trên bắt buộc phải tuân theo',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=mandatory&type=2',
  },
  {
    word: 'negotiate',
    phonetic: '/nəˈɡoʊ.ʃi.eɪt/',
    meaning: 'Đàm phán, thương lượng các điều khoản hợp đồng hoặc giá cả',
    exampleSentence:
      'The purchasing manager was able to negotiate a 15% discount for bulk equipment orders.',
    collocations: 'negotiate a deal, negotiate terms, negotiate a contract',
    mnemonic: 'Ne-go-tiate: Đến bàn đàm phán để thỏa thuận giá tốt',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=negotiate&type=2',
  },
  {
    word: 'obligation',
    phonetic: '/ˌɑːb.ləˈɡeɪ.ʃən/',
    meaning: 'Nghĩa vụ, bổn phận có tính ràng buộc pháp lý hoặc đạo đức',
    exampleSentence:
      'The vendor has a legal obligation to replace any defective machinery within thirty days.',
    collocations:
      'legal obligation, financial obligation, fulfill an obligation',
    mnemonic: 'Oblige: Buộc lòng phải thực hiện nghĩa vụ đã ký',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=obligation&type=2',
  },
  {
    word: 'oversee',
    phonetic: '/ˌoʊ.vɚˈsiː/',
    meaning: 'Giám sát, bao quát, quản lý công việc và tiến độ của nhóm',
    exampleSentence:
      'A senior operations director was appointed to oversee the nationwide logistics network.',
    collocations: 'oversee a project, oversee operations, oversee production',
    mnemonic: 'Over-see: Đứng từ trên cao nhìn xuống (see over) để giám sát',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=oversee&type=2',
  },
  {
    word: 'penalty',
    phonetic: '/ˈpen.əl.ti/',
    meaning:
      'Khoản tiền phạt, hình phạt do vi phạm quy định hoặc chậm hợp đồng',
    exampleSentence:
      'The rental agreement specifies a hefty late-payment penalty if rent is overdue by five days.',
    collocations: 'late penalty, pay a penalty, penalty fee',
    mnemonic: 'Pen-alty: Mất tiền bạc vì bị xử phạt',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=penalty&type=2',
  },
  {
    word: 'prerequisite',
    phonetic: '/priːˈrek.wə.zɪt/',
    meaning: 'Điều kiện tiên quyết, yêu cầu bắt buộc phải có trước',
    exampleSentence:
      'Passing the basic accounting assessment is a prerequisite for enrolling in advanced financial modeling.',
    collocations:
      'prerequisite for, prerequisite course, essential prerequisite',
    mnemonic:
      'Pre-requisite: Yêu cầu (require) bắt buộc phải có từ trước (pre)',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=prerequisite&type=2',
  },
  {
    word: 'prospective',
    phonetic: '/prəˈspek.tɪv/',
    meaning: 'Có triển vọng, tiềm năng trong tương lai (khách hàng, ứng viên)',
    exampleSentence:
      'Our sales team distributed product catalogs to prospective buyers at the trade exhibition.',
    collocations: 'prospective client, prospective employee, prospective buyer',
    mnemonic: 'Prospect: Nhìn về tương lai với viễn cảnh đầy triển vọng',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=prospective&type=2',
  },
  {
    word: 'reimburse',
    phonetic: '/ˌriː.ɪmˈbɝːs/',
    meaning:
      'Hoàn tiền, thanh toán lại các chi phí công tác mà nhân viên đã ứng trước',
    exampleSentence:
      'The accounting office will reimburse employees for authorized travel and lodging expenses.',
    collocations:
      'reimburse expenses, fully reimbursed, reimburse travel costs',
    mnemonic: 'Re-purse: Tiền được hoàn trả trở lại ví (purse)',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=reimburse&type=2',
  },
  {
    word: 'reluctant',
    phonetic: '/rɪˈlʌk.tənt/',
    meaning: 'Miễn cưỡng, ngần ngại, do dự khi đưa ra quyết định',
    exampleSentence:
      'Investors were reluctant to invest additional capital due to uncertain economic conditions.',
    collocations: 'reluctant to agree, reluctant to change, highly reluctant',
    mnemonic: 'Re-luctant: Lắc đầu ngần ngại không muốn làm',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=reluctant&type=2',
  },
  {
    word: 'revenue',
    phonetic: '/ˈrev.ə.nuː/',
    meaning: 'Doanh thu, tổng thu nhập thu về từ hoạt động kinh doanh',
    exampleSentence:
      'The software company generated over $50 million in annual subscription revenue.',
    collocations: 'annual revenue, generate revenue, revenue growth',
    mnemonic: 'Re-venue: Đại lộ (avenue) doanh thu tiền đổ về công ty',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=revenue&type=2',
  },
  {
    word: 'scrutinize',
    phonetic: '/ˈskruː.tən.aɪz/',
    meaning: 'Xem xét, soi xét kỹ lưỡng, rà soát từng chi tiết',
    exampleSentence:
      'The compliance committee will scrutinize every clause of the proposed merger agreement.',
    collocations:
      'carefully scrutinize, scrutinize the documents, closely scrutinize',
    mnemonic: 'Scrutinize: Soi kính lúp kiểm tra cẩn thận từng chi tiết',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=scrutinize&type=2',
  },
  {
    word: 'stipulate',
    phonetic: '/ˈstɪp.jə.leɪt/',
    meaning: 'Quy định, đặt thành điều khoản bắt buộc trong hợp đồng',
    exampleSentence:
      'The contract stipulations state that all delivery discrepancies must be reported within 48 hours.',
    collocations: 'stipulate that, contract stipulates, clearly stipulated',
    mnemonic: 'Stipulate: Ghi chú thành từng gạch đầu dòng điều khoản bắt buộc',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=stipulate&type=2',
  },
  {
    word: 'substantial',
    phonetic: '/səbˈstæn.ʃəl/',
    meaning: 'Đáng kể, to lớn, quan trọng về số lượng hoặc giá trị',
    exampleSentence:
      'The company achieved a substantial increase in quarterly profit thanks to streamlined operations.',
    collocations:
      'substantial increase, substantial amount, substantial difference',
    mnemonic: 'Substance: Có khối lượng và giá trị to lớn, đáng kể',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=substantial&type=2',
  },
  {
    word: 'tariff',
    phonetic: '/ˈter.ɪf/',
    meaning: 'Thuế quan, thuế nhập khẩu hoặc xuất khẩu hàng hóa',
    exampleSentence:
      'The government imposed new tariffs on imported electronic equipment to protect domestic makers.',
    collocations: 'impose tariffs, reduce tariffs, trade tariffs',
    mnemonic: 'Tariff: Biểu phí thuế quan đánh vào hàng hóa qua biên giới',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=tariff&type=2',
  },
  {
    word: 'unanimous',
    phonetic: '/juːˈnæn.ə.məs/',
    meaning: 'Nhất trí 100%, đồng thuận hoàn toàn từ tất cả thành viên',
    exampleSentence:
      'The board of trustees reached a unanimous decision to appoint the new CEO.',
    collocations: 'unanimous decision, unanimous vote, unanimous agreement',
    mnemonic:
      'Uni-animal: Mọi người đoàn kết làm một (uni) cùng đồng lòng 100%',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=unanimous&type=2',
  },
  {
    word: 'warranty',
    phonetic: '/ˈwɔːr.ən.ti/',
    meaning: 'Giấy cam kết bảo hành sản phẩm trong thời gian nhất định',
    exampleSentence:
      'All office computers come with a three-year manufacturer warranty covering parts and labor.',
    collocations: 'under warranty, extended warranty, warranty period',
    mnemonic: 'Warrant: Lệnh cam kết bảo hành miễn phí khi gặp sự cố',
    audioUrl: 'https://dict.youdao.com/dictvoice?audio=warranty&type=2',
  },
];

async function main() {
  console.log(`Starting to seed 50 high-frequency TOEIC vocabulary cards...`);

  // Find all users in DB
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log('No user found in DB. Creating a default demo learner...');
    const demoUser = await prisma.user.create({
      data: {
        username: 'toeic_learner',
        email: 'learner@wordstreak.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$demo$demo',
        dailyGoal: 20,
      },
    });
    users.push(demoUser);
  }

  for (const user of users) {
    console.log(`Processing for user: ${user.username} (${user.id})`);

    // Check or create TOEIC Deck
    let deck = await prisma.deck.findFirst({
      where: {
        userId: user.id,
        title: '50 Từ Vựng TOEIC Hay Gặp Nhất (Essential 600)',
      },
    });

    if (!deck) {
      deck = await prisma.deck.create({
        data: {
          userId: user.id,
          title: '50 Từ Vựng TOEIC Hay Gặp Nhất (Essential 600)',
          description:
            'Bộ 50 từ vựng cốt lõi thường xuyên xuất hiện nhất trong các đề thi TOEIC Listening & Reading (Part 5, 6, 7). Đầy đủ phiên âm IPA, ngữ cảnh công sở, ví dụ thực tế và mẹo nhớ.',
          color: '#8B5CF6', // Purple Cosmos theme
          icon: 'GraduationCap',
          tags: 'TOEIC,Business,Core,Grammar,Office',
          isPublic: true,
        },
      });
      console.log(
        `Created new TOEIC Deck: ${deck.id} for user ${user.username}`,
      );
    } else {
      console.log(
        `Using existing TOEIC Deck: ${deck.id} for user ${user.username}`,
      );
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of toeicWords) {
      const existingCard = await prisma.card.findFirst({
        where: {
          deckId: deck.id,
          word: item.word,
        },
      });

      if (!existingCard) {
        const createdCard = await prisma.card.create({
          data: {
            deckId: deck.id,
            word: item.word,
            meaning: item.meaning,
            phonetic: item.phonetic,
            exampleSentence: item.exampleSentence,
            collocations: item.collocations,
            mnemonic: item.mnemonic,
            audioUrl: item.audioUrl || null,
          },
        });

        // Initialize user card progress
        await prisma.userCardProgress.create({
          data: {
            userId: user.id,
            cardId: createdCard.id,
            status: 'NEW',
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            nextReviewDate: new Date(),
          },
        });

        insertedCount++;
      } else {
        // Update card context
        await prisma.card.update({
          where: { id: existingCard.id },
          data: {
            meaning: item.meaning,
            phonetic: item.phonetic,
            exampleSentence: item.exampleSentence,
            collocations: item.collocations,
            mnemonic: item.mnemonic,
            audioUrl: item.audioUrl || null,
          },
        });
        updatedCount++;
      }
    }

    console.log(
      `Finished for user ${user.username}: Inserted ${insertedCount} new cards, updated ${updatedCount} cards. Total: ${toeicWords.length} TOEIC cards in deck!`,
    );
  }
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
