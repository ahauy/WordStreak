import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("docs/user-guides/images/i18n-core-switcher");
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
    // 1. LANDING PAGE NAVBAR SWITCHER
    console.log("1. Navigating to landing page...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    // Make sure it starts in VI
    await page.evaluate(() => {
      localStorage.setItem("wordstreak_locale", "vi");
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    console.log("Capturing Step 1: Landing Navbar Switcher...");
    await clearAnnotations();
    await addAnnotation("header a[href='/']", "①", { top: "-10px", right: "-10px" });
    await addAnnotation(".language-switcher-anchor button", "②", { top: "-12px", right: "-12px" });
    await addAnnotation("header a[href='/register']", "③", { top: "-10px", right: "-10px" });

    await page.screenshot({
      path: path.join(outDir, "step-01-landing-navbar-switcher.png"),
      clip: { x: 0, y: 0, width: 1280, height: 460 },
    });
    console.log("✔ Saved step-01-landing-navbar-switcher.png");

    // 2. DETAILED 1-CLICK TOGGLE CAPSULE (VI -> EN demonstration)
    console.log("Capturing Step 2: 1-Click Toggle Capsule...");
    await clearAnnotations();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    await addAnnotation(".language-switcher-anchor button", "①", { top: "-14px", right: "-14px" });
    
    // Add interactive indicator explaining 1-click toggle
    await page.evaluate(() => {
      const btn = document.querySelector(".language-switcher-anchor");
      if (btn) {
        const tip = document.createElement("div");
        tip.className = "__custom_callout__";
        tip.innerHTML = `
          <div style="background: #18181b; color: #ffffff; padding: 8px 14px; border-radius: 8px; font-family: system-ui, sans-serif; font-size: 12px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 8px; border: 1px solid #3f3f46; white-space: nowrap;">
            <span>🇻🇳 VI</span>
            <span style="color: #a1a1aa;">⇄</span>
            <span>🇬🇧 EN</span>
            <span style="background: #22c55e; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 4px;">1-CLICK (0ms)</span>
          </div>
        `;
        tip.style.position = "absolute";
        tip.style.top = "44px";
        tip.style.right = "0";
        tip.style.zIndex = "999999";
        btn.appendChild(tip);
      }
    });

    await page.screenshot({
      path: path.join(outDir, "step-02-one-click-toggle.png"),
      clip: { x: 380, y: 0, width: 900, height: 320 },
    });
    console.log("✔ Saved step-02-one-click-toggle.png");

    // 3. LOG IN TO DASHBOARD & CAPTURE TOPBAR SWITCHER
    console.log("Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#login-identifier", "alex@wordstreak.app");
    await page.fill("#login-password", "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    console.log("Capturing Step 3: Dashboard Topbar Switcher...");
    await clearAnnotations();
    await addAnnotation("header a[href='/dashboard']", "①", { top: "-10px", right: "-10px" });
    await addAnnotation("header button[title*='Khu Vườn'], header button[aria-label*='streak'], header button:has-text('Streak')", "②", { top: "-10px", right: "-10px" });
    await addAnnotation("header .language-switcher-anchor button", "③", { top: "-12px", right: "-12px" });
    await addAnnotation("header button[title*='Cài đặt'], header button[aria-label*='Cài đặt']", "④", { top: "-10px", right: "-10px" });

    await page.screenshot({
      path: path.join(outDir, "step-03-dashboard-navbar-switcher.png"),
      clip: { x: 0, y: 0, width: 1280, height: 500 },
    });
    console.log("✔ Saved step-03-dashboard-navbar-switcher.png");

    // 4. INSTANT UI TRANSLATION (FULL DASHBOARD VIEW IN VIETNAMESE)
    console.log("Capturing Step 4: Instant UI Translation in Vietnamese...");
    await clearAnnotations();
    const dashSwitcher = await page.locator("header .language-switcher-anchor button").first();
    const dashText = await dashSwitcher.innerText();
    if (!dashText.includes("VI")) {
      await dashSwitcher.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: path.join(outDir, "step-04-instant-ui-translation.png"),
      clip: { x: 0, y: 0, width: 1280, height: 750 },
    });
    console.log("✔ Saved step-04-instant-ui-translation.png");

    // 5. SESSION PERSISTENCE & LOCALSTORAGE DEMO
    console.log("Capturing Step 5: LocalStorage Persistence...");
    await clearAnnotations();
    await addAnnotation("header .language-switcher-anchor button", "①", { top: "-12px", right: "-12px" });

    await page.evaluate(() => {
      const switcher = document.querySelector("header .language-switcher-anchor");
      if (switcher) {
        const callout = document.createElement("div");
        callout.className = "__custom_callout__";
        callout.innerHTML = `
          <div style="background: #09090b; color: #fafafa; border: 1.5px solid #27272a; padding: 10px 16px; border-radius: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 4px; pointer-events: none;">
            <div style="display: flex; align-items: center; gap: 6px; color: #a1a1aa; font-size: 11px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
              <span>localStorage (Tự động ghi nhớ phiên học)</span>
            </div>
            <div style="color: #f43f5e; font-weight: bold;">
              localStorage<span style="color: #e4e4e7;">.</span><span style="color: #38bdf8;">getItem</span><span style="color: #e4e4e7;">(</span><span style="color: #a3e635;">'wordstreak_locale'</span><span style="color: #e4e4e7;">)</span> <span style="color: #a1a1aa;">➔</span> <span style="color: #facc15;">"vi"</span>
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
      path: path.join(outDir, "step-05-persistence-session.png"),
      clip: { x: 160, y: 0, width: 1120, height: 480 },
    });
    console.log("✔ Saved step-05-persistence-session.png");

    console.log("🎉 All 5 screenshots successfully captured!");
  } catch (err) {
    console.error("Error during capture:", err);
  } finally {
    await browser.close();
  }
}

run();
