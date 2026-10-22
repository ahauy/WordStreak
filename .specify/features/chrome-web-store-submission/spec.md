# Specification: US-GROW-02 Chrome Web Store Submission & Store Assets

## 1. Requirements & Acceptance Criteria

- **User Story:** US-GROW-02
- **Title:** Chrome Web Store Submission & Store Assets Preparation
- **Epic:** EPIC-12: UX Improvements & Growth | Sprint 10
- **Status:** In Progress -> Done

### Acceptance Criteria
- **REQ-STORE-001 (Manifest V3 Compliance):** `manifest.json` satisfies all Chrome Web Store requirements (valid name <= 45 chars, valid description <= 132 chars, valid 16/48/128px icon mappings, valid semver).
- **REQ-STORE-002 (Store Listing Metadata):** Provide complete English and Vietnamese store listing texts (Title, Short description, Detailed features list, Category: "Productivity/Education", Search keywords).
- **REQ-STORE-003 (Permissions Justification):** Provide a dedicated document explaining the single-purpose policy and exact technical justification for each requested permission (`storage`, `activeTab`, `contextMenus`, `scripting`, `tabs`, `alarms`, `notifications`, host permissions).
- **REQ-STORE-004 (Privacy Policy):** Provide a dedicated privacy policy for the extension documenting local token storage, zero telemetry/analytics without consent, and zero user data sharing.
- **REQ-STORE-005 (Visual Promo Assets):** Provide standards-compliant SVG store promo banners (Small Tile 440x280 and Marquee Tile 1400x560) adopting WordStreak minimal canvas and purple flame design tokens.
- **REQ-STORE-006 (Automated Verification):** Provide automated test suite verifying manifest fields, icon accessibility, and store asset integrity.

---

## 2. Technical Approach & Design
- **Target Folder:** `apps/extension/store-assets/`
- **Files to create:**
  - `apps/extension/store-assets/store-listing.md`: Bilingual store listing copy.
  - `apps/extension/store-assets/permissions-justification.md`: Developer declaration for Google Reviewers.
  - `apps/extension/store-assets/privacy-policy.md`: Extension privacy policy statement.
  - `apps/extension/store-assets/screenshots-guide.md`: 1280x800 screenshot specifications and capture scripts.
  - `apps/extension/store-assets/promo-tile-440x280.svg`: Small promo banner.
  - `apps/extension/store-assets/marquee-1400x560.svg`: Marquee banner.
  - `apps/extension/src/__tests__/store-assets.spec.ts`: Unit test suite verifying compliance.

---

## 3. Test Cases (TC-STORE-###)
- **TC-STORE-001:** `manifest.json` contains valid name, description <= 132 chars, and valid semver version string.
- **TC-STORE-002:** All declared icons (16, 48, 128) exist in `public/icons/`.
- **TC-STORE-003:** All permissions in `manifest.json` have a corresponding entry in `permissions-justification.md`.
- **TC-STORE-004:** Store listing document exists and provides both EN and VI descriptions with required keywords.
- **TC-STORE-005:** Privacy policy document exists and contains required single-purpose and data retention clauses.
