# Traceability Matrix: Deck CRUD & Management (US-DECK-01)

- **Feature**: Deck CRUD & Management
- **Protocol**: Bounded Task
- **Date**: 2026-08-19

| Business Goal                                  | Business Rule / Assumption                                  | User Story                            | Acceptance Criteria Scenarios                                                           | Test Cases (Phase 5)                        |
| ---------------------------------------------- | ----------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phân loại từ vựng cá nhân hóa theo chủ đề      | `BR-DECK-001`, `BR-DECK-002`, `BR-DECK-003`, `ASM-DECK-004` | `US-DECK-001` (Tạo bộ từ mới)         | Scenario 1 (Preset Theme), Scenario 2 (Custom Hex/Cover), Scenario 3 (Validation error) | `TC-DECK-001`, `TC-DECK-002`, `TC-DECK-003` |
| Quản lý và theo dõi tiến độ tổng thể các bộ từ | `BR-DECK-004`, `BR-DECK-006`, `ASM-DECK-001`                | `US-DECK-002` (Xem, tìm kiếm, lọc)    | Scenario 1 (Stats & list), Scenario 2 (Search keyword), Scenario 3 (Empty state)        | `TC-DECK-004`, `TC-DECK-005`, `TC-DECK-006` |
| Linh hoạt cập nhật thông tin và quyền riêng tư | `BR-DECK-001`, `BR-DECK-002`, `BR-DECK-003`, `BR-DECK-005`  | `US-DECK-003` (Cập nhật thông tin)    | Scenario 1 (Update success), Scenario 2 (Forbidden access)                              | `TC-DECK-007`, `TC-DECK-008`                |
| Dọn dẹp danh sách học mà không mất dữ liệu thẻ | `BR-DECK-004`, `ASM-DECK-002`                               | `US-DECK-004` (Lưu trữ & Khôi phục)   | Scenario 1 (Archive deck), Scenario 2 (Restore deck)                                    | `TC-DECK-009`, `TC-DECK-010`                |
| Giải phóng bộ từ không dùng với cơ chế bảo vệ  | `BR-DECK-005`, `ASM-DECK-003`, `RISK-DECK-001`              | `US-DECK-005` (Xóa vĩnh viễn Cascade) | Scenario 1 (Cascade delete with warning)                                                | `TC-DECK-011`                               |
