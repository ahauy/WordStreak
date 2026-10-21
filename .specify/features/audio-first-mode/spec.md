# Specification: Audio-First Mode & Vietnamese Ending Sound Tips

**Feature Slug:** `audio-first-mode`  
**User Story:** `US-LIB-14`  
**Sprint:** 10 (TSL Expansion, Retention & Learning Quality)  
**Status:** In Progress  

---

## 1. Requirements & Acceptance Criteria

### US-LIB-14: Chế độ Nghe trước (Audio-First) & Mẹo phát âm người Việt
> **As a** learner (especially in Beginner Mode or loss-of-foundation stage),  
> **I want** an Audio-First flashcard study mode and Vietnamese-specific pronunciation tips for ending sounds and stress syllables,  
> **So that** I develop an ear-first reflex without relying on printed text, avoiding the common Vietnamese error of swallowing word endings.

### Acceptance Criteria (REQ-AUDIO)
1. **REQ-AUDIO-001 (Audio-First Flashcard Face)**:
   - Front face hides English word text when Audio-First mode is active.
   - Shows prominent audio listen trigger with "Nghe và nhận diện từ" prompt and auto-plays pronunciation when card mounts.
2. **REQ-AUDIO-002 (Stress Syllable Breakdown)**:
   - Back face highlights the primary stress syllable (`stress_syllable` / `token.isPrimaryStress`) via `PhoneticWordBreakdown`.
3. **REQ-AUDIO-003 (Vietnamese Ending Sound Tips)**:
   - When card has `endingSoundTipVi`, back face renders an amber badge with Vietnamese guidance (e.g. for /s/, /z/, /t/, /d/, /k/, -ed, -s/-es endings).
4. **REQ-AUDIO-004 (Toggle & User Control)**:
   - Header provides an "Audio-First" toggle pill with keyboard shortcut or one-click activation.
