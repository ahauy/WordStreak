import { describe, it, expect } from "vitest";
import { resources } from "../index";

function getLeafKeys(
  obj: Record<string, unknown>,
  prefix = "",
): { path: string; value: string }[] {
  let keys: { path: string; value: string }[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(
        getLeafKeys(value as Record<string, unknown>, currentPath),
      );
    } else if (typeof value === "string") {
      keys.push({ path: currentPath, value });
    }
  }

  return keys;
}

function extractInterpolationTokens(str: string): string[] {
  const matches = str.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  return matches ? matches.map((m) => m.replace(/[{}]/g, "")).sort() : [];
}

describe("i18n Locale Dictionaries Parity & Integrity (BR-I18N-007, BR-I18N-006)", () => {
  const namespaces = Object.keys(resources.en) as (keyof typeof resources.en)[];

  it("registers all 13 expected namespaces in both locales", () => {
    const expectedNamespaces = [
      "common",
      "auth",
      "dashboard",
      "decks",
      "cards",
      "study",
      "practice",
      "community",
      "analytics",
      "settings",
      "gamification",
      "ai_vocabulary",
      "errors",
    ];

    expect(Object.keys(resources.en).sort()).toEqual(expectedNamespaces.sort());
    expect(Object.keys(resources.vi).sort()).toEqual(expectedNamespaces.sort());
  });

  namespaces.forEach((ns) => {
    describe(`Namespace: ${ns}`, () => {
      const enDict = resources.en[ns] as Record<string, unknown>;
      const viDict = resources.vi[ns] as Record<string, unknown>;

      const enKeys = getLeafKeys(enDict);
      const viKeys = getLeafKeys(viDict);

      const enPathSet = new Set(enKeys.map((k) => k.path));
      const viPathSet = new Set(viKeys.map((k) => k.path));

      it("every English key path exists in Vietnamese dictionary", () => {
        const missingInVi: string[] = [];

        enKeys.forEach(({ path }) => {
          // In English, plural forms might use _one/_other, which in VI can be base key or same
          if (!viPathSet.has(path)) {
            // Check if VI has base key for plural forms
            const basePluralPath = path.replace(/_(one|other)$/, "");
            if (!viPathSet.has(basePluralPath)) {
              missingInVi.push(path);
            }
          }
        });

        expect(
          missingInVi,
          `Keys present in EN [${ns}] but missing in VI: ${missingInVi.join(", ")}`,
        ).toEqual([]);
      });

      it("every Vietnamese key path exists in English dictionary", () => {
        const missingInEn: string[] = [];

        viKeys.forEach(({ path }) => {
          if (!enPathSet.has(path)) {
            // Check if EN has plural keys _one/_other
            const pluralOne = `${path}_one`;
            const pluralOther = `${path}_other`;
            if (!enPathSet.has(pluralOne) && !enPathSet.has(pluralOther)) {
              missingInEn.push(path);
            }
          }
        });

        expect(
          missingInEn,
          `Keys present in VI [${ns}] but missing in EN: ${missingInEn.join(", ")}`,
        ).toEqual([]);
      });

      it("contains no empty string translations in EN or VI", () => {
        enKeys.forEach(({ path, value }) => {
          expect(
            value.trim().length,
            `EN key [${ns}:${path}] is empty`,
          ).toBeGreaterThan(0);
        });

        viKeys.forEach(({ path, value }) => {
          expect(
            value.trim().length,
            `VI key [${ns}:${path}] is empty`,
          ).toBeGreaterThan(0);
        });
      });

      it("matches interpolation parameters between EN and VI", () => {
        const viMap = new Map(viKeys.map((k) => [k.path, k.value]));

        enKeys.forEach(({ path, value: enVal }) => {
          let viVal = viMap.get(path);
          if (!viVal) {
            const basePath = path.replace(/_(one|other)$/, "");
            viVal = viMap.get(basePath);
          }

          if (viVal) {
            const enTokens = extractInterpolationTokens(enVal);
            const viTokens = extractInterpolationTokens(viVal);
            expect(
              viTokens,
              `Interpolation tokens mismatch in [${ns}:${path}]. EN: [${enTokens}], VI: [${viTokens}]`,
            ).toEqual(enTokens);
          }
        });
      });
    });
  });
});
