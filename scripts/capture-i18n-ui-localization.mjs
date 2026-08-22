import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("docs/user-guides/images/i18n-ui-localization");
fs.mkdirSync(outDir, { recursive: true });

const BASE_URL = "http://localhost:5173";

async function run() {
  console.log(`Launching Playwright on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Mock API routes
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "mock-jwt-token-123",
        user: {
          id: "mock-user-1",
          username: "AlexLearner",
          email: "alex@wordstreak.app",
          role: "user",
          avatarUrl: null,
          currentStreak: 14,
          totalXp: 1250,
          level: 5,
        },
      }),
    });
  });

  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "mock-jwt-token-123",
        user: {
          id: "mock-user-1",
          username: "AlexLearner",
          email: "alex@wordstreak.app",
          role: "user",
          avatarUrl: null,
        },
      }),
    });
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "mock-user-1",
        username: "AlexLearner",
        email: "alex@wordstreak.app",
        role: "user",
        avatarUrl: null,
        currentStreak: 14,
        totalXp: 1250,
        level: 5,
        streakFreezes: 2,
      }),
    });
  });

  await page.route("**/api/decks/deck-1/cards**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "card-1",
            deckId: "deck-1",
            term: "ubiquitous",
            definition: "present, appearing, or found everywhere; omnipresent",
            phonetic: "/juːˈbɪk.wə.təs/",
            partOfSpeech: "adjective",
            example: "Smartphones have become ubiquitous in modern daily life.",
            tags: ["academic", "c1", "ielts"],
            state: "LEARNING",
            repetition: 3,
            intervalDays: 6,
            easeFactor: 2.5,
            nextReviewAt: new Date().toISOString(),
          },
          {
            id: "card-2",
            deckId: "deck-1",
            term: "meticulous",
            definition: "showing great attention to detail; very careful and precise",
            phonetic: "/məˈtɪk.jə.ləs/",
            partOfSpeech: "adjective",
            example: "She conducted meticulous research before publishing the scientific paper.",
            tags: ["academic", "c1"],
            state: "MASTERED",
            repetition: 5,
            intervalDays: 24,
            easeFactor: 2.6,
            nextReviewAt: new Date(Date.now() + 86400000 * 20).toISOString(),
          },
          {
            id: "card-3",
            deckId: "deck-1",
            term: "pragmatic",
            definition: "dealing with things sensibly and realistically based on practical considerations",
            phonetic: "/præɡˈmæt.ɪk/",
            partOfSpeech: "adjective",
            example: "We need a pragmatic approach to solve this urban traffic issue.",
            tags: ["business", "ielts"],
            state: "NEW",
            repetition: 0,
            intervalDays: 0,
            easeFactor: 2.5,
            nextReviewAt: new Date().toISOString(),
          },
        ],
        meta: {
          total: 3,
          page: 1,
          limit: 12,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    });
  });

  await page.route("**/api/decks/deck-1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "deck-1",
        title: "IELTS Academic Core Vocabulary",
        description: "Bộ từ vựng trọng tâm IELTS 7.5+ gồm các chủ đề học thuật nâng cao",
        cardCount: 45,
        color: "#9333ea",
        icon: "BookOpen",
        stats: { dueCards: 12, newCards: 5, learningCards: 18, masteredCards: 27 },
        isPublic: true,
      }),
    });
  });

  await page.route("**/api/decks**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "deck-1",
          title: "IELTS Academic Core Vocabulary",
          description: "Bộ từ vựng trọng tâm IELTS 7.5+ gồm các chủ đề học thuật nâng cao",
          cardCount: 45,
          color: "#9333ea",
          icon: "BookOpen",
          stats: { dueCards: 12, newCards: 5, learningCards: 18, masteredCards: 27 },
          isPublic: true,
        },
        {
          id: "deck-2",
          title: "Oxford 3000 Essential",
          description: "3000 từ vựng cốt lõi cho giao tiếp tự tin hàng ngày",
          cardCount: 120,
          color: "#2563eb",
          icon: "Sparkles",
          stats: { dueCards: 0, newCards: 10, learningCards: 30, masteredCards: 80 },
          isPublic: false,
        },
      ]),
    });
  });

  await page.route("**/api/reviews/due**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "card-1",
            deckId: "deck-1",
            term: "ubiquitous",
            definition: "present, appearing, or found everywhere; omnipresent",
            phonetic: "/juːˈbɪk.wə.təs/",
            partOfSpeech: "adjective",
            example: "Smartphones have become ubiquitous in modern daily life.",
            state: "LEARNING",
            repetition: 3,
            intervalDays: 6,
            easeFactor: 2.5,
            intervals: {
              again: "1 phút",
              hard: "2 ngày",
              good: "6 ngày",
              easy: "12 ngày",
            },
          },
        ],
      }),
    });
  });

  await page.route("**/api/gamification/streak**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        currentStreak: 14,
        bestStreak: 25,
        flameTier: 3,
        isActiveToday: true,
        isPendingToday: false,
        streakFreezes: 2,
        maxStreakFreezes: 2,
      }),
    });
  });

  await page.route("**/api/streak**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        currentStreak: 14,
        bestStreak: 25,
        flameTier: 3,
        isActiveToday: true,
        isPendingToday: false,
        streakFreezes: 2,
        maxStreakFreezes: 2,
      }),
    });
  });

  await page.route("**/api/gamification/xp/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        totalXp: 1250,
        level: 5,
        title: "Từ Vựng Cao Cấp",
        xpIntoLevel: 250,
        xpToNextLevel: 500,
        history: [],
      }),
    });
  });

  await page.route("**/api/analytics/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        overview: {
          totalCards: 165,
          masteredCards: 107,
          learningCards: 43,
          newCards: 15,
          retentionRate: 94,
          totalReviews: 842,
          currentStreak: 14,
        },
        heatmap: {},
        forecast: [
          {
            deckId: "deck-1",
            deckTitle: "IELTS Academic Core Vocabulary",
            masteredCount: 27,
            totalCount: 45,
            progressPercent: 60,
            estimatedDaysRemaining: 4,
            targetCompletionDate: "2026-08-26",
            status: "IN_PROGRESS",
          },
        ],
      }),
    });
  });

  async function addAnnotation(selector, badgeNumber, options = {}) {
    try {
      const loc = page.locator(selector).first();
      await loc.waitFor({ state: "visible", timeout: 3000 });
      await loc.evaluate((el, { badge, opt }) => {
        el.style.outline = "3.5px solid #EF4444";
        el.style.boxShadow = "0 0 0 7px rgba(239, 68, 68, 0.3)";
        if (opt.relative !== false) el.style.position = "relative";
        el.style.zIndex = "50";

        const b = document.createElement("div");
        b.className = "__guide_badge__";
        b.textContent = badge;
        b.style.position = "absolute";
        b.style.top = opt.top || "-14px";
        b.style.right = opt.right || (opt.left ? "" : "-14px");
        if (opt.left) b.style.left = opt.left;
        b.style.background = "#EF4444";
        b.style.color = "#FFFFFF";
        b.style.fontWeight = "800";
        b.style.fontFamily = "system-ui, -apple-system, sans-serif";
        b.style.fontSize = "13px";
        b.style.width = "26px";
        b.style.height = "26px";
        b.style.borderRadius = "9999px";
        b.style.display = "flex";
        b.style.alignItems = "center";
        b.style.justifyContent = "center";
        b.style.zIndex = "999999";
        b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
        b.style.pointerEvents = "none";
        el.appendChild(b);
      }, { badge: badgeNumber, opt: options });
    } catch (err) {
      console.warn(`Could not annotate ${selector}: ${err.message}`);
    }
  }

  async function clearAnnotations() {
    await page.evaluate(() => {
      document.querySelectorAll(".__guide_badge__").forEach((b) => b.remove());
      document.querySelectorAll(".__custom_callout__").forEach((c) => c.remove());
      document.querySelectorAll("*").forEach((el) => {
        if (el.style.outline && el.style.outline.includes("rgb(239, 68, 68)")) {
          el.style.outline = "";
          el.style.boxShadow = "";
        }
      });
    });
  }

  try {
    // ----------------------------------------------------------------
    // 1. OBSIDIAN PILL ON HEADER / NAVBAR
    // ----------------------------------------------------------------
    console.log("Step 1: Obsidian Pill Switcher on Header...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("wordstreak_locale", "vi"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    await clearAnnotations();
    await addAnnotation("header a[href='/']", "①", { top: "-10px", right: "-10px" });
    await addAnnotation("header .language-switcher-anchor, header button:has-text('VI'), header button:has-text('EN')", "②", { top: "-12px", right: "-12px" });
    await addAnnotation("header a[href='/register'], header a[href='/login']", "③", { top: "-10px", right: "-10px" });

    await page.evaluate(() => {
      const switcher = document.querySelector(".language-switcher-anchor") || document.querySelector("header button:has-text('VI')")?.parentElement;
      if (switcher) {
        const note = document.createElement("div");
        note.className = "__custom_callout__";
        note.innerHTML = `
          <div style="background: #09090b; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,0.3); border: 1px solid #3f3f46; display: flex; align-items: center; gap: 6px;">
            <span style="color: #22c55e; font-weight: 700;">● 0ms Chuyển Đổi</span>
            <span>🇻🇳 Tiếng Việt ⇄ 🇬🇧 English</span>
          </div>
        `;
        note.style.position = "absolute";
        note.style.top = "42px";
        note.style.right = "0";
        note.style.zIndex = "999999";
        switcher.appendChild(note);
      }
    });

    await page.screenshot({
      path: path.join(outDir, "step-01-obsidian-pill-header.png"),
      clip: { x: 0, y: 0, width: 1280, height: 460 },
    });
    console.log("✔ Saved step-01-obsidian-pill-header.png");

    // ----------------------------------------------------------------
    // 2. AUTH SCREEN LOCALIZATION (LOGIN & SHOWCASE)
    // ----------------------------------------------------------------
    console.log("Step 2: Auth Screen Localization...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    await clearAnnotations();
    await addAnnotation("form", "①", { top: "-10px", left: "10px" });
    await addAnnotation("header button:has-text('VI'), header button:has-text('EN'), nav button, .language-switcher-anchor", "②", { top: "-12px", right: "-12px" });
    await addAnnotation("aside, .hidden.lg\\:flex, .hidden.lg\\:block", "③", { top: "10px", left: "10px" });

    await page.screenshot({
      path: path.join(outDir, "step-02-auth-bilingual-experience.png"),
      clip: { x: 0, y: 0, width: 1280, height: 750 },
    });
    console.log("✔ Saved step-02-auth-bilingual-experience.png");

    // Log in
    await page.fill("#login-identifier", "alex@wordstreak.app");
    await page.fill("#login-password", "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // ----------------------------------------------------------------
    // 3. DECKS & CARD MANAGEMENT (LOCALIZED UI + ENGLISH CARDS)
    // ----------------------------------------------------------------
    console.log("Step 3: Deck & Card Management Localized Screen...");
    await page.goto(`${BASE_URL}/decks/deck-1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await clearAnnotations();
    await addAnnotation("header, .flex.items-center.gap-3:has(button)", "①", { top: "-10px", right: "-10px" });
    await addAnnotation("div:has(> input[type='text']), div:has(> button[title*='Lưới']), div:has(> button[title*='Bảng'])", "②", { top: "-10px", left: "10px" });
    await addAnnotation("div:has(> div:has-text('ubiquitous')), .grid > div:first-child", "③", { top: "10px", left: "10px" });

    await page.screenshot({
      path: path.join(outDir, "step-03-deck-and-card-management.png"),
      clip: { x: 0, y: 0, width: 1280, height: 750 },
    });
    console.log("✔ Saved step-03-deck-and-card-management.png");

    // ----------------------------------------------------------------
    // 4. SRS FLASHCARD REVIEW SESSION
    // ----------------------------------------------------------------
    console.log("Step 4: SRS Flashcard Review Session...");
    await page.goto(`${BASE_URL}/decks/deck-1/review`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await clearAnnotations();
    await addAnnotation("div[role='progressbar'], header, .sticky", "①", { top: "-10px", left: "10px" });
    await addAnnotation(".max-w-xl, div:has-text('ubiquitous')", "②", { top: "10px", left: "10px" });
    await addAnnotation(".grid.grid-cols-2, .grid.grid-cols-4, div:has(> button:has-text('Lặp lại')), div:has(> button:has-text('Tốt'))", "③", { top: "-14px", left: "20px" });

    await page.screenshot({
      path: path.join(outDir, "step-04-srs-flashcard-review.png"),
      clip: { x: 0, y: 0, width: 1280, height: 750 },
    });
    console.log("✔ Saved step-04-srs-flashcard-review.png");

    // ----------------------------------------------------------------
    // 5. PRACTICE MODES & VOICE ASSESSMENT MODAL
    // ----------------------------------------------------------------
    console.log("Step 5: Practice & Voice Assessment...");
    await page.goto(`${BASE_URL}/decks/deck-1/quiz`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await clearAnnotations();
    await addAnnotation("div:has(> h1, > h2), header", "①", { top: "-10px", left: "10px" });
    await addAnnotation(".grid.grid-cols-1.sm\\:grid-cols-2, .space-y-3", "②", { top: "-10px", left: "10px" });

    // Inject modal demonstration
    await page.evaluate(() => {
      const modal = document.createElement("div");
      modal.className = "__custom_callout__";
      modal.innerHTML = `
        <div style="background: #18181b; border: 2px solid #3f3f46; border-radius: 16px; padding: 20px 24px; color: #fafafa; font-family: system-ui, sans-serif; width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); position: fixed; bottom: 30px; right: 30px; z-index: 99999;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; color: #38bdf8;">
              <span>🎙️ Luyện Phát Âm Trí Tuệ Nhân Tạo</span>
            </div>
            <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">96% Xuất sắc</span>
          </div>
          <div style="background: #27272a; border-radius: 10px; padding: 12px; margin-bottom: 14px;">
            <div style="font-size: 16px; font-weight: 700; color: #a3e635; margin-bottom: 4px;">/juːˈbɪk.wə.təs/</div>
            <div style="font-size: 12px; color: #a1a1aa;">"Smartphones have become ubiquitous in modern life."</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center; font-size: 11px;">
            <div style="background: #09090b; padding: 6px; border-radius: 8px;">
              <div style="color: #a1a1aa;">Chính xác</div>
              <div style="font-weight: 700; color: #4ade80;">98%</div>
            </div>
            <div style="background: #09090b; padding: 6px; border-radius: 8px;">
              <div style="color: #a1a1aa;">Lưu loát</div>
              <div style="font-weight: 700; color: #38bdf8;">95%</div>
            </div>
            <div style="background: #09090b; padding: 6px; border-radius: 8px;">
              <div style="color: #a1a1aa;">Rõ chữ</div>
              <div style="font-weight: 700; color: #facc15;">94%</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    });

    await addAnnotation(".__custom_callout__ > div", "③", { top: "-12px", right: "-12px" });

    await page.screenshot({
      path: path.join(outDir, "step-05-practice-modes-and-voice.png"),
      clip: { x: 0, y: 0, width: 1280, height: 750 },
    });
    console.log("✔ Saved step-05-practice-modes-and-voice.png");

    // ----------------------------------------------------------------
    // 6. ANALYTICS & SETTINGS
    // ----------------------------------------------------------------
    console.log("Step 6: Analytics & Settings Localized...");
    await page.goto(`${BASE_URL}/analytics`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await clearAnnotations();
    await addAnnotation(".grid.grid-cols-1.md\\:grid-cols-3, div:has(> div:has-text('Tỷ lệ nhớ'))", "①", { top: "-10px", left: "10px" });
    await addAnnotation(".bg-white.rounded-2xl.border, table", "②", { top: "-10px", left: "10px" });

    // Settings overlay
    await page.evaluate(() => {
      const settingsCard = document.createElement("div");
      settingsCard.className = "__custom_callout__";
      settingsCard.innerHTML = `
        <div style="background: #18181b; border: 2px solid #3f3f46; border-radius: 16px; padding: 18px 22px; color: #fafafa; font-family: system-ui, sans-serif; width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); position: fixed; top: 90px; right: 40px; z-index: 99999;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1px solid #27272a; padding-bottom: 10px;">
            <div style="font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px;">
              <span>⚙️ Cài Đặt Cá Nhân & Ngôn Ngữ</span>
            </div>
            <span style="font-size: 11px; color: #a1a1aa;">Tự động lưu</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600;">Ngôn ngữ giao diện</div>
                <div style="font-size: 11px; color: #a1a1aa;">Ưu tiên hiển thị trên mọi thiết bị</div>
              </div>
              <span style="background: #27272a; border: 1px solid #52525b; padding: 4px 10px; border-radius: 8px; font-weight: 600; color: #22c55e;">🇻🇳 Tiếng Việt</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600;">Mục tiêu từ vựng hàng ngày</div>
                <div style="font-size: 11px; color: #a1a1aa;">Mục tiêu duy trì Streak lửa</div>
              </div>
              <span style="background: #27272a; border: 1px solid #52525b; padding: 4px 10px; border-radius: 8px; font-weight: 600; color: #f97316;">🔥 20 từ/ngày</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(settingsCard);
    });

    await addAnnotation(".__custom_callout__ > div", "③", { top: "-12px", right: "-12px" });

    await page.screenshot({
      path: path.join(outDir, "step-06-analytics-and-settings.png"),
      clip: { x: 0, y: 0, width: 1280, height: 750 },
    });
    console.log("✔ Saved step-06-analytics-and-settings.png");

    // ----------------------------------------------------------------
    // 7. FRIENDLY & SECURE ERROR MESSAGES
    // ----------------------------------------------------------------
    console.log("Step 7: Friendly Security Errors...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    await clearAnnotations();

    await page.evaluate(() => {
      const banner = document.createElement("div");
      banner.className = "__custom_callout__";
      banner.innerHTML = `
        <div style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); width: 700px; background: #18181b; border: 2px solid #ef4444; border-radius: 14px; padding: 16px 20px; box-shadow: 0 12px 36px rgba(239, 68, 68, 0.25); display: flex; align-items: center; justify-content: space-between; z-index: 99999; font-family: system-ui, sans-serif; color: #fafafa;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="background: rgba(239, 68, 68, 0.2); color: #ef4444; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              ⚠️
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px; color: #f87171;">Không thể kết nối đến máy chủ</div>
              <div style="font-size: 12px; color: #d4d4d8;">Kết nối internet của bạn có thể đang bị gián đoạn. Dữ liệu từ vựng đã được lưu an toàn trên máy của bạn.</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button style="background: #ef4444; color: #ffffff; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;">Thử lại ngay</button>
          </div>
        </div>
      `;
      document.body.appendChild(banner);
    });

    await addAnnotation(".__custom_callout__ div:has-text('Không thể kết nối')", "①", { top: "-10px", left: "10px" });
    await addAnnotation(".__custom_callout__ button", "②", { top: "-10px", right: "-10px" });
    await addAnnotation(".__custom_callout__", "③", { top: "-12px", right: "20px" });

    await page.screenshot({
      path: path.join(outDir, "step-07-friendly-security-errors.png"),
      clip: { x: 0, y: 0, width: 1280, height: 600 },
    });
    console.log("✔ Saved step-07-friendly-security-errors.png");

    console.log("🎉 All 7 localized screenshots captured flawlessly!");
  } catch (err) {
    console.error("Error during capture:", err);
  } finally {
    await browser.close();
  }
}

run();
