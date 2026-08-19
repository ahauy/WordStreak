# Traceability Matrix: Contextual Card Creation (US-CARD-01)

| Business Goal                            | BR / ASM ID               | User Story  | Acceptance Criteria Scenarios | Verification Test Target                                                      |
| :--------------------------------------- | :------------------------ | :---------- | :---------------------------- | :---------------------------------------------------------------------------- |
| **Rich Multi-modal Vocabulary Encoding** | BR-CARD-001, ASM-CARD-002 | US-CARD-001 | Scenario 1, Scenario 3        | Unit & Integration Test (`cards.controller.spec.ts`, `cards.service.spec.ts`) |
| **Atomic SM-2 Progress Initialization**  | BR-CARD-003, ASM-CARD-003 | US-CARD-001 | Scenario 1                    | Integration Test (`UserCardProgress` created in `NEW` state)                  |
| **Streamlined Continuous Entry UX**      | BR-CARD-001               | US-CARD-001 | Scenario 2                    | React Testing Library component test (`AddCardModal.spec.tsx`)                |
| **Duplicate Word Prevention & Guidance** | BR-CARD-004, ASM-CARD-004 | US-CARD-001 | Scenario 4                    | React Testing Library component test (`AddCardModal.spec.tsx`)                |
| **Deck Isolation & Ownership Security**  | BR-CARD-002, ASM-CARD-001 | US-CARD-001 | Scenario 5                    | Controller & Service Guard Test (`404/403` on non-owned deck)                 |
| **Interactive 3D Live Card Preview**     | BR-CARD-005, ASM-CARD-005 | US-CARD-002 | Scenario 1                    | React Component test (`CardPreview.spec.tsx`)                                 |
| **Robust Pronunciation with Fallback**   | BR-CARD-005, ASM-CARD-005 | US-CARD-002 | Scenario 2, Scenario 3        | Web Speech API test & audio element fallback                                  |
| **Card Lifecycle & Cascade Deletion**    | BR-CARD-006, ASM-CARD-006 | US-CARD-003 | Scenario 1, Scenario 2        | Cascade delete test for Card & `UserCardProgress`                             |
