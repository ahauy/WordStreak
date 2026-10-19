# Specification: US-LIB-04 & US-LIB-11 Goal-Oriented Onboarding & Adaptive Entry

> **Feature Slug:** `us-lib-04-goal-onboarding`  
> **Status:** Completed (v1.0 Done)  
> **Target Release:** Sprint 9 (Activation & Starter Library Soft Launch)  
> **Execution Tier:** Tier 2 (Deep-Track: Backend Schema + API & Frontend Modal)

---

## 1. Requirements & Acceptance Criteria

### 1.1 Business Context & Value
- **Problem:** New users arriving on WordStreak currently face a blank dashboard or must manually discover starter decks, leading to cognitive fatigue and drop-off before their first study session.
- **Solution:** A 60-second guided Onboarding Wizard that collects:
  1. Learning Goal (`TOEIC`, `IELTS`, `COMMUNICATION`, `WORK`).
  2. Starting Level / Assessment (`ZERO`, `BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
  3. Daily Goal (`5`, `10`, `20` words/day).
  The system automatically updates user preferences, marks onboarding as complete, and auto-enrolls the user into their first recommended Official Deck.

### 1.2 Acceptance Criteria (AC & REQ Mappings)
- **REQ-ONB-01 (Data Model):** The `User` model records `learningGoal` (string/enum), `startingLevel` (string/enum), and `onboardingCompleted` (boolean, default `false`).
- **REQ-ONB-02 (API Endpoint):** `PATCH /api/v1/users/onboarding` accepts `OnboardingDto`, validates payload, updates user record, auto-enrolls recommended `OfficialDeck`, and returns `OnboardingResponse`.
- **REQ-ONB-03 (Auto-Enrollment Logic):**
  - If `startingLevel === 'ZERO'` $\rightarrow$ Recommended path `FOUNDATION` or `CORE`.
  - If `learningGoal === 'TOEIC'` $\rightarrow$ Recommended path `TOEIC` (e.g. TSL level 1 deck).
  - If `learningGoal === 'IELTS'` $\rightarrow$ Recommended path `ACADEMIC` or `CORE`.
  - If `learningGoal === 'COMMUNICATION' | 'WORK'` $\rightarrow$ Recommended path `CORE` or `TOEIC`.
  - Creates record in `UserDeckEnrollment` if not already enrolled.
- **REQ-ONB-04 (Frontend Wizard):** 3-step modal appearing on first login when `onboardingCompleted === false`, adhering to `#ffffff` minimal canvas, hairline borders, Obsidian black pills (`#000000`, `rounded-full`), and zero AI slop.

---

## 2. Technical Contracts & Architecture

### 2.1 Shared Types (`@wordstreak/shared-types`)
```typescript
export type LearningGoal = "TOEIC" | "IELTS" | "COMMUNICATION" | "WORK";
export type StartingLevel = "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface OnboardingDto {
  learningGoal: LearningGoal;
  startingLevel: StartingLevel;
  dailyGoal?: number;
}

export interface OnboardingResponse {
  success: boolean;
  enrolledDeckId?: string;
  enrolledDeckTitle?: string;
  user: AuthUser;
}
```

### 2.2 Database Schema (`apps/api/prisma/schema.prisma`)
```prisma
model User {
  // Existing fields...
  learningGoal        String?
  startingLevel       String?
  onboardingCompleted Boolean  @default(false)
}
```

---

## 3. Test Cases (TC-###)
- **TC-ONB-001:** `PATCH /api/v1/users/onboarding` requires authentication (`JwtAuthGuard`). ✅
- **TC-ONB-002:** Validates invalid payload (e.g., missing `learningGoal` or invalid enum values) returning HTTP 400. ✅
- **TC-ONB-003:** Successfully updates user `learningGoal`, `startingLevel`, `dailyGoal`, and sets `onboardingCompleted: true`. ✅
- **TC-ONB-004:** Auto-enrolls user into matching `OfficialDeck` and prevents duplicate enrollment errors. ✅
- **TC-ONB-005:** Returns updated `AuthUser` object including new onboarding fields. ✅
- **TC-ONB-006:** `OnboardingWizard` renders conditionally based on `onboardingCompleted` status. ✅
- **TC-ONB-007:** Supports step-by-step navigation (Goal $\rightarrow$ Level $\rightarrow$ Daily Goal $\rightarrow$ Success). ✅
- **TC-ONB-008:** Submits onboarding payload to `userService.completeOnboarding` and updates auth state. ✅
- **TC-ONB-009:** Supports skip action allowing users to bypass modal without blocking navigation. ✅
