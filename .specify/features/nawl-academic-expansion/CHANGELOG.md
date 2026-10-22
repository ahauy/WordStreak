# Changelog: NAWL 1.2 Import & Enrichment (US-LIB-13)

## [1.0.0] - 2026-10-22
### Added
- Đóng gói dữ liệu từ vựng học thuật NAWL 1.2 (New Academic Word List) phân bổ theo chủ đề và mục tiêu điểm IELTS (`nawlDecks.ts`).
- Component `AcademicPathSection` cho Thư viện (`/library`), hỗ trợ lọc theo Band mục tiêu (5.5 - 6.5, 6.5 - 7.5, 7.5+) và các chủ đề IELTS Writing/Reading.
- Trang Bản đồ Lộ trình IELTS Academic 32 Chặng (`IeltsAcademicPathPage.tsx`, `/paths/academic`, `/paths/ielts`) kèm thanh độ phủ NAWL 92%.
- Unit tests toàn diện cho dữ liệu và component (`nawlDecks.spec.ts`, `AcademicPathSection.spec.tsx`, `IeltsAcademicPathPage.spec.tsx`).
