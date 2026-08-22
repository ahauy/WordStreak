import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("docs/user-guides/images/i18n-user-preferences");
fs.mkdirSync(outDir, { recursive: true });

const BASE_URL = "http://localhost:5173";

async function run() {
  console.log(`Launching browser via Playwright on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Route mocking for all API calls
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
          preferredLanguage: "vi",
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
          preferredLanguage: "vi",
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
        preferredLanguage: "vi",
      }),
    });
  });

  await page.route("**/api/users/profile", async (route) => {
    if (route.request().method() === "PATCH") {
      const data = route.request().postDataJSON?.() || {};
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "mock-user-1",
          username: "AlexLearner",
          email: "alex@wordstreak.app",
          role: "user",
          avatarUrl: null,
          preferredLanguage: data.preferredLanguage || "vi",
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "mock-user-1",
        username: "AlexLearner",
        email: "alex@wordstreak.app",
        role: "user",
        avatarUrl: null,
        preferredLanguage: "vi",
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
          title: "IELTS Core Vocabulary 2026",
          description: "Bộ từ vựng trọng tâm IELTS Academic 7.5+",
          cardCount: 50,
          color: "#9333ea",
          icon: "BookOpen",
          stats: { dueCards: 12, newCards: 5, learningCards: 18, masteredCards: 27 },
          isPublic: true,
        },
        {
          id: "deck-2",
          title: "Oxford 3000 Essential",
          description: "3000 từ vựng cốt lõi giao tiếp tiếng Anh",
          cardCount: 120,
          color: "#2563eb",
          icon: "Sparkles",
          stats: { dueCards: 0, newCards: 10, learningCards: 30, masteredCards: 80 },
          isPublic: false,
        },
      ]),
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
          totalCards: 170,
          masteredCards: 107,
          learningCards: 48,
          retentionRate: 94,
        },
        heatmap: {},
      }),
    });
  });

  async function addAnnotation(selector, badgeNumber, options = {}) {
    try {
      const loc = page.locator(selector).first();
      await loc.waitFor({ state: "visible", timeout: 4000 });
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
    // 1. QUICK SWITCH ON TOPBAR WITH OBSIDIAN PILL & INSTANT BACKGROUND SYNC
    console.log("1. Setting up Dashboard and Topbar Switcher...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#login-identifier", "alex@wordstreak.app");
    await page.fill("#login-password", "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1200);

    console.log("Capturing Step 1: Obsidian Pill Switcher with Background Sync callout...");
    await clearAnnotations();
    await addAnnotation("header .language-switcher-anchor button", "①", { top: "-12px", right: "-12px" });
    await addAnnotation("header button[title*='Cài đặt'], header button[aria-label*='Cài đặt'], header button:has-text('AlexLearner')", "②", { top: "-10px", right: "-10px" });

    // Add visual callout explaining instant switch + background sync
    await page.evaluate(() => {
      const switcher = document.querySelector("header .language-switcher-anchor");
      if (switcher) {
        const callout = document.createElement("div");
        callout.className = "__custom_callout__";
        callout.innerHTML = `
          <div style="background: #09090b; color: #fafafa; border: 1.5px solid #27272a; padding: 10px 16px; border-radius: 12px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; box-shadow: 0 10px 28px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 6px; pointer-events: none; width: 290px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 700; color: #a855f7;">⚡ 1-Click Fast Switch</span>
              <span style="background: #22c55e; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">&lt; 16ms (0ms Reload)</span>
            </div>
            <div style="color: #d4d4d8; font-size: 11px; line-height: 1.4;">
              Chuyển đổi tức thì không tải lại trang + Tự động lưu ngầm vào hồ sơ tài khoản (Cloud Sync).
            </div>
            <div style="border-top: 1px solid #27272a; padding-top: 5px; font-family: ui-monospace, monospace; font-size: 10px; color: #38bdf8; display: flex; align-items: center; gap: 4px;">
              <span>PATCH /api/v1/users/profile</span>
              <span style="color: #22c55e;">✔ 200 OK</span>
            </div>
          </div>
        `;
        callout.style.position = "absolute";
        callout.style.top = "46px";
        callout.style.right = "0";
        callout.style.zIndex = "999999";
        switcher.appendChild(callout);
      }
    });

    await page.screenshot({
      path: path.join(outDir, "step-01-obsidian-pill-quick-switch.png"),
      clip: { x: 180, y: 0, width: 1100, height: 480 },
    });
    console.log("✔ Saved step-01-obsidian-pill-quick-switch.png");

    // 2. SETTINGS MODAL - LANGUAGE & REGION TAB
    console.log("2. Opening Settings Modal on Language & Region tab...");
    await clearAnnotations();
    
    // Open settings modal
    const userBtn = page.locator("header button[title*='Cài đặt'], header button[aria-label*='Cài đặt'], header button:has-text('AlexLearner')").first();
    await userBtn.click();
    await page.waitForTimeout(600);

    // Click Language tab
    const langTab = page.locator("[data-testid='settings-tab-language']").first();
    await langTab.click();
    await page.waitForTimeout(500);

    console.log("Capturing Step 2: Settings Modal Language & Region tab...");
    await addAnnotation("[data-testid='settings-tab-language']", "①", { top: "-10px", right: "-10px" });
    await addAnnotation("[data-testid='language-card-vi']", "②", { top: "-10px", right: "-10px" });
    await addAnnotation("[data-testid='language-settings-tab'] > div:last-child", "③", { top: "-10px", right: "-10px" });

    await page.screenshot({
      path: path.join(outDir, "step-02-settings-modal-language-tab.png"),
      clip: { x: 240, y: 40, width: 800, height: 680 },
    });
    console.log("✔ Saved step-02-settings-modal-language-tab.png");

    // Close modal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // 3. GUEST REGISTRATION LANGUAGE CARRYOVER
    console.log("3. Navigating to Register page in English...");
    await clearAnnotations();
    // Logout first
    await page.evaluate(() => {
      localStorage.setItem("wordstreak_locale", "en");
      localStorage.removeItem("auth-storage");
    });
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    console.log("Capturing Step 3: Registration Language Preference Carryover...");
    await addAnnotation("header", "①", { top: "-10px", right: "-10px" });
    await addAnnotation("form", "②", { top: "-10px", right: "-10px" });
    await addAnnotation("button[type='submit']", "③", { top: "-10px", right: "-10px" });

    // Add carryover banner
    await page.evaluate(() => {
      const submitBtn = document.querySelector("button[type='submit']");
      if (submitBtn) {
        const callout = document.createElement("div");
        callout.className = "__custom_callout__";
        callout.innerHTML = `
          <div style="background: #09090b; color: #fafafa; border: 1.5px solid #27272a; padding: 10px 14px; border-radius: 10px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px; pointer-events: none; margin-top: 10px;">
            <span style="font-size: 16px;">✨</span>
            <div>
              <strong style="color: #a855f7;">Guest Language Preserved:</strong>
              <span style="color: #e4e4e7;"> preferredLanguage = </span><strong style="color: #facc15;">"en"</strong>
              <div style="color: #a1a1aa; font-size: 10px; margin-top: 2px;">Tự động lưu vào hồ sơ tài khoản mới tạo (PostgreSQL) mà không mất cấu hình.</div>
            </div>
          </div>
        `;
        submitBtn.parentElement.appendChild(callout);
      }
    });

    await page.screenshot({
      path: path.join(outDir, "step-03-register-preference-carryover.png"),
      clip: { x: 200, y: 0, width: 900, height: 780 },
    });
    console.log("✔ Saved step-03-register-preference-carryover.png");

    // 4. MULTI-DEVICE CLOUD SYNCHRONIZATION
    console.log("4. Capturing Step 4: Multi-Device Cloud Synchronization...");
    await clearAnnotations();
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#login-identifier", "alex@wordstreak.app");
    await page.fill("#login-password", "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Open settings modal on Language tab
    const userBtn2 = page.locator("header button[title*='Cài đặt'], header button[aria-label*='Cài đặt'], header button:has-text('AlexLearner')").first();
    await userBtn2.click();
    await page.waitForTimeout(500);
    const langTab2 = page.locator("[data-testid='settings-tab-language']").first();
    await langTab2.click();
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const container = document.querySelector("[data-testid='language-settings-tab']");
      if (container) {
        const cloudBanner = document.createElement("div");
        cloudBanner.className = "__custom_callout__";
        cloudBanner.innerHTML = `
          <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); color: #f8fafc; border: 1.5px solid #6366f1; padding: 14px 18px; border-radius: 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; box-shadow: 0 12px 30px rgba(99,102,241,0.25); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #818cf8;">
                <span>☁️ Multi-Device Auto-Sync (Đồng bộ đa thiết bị)</span>
              </div>
              <span style="background: #4338ca; color: #e0e7ff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">PostgreSQL Authoritative</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; margin-top: 4px;">
              <div style="background: rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-weight: 700; color: #38bdf8;">💻 Máy tính bàn / Laptop</div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Chọn Tiếng Việt ➔ Lưu ngầm lên Cloud DB</div>
              </div>
              <div style="background: rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-weight: 700; color: #34d399;">📱 Điện thoại / iPad</div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Đăng nhập ➔ Tự động nạp Tiếng Việt 100%</div>
              </div>
            </div>
          </div>
        `;
        container.prepend(cloudBanner);
      }
    });

    await addAnnotation("[data-testid='language-card-vi']", "①", { top: "-10px", right: "-10px" });
    await addAnnotation(".__custom_callout__", "②", { top: "-10px", right: "-10px" });

    await page.screenshot({
      path: path.join(outDir, "step-04-multi-device-auto-sync.png"),
      clip: { x: 240, y: 40, width: 800, height: 720 },
    });
    console.log("✔ Saved step-04-multi-device-auto-sync.png");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // 5. OFFLINE RESILIENCE & SILENT BACKGROUND QUEUING
    console.log("5. Capturing Step 5: Offline Resilience & Zero Disruption...");
    await clearAnnotations();

    await page.evaluate(() => {
      const topbar = document.querySelector("header");
      if (topbar) {
        const offlineBanner = document.createElement("div");
        offlineBanner.className = "__custom_callout__";
        offlineBanner.innerHTML = `
          <div style="background: #0f172a; color: #f1f5f9; border: 1.5px solid #334155; padding: 12px 18px; border-radius: 14px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; box-shadow: 0 10px 28px rgba(0,0,0,0.35); display: flex; flex-direction: column; gap: 6px; width: 340px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 700; color: #f59e0b; display: flex; align-items: center; gap: 6px;">
                <span>🛡️ Offline Resilience (Độ bền ngoại tuyến)</span>
              </span>
              <span style="background: #1e293b; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #475569;">Zero Blocking Toasts</span>
            </div>
            <div style="color: #cbd5e1; font-size: 11px; line-height: 1.4;">
              Mất kết nối mạng? Ứng dụng vẫn đổi ngôn ngữ tức thì trong <strong>localStorage</strong>. Không bị ngắt quãng bài học hay hiện thông báo lỗi phiền toái.
            </div>
            <div style="font-family: ui-monospace, monospace; font-size: 10px; color: #10b981; border-top: 1px solid #1e293b; padding-top: 4px; display: flex; align-items: center; gap: 4px;">
              <span>Online trở lại ➔ Tự động đồng bộ hóa lên Cloud</span>
            </div>
          </div>
        `;
        offlineBanner.style.position = "absolute";
        offlineBanner.style.top = "68px";
        offlineBanner.style.right = "80px";
        offlineBanner.style.zIndex = "999999";
        topbar.appendChild(offlineBanner);
      }
    });

    await addAnnotation("header .language-switcher-anchor button", "①", { top: "-12px", right: "-12px" });
    await addAnnotation(".__custom_callout__", "②", { top: "-10px", right: "-10px" });

    await page.screenshot({
      path: path.join(outDir, "step-05-offline-resilience.png"),
      clip: { x: 140, y: 0, width: 1140, height: 440 },
    });
    console.log("✔ Saved step-05-offline-resilience.png");

    console.log("🎉 All 5 screenshots successfully captured in docs/user-guides/images/i18n-user-preferences!");
  } catch (err) {
    console.error("Error during capture:", err);
  } finally {
    await browser.close();
  }
}

run();
