# Changelog: US-GROW-02 Chrome Web Store Submission

## [1.0.0] - 2026-10-22
### Added
- Created complete `store-assets/` package in `apps/extension/`:
  - `store-listing.md`: Bilingual (EN/VI) title, short description, and feature overview.
  - `permissions-justification.md`: Formal technical justification for Google Review team.
  - `privacy-policy.md`: Extension privacy policy documenting zero external tracking and local token storage.
  - `screenshots-guide.md`: 1280x800 screenshot layout and guidelines.
  - `promo-tile-440x280.svg` and `marquee-1400x560.svg`: Store promo artwork complying with WordStreak minimal design tokens.
  - `store-assets.spec.ts`: Automated test suite ensuring manifest compliance, icon resolution, and documentation coverage.
