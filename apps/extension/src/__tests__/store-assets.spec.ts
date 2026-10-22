import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Chrome Web Store Assets & Manifest Compliance (TC-STORE-###)', () => {
  const extensionRoot = path.resolve(__dirname, '../..');
  const manifestPath = path.join(extensionRoot, 'manifest.json');
  const storeAssetsDir = path.join(extensionRoot, 'store-assets');

  it('TC-STORE-001: manifest.json has valid name, short description, and semver version', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBeDefined();
    expect(manifest.name.length).toBeLessThanOrEqual(45);
    expect(manifest.description).toBeDefined();
    expect(manifest.description.length).toBeLessThanOrEqual(132);
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('TC-STORE-002: all declared icons exist in public directory', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const declaredIcons = Object.values(manifest.icons as Record<string, string>);

    for (const iconRelativePath of declaredIcons) {
      const fullIconPath = path.join(extensionRoot, 'public', iconRelativePath);
      expect(fs.existsSync(fullIconPath), `Missing icon: ${iconRelativePath}`).toBe(true);
    }
  });

  it('TC-STORE-003: permissions-justification.md documents all manifest permissions', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const justificationPath = path.join(storeAssetsDir, 'permissions-justification.md');

    expect(fs.existsSync(justificationPath)).toBe(true);
    const justificationText = fs.readFileSync(justificationPath, 'utf8');

    for (const permission of manifest.permissions as string[]) {
      expect(
        justificationText.includes(`\`${permission}\``) || justificationText.includes(permission),
        `Permission not justified: ${permission}`,
      ).toBe(true);
    }
  });

  it('TC-STORE-004: store-listing.md contains bilingual English and Vietnamese descriptions', () => {
    const listingPath = path.join(storeAssetsDir, 'store-listing.md');
    expect(fs.existsSync(listingPath)).toBe(true);
    const listingContent = fs.readFileSync(listingPath, 'utf8');

    expect(listingContent).toContain('Short Description');
    expect(listingContent).toContain('Detailed Description (English)');
    expect(listingContent).toContain('Detailed Description (Vietnamese)');
    expect(listingContent).toContain('Search Keywords');
  });

  it('TC-STORE-005: privacy-policy.md documents zero tracking and data protection', () => {
    const privacyPath = path.join(storeAssetsDir, 'privacy-policy.md');
    expect(fs.existsSync(privacyPath)).toBe(true);
    const privacyContent = fs.readFileSync(privacyPath, 'utf8');

    expect(privacyContent).toContain('What Data We Collect');
    expect(privacyContent).toContain('What We DO NOT Collect');
    expect(privacyContent).toContain('Single-Purpose Compliance');
  });

  it('TC-STORE-006: promotional artwork SVG exists with valid viewBox', () => {
    const promoSvgPath = path.join(storeAssetsDir, 'promo-tile-440x280.svg');
    expect(fs.existsSync(promoSvgPath)).toBe(true);
    const svgContent = fs.readFileSync(promoSvgPath, 'utf8');

    expect(svgContent).toContain('viewBox="0 0 440 280"');
    expect(svgContent).toContain('WordStreak');
  });
});
