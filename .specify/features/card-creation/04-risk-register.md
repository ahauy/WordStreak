# Risk Register & Scope: Contextual Card Creation (US-CARD-01)

## 1. Contradiction Scan

- **Scan Summary**: Analyzed `03-domain-model.md` against existing database schema (`schema.prisma`) and REST contracts.
- **Findings**:
  - _Logic Contradictions_: None found. `Card` creation and `UserCardProgress` initialization are atomic and lifecycle triggers are consistent.
  - _State Deadlocks_: None found. `UserCardProgress` starts in `NEW` state, ready for SM-2 review queue (`US-SRS-02`).
  - _Backward-Compatibility_: Completely additive. No existing API routes or schemas are broken.

---

## 2. Risk Register

| ID                | Risk                                                                         | Prob. | Impact | Mitigation                                                                                               |
| :---------------- | :--------------------------------------------------------------------------- | :---- | :----- | :------------------------------------------------------------------------------------------------------- |
| **RISK-CARD-001** | Orphaned `UserCardProgress` if card deletion fails midway                    | Low   | Med    | Enforce Database Foreign Key with `ON DELETE CASCADE` in PostgreSQL/Prisma.                              |
| **RISK-CARD-002** | XSS or injection in custom fields (`meaning`, `exampleSentence`, `mnemonic`) | Low   | High   | Validation via class-validator (`@IsString`, `@MaxLength`, `@IsOptional`) and React auto-escaping on UI. |
| **RISK-CARD-003** | Audio playback failure from slow/broken external `audioUrl`                  | Med   | Low    | Fallback to browser Web Speech API (`window.speechSynthesis`) gracefully.                                |
| **RISK-CARD-004** | Accidental duplicate card creation due to double-clicking Save               | Low   | Low    | Disable submission button and display loading spinner while request is pending.                          |

---

## 3. Assumptions & Constraints (Consolidated)

- **ASM-CARD-001**: Only authenticated deck owners can create/view/edit/delete cards in that deck.
- **ASM-CARD-002**: `word` and `meaning` are required; `phonetic`, `audioUrl`, `exampleSentence`, `collocations`, `mnemonic`, and `imageUrl` are optional rich fields.
- **ASM-CARD-003**: Card creation atomically creates `UserCardProgress` in `NEW` state with SM-2 initial parameters (`interval: 0, repetitions: 0, easeFactor: 2.5`).
- **ASM-CARD-004**: Duplicate words within the same deck trigger a soft UI warning without hard blocking.
- **ASM-CARD-005**: Audio button supports hybrid fallback to Web Speech API when `audioUrl` is absent.
- **ASM-CARD-006**: Card deletion cascades to remove `UserCardProgress`.
- **Constraint-01**: Must strictly follow NestJS modular architecture (`apps/api/src/modules/cards`) and React feature-based structure (`apps/web/src/features/cards`).
- **Constraint-02**: Shared types must be declared in `packages/shared-types`.

---

## 4. MoSCoW Scope Table

### Must-Have (P0)

- Backend Card CRUD API (`POST /api/v1/decks/:deckId/cards`, `GET /api/v1/decks/:deckId/cards`, `GET /api/v1/cards/:id`, `PATCH /api/v1/cards/:id`, `DELETE /api/v1/cards/:id`).
- Automatic `UserCardProgress` creation (`status: 'NEW'`, `interval: 0`, `easeFactor: 2.5`).
- Deck ownership security checks on all card operations.
- Frontend `AddCardModal` with rich fields (word, meaning, phonetic, example, collocations, mnemonic, image, audio).
- Live 3D interactive Flashcard preview (Front / Back flip).
- "Save & Add Another" fast-entry capability.
- Web Speech API fallback for pronunciation.

### Should-Have (P1)

- Client-side duplicate word soft warning badge.
- Edit Card modal (`EditCardModal`) with pre-populated rich fields.
- Delete Card confirmation dialog.

### Could-Have (P2)

- Audio record / upload directly from microphone (delegated to `EPIC-08`).
- Pre-filled IPA suggestions (delegated to `EPIC-07` AI auto-fill).

### Won't-Have (Out of Scope for US-CARD-01)

- AI Auto-fill via OpenAI / Gemini (assigned to `EPIC-07 / US-AI-01`).
- Card Table & Advanced Search/Filter across 100+ cards (assigned to `US-CARD-02`).
- SM-2 Review engine scoring & rating calculation (assigned to `EPIC-03 / US-SRS-01`).
- Bulk Import CSV / Anki .apkg (assigned to `EPIC-09 / US-ECO-01`).
