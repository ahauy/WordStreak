# Requirement Traceability Matrix (RTM): Speech Recognition & Pronunciation Assessment

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Document Version**: 1.0
- **Date**: 2026-08-21
- **Status**: PASSED

---

## 1. Traceability Matrix Table

| Business Goal / Value                                    | Business Rule (BR) / Upstream Item                | System Requirement (REQ)                                  | User Story (US) | Acceptance Criteria Scenario | Verification / Test Method           |
| -------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------- | --------------- | ---------------------------- | ------------------------------------ |
| **Interactive Oral Recall & Real-Time Voice Assessment** | `BR-VOICE-001`, `ASM-VOICE-001`, `GAP-FUNC-02`    | `REQ-VOICE-001`: Web Speech Engine Init                   | `US-VOICE-01`   | Scenario 1, 4                | Unit & E2E (WebSpeech Mock)          |
| **Acoustic Confidence & Real-Time Feedback**             | `BR-VOICE-013`, `GAP-FUNC-01`                     | `REQ-VOICE-002`: Volume Meter & Visualizer                | `US-VOICE-01`   | Scenario 1                   | Visual Regression & Canvas Test      |
| **Phonetic Scoring & Mispronunciation Detection**        | `BR-VOICE-002`, `ASM-VOICE-003`, `GAP-FUNC-03`    | `REQ-VOICE-003`: Similarity Scoring Engine                | `US-VOICE-01`   | Scenario 1, 2, 3             | Unit Test (Levenshtein matrix suite) |
| **Encouraging Feedback & Error Diagnosis**               | `BR-VOICE-003`, `BR-VOICE-004`                    | `REQ-VOICE-004`: Result Classification & Badges           | `US-VOICE-01`   | Scenario 1, 2, 3             | Component Integration & A11y Test    |
| **Retention & Habit Motivation via Gamified XP**         | `BR-VOICE-005`, `BR-VOICE-006`, `BR-VOICE-015`    | `REQ-VOICE-005`: XP Awarding & Daily Cap                  | `US-VOICE-01`   | Scenario 1, 2, 8             | Integration & Anti-Abuse Test        |
| **Dual-Accent Distinction (US vs UK)**                   | `BR-VOICE-007`, `ASM-VOICE-006`, `GAP-FUNC-04`    | `REQ-VOICE-006`: Dual-Accent Native Audio Player          | `US-VOICE-02`   | Scenario 1                   | Audio Element & CDN Network Test     |
| **Comprehension of Fast Speech via 0.75x Speed**         | `BR-VOICE-009`, `ASM-VOICE-007`, `GAP-FUNC-04`    | `REQ-VOICE-007`: Slow Playback with Preserved Pitch       | `US-VOICE-02`   | Scenario 2                   | Audio Rate & Pitch Property Test     |
| **Unbroken Audio Resilience via Speech Synthesis**       | `BR-VOICE-008`, `ASM-VOICE-008`                   | `REQ-VOICE-008`: Web Speech Synthesis Fallback            | `US-VOICE-02`   | Scenario 4                   | Network Interception (404 Sim) Test  |
| **Phonetic Dissection of Complex Words**                 | `BR-VOICE-010`, `GAP-FUNC-05`                     | `REQ-VOICE-009`: Interactive IPA Syllable Segmentation    | `US-VOICE-02`   | Scenario 3                   | Regex Tokenizer & Interaction Test   |
| **Frictionless Onboarding & Unblock Guidance**           | `BR-VOICE-011`, `RISK-VOICE-002`                  | `REQ-VOICE-010`: Permission State & Unblock Card          | `US-VOICE-01`   | Scenario 4, 5                | Browser Permission Mock Test         |
| **Zero-Crash Cross-Browser Reliability**                 | `ASM-VOICE-009`, `RISK-VOICE-001`                 | `REQ-VOICE-011`: Unsupported Browser Graceful Degradation | `US-VOICE-01`   | Scenario 7                   | Cross-Browser Matrix Test            |
| **Timeout & Battery Safety Watchdogs**                   | `BR-VOICE-014`                                    | `REQ-VOICE-012`: Silence & Max Utterance Watchdogs        | `US-VOICE-01`   | Scenario 6                   | Timer & Mock Audio Stream Test       |
| **Multisensory Audio Feedback Chimes**                   | `BR-VOICE-003`, `GAP-UX-03`                       | `REQ-VOICE-013`: Auditory Feedback Chimes                 | `US-VOICE-01`   | Scenario 1, 2, 3             | Web Audio Oscillator Synth Test      |
| **Zero Server Audio Privacy Guarantee**                  | `BR-VOICE-012`, `ASM-VOICE-002`, `RISK-VOICE-006` | `REQ-VOICE-014`: Privacy & Ephemeral Audio Processing     | `US-VOICE-01`   | Scenario 1, 4                | Network Inspection & Privacy Audit   |

---

## 2. Traceability Health Summary

- **Total Business Goals Mapped**: 14/14 ($100\%$)
- **Total System Requirements (REQ)**: 14/14 ($100\%$ mapped to BRs and User Stories)
- **Total User Stories (US)**: 2/2 ($100\%$ with testable Given-When-Then scenarios)
- **Unlinked / Orphan Requirements**: 0
- **Traceability Gaps**: 0 (Complete unbroken lineage)
