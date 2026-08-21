# Requirement Traceability Matrix: AI-Assisted Vocabulary Generator

| Business Goal | REQ / BR | User Story | Acceptance Criteria Scenarios | Verification / Test Case |
| :--- | :--- | :--- | :--- | :--- |
| **Reduce card creation time by >90%** | REQ-AI-004, REQ-AI-005, BR-AI-005, BR-AI-007 | US-AI-01 | Scenario 1 (Uncached generation), Scenario 2 (Cached retrieval) | TC-AI-001, TC-AI-002, TC-AI-005 |
| **Cut AI API costs by 95% via shared caching** | REQ-AI-001, BR-AI-001, BR-AI-002, BR-AI-008 | US-AI-02 | Scenario 1 (Cache insertion & normalization) | TC-AI-002, TC-AI-003 |
| **High availability & graceful fallback** | REQ-AI-002, REQ-AI-006, BR-AI-006 | US-AI-01 | Scenario 3 (Free Dictionary fallback), Scenario 4 (Word not found) | TC-AI-004, TC-AI-006 |
| **Prevent API abuse & cost runaway** | REQ-AI-003, BR-AI-003, BR-AI-004 | US-AI-02 | Scenario 2 (Daily quota & burst limit enforcement) | TC-AI-007, TC-AI-008 |
| **Concurrency safety & zero data duplication** | REQ-AI-001, BR-AI-002 | US-AI-02 | Scenario 3 (Concurrent queries for same uncached word) | TC-AI-009 |
